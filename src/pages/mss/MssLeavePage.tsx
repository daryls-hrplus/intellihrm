import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Calendar } from "lucide-react";
import { TeamLeaveCalendar } from "@/components/leave/TeamLeaveCalendar";
import { useLanguage } from "@/hooks/useLanguage";

export default function MssLeavePage() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("mss.title"), href: "/mss" },
            { label: t("mss.teamLeave.breadcrumb") },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("mss.teamLeave.title")}</h1>
            <p className="text-muted-foreground">{t("mss.teamLeave.subtitle")}</p>
          </div>
        </div>

        <TeamLeaveCalendar />
      </div>
    </AppLayout>
  );
}
