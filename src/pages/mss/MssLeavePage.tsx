import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Calendar } from "lucide-react";
import { TeamLeaveCalendar } from "@/components/leave/TeamLeaveCalendar";

export default function MssLeavePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Manager Self Service", href: "/mss" },
            { label: "Team Leave Calendar" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Leave Calendar</h1>
            <p className="text-muted-foreground">View your team's leave schedules and availability</p>
          </div>
        </div>

        <TeamLeaveCalendar />
      </div>
    </AppLayout>
  );
}
