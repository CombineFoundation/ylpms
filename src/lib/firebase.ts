import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initFirebaseApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized in the browser.");
  }

  if (!firebaseConfig.apiKey) {
    throw new Error(
      "Missing Firebase client config. Set NEXT_PUBLIC_FIREBASE_API_KEY and related env vars."
    );
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth() {
  return getAuth(initFirebaseApp());
}

export function getFirestoreDb() {
  return getFirestore(initFirebaseApp());
}

export function getFirebaseStorage() {
  return getStorage(initFirebaseApp());
}
