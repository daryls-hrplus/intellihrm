import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  Search, 
  Plus,
  Settings,
  Play,
  Monitor,
  Mic,
  MessageSquare,
  FileText,
  Link
} from "lucide-react";

interface VirtualSession {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  maxAttendees: number;
  platform: "zoom" | "teams" | "webex" | "google_meet";
  status: "scheduled" | "live" | "completed" | "cancelled";
  recordingAvailable: boolean;
}

const mockSessions: VirtualSession[] = [
  {
    id: "1",
    title: "Introduction to Company Policies",
    instructor: "Sarah Johnson",
    date: "2025-01-15",
    time: "10:00 AM",
    duration: "1 hour",
    attendees: 25,
    maxAttendees: 50,
    platform: "zoom",
    status: "scheduled",
    recordingAvailable: false,
  },
  {
    id: "2",
    title: "Leadership Skills Workshop",
    instructor: "Michael Chen",
    date: "2025-01-18",
    time: "2:00 PM",
    duration: "2 hours",
    attendees: 15,
    maxAttendees: 30,
    platform: "teams",
    status: "scheduled",
    recordingAvailable: false,
  },
  {
    id: "3",
    title: "Safety Procedures Training",
    instructor: "Emily Davis",
    date: "2025-01-10",
    time: "9:00 AM",
    duration: "1.5 hours",
    attendees: 40,
    maxAttendees: 40,
    platform: "webex",
    status: "completed",
    recordingAvailable: true,
  },
  {
    id: "4",
    title: "Customer Service Excellence",
    instructor: "James Wilson",
    date: "2025-01-12",
    time: "11:00 AM",
    duration: "1 hour",
    attendees: 28,
    maxAttendees: 35,
    platform: "google_meet",
    status: "live",
    recordingAvailable: false,
  },
];

const integrations = [
  { id: "zoom", name: "Zoom", icon: Video, connected: true, color: "bg-blue-500" },
  { id: "teams", name: "Microsoft Teams", icon: Monitor, connected: true, color: "bg-purple-500" },
  { id: "webex", name: "Cisco Webex", icon: Video, connected: false, color: "bg-green-500" },
  { id: "google_meet", name: "Google Meet", icon: Video, connected: false, color: "bg-red-500" },
];

