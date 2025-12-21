import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cog } from "lucide-react";

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
        <Card><CardHeader><CardTitle>System Settings</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure system-wide settings</p></CardContent></Card>
      </div>
    </AppLayout>
  );
}
