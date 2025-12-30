import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Sparkles, ArrowRight } from "lucide-react";

export default function MyCareerPlanPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t("ess.title"), href: "/ess" },
    { label: t("ess.modules.careerPlan.title", "My Career Plan") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ess.modules.careerPlan.title", "My Career Plan")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.careerPlan.description", "Plan and track your career growth")}
          </p>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Compass className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("career.noPlanYet", "No Career Plan Yet")}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t("career.startPlanDescription", "Create your career plan to set goals, track progress, and discover growth opportunities.")}
            </p>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              {t("career.createPlan", "Create Career Plan")}
            </Button>
          </CardContent>
        </Card>

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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
