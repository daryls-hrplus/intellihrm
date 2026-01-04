import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, TrendingUp, Users, Brain, Target, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RatingSourcesPanel } from './RatingSourcesPanel';
import { PotentialAssessmentInline } from './PotentialAssessmentInline';

interface NineBoxEvidencePanelProps {
  employeeId: string;
  companyId: string;
  onSuggestedRatings?: (
    performance: { rating: number; confidence: number; sources: string[] } | null,
    potential: { rating: number; confidence: number; sources: string[] } | null
  ) => void;
}

interface SignalSnapshot {
  id: string;
  signal_value: number | null;
  normalized_score: number | null;
  confidence_score: number | null;
  bias_risk_level: string;
  signal_definition: {
    code: string;
    name: string;
    signal_category: string;
  } | null;
}

interface AppraisalData {
  overall_score: number | null;
  cycle_name: string;
  status: string;
}

interface GoalData {
  completion_percentage: number;
  total_goals: number;
  completed_goals: number;
}

export function NineBoxEvidencePanel({ 
  employeeId, 
  companyId,
  onSuggestedRatings 
}: NineBoxEvidencePanelProps) {
  const [signals, setSignals] = useState<SignalSnapshot[]>([]);
  const [appraisal, setAppraisal] = useState<AppraisalData | null>(null);
  const [goals, setGoals] = useState<GoalData | null>(null);
  const [potentialAssessment, setPotentialAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (employeeId && companyId) {
      fetchAllEvidence();
    }
  }, [employeeId, companyId]);

  const fetchAllEvidence = async () => {
    setLoading(true);
    try {
      // Fetch talent signals
      const { data: signalsRaw } = await supabase
        .from('talent_signal_snapshots')
        .select(`
          id,
          signal_value,
          normalized_score,
          confidence_score,
          bias_risk_level,
          signal_definition:talent_signal_definitions(code, name, signal_category)
        `)
        .eq('employee_id', employeeId)
        .eq('is_current', true);

      // Fetch latest appraisal
      const { data: appraisalRaw } = await supabase
        .from('appraisal_participants')
        .select(`
          overall_score,
          status,
          appraisal_cycle:appraisal_cycles(name)
        `)
        .eq('employee_id', employeeId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch employee goals
      let goalsData: Array<{ id: string; status: string; progress_percentage: number }> = [];
      try {
        const goalsQuery = supabase
          .from('performance_goals' as any)
          .select('id, status, progress_percentage')
          .eq('owner_id', employeeId)
          .eq('is_active', true);
        const { data: goalsRaw } = await goalsQuery;
        goalsData = (goalsRaw as any) || [];
      } catch {
        // Goals table might not exist or have different schema
      }

      // Fetch latest potential assessment
      const { data: potentialRaw } = await supabase
        .from('potential_assessments')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_current', true)
        .order('assessment_date', { ascending: false })
        .limit(1);

      // Process signals
      const signalData = (signalsRaw || []).map((s: any) => ({
        id: s.id,
        signal_value: s.signal_value,
        normalized_score: s.normalized_score,
        confidence_score: s.confidence_score,
        bias_risk_level: s.bias_risk_level,
        signal_definition: Array.isArray(s.signal_definition) 
          ? s.signal_definition[0] 
          : s.signal_definition
      })) as SignalSnapshot[];
      setSignals(signalData);

      // Process appraisal
      const appraisalData = (appraisalRaw as any)?.[0];
      if (appraisalData) {
        setAppraisal({
          overall_score: appraisalData.overall_score,
          cycle_name: appraisalData.appraisal_cycle?.name || 'Unknown',
          status: appraisalData.status
        });
      }

      // Process goals
      if (goalsData.length > 0) {
        const completed = goalsData.filter(g => g.status === 'completed').length;
        const avgProgress = goalsData.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / goalsData.length;
        setGoals({
          completion_percentage: avgProgress,
          total_goals: goalsData.length,
          completed_goals: completed
        });
      }

      // Process potential assessment
      const potentialData = (potentialRaw as any)?.[0];
      if (potentialData) {
        setPotentialAssessment(potentialData);
      }

      // Calculate suggested ratings
      calculateSuggestedRatings(signalData, appraisalData, goalsData, potentialData);

    } catch (error) {
      console.error('Error fetching evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSuggestedRatings = (
    signalData: SignalSnapshot[],
    appraisalData: any,
    goalsData: any[],
    potentialData: any
  ) => {
    // Calculate Performance Rating
    let performanceSources: string[] = [];
    let performanceScore = 0;
    let performanceWeight = 0;

    // Appraisal score (weight: 0.5)
    if (appraisalData?.overall_score) {
      performanceScore += (appraisalData.overall_score / 5) * 0.5;
      performanceWeight += 0.5;
      performanceSources.push('Appraisal');
    }

    // Goals completion (weight: 0.3)
    if (goalsData && goalsData.length > 0) {
      const avgProgress = goalsData.reduce((sum, g) => sum + (g.progress_percentage || 0), 0) / goalsData.length;
      performanceScore += (avgProgress / 100) * 0.3;
      performanceWeight += 0.3;
      performanceSources.push('Goals');
    }

    // Technical signals (weight: 0.2)
    const technicalSignals = signalData.filter(s => 
      s.signal_definition?.signal_category === 'technical'
    );
    if (technicalSignals.length > 0) {
      const avgTechnical = technicalSignals.reduce((sum, s) => sum + (s.normalized_score || 0), 0) / technicalSignals.length;
      performanceScore += avgTechnical * 0.2;
      performanceWeight += 0.2;
      performanceSources.push('Technical Skills');
    }

    // Calculate Potential Rating
    let potentialSources: string[] = [];
    let potentialScore = 0;
    let potentialWeight = 0;

    // Potential assessment (weight: 0.4)
    if (potentialData?.calculated_rating) {
      potentialScore += (potentialData.calculated_rating / 3) * 0.4;
      potentialWeight += 0.4;
      potentialSources.push('Potential Assessment');
    }

    // Leadership signals (weight: 0.4)
    const leadershipSignals = signalData.filter(s => 
      ['leadership', 'people_leadership', 'strategic_thinking', 'influence'].includes(s.signal_definition?.signal_category || '')
    );
    if (leadershipSignals.length > 0) {
      const avgLeadership = leadershipSignals.reduce((sum, s) => sum + (s.normalized_score || 0), 0) / leadershipSignals.length;
      potentialScore += avgLeadership * 0.4;
      potentialWeight += 0.4;
      potentialSources.push('Leadership Signals');
    }

    // Values/adaptability signals (weight: 0.2)
    const valuesSignals = signalData.filter(s => 
      ['values', 'adaptability'].includes(s.signal_definition?.signal_category || '')
    );
    if (valuesSignals.length > 0) {
      const avgValues = valuesSignals.reduce((sum, s) => sum + (s.normalized_score || 0), 0) / valuesSignals.length;
      potentialScore += avgValues * 0.2;
      potentialWeight += 0.2;
      potentialSources.push('Values & Adaptability');
    }

    // Normalize and convert to 1-3 scale
    const normalizedPerformance = performanceWeight > 0 ? performanceScore / performanceWeight : 0;
    const normalizedPotential = potentialWeight > 0 ? potentialScore / potentialWeight : 0;

    const performanceRating = normalizedPerformance < 0.33 ? 1 : normalizedPerformance < 0.67 ? 2 : 3;
    const potentialRating = normalizedPotential < 0.33 ? 1 : normalizedPotential < 0.67 ? 2 : 3;

    if (onSuggestedRatings) {
      onSuggestedRatings(
        performanceWeight > 0 ? {
          rating: performanceRating,
          confidence: Math.min(performanceWeight, 1),
          sources: performanceSources
        } : null,
        potentialWeight > 0 ? {
          rating: potentialRating,
          confidence: Math.min(potentialWeight, 1),
          sources: potentialSources
        } : null
      );
    }
  };

  const getSignalsByCategory = (category: string) => {
    return signals.filter(s => s.signal_definition?.signal_category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'leadership': return <Users className="h-4 w-4" />;
      case 'technical': return <Brain className="h-4 w-4" />;
      case 'values': return <Target className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getBiasRiskBadge = (level: string) => {
    switch (level) {
      case 'high': return <Badge variant="destructive" className="text-xs">High Bias Risk</Badge>;
      case 'medium': return <Badge variant="secondary" className="text-xs">Medium Risk</Badge>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="potential">Potential</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Performance Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {appraisal && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Appraisal Score</span>
                    <Badge variant="outline">{appraisal.overall_score?.toFixed(1) || 'N/A'}/5</Badge>
                  </div>
                )}
                {goals && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Goal Progress</span>
                    <Badge variant="outline">{goals.completion_percentage.toFixed(0)}%</Badge>
                  </div>
                )}
                {!appraisal && !goals && (
                  <p className="text-sm text-muted-foreground">No performance data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Potential Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {potentialAssessment && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Assessment Rating</span>
                    <Badge variant="outline">{potentialAssessment.calculated_rating}/3</Badge>
                  </div>
                )}
                {getSignalsByCategory('leadership').length > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Leadership Signals</span>
                    <Badge variant="outline">{getSignalsByCategory('leadership').length} signals</Badge>
                  </div>
                )}
                {!potentialAssessment && getSignalsByCategory('leadership').length === 0 && (
                  <p className="text-sm text-muted-foreground">No potential data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 360 Signals Overview */}
          {signals.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">360 Feedback Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {signals.slice(0, 5).map((signal) => (
                    <div key={signal.id} className="flex items-center gap-3">
                      {getCategoryIcon(signal.signal_definition?.signal_category || '')}
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{signal.signal_definition?.name || 'Unknown'}</span>
                          <div className="flex items-center gap-2">
                            {getBiasRiskBadge(signal.bias_risk_level)}
                            <span className="text-sm text-muted-foreground">
                              {((signal.normalized_score || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <Progress value={(signal.normalized_score || 0) * 100} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                  {signals.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{signals.length - 5} more signals
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {signals.length === 0 && !appraisal && !goals && !potentialAssessment && (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No evidence data available for this employee</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete appraisals, 360 feedback, or potential assessments to see AI-suggested ratings
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <RatingSourcesPanel
            axis="performance"
            employeeId={employeeId}
            companyId={companyId}
            appraisalData={appraisal}
            goalsData={goals}
            signals={signals.filter(s => 
              ['technical', 'customer_focus'].includes(s.signal_definition?.signal_category || '')
            )}
          />
        </TabsContent>

        <TabsContent value="potential" className="mt-4 space-y-4">
          <RatingSourcesPanel
            axis="potential"
            employeeId={employeeId}
            companyId={companyId}
            potentialAssessment={potentialAssessment}
            signals={signals.filter(s => 
              ['leadership', 'values', 'adaptability'].includes(s.signal_definition?.signal_category || '')
            )}
          />
          
          {!potentialAssessment && (
            <PotentialAssessmentInline
              employeeId={employeeId}
              companyId={companyId}
              onComplete={() => fetchAllEvidence()}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
