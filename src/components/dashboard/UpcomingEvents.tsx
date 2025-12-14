import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, GraduationCap, PartyPopper, Megaphone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  meeting: { icon: Users, color: "bg-primary/10 text-primary border-primary/20" },
  training: { icon: GraduationCap, color: "bg-info/10 text-info border-info/20" },
  event: { icon: PartyPopper, color: "bg-warning/10 text-warning border-warning/20" },
  announcement: { icon: Megaphone, color: "bg-success/10 text-success border-success/20" },
  leave: { icon: Calendar, color: "bg-muted text-muted-foreground border-border" },
  holiday: { icon: PartyPopper, color: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function UpcomingEvents() {
  const { t } = useTranslation();
  const { company } = useAuth();

  const { data: events, isLoading } = useQuery({
    queryKey: ["upcoming-events", company?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      
      // Fetch calendar events
      const { data: calendarEvents, error: calendarError } = await supabase
        .from("team_calendar_events")
        .select("id, title, event_type, start_date, start_time, all_day")
        .eq("company_id", company?.id)
        .gte("start_date", today)
        .order("start_date", { ascending: true })
        .limit(4);

      if (calendarError) throw calendarError;

      // Fetch upcoming announcements
      const { data: announcements, error: annError } = await supabase
        .from("company_announcements")
        .select("id, title, publish_at, priority")
        .eq("company_id", company?.id)
        .eq("is_active", true)
        .gte("publish_at", today)
        .order("publish_at", { ascending: true })
        .limit(2);

      if (annError) throw annError;

      // Combine and format events
      const formattedEvents = [
        ...(calendarEvents || []).map(event => ({
          id: event.id,
          title: event.title,
          date: event.start_date,
          time: event.start_time,
          type: event.event_type || "event",
          allDay: event.all_day,
        })),
        ...(announcements || []).map(ann => ({
          id: ann.id,
          title: ann.title,
          date: ann.publish_at?.split("T")[0],
          time: null,
          type: "announcement",
          allDay: true,
        })),
      ];

      // Sort by date and limit
      return formattedEvents
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 4);
    },
    enabled: !!company?.id,
  });

  const formatEventDate = (dateStr: string, time: string | null, allDay: boolean) => {
    const date = parseISO(dateStr);
    
    if (isToday(date)) {
      return time && !allDay ? `Today, ${time}` : "Today";
    }
    if (isTomorrow(date)) {
      return time && !allDay ? `Tomorrow, ${time}` : "Tomorrow";
    }
    return time && !allDay ? `${format(date, "MMM d, yyyy")}, ${time}` : format(date, "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "400ms" }}>
        <h3 className="mb-4 text-lg font-semibold text-card-foreground">
          {t("dashboard.upcomingEvents", "Upcoming Events")}
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">
          {t("dashboard.upcomingEvents", "Upcoming Events")}
        </h3>
        <button className="text-sm font-medium text-primary hover:underline">
          {t("dashboard.viewCalendar", "View calendar")}
        </button>
      </div>
      <div className="space-y-3">
        {events && events.length > 0 ? (
          events.map((event) => {
            const iconConfig = EVENT_ICONS[event.type] || EVENT_ICONS.event;
            const Icon = iconConfig.icon;
            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-sm",
                  iconConfig.color
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{event.title}</p>
                  <p className="text-sm opacity-80">
                    {formatEventDate(event.date, event.time, event.allDay)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("dashboard.noUpcomingEvents", "No upcoming events")}
          </p>
        )}
      </div>
    </div>
  );
}
