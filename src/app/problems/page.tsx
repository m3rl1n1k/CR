'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Problem } from "@/lib/data";
import { DatePickerWithRange } from "@/components/date-picker-with-range";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';
import { getProblems } from '@/lib/api';
import { format } from 'date-fns';
import { Frown } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';


function useProblemsData() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const fetchedProblems = await getProblems();
        const formattedProblems = fetchedProblems.map(p => ({
            ...p,
            id: p.id!,
            date: p.createdAt ? format(new Date(p.createdAt), 'yyyy-MM-dd') : 'N/A',
            line: p.productionLine?.split('/').pop() || 'N/A',
            machine: 'Unknown',
            description: p.comment || 'No description',
            priority: 'Medium' as const,
            status: p.status as Problem['status'] || 'Open',
            shiftId: 'N/A',
        }));
        setProblems(formattedProblems);
      } catch (error) {
        console.error("Failed to fetch problems", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { problems, loading };
}

function ProblemsTable({ problems, loading }: { problems: Problem[], loading: boolean }) {
    const { t } = useTranslation();
    
    if (loading) {
        return (
            <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );
    }
    
    if (problems.length === 0) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                       <div className="flex flex-col items-center justify-center gap-2">
                          <Frown className="w-8 h-8 text-muted-foreground" />
                          <p className="font-semibold text-muted-foreground">{t('no_problems_found')}</p>
                          <p className="text-sm text-muted-foreground">{t('no_problems_found_desc')}</p>
                       </div>
                    </TableCell>
                  </TableRow>
            </TableBody>
        );
    }

    return (
        <TableBody>
            {problems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell>{problem.date}</TableCell>
                  <TableCell>{problem.line}</TableCell>
                  <TableCell>{problem.machine}</TableCell>
                  <TableCell className="max-w-xs truncate">{problem.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        problem.priority === "High"
                          ? "destructive"
                          : problem.priority === "Medium"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {problem.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                   <span className={cn("flex items-center gap-2", {
                     "text-green-600": problem.status === "Resolved",
                     "text-yellow-600": problem.status === "In Progress",
                     "text-red-600": problem.status === "Open",
                   })}>
                    <span className="h-2 w-2 rounded-full bg-current" />
                     {problem.status}
                   </span>
                  </TableCell>
                </TableRow>
            ))}
        </TableBody>
    );
}

export default function ProblemsPage() {
  const { problems, loading } = useProblemsData();
  const { t } = useTranslation();

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('problem_reporting')}
            </h1>
            <p className="text-muted-foreground">
              {t('problem_reporting_desc')}
            </p>
          </div>
          <DatePickerWithRange />
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('reported_issues')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('line')}</TableHead>
                  <TableHead>{t('machine')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead>{t('priority')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                </TableRow>
              </TableHeader>
              <ProblemsTable problems={problems} loading={loading} />
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}