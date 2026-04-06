
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Footer } from "@/components/layout/footer";
import { ManualCard } from "@/components/manual/manual-card";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen, Loader2, Lock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { verifyAccessPassword } from "@/app/actions/admin-auth";
import { BrandLogo } from "@/components/layout/brand-logo";

const ACCESS_SESSION_KEY = "manualshare_access_session_v1";
const SESSION_DURATION_MS = 5 * 60 * 1000; // 5分

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category");
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  
  // 認証ステート
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null は初期チェック中
  const [passwordInput, setPasswordInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const firestore = useFirestore();
  
  const categoriesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "categories");
  }, [firestore]);
  const { data: categories } = useCollection(categoriesRef);

  const sortedCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  const manualsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collectionGroup(firestore, "manuals");
  }, [firestore]);
  const { data: manuals, isLoading: manualsLoading } = useCollection(manualsRef);

  // セッションのチェックと更新
  const checkAuth = () => {
    const storedSession = localStorage.getItem(ACCESS_SESSION_KEY);
    if (storedSession) {
      const { timestamp } = JSON.parse(storedSession);
      const now = Date.now();
      if (now - timestamp < SESSION_DURATION_MS) {
        // セッションが有効な場合は、有効期限を少し延長（スライディングウィンドウ）
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
    // 定期的にセッション切れをチェック
    const interval = setInterval(checkAuth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setActiveCategory(searchParams.get("category"));
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    const success = await verifyAccessPassword(passwordInput);
    if (success) {
      localStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
      setIsAuthenticated(true);
      toast({ title: "ログイン成功", description: "ダッシュボードへようこそ。" });
    } else {
      toast({ 
        title: "認証失敗", 
        description: "アクセスパスワードが正しくありません。", 
        variant: "destructive" 
      });
    }
    setIsVerifying(false);
  };

  const filteredManuals = useMemo(() => {
    if (!manuals) return [];
    const filtered = manuals.filter((manual) => {
      const isPublished = !manual.status || manual.status === 'published';
      if (!isPublished) return false;

      const matchesSearch = manual.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          manual.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory ? manual.categoryName === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
    
    // order フィールドでソートし、なければ 0 とする
    return [...filtered].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [searchQuery, activeCategory, manuals]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
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
            <CardDescription>ManualShare を閲覧するにはパスワードを入力してください。</CardDescription>
          </CardHeader>
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">アクセスパスワード</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  placeholder="アクセスパスワード" 
                  required 
                  autoFocus 
                />
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
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="マニュアル、ガイド、プロトコルを検索..."
                  className="pl-10 h-10 bg-muted/50 border-none focus-visible:ring-primary/20 transition-shadow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-headline font-bold text-foreground mb-2">
                  ナレッジハブ
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  会社の標準と運用ガイドにアクセスします。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-card p-3 rounded-xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground shrink-0 border-r pr-3 border-border/50">
                  <Filter className="w-4 h-4 text-primary" />
                  カテゴリー
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-1">
                  <Badge 
                    variant={activeCategory === null ? "default" : "outline"}
                    className={`cursor-pointer h-7 px-3 transition-all ${activeCategory === null ? "bg-primary shadow-sm" : "hover:border-primary/50"}`}
                    onClick={() => setActiveCategory(null)}
                  >
                    すべて
                  </Badge>
                  {sortedCategories?.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={activeCategory === cat.name ? "default" : "outline"}
                      className={`cursor-pointer h-7 px-3 transition-all ${activeCategory === cat.name ? "bg-primary shadow-sm" : "hover:border-primary/50"}`}
                      onClick={() => setActiveCategory(cat.name)}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {manualsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredManuals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredManuals.map((manual) => (
                  <ManualCard key={manual.id} manual={manual as any} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border-2 border-dashed border-muted">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <Search className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-headline font-semibold">マニュアルが見つかりません</h3>
                <p className="text-muted-foreground">検索ワードやフィルターを調整してみてください。</p>
              </div>
            )}
          </main>
          <Footer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
