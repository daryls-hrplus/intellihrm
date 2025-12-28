import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Wallet } from "lucide-react";
import { TeamLeaveCalendar } from "@/components/leave/TeamLeaveCalendar";
import { TeamMemberBalances } from "@/components/mss/TeamMemberBalances";
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

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Team Calendar
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Team Balances
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <TeamLeaveCalendar />
          </TabsContent>

          <TabsContent value="balances">
            <TeamMemberBalances />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
