import { Calendar, Users, GraduationCap, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

const events = [
  {
    id: 1,
    title: "Quarterly Review Meeting",
    date: "Today, 2:00 PM",
    type: "meeting",
    icon: Users,
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: 2,
    title: "Leadership Training",
    date: "Tomorrow, 9:00 AM",
    type: "training",
    icon: GraduationCap,
    color: "bg-info/10 text-info border-info/20",
  },
  {
    id: 3,
    title: "Team Building Event",
    date: "Dec 15, 2024",
    type: "event",
    icon: PartyPopper,
    color: "bg-warning/10 text-warning border-warning/20",
  },
  {
    id: 4,
    title: "Annual Performance Reviews",
    date: "Dec 18, 2024",
    type: "review",
    icon: Calendar,
    color: "bg-success/10 text-success border-success/20",
  },
];

export function UpcomingEvents() {
  return (
    <div className="rounded-xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">Upcoming Events</h3>
        <button className="text-sm font-medium text-primary hover:underline">View calendar</button>
      </div>
      <div className="space-y-3">
        {events.map((event) => {
          const Icon = event.icon;
          return (
            <div
              key={event.id}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-sm",
                event.color
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{event.title}</p>
                <p className="text-sm opacity-80">{event.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
