import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeBankAccountsTab } from "./EmployeeBankAccountsTab";
import { Building2 } from "lucide-react";

interface EmployeePayInfoTabProps {
  employeeId: string;
  companyId?: string;
}

export function EmployeePayInfoTab({ employeeId }: EmployeePayInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Bank Accounts
        </CardTitle>
        <CardDescription>Manage employee bank accounts for payroll</CardDescription>
      </CardHeader>
      <CardContent>
        <EmployeeBankAccountsTab employeeId={employeeId} />
      </CardContent>
    </Card>
  );
}
