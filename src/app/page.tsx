
"use client";

import { useState, useMemo, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MOCK_MANUALS, CATEGORIES } from "@/lib/mock-data";
import { ManualCard } from "@/components/manual/manual-card";
import { Input } from "@/components/ui/input";
import { Search, Filter, BookOpen } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);

  useEffect(() => {
    setActiveCategory(searchParams.get("category"));
  }, [searchParams]);

  const filteredManuals = useMemo(() => {
    return MOCK_MANUALS.filter((manual) => {
      const matchesSearch = manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          manual.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory ? manual.category === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <SidebarInset>
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

          <main className="p-6 md:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-headline font-bold text-foreground mb-2">
                  ナレッジハブ
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  会社の標準と運用ガイドにアクセスします。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 mr-2 text-sm font-medium text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  フィルター:
                </div>
                <Badge 
                  variant={activeCategory === null ? "default" : "outline"}
                  className={`cursor-pointer h-7 px-3 ${activeCategory === null ? "bg-primary" : "hover:border-primary/50"}`}
                  onClick={() => setActiveCategory(null)}
                >
                  すべて
                </Badge>
                {CATEGORIES.map((cat) => (
                  <Badge
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    className={`cursor-pointer h-7 px-3 ${activeCategory === cat ? "bg-primary" : "hover:border-primary/50"}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {filteredManuals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredManuals.map((manual) => (
                  <ManualCard key={manual.id} manual={manual} />
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
