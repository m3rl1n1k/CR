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
import { PlusCircle, AlertCircle, Package, Calendar, Users, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { getShift, getProblems } from "@/lib/api";
import { Problem, Shift } from "@/lib/data";
import { format } from "date-fns";

async function getData(shiftId: string): Promise<{shift: Shift | null, problems: Problem[]}> {
    try {
        const shiftPromise = getShift(shiftId);
        const problemsPromise = getProblems(); // API doesn't support filtering problems by shift

        const [shift, allProblems] = await Promise.all([shiftPromise, problemsPromise]);
        
        // Mocking data not available in API for a richer UI
        const enrichedShift = shift ? {
            ...shift,
            id: shiftId,
            name: `Shift ${shiftId}`,
            line: shift.productionLine?.split('/').pop() || `Line ${shiftId}`,
            date: format(new Date(), 'yyyy-MM-dd'),
            supervisor: "Jane Doe",
            status: 'In Progress' as const,
            workCard: {
                id: `wc-${shiftId}`,
                productName: 'Widget Pro',
                productCode: 'WPRO-001',
                target: 5000,
                produced: 3250
            }
        } : null;

        // Since we can't filter by shiftId from the API, we will just show a few recent problems.
        const problems = allProblems.slice(0, 5).map(p => ({
            ...p,
            id: p.id,
            date: p.createdAt ? format(new Date(p.createdAt), 'yyyy-MM-dd') : 'N/A',
            line: p.productionLine?.split('/').pop() || 'N/A',
            machine: 'Unknown',
            description: p.comment || 'No description',
            priority: 'Medium' as const,
            status: p.status as Problem['status'] || 'Open',
            shiftId: shiftId
        }));
        
        return { shift: enrichedShift, problems };

    } catch (error) {
        console.error("Failed to fetch shift details:", error);
        return { shift: null, problems: [] };
    }
}


export default async function ShiftDetailsPage({ params }: { params: { id: string } }) {
  const { shift, problems: shiftProblems } = await getData(params.id);
  
  if (!shift) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Shift Dashboard: {shift.name}
                </h1>
                <p className="text-muted-foreground">
                    Details for production shift on {shift.date}
                </p>
            </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Problem
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Production Line</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{shift.line}</div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Shift Date</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{shift.date}</div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Supervisor</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{shift.supervisor}</div>
                </CardContent>
             </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                    <Badge variant={shift.status === 'Completed' ? 'default' : 'secondary'} className={shift.status === 'Completed' ? 'bg-green-600' : ''}>{shift.status}</Badge>
                </CardContent>
             </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-lg">
                <CardHeader>
                    <CardTitle>Work Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm">Product</h4>
                            <p className="text-muted-foreground">{shift.workCard.productName}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Product Code</h4>
                            <p className="text-muted-foreground">{shift.workCard.productCode}</p>
                        </div>
                   </div>
                   <div>
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-sm">Production Target</h4>
                             <span className="text-sm font-semibold">{shift.workCard.produced} / {shift.workCard.target} Units</span>
                        </div>
                        <Progress value={(shift.workCard.produced / shift.workCard.target) * 100} />
                   </div>
                </CardContent>
            </Card>

            <Card className="col-span-3 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Shift Problems</span>
                        <AlertCircle className="h-5 w-5 text-destructive" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {shiftProblems.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Machine</TableHead>
                                <TableHead>Issue</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shiftProblems.map(p => (
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
                            No problems reported for this shift.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
