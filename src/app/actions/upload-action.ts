'use server';

import { put, del } from '@vercel/blob';

/**
 * Vercel Blob を使用してファイルをアップロードするサーバーアクション。
 */
export async function uploadFileAction(formData: FormData, path: string): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file') as File;
  
  if (!file) {
    return { error: 'ファイルが見つかりません。' };
  }

  try {
    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const fullPath = `${path}/${safeFileName}`;

    const blob = await put(fullPath, file, {
      access: 'public',
      contentType: file.type,
    });

    return { url: blob.url };
  } catch (error: any) {
    console.error('Vercel Blob upload error:', error);
    if (error.message?.includes('BLOB_READ_WRITE_TOKEN')) {
      return { error: 'Vercel Blob のトークンが設定されていません。' };
    }
    return { error: `アップロードに失敗しました: ${error.message}` };
  }
}

/**
 * Vercel Blob からファイルを削除するサーバーアクション。
 */
export async function deleteFileAction(url: string): Promise<{ success: boolean } | { error: string }> {
  if (!url) return { success: true };
  
  // Vercel Blob の URL かどうかを簡易チェック
  if (!url.includes('public.blob.vercel-storage.com')) {
    return { success: true }; // 外部URLなどの場合は何もしない
  }

  try {
    await del(url);
    return { success: true };
  } catch (error: any) {
    console.error('Vercel Blob delete error:', error);
    return { error: `ファイルの削除に失敗しました: ${error.message}` };
  }
}
