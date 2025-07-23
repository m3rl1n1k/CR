'use client';

import React from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductionLineCard } from "@/components/production-line-card";
import { ProductionLine } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Activity, AlertTriangle, Frown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getProductionLines } from "@/lib/api";
import { useTranslation } from '@/hooks/use-translation';

async function getLines(): Promise<ProductionLine[]> {
  try {
    const lines = await getProductionLines();
    // The API doesn't provide all the fields the card component needs.
    // We'll add some placeholder data.
    return lines.map((line, index) => ({
      ...line,
      id: line.lineCode || `line-${index}`,
      name: line.lineName || 'Unnamed Line',
      status: "Running", // Placeholder
      oee: Math.floor(Math.random() * (95 - 75 + 1) + 75), // Placeholder
      currentProduct: "Widget Pro", // Placeholder
      shiftProgress: Math.floor(Math.random() * (90 - 40 + 1) + 40), // Placeholder
      alerts: Math.floor(Math.random() * 5), // Placeholder
      currentShiftId: `shift-${index}` // Placeholder
    }));
  } catch (error) {
    console.error("Failed to get production lines:", error);
    return [];
  }
}


export default function Home() {
  const [productionLines, setProductionLines] = React.useState<ProductionLine[]>([]);
  const { t } = useTranslation();

  React.useEffect(() => {
    getLines().then(setProductionLines);
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('overall_oee')}
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallOEE}%</div>
              <p className="text-xs text-muted-foreground">
                {t('average_across_all_lines')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('active_shifts')}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{activeShifts}</div>
              <p className="text-xs text-muted-foreground">
                {t('lines_currently_running')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('active_alerts')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                {t('requiring_attention')}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('production_lines')}</h2>
            {productionLines.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {productionLines.map((line) => (
                    <ProductionLineCard key={line.id} line={line} />
                ))}
                </div>
            ) : (
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
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
