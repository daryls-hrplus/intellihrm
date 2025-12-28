import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Star, AlertTriangle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function MssSuccessionPage() {
  const { t } = useLanguage();
  const { profile } = useAuth();

  // Fetch team members with succession data
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ["team-succession", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await (supabase as any)
        .from("profiles")
        .select(`
          id, 
          full_name, 
          hire_date,
          employee_positions!employee_positions_employee_id_fkey (
            position:positions (
              title,
              job:jobs (
                title
              )
            )
          )
        `)
        .eq("manager_id", profile.id);
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Placeholder for succession plans - simplified to avoid type issues
  const successionPlans: any[] = [];

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case "ready_now": return "bg-green-500";
      case "ready_1_year": return "bg-blue-500";
      case "ready_2_years": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const getReadinessLabel = (readiness: string) => {
    switch (readiness) {
      case "ready_now": return "Ready Now";
      case "ready_1_year": return "Ready in 1 Year";
      case "ready_2_years": return "Ready in 2 Years";
      case "ready_3_plus_years": return "Ready in 3+ Years";
      default: return readiness;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("mss.title"), href: "/mss" },
            { label: t("mss.modules.succession.title", "Team Succession") },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
            <TrendingUp className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("mss.modules.succession.title", "Team Succession")}
            </h1>
            <p className="text-muted-foreground">
              {t("mss.modules.succession.description", "View succession readiness for your team")}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">Direct reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Succession Plans</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(successionPlans.map((p: any) => p.employee_id)).size}
              </div>
              <p className="text-xs text-muted-foreground">Identified successors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready Now</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {successionPlans.filter((p: any) => p.readiness_level === "ready_now").length}
              </div>
              <p className="text-xs text-muted-foreground">Candidates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Yet Assigned</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.length - new Set(successionPlans.map((p: any) => p.employee_id)).size}
              </div>
              <p className="text-xs text-muted-foreground">Team members</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Succession Status */}
        <Card>
          <CardHeader>
            <CardTitle>Team Succession Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No direct reports found
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.map((member: any) => {
                  const memberPlans = successionPlans.filter((p: any) => p.employee_id === member.id);
                  const position = member.employee_positions?.[0]?.position;
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {position?.title || position?.job?.title || "No position assigned"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {memberPlans.length > 0 ? (
                          memberPlans.map((plan: any, idx: number) => (
                            <Badge 
                              key={idx} 
                              className={`${getReadinessColor(plan.readiness_level)} text-white`}
                            >
                              {getReadinessLabel(plan.readiness_level)}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Not in succession plan
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Succession Plans Detail */}
        {successionPlans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Succession Plan Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {successionPlans.map((plan: any, idx: number) => {
                  const member = teamMembers.find((m: any) => m.id === plan.employee_id);
                  return (
                    <div key={idx} className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{member?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Succession candidate for: {plan.succession_plan?.position?.title || "N/A"}
                          </p>
                        </div>
                        <Badge className={`${getReadinessColor(plan.readiness_level)} text-white`}>
                          {getReadinessLabel(plan.readiness_level)}
                        </Badge>
                      </div>
                      {plan.development_progress !== null && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Development Progress</span>
                            <span>{plan.development_progress}%</span>
                          </div>
                          <Progress value={plan.development_progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
