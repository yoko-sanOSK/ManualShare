'use server';

/**
 * 記事管理（管理者）用のパスワードを検証
 * 環境変数 ADMIN_PASSWORD を参照します（デフォルト: 'admin'）
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  return password === adminPassword;
}

/**
 * サイト全体のアクセス（一般閲覧）用のパスワードを検証
 * 環境変数 ACCESS_PASSWORD を参照します（デフォルト: 'test'）
 */
export async function verifyAccessPassword(password: string): Promise<boolean> {
  const accessPassword = process.env.ACCESS_PASSWORD || 'test';
  return password === accessPassword;
}
