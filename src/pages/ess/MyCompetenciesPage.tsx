import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Loader2, Target, Briefcase, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { ProficiencyLevelBadge } from "@/components/capabilities/ProficiencyLevelPicker";
import { ProficiencyGapBadge, AssessmentSourceBadge } from "@/components/employee/ProficiencyGapBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MyCompetenciesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: competencies, isLoading } = useQuery({
    queryKey: ["my-competencies", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Fetch employee competencies
      const { data, error } = await supabase
        .from("employee_competencies")
        .select(`
          id,
          competency_id,
          required_proficiency_level,
          assessed_proficiency_level,
          assessed_date,
          assessment_source,
          is_required,
          weighting,
          start_date,
          end_date,
          notes
        `)
        .eq("employee_id", user.id)
        .is("end_date", null)
        .order("start_date", { ascending: false });

      if (error) throw error;
      
      // Fetch skills separately to avoid FK relation issues
      const competencyIds = (data || []).map(ec => ec.competency_id).filter(Boolean);
      let skillsMap: Record<string, any> = {};
      
      if (competencyIds.length > 0) {
        const { data: skills } = await supabase
          .from("skills_competencies")
          .select("id, name, code, category")
          .in("id", competencyIds);
        
        skillsMap = (skills || []).reduce((acc: Record<string, any>, s: any) => {
          acc[s.id] = s;
          return acc;
        }, {});
      }
      
      return (data || []).map(ec => ({
        ...ec,
        skills_competencies: skillsMap[ec.competency_id] || null,
      }));
    },
    enabled: !!user?.id,
  });

  const totalWeight = competencies?.reduce((sum, ec) => sum + Number(ec.weighting || 0), 0) || 0;
  const assessedCount = competencies?.filter((ec) => ec.assessed_proficiency_level !== null).length || 0;
  const pendingCount = (competencies?.length || 0) - assessedCount;
  const meetsRequirements = competencies?.filter((ec) => 
    ec.assessed_proficiency_level !== null && 
    ec.assessed_proficiency_level >= (ec.required_proficiency_level || 0)
  ).length || 0;

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

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Competencies</span>
              </div>
              <div className="text-2xl font-bold mt-1">{competencies?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-muted-foreground">Meets Requirements</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-emerald-600">{meetsRequirements}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Pending Assessment</span>
              </div>
              <div className="text-2xl font-bold mt-1 text-amber-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Weight</span>
              </div>
              <div className="text-2xl font-bold mt-1">{totalWeight}%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  My Competencies
                </CardTitle>
                <CardDescription>
                  Required levels are from your job profile. Assessed levels are updated after performance appraisals.
                </CardDescription>
              </div>
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
                <p className="text-sm mt-1">Competencies are typically assigned based on your job profile.</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competency</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Required Level</TableHead>
                      <TableHead>Assessed Level</TableHead>
                      <TableHead>Gap Status</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Assessment Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {competencies.map((ec: any) => (
                      <TableRow key={ec.id}>
                        <TableCell className="font-medium">
                          <div>
                            {ec.skills_competencies?.name || "Unknown"}
                            {ec.skills_competencies?.code && (
                              <span className="text-muted-foreground ml-1">
                                ({ec.skills_competencies.code})
                              </span>
                            )}
                          </div>
                          {ec.is_required && (
                            <Badge variant="secondary" className="mt-1 text-xs">Required</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {ec.skills_competencies?.category && (
                            <Badge variant="outline">{ec.skills_competencies.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {ec.required_proficiency_level ? (
                            <ProficiencyLevelBadge level={ec.required_proficiency_level} size="sm" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ec.assessed_proficiency_level ? (
                            <ProficiencyLevelBadge level={ec.assessed_proficiency_level} size="sm" />
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Not assessed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <ProficiencyGapBadge
                            required={ec.required_proficiency_level}
                            assessed={ec.assessed_proficiency_level}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ec.weighting}%</Badge>
                        </TableCell>
                        <TableCell>
                          <AssessmentSourceBadge source={ec.assessment_source || "pending"} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
