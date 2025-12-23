import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QualificationComplianceView } from "@/components/employee/professional/QualificationComplianceView";
import { EmployeeMembershipsTab } from "@/components/employee/EmployeeMembershipsTab";
import { GraduationCap, Users, FileCheck } from "lucide-react";

interface EmployeeCredentialsMembershipsTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeCredentialsMembershipsTab({ employeeId, viewType = "hr" }: EmployeeCredentialsMembershipsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Credentials & Memberships
        </CardTitle>
        <CardDescription>
          Compliance status of certifications, licenses, and professional memberships
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="compliance" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Qualifications Compliance
            </TabsTrigger>
            <TabsTrigger value="memberships" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Memberships
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compliance">
            <QualificationComplianceView employeeId={employeeId} viewType={viewType} />
          </TabsContent>

          <TabsContent value="memberships">
            <EmployeeMembershipsTab employeeId={employeeId} viewType={viewType} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
