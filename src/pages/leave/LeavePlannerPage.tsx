import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LeavePlannerCalendar } from "@/components/leave/LeavePlannerCalendar";
import { useLanguage } from "@/hooks/useLanguage";

export default function LeavePlannerPage() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.leave"), href: "/leave" },
          { label: "Leave Planner" }
        ]} />

        <LeavePlannerCalendar />
      </div>
    </AppLayout>
  );
}
