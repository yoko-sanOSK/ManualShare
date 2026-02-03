
"use client";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Book, Settings, FilePlus, Layers, Trash2, Edit3 } from "lucide-react";

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
              <h2 className="text-3xl font-headline font-bold mb-4">ManualMasterの使い方</h2>
              <p className="text-muted-foreground">
                プラットフォームの管理方法と活用方法についてのガイドです。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="text-primary w-5 h-5" />
                    カテゴリーの管理
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  設定画面からカテゴリーの追加・編集・削除が行えます。各マニュアルは必ず一つのカテゴリーに属します。
                </CardContent>
              </Card>
              <Card className="bg-secondary/5 border-secondary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="text-secondary w-5 h-5" />
                    記事の管理
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  マニュアルの内容はMarkdown形式で編集可能です。AIによる自動要約機能も利用できます。
                </CardContent>
              </Card>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-headline">カテゴリーを新しく追加するには？</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>サイドバーの「設定」をクリックします。</li>
                    <li>「カテゴリー管理」タブを選択します。</li>
                    <li>「新規追加」ボタンをクリックします。</li>
                    <li>名前と説明を入力し、「保存する」をクリックして完了です。</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-headline">既存のカテゴリーを編集・削除するには？</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">設定画面の各カテゴリーカードの右上に操作アイコンがあります。</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><Edit3 className="inline w-4 h-4 mr-1" /> <strong>編集:</strong> 名前や説明を更新できます。</li>
                    <li><Trash2 className="inline w-4 h-4 mr-1" /> <strong>削除:</strong> カテゴリーを削除します。※削除すると所属するマニュアルの表示に影響が出る場合があります。</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="font-headline">マニュアル（記事）を追加・更新するには？</AccordionTrigger>
                <AccordionContent>
                  <p>現在は管理チームによる一括登録を推奨しています。個別追加機能は「マニュアル管理」タブにて準備中です。</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="font-headline">AI要約機能について</AccordionTrigger>
                <AccordionContent>
                  <p>各マニュアルの右側にある「AI インテリジェント要約」カードのボタンをクリックすると、Gemini 2.5 Flashが全文を解析し、日本語で簡潔な要約を生成します。</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
