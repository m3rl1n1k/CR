'use client';

import React from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, AlertCircle, Package, Calendar, Users, CheckCircle, Frown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getShift, getProblems } from "@/lib/api";
import { Problem, Shift } from "@/lib/data";
import { format } from "date-fns";
import { useTranslation } from '@/hooks/use-translation';
import { Skeleton } from '@/components/ui/skeleton';
import { PrivateRoute } from '@/components/auth/private-route';

function useShiftData(shiftId: string | undefined | null) {
  const [shift, setShift] = React.useState<Shift | null>(null);
  const [problems, setProblems] = React.useState<Problem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!shiftId || typeof shiftId !== 'string') {
        setLoading(false);
        return;
    };

    async function getData(id: string) {
        try {
            setLoading(true);
            const shiftPromise = getShift(id);
            const problemsPromise = getProblems(); // API doesn't support filtering problems by shift

            const [shiftData, allProblems] = await Promise.all([shiftPromise, problemsPromise]);
            
            if (!shiftData) {
                setShift(null);
                setProblems([]);
                return;
            }
            
            const enrichedShift = {
                ...shiftData,
                id: shiftData['@id'] || id,
                name: `Shift ${id}`,
                line: shiftData.productionLine?.split('/').pop() || `Line ${id}`,
                date: format(new Date(), 'yyyy-MM-dd'),
                supervisor: "Jane Doe",
                status: 'In Progress' as const,
                workCard: {
                    id: `wc-${id}`,
                    productName: 'Widget Pro',
                    productCode: 'WPRO-001',
                    target: 5000,
                    produced: 3250
                }
            };

            const shiftProblems = allProblems.slice(0, 5).map(p => ({
                ...p,
                id: p.id!,
                date: p.createdAt ? format(new Date(p.createdAt), 'yyyy-MM-dd') : 'N/A',
                line: p.productionLine?.split('/').pop() || 'N/A',
                machine: 'Unknown',
                description: p.comment || 'No description',
                priority: 'Medium' as const,
                status: p.status as Problem['status'] || 'Open',
                shiftId: id
            }));

            setShift(enrichedShift);
            setProblems(shiftProblems);
        } catch (error) {
            console.error("Failed to get shift data:", error);
            setShift(null);
            setProblems([]);
        } finally {
            setLoading(false);
        }
    }
    
    getData(shiftId);
  }, [shiftId]);

  return { shift, problems, loading };
}

function ShiftDetailsHeader({ shift, loading }: { shift: Shift | null, loading: boolean}) {
    const { t } = useTranslation();
    if (loading) {
        return <Skeleton className="h-8 w-64" />
    }
    return (
        <>
            <h1 className="text-3xl font-bold tracking-tight">
                {t('shift_dashboard')}: {shift?.name}
            </h1>
            <p className="text-muted-foreground">
                {t('shift_details_for_date', { date: shift?.date || '...' })}
            </p>
        </>
    );
}

function ShiftInfoCards({ shift, loading }: { shift: Shift | null, loading: boolean}) {
    const { t } = useTranslation();
    const cardData = [
        { id: 'line', titleKey: 'production_line', value: shift?.line, icon: Package },
        { id: 'date', titleKey: 'shift_date', value: shift?.date, icon: Calendar },
        { id: 'supervisor', titleKey: 'supervisor', value: shift?.supervisor, icon: Users },
        { id: 'status', titleKey: 'status', value: shift?.status, icon: CheckCircle, isBadge: true },
    ];

    if (loading) {
        return (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({length: 4}).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                           <Skeleton className="h-4 w-20" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-6 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cardData.map(card => (
                 <Card key={card.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t(card.titleKey)}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        {card.isBadge && shift?.status ? (
                            <Badge variant={shift.status === 'Completed' ? 'default' : 'secondary'} className={shift.status === 'Completed' ? 'bg-green-600' : ''}>{shift.status}</Badge>
                        ) : (
                           <div className="text-2xl font-bold">{card.value}</div>
                        )}
                    </CardContent>
                 </Card>
            ))}
        </div>
    )
}

function WorkCardDetails({ workCard, loading }: { workCard: Shift['workCard'] | undefined, loading: boolean }) {
    const { t } = useTranslation();
    const progress = workCard ? (workCard.produced / workCard.target) * 100 : 0;

    if (loading || !workCard) {
        return (
            <Card className="col-span-4 shadow-lg">
                <CardHeader><CardTitle>{t('work_card_details')}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-28" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card className="col-span-4 shadow-lg">
            <CardHeader><CardTitle>{t('work_card_details')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm">{t('product')}</h4>
                        <p className="text-muted-foreground">{workCard.productName}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">{t('product_code')}</h4>
                        <p className="text-muted-foreground">{workCard.productCode}</p>
                    </div>
               </div>
               <div>
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-sm">{t('production_target')}</h4>
                         <span className="text-sm font-semibold">{workCard.produced} / {workCard.target} {t('units')}</span>
                    </div>
                    <Progress value={progress} />
               </div>
            </CardContent>
        </Card>
    )
}

function ShiftProblems({ problems, loading }: { problems: Problem[], loading: boolean }) {
    const { t } = useTranslation();
    return (
        <Card className="col-span-3 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{t('shift_problems')}</span>
                    <AlertCircle className="h-5 w-5 text-destructive" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : problems.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('machine')}</TableHead>
                            <TableHead>{t('issue')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {problems.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.machine}</TableCell>
                                <TableCell className="truncate max-w-[100px]">{p.description}</TableCell>
                                <TableCell>
                                     <span className={cn("flex items-center gap-2 text-xs", {
                                        "text-green-600": p.status === "Resolved",
                                        "text-yellow-600": p.status === "In Progress",
                                        "text-red-600": p.status === "Open",
                                    })}>
                                        <span className="h-2 w-2 rounded-full bg-current" />
                                        {p.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <Frown className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="mt-2">{t('no_problems_reported')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


function ShiftDetailsPageContent() {
  const params = useParams();
  const { id } = params;
  const { t } = useTranslation();
  const { shift, problems, loading } = useShiftData(id as string);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
            <div>
               <ShiftDetailsHeader shift={shift} loading={loading} />
            </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> {t('add_problem')}
          </Button>
        </div>

        <ShiftInfoCards shift={shift} loading={loading} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <WorkCardDetails workCard={shift?.workCard} loading={loading} />
            <ShiftProblems problems={problems} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ShiftDetailsPage() {
    return (
        <PrivateRoute>
            <ShiftDetailsPageContent />
        </PrivateRoute>
    )
}
