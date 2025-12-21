import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolesListTab } from "@/components/roles/RolesListTab";
import { PermissionTemplatesTab } from "@/components/roles/PermissionTemplatesTab";
import { AccessPoliciesTab } from "@/components/roles/AccessPoliciesTab";
import { Shield, FileText, Settings } from "lucide-react";

const breadcrumbItems = [
  { label: "Admin", href: "/admin" },
  { label: "Role Management" },
];

export default function RoleManagementPage() {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage roles, access levels, admin visibility, and sensitive data permissions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Policies</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="mt-6">
            <RolesListTab />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <PermissionTemplatesTab />
          </TabsContent>

          <TabsContent value="policies" className="mt-6">
            <AccessPoliciesTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
