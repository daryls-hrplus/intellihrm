import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Baby, Users } from "lucide-react";
import { EmployeeBenefitPlansTab } from "./EmployeeBenefitPlansTab";
import { EmployeeDependentsTab } from "./EmployeeDependentsTab";
import { EmployeeBeneficiariesTab } from "./EmployeeBeneficiariesTab";

interface EmployeeBenefitsTabProps {
  employeeId: string;
}

export function EmployeeBenefitsTab({ employeeId }: EmployeeBenefitsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Benefits
        </CardTitle>
        <CardDescription>
          Manage benefit enrollments, dependents, and beneficiaries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Benefit Plans
            </TabsTrigger>
            <TabsTrigger value="dependents" className="flex items-center gap-2">
              <Baby className="h-4 w-4" />
              Dependents
            </TabsTrigger>
            <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Beneficiaries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-4">
            <EmployeeBenefitPlansTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="dependents" className="mt-4">
            <EmployeeDependentsTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="beneficiaries" className="mt-4">
            <EmployeeBeneficiariesTab employeeId={employeeId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
