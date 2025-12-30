import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, ArrowRight } from "lucide-react";

export default function MyMentorshipPage() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { label: t("ess.title"), href: "/ess" },
    { label: t("ess.modules.mentorship.title", "My Mentorship") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("ess.modules.mentorship.title", "My Mentorship")}
            </h1>
            <p className="text-muted-foreground">
              {t("ess.modules.mentorship.description", "Connect with mentors and support mentees")}
            </p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            {t("mentorship.requestMentor", "Request a Mentor")}
          </Button>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("mentorship.noMentors", "No Mentors Yet")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("mentorship.requestMentorDescription", "Request a mentor to guide your career development.")}
            </p>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("mentorship.requestMentor", "Request a Mentor")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("career.relatedActions", "Related Actions")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="/ess/career-plan">
                {t("career.viewCareerPlan", "Career Plan")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/ess/development">
                {t("career.developmentPlan", "Development Plan")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
