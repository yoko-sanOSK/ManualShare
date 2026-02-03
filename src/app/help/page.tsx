
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Settings, FilePlus, Layers, Edit3, Save, Layout, Sparkles, Type, Upload, Image as ImageIcon, Film } from "lucide-react";
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
                リッチテキストエディタとメディア（画像・動画）アップロード機能を活用したマニュアル管理のガイドです。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary text-base">
                    <Type className="w-5 h-5" />
                    リッチテキスト
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  見出し、太字、リストなどで分かりやすい構造を作成できます。
                </CardContent>
              </Card>
              <Card className="bg-secondary/5 border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary text-base">
                    <ImageIcon className="w-5 h-5" />
                    画像挿入
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  PCの画像を本文に埋め込めます。自動で中央に配置されます。
                </CardContent>
              </Card>
              <Card className="bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent text-base">
                    <Film className="w-5 h-5" />
                    動画埋め込み
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  MP4ファイルを直接本文に埋め込み、再生させることができます。
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
                    <p className="text-sm pl-6">「新しい記事を作成」ボタンをクリックすると、エディタが開きます。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> 3. メディアの挿入
                    </p>
                    <p className="text-sm pl-6">エディタのツールバーにある「画像」または「動画」アイコンをクリックし、PCからファイルを選択して挿入します。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Save className="w-4 h-4" /> 4. 保存と公開
                    </p>
                    <p className="text-sm pl-6">右上の「保存して公開」ボタンを押すと、ダッシュボードに反映されます。</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="font-headline font-bold">動画の挿入に関する注意点</AccordionTrigger>
                <AccordionContent className="pt-2 space-y-3">
                  <p className="text-sm">動画ファイル（.mp4）を記事本文に直接埋め込むことができます。</p>
                  <ul className="space-y-2 text-sm pl-4 list-disc">
                    <li><b>推奨形式:</b> .mp4 ファイル</li>
                    <li><b>サイズ制限:</b> Firestoreの制限により、極端に大きな動画は保存に失敗する場合があります。</li>
                    <li><b>表示:</b> 自動的に中央揃えになり、画面幅に合わせて縮小されます。</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="font-headline font-bold">エディタの機能とショートカット</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="bg-muted p-3 rounded-lg text-xs font-mono space-y-1">
                    <p>• <b>太字</b>: ボタンまたは Ctrl+B</p>
                    <p>• <b>見出し</b>: 文章を構造化するために H1/H2 を使用します</p>
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
