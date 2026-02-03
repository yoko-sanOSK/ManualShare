
"use client";

import { useState, useRef, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { useCollection, useFirestore, useMemoFirebase, useFirebase } from "@/firebase";
import { collection, doc, collectionGroup, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, FileText, Tag, Image as ImageIcon, Layout, Save, X, Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function SettingsPage() {
  const firestore = useFirestore();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const categoriesRef = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const { data: categories } = useCollection(categoriesRef);

  const manualsRef = useMemoFirebase(() => collectionGroup(firestore, "manuals"), [firestore]);
  const { data: manuals, isLoading: isManualsLoading } = useCollection(manualsRef);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string, name: string, description: string } | null>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `manuals/covers/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      setEditingManual(prev => ({ ...prev!, imageUrl: url }));
      
      toast({
        title: "画像をアップロードしました",
        description: "サムネイルが更新されました。",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "アップロード失敗",
        description: "画像のアップロード中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleSaveManual = () => {
    if (!editingManual?.title || !editingManual?.categoryId) {
      toast({
        title: "入力エラー",
        description: "タイトルとカテゴリーは必須です。",
        variant: "destructive",
      });
      return;
    }
    
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
      imageUrl: editingManual.imageUrl || "",
      updatedAt: serverTimestamp(),
      lastUpdated: new Date().toISOString().split('T')[0],
      status: editingManual.status || 'published',
    };

    setDocumentNonBlocking(manualDocRef, data, { merge: true });
    setIsManualDialogOpen(false);
    setEditingManual(null);
    toast({
      title: "保存しました",
      description: `「${editingManual.title}」を公開しました。`,
    });
  };

  const handleDeleteManual = (manual: any) => {
    if (confirm(`マニュアル「${manual.title}」を削除してもよろしいですか？`)) {
      const manualDocRef = doc(firestore, "categories", manual.categoryId, "manuals", manual.id);
      deleteDocumentNonBlocking(manualDocRef);
    }
  };

  if (!mounted) return null;

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
                      <p className="text-sm text-muted-foreground">
                        {isManualsLoading ? "読み込み中..." : `${manuals?.length || 0} 件のマニュアルが登録されています`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    onClick={() => {
                      setEditingManual({ title: "", content: "", categoryId: categories?.[0]?.id || "", description: "", status: 'published', imageUrl: "" });
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
                      <Card key={manual.id} className="group hover:border-primary/50 transition-all shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex items-center p-4">
                            <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative mr-4 border">
                              {manual.imageUrl ? (
                                <Image src={manual.imageUrl} alt="" fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-primary/5">
                                  <ImageIcon className="w-6 h-6" />
                                </div>
                              )}
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
                    {isManualsLoading && (
                      <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {(!manuals || manuals.length === 0) && !isManualsLoading && (
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
        <DialogContent className="max-w-[95vw] md:max-w-4xl lg:max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-none shadow-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b bg-card">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-headline font-bold">
                {editingManual?.id ? "記事を編集" : "新しい記事を作成"}
              </DialogTitle>
              {editingManual?.id && <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">ID: {editingManual.id}</Badge>}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIsManualDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                キャンセル
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button size="sm" onClick={handleSaveManual} className="bg-primary text-white font-bold px-6 shadow-md hover:bg-primary/90 transition-all">
                <Save className="w-4 h-4 mr-2" />
                保存して公開
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/20">
            <div className="container max-w-6xl py-8 px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-8">
                <section className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="man-title" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      記事タイトル
                    </Label>
                    <Input
                      id="man-title"
                      className="text-3xl font-headline font-bold h-16 border-none focus-visible:ring-0 px-0 placeholder:text-muted-foreground/20 bg-transparent"
                      value={editingManual?.title || ""}
                      onChange={(e) => setEditingManual(prev => ({ ...prev!, title: e.target.value }))}
                      placeholder="魅力的なタイトルを入力..."
                    />
                  </div>
                  
                  <Separator className="opacity-50" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        本文コンテンツ
                      </Label>
                    </div>
                    <RichTextEditor
                      content={editingManual?.content || ""}
                      onChange={(html) => setEditingManual(prev => ({ ...prev!, content: html }))}
                    />
                  </div>
                </section>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card className="shadow-sm border-none bg-card">
                  <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                      <Layout className="w-4 h-4" />
                      公開設定
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="man-category" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">カテゴリー</Label>
                      <Select 
                        value={editingManual?.categoryId} 
                        onValueChange={(val) => setEditingManual(prev => ({ ...prev!, categoryId: val }))}
                      >
                        <SelectTrigger id="man-category" className="bg-muted/30 border-none h-10">
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
                      <Label htmlFor="man-description" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">記事の概要</Label>
                      <Textarea
                        id="man-description"
                        className="text-sm bg-muted/30 border-none resize-none"
                        rows={4}
                        value={editingManual?.description || ""}
                        onChange={(e) => setEditingManual(prev => ({ ...prev!, description: e.target.value }))}
                        placeholder="記事の要約を短く入力してください"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                        サムネイル
                      </Label>
                      <div 
                        className="aspect-[4/3] bg-muted/30 rounded-xl overflow-hidden border-2 border-dashed border-muted relative flex items-center justify-center group cursor-pointer hover:bg-muted/50 transition-all"
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                      >
                        {editingManual?.imageUrl ? (
                          <Image src={editingManual.imageUrl} fill className="object-cover" alt="" />
                        ) : (
                          <div className="text-muted-foreground/30 flex flex-col items-center p-4 text-center">
                            <Upload className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-[10px] font-medium leading-tight">クリックしてアップロード</span>
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
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
