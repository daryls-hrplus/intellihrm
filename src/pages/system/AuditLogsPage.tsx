import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function AuditLogsPage() {
  usePageAudit('audit_logs', 'System');
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[{ label: "Integration & Administration", href: "/system" }, { label: "Audit Logs" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              Audit Logs
            </h1>
            <p className="text-muted-foreground">Activity log, user actions, data changes, and export</p>
          </div>
        </div>
        <Card><CardHeader><CardTitle>Activity Log</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">View all system activity</p></CardContent></Card>
      </div>
    </AppLayout>
  );
}
