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
import { problems } from "@/lib/data";
import { DatePickerWithRange } from "@/components/date-picker-with-range";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ProblemsPage() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Problem Reporting
            </h1>
            <p className="text-muted-foreground">
              View and filter production problems reported on the line.
            </p>
          </div>
          <DatePickerWithRange />
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Reported Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
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
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
