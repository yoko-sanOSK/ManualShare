
'use server';

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// ハッシュを保存するファイルのパス（プロジェクトルートの直下）
const HASH_PATH = path.join(process.cwd(), '.admin_hash');

/**
 * 現在のハッシュを取得する内部関数
 */
function getStoredHash(): string | null {
  if (fs.existsSync(HASH_PATH)) {
    return fs.readFileSync(HASH_PATH, 'utf8');
  }
  return null;
}

/**
 * 管理者パスワードを検証するサーバーアクション
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const storedHash = getStoredHash();
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (!storedHash) {
    // ハッシュファイルが存在しない場合、初回はenvのパスワードと比較
    const isCorrect = password === defaultPassword;
    if (isCorrect) {
      // 正解した場合、今後のためにハッシュ化して保存しておく
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      fs.writeFileSync(HASH_PATH, hash);
    }
    return isCorrect;
  }

  // ハッシュが存在する場合はbcryptで比較
  return bcrypt.compareSync(password, storedHash);
}

/**
 * パスワードを更新するサーバーアクション
 */
export async function updateAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  // 1. 現在のパスワードが正しいか確認
  const isCorrect = await verifyAdminPassword(currentPassword);
  if (!isCorrect) {
    return { success: false, message: '現在のパスワードが正しくありません。' };
  }

  try {
    // 2. 新しいパスワードをハッシュ化して保存
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    fs.writeFileSync(HASH_PATH, hash);
    
    return { success: true, message: 'パスワードを正常に更新しました。' };
  } catch (error) {
    console.error('Password update failed:', error);
    return { success: false, message: 'パスワードの保存に失敗しました。' };
  }
}
