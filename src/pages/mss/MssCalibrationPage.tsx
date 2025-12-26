import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scale, Calendar, Users, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function MssCalibrationPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  // Fetch calibration sessions where the current user is a participant
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["mss-calibration-sessions", user?.id],
    queryFn: async () => {
      // First get participant records for current user
      const { data: participantData, error: participantError } = await supabase
        .from("calibration_participants")
        .select("session_id, role")
        .eq("user_id", user?.id);

      if (participantError) throw participantError;
      if (!participantData || participantData.length === 0) return [];

      const sessionIds = participantData.map(p => p.session_id);
      const roleMap = Object.fromEntries(participantData.map(p => [p.session_id, p.role]));

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("calibration_sessions")
        .select(`
          id,
          name,
          status,
          scheduled_date,
          appraisal_cycles (
            id,
            name
          )
        `)
        .in("id", sessionIds)
        .order("scheduled_date", { ascending: false });

      if (sessionsError) throw sessionsError;

      return (sessionsData || []).map(session => ({
        ...session,
        userRole: roleMap[session.id] || "reviewer"
      }));
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      in_progress: "default",
      completed: "outline",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      facilitator: "bg-purple-500/10 text-purple-600",
      reviewer: "bg-blue-500/10 text-blue-600",
      observer: "bg-gray-500/10 text-gray-600",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || colors.reviewer}`}>
        {role}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("mss.title"), href: "/mss" },
            { label: t("mss.modules.calibration.title", "Calibration") },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
            <Scale className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("mss.modules.calibration.title", "My Calibration Sessions")}
            </h1>
            <p className="text-muted-foreground">
              {t("mss.modules.calibration.pageDesc", "View and participate in rating calibration sessions")}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Scale className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Calibration Sessions</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You are not currently a participant in any calibration sessions. 
                Sessions will appear here when you are invited.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{session.name}</CardTitle>
                    {getStatusBadge(session.status)}
                  </div>
                  <CardDescription>
                    {session.appraisal_cycles?.name || "No cycle"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {session.scheduled_date 
                        ? format(new Date(session.scheduled_date), "MMM d, yyyy")
                        : "Not scheduled"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {getRoleBadge(session.userRole)}
                    </div>
                  </div>
                  
                  <Button 
                    asChild 
                    className="w-full"
                    variant={session.status === "in_progress" ? "default" : "outline"}
                  >
                    <Link to={`/performance/calibration/${session.id}`}>
                      {session.status === "in_progress" ? "Enter Workspace" : "View Details"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
