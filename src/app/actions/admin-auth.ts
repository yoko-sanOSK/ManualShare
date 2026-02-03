
'use server';

/**
 * 管理者パスワードを検証するサーバーアクション
 * 環境変数 ADMIN_PASSWORD を参照します。
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  return password === adminPassword;
}
