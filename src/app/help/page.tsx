"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Settings, FilePlus, Save, Layout } from "lucide-react";

export default function HelpCenterPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-body">
        <SidebarNav />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-bold">ヘルプセンター</h1>
          </header>

          <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-4xl mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold mb-4">ManualShare ガイド</h2>
              <p className="text-muted-foreground">
                リッチテキストエディタによる高度なマニュアル管理のガイドです。
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-12">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary text-base font-bold">
                    <Layout className="w-5 h-5" />
                    マルチメディア・エディタ
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  現在は画像の埋め込みに対応しており、視覚的に分かりやすいマニュアルを作成できます。動画機能は順次導入予定です。
                </CardContent>
              </Card>
            </div>

            <Accordion type="single" collapsible className="w-full bg-card rounded-xl border p-4 shadow-sm">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-headline font-bold">マニュアル作成の基本フロー</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Settings className="w-4 h-4" /> 1. 記事管理へ移動
                    </p>
                    <p className="text-sm pl-6">サイドバーの「記事管理」メニューから、管理画面へ移動します。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <FilePlus className="w-4 h-4" /> 2. 記事作成とメディア挿入
                    </p>
                    <p className="text-sm pl-6">エディタのツールバーを使い、画像をPCからアップロードして挿入します。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Save className="w-4 h-4" /> 3. キャンセルと保存
                    </p>
                    <p className="text-sm pl-6">「キャンセル」で戻るか、「保存して公開」で全社に共有します。</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="font-headline font-bold">サムネイルと動画の注意点</AccordionTrigger>
                <AccordionContent className="pt-2 space-y-3 text-sm">
                  <div className="flex flex-col gap-2">
                    <p className="font-bold text-foreground">・サムネイル:</p>
                    <p>設定しない場合は「ManualShare」のロゴが自動で表示されます。記事を識別しやすくするために設定を推奨します。</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-bold text-foreground">・動画ファイル (導入予定):</p>
                    <p>将来的なアップデートにより、MP4形式の動画アップロードに対応予定です。現在は画像のみをサポートしています。</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
