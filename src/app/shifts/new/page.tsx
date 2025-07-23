'use client'

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerDemo } from "@/components/date-picker-demo";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createShift, getProductionLines, getUsers } from "@/lib/api";
import { ProductionLine, User } from "@/lib/data";
import { useTranslation } from "@/hooks/use-translation";
import { PrivateRoute } from "@/components/auth/private-route";

function NewShiftPageContent() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [productionLines, setProductionLines] = React.useState<ProductionLine[]>([]);
    const [users, setUsers] = React.useState<User[]>([]);
    const [selectedLine, setSelectedLine] = React.useState<string>("");
    const { t } = useTranslation();

    React.useEffect(() => {
      async function fetchData() {
        try {
          const [lines, fetchedUsers] = await Promise.all([getProductionLines(), getUsers()]);
          setProductionLines(lines);
          setUsers(fetchedUsers.map(u => ({...u, id: u.personalNumber || '', role: 'Supervisor'})));
        } catch (error) {
          console.error("Failed to fetch initial data", error);
          toast({
            title: t('error'),
            description: t('fetch_data_error'),
            variant: "destructive"
          })
        }
      }
      fetchData();
    }, [toast, t]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLine) {
            toast({
                title: t('error'),
                description: t('select_production_line_error'),
                variant: "destructive"
            });
            return;
        }
        setIsSubmitting(true);
        
        try {
            const newShift = await createShift({ productionLine: `/production_lines/${selectedLine}`, problem: null });

            if (newShift) {
                 toast({
                    title: t('shift_created_success'),
                    description: t('shift_created_success_desc'),
                });
                router.push(`/shifts/${newShift.id}`);
            } else {
                 toast({
                    title: t('error'),
                    description: t('create_shift_error'),
                    variant: "destructive"
                });
                setIsSubmitting(false);
            }
        } catch (error) {
             toast({
                title: t('error'),
                description: t('create_shift_unexpected_error'),
                variant: "destructive"
            });
            setIsSubmitting(false);
        }
    }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('create_new_shift')}</CardTitle>
              <CardDescription>
                {t('create_new_shift_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="production-line">{t('production_line')}</Label>
                  <Select onValueChange={setSelectedLine} value={selectedLine}>
                    <SelectTrigger id="production-line">
                      <SelectValue placeholder={t('select_production_line_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {productionLines.map((line) => (
                        <SelectItem key={line.lineCode} value={line.lineCode!}>
                          {line.lineName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisor">{t('supervisor')}</Label>
                  <Select>
                    <SelectTrigger id="supervisor" disabled>
                      <SelectValue placeholder={t('select_supervisor_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label>{t('shift_date')}</Label>
                    <DatePickerDemo />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="work-card">{t('work_card_id')}</Label>
                    <Input id="work-card" placeholder="e.g., WC-2024-07-453" disabled/>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('creating')}...
                    </>
                  ) : t('create_shift') }
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function NewShiftPage() {
    return (
        <PrivateRoute>
            <NewShiftPageContent />
        </PrivateRoute>
    )
}
