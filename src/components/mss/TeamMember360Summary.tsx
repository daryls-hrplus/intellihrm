import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  Users, 
  User, 
  UserCircle, 
  TrendingUp, 
  Shield,
  Lightbulb,
  AlertCircle,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Results360DevelopmentBridge } from '@/components/feedback/development/Results360DevelopmentBridge';
import { DevelopmentThemeApproval } from './DevelopmentThemeApproval';
import { InvestigationModePanel } from '@/components/feedback/cycles/InvestigationModePanel';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TeamMember360SummaryProps {
  employeeId: string;
  employeeName: string;
  companyId: string;
  managerId: string;
}

interface Participation {
  id: string;
  status: string;
  overall_score: number | null;
  review_cycle_id: string;
  review_cycle: {
    id: string;
    name: string;
    status: string;
  };
}

interface FeedbackItem {
  question_id: string;
  question_text: string;
  competency_name: string | null;
  reviewer_type: string;
  avg_rating: number | null;
  response_count: number;
  text_responses: string[] | null;
  is_suppressed: boolean;
  suppression_reason: string | null;
}

interface DevelopmentSignal {
  id: string;
  signal_code: string;
  signal_name: string;
  category: string;
  score: number;
  benchmark_score?: number;
  gap?: number;
}

const reviewerTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  self: { label: 'Self', icon: <User className="h-4 w-4" /> },
  manager: { label: 'Manager', icon: <UserCircle className="h-4 w-4" /> },
  peer: { label: 'Peers', icon: <Users className="h-4 w-4" /> },
  direct_report: { label: 'Direct Reports', icon: <TrendingUp className="h-4 w-4" /> },
};

