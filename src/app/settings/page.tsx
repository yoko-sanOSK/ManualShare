
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
import { Plus, Trash2, Edit, FileText, Tag, Image as ImageIcon, Layout, Save, X, Upload, Loader2, Globe, Shield } from "lucide-react";
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

  // ManualMasterのロゴが中央にあるデフォルト画像URL
  const defaultLogoUrl = "https://placehold.co/600x400/6fa8dc/ffffff?text=ManualMaster";

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const categoriesRef = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const { data: categories } = useCollection(categoriesRef);

  const visibilitiesRef = useMemoFirebase(() => collection(firestore, "visibility_options"), [firestore]);
  const { data: visibilities } = useCollection(visibilitiesRef);

  const manualsRef = useMemoFirebase(() => collectionGroup(firestore, "manuals"), [firestore]);
  const { data: manuals, isLoading: isManualsLoading } = useCollection(manualsRef);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string, name: string, description: string } | null>(null);

  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);
  const [editingVisibility, setEditingVisibility] = useState<{ id?: string, name: string, color?: string } | null>(null);

  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<{
    id?: string;
    title: string;
    content: string;
    categoryId: string;
    visibilityId?: string;
    description: string;
    imageUrl?: string;
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
      toast({ title: "完了", description: "サムネイルを更新しました。" });
    } catch (error) {
      toast({ title: "失敗", description: "アップロードに失敗しました。", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCategory = () => {
    if (!editingCategory?.name) return;
    const id = editingCategory.id || doc(categoriesRef).id;
    setDocumentNonBlocking(doc(firestore, "categories", id), { id, ...editingCategory }, { merge: true });
    setIsCategoryDialogOpen(false);
  };

  const handleSaveVisibility = () => {
    if (!editingVisibility?.name) return;
    const id = editingVisibility.id || doc(visibilitiesRef).id;
    setDocumentNonBlocking(doc(firestore, "visibility_options", id), { id, ...editingVisibility }, { merge: true });
    setIsVisibilityDialogOpen(false);
  };

  const handleSaveManual = () => {
    if (!editingManual?.title || !editingManual?.categoryId) return;
    
    const category = categories?.find(c => c.id === editingManual.categoryId);
    const visibility = visibilities?.find(v => v.id === editingManual.visibilityId);
    
    const manualId = editingManual.id || doc(collection(firestore, `categories/${editingManual.categoryId}/manuals`)).id;
    const manualDocRef = doc(firestore, "categories", editingManual.categoryId, "manuals", manualId);
    
    const data = {
      ...editingManual,
      id: manualId,
      categoryName: category?.name || "未分類",
      visibilityName: visibility?.name || "未設定",
      updatedAt: serverTimestamp(),
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setDocumentNonBlocking(manualDocRef, data, { merge: true });
    setIsManualDialogOpen(false);
    toast({ title: "保存しました", description: `「${editingManual.title}」を公開しました。` });
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
              <p className="text-muted-foreground">記事、カテゴリー、公開範囲を自在にカスタマイズできます。</p>
            </div>

            <Tabs defaultValue="manuals" className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="manuals" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> マニュアル記事
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" /> カテゴリー
                </TabsTrigger>
                <TabsTrigger value="visibility" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> 公開範囲
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manuals" className="space-y-6">
                <div className="flex items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                      <Layout className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">記事一覧</h3>
                      <p className="text-sm text-muted-foreground">{manuals?.length || 0} 件登録済み</p>
                    </div>
                  </div>
                  <Button onClick={() => {
                    setEditingManual({ title: "", content: "", categoryId: categories?.[0]?.id || "", description: "", imageUrl: "" });
                    setIsManualDialogOpen(true);
                  }} disabled={!categories?.length}>
                    <Plus className="w-5 h-5 mr-2" /> 新しい記事を作成
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {manuals?.map((manual) => (
                    <Card key={manual.id} className="group hover:border-primary/50 transition-all shadow-sm">
                      <CardContent className="p-4 flex items-center">
                        <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative mr-4 border">
                          <Image src={manual.imageUrl || defaultLogoUrl} alt="" fill className="object-cover" unoptimized />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold truncate text-lg">{manual.title}</h4>
                            <Badge variant="secondary">{manual.categoryName}</Badge>
                            {manual.visibilityName && <Badge variant="outline">{manual.visibilityName}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{manual.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingManual(manual as any); setIsManualDialogOpen(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteDocumentNonBlocking(doc(firestore, `categories/${manual.categoryId}/manuals/${manual.id}`))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">カテゴリー設定</h3>
                  <Button variant="outline" onClick={() => { setEditingCategory({ name: "", description: "" }); setIsCategoryDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> カテゴリー追加
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories?.map((cat) => (
                    <Card key={cat.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between">
                          {cat.name}
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCategory(cat); setIsCategoryDialogOpen(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteDocumentNonBlocking(doc(firestore, "categories", cat.id))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                        <CardDescription>{cat.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="visibility" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">公開範囲設定</h3>
                  <Button variant="outline" onClick={() => { setEditingVisibility({ name: "" }); setIsVisibilityDialogOpen(true); }}>
                    <Plus className="w-4 h-4 mr-2" /> 範囲を追加
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visibilities?.map((vis) => (
                    <Card key={vis.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            {vis.name}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingVisibility(vis); setIsVisibilityDialogOpen(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteDocumentNonBlocking(doc(firestore, "visibility_options", vis.id))}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
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
          <DialogHeader><DialogTitle>カテゴリー編集</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Label>カテゴリー名</Label>
            <Input value={editingCategory?.name || ""} onChange={(e) => setEditingCategory(prev => ({ ...prev!, name: e.target.value }))} />
            <Label>説明</Label>
            <Textarea value={editingCategory?.description || ""} onChange={(e) => setEditingCategory(prev => ({ ...prev!, description: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveCategory}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isVisibilityDialogOpen} onOpenChange={setIsVisibilityDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>公開範囲編集</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Label>範囲名</Label>
            <Input value={editingVisibility?.name || ""} placeholder="例: 全社公開, 役員限定" onChange={(e) => setEditingVisibility(prev => ({ ...prev!, name: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button onClick={handleSaveVisibility}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        {/* [&>button]:hidden で右上の×ボタンを非表示にする */}
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden [&>button]:hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-card">
            <DialogTitle className="font-bold">記事編集</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setIsManualDialogOpen(false)}>キャンセル</Button>
              <Button onClick={handleSaveManual}><Save className="w-4 h-4 mr-2" /> 保存して公開</Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
            <div className="grid grid-cols-4 gap-8">
              <div className="col-span-3 space-y-6">
                <Card className="p-6">
                  <Input className="text-3xl font-bold border-none px-0 focus-visible:ring-0 mb-4" value={editingManual?.title || ""} onChange={(e) => setEditingManual(prev => ({ ...prev!, title: e.target.value }))} placeholder="タイトルを入力..." />
                  <RichTextEditor content={editingManual?.content || ""} onChange={(html) => setEditingManual(prev => ({ ...prev!, content: html }))} />
                </Card>
              </div>
              <div className="col-span-1 space-y-4">
                <Card className="p-4 space-y-4">
                  <Label>カテゴリー</Label>
                  <Select value={editingManual?.categoryId} onValueChange={(val) => setEditingManual(prev => ({ ...prev!, categoryId: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Label>公開範囲</Label>
                  <Select value={editingManual?.visibilityId} onValueChange={(val) => setEditingManual(prev => ({ ...prev!, visibilityId: val }))}>
                    <SelectTrigger><SelectValue placeholder="公開範囲を選択" /></SelectTrigger>
                    <SelectContent>{visibilities?.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Label>サムネイル</Label>
                  <div className="aspect-video relative border rounded-xl overflow-hidden group cursor-pointer bg-muted" onClick={() => fileInputRef.current?.click()}>
                    <Image src={editingManual?.imageUrl || defaultLogoUrl} fill className="object-cover" alt="" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : "変更する"}
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <Label>概要</Label>
                  <Textarea value={editingManual?.description || ""} onChange={(e) => setEditingManual(prev => ({ ...prev!, description: e.target.value }))} />
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
