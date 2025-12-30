import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";

export default function MyCompetenciesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: competencies, isLoading } = useQuery({
    queryKey: ["my-competencies", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("employee_competencies")
        .select(`
          *,
          competencies(name, code),
          competency_levels(name, code)
        `)
        .eq("employee_id", user.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const totalWeight = competencies?.reduce((sum, ec) => sum + Number(ec.weighting), 0) || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: t("ess.modules.competencies.title", "My Competencies") },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("ess.modules.competencies.title", "My Competencies")}
          </h1>
          <p className="text-muted-foreground">
            {t("ess.modules.competencies.description", "View your assigned competencies and proficiency levels")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Assigned Competencies
                <Badge variant="outline">Total Weight: {totalWeight}%</Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !competencies?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No competencies have been assigned to you yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {competencies.map((ec) => (
                  <Card key={ec.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {ec.competencies?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Code: {ec.competencies?.code}
                          </p>
                        </div>
                        <Badge variant="secondary">{ec.weighting}%</Badge>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Level:</span>
                          <span>
                            {ec.competency_levels ? (
                              <Badge variant="outline">{ec.competency_levels.name}</Badge>
                            ) : (
                              "—"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Proficiency Date:</span>
                          <span>
                            {ec.proficiency_date
                              ? formatDateForDisplay(ec.proficiency_date, "MMM d, yyyy")
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Start Date:</span>
                          <span>{formatDateForDisplay(ec.start_date, "MMM d, yyyy")}</span>
                        </div>
                        {ec.end_date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">End Date:</span>
                            <span>{formatDateForDisplay(ec.end_date, "MMM d, yyyy")}</span>
                          </div>
                        )}
                        {ec.notes && (
                          <div className="mt-2 pt-2 border-t">
                            <span className="text-muted-foreground">Notes:</span>
                            <p className="mt-1">{ec.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
