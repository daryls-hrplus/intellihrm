import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface Props {
  maternityRequestId: string;
  companyId: string;
  employeeId: string;
  plannedReturnDate?: string;
}

export function MaternityReturnPlanForm({ maternityRequestId, plannedReturnDate }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Return-to-Work Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Phased return planning functionality coming soon
        </p>
      </CardContent>
    </Card>
  );
}
