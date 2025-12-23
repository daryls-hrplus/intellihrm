import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeWorkPermitsTab } from "@/components/employee/EmployeeWorkPermitsTab";
import { EmployeeCSMETab } from "./EmployeeCSMETab";
import { EmployeeTravelDocumentsTab } from "./EmployeeTravelDocumentsTab";
import { EmployeeEmergencyPlanSection } from "./EmployeeEmergencyPlanSection";
import { FileCheck, Award, Plane, AlertTriangle } from "lucide-react";

interface EmployeeImmigrationTabProps {
  employeeId: string;
  viewType?: "hr" | "manager" | "ess";
}

export function EmployeeImmigrationTab({ employeeId, viewType = "hr" }: EmployeeImmigrationTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Immigration
        </CardTitle>
        <CardDescription>
          Work permits, CSME certificates, travel documents, and emergency planning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="work_permits" className="w-full">
          <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="work_permits" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Work Permits
            </TabsTrigger>
            <TabsTrigger value="csme" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              CSME Certificates
            </TabsTrigger>
            <TabsTrigger value="travel" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Travel Documents
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergency Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="work_permits">
            <EmployeeWorkPermitsTab employeeId={employeeId} viewType={viewType} />
          </TabsContent>

          <TabsContent value="csme">
            <EmployeeCSMETab employeeId={employeeId} viewType={viewType} />
          </TabsContent>

          <TabsContent value="travel">
            <EmployeeTravelDocumentsTab employeeId={employeeId} viewType={viewType} />
          </TabsContent>

          <TabsContent value="emergency">
            <EmployeeEmergencyPlanSection employeeId={employeeId} viewType={viewType} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
