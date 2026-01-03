import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProspectJourney, useComputeLeadScores } from "@/hooks/useDemoAnalytics";
import { EngagementTimeline } from "./demo-analytics/EngagementTimeline";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Building,
  Briefcase,
  Users,
  Clock,
  TrendingUp,
  Video,
  MousePointerClick,
  RefreshCw,
  Flame,
  ThermometerSun,
  Snowflake,
  Star,
  Lightbulb,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const temperatureConfig = {
  qualified: { icon: Star, color: "bg-emerald-100 text-emerald-700", label: "Qualified" },
  hot: { icon: Flame, color: "bg-orange-100 text-orange-700", label: "Hot" },
  warm: { icon: ThermometerSun, color: "bg-amber-100 text-amber-700", label: "Warm" },
  cold: { icon: Snowflake, color: "bg-blue-100 text-blue-700", label: "Cold" },
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function ProspectJourneyPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data, isLoading, refetch } = useProspectJourney(sessionId);
  const computeScores = useComputeLeadScores();
  const { toast } = useToast();

  const handleRecomputeScore = async () => {
    if (!sessionId) return;
    try {
      await computeScores.mutateAsync(sessionId);
      refetch();
      toast({
        title: "Score recomputed",
        description: "Lead score has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to recompute score",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.session) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Prospect not found</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/admin/demo-analytics">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { session, leadScore, events } = data;
  const temp = leadScore?.lead_temperature as keyof typeof temperatureConfig;
  const tempConfig = temp ? temperatureConfig[temp] : null;
  const TempIcon = tempConfig?.icon || Users;

  // Calculate metrics from events
  const totalTime = events.reduce((sum, e) => sum + (e.time_spent_seconds || 0), 0);
  const videoEvents = events.filter(e => 
    e.event_type === "video_progress" || e.event_type === "video_complete"
  );
  const avgVideoProgress = videoEvents.length > 0
    ? Math.round(videoEvents.reduce((sum, e) => sum + (e.video_watch_percentage || 0), 0) / videoEvents.length)
    : 0;
  const ctaClicks = events.filter(e => 
    e.event_type === "cta_click" || e.event_type === "book_demo" || e.event_type === "request_trial"
  ).length;

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/demo-analytics">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {session.full_name || session.email || "Anonymous Prospect"}
            </h1>
            <p className="text-muted-foreground">
              Session started {format(new Date(session.started_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRecomputeScore}
            disabled={computeScores.isPending}
          >
            {computeScores.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Recompute Score
          </Button>
          {session.email && (
            <Button asChild>
              <a href={`mailto:${session.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile & Score */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{session.email}</span>
                </div>
              )}
              {session.company_name && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{session.company_name}</span>
                </div>
              )}
              {session.job_title && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{session.job_title}</span>
                </div>
              )}
              {session.industry && (
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{session.industry}</span>
                </div>
              )}
              {session.employee_count && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{session.employee_count} employees</span>
                </div>
              )}
              {!session.email && !session.company_name && !session.job_title && (
                <p className="text-sm text-muted-foreground">No profile information captured</p>
              )}
            </CardContent>
          </Card>

          {/* Lead Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {leadScore ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={tempConfig?.color || ""}>
                        <TempIcon className="h-3 w-3 mr-1" />
                        {tempConfig?.label || "Unknown"}
                      </Badge>
                    </div>
                    <span className="text-3xl font-bold">{leadScore.engagement_score}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Watch Time</span>
                        <span>{formatDuration(leadScore.total_watch_time_seconds)}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (leadScore.total_watch_time_seconds / 300) * 100)} 
                        className="h-2" 
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Chapters Completed</span>
                        <span>{leadScore.chapters_completed}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">CTA Clicks</span>
                        <span>{leadScore.cta_clicks}</span>
                      </div>
                    </div>
                  </div>

                  {leadScore.recommended_follow_up && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium">Recommended Action</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {leadScore.recommended_follow_up}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Score not yet computed
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleRecomputeScore}
                    disabled={computeScores.isPending}
                  >
                    Compute Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-lg font-bold mt-1">{formatDuration(totalTime)}</p>
                  <p className="text-xs text-muted-foreground">Total Time</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <Video className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-lg font-bold mt-1">{avgVideoProgress}%</p>
                  <p className="text-xs text-muted-foreground">Avg Watch</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <MousePointerClick className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-lg font-bold mt-1">{ctaClicks}</p>
                  <p className="text-xs text-muted-foreground">CTA Clicks</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-lg font-bold mt-1">{events.length}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2">
          <EngagementTimeline events={events} />
        </div>
      </div>
    </div>
  );
}
