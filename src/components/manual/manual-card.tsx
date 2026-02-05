"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight } from "lucide-react";

interface ManualCardProps {
  manual: {
    id: string;
    title: string;
    categoryName: string;
    description: string;
    lastUpdated: string;
    imageUrl?: string;
  };
}

export function ManualCard({ manual }: ManualCardProps) {
  // デフォルト画像URL (ManualShareロゴ入り)
  const defaultImageUrl = "https://placehold.co/600x400/6fa8dc/ffffff?text=ManualShare";

  return (
    <Link href={`/manuals/${manual.id}`} className="block group transition-transform hover:scale-[1.02]">
      <Card className="h-full overflow-hidden border-none shadow-md bg-card">
        <div className="relative h-48 w-full">
          <Image
            src={manual.imageUrl || defaultImageUrl}
            alt={manual.title}
            fill
            className="object-cover transition-opacity group-hover:opacity-90"
            data-ai-hint="business manual"
            unoptimized
          />
          <div className="absolute top-4 left-4">
            <Badge className="bg-primary hover:bg-primary/90 text-white font-medium">
              {manual.categoryName}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">
            {manual.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {manual.description}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-0 border-t border-muted/50 mt-auto pt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>更新日: {manual.lastUpdated}</span>
          </div>
          <div className="text-primary flex items-center gap-1 text-sm font-medium">
            詳細を見る
            <ChevronRight className="w-4 h-4" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
