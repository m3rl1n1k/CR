import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DowntimeAnalysisClient } from "./downtime-analysis-client";
import {
  analyzeDowntimeComments,
  AnalyzeDowntimeCommentsOutput,
  suggestUptimeSolutions,
  SuggestUptimeSolutionsOutput,
} from "@/ai/flows";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";

async function performDowntimeAnalysis(
  comments: string
): Promise<{ analysis: AnalyzeDowntimeCommentsOutput; solutions: SuggestUptimeSolutionsOutput | null }> {
  'use server';
  try {
    const analysis = await analyzeDowntimeComments({ comments });
    if (analysis && analysis.trends) {
      const solutions = await suggestUptimeSolutions({ downtimeAnalysis: analysis.trends });
      return { analysis, solutions };
    }
    return { analysis, solutions: null };
  } catch (error) {
    console.error("Error during AI analysis:", error);
    throw new Error("Failed to perform downtime analysis.");
  }
}


export default function DowntimeAnalysisPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              AI-Powered Downtime Analysis
            </h1>
            <p className="text-muted-foreground">
              Paste downtime comments to categorize reasons and get AI-driven solutions.
            </p>
          </div>
          <Card className="bg-accent/50 border-accent">
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-sm text-accent-foreground/80">
                  <Bot size={16} /> Powered by Genkit AI
                </CardTitle>
            </CardHeader>
          </Card>
        </header>
        <DowntimeAnalysisClient analyzeDowntime={performDowntimeAnalysis} />
      </div>
    </DashboardLayout>
  );
}
