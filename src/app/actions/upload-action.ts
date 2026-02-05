
'use server';

import { put } from '@vercel/blob';

/**
 * Vercel Blob を使用してファイルをアップロードするサーバーアクション。
 * Firebase Storage の CORS 設定なしで動作します。
 * Vercel のダッシュボードで Blob を有効にする必要があります。
 */
export async function uploadFileAction(formData: FormData, path: string): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file') as File;
  
  if (!file) {
    return { error: 'ファイルが見つかりません。' };
  }

  try {
    // 特殊文字を置換して安全なパスを作成
    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const fullPath = `${path}/${safeFileName}`;

    // Vercel Blob へアップロード
    // 注意: BLOB_READ_WRITE_TOKEN 環境変数が Vercel 側に必要です。
    const blob = await put(fullPath, file, {
      access: 'public',
      contentType: file.type,
    });

    return { url: blob.url };
  } catch (error: any) {
    console.error('Vercel Blob upload error:', error);
    
    if (error.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      return { error: 'Vercel Blob のトークンが設定されていません。Vercel ダッシュボードで Blob を有効にしてください。' };
    }
    
    return { 
      error: `アップロードに失敗しました: ${error.message || '不明なエラーが発生しました。'}` 
    };
  }
}
