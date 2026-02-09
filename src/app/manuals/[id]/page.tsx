
"use client";

import { use, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Footer } from "@/components/layout/footer";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Calendar, Loader2, AlertCircle, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default function ManualDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();

  const allManualsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, "manuals");
  }, [firestore]);

  const { data: manuals, isLoading, error } = useCollection(allManualsQuery);
  
  const manual = useMemo(() => {
    if (!manuals || !id) return null;
    return manuals.find(m => m.id === id) || null;
  }, [manuals, id]);

  const defaultImageUrl = "https://placehold.co/800x400/6fa8dc/ffffff?text=ManualShare";

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">マニュアルを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="text-destructive w-6 h-6" />
            </div>
            <CardTitle>エラーが発生しました</CardTitle>
            <CardDescription>データの取得中に問題が発生しました。インターネット接続を確認して再読み込みしてください。</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.reload()}>再読み込み</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // マニュアルが存在しない、または下書き状態の場合は404を表示（管理者以外）
  const isDraft = manual?.status === 'draft';
  if ((!manual && !isLoading && manuals) || (isDraft && manual)) {
    // 下書きの記事は詳細ページも閲覧不可にする（簡易的な実装。本来は管理者権限チェックが必要）
    notFound();
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 sm:px-6 shadow-sm">
            <SidebarTrigger />
            <div className="flex items-center gap-4 ml-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-foreground font-semibold hover:text-primary transition-colors h-9 px-2 sm:px-3">
                  <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">戻る</span>
                </Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 max-w-5xl mx-auto w-full">
            <div className="relative h-48 sm:h-64 md:h-96 w-full rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-lg">
              <Image
                src={manual?.imageUrl || defaultImageUrl}
                alt={manual?.title || "Manual"}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8">
                <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                  <Badge className="bg-primary text-white text-[10px] sm:text-sm py-0.5 sm:py-1 px-2 sm:px-3 shadow-sm">{manual?.categoryName}</Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-headline font-bold text-white leading-tight drop-shadow-md">
                  {manual?.title}
                </h1>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] sm:text-sm text-muted-foreground border-b pb-4 sm:pb-6">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>最終更新: {manual?.lastUpdated || "不明"}</span>
                </div>
              </div>

              <div className="prose prose-sm sm:prose-base prose-blue max-w-none dark:prose-invert">
                <div 
                  className="text-foreground text-base sm:text-lg leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: manual?.content || "" }}
                />
              </div>
            </div>
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
