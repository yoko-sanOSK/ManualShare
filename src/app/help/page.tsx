
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Settings, FilePlus, Layers, Edit3, Save, Layout, Sparkles, Type, Upload, Image as ImageIcon } from "lucide-react";
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
                リッチテキストエディタと画像アップロード機能を活用したマニュアル管理のガイドです。
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
                  見出し、太字、リストなど、視覚的に分かりやすいマニュアルをツールバー操作だけで作成できます。
                </CardContent>
              </Card>
              <Card className="bg-secondary/5 border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary">
                    <ImageIcon className="w-5 h-5" />
                    画像アップロード
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  PCに保存されている画像をサムネイルとして直接アップロード。ダッシュボードで記事を際立たせます。
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
                      <Edit3 className="w-4 h-4" /> 3. コンテンツの編集と画像設定
                    </p>
                    <p className="text-sm pl-6">左側で本文を、右側のパネルでカテゴリーと「カバー画像」を設定します。画像はエリアをクリックしてPCから選択してください。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Save className="w-4 h-4" /> 4. 保存と公開
                    </p>
                    <p className="text-sm pl-6">右上の「保存して公開」ボタンを押すと、即座にダッシュボードに反映されます。</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="font-headline font-bold">カバー画像（サムネイル）の扱い</AccordionTrigger>
                <AccordionContent className="pt-2 space-y-3">
                  <p className="text-sm">カバー画像は記事の「顔」となる重要な要素です。</p>
                  <ul className="space-y-2 text-sm pl-4 list-disc">
                    <li><b>推奨サイズ:</b> 2MB以下の画像ファイルを推奨します。</li>
                    <li><b>形式:</b> JPG, PNG, WEBPなど一般的な画像形式に対応しています。</li>
                    <li><b>表示場所:</b> ダッシュボードのカード上部、および記事詳細のヘッダーに使用されます。</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="font-headline font-bold">エディタの機能とショートカット</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="bg-muted p-3 rounded-lg text-xs font-mono space-y-1">
                    <p>• <b>太字</b>: ボタンまたは Ctrl+B</p>
                    <p>• <b>見出し</b>: 文章を構造化するために H1/H2 を使用します</p>
                    <p>• <b>リスト</b>: 手順書には箇条書きや番号付きリストが有効です</p>
                    <p>• <b>ツールチップ</b>: ボタンにカーソルを合わせると機能名が表示されます</p>
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
