import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeWorkPermitsTab } from "@/components/employee/EmployeeWorkPermitsTab";
import { EmployeeBackgroundChecksTab } from "@/components/employee/EmployeeBackgroundChecksTab";
import { EmployeeCertificateOfCharacterTab } from "@/components/employee/professional/EmployeeCertificateOfCharacterTab";
import { EmployeeRegulatoryTab } from "@/components/employee/professional/EmployeeRegulatoryTab";
import { FileCheck, ShieldCheck, FileText, Stamp } from "lucide-react";

interface EmployeeComplianceLegalTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeComplianceLegalTab({ employeeId, viewType = "hr" }: EmployeeComplianceLegalTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Compliance & Legal
        </CardTitle>
        <CardDescription>
          Work permits, background checks, certificates of character, and regulatory clearances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="work_permits" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="work_permits" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Work Permits
            </TabsTrigger>
            <TabsTrigger value="background" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Background Checks
            </TabsTrigger>
            <TabsTrigger value="character" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Certificate of Character
            </TabsTrigger>
            <TabsTrigger value="regulatory" className="flex items-center gap-2">
              <Stamp className="h-4 w-4" />
              Regulatory Clearances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="work_permits">
            <EmployeeWorkPermitsTab employeeId={employeeId} viewType={viewType} />
          </TabsContent>

          <TabsContent value="background">
            <EmployeeBackgroundChecksTab employeeId={employeeId} viewType={viewType} />
          </TabsContent>

          <TabsContent value="character">
            <EmployeeCertificateOfCharacterTab employeeId={employeeId} viewType={viewType} />
          </TabsContent>

          <TabsContent value="regulatory">
            <EmployeeRegulatoryTab employeeId={employeeId} viewType={viewType} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}