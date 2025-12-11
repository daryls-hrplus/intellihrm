import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock, Users, ExternalLink } from "lucide-react";

const upcomingSessions = [
  {
    id: "1",
    title: "Introduction to Company Policies",
    instructor: "HR Department",
    date: "2025-01-15",
    time: "10:00 AM",
    duration: "1 hour",
    attendees: 25,
    type: "Webinar",
  },
  {
    id: "2",
    title: "Leadership Skills Workshop",
    instructor: "Training Team",
    date: "2025-01-18",
    time: "2:00 PM",
    duration: "2 hours",
    attendees: 15,
    type: "Workshop",
  },
  {
    id: "3",
    title: "Safety Procedures Training",
    instructor: "HSE Department",
    date: "2025-01-20",
    time: "9:00 AM",
    duration: "1.5 hours",
    attendees: 40,
    type: "Webinar",
  },
];

export default function LiveSessionsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Training", href: "/training" },
            { label: "Live Sessions" },
          ]}
        />
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Video className="h-5 w-5 text-info" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Live Sessions
              </h1>
              <p className="text-muted-foreground">
                Upcoming webinars and workshops
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {upcomingSessions.map((session) => (
            <Card key={session.id} className="animate-slide-up">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription>Instructor: {session.instructor}</CardDescription>
                  </div>
                  <Badge variant="secondary">{session.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {session.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {session.time} ({session.duration})
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {session.attendees} registered
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm">
                    Register
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Add to Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {upcomingSessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No upcoming sessions</h3>
              <p className="text-muted-foreground mt-1">
                Check back later for scheduled webinars and workshops.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
