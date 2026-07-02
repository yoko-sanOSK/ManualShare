
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
import { Plus, Trash2, Edit, FileText, Tag, Layout, Save, Loader2, Lock, X, MonitorOff, EyeOff, Eye, Search, GripVertical, Megaphone, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { verifyAdminPassword } from "@/app/actions/admin-auth";
import { uploadFileAction, deleteFileAction } from "@/app/actions/upload-action";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// DND Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ManualStatus = 'published' | 'draft';

interface ManualData {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  description: string;
  imageUrl?: string;
  status: ManualStatus;
  categoryName: string;
  lastUpdated?: string;
  order?: number;
}

interface CategoryData {
  id: string;
  name: string;
  description: string;
  order?: number;
}

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  date: string;
  isActive: boolean;
  createdAt: any;
}

function SortableManualItem({ 
  manual, 
  onEdit, 
  onDelete, 
  isDragDisabled,
  defaultLogoUrl 
}: { 
  manual: ManualData, 
  onEdit: (m: ManualData) => void, 
  onDelete: (m: ManualData) => void,
  isDragDisabled: boolean,
  defaultLogoUrl: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: manual.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragDisabled ? "" : "touch-none")}>
      <Card className={cn(
        "group hover:border-primary/50 transition-all shadow-sm",
        isDragging && "border-primary ring-2 ring-primary/20 bg-muted/50"
      )}>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center">
          <div className="flex items-center flex-1 min-w-0">
            {!isDragDisabled && (
              <div 
                {...attributes} 
                {...listeners} 
                className="mr-4 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground group-hover:text-primary transition-colors"
              >
                <GripVertical className="w-5 h-5" />
              </div>
            )}
            
            <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative mr-4 border">
              <Image src={manual.imageUrl || defaultLogoUrl} alt="" fill className="object-cover" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-bold truncate text-base sm:text-lg">{manual.title}</h4>
                <Badge className="bg-primary text-white font-medium">{manual.categoryName}</Badge>
                {manual.status === 'draft' && (
                  <Badge variant="outline" className="text-muted-foreground gap-1">
                    <EyeOff className="w-3 h-3" /> 下書き
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <p className="line-clamp-1 flex-1">{manual.description}</p>
                <span className="shrink-0">最終更新: {manual.lastUpdated}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4 sm:mt-0 ml-4">
            <Button variant="ghost" size="icon" onClick={() => onEdit(manual)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(manual)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
  const [manualSearchQuery, setManualSearchQuery] = useState("");

  const defaultLogoUrl = "https://placehold.co/600x400/6fa8dc/ffffff?text=ManualShare";

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const categoriesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "categories");
  }, [firestore]);
  const { data: categories } = useCollection<CategoryData>(categoriesRef);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  const manualsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, "manuals");
  }, [firestore]);
  const { data: manuals } = useCollection<ManualData>(manualsRef);

  const announcementsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "announcements");
  }, [firestore]);
  const { data: announcements } = useCollection<AnnouncementData>(announcementsRef);

  const sortedManuals = useMemo(() => {
    if (!manuals) return [];
    return [...manuals].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [manuals]);

  const filteredManuals = useMemo(() => {
    if (!manualSearchQuery) return sortedManuals;
    return sortedManuals.filter(m => 
      m.title?.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
      m.categoryName?.toLowerCase().includes(manualSearchQuery.toLowerCase())
    );
  }, [sortedManuals, manualSearchQuery]);

  const sortedAnnouncements = useMemo(() => {
    if (!announcements) return [];
    return [...announcements].sort((a, b) => b.date.localeCompare(a.date));
  }, [announcements]);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryData> | null>(null);

  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<Partial<ManualData> | null>(null);

  const [isAnnounceDialogOpen, setIsAnnounceDialogOpen] = useState(false);
  const [editingAnnounce, setEditingAnnounce] = useState<Partial<AnnouncementData> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !firestore) return;

    const oldIndex = sortedManuals.findIndex((m) => m.id === active.id);
    const newIndex = sortedManuals.findIndex((m) => m.id === over.id);

    const newSortedManuals = arrayMove(sortedManuals, oldIndex, newIndex);
    
    newSortedManuals.forEach((m, index) => {
      const newOrder = index + 1;
      if (m.order !== newOrder) {
        const manualDocRef = doc(firestore, "categories", m.categoryId, "manuals", m.id);
        setDocumentNonBlocking(manualDocRef, { order: newOrder }, { merge: true });
      }
    });
    
    toast({ title: "順序を更新しました", description: "表示順を保存しました。" });
  };

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
      if ('error' in result) throw new Error(result.error);
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
    const data = { ...editingCategory, id, order: editingCategory.order ?? 1 };
    setDocumentNonBlocking(doc(firestore, "categories", id), data, { merge: true });
    setIsCategoryDialogOpen(false);
    toast({ title: "保存完了", description: `カテゴリー「${editingCategory.name}」を保存しました。` });
  };

  const handleSaveManual = () => {
    if (!editingManual?.title || !editingManual?.categoryId || !firestore) {
      toast({ title: "入力エラー", description: "タイトルとカテゴリーは必須です。", variant: "destructive" });
      return;
    }
    const category = categories?.find(c => c.id === editingManual.categoryId);
    const manualId = editingManual.id || doc(collection(firestore, `categories/${editingManual.categoryId}/manuals`)).id;
    const existingManual = manuals?.find(m => m.id === manualId);
    if (existingManual && existingManual.categoryId !== editingManual.categoryId) {
      deleteDocumentNonBlocking(doc(firestore, "categories", existingManual.categoryId, "manuals", manualId));
    }
    const manualDocRef = doc(firestore, "categories", editingManual.categoryId, "manuals", manualId);
    const data = {
      ...editingManual,
      id: manualId,
      categoryName: category?.name || "未分類",
      updatedAt: serverTimestamp(),
      lastUpdated: new Date().toISOString().split('T')[0],
      order: editingManual.order || (manuals?.length || 0) + 1,
    };
    setDocumentNonBlocking(manualDocRef, data, { merge: true });
    setIsManualDialogOpen(false);
    toast({ title: editingManual.status === 'published' ? "公開しました" : "下書き保存しました", description: `「${editingManual.title}」を保存しました。` });
  };

  const handleSaveAnnounce = () => {
    if (!editingAnnounce?.title || !editingAnnounce?.date || !firestore) {
      toast({ title: "入力エラー", description: "タイトルと日付は必須です。", variant: "destructive" });
      return;
    }
    const id = editingAnnounce.id || doc(collection(firestore, "announcements")).id;
    const data = {
      ...editingAnnounce,
      id,
      isActive: editingAnnounce.isActive ?? true,
      createdAt: editingAnnounce.createdAt || serverTimestamp(),
    };
    setDocumentNonBlocking(doc(firestore, "announcements", id), data, { merge: true });
    setIsAnnounceDialogOpen(false);
    toast({ title: "保存完了", description: "お知らせを更新しました。" });
  };

  const extractImagesFromHtml = (html: string): string[] => {
    if (!html) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return Array.from(doc.querySelectorAll('img')).map(img => img.getAttribute('src')).filter(src => !!src) as string[];
  };

  const handleDeleteManual = async (manual: ManualData) => {
    if (!firestore || !manuals) return;
    if (!confirm(`「${manual.title}」を削除しますか？`)) return;
    try {
      const targetImages = new Set<string>();
      if (manual.imageUrl) targetImages.add(manual.imageUrl);
      extractImagesFromHtml(manual.content).forEach(src => targetImages.add(src));
      const otherImages = new Set<string>();
      manuals.forEach(m => {
        if (m.id !== manual.id) {
          if (m.imageUrl) otherImages.add(m.imageUrl);
          extractImagesFromHtml(m.content).forEach(src => otherImages.add(src));
        }
      });
      for (const url of targetImages) {
        if (!otherImages.has(url) && url.includes('public.blob.vercel-storage.com')) {
          await deleteFileAction(url);
        }
      }
      deleteDocumentNonBlocking(doc(firestore, "categories", manual.categoryId, "manuals", manual.id));
      toast({ title: "削除完了", description: "記事を削除しました。" });
    } catch (error: any) {
      toast({ title: "エラー", description: "削除中に問題が発生しました。", variant: "destructive" });
    }
  };

  if (!mounted) return null;

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
            <CardDescription>記事管理機能はPCでの操作に最適化されています。</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/"}>ダッシュボードへ戻る</Button>
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
            <CardTitle className="text-2xl font-headline font-bold">管理者認証</CardTitle>
            <CardDescription>管理機能にアクセスするにはパスワードを入力してください。</CardDescription>
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
            <Tabs defaultValue="manuals" className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="manuals" className="flex items-center gap-2"><FileText className="w-4 h-4" /> マニュアル記事</TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2"><Tag className="w-4 h-4" /> カテゴリー</TabsTrigger>
                <TabsTrigger value="announcements" className="flex items-center gap-2"><Megaphone className="w-4 h-4" /> お知らせ</TabsTrigger>
              </TabsList>

              <TabsContent value="manuals" className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between bg-card p-6 rounded-xl border shadow-sm gap-4">
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary shrink-0"><Layout className="w-6 h-6" /></div>
                    <div className="relative flex-1 max-sm:w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="記事を検索..." className="pl-9 h-10" value={manualSearchQuery} onChange={(e) => setManualSearchQuery(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={() => {
                    setEditingManual({ title: "", content: "", categoryId: sortedCategories?.[0]?.id || "", description: "", imageUrl: "", status: "published" });
                    setIsManualDialogOpen(true);
                  }} disabled={!categories?.length} className="font-bold w-full sm:w-auto">
                    <Plus className="w-5 h-5 mr-2" /> 新規作成
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredManuals.map(m => m.id)} strategy={verticalListSortingStrategy}>
                      {filteredManuals.map((manual) => (
                        <SortableManualItem key={manual.id} manual={manual} isDragDisabled={!!manualSearchQuery} defaultLogoUrl={defaultLogoUrl} onEdit={(m) => { setEditingManual(m); setIsManualDialogOpen(true); }} onDelete={(m) => handleDeleteManual(m)} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">カテゴリー管理</h3>
                  <Button variant="outline" onClick={() => { setEditingCategory({ name: "", description: "", order: (categories?.length || 0) + 1 }); setIsCategoryDialogOpen(true); }} className="font-bold">
                    <Plus className="w-4 h-4 mr-2" /> 追加
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedCategories?.map((cat) => (
                    <Card key={cat.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between">
                          <span className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{cat.order || 1}</Badge>
                            {cat.name}
                          </span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingCategory(cat); setIsCategoryDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                              if(confirm(`カテゴリー「${cat.name}」を削除しますか？`)) {
                                firestore && deleteDocumentNonBlocking(doc(firestore, "categories", cat.id));
                              }
                            }}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="announcements" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">お知らせ管理</h3>
                  <Button variant="outline" onClick={() => { setEditingAnnounce({ title: "", content: "", date: new Date().toISOString().split('T')[0], isActive: true }); setIsAnnounceDialogOpen(true); }} className="font-bold">
                    <Plus className="w-4 h-4 mr-2" /> お知らせ作成
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {sortedAnnouncements?.map((ann) => (
                    <Card key={ann.id} className={cn("transition-all", !ann.isActive && "opacity-60")}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant={ann.isActive ? "default" : "outline"}>{ann.date}</Badge>
                          <p className="font-bold">{ann.title}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingAnnounce(ann); setIsAnnounceDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                            if(confirm("このお知らせを削除しますか？")) {
                              firestore && deleteDocumentNonBlocking(doc(firestore, "announcements", ann.id));
                            }
                          }}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </main>
          <Footer />
        </SidebarInset>
      </div>

      {/* お知らせダイアログ */}
      <Dialog open={isAnnounceDialogOpen} onOpenChange={setIsAnnounceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>お知らせ編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>タイトル</Label>
              <Input value={editingAnnounce?.title || ""} onChange={(e) => setEditingAnnounce(prev => ({ ...prev!, title: e.target.value }))} placeholder="お知らせのタイトル" />
            </div>
            <div className="space-y-2">
              <Label>本文</Label>
              <Textarea value={editingAnnounce?.content || ""} onChange={(e) => setEditingAnnounce(prev => ({ ...prev!, content: e.target.value }))} className="min-h-[150px]" placeholder="お知らせの詳細内容を入力してください" />
            </div>
            <div className="space-y-2">
              <Label>日付</Label>
              <Input type="date" value={editingAnnounce?.date || ""} onChange={(e) => setEditingAnnounce(prev => ({ ...prev!, date: e.target.value }))} />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="announce-active" checked={editingAnnounce?.isActive ?? true} onCheckedChange={(val) => setEditingAnnounce(prev => ({ ...prev!, isActive: val }))} />
              <Label htmlFor="announce-active">有効にする（ホーム画面に表示）</Label>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveAnnounce} className="font-bold w-full sm:w-auto">保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カテゴリー編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>カテゴリー名</Label>
              <Input value={editingCategory?.name || ""} onChange={(e) => setEditingCategory(prev => ({ ...prev!, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>表示順</Label>
              <Select value={editingCategory?.order?.toString() || "1"} onValueChange={(val) => setEditingCategory(prev => ({ ...prev!, order: parseInt(val) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[180px]">
                  {Array.from({ length: 20 }, (_, i) => (<SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>説明</Label>
              <Textarea value={editingCategory?.description || ""} onChange={(e) => setEditingCategory(prev => ({ ...prev!, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveCategory} className="font-bold w-full sm:w-auto">保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden [&>button]:hidden">
          <DialogHeader className="px-6 py-4 border-b flex flex-row justify-between items-center bg-card">
            <DialogTitle className="font-bold">記事編集</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsManualDialogOpen(false)}>キャンセル</Button>
              <Button size="sm" onClick={handleSaveManual} className="font-bold"><Save className="w-4 h-4 mr-2" /> 保存して適用</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <Card className="p-6">
                  <Input className="text-3xl font-bold border-none px-0 focus-visible:ring-0 mb-4" value={editingManual?.title || ""} onChange={(e) => setEditingManual(prev => ({ ...prev!, title: e.target.value }))} placeholder="タイトルを入力..." />
                  <RichTextEditor content={editingManual?.content || ""} onChange={(html) => setEditingManual(prev => ({ ...prev!, content: html }))} />
                </Card>
              </div>
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-4 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">公開設定</Label>
                    <RadioGroup value={editingManual?.status} onValueChange={(val) => setEditingManual(prev => ({ ...prev!, status: val as ManualStatus }))} className="grid gap-2">
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="published" id="published" />
                        <Label htmlFor="published" className="flex-1 cursor-pointer font-bold flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> 公開</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="draft" id="draft" />
                        <Label htmlFor="draft" className="flex-1 cursor-pointer font-bold flex items-center gap-2"><EyeOff className="w-4 h-4 text-muted-foreground" /> 下書き</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">カテゴリー</Label>
                    <Select value={editingManual?.categoryId} onValueChange={(val) => setEditingManual(prev => ({ ...prev!, categoryId: val }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{sortedCategories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">サムネイル</Label>
                    <div className="aspect-video relative border rounded-xl overflow-hidden group cursor-pointer bg-muted" onClick={() => fileInputRef.current?.click()}>
                      <Image src={editingManual?.imageUrl || defaultLogoUrl} fill className="object-cover" alt="" unoptimized />
                      <div className="absolute inset-0 bg-black/40 opacity-0 lg:group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : "変更する"}
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">概要</Label>
                    <Textarea value={editingManual?.description || ""} onChange={(e) => setEditingManual(prev => ({ ...prev!, description: e.target.value }))} className="min-h-[100px] text-sm" placeholder="記事の簡単な説明を入力..." />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
