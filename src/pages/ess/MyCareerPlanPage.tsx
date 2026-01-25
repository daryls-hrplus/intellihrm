import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useMySuccessionStatus } from "@/hooks/useSuccessionCandidates";
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Star, 
  Route, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from "lucide-react";

export default function MyCareerPlanPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { data: successionStatus, isLoading } = useMySuccessionStatus(profile?.id);

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "ready_now": return "bg-green-500 text-white";
      case "ready_1_year": return "bg-blue-500 text-white";
      case "ready_2_years": return "bg-amber-500 text-white";
      case "ready_3_plus_years": return "bg-orange-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getReadinessLabel = (level: string) => {
    switch (level) {
      case "ready_now": return "Ready Now";
      case "ready_1_year": return "Ready in 1 Year";
      case "ready_2_years": return "Ready in 1-2 Years";
      case "ready_3_plus_years": return "Ready in 3+ Years";
      default: return level?.replace(/_/g, " ") || "Not Assessed";
    }
  };

  const getReadinessIcon = (level: string) => {
    switch (level) {
      case "ready_now": return <CheckCircle2 className="h-4 w-4" />;
      case "ready_1_year": return <Clock className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const breadcrumbItems = [
    { label: t("ess.title"), href: "/ess" },
    { label: t("ess.modules.careerPlan.title", "My Career Plan") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
            <Compass className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("ess.modules.careerPlan.title", "My Career Plan")}
            </h1>
            <p className="text-muted-foreground">
              {t("ess.modules.careerPlan.description", "Plan and track your career growth")}
            </p>
          </div>
        </div>

        {/* Career Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Succession Candidacy</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {successionStatus?.totalCandidacies || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {successionStatus?.isSuccessor 
                      ? "Active succession nominations" 
                      : "Not currently in succession pipeline"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Career Paths</CardTitle>
              <Route className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">Explore career routes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Development Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">—</div>
              <p className="text-xs text-muted-foreground">Track your growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Succession Status Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Succession Pipeline Status
            </CardTitle>
            <CardDescription>
              Your position in organizational succession planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : successionStatus?.isSuccessor ? (
              <div className="space-y-4">
                {successionStatus.candidacies.map((candidacy: any) => (
                  <div 
                    key={candidacy.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {candidacy.succession_plan?.position?.title || "Position"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {candidacy.succession_plan?.plan_name}
                      </p>
                      {candidacy.ranking && (
                        <p className="text-xs text-muted-foreground">
                          Ranking: #{candidacy.ranking}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getReadinessColor(candidacy.readiness_level)}>
                        {getReadinessIcon(candidacy.readiness_level)}
                        <span className="ml-1">{getReadinessLabel(candidacy.readiness_level)}</span>
                      </Badge>
                      {candidacy.latest_readiness_score !== null && (
                        <span className="text-sm text-muted-foreground">
                          Score: {Math.round(candidacy.latest_readiness_score)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  You are not currently identified as a succession candidate.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Continue developing your skills and discuss career aspirations with your manager.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career Plan CTA */}
        <Card>
          <CardContent className="p-8 text-center">
            <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("career.noPlanYet", "Career Development")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t("career.startPlanDescription", "Set career goals, track progress, and discover growth opportunities.")}
            </p>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              {t("career.createPlan", "Create Career Plan")}
            </Button>
          </CardContent>
        </Card>

        {/* Related Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("career.relatedActions", "Related Actions")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="/ess/career-paths">
                {t("career.exploreCareerPaths", "Explore Career Paths")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/ess/mentorship">
                {t("career.findMentor", "Find a Mentor")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/ess/development">
                {t("career.viewDevelopment", "Development Plan")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
