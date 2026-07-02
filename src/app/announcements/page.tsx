
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone, Calendar, ChevronRight, Loader2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { verifyAccessPassword } from "@/app/actions/admin-auth";

const ACCESS_SESSION_KEY = "manualshare_access_session_v1";
const SESSION_DURATION_MS = 30 * 60 * 1000;

function AnnouncementsContent() {
  const { toast } = useToast();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const firestore = useFirestore();

  // セッションチェック
  const checkAuth = () => {
    const storedSession = localStorage.getItem(ACCESS_SESSION_KEY);
    if (storedSession) {
      const { timestamp } = JSON.parse(storedSession);
      const now = Date.now();
      if (now - timestamp < SESSION_DURATION_MS) {
        localStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify({ timestamp: now }));
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(ACCESS_SESSION_KEY);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    const success = await verifyAccessPassword(passwordInput);
    if (success) {
      localStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
      setIsAuthenticated(true);
      toast({ title: "ログイン成功" });
    } else {
      toast({ title: "認証失敗", description: "パスワードが違います。", variant: "destructive" });
    }
    setIsVerifying(false);
  };

  // お知らせの取得（最大10件）
  const announcementsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "announcements"), 
      orderBy("date", "desc"), 
      limit(10)
    );
  }, [firestore]);
  const { data: announcements, isLoading } = useCollection(announcementsRef);

  const activeAnnouncements = useMemo(() => {
    if (!announcements) return [];
    return announcements.filter(a => a.isActive !== false);
  }, [announcements]);

  if (isAuthenticated === null) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background w-full">
        <BrandLogo size="lg" className="mb-10" hoverable={false} />
        <Card className="max-w-md w-full shadow-lg border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-primary w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-headline font-bold">アクセス認証</CardTitle>
            <CardDescription>お知らせを閲覧するにはパスワードを入力してください。</CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <div className="p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">アクセスパスワード</Label>
                <Input id="password" type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required autoFocus />
              </div>
              <Button type="submit" className="w-full font-bold" disabled={isVerifying}>
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "ログイン"}
              </Button>
            </div>
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
            <h1 className="text-xl font-headline font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              お知らせ一覧
            </h1>
          </header>

          <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-4xl mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-headline font-bold mb-2">最新の情報</h2>
              <p className="text-muted-foreground">全社へ共有された最新の10件のお知らせを表示しています。</p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Card key={i} className="h-20 animate-pulse bg-muted" />)}
              </div>
            ) : activeAnnouncements.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {activeAnnouncements.map((ann) => (
                  <Card 
                    key={ann.id} 
                    className="border shadow-sm hover:border-primary/50 transition-all cursor-pointer group bg-card"
                    onClick={() => setSelectedAnnouncement(ann)}
                  >
                    <CardContent className="p-6 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-6 min-w-0 flex-1">
                        <div className="bg-primary/10 px-3 py-1.5 rounded text-xs font-bold text-primary shrink-0 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {ann.date}
                        </div>
                        <p className="font-bold text-lg truncate group-hover:text-primary transition-colors">{ann.title}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-bold text-lg">お知らせはありません</h3>
                <p className="text-muted-foreground">現在共有されているお知らせはありません。</p>
              </div>
            )}
          </main>
          <Footer />
        </SidebarInset>
      </div>

      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-[10px] font-bold h-5">{selectedAnnouncement?.date}</Badge>
              <span className="text-[10px] text-muted-foreground font-medium">お知らせ</span>
            </div>
            <DialogTitle className="text-2xl font-headline font-bold">{selectedAnnouncement?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-6 border-y my-4">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap text-lg">
              {selectedAnnouncement?.content || "内容はありません。"}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAnnouncement(null)} className="font-bold">閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <AnnouncementsContent />
    </Suspense>
  );
}
