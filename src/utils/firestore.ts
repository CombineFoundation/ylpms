import type { DocumentData } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { logger } from "@/utils/errors";

export type Filter = {
  field: string;
  operator: "==" | "<" | "<=" | ">" | ">=" | "!=" | "in" | "not-in" | "array-contains";
  value: unknown;
};

export type Page<T> = { items: T[]; page: number; pageSize: number; hasMore: boolean };

function withId<T>(id: string, data: DocumentData): T {
  return { id, ...data } as T;
}

function removeUndefined<T extends DocumentData>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as T;
}

function applyFilters(query: FirebaseFirestore.Query, filters: Filter[]) {
  return filters.reduce(
    (current, filter) => current.where(filter.field, filter.operator, filter.value),
    query
  );
}

export async function getDocById<T extends DocumentData>(collectionName: string, docId: string): Promise<T | null> {
  const snapshot = await getFirebaseAdminDb().collection(collectionName).doc(docId).get();
  return snapshot.exists ? withId<T>(snapshot.id, snapshot.data() || {}) : null;
}

export async function getDocsByIds<T extends DocumentData>(collectionName: string, docIds: string[]): Promise<T[]> {
  const documents = await Promise.all(docIds.map((docId) => getDocById<T>(collectionName, docId)));
  return documents.filter(Boolean) as T[];
}

export async function queryDocs<T extends DocumentData>(
  collectionName: string,
  filters: Filter[] = [],
  orderByField?: { field: string; direction: "asc" | "desc" },
  pagination?: { pageSize: number; pageNumber: number }
): Promise<T[]> {
  try {
    let query = applyFilters(getFirebaseAdminDb().collection(collectionName), filters);
    if (orderByField) query = query.orderBy(orderByField.field, orderByField.direction);
    if (pagination) {
      const pageNumber = Math.max(1, pagination.pageNumber || 1);
      query = query.offset((pageNumber - 1) * pagination.pageSize).limit(pagination.pageSize);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((document) => withId<T>(document.id, document.data()));
  } catch (error) {
    logger.error(`Error querying ${collectionName}`, error);
    throw error;
  }
}

/**
 * Like queryDocs, but returns one page plus whether another page exists
 * (fetches one extra row to find out, so no separate count query is needed).
 */
export async function queryPage<T extends DocumentData>(
  collectionName: string,
  filters: Filter[],
  orderByField: { field: string; direction: "asc" | "desc" } | undefined,
  pagination: { pageSize: number; pageNumber: number }
): Promise<Page<T>> {
  const page = Math.max(1, pagination.pageNumber || 1);

  try {
    let query = applyFilters(getFirebaseAdminDb().collection(collectionName), filters);
    if (orderByField) query = query.orderBy(orderByField.field, orderByField.direction);
    query = query.offset((page - 1) * pagination.pageSize).limit(pagination.pageSize + 1);
    const snapshot = await query.get();
    const docs = snapshot.docs.map((document) => withId<T>(document.id, document.data()));
    return {
      items: docs.slice(0, pagination.pageSize),
      page,
      pageSize: pagination.pageSize,
      hasMore: docs.length > pagination.pageSize,
    };
  } catch (error) {
    logger.error(`Error querying page of ${collectionName}`, error);
    throw error;
  }
}

/**
 * Fetches only the named fields of matching docs (a Firestore projection), for
 * aggregations like "count by region" that don't need whole documents.
 */
export async function selectFields<T extends DocumentData>(
  collectionName: string,
  filters: Filter[],
  fields: string[]
): Promise<T[]> {
  const query = applyFilters(getFirebaseAdminDb().collection(collectionName), filters).select(...fields);
  const snapshot = await query.get();
  return snapshot.docs.map((document) => document.data() as T);
}

/** Same as selectFields, but keeps each doc's id alongside the projected fields. */
export async function selectFieldsWithIds<T extends DocumentData>(
  collectionName: string,
  filters: Filter[],
  fields: string[]
): Promise<(T & { id: string })[]> {
  const query = applyFilters(getFirebaseAdminDb().collection(collectionName), filters).select(...fields);
  const snapshot = await query.get();
  return snapshot.docs.map((document) => withId<T & { id: string }>(document.id, document.data()));
}

export async function getAllDocs<T extends DocumentData>(collectionName: string): Promise<T[]> {
  const snapshot = await getFirebaseAdminDb().collection(collectionName).get();
  return snapshot.docs.map((document) => withId<T>(document.id, document.data()));
}

export async function createDoc<T extends DocumentData>(collectionName: string, docId: string, data: T): Promise<T> {
  const now = FieldValue.serverTimestamp();
  const docData = {
    ...removeUndefined(data),
    createdAt: now,
    updatedAt: now,
  };
  await getFirebaseAdminDb().collection(collectionName).doc(docId).set(docData);
  return { id: docId, ...docData } as T;
}

/**
 * Partial update. `undefined` fields are skipped (Firestore rejects them), and
 * `null` removes the field — e.g. clearing an optional limit.
 */
export async function updateDoc<T extends DocumentData>(collectionName: string, docId: string, data: Partial<T>): Promise<void> {
  const changes = Object.fromEntries(
    Object.entries(removeUndefined(data as DocumentData)).map(([key, value]) => [
      key,
      value === null ? FieldValue.delete() : value,
    ])
  );
  await getFirebaseAdminDb().collection(collectionName).doc(docId).update({
    ...changes,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteDocFromFirestore(collectionName: string, docId: string): Promise<void> {
  await getFirebaseAdminDb().collection(collectionName).doc(docId).delete();
}

export async function batchWrite(operations: Array<{ type: "set" | "update" | "delete"; collection: string; docId: string; data?: DocumentData }>): Promise<void> {
  const db = getFirebaseAdminDb();
  const BATCH_LIMIT = 500; // Firestore's max writes per batch
  for (let start = 0; start < operations.length; start += BATCH_LIMIT) {
    const batch = db.batch();
    operations.slice(start, start + BATCH_LIMIT).forEach(({ type, collection, docId, data }) => {
      const reference = db.collection(collection).doc(docId);
      if (type === "set") batch.set(reference, { ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
      if (type === "update") batch.update(reference, { ...data, updatedAt: FieldValue.serverTimestamp() });
      if (type === "delete") batch.delete(reference);
    });
    await batch.commit();
  }
}

export async function docExists(collectionName: string, docId: string): Promise<boolean> {
  const snapshot = await getFirebaseAdminDb().collection(collectionName).doc(docId).get();
  return snapshot.exists;
}

export async function getDocCount(collectionName: string, filters: Filter[] = []): Promise<number> {
  const query = applyFilters(getFirebaseAdminDb().collection(collectionName), filters);
  const snapshot = await query.count().get();
  return snapshot.data().count;
}
