
"use client";

import { use, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, where } from "firebase/firestore";
import { AISummaryCard } from "@/components/manual/ai-summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Share2, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default function ManualDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();

  // collectionGroup を使用して ID で検索するクエリを安定化
  const manualQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return query(collectionGroup(firestore, "manuals"), where("id", "==", id));
  }, [firestore, id]);

  const { data: manuals, isLoading } = useCollection(manualQuery);
  const manual = manuals?.[0] || null;

  // デフォルト画像URL
  const defaultImageUrl = "https://placehold.co/800x400/6fa8dc/ffffff?text=ManualMaster";

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

  if (!manual && !isLoading) {
    notFound();
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
            <SidebarTrigger />
            <div className="flex items-center gap-4 ml-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ダッシュボードへ戻る
                </Button>
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Printer className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <main className="p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
            <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden mb-8 shadow-lg">
              <Image
                src={manual.imageUrl || defaultImageUrl}
                alt={manual.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <Badge className="bg-primary text-white mb-2">{manual.categoryName}</Badge>
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-white leading-tight">
                  {manual.title}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b pb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>更新日: {manual.lastUpdated || "不明"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>作成者: 管理チーム</span>
                  </div>
                </div>

                <div className="prose prose-blue max-w-none dark:prose-invert">
                  <div 
                    className="text-foreground"
                    dangerouslySetInnerHTML={{ __html: manual.content || "" }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="sticky top-24">
                  <AISummaryCard manualText={manual.content || ""} />
                  
                  <div className="mt-8 p-6 bg-card rounded-xl shadow-sm border">
                    <h3 className="font-headline font-bold text-lg mb-4">マニュアル詳細</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">カテゴリー</span>
                        <span className="font-medium">{manual.categoryName}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">公開範囲</span>
                        <span className="font-medium text-secondary">全社公開</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
