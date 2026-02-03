
"use client";

import { use, useMemo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MOCK_MANUALS } from "@/lib/mock-data";
import { AISummaryCard } from "@/components/manual/ai-summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Clock, Share2, Printer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default function ManualDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const manual = useMemo(() => {
    return MOCK_MANUALS.find((m) => m.id === id);
  }, [id]);

  if (!manual) {
    notFound();
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarNav />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-6 shadow-sm">
            <SidebarTrigger />
            <div className="flex items-center gap-4 ml-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Printer className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </header>

          <main className="p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
            <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden mb-8 shadow-lg">
              <Image
                src={manual.imageUrl || "https://picsum.photos/seed/default/800/400"}
                alt={manual.title}
                fill
                className="object-cover"
                data-ai-hint="business office"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <Badge className="bg-primary text-white mb-2">{manual.category}</Badge>
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-white leading-tight">
                  {manual.title}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b pb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Updated: {manual.lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Author: Admin Team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Read time: 5-7 mins</span>
                  </div>
                </div>

                <div className="prose prose-blue max-w-none">
                  <div className="text-foreground leading-relaxed whitespace-pre-line text-lg">
                    {manual.content.trim()}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="sticky top-24">
                  <AISummaryCard manualText={manual.content} />
                  
                  <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border">
                    <h3 className="font-headline font-bold text-lg mb-4">Manual Details</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Version</span>
                        <span className="font-medium">v1.2.0</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Department</span>
                        <span className="font-medium">{manual.category}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Visibility</span>
                        <span className="font-medium text-green-600">Company Wide</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6 bg-primary/10 text-primary hover:bg-primary/20" variant="ghost">
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
