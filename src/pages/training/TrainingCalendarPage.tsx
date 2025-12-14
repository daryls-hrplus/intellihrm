import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Video, BookOpen, Award } from "lucide-react";

const events = [
  {
    id: "1",
    title: "Introduction to Company Policies",
    date: new Date(2025, 0, 15),
    type: "webinar",
    time: "10:00 AM",
  },
  {
    id: "2",
    title: "Leadership Skills Workshop",
    date: new Date(2025, 0, 18),
    type: "workshop",
    time: "2:00 PM",
  },
  {
    id: "3",
    title: "Compliance Training Deadline",
    date: new Date(2025, 0, 20),
    type: "deadline",
    time: "11:59 PM",
  },
  {
    id: "4",
    title: "Safety Certification Renewal",
    date: new Date(2025, 0, 25),
    type: "certification",
    time: "All day",
  },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case "webinar":
    case "workshop":
      return Video;
    case "deadline":
      return BookOpen;
    case "certification":
      return Award;
    default:
      return CalendarIcon;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case "webinar":
      return "bg-info/10 text-info";
    case "workshop":
      return "bg-primary/10 text-primary";
    case "deadline":
      return "bg-destructive/10 text-destructive";
    case "certification":
      return "bg-warning/10 text-warning";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function TrainingCalendarPage() {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const selectedDateEvents = events.filter(
    (event) =>
      selectedDate &&
      event.date.toDateString() === selectedDate.toDateString()
  );

  const eventDates = events.map((e) => e.date.toDateString());

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("training.dashboard.title"), href: "/training" },
            { label: t("training.modules.calendar.title") },
          ]}
        />

        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <CalendarIcon className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t("training.modules.calendar.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("training.modules.calendar.description")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <Card className="animate-slide-up">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  hasEvent: (date) => eventDates.includes(date.toDateString()),
                }}
                modifiersClassNames={{
                  hasEvent: "bg-primary/20 font-bold",
                }}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </CardTitle>
              <CardDescription>
                {selectedDateEvents.length} event(s) scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => {
                    const Icon = getEventIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <div className={`rounded-lg p-2 ${getEventColor(event.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.time}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {event.type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No events scheduled for this date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>All scheduled training activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => {
                const Icon = getEventIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedDate(event.date)}
                  >
                    <div className={`rounded-lg p-2 ${getEventColor(event.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        • {event.time}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {event.type}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
