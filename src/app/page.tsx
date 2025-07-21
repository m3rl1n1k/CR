import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductionLineCard } from "@/components/production-line-card";
import { productionLines } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Activity, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const overallOEE = (
    productionLines.reduce((acc, line) => acc + line.oee, 0) /
    productionLines.length
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
            Production Overview
          </h1>
          <div className="flex items-center space-x-2">
            <Link href="/shifts/new">
              <Button>Create New Shift</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall OEE
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallOEE}%</div>
              <p className="text-xs text-muted-foreground">
                Average across all lines
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Shifts
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{activeShifts}</div>
              <p className="text-xs text-muted-foreground">
                Lines currently running
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Requiring attention
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Production Lines</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productionLines.map((line) => (
                <ProductionLineCard key={line.id} line={line} />
            ))}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
