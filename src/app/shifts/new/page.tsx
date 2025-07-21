'use client'

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
import { productionLines, users } from "@/lib/data";
import { DatePickerDemo } from "@/components/date-picker-demo";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function NewShiftPage() {
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Shift Created Successfully",
            description: "The new production shift has been scheduled.",
        });
        router.push("/");
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
                  <Select>
                    <SelectTrigger id="production-line">
                      <SelectValue placeholder="Select a production line" />
                    </SelectTrigger>
                    <SelectContent>
                      {productionLines.map((line) => (
                        <SelectItem key={line.id} value={line.id}>
                          {line.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Select>
                    <SelectTrigger id="supervisor">
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
                    <Input id="work-card" placeholder="e.g., WC-2024-07-453" />
                </div>

                <Button type="submit" className="w-full">
                  Create Shift
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
