import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export interface FirebaseSdks {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
}

/**
 * Firebase の初期化を安全に行う関数。
 * 環境変数が不足しているビルド時などは null を返し、エラーでビルドが止まるのを防ぎます。
 */
export function initializeFirebase(): FirebaseSdks {
  const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
  
  if (!hasConfig) {
    if (typeof window === 'undefined') {
      return {
        firebaseApp: null,
        auth: null,
        firestore: null,
        storage: null
      };
    }
    console.warn("Firebase configuration is missing. Check your environment variables.");
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
      storage: null
    };
  }

  try {
    let app: FirebaseApp;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    let auth: Auth | null = null;
    let firestore: Firestore | null = null;
    let storage: FirebaseStorage | null = null;

    try {
      auth = getAuth(app);
    } catch (e) {
      console.error("Auth init error:", e);
    }

    try {
      firestore = getFirestore(app);
    } catch (e) {
      console.error("Firestore init error:", e);
    }

    try {
      // storageBucket が設定されている場合のみ初期化を試みる
      if (firebaseConfig.storageBucket && firebaseConfig.storageBucket !== '') {
        storage = getStorage(app);
      } else {
        console.warn("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is missing. Storage feature will be disabled.");
      }
    } catch (e) {
      console.error("Storage init error:", e);
    }

    return {
      firebaseApp: app,
      auth,
      firestore,
      storage
    };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
      storage: null
    };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
