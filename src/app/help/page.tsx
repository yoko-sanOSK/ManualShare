
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Book, Settings, FilePlus, Layers, Trash2, Edit3, Save, Layout, Sparkles } from "lucide-react";

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
                マニュアル記事の作成やカテゴリー管理など、プラットフォームを使いこなすためのガイドです。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="text-primary w-5 h-5" />
                    構造化エディター
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  microCMSのような直感的なUIで記事を編集できます。メタ情報と本文が分かれているため、整理されたコンテンツ作成が可能です。
                </CardContent>
              </Card>
              <Card className="bg-secondary/5 border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-secondary w-5 h-5" />
                    AI インテリジェント機能
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  記事を作成した後は、閲覧画面からAIによる要約が可能です。長いマニュアルも一瞬で把握できます。
                </CardContent>
              </Card>
            </div>

            <Accordion type="single" collapsible className="w-full bg-card rounded-xl border p-4">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-headline font-bold">記事を新しく作成・公開するには？</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Settings className="w-4 h-4" /> 1. コンテンツ管理へアクセス
                    </p>
                    <p className="text-sm pl-6">サイドバーの「設定」をクリックし、「マニュアル記事」タブを開きます。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Plus className="w-4 h-4" /> 2. 新規記事作成
                    </p>
                    <p className="text-sm pl-6">「新しい記事を作成」ボタンを押すと、エディターが立ち上がります。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> 3. コンテンツの入力
                    </p>
                    <p className="text-sm pl-6">タイトル、本文（Markdown形式）、右側のパネルでカテゴリーやカバー画像を設定します。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Save className="w-4 h-4" /> 4. 保存と公開
                    </p>
                    <p className="text-sm pl-6">右上の「公開する」ボタンを押すと、即座にポータルに反映されます。</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="font-headline font-bold">カテゴリーの管理方法</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <p className="mb-4">「カテゴリー」タブから、全社の知識を分類するためのタグを管理できます。</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <Badge variant="outline" className="mt-0.5">追加</Badge>
                      <span>「カテゴリーを追加」ボタンから新しい分類を作成します。</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Badge variant="outline" className="mt-0.5">編集</Badge>
                      <span>各カテゴリーカードの編集アイコンから、名前や説明を変更できます。</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Badge variant="destructive" className="mt-0.5 bg-destructive/10 text-destructive border-none">削除</Badge>
                      <span>ゴミ箱アイコンから削除できます。※所属する記事の表示に影響するため注意してください。</span>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="font-headline font-bold">画像の設定について</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <p className="text-sm leading-relaxed">
                    現在、画像のアップロード機能は準備中です。外部サービス（Unsplash、Pexels、Picsum等）の画像URLをコピーして、「カバー画像」欄に貼り付けることで記事にアイキャッチを設定できます。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="font-headline font-bold">Markdown（マークダウン）の基本</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <p className="text-sm mb-2">エディターの本文ではマークダウン記法が使えます。</p>
                  <pre className="bg-muted p-3 rounded-lg text-[10px] font-mono leading-tight">
                    # 大見出し (H1){"\n"}
                    ## 中見出し (H2){"\n"}
                    - リスト項目{"\n"}
                    1. 番号付きリスト{"\n"}
                    **太字テキスト**
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
