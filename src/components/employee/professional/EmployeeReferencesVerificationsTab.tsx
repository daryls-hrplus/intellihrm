import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeReferencesTab } from "@/components/employee/EmployeeReferencesTab";
import { UserCheck } from "lucide-react";

interface EmployeeReferencesVerificationsTabProps {
  employeeId: string;
}

export function EmployeeReferencesVerificationsTab({ employeeId }: EmployeeReferencesVerificationsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          References & Verifications
        </CardTitle>
        <CardDescription>
          Professional references and verification records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EmployeeReferencesTab employeeId={employeeId} />
      </CardContent>
    </Card>
  );
}
