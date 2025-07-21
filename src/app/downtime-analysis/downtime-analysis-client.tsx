'use client'

import React, { useState, useTransition } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Lightbulb, Loader2, Wand2 } from 'lucide-react';
import { type AnalyzeDowntimeCommentsOutput, type SuggestUptimeSolutionsOutput } from '@/ai/flows';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface DowntimeAnalysisClientProps {
  analyzeDowntime: (comments: string) => Promise<{
    analysis: AnalyzeDowntimeCommentsOutput;
    solutions: SuggestUptimeSolutionsOutput | null;
  }>;
}

export function DowntimeAnalysisClient({ analyzeDowntime }: DowntimeAnalysisClientProps) {
  const [comments, setComments] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeDowntimeCommentsOutput | null>(null);
  const [suggestedSolutions, setSuggestedSolutions] = useState<SuggestUptimeSolutionsOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast({
        title: "Input required",
        description: "Please paste some downtime comments before analyzing.",
        variant: "destructive"
      });
      return;
    }

    startTransition(async () => {
      try {
        const { analysis, solutions } = await analyzeDowntime(comments);
        setAnalysisResult(analysis);
        setSuggestedSolutions(solutions);
        toast({
            title: "Analysis Complete",
            description: "Downtime analysis and suggestions have been generated.",
        })
      } catch (error) {
        toast({
            title: "Analysis Failed",
            description: "An error occurred while analyzing downtime. Please try again.",
            variant: "destructive"
        });
        setAnalysisResult(null);
        setSuggestedSolutions(null);
      }
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Downtime Comments</CardTitle>
          <CardDescription>
            Paste raw downtime comments from logs or reports, one per line.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Example: Machine C-12 jam, waiting for maintenance..."
              className="min-h-[300px] text-sm"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot /> AI Analysis & Trends
            </CardTitle>
            <CardDescription>
              Identified downtime categories and trends.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[120px]">
            {isPending && !analysisResult && <div className="flex items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Waiting for analysis...</div>}
            {analysisResult ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Categories:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.categories.map((cat, i) => <Badge key={i} variant="secondary">{cat}</Badge>)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Trends:</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.trends}</p>
                </div>
              </div>
            ) : !isPending && (
              <p className="text-sm text-center text-muted-foreground pt-8">Results will be displayed here.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb /> Suggested Solutions
            </CardTitle>
            <CardDescription>
              Actionable suggestions to improve uptime.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[120px]">
             {isPending && !suggestedSolutions && <div className="flex items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generating solutions...</div>}
            {suggestedSolutions ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{suggestedSolutions.suggestedSolutions}</p>
            ): !isPending && (
              <p className="text-sm text-center text-muted-foreground pt-8">Solutions will be displayed here.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
