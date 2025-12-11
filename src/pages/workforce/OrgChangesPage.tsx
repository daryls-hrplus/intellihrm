import { AppLayout } from "@/components/layout/AppLayout";
import { OrgChangesReporting } from "@/components/admin/OrgChangesReporting";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrgChangesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organizational Changes Report</h1>
            <p className="text-muted-foreground">
              Track and analyze organizational structure changes over time
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/scheduled-reports">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Report
            </Link>
          </Button>
        </div>
        <OrgChangesReporting />
      </div>
    </AppLayout>
  );
}
