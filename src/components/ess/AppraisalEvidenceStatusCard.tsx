import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Clock,
  Target,
  Users,
  Briefcase,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface AppraisalEvidenceStatusCardProps {
  employeeId: string;
  companyId?: string;
}

interface CycleEvidenceStatus {
  cycleId: string;
  cycleName: string;
  status: string;
  dueDate: string | null;
  totalItems: number;
  itemsWithEvidence: number;
  validatedEvidence: number;
  pendingEvidence: number;
  itemTypes: {
    goals: { total: number; withEvidence: number };
    competencies: { total: number; withEvidence: number };
    responsibilities: { total: number; withEvidence: number };
  };
}

export function AppraisalEvidenceStatusCard({
  employeeId,
  companyId,
}: AppraisalEvidenceStatusCardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cycleStatuses, setCycleStatuses] = useState<CycleEvidenceStatus[]>([]);

  useEffect(() => {
    fetchAppraisalEvidenceStatus();
  }, [employeeId, companyId]);

  const fetchAppraisalEvidenceStatus = async () => {
    setLoading(true);
    try {
      // Fetch active appraisal participants for this employee
      const { data: participants, error: participantsError } = await supabase
        .from("appraisal_participants")
        .select(`
          id,
          status,
          cycle:appraisal_cycles(
            id,
            name,
            status,
            end_date,
            include_goals,
            include_competencies,
            include_responsibilities
          )
        `)
        .eq("employee_id", employeeId)
        .in("status", ["pending", "in_progress", "submitted"]);

      if (participantsError) throw participantsError;

      const statuses: CycleEvidenceStatus[] = [];

      for (const participant of participants || []) {
        if (!participant.cycle) continue;

        const cycle = participant.cycle as any;

        // Fetch appraisal scores for this participant
        const { data: scores } = await supabase
          .from("appraisal_scores")
          .select("id, evaluation_type, item_id")
          .eq("participant_id", participant.id);

        // Fetch evidence linked to this participant
        const { data: evidence } = await supabase
          .from("performance_evidence")
          .select("id, validation_status, score_item_id")
          .eq("participant_id", participant.id);

        // Calculate item types
        const goalScores = (scores || []).filter(s => s.evaluation_type === "goal");
        const compScores = (scores || []).filter(s => s.evaluation_type === "competency");
        const respScores = (scores || []).filter(s => s.evaluation_type === "responsibility");

        // Count evidence per item type
        const evidenceByScore = (evidence || []).reduce((acc, e) => {
          if (e.score_item_id) {
            acc[e.score_item_id] = (acc[e.score_item_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const goalsWithEvidence = goalScores.filter(s => evidenceByScore[s.id]).length;
        const compsWithEvidence = compScores.filter(s => evidenceByScore[s.id]).length;
        const respsWithEvidence = respScores.filter(s => evidenceByScore[s.id]).length;

        const totalItems = goalScores.length + compScores.length + respScores.length;
        const itemsWithEvidence = goalsWithEvidence + compsWithEvidence + respsWithEvidence;

        statuses.push({
          cycleId: cycle.id,
          cycleName: cycle.name,
          status: participant.status,
          dueDate: cycle.end_date,
          totalItems,
          itemsWithEvidence,
          validatedEvidence: (evidence || []).filter(e => e.validation_status === "validated").length,
          pendingEvidence: (evidence || []).filter(e => e.validation_status === "pending").length,
          itemTypes: {
            goals: { total: goalScores.length, withEvidence: goalsWithEvidence },
            competencies: { total: compScores.length, withEvidence: compsWithEvidence },
            responsibilities: { total: respScores.length, withEvidence: respsWithEvidence },
          },
        });
      }

      setCycleStatuses(statuses);
    } catch (error) {
      console.error("Error fetching appraisal evidence status:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500"><ClipboardList className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "submitted":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading appraisal status...
        </CardContent>
      </Card>
    );
  }

  if (cycleStatuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Appraisal Evidence Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active appraisal cycles</p>
            <p className="text-xs mt-1">Evidence you add now will be available for future appraisals</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Appraisal Evidence Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-4">
            {cycleStatuses.map((cycle) => {
              const coveragePercent = cycle.totalItems > 0 
                ? Math.round((cycle.itemsWithEvidence / cycle.totalItems) * 100) 
                : 0;

              return (
                <div
                  key={cycle.cycleId}
                  className="p-4 rounded-lg border bg-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{cycle.cycleName}</h4>
                      {cycle.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(cycle.dueDate), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(cycle.status)}
                  </div>

                  {/* Evidence Coverage */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Evidence Coverage</span>
                      <span className="font-medium">{coveragePercent}%</span>
                    </div>
                    <Progress value={coveragePercent} className="h-2" />
                  </div>

                  {/* Item Type Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-accent/30 text-center">
                      <Target className="h-3 w-3 mx-auto mb-1 text-pink-600" />
                      <p className="font-medium">{cycle.itemTypes.goals.withEvidence}/{cycle.itemTypes.goals.total}</p>
                      <p className="text-muted-foreground">Goals</p>
                    </div>
                    <div className="p-2 rounded bg-accent/30 text-center">
                      <Users className="h-3 w-3 mx-auto mb-1 text-blue-600" />
                      <p className="font-medium">{cycle.itemTypes.competencies.withEvidence}/{cycle.itemTypes.competencies.total}</p>
                      <p className="text-muted-foreground">Competencies</p>
                    </div>
                    <div className="p-2 rounded bg-accent/30 text-center">
                      <Briefcase className="h-3 w-3 mx-auto mb-1 text-purple-600" />
                      <p className="font-medium">{cycle.itemTypes.responsibilities.withEvidence}/{cycle.itemTypes.responsibilities.total}</p>
                      <p className="text-muted-foreground">Responsibilities</p>
                    </div>
                  </div>

                  {/* Validation Summary */}
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      {cycle.validatedEvidence} validated
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Clock className="h-3 w-3" />
                      {cycle.pendingEvidence} pending
                    </span>
                  </div>

                  {/* Recommendations */}
                  {cycle.itemsWithEvidence < cycle.totalItems && (
                    <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 text-xs">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-700">
                          {cycle.totalItems - cycle.itemsWithEvidence} items need evidence
                        </p>
                        <p className="text-muted-foreground">
                          Add evidence to strengthen your self-assessment
                        </p>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate("/ess/appraisals")}
                  >
                    Go to Appraisal
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
