import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc as firebaseUpdateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  offset,
  Query,
  DocumentData,
  CollectionReference,
  getFirestore,
  Timestamp,
  writeBatch,
  WriteBatch,
} from "firebase/firestore";
import { NotFoundError, logger } from "@/utils/errors";

/**
 * Get a single document by ID
 */
export async function getDocById<T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as T;
  } catch (error) {
    logger.error(`Error fetching document from ${collectionName}`, error);
    throw error;
  }
}

/**
 * Get multiple documents by IDs
 */
export async function getDocsByIds<T extends DocumentData>(
  collectionName: string,
  docIds: string[]
): Promise<T[]> {
  try {
    const db = getFirestore();
    const docs: T[] = [];

    for (const docId of docIds) {
      const docRef = doc(db, collectionName, docId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        docs.push({ id: snapshot.id, ...snapshot.data() } as T);
      }
    }

    return docs;
  } catch (error) {
    logger.error(`Error fetching documents from ${collectionName}`, error);
    throw error;
  }
}

/**
 * Query documents with filters
 */
export async function queryDocs<T extends DocumentData>(
  collectionName: string,
  filters: Array<{ field: string; operator: "==" | "<" | "<=" | ">" | ">=" | "!="; value: any }> = [],
  orderByField?: { field: string; direction: "asc" | "desc" },
  pagination?: { pageSize: number; pageNumber: number }
): Promise<T[]> {
  try {
    const db = getFirestore();
    const queryConstraints: any[] = [];

    // Add filters
    filters.forEach(({ field, operator, value }) => {
      queryConstraints.push(where(field, operator as any, value));
    });

    // Add ordering
    if (orderByField) {
      queryConstraints.push(
        orderBy(orderByField.field, orderByField.direction || "asc")
      );
    }

    // Add pagination
    if (pagination) {
      const { pageSize, pageNumber } = pagination;
      queryConstraints.push(limit(pageSize));
      if (pageNumber > 1) {
        queryConstraints.push(offset((pageNumber - 1) * pageSize));
      }
    }

    const q = query(collection(db, collectionName), ...queryConstraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as T)
    );
  } catch (error) {
    logger.error(`Error querying ${collectionName}`, error);
    throw error;
  }
}

/**
 * Get all documents from a collection
 */
export async function getAllDocs<T extends DocumentData>(
  collectionName: string
): Promise<T[]> {
  try {
    const db = getFirestore();
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    logger.error(`Error fetching all documents from ${collectionName}`, error);
    throw error;
  }
}

/**
 * Create a new document
 */
export async function createDoc<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<T> {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);

    const docData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(docRef, docData);
    logger.info(`Document created in ${collectionName}/${docId}`);

    return { id: docId, ...docData } as T;
  } catch (error) {
    logger.error(`Error creating document in ${collectionName}`, error);
    throw error;
  }
}

/**
 * Update a document
 */
export async function updateDoc<T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);

    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await firebaseUpdateDoc(docRef, updateData as any);
    logger.info(`Document updated: ${collectionName}/${docId}`);
  } catch (error) {
    logger.error(`Error updating document in ${collectionName}`, error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function deleteDocFromFirestore(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    logger.info(`Document deleted: ${collectionName}/${docId}`);
  } catch (error) {
    logger.error(`Error deleting document from ${collectionName}`, error);
    throw error;
  }
}

/**
 * Batch write operations
 */
export async function batchWrite(
  operations: Array<{
    type: "set" | "update" | "delete";
    collection: string;
    docId: string;
    data?: any;
  }>
): Promise<void> {
  try {
    const db = getFirestore();
    const batch = writeBatch(db) as WriteBatch;

    operations.forEach(({ type, collection: collName, docId, data }) => {
      const docRef = doc(db, collName, docId);

      if (type === "set") {
        batch.set(docRef, {
          ...data,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      } else if (type === "update") {
        batch.update(docRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
      } else if (type === "delete") {
        batch.delete(docRef);
      }
    });

    await batch.commit();
    logger.info(`Batch write completed with ${operations.length} operations`);
  } catch (error) {
    logger.error("Error in batch write", error);
    throw error;
  }
}

/**
 * Check if document exists
 */
export async function docExists(
  collectionName: string,
  docId: string
): Promise<boolean> {
  try {
    const db = getFirestore();
    const docRef = doc(db, collectionName, docId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists();
  } catch (error) {
    logger.error(`Error checking document existence in ${collectionName}`, error);
    return false;
  }
}

/**
 * Get document count
 */
export async function getDocCount(
  collectionName: string,
  filters?: Array<{ field: string; operator: "==" | "<" | "<=" | ">" | ">=" | "!="; value: any }>
): Promise<number> {
  try {
    const db = getFirestore();
    const queryConstraints: any[] = [];

    if (filters) {
      filters.forEach(({ field, operator, value }) => {
        queryConstraints.push(where(field, operator as any, value));
      });
    }

    const q = query(collection(db, collectionName), ...queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    logger.error(`Error getting document count from ${collectionName}`, error);
    throw error;
  }
}
