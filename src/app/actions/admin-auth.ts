'use server';

/**
 * 管理者パスワードを検証するサーバーアクション
 * 環境変数 ADMIN_PASSWORD を参照します。
 * デフォルトパスワードは 'test' に設定されています。
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'test';
  return password === adminPassword;
}
