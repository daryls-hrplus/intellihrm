import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { 
  Sparkles, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Target,
  DollarSign,
  Users,
  Heart,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Check,
  X,
  Calendar,
  TrendingUp
} from "lucide-react";

interface AISchedulerTabProps {
  companyId: string | null;
}

interface ScheduleRun {
  id: string;
  schedule_start_date: string;
  schedule_end_date: string;
  status: string;
  optimization_goal: string;
  total_recommendations: number | null;
  coverage_score: number | null;
  preference_score: number | null;
  constraint_violations: number | null;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

interface Recommendation {
  id: string;
  employee_id: string;
  shift_id: string;
  recommended_date: string;
  start_time: string | null;
  end_time: string | null;
  confidence_score: number | null;
  reasoning: string | null;
  is_accepted: boolean | null;
  profile: { full_name: string } | null;
  shift: { name: string; code: string; color: string } | null;
}

export function AISchedulerTab({ companyId }: AISchedulerTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState("generate");
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [optimizationGoal, setOptimizationGoal] = useState<string>("balanced");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  // Fetch schedule runs
  const { data: scheduleRuns = [], isLoading: runsLoading } = useQuery({
    queryKey: ['ai-schedule-runs', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('ai_schedule_runs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as ScheduleRun[];
    },
    enabled: !!companyId,
    refetchInterval: 5000 // Poll for status updates
  });

  // Fetch recommendations for selected run
  const { data: recommendations = [], isLoading: recsLoading } = useQuery({
    queryKey: ['ai-schedule-recommendations', selectedRunId],
    queryFn: async () => {
      if (!selectedRunId) return [];
      const { data, error } = await supabase
        .from('ai_schedule_recommendations')
        .select(`
          *,
          profile:profiles(full_name),
          shift:shifts(name, code, color)
        `)
        .eq('schedule_run_id', selectedRunId)
        .order('recommended_date', { ascending: true });
      if (error) throw error;
      return data as Recommendation[];
    },
    enabled: !!selectedRunId
  });

  // Generate schedule mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error('No company selected');

      // Create run record
      const { data: run, error: runError } = await supabase
        .from('ai_schedule_runs')
        .insert({
          company_id: companyId,
          schedule_start_date: startDate,
          schedule_end_date: endDate,
          optimization_goal: optimizationGoal,
          status: 'pending'
        })
        .select()
        .single();

      if (runError) throw runError;

      // Call edge function
      const { error: funcError } = await supabase.functions.invoke('ai-shift-scheduler', {
        body: {
          companyId,
          startDate,
          endDate,
          optimizationGoal,
          runId: run.id
        }
      });

      if (funcError) throw funcError;

      return run;
    },
    onSuccess: (run) => {
      toast.success(t('timeAttendance.shifts.aiScheduler.generationStarted'));
      setSelectedRunId(run.id);
      setActiveSubTab('results');
      queryClient.invalidateQueries({ queryKey: ['ai-schedule-runs'] });
    },
    onError: (error) => {
      console.error('Schedule generation error:', error);
      toast.error(t('common.error'));
    }
  });

  // Accept/reject recommendation
  const updateRecommendation = useMutation({
    mutationFn: async ({ id, accepted, reason }: { id: string; accepted: boolean; reason?: string }) => {
      const { error } = await supabase
        .from('ai_schedule_recommendations')
        .update({ 
          is_accepted: accepted,
          rejection_reason: accepted ? null : reason
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-schedule-recommendations'] });
    }
  });

  // Apply accepted recommendations
  const applyRecommendations = useMutation({
    mutationFn: async () => {
      if (!selectedRunId || !companyId) throw new Error('No run selected');

      const acceptedRecs = recommendations.filter(r => r.is_accepted === true);
      
      for (const rec of acceptedRecs) {
        await supabase
          .from('employee_shift_assignments')
          .insert({
            company_id: companyId,
            employee_id: rec.employee_id,
            shift_id: rec.shift_id,
            effective_date: rec.recommended_date,
            is_primary: false,
            notes: `AI generated - ${rec.reasoning}`
          });
      }

      // Update run as applied
      await supabase
        .from('ai_schedule_runs')
        .update({ 
          status: 'applied',
          applied_at: new Date().toISOString()
        })
        .eq('id', selectedRunId);

      return acceptedRecs.length;
    },
    onSuccess: (count) => {
      toast.success(`Applied ${count} shift assignments`);
      queryClient.invalidateQueries({ queryKey: ['ai-schedule-runs'] });
      queryClient.invalidateQueries({ queryKey: ['shift-calendar-assignments'] });
    },
    onError: (error) => {
      console.error('Apply error:', error);
      toast.error(t('common.error'));
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      running: { variant: "default", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
      completed: { variant: "outline", icon: <CheckCircle className="h-3 w-3 text-success" /> },
      applied: { variant: "default", icon: <Check className="h-3 w-3" /> },
      failed: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> }
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getGoalIcon = (goal: string) => {
    const icons: Record<string, React.ReactNode> = {
      cost: <DollarSign className="h-4 w-4" />,
      coverage: <Users className="h-4 w-4" />,
      preference: <Heart className="h-4 w-4" />,
      balanced: <Target className="h-4 w-4" />
    };
    return icons[goal] || icons.balanced;
  };

  const selectedRun = scheduleRuns.find(r => r.id === selectedRunId);
  const acceptedCount = recommendations.filter(r => r.is_accepted === true).length;
  const rejectedCount = recommendations.filter(r => r.is_accepted === false).length;
  const pendingCount = recommendations.filter(r => r.is_accepted === null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{t('timeAttendance.shifts.aiScheduler.title')}</h2>
            <p className="text-muted-foreground">
              {t('timeAttendance.shifts.aiScheduler.description')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            {t('timeAttendance.shifts.aiScheduler.generate')}
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {t('timeAttendance.shifts.aiScheduler.results')}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('timeAttendance.shifts.aiScheduler.history')}
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('timeAttendance.shifts.aiScheduler.configureSchedule')}</CardTitle>
              <CardDescription>
                {t('timeAttendance.shifts.aiScheduler.configureDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('common.startDate')}</Label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.endDate')}</Label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('timeAttendance.shifts.aiScheduler.optimizationGoal')}</Label>
                <div className="grid gap-3 md:grid-cols-4">
                  {['balanced', 'coverage', 'preference', 'cost'].map((goal) => (
                    <Card 
                      key={goal}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        optimizationGoal === goal ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setOptimizationGoal(goal)}
                    >
                      <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                        {getGoalIcon(goal)}
                        <span className="font-medium capitalize">{goal}</span>
                        <span className="text-xs text-muted-foreground">
                          {goal === 'balanced' && 'Balance all factors'}
                          {goal === 'coverage' && 'Maximize coverage'}
                          {goal === 'preference' && 'Employee preferences'}
                          {goal === 'cost' && 'Minimize costs'}
                        </span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || !companyId}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('timeAttendance.shifts.aiScheduler.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('timeAttendance.shifts.aiScheduler.generateSchedule')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {selectedRun ? (
            <>
              {/* Run Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Period</p>
                      <p className="font-medium">
                        {format(new Date(selectedRun.schedule_start_date), 'MMM d')} - {format(new Date(selectedRun.schedule_end_date), 'MMM d')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Coverage Score</p>
                      <p className="font-medium">{selectedRun.coverage_score ?? '-'}%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Preference Score</p>
                      <p className="font-medium">{selectedRun.preference_score ?? '-'}%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Violations</p>
                      <p className="font-medium">{selectedRun.constraint_violations ?? 0}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Review Progress */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Review Recommendations</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-success/10 text-success">
                          {acceptedCount} Accepted
                        </Badge>
                        <Badge variant="outline" className="bg-destructive/10 text-destructive">
                          {rejectedCount} Rejected
                        </Badge>
                        <Badge variant="secondary">
                          {pendingCount} Pending
                        </Badge>
                      </div>
                      <Button
                        onClick={() => applyRecommendations.mutate()}
                        disabled={acceptedCount === 0 || applyRecommendations.isPending || selectedRun.status === 'applied'}
                      >
                        {applyRecommendations.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Apply {acceptedCount} Assignments
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {recsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {selectedRun.status === 'running' ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p>Generating schedule...</p>
                        </>
                      ) : selectedRun.status === 'failed' ? (
                        <>
                          <XCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                          <p>{selectedRun.error_message || 'Generation failed'}</p>
                        </>
                      ) : (
                        <p>No recommendations yet</p>
                      )}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Shift</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Reasoning</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recommendations.map((rec) => (
                          <TableRow key={rec.id} className={
                            rec.is_accepted === true ? 'bg-success/5' : 
                            rec.is_accepted === false ? 'bg-destructive/5' : ''
                          }>
                            <TableCell className="font-medium">
                              {rec.profile?.full_name || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              {format(new Date(rec.recommended_date), 'EEE, MMM d')}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                style={{ borderColor: rec.shift?.color }}
                              >
                                {rec.shift?.name || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {rec.start_time?.slice(0, 5)} - {rec.end_time?.slice(0, 5)}
                            </TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Progress 
                                      value={(rec.confidence_score || 0) * 100} 
                                      className="w-16 h-2"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {Math.round((rec.confidence_score || 0) * 100)}% confidence
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                              {rec.reasoning}
                            </TableCell>
                            <TableCell>
                              {rec.is_accepted === null ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-success hover:bg-success/10"
                                    onClick={() => updateRecommendation.mutate({ id: rec.id, accepted: true })}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => updateRecommendation.mutate({ id: rec.id, accepted: false })}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Badge variant={rec.is_accepted ? "default" : "destructive"}>
                                  {rec.is_accepted ? 'Accepted' : 'Rejected'}
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-4" />
                <p>Generate a schedule or select a run from history to view results</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('timeAttendance.shifts.aiScheduler.runHistory')}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['ai-schedule-runs'] })}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : scheduleRuns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No schedule runs yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Goal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recommendations</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduleRuns.map((run) => (
                      <TableRow 
                        key={run.id} 
                        className={selectedRunId === run.id ? 'bg-muted/50' : ''}
                      >
                        <TableCell className="font-medium">
                          {format(new Date(run.schedule_start_date), 'MMM d')} - {format(new Date(run.schedule_end_date), 'MMM d')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getGoalIcon(run.optimization_goal)}
                            <span className="capitalize">{run.optimization_goal}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(run.status)}</TableCell>
                        <TableCell>{run.total_recommendations ?? '-'}</TableCell>
                        <TableCell>{run.coverage_score ? `${run.coverage_score}%` : '-'}</TableCell>
                        <TableCell>{format(new Date(run.created_at), 'MMM d, h:mm a')}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRunId(run.id);
                              setActiveSubTab('results');
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
