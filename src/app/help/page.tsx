
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Settings, FilePlus, Layers, Edit3, Save, Layout, Sparkles, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HelpCenterPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-bold">ヘルプセンター</h1>
          </header>

          <main className="p-6 md:p-8 lg:p-10 max-w-4xl mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold mb-4">ManualMaster 管理ガイド</h2>
              <p className="text-muted-foreground">
                リッチテキストエディタを活用した高度なマニュアル作成と管理のガイドです。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Type className="w-5 h-5" />
                    リッチテキスト編集
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  見出し、太字、リスト、引用など、視覚的に分かりやすいマニュアルをマウス操作だけで作成できます。
                </CardContent>
              </Card>
              <Card className="bg-secondary/5 border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary">
                    <Sparkles className="w-5 h-5" />
                    AI要約機能
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  リッチテキストで構成された長い記事も、AIがその構造を理解し、重要なポイントを的確に日本語で要約します。
                </CardContent>
              </Card>
            </div>

            <Accordion type="single" collapsible className="w-full bg-card rounded-xl border p-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-headline font-bold">マニュアル記事の作成フロー</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Settings className="w-4 h-4" /> 1. 設定から「マニュアル記事」を選択
                    </p>
                    <p className="text-sm pl-6">サイドバーの「設定」メニューから、コンテンツ管理画面へ移動します。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <FilePlus className="w-4 h-4" /> 2. 新規記事作成を開始
                    </p>
                    <p className="text-sm pl-6">「新しい記事を作成」ボタンをクリックすると、CMSスタイルのエディタが開きます。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> 3. リッチテキストで執筆
                    </p>
                    <p className="text-sm pl-6">ツールバーを使用して、見出しや箇条書きを設定します。右側のパネルでカテゴリーとアイキャッチ画像（URL）を設定してください。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Save className="w-4 h-4" /> 4. 保存と公開
                    </p>
                    <p className="text-sm pl-6">右上の「公開する」ボタンを押すと、Firestoreに保存され、ダッシュボードに即座に掲載されます。</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="font-headline font-bold">カテゴリーの階層管理</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <p className="mb-4 text-sm">「カテゴリー」タブでは、全社の知識を整理するための分類ラベルを作成・管理できます。</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <Badge variant="outline" className="mt-0.5">追加</Badge>
                      <span>新しい部署やプロジェクトに合わせたカテゴリーを作成します。</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Badge variant="destructive" className="mt-0.5 bg-destructive/10 text-destructive border-none">削除</Badge>
                      <span>不要なカテゴリーは削除できます。※所属する記事の分類が解除されるためご注意ください。</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="font-headline font-bold">エディタのショートカットと機能</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="bg-muted p-3 rounded-lg text-xs font-mono space-y-1">
                    <p>• <b>Bold</b>: 太字 (Ctrl+B)</p>
                    <p>• <i>Italic</i>: 斜体 (Ctrl+I)</p>
                    <p>• H1/H2: 見出しの切り替え</p>
                    <p>• List: 箇条書きと番号付きリスト</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
