
"use client";

import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const firestore = useFirestore();
  const categoriesRef = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const { data: categories, isLoading: categoriesLoading } = useCollection(categoriesRef);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string, name: string, description: string } | null>(null);

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

  const handleDeleteCategory = (id: string) => {
    if (confirm("このカテゴリーを削除してもよろしいですか？")) {
      deleteDocumentNonBlocking(doc(firestore, "categories", id));
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
                          {cat.name}
                          <div className="flex gap-1">
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

              <TabsContent value="manuals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>マニュアル（記事）の管理</CardTitle>
                    <CardDescription>
                      各カテゴリーに属するマニュアルを編集・削除できます。
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      マニュアルの追加・編集は各マニュアル詳細ページ、または近日公開の統合エディタから行えます。
                    </p>
                  </CardContent>
                </Card>
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
              <Label htmlFor="name">カテゴリー名</Label>
              <Input
                id="name"
                value={editingCategory?.name || ""}
                onChange={(e) => setEditingCategory(prev => ({ ...prev!, name: e.target.value }))}
                placeholder="例: 人事, IT"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
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
    </SidebarProvider>
  );
}
