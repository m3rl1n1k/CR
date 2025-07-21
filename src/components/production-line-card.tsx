import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductionLine } from "@/lib/data";

interface ProductionLineCardProps {
  line: ProductionLine;
}

export function ProductionLineCard({ line }: ProductionLineCardProps) {
  const statusConfig = {
    Running: {
      color: "bg-green-500",
      text: "Running",
    },
    Idle: {
      color: "bg-yellow-500",
      text: "Idle",
    },
    Stopped: {
      color: "bg-red-500",
      text: "Stopped",
    },
  };

  return (
    <Card className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{line.name}</span>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-3 w-3 rounded-full animate-pulse",
                statusConfig[line.status].color
              )}
            />
            <Badge variant="outline">{statusConfig[line.status].text}</Badge>
          </div>
        </CardTitle>
        <CardDescription>OEE: {line.oee}%</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div>
            <h4 className="text-sm font-medium">Current Product</h4>
            <p className="text-sm text-muted-foreground">
              {line.currentProduct}
            </p>
          </div>
          <div>
            <div className="flex justify-between text-sm">
                <span className="font-medium">Shift Progress</span>
                <span className="text-muted-foreground">{line.shiftProgress}%</span>
            </div>
            <Progress value={line.shiftProgress} className="h-2 mt-1" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/shifts/${line.currentShiftId}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Shift Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
