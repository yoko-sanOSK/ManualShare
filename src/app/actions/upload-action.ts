
'use server';

import { initializeFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * サーバーサイドでファイルを Firebase Storage にアップロードするアクション。
 * ブラウザの CORS 制限を完全に回避するために、Node.js サーバー経由で通信します。
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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    
    // Node.js 環境（サーバーサイド）でアップロードを実行
    // これによりブラウザの CORS ポリシーの影響を受けなくなります
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });
    
    const url = await getDownloadURL(snapshot.ref);
    return { url };
  } catch (error: any) {
    console.error('Server-side upload error:', error);
    return { error: error.message || 'アップロードに失敗しました。' };
  }
}
