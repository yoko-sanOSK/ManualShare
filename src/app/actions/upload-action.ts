
'use server';

import { initializeFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * サーバーサイドでファイルを Firebase Storage にアップロードするアクション。
 * ブラウザの CORS 制限を回避するためにサーバー経由で通信します。
 */
export async function uploadFileAction(formData: FormData, path: string): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'ファイルが見つかりません。' };
  }

  const { storage } = initializeFirebase();
  if (!storage) {
    return { error: 'Firebase Storage が初期化されていません。環境変数を確認してください。' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    
    // サーバーサイド（Node.js環境）でのアップロード
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });
    
    const url = await getDownloadURL(snapshot.ref);
    return { url };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { error: error.message || 'アップロードに失敗しました。' };
  }
}
