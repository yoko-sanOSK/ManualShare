
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * アプリケーション共通のフッターコンポーネント
 * 著作権表示と簡易ナビゲーションを提供します。
 */
export function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // ハイドレーションエラー防止のため、クライアントサイドで年を取得
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full border-t py-8 mt-auto bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {year || "2024"} yoko-san. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            ManualMaster - インテリジェントなビジネスマニュアルプラットフォーム
          </p>
        </div>
        
        <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            ダッシュボード
          </Link>
          <Link href="/help" className="hover:text-primary transition-colors">
            ヘルプセンター
          </Link>
          <Link href="/settings" className="hover:text-primary transition-colors">
            記事管理
          </Link>
        </nav>
      </div>
    </footer>
  );
}