export function TeamMember360Summary({ 
  employeeId, 
  employeeName, 
  companyId, 
  managerId 
}: TeamMember360SummaryProps) {
  const navigate = useNavigate();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [selectedParticipation, setSelectedParticipation] = useState<string>('');
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showThemeGeneration, setShowThemeGeneration] = useState(false);

  useEffect(() => {
    loadParticipations();
  }, [employeeId]);

  useEffect(() => {
    if (selectedParticipation) {
      fetchFeedback();
    }
  }, [selectedParticipation]);

  const loadParticipations = async () => {
    try {
      const { data, error } = await supabase
        .from('review_participants')
        .select(`
          id,
          status,
          overall_score,
          review_cycle_id,
          review_cycle:review_cycles(id, name, status)
        `)
        .eq('employee_id', employeeId)
        .in('status', ['completed', 'pending_results'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map((p: any) => ({
        id: p.id,
        status: p.status,
        overall_score: p.overall_score,
        review_cycle_id: p.review_cycle_id,
        review_cycle: p.review_cycle,
      }));
      
      setParticipations(formatted);
      
      if (formatted.length > 0 && !selectedParticipation) {
        setSelectedParticipation(formatted[0].id);
      }
    } catch (error) {
      console.error('Error loading participations:', error);
      toast.error('Failed to load 360 feedback cycles');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_360_feedback_summary', {
        p_participant_id: selectedParticipation,
      });

      if (error) throw error;
      setFeedback((data as FeedbackItem[]) || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback summary');
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Group feedback by competency and calculate averages
  const averagesByType = feedback.reduce((acc, item) => {
    if (item.avg_rating && !item.is_suppressed) {
      if (!acc[item.reviewer_type]) {
        acc[item.reviewer_type] = { total: 0, count: 0, responseCount: 0 };
      }
      acc[item.reviewer_type].total += item.avg_rating;
      acc[item.reviewer_type].count += 1;
      acc[item.reviewer_type].responseCount += item.response_count;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number; responseCount: number }>);

  const overallAverages = Object.entries(averagesByType).map(([type, data]) => ({
    type,
    average: data.total / data.count,
    responseCount: data.responseCount,
  }));

  // Convert feedback to signals for development bridge (using unique id per competency)
  const signalsForDevelopment: DevelopmentSignal[] = Object.entries(
    feedback.reduce((acc, item) => {
      const key = item.competency_name || item.question_text;
      if (!acc[key] && !item.is_suppressed && item.avg_rating) {
        acc[key] = {
          id: item.question_id,
          signal_code: item.question_id,
          signal_name: key,
          category: item.reviewer_type,
          score: item.avg_rating,
          benchmark_score: 3.5,
          gap: 3.5 - item.avg_rating,
        };
      }
      return acc;
    }, {} as Record<string, DevelopmentSignal>)
  ).map(([, signal]) => signal);

  const selectedCycle = participations.find(p => p.id === selectedParticipation);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (participations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold">No 360° Feedback Available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {employeeName} has no completed 360° feedback cycles yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cycle Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Review Cycle:</label>
          <Select value={selectedParticipation} onValueChange={setSelectedParticipation}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a review cycle" />
            </SelectTrigger>
            <SelectContent>
              {participations.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.review_cycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowThemeGeneration(!showThemeGeneration)}
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          {showThemeGeneration ? 'Hide Theme Tools' : 'Generate Development Themes'}
        </Button>
      </div>

      {feedbackLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : feedback.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No feedback data available for this review cycle.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Anonymity Notice */}
          <Card className="bg-muted/30 border-muted">
            <CardContent className="py-3 px-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <strong>Anonymity Protected:</strong> Categories with fewer than the required 
                number of responses are automatically hidden to protect reviewer anonymity. 
                You will see "Insufficient responses" for those categories.
              </div>
            </CardContent>
          </Card>

          {/* Overall Scores by Source */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(reviewerTypeLabels).map(([type, config]) => {
              const typeData = overallAverages.find(a => a.type === type);
              const hasSuppressed = feedback.some(f => f.reviewer_type === type && f.is_suppressed);
              
              return (
                <Card key={type}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          {config.icon}
                          {config.label}
                        </p>
                        {typeData ? (
                          <p className="text-2xl font-bold">{typeData.average.toFixed(1)}</p>
                        ) : hasSuppressed ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Shield className="h-4 w-4" />
                                  <span className="text-sm">Protected</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Insufficient responses for anonymity threshold</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <p className="text-sm text-muted-foreground">No data</p>
                        )}
                      </div>
                      {typeData && (
                        <Badge variant="outline" className="text-xs">
                          {typeData.responseCount} responses
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detailed Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feedback by Competency</CardTitle>
              <CardDescription>
                Aggregated scores from all reviewer types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  feedback.reduce((acc, item) => {
                    const key = item.competency_name || 'General';
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(item);
                    return acc;
                  }, {} as Record<string, FeedbackItem[]>)
                ).map(([competency, items]) => (
                  <div key={competency} className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium">{competency}</h4>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {items.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-2 rounded ${
                            item.is_suppressed 
                              ? 'bg-muted/50 opacity-60' 
                              : 'bg-muted/30'
                          }`}
                        >
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            {reviewerTypeLabels[item.reviewer_type]?.icon}
                            {reviewerTypeLabels[item.reviewer_type]?.label}
                          </span>
                          {item.is_suppressed ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Shield className="h-3 w-3" />
                                    <span className="text-xs">Protected</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.suppression_reason}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : item.avg_rating ? (
                            <div className="flex items-center gap-2">
                              <Progress value={(item.avg_rating / 5) * 100} className="w-12 h-2" />
                              <span className="text-sm font-medium w-8">{item.avg_rating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Generation Section */}
          {showThemeGeneration && selectedCycle && (
            <div className="space-y-6">
              <Results360DevelopmentBridge
                cycleId={selectedCycle.review_cycle_id}
                employeeId={employeeId}
                companyId={companyId}
                signals={signalsForDevelopment}
              />
              
              <DevelopmentThemeApproval
                employeeId={employeeId}
                managerId={managerId}
                onThemeUpdated={() => {
                  // Refresh if needed
                }}
              />
            </div>
          )}

          {/* Investigation Access Panel - Only for completed cycles */}
          {selectedCycle && selectedCycle.review_cycle.status === 'completed' && (
            <InvestigationModePanel
              cycleId={selectedCycle.review_cycle_id}
              cycleName={selectedCycle.review_cycle.name}
              companyId={companyId}
              cycleStatus={selectedCycle.review_cycle.status}
              targetEmployeeId={employeeId}
              targetEmployeeName={employeeName}
            />
          )}

          {/* Cross-link to Continuous Feedback */}
          <Card className="bg-muted/30">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Based on these 360 insights, you can also provide continuous feedback to {employeeName}.
                </p>
              </div>
              <Button variant="link" size="sm" onClick={() => navigate('/mss/feedback')}>
                Give Continuous Feedback
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
