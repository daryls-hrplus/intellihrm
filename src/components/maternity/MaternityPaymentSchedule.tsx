import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import type { MaternityLeaveRequest } from "@/types/maternityLeave";

interface Props {
  maternityRequestId: string;
  companyId: string;
  employeeId: string;
  request: MaternityLeaveRequest;
}

export function MaternityPaymentSchedule({ request }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Payment schedule functionality coming soon
        </p>
      </CardContent>
    </Card>
  );
}
