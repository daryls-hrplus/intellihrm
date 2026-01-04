import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Briefcase,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadinessIndicator {
  id: string;
  type: string;
  value: number;
  source: string;
  confidence: number;
  explanation?: string;
}

interface GapItem {
  id: string;
  type: string;
  description: string;
  linkedIdpItem?: string;
  linkedLearning?: string;
  recommendedExperience?: string;
}

interface ReadinessAssessmentEvidenceProps {
  candidateId: string;
  employeeId: string;
}

export function ReadinessAssessmentEvidence({
  candidateId,
  employeeId,
}: ReadinessAssessmentEvidenceProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState<ReadinessIndicator[]>([]);
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [overallReadiness, setOverallReadiness] = useState<number>(0);
  const [nineBoxData, setNineBoxData] = useState<{ performance: number; potential: number } | null>(null);

  useEffect(() => {
    loadData();
  }, [candidateId, employeeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch readiness indicators
      const { data: indicatorData } = await supabase
        .from('succession_readiness_indicators')
        .select('*')
        .eq('candidate_id', candidateId);

      if (indicatorData) {
        setIndicators(indicatorData.map(i => ({
          id: i.id,
          type: i.indicator_type,
          value: i.indicator_value || 0,
          source: i.indicator_source || 'Manual',
          confidence: i.confidence_score || 0,
          explanation: i.explanation,
        })));

        // Calculate overall readiness
        if (indicatorData.length > 0) {
          const avg = indicatorData.reduce((sum, i) => sum + (i.indicator_value || 0), 0) / indicatorData.length;
          setOverallReadiness(avg);
        }
      }

      // Fetch gaps
      const { data: gapData } = await supabase
        .from('succession_gap_development_links')
        .select('*')
        .eq('candidate_id', candidateId);

      if (gapData) {
        setGaps(gapData.map(g => ({
          id: g.id,
          type: g.gap_type,
          description: g.gap_description || '',
          linkedIdpItem: g.linked_idp_item_id,
          linkedLearning: g.linked_learning_id,
          recommendedExperience: g.recommended_experience,
        })));
      }

      // Fetch 9-box data
      const { data: nineBox } = await supabase
        .from('nine_box_assessments')
        .select('performance_rating, potential_rating')
        .eq('employee_id', employeeId)
        .eq('is_current', true)
        .single();

      if (nineBox) {
        setNineBoxData({
          performance: nineBox.performance_rating,
          potential: nineBox.potential_rating,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getReadinessLabel = (value: number): string => {
    if (value >= 80) return 'Ready Now';
    if (value >= 60) return 'Ready in 1 Year';
    if (value >= 40) return 'Ready in 2 Years';
    return 'Long-term Candidate';
  };

  const getReadinessColor = (value: number): string => {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-primary';
    if (value >= 40) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getIndicatorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'experience': return <Briefcase className="h-4 w-4" />;
      case 'skills': return <Target className="h-4 w-4" />;
      case 'leadership': return <TrendingUp className="h-4 w-4" />;
      case 'learning': return <BookOpen className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Readiness Assessment</CardTitle>
            <CardDescription>
              Evidence-based evaluation of successor readiness
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={cn("text-3xl font-bold", getReadinessColor(overallReadiness))}>
              {Math.round(overallReadiness)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {getReadinessLabel(overallReadiness)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="indicators">
          <TabsList className="mb-4">
            <TabsTrigger value="indicators">Readiness Indicators</TabsTrigger>
            <TabsTrigger value="gaps">Gaps & Development</TabsTrigger>
            <TabsTrigger value="evidence">9-Box Evidence</TabsTrigger>
          </TabsList>

          <TabsContent value="indicators" className="space-y-4">
            {indicators.length > 0 ? (
              indicators.map(indicator => (
                <div key={indicator.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getIndicatorIcon(indicator.type)}
                      <span className="font-medium capitalize">{indicator.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold",
                        indicator.value >= 70 ? 'text-success' :
                        indicator.value >= 40 ? 'text-warning' : 'text-destructive'
                      )}>
                        {Math.round(indicator.value)}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(indicator.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                  <Progress value={indicator.value} className="h-2 mb-2" />
                  {indicator.explanation && (
                    <p className="text-sm text-muted-foreground">{indicator.explanation}</p>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Source: {indicator.source}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No readiness indicators available
              </div>
            )}
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4">
            {gaps.length > 0 ? (
              gaps.map(gap => (
                <div key={gap.id} className="p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{gap.type} Gap</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{gap.description}</p>
                      
                      <div className="space-y-2">
                        {gap.linkedIdpItem && (
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-primary" />
                            <span>Linked IDP Item</span>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                        )}
                        {gap.linkedLearning && (
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span>Assigned Learning</span>
                            <Badge variant="secondary">In Progress</Badge>
                          </div>
                        )}
                        {gap.recommendedExperience && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span>{gap.recommendedExperience}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                <div className="font-medium">No Gaps Identified</div>
                <div className="text-sm text-muted-foreground">
                  This candidate has no significant development gaps
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            {nineBoxData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-sm text-muted-foreground mb-1">Performance</div>
                    <div className="text-3xl font-bold">
                      {nineBoxData.performance === 1 ? 'Low' : 
                       nineBoxData.performance === 2 ? 'Medium' : 'High'}
                    </div>
                    <Progress 
                      value={nineBoxData.performance * 33.33} 
                      className="h-2 mt-2" 
                    />
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-sm text-muted-foreground mb-1">Potential</div>
                    <div className="text-3xl font-bold">
                      {nineBoxData.potential === 1 ? 'Low' : 
                       nineBoxData.potential === 2 ? 'Medium' : 'High'}
                    </div>
                    <Progress 
                      value={nineBoxData.potential * 33.33} 
                      className="h-2 mt-2" 
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Readiness Timeline</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on current 9-Box placement and development progress, 
                    this candidate is estimated to be {getReadinessLabel(overallReadiness).toLowerCase()}.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No 9-Box assessment available for this employee
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
