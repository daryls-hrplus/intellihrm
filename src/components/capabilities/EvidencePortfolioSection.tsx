import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Target,
  Award,
  Briefcase,
  TrendingUp,
  Shield,
  ExternalLink,
} from "lucide-react";
import { usePerformanceEvidence } from "@/hooks/capabilities/usePerformanceEvidence";
import { useCompetencyRatingHistory } from "@/hooks/capabilities/useCompetencyRatingHistory";
import { useSkillValidationConfidence } from "@/hooks/capabilities/useSkillValidationConfidence";
import { PerformanceEvidenceManager } from "./PerformanceEvidenceManager";
import { CompetencyDriftChart } from "./CompetencyDriftChart";
import { SkillValidationConfidenceIndicator } from "./SkillValidationConfidenceIndicator";

interface EvidencePortfolioSectionProps {
  employeeId: string;
  companyId?: string;
  canEdit?: boolean;
  canValidate?: boolean;
}

export function EvidencePortfolioSection({
  employeeId,
  companyId,
  canEdit = false,
  canValidate = false,
}: EvidencePortfolioSectionProps) {
  const { evidence, loading: evidenceLoading, fetchEvidence } = usePerformanceEvidence();
  const { fetchDriftAnalysis, getHistoryByPeriod } = useCompetencyRatingHistory();
  const { getValidationSummary } = useSkillValidationConfidence();

  const [driftData, setDriftData] = useState<any[]>([]);
  const [validationSummaries, setValidationSummaries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("evidence");

  useEffect(() => {
    if (employeeId) {
      fetchEvidence({ employee_id: employeeId });
      loadDriftData();
    }
  }, [employeeId]);

  const loadDriftData = async () => {
    const drift = await fetchDriftAnalysis(employeeId);
    setDriftData(drift);
  };

  // Stats
  const stats = {
    totalEvidence: evidence.length,
    validatedEvidence: evidence.filter((e) => e.validation_status === "validated").length,
    pendingValidation: evidence.filter((e) => e.validation_status === "pending").length,
    capabilitiesTracked: driftData.length,
    improvingSkills: driftData.filter((d) => d.trend === "IMPROVING").length,
    decliningSkills: driftData.filter((d) => d.trend === "DECLINING").length,
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Evidence Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="p-3 rounded-lg bg-accent/30 text-center">
              <p className="text-2xl font-semibold">{stats.totalEvidence}</p>
              <p className="text-xs text-muted-foreground">Total Evidence</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 text-center">
              <p className="text-2xl font-semibold text-green-600">
                {stats.validatedEvidence}
              </p>
              <p className="text-xs text-muted-foreground">Validated</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
              <p className="text-2xl font-semibold text-yellow-600">
                {stats.pendingValidation}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-center">
              <p className="text-2xl font-semibold text-blue-600">
                {stats.capabilitiesTracked}
              </p>
              <p className="text-xs text-muted-foreground">Skills Tracked</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
              <p className="text-2xl font-semibold text-emerald-600">
                {stats.improvingSkills}
              </p>
              <p className="text-xs text-muted-foreground">Improving</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500/10 text-center">
              <p className="text-2xl font-semibold text-red-600">
                {stats.decliningSkills}
              </p>
              <p className="text-xs text-muted-foreground">Need Attention</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="evidence" className="gap-2">
            <FileText className="h-4 w-4" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Skill Trends
          </TabsTrigger>
          <TabsTrigger value="validation" className="gap-2">
            <Shield className="h-4 w-4" />
            Validation Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="mt-4">
          <PerformanceEvidenceManager
            employeeId={employeeId}
            canValidate={canValidate}
            readOnly={!canEdit}
          />
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <CompetencyDriftChart
            driftData={driftData}
            showAlerts={true}
            title="Competency Progression"
          />
        </TabsContent>

        <TabsContent value="validation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skill Validation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {driftData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No skill validation data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {driftData.map((skill) => (
                    <div
                      key={skill.capability_id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{skill.capability_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current Level: {skill.current_level} | {skill.periods_analyzed} periods analyzed
                        </p>
                      </div>
                      <SkillValidationConfidenceIndicator
                        confidence={
                          skill.periods_analyzed >= 3 && skill.trend === "IMPROVING"
                            ? "high"
                            : skill.periods_analyzed >= 2
                            ? "medium"
                            : "low"
                        }
                        size="md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}