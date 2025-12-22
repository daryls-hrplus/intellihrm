import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeCertificatesTab } from "@/components/employee/EmployeeCertificatesTab";
import { EmployeeMembershipsTab } from "@/components/employee/EmployeeMembershipsTab";
import { GraduationCap, Heart } from "lucide-react";

interface EmployeeCredentialsMembershipsTabProps {
  employeeId: string;
}

export function EmployeeCredentialsMembershipsTab({ employeeId }: EmployeeCredentialsMembershipsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Credentials & Memberships
        </CardTitle>
        <CardDescription>
          Professional certifications and organization memberships
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="certificates" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="memberships" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Memberships
            </TabsTrigger>
          </TabsList>

          <TabsContent value="certificates">
            <EmployeeCertificatesTab employeeId={employeeId} />
          </TabsContent>

          <TabsContent value="memberships">
            <EmployeeMembershipsTab employeeId={employeeId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
