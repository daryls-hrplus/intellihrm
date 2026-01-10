import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CompensationFTEReconciliation } from "@/components/compensation/CompensationFTEReconciliation";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";

export default function CompensationFTEReconciliationPage() {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("compensation.title", "Compensation"), href: "/compensation" },
            { label: t("compensation.reconciliation.title", "FTE Reconciliation") },
          ]}
        />

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("compensation.reconciliation.title", "FTE-Compensation Reconciliation")}
            </h1>
            <p className="text-muted-foreground">
              {t("compensation.reconciliation.pageDescription", "Identify and resolve discrepancies between seat FTE allocations and compensation records")}
            </p>
          </div>
        </div>

        <CompensationFTEReconciliation />
      </div>
    </AppLayout>
  );
}
