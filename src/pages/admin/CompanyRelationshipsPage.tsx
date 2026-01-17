import { AppLayout } from "@/components/layout/AppLayout";
import { usePageAudit } from "@/hooks/usePageAudit";
import { CompanyRelationshipsManager } from "@/components/admin/company-relationships/CompanyRelationshipsManager";
import { GitBranch } from "lucide-react";

export default function CompanyRelationshipsPage() {
  usePageAudit("company_relationships", "Admin");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Company Reporting Relationships
              </h1>
              <p className="text-muted-foreground">
                Configure cross-company reporting rules for corporate groups, joint ventures, and managed services
              </p>
            </div>
          </div>
        </div>

        <CompanyRelationshipsManager />
      </div>
    </AppLayout>
  );
}
