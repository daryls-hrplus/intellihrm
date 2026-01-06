import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MaternityLeaveDashboard } from "@/components/maternity/MaternityLeaveDashboard";
import { useLanguage } from "@/hooks/useLanguage";

export default function MaternityLeavePage() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("leave.title"), href: "/leave" },
            { label: "Maternity Leave" },
          ]}
        />
        <MaternityLeaveDashboard />
      </div>
    </AppLayout>
  );
}
