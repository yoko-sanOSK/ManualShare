
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Settings, FilePlus, Layers, Edit3, Save, Layout, Sparkles, Type, Upload, Image as ImageIcon, Film, Zap } from "lucide-react";
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
              <h2 className="text-3xl font-headline font-bold mb-4">ManualMaster ガイド</h2>
              <p className="text-muted-foreground">
                AIを活用した要約機能と、リッチテキストエディタによる高度なマニュアル管理のガイドです。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-secondary/5 border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-secondary text-base font-bold">
                    <Sparkles className="w-5 h-5 fill-secondary" />
                    AI インテリジェント要約
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  AIがマニュアルの内容を解析し、重要なポイントを自動で抽出します。長文を読む時間がない時でも、一瞬で要点を把握できます。
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary text-base font-bold">
                    <Layout className="w-5 h-5" />
                    マルチメディア・エディタ
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  画像や動画を直接埋め込むことができ、視覚的に分かりやすいマニュアルを作成できます。
                </CardContent>
              </Card>
            </div>

            <Accordion type="single" collapsible className="w-full bg-card rounded-xl border p-4 shadow-sm">
              <AccordionItem value="ai-feature">
                <AccordionTrigger className="font-headline font-bold text-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-secondary fill-secondary" />
                    AI要約機能について
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 text-muted-foreground">
                  <p>
                    ManualMasterのAI要約は、単なる文章の短縮ではありません。以下のステップで高度な処理を行っています。
                  </p>
                  <ul className="space-y-3 pl-4 list-disc text-sm">
                    <li><span className="font-bold text-foreground">文脈理解:</span> マニュアルを意味のある単位に分割し、それぞれの重要性をAIが判定します。</li>
                    <li><span className="font-bold text-foreground">ノイズ除去:</span> 冗長な表現や付随的な情報を省き、核心となる指示や情報にフォーカスします。</li>
                    <li><span className="font-bold text-foreground">自然な日本語出力:</span> 抽出された情報を再構成し、読みやすい日本語の概要として出力します。</li>
                  </ul>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-xs font-medium text-foreground mb-1">活用シーン:</p>
                    <p className="text-xs">・現場での作業直前に、手順の要点だけを再確認したい時</p>
                    <p className="text-xs">・膨大な資料の中から、自分に関係のある箇所を素早く見極めたい時</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-1">
                <AccordionTrigger className="font-headline font-bold">マニュアル作成の基本フロー</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <Settings className="w-4 h-4" /> 1. コンテンツ管理へ移動
                    </p>
                    <p className="text-sm pl-6">サイドバーの「設定」メニューから、管理画面へ移動します。</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-primary flex items-center gap-2">
                      <FilePlus className="w-4 h-4" /> 2. 記事作成とメディア挿入
                    </p>
                    <p className="text-sm pl-6">エディタのツールバーを使い、画像や動画をPCからアップロードして挿入します。</p>
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
                    <p>設定しない場合は「ManualMaster」のロゴが自動で表示されます。記事を識別しやすくするために設定を推奨します。</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-bold text-foreground">・動画ファイル:</p>
                    <p>MP4形式をサポートしています。ストレージに直接アップロードされるため、1MBを超えるファイルも扱えます。</p>
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
