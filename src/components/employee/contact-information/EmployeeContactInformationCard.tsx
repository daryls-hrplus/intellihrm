import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, AlertTriangle, Phone } from "lucide-react";
import { PersonalContactTab } from "./PersonalContactTab";
import { WorkContactTab } from "./WorkContactTab";
import { EmergencyContactTab } from "./EmergencyContactTab";
import { useAuth } from "@/contexts/AuthContext";

interface EmployeeContactInformationCardProps {
  employeeId: string;
}

export function EmployeeContactInformationCard({ employeeId }: EmployeeContactInformationCardProps) {
  const { user, isAdmin, isHRManager, roles } = useAuth();

  // Determine edit permissions based on role
  const isOwnProfile = user?.id === employeeId;
  const isHRorAdmin = isAdmin || isHRManager;
  const isIT = roles.includes("admin"); // IT typically has admin role

  // Personal & Emergency: editable by employee (ESS) or HR/Admin
  const canEditPersonal = isOwnProfile || isHRorAdmin;
  const canEditEmergency = isOwnProfile || isHRorAdmin;
  
  // Work: only editable by HR/Admin or IT
  const canEditWork = isHRorAdmin || isIT;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="work" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Work</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Emergency</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-0">
            <PersonalContactTab employeeId={employeeId} canEdit={canEditPersonal} />
          </TabsContent>

          <TabsContent value="work" className="mt-0">
            <WorkContactTab employeeId={employeeId} canEdit={canEditWork} />
          </TabsContent>

          <TabsContent value="emergency" className="mt-0">
            <EmergencyContactTab employeeId={employeeId} canEdit={canEditEmergency} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
