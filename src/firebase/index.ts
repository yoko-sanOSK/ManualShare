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
      // サーバーサイド（ビルド時）で設定がない場合は静かに null を返す
      return {
        firebaseApp: null,
        auth: null,
        firestore: null,
        storage: null
      };
    }
    // クライアントサイドで設定がない場合は警告を表示
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
