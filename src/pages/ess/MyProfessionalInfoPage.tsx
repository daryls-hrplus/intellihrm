import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, GraduationCap, FileSignature, Shield, Loader2, Languages } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { EmployeeCredentialsMembershipsTab } from "@/components/employee/professional/EmployeeCredentialsMembershipsTab";
import { EmployeeAgreementsSignaturesTab } from "@/components/employee/professional/EmployeeAgreementsSignaturesTab";
import { EmployeeProfessionalHistoryTab } from "@/components/employee/professional/EmployeeProfessionalHistoryTab";
import { ComplianceStatusCard } from "@/components/ess/ComplianceStatusCard";
import { EmployeeLanguagesTab } from "@/components/employee/EmployeeLanguagesTab";

export default function MyProfessionalInfoPage() {
  const { user } = useAuth();
  const { hasTabAccess, isLoading: permissionsLoading } = useGranularPermissions();

  // ESS-specific permission checks
  const canViewCredentials = hasTabAccess("ess", "ess_credentials_memberships");
  const canViewAgreements = hasTabAccess("ess", "ess_agreements_signatures");
  const canViewHistory = hasTabAccess("ess", "ess_professional_history");
  const canViewCompliance = hasTabAccess("ess", "ess_compliance_status");
  const canViewLanguages = hasTabAccess("ess", "ess_languages");

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Please log in to view your professional information.</p>
        </CardContent>
      </Card>
    );
  }

  // Determine which tabs are visible
  const visibleTabs = [
    { id: "credentials", label: "Credentials", icon: GraduationCap, visible: canViewCredentials },
    { id: "agreements", label: "Agreements", icon: FileSignature, visible: canViewAgreements },
    { id: "history", label: "Work History", icon: Briefcase, visible: canViewHistory },
    { id: "languages", label: "Languages", icon: Languages, visible: canViewLanguages },
    { id: "compliance", label: "Compliance Status", icon: Shield, visible: canViewCompliance },
  ].filter(tab => tab.visible);

  if (visibleTabs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">You don't have access to professional information features.</p>
        </CardContent>
      </Card>
    );
  }

  const defaultTab = visibleTabs[0]?.id || "credentials";

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Professional Information</h1>
        <p className="text-muted-foreground">
          View and manage your professional credentials, agreements, and work history
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6">
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {canViewCredentials && (
          <TabsContent value="credentials">
            <EmployeeCredentialsMembershipsTab employeeId={user.id} viewType="ess" />
          </TabsContent>
        )}

        {canViewAgreements && (
          <TabsContent value="agreements">
            <EmployeeAgreementsSignaturesTab employeeId={user.id} isEssView={true} />
          </TabsContent>
        )}

        {canViewHistory && (
          <TabsContent value="history">
            <EmployeeProfessionalHistoryTab employeeId={user.id} isEssView={true} />
          </TabsContent>
        )}

        {canViewLanguages && (
          <TabsContent value="languages">
            <EmployeeLanguagesTab employeeId={user.id} viewType="ess" />
          </TabsContent>
        )}

        {canViewCompliance && (
          <TabsContent value="compliance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
                <CardDescription>
                  View the status of your compliance-related records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComplianceStatusCard employeeId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
