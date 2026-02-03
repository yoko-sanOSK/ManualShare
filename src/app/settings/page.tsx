
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
import { Plus, Trash2, Edit, FileText, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

  // マニュアル用ダイアログ状態
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<{
    id?: string;
    title: string;
    content: string;
    categoryId: string;
    categoryName?: string;
    description: string;
    imageUrl?: string;
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
      lastUpdated: new Date().toISOString().split('T')[0], // 簡易表示用
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
            <h1 className="text-xl font-headline font-bold">システム設定</h1>
          </header>

          <main className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
            <Tabs defaultValue="categories" className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="categories">カテゴリー管理</TabsTrigger>
                <TabsTrigger value="manuals">マニュアル管理</TabsTrigger>
              </TabsList>

              {/* カテゴリー管理タブ */}
              <TabsContent value="categories" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-headline font-bold">カテゴリー</h2>
                    <p className="text-muted-foreground text-sm">マニュアルの分類を管理します。</p>
                  </div>
                  <Button onClick={() => {
                    setEditingCategory({ name: "", description: "" });
                    setIsCategoryDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    新規追加
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
                        <CardDescription>{cat.description || "説明なし"}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* マニュアル管理タブ */}
              <TabsContent value="manuals" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-headline font-bold">マニュアル記事</h2>
                    <p className="text-muted-foreground text-sm">各カテゴリーに属するマニュアルを管理します。</p>
                  </div>
                  <Button onClick={() => {
                    setEditingManual({ title: "", content: "", categoryId: categories?.[0]?.id || "", description: "" });
                    setIsManualDialogOpen(true);
                  }} disabled={!categories || categories.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    新規マニュアル作成
                  </Button>
                </div>

                {!categories || categories.length === 0 ? (
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="py-10 text-center">
                      <p className="text-muted-foreground">マニュアルを作成する前に、少なくとも1つのカテゴリーを作成してください。</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {manuals?.map((manual) => (
                      <Card key={manual.id} className="group hover:shadow-sm transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold">{manual.title}</h3>
                                <Badge variant="secondary" className="text-[10px] h-5">{manual.categoryName}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{manual.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setEditingManual(manual as any);
                              setIsManualDialogOpen(true);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              編集
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteManual(manual)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              削除
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {(!manuals || manuals.length === 0) && (
                      <div className="text-center py-20 text-muted-foreground">
                        マニュアルがまだありません。
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>

      {/* カテゴリー用ダイアログ */}
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

      {/* マニュアル用ダイアログ */}
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingManual?.id ? "マニュアルを編集" : "新規マニュアル作成"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="man-category">カテゴリー</Label>
                <Select 
                  value={editingManual?.categoryId} 
                  onValueChange={(val) => setEditingManual(prev => ({ ...prev!, categoryId: val }))}
                >
                  <SelectTrigger id="man-category">
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
                <Label htmlFor="man-title">タイトル</Label>
                <Input
                  id="man-title"
                  value={editingManual?.title || ""}
                  onChange={(e) => setEditingManual(prev => ({ ...prev!, title: e.target.value }))}
                  placeholder="マニュアルのタイトル"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="man-description">概要（短い説明）</Label>
              <Input
                id="man-description"
                value={editingManual?.description || ""}
                onChange={(e) => setEditingManual(prev => ({ ...prev!, description: e.target.value }))}
                placeholder="カードに表示される短い説明文"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="man-content">本文（Markdown対応）</Label>
              <Textarea
                id="man-content"
                className="min-h-[200px] font-mono text-sm"
                value={editingManual?.content || ""}
                onChange={(e) => setEditingManual(prev => ({ ...prev!, content: e.target.value }))}
                placeholder="# 章のタイトル\n\nここにマニュアルの内容を記述します。"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="man-image">カバー画像URL（省略可）</Label>
              <Input
                id="man-image"
                value={editingManual?.imageUrl || ""}
                onChange={(e) => setEditingManual(prev => ({ ...prev!, imageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>キャンセル</Button>
            <Button onClick={handleSaveManual}>保存する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
