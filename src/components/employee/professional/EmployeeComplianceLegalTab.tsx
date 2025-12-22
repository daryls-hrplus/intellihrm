import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeWorkPermitsTab } from "@/components/employee/EmployeeWorkPermitsTab";
import { EmployeeLicensesTab } from "@/components/employee/EmployeeLicensesTab";
import { EmployeeBackgroundChecksTab } from "@/components/employee/EmployeeBackgroundChecksTab";
import { FileCheck, Award, ShieldCheck } from "lucide-react";

interface EmployeeComplianceLegalTabProps {
  employeeId: string;
}

export function EmployeeComplianceLegalTab({ employeeId }: EmployeeComplianceLegalTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Compliance & Legal
        </CardTitle>
        <CardDescription>
          Work permits, licenses, and background verification records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="work_permits" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="work_permits" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Work Permits
            </TabsTrigger>
            <TabsTrigger value="licenses" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Licenses
            </TabsTrigger>
            <TabsTrigger value="background" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Background Checks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="work_permits">
            <EmployeeWorkPermitsTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="licenses">
            <EmployeeLicensesTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="background">
            <EmployeeBackgroundChecksTab employeeId={employeeId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
