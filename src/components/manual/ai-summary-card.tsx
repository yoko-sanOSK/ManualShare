
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { summarizeManual } from "@/ai/flows/summarize-manuals";
import { useToast } from "@/hooks/use-toast";

interface AISummaryCardProps {
  manualText: string;
}

export function AISummaryCard({ manualText }: AISummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsLoading(true);
    try {
      const result = await summarizeManual({ manualText });
      setSummary(result.summary);
    } catch (error) {
      console.error("Summarization error:", error);
      toast({
        title: "要約に失敗しました",
        description: "要約の生成中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-secondary/10 border-secondary/20 shadow-none overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-headline flex items-center gap-2 text-foreground">
          <Sparkles className="w-5 h-5 text-secondary fill-secondary" />
          AI インテリジェント要約
        </CardTitle>
        {summary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSummarize}
            disabled={isLoading}
            className="h-8 px-2"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            再生成
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="prose prose-sm max-w-none text-muted-foreground animate-in fade-in duration-500">
            {summary.split('\n').map((line, i) => (
              <p key={i} className="mb-2 last:mb-0 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              読む時間がない？AIがこのマニュアルを簡潔に要約します。
            </p>
            <Button
              onClick={handleSummarize}
              disabled={isLoading}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium shadow-sm transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  解析中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AIで要約する
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
