'use client';

import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

/**
 * ManualShare の公式ブランドロゴコンポーネント
 * サイズに応じて角丸の半径を調整し、常に正方形の印象を維持します。
 */
export function BrandLogo({ 
  showText = true, 
  className, 
  size = 'md',
  hoverable = true 
}: BrandLogoProps) {
  const containerSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7'
  };
  
  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  // サイズに応じて角丸の強度を調整
  const roundedSizes = {
    sm: 'rounded-md', // 小さいサイズでは角丸を控えめに
    md: 'rounded-lg',
    lg: 'rounded-xl'
  };

  return (
    <div className={cn(
      "flex items-center gap-2.5", 
      hoverable && "group",
      className
    )}>
      <div className={cn(
        "bg-primary flex items-center justify-center shadow-sm",
        roundedSizes[size],
        hoverable && "group-hover:scale-110 transition-transform",
        containerSizes[size]
      )}>
        <Share2 className={cn("text-white", iconSizes[size])} />
      </div>
      {showText && (
        <span className={cn("font-headline font-bold tracking-tight text-foreground", textSizes[size])}>
          Manual<span className="text-primary">Share</span>
        </span>
      )}
    </div>
  );
}
