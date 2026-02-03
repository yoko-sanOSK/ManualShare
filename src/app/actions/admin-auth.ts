
'use server';

/**
 * 管理者パスワードを検証するサーバーアクション
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  return password === adminPassword;
}
