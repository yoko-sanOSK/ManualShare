'use client';

import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ManualShare の公式ブランドロゴコンポーネント
 * サイドバーのロゴマークに基づいたデザインを提供します。
 */
export function BrandLogo({ showText = true, className, size = 'md' }: BrandLogoProps) {
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

  return (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <div className={cn(
        "bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm",
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
