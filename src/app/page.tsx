'use client';

import React from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductionLineCard } from "@/components/production-line-card";
import { ProductionLine } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart, Activity, AlertTriangle, Frown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getProductionLines } from "@/lib/api";
import { useTranslation } from '@/hooks/use-translation';
import { Skeleton } from '@/components/ui/skeleton';
import { PrivateRoute } from '@/components/auth/private-route';

function useProductionData() {
  const [productionLines, setProductionLines] = React.useState<ProductionLine[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function getLines() {
      try {
        setLoading(true);
        const lines = await getProductionLines();
        const mappedLines = lines.map((line, index) => ({
          ...line,
          id: line.lineCode || `line-${index}`,
          name: line.lineName || 'Unnamed Line',
          status: "Running" as const, 
          oee: Math.floor(Math.random() * (95 - 75 + 1) + 75), 
          currentProduct: "Widget Pro", 
          shiftProgress: Math.floor(Math.random() * (90 - 40 + 1) + 40), 
          alerts: Math.floor(Math.random() * 5),
          currentShiftId: `shift-${index}`
        }));
        setProductionLines(mappedLines);
      } catch (error) {
        console.error("Failed to get production lines:", error);
        setProductionLines([]);
      } finally {
        setLoading(false);
      }
    }
    getLines();
  }, []);

  const overallOEE = (
    productionLines.reduce((acc, line) => acc + line.oee, 0) /
    (productionLines.length || 1)
  ).toFixed(1);

  const activeShifts = productionLines.filter(
    (line) => line.status === "Running"
  ).length;

  const totalAlerts = productionLines.reduce(
    (acc, line) => acc + line.alerts,
    0
  );

  return {
    loading,
    productionLines,
    overallOEE,
    activeShifts,
    totalAlerts,
  };
}

function OverviewMetrics({ overallOEE, activeShifts, totalAlerts, loading }: { overallOEE: string, activeShifts: number, totalAlerts: number, loading: boolean }) {
    const { t } = useTranslation();

    const metrics = [
        { titleKey: 'overall_oee', value: `${overallOEE}%`, subtextKey: 'average_across_all_lines', icon: BarChart, loadingValue: <Skeleton className="h-6 w-16" />, loadingSubtext: <Skeleton className="h-3 w-32" /> },
        { titleKey: 'active_shifts', value: `+${activeShifts}`, subtextKey: 'lines_currently_running', icon: Activity, loadingValue: <Skeleton className="h-6 w-8" />, loadingSubtext: <Skeleton className="h-3 w-28" /> },
        { titleKey: 'active_alerts', value: totalAlerts, subtextKey: 'requiring_attention', icon: AlertTriangle, loadingValue: <Skeleton className="h-6 w-6" />, loadingSubtext: <Skeleton className="h-3 w-24" /> }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
                <Card key={metric.titleKey}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(metric.titleKey)}</CardTitle>
                        <metric.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? metric.loadingValue : <div className="text-2xl font-bold">{metric.value}</div>}
                        {loading ? metric.loadingSubtext : <p className="text-xs text-muted-foreground">{t(metric.subtextKey)}</p>}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}


function ProductionLinesGrid({ lines, loading }: { lines: ProductionLine[], loading: boolean }) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                   <Card key={index} className="flex flex-col shadow-md">
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                             <Skeleton className="h-4 w-1/2" />
                             <Skeleton className="h-4 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                   </Card>
                ))}
            </div>
        )
    }

    if (lines.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
                    <Frown className="w-16 h-16 text-muted-foreground" />
                    <p className="text-lg font-semibold text-muted-foreground">{t('could_not_load_production_lines')}</p>
                    <p className="text-sm text-center text-muted-foreground">
                        {t('could_not_load_production_lines_desc_1')}
                        <br/>
                        {t('could_not_load_production_lines_desc_2')}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lines.map((line) => (
                <ProductionLineCard key={line.id} line={line} />
            ))}
        </div>
    );
}


function HomePageContent() {
  const { t } = useTranslation();
  const { loading, productionLines, overallOEE, activeShifts, totalAlerts } = useProductionData();

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('production_overview')}
          </h1>
          <div className="flex items-center space-x-2">
            <Link href="/shifts/new">
              <Button>{t('create_new_shift')}</Button>
            </Link>
          </div>
        </div>
        
        <OverviewMetrics loading={loading} overallOEE={overallOEE} activeShifts={activeShifts} totalAlerts={totalAlerts} />

        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('production_lines')}</h2>
            <ProductionLinesGrid lines={productionLines} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Home() {
    return (
        <PrivateRoute>
            <HomePageContent />
        </PrivateRoute>
    )
}
