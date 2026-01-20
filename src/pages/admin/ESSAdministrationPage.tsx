import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageAudit } from "@/hooks/usePageAudit";
import { useSearchParams, NavLink } from "react-router-dom";
import { useUserAccessibleCompanies } from "@/hooks/useUserAccessibleCompanies";
import { ESSModuleEnablementTab } from "@/components/admin/ess/ESSModuleEnablementTab";
import { ESSApprovalPoliciesTab } from "@/components/admin/ess/ESSApprovalPoliciesTab";
import { ESSFieldPermissionsTab } from "@/components/admin/ess/ESSFieldPermissionsTab";
import { ESSSetupWizard } from "@/components/admin/ess/ESSSetupWizard";
import { 
  Users, 
  ShieldCheck, 
  Wand2,
  Settings2,
  FileEdit,
  Info,
  Building2
} from "lucide-react";

export default function ESSAdministrationPage() {
  usePageAudit('ess_administration', 'Admin');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  
  const { companies: accessibleCompanies, isLoading: companiesLoading } = useUserAccessibleCompanies();
  
  const currentTab = searchParams.get('tab') || 'modules';
  
  // Default to current company on load
  useEffect(() => {
    if (accessibleCompanies.length > 0 && !selectedCompanyId) {
      const currentCompany = accessibleCompanies.find(c => c.isCurrentCompany);
      setSelectedCompanyId(currentCompany?.id || accessibleCompanies[0].id);
    }
  }, [accessibleCompanies, selectedCompanyId]);
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "ESS Administration" },
          ]}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
              <Users className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ESS Administration</h1>
              <p className="text-muted-foreground">
                Configure Employee Self-Service access, approvals, and field permissions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {accessibleCompanies.length > 0 && (
              <Select 
                value={selectedCompanyId || ""} 
                onValueChange={setSelectedCompanyId}
                disabled={companiesLoading}
              >
                <SelectTrigger className="w-[280px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {accessibleCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.code} - {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => setShowWizard(true)} variant="outline">
              <Wand2 className="h-4 w-4 mr-2" />
              Setup Wizard
            </Button>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>ESS Administration</strong> controls what employees can view and update about themselves in self-service.
            For module access approvals (when users request access to Leave, Workforce, etc.), see{" "}
            <NavLink to="/admin/auto-approval" className="text-primary underline hover:no-underline">
              Access Request Auto-Approval
            </NavLink>.
          </AlertDescription>
        </Alert>
        
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Module Enablement
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Approval Policies
            </TabsTrigger>
            <TabsTrigger value="fields" className="flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              Field Permissions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules">
            <ESSModuleEnablementTab companyId={selectedCompanyId} />
          </TabsContent>
          
          <TabsContent value="policies">
            <ESSApprovalPoliciesTab companyId={selectedCompanyId} />
          </TabsContent>
          
          <TabsContent value="fields">
            <ESSFieldPermissionsTab companyId={selectedCompanyId} />
          </TabsContent>
        </Tabs>
        
        <ESSSetupWizard 
          open={showWizard} 
          onOpenChange={setShowWizard}
          selectedCompanyId={selectedCompanyId}
          companies={accessibleCompanies}
          onCompanyChange={setSelectedCompanyId}
        />
      </div>
    </AppLayout>
  );
}
