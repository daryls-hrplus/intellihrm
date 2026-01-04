import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTalentProfileEvidence, EvidenceSummary } from "@/hooks/useTalentProfileEvidence";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2
} from "lucide-react";

interface TalentPoolNominationEvidenceProps {
  employeeId: string;
  poolCriteria?: {
    requiredSignals?: string[];
    minimumScore?: number;
    minimumConfidence?: number;
  };
}

export function TalentPoolNominationEvidence({
  employeeId,
  poolCriteria,
}: TalentPoolNominationEvidenceProps) {
  const { t } = useLanguage();
  const { fetchEvidenceSummary, loading } = useTalentProfileEvidence();
  const [summary, setSummary] = useState<EvidenceSummary | null>(null);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    const data = await fetchEvidenceSummary(employeeId);
    setSummary(data);
  };

  const meetsMinimumScore = poolCriteria?.minimumScore 
    ? summary?.strengths?.some(s => s.score >= poolCriteria.minimumScore!) 
    : true;

  const meetsMinimumConfidence = poolCriteria?.minimumConfidence
    ? (summary?.avgConfidence || 0) >= poolCriteria.minimumConfidence
    : true;

  if (loading && !summary) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Evidence Summary</span>
          <Badge variant={summary?.totalItems ? 'default' : 'secondary'}>
            {summary?.totalItems || 0} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Criteria Check */}
        {poolCriteria && (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Pool Criteria</div>
              <div className="space-y-1">
                {poolCriteria.minimumScore && (
                  <div className="flex items-center gap-2 text-sm">
                    {meetsMinimumScore ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                    <span>
                      Minimum score: {poolCriteria.minimumScore}
                    </span>
                  </div>
                )}
                {poolCriteria.minimumConfidence && (
                  <div className="flex items-center gap-2 text-sm">
                    {meetsMinimumConfidence ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                    <span>
                      Minimum confidence: {poolCriteria.minimumConfidence * 100}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Confidence</span>
            <span className="text-sm font-semibold">
              {summary?.avgConfidence ? `${Math.round(summary.avgConfidence * 100)}%` : 'N/A'}
            </span>
          </div>
          <Progress value={(summary?.avgConfidence || 0) * 100} className="h-2" />
        </div>

        <Separator />

        {/* Strengths */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-success" />
            <span>Top Strengths</span>
          </div>
          <div className="space-y-1">
            {summary?.strengths?.slice(0, 3).map((strength, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{strength.name}</span>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  {strength.score.toFixed(1)}
                </Badge>
              </div>
            ))}
            {!summary?.strengths?.length && (
              <div className="text-sm text-muted-foreground">No strengths identified</div>
            )}
          </div>
        </div>

        {/* Development Areas */}
        {summary?.developmentAreas && summary.developmentAreas.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingDown className="h-4 w-4 text-warning" />
                <span>Areas to Watch</span>
              </div>
              <div className="space-y-1">
                {summary.developmentAreas.slice(0, 2).map((area, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{area.name}</span>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                      {area.score.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Evidence Sources */}
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info className="h-4 w-4" />
            <span>Evidence Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary?.byType || {}).map(([type, count]) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type.replace('_', ' ')}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
