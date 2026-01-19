import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { usePageAudit } from "@/hooks/usePageAudit";
import { useSearchParams } from "react-router-dom";
import { ESSModuleEnablementTab } from "@/components/admin/ess/ESSModuleEnablementTab";
import { ESSApprovalPoliciesTab } from "@/components/admin/ess/ESSApprovalPoliciesTab";
import { ESSFieldPermissionsTab } from "@/components/admin/ess/ESSFieldPermissionsTab";
import { ESSSetupWizard } from "@/components/admin/ess/ESSSetupWizard";
import { 
  Users, 
  ShieldCheck, 
  Wand2,
  Settings2,
  FileEdit
} from "lucide-react";

export default function ESSAdministrationPage() {
  usePageAudit('ess_administration', 'Admin');
  const [searchParams, setSearchParams] = useSearchParams();
  const [showWizard, setShowWizard] = useState(false);
  
  const currentTab = searchParams.get('tab') || 'modules';
  
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
          <Button onClick={() => setShowWizard(true)} variant="outline">
            <Wand2 className="h-4 w-4 mr-2" />
            Setup Wizard
          </Button>
        </div>
        
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
            <ESSModuleEnablementTab />
          </TabsContent>
          
          <TabsContent value="policies">
            <ESSApprovalPoliciesTab />
          </TabsContent>
          
          <TabsContent value="fields">
            <ESSFieldPermissionsTab />
          </TabsContent>
        </Tabs>
        
        <ESSSetupWizard open={showWizard} onOpenChange={setShowWizard} />
      </div>
    </AppLayout>
  );
}
