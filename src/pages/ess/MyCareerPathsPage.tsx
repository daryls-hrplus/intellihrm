import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function MyCareerPathsPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t("ess.title"), href: "/ess" },
    { label: t("ess.modules.careerPaths.title", "My Career Paths") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ess.modules.careerPaths.title", "My Career Paths")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.careerPaths.description", "Explore your career progression opportunities")}
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("career.comingSoon", "Career Paths Coming Soon")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("career.noPathsAvailable", "Career path visualization will be available once configured by HR.")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("career.quickActions", "Quick Actions")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="/ess/skill-gaps">
                {t("career.viewSkillGaps", "View Skill Gaps")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/ess/development">
                {t("career.viewDevelopmentPlan", "Development Plan")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
