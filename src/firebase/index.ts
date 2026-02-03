
'use client';

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

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): FirebaseSdks {
  const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
  
  // ビルド時（サーバーサイド）で設定がない場合は、初期化をスキップしてnullを返す
  if (typeof window === 'undefined' && !hasConfig) {
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
      try {
        // Firebase App Hosting環境での自動初期化を試行
        app = initializeApp();
      } catch (e) {
        if (!hasConfig) {
          throw new Error("Firebase config is missing.");
        }
        app = initializeApp(firebaseConfig);
      }
    } else {
      app = getApp();
    }

    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
      storage: getStorage(app)
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
