import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Users, Brain, CheckCircle2, AlertCircle } from 'lucide-react';

interface SignalData {
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

interface RatingSourcesPanelProps {
  axis: 'performance' | 'potential';
  employeeId: string;
  companyId: string;
  appraisalData?: {
    overall_score: number | null;
    cycle_name: string;
    status: string;
  } | null;
  goalsData?: {
    completion_percentage: number;
    total_goals: number;
    completed_goals: number;
  } | null;
  potentialAssessment?: {
    calculated_rating: number;
    total_points: number;
    assessment_date: string;
  } | null;
  signals?: SignalData[];
}

export function RatingSourcesPanel({
  axis,
  appraisalData,
  goalsData,
  potentialAssessment,
  signals = []
}: RatingSourcesPanelProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatScore = (score: number | null, max: number = 5) => {
    if (score === null) return 'N/A';
    return `${score.toFixed(1)}/${max}`;
  };

  if (axis === 'performance') {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Performance Evidence Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Appraisal Source */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Appraisal Score</span>
                </div>
                <Badge variant={appraisalData ? 'default' : 'secondary'}>
                  Weight: 50%
                </Badge>
              </div>
              {appraisalData ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{appraisalData.cycle_name}</span>
                    <span className="font-medium">{formatScore(appraisalData.overall_score)}</span>
                  </div>
                  <Progress 
                    value={((appraisalData.overall_score || 0) / 5) * 100} 
                    className="h-2" 
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  No completed appraisal found
                </p>
              )}
            </div>

            {/* Goals Source */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Goal Achievement</span>
                </div>
                <Badge variant={goalsData ? 'default' : 'secondary'}>
                  Weight: 30%
                </Badge>
              </div>
              {goalsData ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {goalsData.completed_goals}/{goalsData.total_goals} goals completed
                    </span>
                    <span className="font-medium">{goalsData.completion_percentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={goalsData.completion_percentage} className="h-2" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  No active goals found
                </p>
              )}
            </div>

            {/* Technical Signals */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Technical Competency Signals</span>
                </div>
                <Badge variant={signals.length > 0 ? 'default' : 'secondary'}>
                  Weight: 20%
                </Badge>
              </div>
              {signals.length > 0 ? (
                <div className="space-y-2">
                  {signals.map((signal) => (
                    <div key={signal.id} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{signal.signal_definition?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={getConfidenceColor(signal.confidence_score || 0)}>
                          {((signal.confidence_score || 0) * 100).toFixed(0)}% conf
                        </span>
                        <span className="font-medium">
                          {((signal.normalized_score || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  No 360 technical signals available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Potential axis
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Potential Evidence Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Potential Assessment */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Potential Assessment</span>
              </div>
              <Badge variant={potentialAssessment ? 'default' : 'secondary'}>
                Weight: 40%
              </Badge>
            </div>
            {potentialAssessment ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Assessed on {new Date(potentialAssessment.assessment_date).toLocaleDateString()}
                  </span>
                  <span className="font-medium">{potentialAssessment.calculated_rating}/3</span>
                </div>
                <Progress 
                  value={(potentialAssessment.calculated_rating / 3) * 100} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  Total points: {potentialAssessment.total_points}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                No potential assessment completed - complete one below
              </p>
            )}
          </div>

          {/* Leadership Signals */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Leadership & Values Signals</span>
              </div>
              <Badge variant={signals.length > 0 ? 'default' : 'secondary'}>
                Weight: 60%
              </Badge>
            </div>
            {signals.length > 0 ? (
              <div className="space-y-2">
                {signals.map((signal) => (
                  <div key={signal.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{signal.signal_definition?.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={getConfidenceColor(signal.confidence_score || 0)}>
                        {((signal.confidence_score || 0) * 100).toFixed(0)}% conf
                      </span>
                      <span className="font-medium">
                        {((signal.normalized_score || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                No 360 leadership signals available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
