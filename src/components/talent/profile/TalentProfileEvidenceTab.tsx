import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTalentProfileEvidence, TalentProfileEvidence, EvidenceSummary } from "@/hooks/useTalentProfileEvidence";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  FileText, 
  Target, 
  Award,
  Users,
  Calendar,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface TalentProfileEvidenceTabProps {
  employeeId: string;
}

export function TalentProfileEvidenceTab({ employeeId }: TalentProfileEvidenceTabProps) {
  const { t } = useLanguage();
  const { fetchEvidenceForEmployee, fetchEvidenceSummary, loading } = useTalentProfileEvidence();
  
  const [evidence, setEvidence] = useState<TalentProfileEvidence[]>([]);
  const [summary, setSummary] = useState<EvidenceSummary | null>(null);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    const [evidenceData, summaryData] = await Promise.all([
      fetchEvidenceForEmployee(employeeId),
      fetchEvidenceSummary(employeeId),
    ]);
    setEvidence(evidenceData);
    setSummary(summaryData);
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case '360_signal': return <Users className="h-4 w-4" />;
      case 'appraisal': return <FileText className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getConfidenceBadge = (score: number | null) => {
    if (!score) return null;
    if (score >= 0.8) return <Badge variant="default">High</Badge>;
    if (score >= 0.5) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  if (loading && !summary) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Evidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalItems || 0}</div>
            <div className="text-xs text-muted-foreground">
              From {Object.keys(summary?.byType || {}).length} sources
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.avgConfidence ? `${Math.round(summary.avgConfidence * 100)}%` : 'N/A'}
            </div>
            <Progress 
              value={(summary?.avgConfidence || 0) * 100} 
              className="h-1 mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {summary?.strengths?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              High-performing areas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Development Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {summary?.developmentAreas?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Areas for growth
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary?.strengths?.map((strength, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          {strength.score.toFixed(1)}
                        </Badge>
                        <span className="text-sm font-medium">{strength.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(strength.confidence * 100)}% confidence
                      </span>
                    </div>
                  ))}
                  {!summary?.strengths?.length && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No strength data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Development Areas Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-warning" />
                  Development Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary?.developmentAreas?.map((area, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                          {area.score.toFixed(1)}
                        </Badge>
                        <span className="text-sm font-medium">{area.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(area.confidence * 100)}% confidence
                      </span>
                    </div>
                  ))}
                  {!summary?.developmentAreas?.length && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No development areas identified
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evidence by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evidence by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(summary?.byType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3 p-3 rounded-lg border">
                    {getEvidenceIcon(type)}
                    <div>
                      <div className="text-lg font-semibold">{count}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strengths">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Strengths Analysis</CardTitle>
              <CardDescription>
                Areas where this employee consistently excels based on multiple evidence sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.strengths?.map((strength, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="font-medium">{strength.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-success">{strength.score.toFixed(1)}</Badge>
                        {getConfidenceBadge(strength.confidence)}
                      </div>
                    </div>
                    <Progress value={strength.score * 20} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development">
          <Card>
            <CardHeader>
              <CardTitle>Development Opportunities</CardTitle>
              <CardDescription>
                Areas identified for growth and improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.developmentAreas?.map((area, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-medium">{area.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{area.score.toFixed(1)}</Badge>
                        {getConfidenceBadge(area.confidence)}
                      </div>
                    </div>
                    <Progress value={area.score * 20} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Timeline</CardTitle>
              <CardDescription>
                Recent evidence collected across all sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {evidence.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-muted">
                        {getEvidenceIcon(item.evidence_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize">
                            {item.evidence_type.replace('_', ' ')}
                          </Badge>
                          {item.confidence_score && (
                            <span className="text-xs text-muted-foreground">
                              {Math.round(item.confidence_score * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{item.evidence_summary || 'No summary available'}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(item.created_at), 'MMM d, yyyy')}
                          {item.valid_from && (
                            <>
                              <span>•</span>
                              <span>Valid from {format(new Date(item.valid_from), 'MMM d, yyyy')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {evidence.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No evidence records found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
