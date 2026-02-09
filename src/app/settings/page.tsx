
"use client";

import { useState, useRef, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Footer } from "@/components/layout/footer";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, collectionGroup, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Edit, FileText, Tag, Layout, Save, Loader2, Lock, X, MonitorOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { verifyAdminPassword } from "@/app/actions/admin-auth";
import { uploadFileAction } from "@/app/actions/upload-action";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const defaultLogoUrl = "https://placehold.co/600x400/6fa8dc/ffffff?text=ManualShare";

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const categoriesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "categories");
  }, [firestore]);
  const { data: categories } = useCollection(categoriesRef);

  const visibilitiesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "visibility_options");
  }, [firestore]);
  const { data: visibilities } = useCollection(visibilitiesRef);

  const manualsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, "manuals");
  }, [firestore]);
  const { data: manuals } = useCollection(manualsRef);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id?: string, name: string, description: string } | null>(null);

  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);
  const [editingVisibility, setEditingVisibility] = useState<{ id?: string, name: string } | null>(null);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    const success = await verifyAdminPassword(passwordInput);
    if (success) {
      setIsAuthenticated(true);
    } else {
      toast({ title: "認証失敗", description: "管理者パスワードが正しくありません。", variant: "destructive" });
    }
    setIsVerifying(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadFileAction(formData, 'manuals/covers');
      
      if ('error' in result) {
        throw new Error(result.error);
      }

      setEditingManual(prev => ({ ...prev!, imageUrl: result.url }));
      toast({ title: "完了", description: "サムネイルを更新しました。" });
    } catch (error: any) {
      toast({ title: "失敗", description: error.message || "アップロードに失敗しました。", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingManual(prev => ({ ...prev!, imageUrl: "" }));
    toast({ title: "リセット", description: "サムネイルをデフォルトに戻しました。" });
  };

  const handleSaveCategory = () => {
    if (!editingCategory?.name || !firestore || !categoriesRef) return;
    const id = editingCategory.id || doc(categoriesRef).id;
    setDocumentNonBlocking(doc(firestore, "categories", id), { id, ...editingCategory }, { merge: true });
    setIsCategoryDialogOpen(false);
  };

  const handleSaveVisibility = () => {
    if (!editingVisibility?.name || !firestore || !visibilitiesRef) return;
    const id = editingVisibility.id || doc(visibilitiesRef).id;
    setDocumentNonBlocking(doc(firestore, "visibility_options", id), { id, ...editingVisibility }, { merge: true });
    setIsVisibilityDialogOpen(false);
  };

  const handleSaveManual = () => {
    if (!editingManual?.title || !editingManual?.categoryId || !firestore) return;
    
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

  // スマートフォン（768px未満）の制限
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-center">
        <BrandLogo size="lg" className="mb-10" hoverable={false} />
        <Card className="max-w-md w-full shadow-lg border-primary/20">
          <CardHeader>
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <MonitorOff className="text-primary w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold">PC版をご利用ください</CardTitle>
            <CardDescription>
              記事管理機能は、大きな画面での操作に最適化されています。スマートフォン(縦画面)での編集は制限されています。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              記事の作成、編集、削除を行うには、PCまたはタブレット（横画面）からアクセスしてください。
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/"}>
              ダッシュボードへ戻る
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
        <BrandLogo size="lg" className="mb-10" hoverable={false} />
        <Card className="max-w-md w-full shadow-lg border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-primary w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold">記事管理の認証</CardTitle>
            <CardDescription>管理機能にアクセスするには、管理者パスワードを入力してください。</CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">管理者パスワード</Label>
                <Input id="password" type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="管理者パスワード" required autoFocus />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-bold" disabled={isVerifying}>
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "ログイン"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
            <SidebarTrigger />
            <h1 className="text-xl font-headline font-bold text-foreground">記事管理</h1>
          </header>

          <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-headline font-bold mb-2">管理ダッシュボード</h2>
              <p className="text-muted-foreground">記事、カテゴリー、公開範囲を自在にカスタマイズできます。</p>
            </div>

            <Tabs defaultValue="manuals" className="space-y-6">
              <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
                <TabsTrigger value="manuals" className="flex items-center gap-2"><FileText className="w-4 h-4" /> マニュアル記事</TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2"><Tag className="w-4 h-4" /> カテゴリー</TabsTrigger>
                <TabsTrigger value="visibility" className="flex items-center gap-2"><FileText className="w-4 h-4" /> 公開範囲</TabsTrigger>
              </TabsList>

              <TabsContent value="manuals" className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between bg-card p-6 rounded-xl border shadow-sm gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary"><Layout className="w-6 h-6" /></div>
                    <div>
                      <h3 className="text-lg font-bold">記事一覧</h3>
                      <p className="text-sm text-muted-foreground">{manuals?.length || 0} 件登録済み</p>
                    </div>
                  </div>
                  <Button onClick={() => {
                    setEditingManual({ title: "", content: "", categoryId: categories?.[0]?.id || "", description: "", imageUrl: "" });
                    setIsManualDialogOpen(true);
                  }} disabled={!categories?.length} className="font-bold w-full sm:w-auto">
                    <Plus className="w-5 h-5 mr-2" /> 新しい記事を作成
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {manuals?.map((manual) => (
                    <Card key={manual.id} className="group hover:border-primary/50 transition-all shadow-sm">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative mr-4 border">
                            <Image src={manual.imageUrl || defaultLogoUrl} alt="" fill className="object-cover" unoptimized />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-bold truncate text-base sm:text-lg max-w-[200px] sm:max-w-none">{manual.title}</h4>
                              <div className="flex gap-1">
                                <Badge className="bg-primary text-white font-medium whitespace-nowrap">{manual.categoryName}</Badge>
                                {manual.visibilityName && <Badge variant="outline" className="whitespace-nowrap">{manual.visibilityName}</Badge>}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{manual.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-4 sm:mt-0">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingManual(manual as any); setIsManualDialogOpen(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => firestore && deleteDocumentNonBlocking(doc(firestore, `categories/${manual.categoryId}/manuals/${manual.id}`))}>
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
                  <Button variant="outline" onClick={() => { setEditingCategory({ name: "", description: "" }); setIsCategoryDialogOpen(true); }} className="font-bold">
                    <Plus className="w-4 h-4 mr-2" /> カテゴリー追加
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories?.map((cat) => (
                    <Card key={cat.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between">
                          {cat.name}
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCategory(cat); setIsCategoryDialogOpen(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => firestore && deleteDocumentNonBlocking(doc(firestore, "categories", cat.id))}>
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
                  <Button variant="outline" onClick={() => { setEditingVisibility({ name: "" }); setIsVisibilityDialogOpen(true); }} className="font-bold">
                    <Plus className="w-4 h-4 mr-2" /> 範囲を追加
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibilities?.map((vis) => (
                    <Card key={vis.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between items-center">
                          <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{vis.name}</div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingVisibility(vis); setIsVisibilityDialogOpen(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => firestore && deleteDocumentNonBlocking(doc(firestore, "visibility_options", vis.id))}>
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
          <Footer />
        </SidebarInset>
      </div>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>カテゴリー編集</DialogTitle>
            <DialogDescription>カテゴリーの名称と詳細な説明を入力してください。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>カテゴリー名</Label>
            <Input value={editingCategory?.name || ""} onChange={(e) => setEditingCategory(prev => ({ ...prev!, name: e.target.value }))} />
            <Label>説明</Label>
            <Textarea value={editingCategory?.description || ""} onChange={(e) => setEditingCategory(prev => ({ ...prev!, description: e.target.value }))} />
          </div>
          <DialogFooter><Button onClick={handleSaveCategory} className="font-bold w-full sm:w-auto">保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isVisibilityDialogOpen} onOpenChange={setIsVisibilityDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>公開範囲編集</DialogTitle>
            <DialogDescription>マニュアルを表示できる権限の範囲を定義します。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label>範囲名</Label>
            <Input value={editingVisibility?.name || ""} placeholder="例: 全社公開, 役員限定" onChange={(e) => setEditingVisibility(prev => ({ ...prev!, name: e.target.value }))} />
          </div>
          <DialogFooter><Button onClick={handleSaveVisibility} className="font-bold w-full sm:w-auto">保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden [&>button]:hidden">
          <DialogHeader className="px-4 sm:px-6 py-4 border-b flex flex-row justify-between items-center bg-card">
            <div>
              <DialogTitle className="font-bold text-base sm:text-lg">記事編集</DialogTitle>
              <DialogDescription className="sr-only">記事の内容、カテゴリー、サムネイルなどを編集します。</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsManualDialogOpen(false)} className="font-bold">キャンセル</Button>
              <Button size="sm" onClick={handleSaveManual} className="font-bold"><Save className="w-4 h-4 mr-2" /> 保存して公開</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/20">
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="lg:col-span-3 space-y-6">
                <Card className="p-4 sm:p-6">
                  <Input className="text-xl sm:text-3xl font-bold border-none px-0 focus-visible:ring-0 mb-4" value={editingManual?.title || ""} onChange={(e) => setEditingManual(prev => ({ ...prev!, title: e.target.value }))} placeholder="タイトルを入力..." />
                  <RichTextEditor content={editingManual?.content || ""} onChange={(html) => setEditingManual(prev => ({ ...prev!, content: html }))} />
                </Card>
              </div>
              <div className="lg:col-span-1 space-y-4">
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 lg:group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : "変更する"}
                    </div>
                    {editingManual?.imageUrl && (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-20"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
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