export default function VirtualClassroomPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("sessions");

  const getStatusBadge = (status: VirtualSession["status"]) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary">{t("training.virtualClassroom.status.scheduled")}</Badge>;
      case "live":
        return <Badge className="bg-success text-success-foreground animate-pulse">{t("training.virtualClassroom.status.live")}</Badge>;
      case "completed":
        return <Badge variant="outline">{t("training.virtualClassroom.status.completed")}</Badge>;
      case "cancelled":
        return <Badge variant="destructive">{t("training.virtualClassroom.status.cancelled")}</Badge>;
    }
  };

  const getPlatformBadge = (platform: VirtualSession["platform"]) => {
    const platformNames = {
      zoom: "Zoom",
      teams: "MS Teams",
      webex: "Webex",
      google_meet: "Google Meet",
    };
    return <Badge variant="outline">{platformNames[platform]}</Badge>;
  };

  const filteredSessions = mockSessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingSessions = filteredSessions.filter(s => s.status === "scheduled" || s.status === "live");
  const pastSessions = filteredSessions.filter(s => s.status === "completed" || s.status === "cancelled");

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("training.dashboard.title"), href: "/training" },
            { label: t("training.modules.virtualClassroom.title") },
          ]}
        />
        
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Video className="h-5 w-5 text-info" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("training.modules.virtualClassroom.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("training.modules.virtualClassroom.description")}
                </p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("training.virtualClassroom.createSession")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("training.virtualClassroom.stats.upcoming")}</p>
                  <p className="text-2xl font-bold">{upcomingSessions.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("training.virtualClassroom.stats.liveNow")}</p>
                  <p className="text-2xl font-bold">{mockSessions.filter(s => s.status === "live").length}</p>
                </div>
                <Play className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("training.virtualClassroom.stats.recordings")}</p>
                  <p className="text-2xl font-bold">{mockSessions.filter(s => s.recordingAvailable).length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("training.virtualClassroom.stats.integrations")}</p>
                  <p className="text-2xl font-bold">{integrations.filter(i => i.connected).length}/{integrations.length}</p>
                </div>
                <Link className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sessions">{t("training.virtualClassroom.tabs.sessions")}</TabsTrigger>
            <TabsTrigger value="recordings">{t("training.virtualClassroom.tabs.recordings")}</TabsTrigger>
            <TabsTrigger value="integrations">{t("training.virtualClassroom.tabs.integrations")}</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("training.virtualClassroom.searchSessions")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {upcomingSessions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("training.virtualClassroom.upcomingAndLive")}</h3>
                <div className="grid gap-4">
                  {upcomingSessions.map((session) => (
                    <Card key={session.id} className="animate-slide-up">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{session.title}</CardTitle>
                            <CardDescription>{t("training.virtualClassroom.instructor")}: {session.instructor}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(session.status)}
                            {getPlatformBadge(session.platform)}
                          </div>
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
                            {session.attendees}/{session.maxAttendees} {t("training.virtualClassroom.registered")}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {session.status === "live" ? (
                            <Button>
                              <Play className="h-4 w-4 mr-1" />
                              {t("training.virtualClassroom.joinNow")}
                            </Button>
                          ) : (
                            <Button>
                              {t("training.virtualClassroom.register")}
                            </Button>
                          )}
                          <Button variant="outline">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {t("training.virtualClassroom.addToCalendar")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastSessions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t("training.virtualClassroom.pastSessions")}</h3>
                <div className="grid gap-4">
                  {pastSessions.map((session) => (
                    <Card key={session.id} className="animate-slide-up opacity-80">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{session.title}</CardTitle>
                            <CardDescription>{t("training.virtualClassroom.instructor")}: {session.instructor}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(session.status)}
                            {session.recordingAvailable && (
                              <Badge variant="secondary">{t("training.virtualClassroom.recordingAvailable")}</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {session.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {session.attendees} {t("training.virtualClassroom.attended")}
                          </div>
                        </div>
                        {session.recordingAvailable && (
                          <Button variant="outline">
                            <Play className="h-4 w-4 mr-1" />
                            {t("training.virtualClassroom.watchRecording")}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {filteredSessions.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground">{t("training.virtualClassroom.noSessions")}</h3>
                  <p className="text-muted-foreground mt-1">
                    {t("training.virtualClassroom.noSessionsDesc")}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recordings" className="space-y-4">
            <div className="grid gap-4">
              {mockSessions.filter(s => s.recordingAvailable).map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription>{session.instructor} • {session.date}</CardDescription>
                      </div>
                      <Badge variant="secondary">{session.duration}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button>
                        <Play className="h-4 w-4 mr-1" />
                        {t("training.virtualClassroom.watchRecording")}
                      </Button>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        {t("training.virtualClassroom.downloadMaterials")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {mockSessions.filter(s => s.recordingAvailable).length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">{t("training.virtualClassroom.noRecordings")}</h3>
                    <p className="text-muted-foreground mt-1">
                      {t("training.virtualClassroom.noRecordingsDesc")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {integrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 ${integration.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <CardDescription>
                              {integration.connected 
                                ? t("training.virtualClassroom.connected")
                                : t("training.virtualClassroom.notConnected")
                              }
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={integration.connected ? "default" : "secondary"}>
                          {integration.connected 
                            ? t("training.virtualClassroom.active")
                            : t("training.virtualClassroom.inactive")
                          }
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant={integration.connected ? "outline" : "default"} className="w-full">
                        {integration.connected ? (
                          <>
                            <Settings className="h-4 w-4 mr-2" />
                            {t("training.virtualClassroom.configure")}
                          </>
                        ) : (
                          <>
                            <Link className="h-4 w-4 mr-2" />
                            {t("training.virtualClassroom.connect")}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
