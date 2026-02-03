
"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { cn } from "@/lib/utils";
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
import { LayoutDashboard, FileText, Settings, HelpCircle, Laptop, Users, TrendingUp, Package, Wallet, Tag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav() {
  const pathname = usePathname();
  const firestore = useFirestore();
  const categoriesRef = useMemoFirebase(() => collection(firestore, "categories"), [firestore]);
  const { data: categories } = useCollection(categoriesRef);

  return (
    <Sidebar variant="sidebar" className="border-r border-border/50">
      <SidebarHeader className="py-6 px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight text-foreground">
            Manual<span className="text-primary">Master</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            メイン
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <LayoutDashboard />
                    <span>ダッシュボード</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            カテゴリー
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories?.map((category) => (
                <SidebarMenuItem key={category.id}>
                  <SidebarMenuButton asChild isActive={pathname === "/" && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('category') === category.name}>
                    <Link href={`/?category=${category.name}`}>
                      <Tag />
                      <span>{category.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {(!categories || categories.length === 0) && (
                <p className="px-4 text-xs text-muted-foreground italic">カテゴリーなし</p>
              )}
            </SidebarMenu>
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
                    <span>設定</span>
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
