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
    console.error('Firebase Storage initialization failed. Bucket might be missing in environment variables.');
    return { error: 'Firebase Storage が初期化されていません。Vercel の環境変数（NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET）を確認するか、Firebase コンソールで Storage を有効にしてください。' };
  }

  const bucketName = storage.app.options.storageBucket;
  if (!bucketName) {
    return { error: 'Storage Bucket が設定されていません。Firebase コンソールのプロジェクト設定を確認してください。' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // 特殊文字を置換して安全なパスを作成
    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `${path}/${safeFileName}`);
    
    console.log(`Uploading to bucket: ${bucketName}`);
    
    const snapshot = await uploadBytes(storageRef, uint8Array, {
      contentType: file.type || 'application/octet-stream',
    });
    
    const url = await getDownloadURL(snapshot.ref);
    return { url };
  } catch (error: any) {
    console.error('Upload action detailed error:', error);
    
    if (error.code === 'storage/unauthorized') {
      return { error: 'Firebase Storage の書き込み権限がありません。セキュリティルールを公開（allow write: if true）にして試してください。' };
    }
    
    if (error.code === 'storage/project-not-found') {
      return { error: 'Firebase プロジェクトが見つかりません。プロジェクトIDの設定を確認してください。' };
    }

    if (error.code === 'storage/bucket-not-found') {
      return { error: '指定された Storage バケットが見つかりません。Firebase コンソールでバケットが作成されているか確認してください。' };
    }
    
    return { 
      error: `アップロードに失敗しました: ${error.message || '不明なエラーが発生しました。'} (Code: ${error.code || 'unknown'})` 
    };
  }
}
