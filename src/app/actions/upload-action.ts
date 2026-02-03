
'use server';

import { initializeFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * サーバーサイドでファイルを Firebase Storage にアップロードするアクション。
 * CORS設定不要で動作しますが、Vercelの制限（約4.5MB）に注意が必要です。
 */
export async function uploadFileAction(formData: FormData, path: string): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'ファイルが見つかりません。' };
  }

  const { storage } = initializeFirebase();
  
  if (!storage) {
    console.error('Firebase Storage initialization failed. Check environment variables.');
    return { error: 'Firebase Storage が初期化されていません。Vercel の環境変数（NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET 等）を確認してください。' };
  }

  // バケット名が正しく設定されているか確認
  if (!storage.app.options.storageBucket) {
    console.error('Storage Bucket is not configured in Firebase options.');
    return { error: 'Storage Bucket が設定されていません。Firebase コンソールの設定を確認してください。' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    // Node.js の Buffer ではなく、ブラウザ互換の Uint8Array として扱う
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    console.log(`Uploading to bucket: ${storage.app.options.storageBucket}`);
    console.log(`Target path: ${path}/${fileName}`);
    
    // メタデータを明示的に指定してアップロード
    const snapshot = await uploadBytes(storageRef, uint8Array, {
      contentType: file.type || 'application/octet-stream',
    });
    
    const url = await getDownloadURL(snapshot.ref);
    console.log('Upload successful:', url);
    return { url };
  } catch (error: any) {
    console.error('Server-side upload detailed error:', error);
    
    // Firebase エラーコードに基づいたメッセージ
    if (error.code === 'storage/unauthorized') {
      return { error: 'Firebase Storage の書き込み権限がありません。セキュリティルールを確認してください。' };
    }
    
    return { 
      error: `アップロードに失敗しました (${error.code || 'unknown'}): ${error.message || '予期せぬエラーが発生しました。'}` 
    };
  }
}
