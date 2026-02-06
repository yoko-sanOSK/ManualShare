"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Settings, HelpCircle, Tag, Layers } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BrandLogo } from "./brand-logo";

/**
 * メインメニュー項目（Dashboard）
 * useSearchParams を使用するため、呼び出し元で Suspense で囲む必要があります。
 */
function MainMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDashboardActive = pathname === "/" && !searchParams.get('category');

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isDashboardActive}>
          <Link href="/">
            <LayoutDashboard />
            <span>ダッシュボード</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/**
 * カテゴリー一覧項目
 * useSearchParams を使用するため、呼び出し元で Suspense で囲む必要があります。
 */
function CategoryList() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  
  const firestore = useFirestore();
  const categoriesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "categories");
  }, [firestore]);
  const { data: categories } = useCollection(categoriesRef);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === "/" && !currentCategory}>
          <Link href="/">
            <Layers />
            <span>すべて</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {categories?.map((category) => (
        <SidebarMenuItem key={category.id}>
          <SidebarMenuButton asChild isActive={pathname === "/" && currentCategory === category.name}>
            <Link href={`/?category=${category.name}`}>
              <Tag />
              <span>{category.name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      {(!categories || categories.length === 0) && (
        <p className="px-4 text-xs text-muted-foreground italic mt-2">カテゴリーなし</p>
      )}
    </SidebarMenu>
  );
}

/**
 * アプリケーション全体のサイドバーナビゲーション
 */
export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar variant="sidebar" className="border-r border-border/50">
      <SidebarHeader className="py-6 px-6">
        <Link href="/">
          <BrandLogo hoverable={false} />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            メイン
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Suspense fallback={<div className="h-8 w-full bg-muted animate-pulse rounded-md mx-2" />}>
              <MainMenu />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            カテゴリー
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <Suspense fallback={<p className="px-4 text-xs text-muted-foreground">読み込み中...</p>}>
              <CategoryList />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            システム
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"}>
                  <Link href="/settings">
                    <Settings />
                    <span>記事管理</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/help"}>
                  <Link href="/help">
                    <HelpCircle />
                    <span>ヘルプセンター</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
