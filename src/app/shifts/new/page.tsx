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

export default function NewShiftPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [productionLines, setProductionLines] = React.useState<ProductionLine[]>([]);
    const [users, setUsers] = React.useState<User[]>([]);
    const [selectedLine, setSelectedLine] = React.useState<string>("");

    React.useEffect(() => {
      async function fetchData() {
        try {
          const [lines, fetchedUsers] = await Promise.all([getProductionLines(), getUsers()]);
          setProductionLines(lines);
          setUsers(fetchedUsers.map(u => ({...u, id: u.personalNumber || '', role: 'Supervisor'})));
        } catch (error) {
          console.error("Failed to fetch initial data", error);
          toast({
            title: "Error",
            description: "Failed to load data for new shift form.",
            variant: "destructive"
          })
        }
      }
      fetchData();
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLine) {
            toast({
                title: "Error",
                description: "Please select a production line.",
                variant: "destructive"
            });
            return;
        }
        setIsSubmitting(true);
        
        try {
            const newShift = await createShift({ productionLine: `/production_lines/${selectedLine}`, problem: null });

            if (newShift) {
                 toast({
                    title: "Shift Created Successfully",
                    description: "The new production shift has been scheduled.",
                });
                router.push(`/shifts/${newShift.id}`);
            } else {
                 toast({
                    title: "Error",
                    description: "Could not create a new shift. Please try again.",
                    variant: "destructive"
                });
                setIsSubmitting(false);
            }
        } catch (error) {
             toast({
                title: "Error",
                description: "An unexpected error occurred while creating the shift.",
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
              <CardTitle className="text-2xl">Create New Shift</CardTitle>
              <CardDescription>
                Fill in the details to schedule a new production shift.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="production-line">Production Line</Label>
                  <Select onValueChange={setSelectedLine} value={selectedLine}>
                    <SelectTrigger id="production-line">
                      <SelectValue placeholder="Select a production line" />
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
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Select>
                    <SelectTrigger id="supervisor" disabled>
                      <SelectValue placeholder="Select a supervisor" />
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
                    <Label>Shift Date</Label>
                    <DatePickerDemo />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="work-card">Work Card ID</Label>
                    <Input id="work-card" placeholder="e.g., WC-2024-07-453" disabled/>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                    </>
                  ) : "Create Shift" }
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
