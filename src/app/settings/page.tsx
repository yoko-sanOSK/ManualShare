
"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, collectionGroup, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, FileText, Tag, Image as ImageIcon, Layout, Eye, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export default function SettingsPage() {
  const firestore = useFirestore();
  
  // カテゴリーの取得
  const categoriesRef = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const { data: categories } = useCollection(categoriesRef);

  // 全マニュアルの取得
  const manualsRef = useMemoFirebase(() => collectionGroup(firestore, "manuals"), [firestore]);
  const { data: manuals } = useCollection(manualsRef);

  // カテゴリー用ダイアログ状態
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string, name: string, description: string } | null>(null);

  // マニュアル用ダイアログ状態（CMSエディター風）
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<{
    id?: string;
    title: string;
    content: string;
    categoryId: string;
    categoryName?: string;
    description: string;
    imageUrl?: string;
    status?: 'draft' | 'published';
  } | null>(null);

  // カテゴリー保存
  const handleSaveCategory = () => {
    if (!editingCategory?.name) return;
    const categoryId = editingCategory.id || doc(categoriesRef).id;
    const categoryDocRef = doc(firestore, "categories", categoryId);
    setDocumentNonBlocking(categoryDocRef, {
      id: categoryId,
      name: editingCategory.name,
      description: editingCategory.description || "",
    }, { merge: true });
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  // カテゴリー削除
  const handleDeleteCategory = (id: string) => {
    if (confirm("このカテゴリーを削除してもよろしいですか？（所属するマニュアルも表示されなくなる可能性があります）")) {
      deleteDocumentNonBlocking(doc(firestore, "categories", id));
    }
  };

  // マニュアル保存
  const handleSaveManual = () => {
    if (!editingManual?.title || !editingManual?.categoryId) return;
    
    const category = categories?.find(c => c.id === editingManual.categoryId);
    const categoryName = category?.name || "未分類";
    
    const manualId = editingManual.id || doc(collection(firestore, `categories/${editingManual.categoryId}/manuals`)).id;
    const manualDocRef = doc(firestore, "categories", editingManual.categoryId, "manuals", manualId);
    
    const data = {
      id: manualId,
      title: editingManual.title,
      content: editingManual.content,
      categoryId: editingManual.categoryId,
      categoryName: categoryName,
      description: editingManual.description || "",
      imageUrl: editingManual.imageUrl || `https://picsum.photos/seed/${manualId}/600/400`,
      updatedAt: serverTimestamp(),
      lastUpdated: new Date().toISOString().split('T')[0],
      status: editingManual.status || 'published',
    };

    setDocumentNonBlocking(manualDocRef, data, { merge: true });
    setIsManualDialogOpen(false);
    setEditingManual(null);
  };

  // マニュアル削除
  const handleDeleteManual = (manual: any) => {
    if (confirm(`マニュアル「${manual.title}」を削除してもよろしいですか？`)) {
      const manualDocRef = doc(firestore, "categories", manual.categoryId, "manuals", manual.id);
      deleteDocumentNonBlocking(manualDocRef);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-bold text-foreground">コンテンツ管理</h1>
          </header>

          <main className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-headline font-bold mb-2">管理ダッシュボード</h2>
              <p className="text-muted-foreground">カテゴリーやマニュアル記事を作成・編集して、社内ナレッジを最新の状態に保ちます。</p>
            </div>

            <Tabs defaultValue="manuals" className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="manuals" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  マニュアル記事
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  カテゴリー
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manuals" className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                      <Layout className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">記事一覧</h3>
                      <p className="text-sm text-muted-foreground">{manuals?.length || 0} 件のマニュアルが登録されています</p>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => {
                      setEditingManual({ title: "", content: "", categoryId: categories?.[0]?.id || "", description: "", status: 'published' });
                      setIsManualDialogOpen(true);
                    }} 
                    disabled={!categories || categories.length === 0}
                    className="shadow-md"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    新しい記事を作成
                  </Button>
                </div>

                {!categories || categories.length === 0 ? (
                  <Card className="bg-muted/30 border-dashed border-2 py-12">
                    <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4">記事を作成する前に、少なくとも1つのカテゴリーを作成してください。</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {manuals?.map((manual) => (
                      <Card key={manual.id} className="group hover:border-primary/50 transition-all shadow-sm">
                        <CardContent className="p-0">
                          <div className="flex items-center p-4">
                            <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative mr-4">
                              <img 
                                src={manual.imageUrl || "https://picsum.photos/seed/default/100/100"} 
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold truncate text-lg">{manual.title}</h4>
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                                  {manual.categoryName}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">{manual.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                <span>最終更新: {manual.lastUpdated}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="ghost" size="icon" onClick={() => {
                                setEditingManual(manual as any);
                                setIsManualDialogOpen(true);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteManual(manual)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!manuals || manuals.length === 0) && (
                      <div className="text-center py-20 text-muted-foreground bg-card rounded-xl border border-dashed">
                        記事がまだありません。右上のボタンから作成しましょう。
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="categories" className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-headline font-bold">カテゴリー管理</h3>
                  <Button variant="outline" onClick={() => {
                    setEditingCategory({ name: "", description: "" });
                    setIsCategoryDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    カテゴリーを追加
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories?.map((cat) => (
                    <Card key={cat.id} className="group hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-primary" />
                            {cat.name}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                              setEditingCategory(cat);
                              setIsCategoryDialogOpen(true);
                            }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{cat.description || "説明なし"}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory?.id ? "カテゴリーを編集" : "新規カテゴリー追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">カテゴリー名</Label>
              <Input
                id="cat-name"
                value={editingCategory?.name || ""}
                onChange={(e) => setEditingCategory(prev => ({ ...prev!, name: e.target.value }))}
                placeholder="例: 人事, IT, 営業"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-description">説明</Label>
              <Textarea
                id="cat-description"
                value={editingCategory?.description || ""}
                onChange={(e) => setEditingCategory(prev => ({ ...prev!, description: e.target.value }))}
                placeholder="このカテゴリーに含まれるマニュアルの概要"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleSaveCategory}>保存する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
            <div>
              <DialogTitle className="text-xl font-headline font-bold">
                {editingManual?.id ? "記事を編集" : "新しい記事を作成"}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIsManualDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                閉じる
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button size="sm" onClick={handleSaveManual} className="bg-primary text-white font-bold px-6 shadow-sm">
                <Save className="w-4 h-4 mr-2" />
                公開する
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/20">
            <div className="container max-w-5xl py-8 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="man-title" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      タイトル
                    </Label>
                    <Input
                      id="man-title"
                      className="text-2xl font-bold h-14 border-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/30"
                      value={editingManual?.title || ""}
                      onChange={(e) => setEditingManual(prev => ({ ...prev!, title: e.target.value }))}
                      placeholder="記事のタイトルを入力..."
                    />
                  </div>
                  
                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      本文（リッチテキスト）
                    </Label>
                    <RichTextEditor
                      content={editingManual?.content || ""}
                      onChange={(html) => setEditingManual(prev => ({ ...prev!, content: html }))}
                    />
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      設定
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="man-category" className="text-xs font-bold text-muted-foreground">カテゴリー</Label>
                      <Select 
                        value={editingManual?.categoryId} 
                        onValueChange={(val) => setEditingManual(prev => ({ ...prev!, categoryId: val }))}
                      >
                        <SelectTrigger id="man-category" className="bg-muted/50">
                          <SelectValue placeholder="カテゴリーを選択" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="man-description" className="text-xs font-bold text-muted-foreground">概要</Label>
                      <Textarea
                        id="man-description"
                        className="text-xs bg-muted/50"
                        rows={3}
                        value={editingManual?.description || ""}
                        onChange={(e) => setEditingManual(prev => ({ ...prev!, description: e.target.value }))}
                        placeholder="短い説明文"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" />
                        カバー画像
                      </Label>
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden border relative flex items-center justify-center group">
                        {editingManual?.imageUrl ? (
                          <img src={editingManual.imageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="text-muted-foreground/30 flex flex-col items-center">
                            <ImageIcon className="w-8 h-8 mb-1" />
                            <span className="text-[10px]">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <Input 
                            className="w-3/4 h-8 text-[10px] bg-white/10 text-white border-white/20"
                            placeholder="画像URLを入力"
                            value={editingManual?.imageUrl || ""}
                            onChange={(e) => setEditingManual(prev => ({ ...prev!, imageUrl: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
