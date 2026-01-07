import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function SecuritySettingsPage() {
  usePageAudit('security', 'System');
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[{ label: "Integration & Administration", href: "/system" }, { label: "Security Settings" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Security Settings
            </h1>
            <p className="text-muted-foreground">Role management, permissions, MFA settings, and session management</p>
          </div>
        </div>
        <Card><CardHeader><CardTitle>Security Configuration</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Configure security policies</p></CardContent></Card>
      </div>
    </AppLayout>
  );
}
