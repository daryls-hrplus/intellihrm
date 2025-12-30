import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog, LayoutDashboard, Globe, Palette, Flag } from "lucide-react";
import { DashboardConfigurationPanel } from "@/components/admin/DashboardConfigurationPanel";

export default function SystemConfigPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[{ label: "Integration & Administration", href: "/system" }, { label: "System Configuration" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Cog className="h-8 w-8 text-primary" />
              System Configuration
            </h1>
            <p className="text-muted-foreground">Company settings, localization, branding, and feature flags</p>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard Design
            </TabsTrigger>
            <TabsTrigger value="localization" className="gap-2">
              <Globe className="h-4 w-4" />
              Localization
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Flag className="h-4 w-4" />
              Feature Flags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardConfigurationPanel />
          </TabsContent>

          <TabsContent value="localization">
            <Card><CardHeader><CardTitle>Localization Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure language, date formats, and regional settings</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card><CardHeader><CardTitle>Branding Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure logo, colors, and branding elements</p></CardContent></Card>
          </TabsContent>

          <TabsContent value="features">
            <Card><CardHeader><CardTitle>Feature Flags</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Enable or disable platform features</p></CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}