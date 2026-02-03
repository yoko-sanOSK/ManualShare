
'use server';

import { initializeFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * サーバーサイドでファイルを Firebase Storage にアップロードするアクション。
 */
export async function uploadFileAction(formData: FormData, path: string): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'ファイルが見つかりません。' };
  }

  const { storage } = initializeFirebase();
  if (!storage) {
    console.error('Firebase Storage initialization failed. Check environment variables.');
    return { error: 'Firebase Storage が初期化されていません。Vercel の環境変数（STORAGE_BUCKET等）を確認してください。' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // バケット名が正しいか、パスが正しいか確認
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, `${path}/${fileName}`);
    
    console.log(`Starting server-side upload to: ${path}/${fileName}`);
    
    // Node.js 環境でのアップロード
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });
    
    const url = await getDownloadURL(snapshot.ref);
    console.log('Upload successful:', url);
    return { url };
  } catch (error: any) {
    console.error('Server-side upload detailed error:', error);
    // エラーコードやメッセージをより具体的に返す
    const message = error.code === 'storage/unauthorized' 
      ? 'Firebase Storage の書き込み権限がありません。セキュリティルールを確認してください。'
      : (error.message || 'アップロード中に予期せぬエラーが発生しました。');
    return { error: message };
  }
}
