import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown, TrendingUp, Minus, Bell, Mail, UserPlus, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RiskPrediction {
  id: string;
  employee_id: string;
  course_id: string | null;
  risk_score: number;
  risk_level: string;
  risk_factors: Record<string, unknown>;
  predicted_completion_probability: number | null;
  days_behind_schedule: number | null;
  engagement_trend: string | null;
  last_activity_at: string | null;
  intervention_recommended: string | null;
  prediction_date: string;
  profiles?: { full_name: string; email: string };
  lms_courses?: { title: string };
}

interface Intervention {
  id: string;
  prediction_id: string;
  intervention_type: string;
  intervention_status: string;
  scheduled_at: string | null;
  executed_at: string | null;
  outcome: string | null;
}

export function CompletionRiskDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<RiskPrediction | null>(null);
  const [showInterventionDialog, setShowInterventionDialog] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['completion-risk-predictions', riskFilter],
    queryFn: async () => {
      let query = supabase
        .from('completion_risk_predictions')
        .select(`
          *,
          profiles:employee_id (full_name, email),
          lms_courses:course_id (title)
        `)
        .order('risk_score', { ascending: false });

      if (riskFilter !== 'all') {
        query = query.eq('risk_level', riskFilter);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as RiskPrediction[];
    },
  });

  const { data: interventions = [] } = useQuery({
    queryKey: ['risk-interventions', selectedPrediction?.id],
    queryFn: async () => {
      if (!selectedPrediction) return [];
      const { data, error } = await supabase
        .from('risk_interventions')
        .select('*')
        .eq('prediction_id', selectedPrediction.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Intervention[];
    },
    enabled: !!selectedPrediction,
  });

  const { data: alertRules = [] } = useQuery({
    queryKey: ['risk-alert-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_alert_rules')
        .select('*')
        .order('risk_threshold', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createInterventionMutation = useMutation({
    mutationFn: async ({ predictionId, type }: { predictionId: string; type: string }) => {
      const { data, error } = await supabase
        .from('risk_interventions')
        .insert({
          prediction_id: predictionId,
          intervention_type: type,
          intervention_status: 'scheduled',
          scheduled_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-interventions'] });
      setShowInterventionDialog(false);
      toast.success('Intervention scheduled!');
    },
    onError: (error) => {
      toast.error('Failed to schedule intervention: ' + error.message);
    },
  });

  const getRiskBadge = (level: string) => {
    const variants: Record<string, { class: string; icon: React.ReactNode }> = {
      low: { class: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      medium: { class: 'bg-yellow-100 text-yellow-800', icon: <Minus className="h-3 w-3" /> },
      high: { class: 'bg-orange-100 text-orange-800', icon: <AlertTriangle className="h-3 w-3" /> },
      critical: { class: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
    };
    const config = variants[level] || variants.medium;
    return (
      <Badge className={config.class} variant="outline">
        <span className="flex items-center gap-1">
          {config.icon}
          {level}
        </span>
      </Badge>
    );
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getInterventionIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      email_reminder: <Mail className="h-4 w-4" />,
      manager_alert: <Bell className="h-4 w-4" />,
      mentor_assignment: <UserPlus className="h-4 w-4" />,
      deadline_extension: <Clock className="h-4 w-4" />,
    };
    return icons[type] || <Bell className="h-4 w-4" />;
  };

  const riskStats = {
    critical: predictions.filter(p => p.risk_level === 'critical').length,
    high: predictions.filter(p => p.risk_level === 'high').length,
    medium: predictions.filter(p => p.risk_level === 'medium').length,
    low: predictions.filter(p => p.risk_level === 'low').length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle>Completion Risk Predictions</CardTitle>
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>
          AI-powered predictions for training completion risk with automated intervention recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="predictions">All Predictions</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
            <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-red-600">{riskStats.critical}</p>
                      <p className="text-sm text-muted-foreground">Critical Risk</p>
                    </div>
                    <div className="p-3 rounded-full bg-red-100">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-orange-600">{riskStats.high}</p>
                      <p className="text-sm text-muted-foreground">High Risk</p>
                    </div>
                    <div className="p-3 rounded-full bg-orange-100">
                      <AlertTriangle className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-yellow-600">{riskStats.medium}</p>
                      <p className="text-sm text-muted-foreground">Medium Risk</p>
                    </div>
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Minus className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-green-600">{riskStats.low}</p>
                      <p className="text-sm text-muted-foreground">Low Risk</p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h3 className="font-semibold mb-3">Critical & High Risk Learners</h3>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading predictions...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Learner</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Days Behind</TableHead>
                    <TableHead>Recommended</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions
                    .filter(p => p.risk_level === 'critical' || p.risk_level === 'high')
                    .slice(0, 10)
                    .map((prediction) => (
                      <TableRow key={prediction.id}>
                        <TableCell className="font-medium">
                          {prediction.profiles?.full_name || 'Unknown'}
                        </TableCell>
                        <TableCell>{prediction.lms_courses?.title || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={prediction.risk_score} className="w-16 h-2" />
                            <span className="text-sm">{prediction.risk_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getRiskBadge(prediction.risk_level)}</TableCell>
                        <TableCell>{getTrendIcon(prediction.engagement_trend)}</TableCell>
                        <TableCell>
                          {prediction.days_behind_schedule !== null 
                            ? `${prediction.days_behind_schedule} days`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {prediction.intervention_recommended || 'None'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedPrediction(prediction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Dialog open={showInterventionDialog && selectedPrediction?.id === prediction.id} onOpenChange={setShowInterventionDialog}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedPrediction(prediction);
                                    setShowInterventionDialog(true);
                                  }}
                                >
                                  <Bell className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Schedule Intervention</DialogTitle>
                                  <DialogDescription>
                                    Choose an intervention for {prediction.profiles?.full_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-3 py-4">
                                  {[
                                    { type: 'email_reminder', label: 'Email Reminder', icon: <Mail /> },
                                    { type: 'manager_alert', label: 'Alert Manager', icon: <Bell /> },
                                    { type: 'mentor_assignment', label: 'Assign Mentor', icon: <UserPlus /> },
                                    { type: 'deadline_extension', label: 'Extend Deadline', icon: <Clock /> },
                                  ].map((intervention) => (
                                    <Button
                                      key={intervention.type}
                                      variant="outline"
                                      className="h-20 flex flex-col gap-2"
                                      onClick={() => createInterventionMutation.mutate({
                                        predictionId: prediction.id,
                                        type: intervention.type,
                                      })}
                                      disabled={createInterventionMutation.isPending}
                                    >
                                      {intervention.icon}
                                      <span className="text-xs">{intervention.label}</span>
                                    </Button>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Learner</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Completion Prob.</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell className="font-medium">
                        {prediction.profiles?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{prediction.lms_courses?.title || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={prediction.risk_score} className="w-16 h-2" />
                          <span className="text-sm">{prediction.risk_score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRiskBadge(prediction.risk_level)}</TableCell>
                      <TableCell>
                        {prediction.predicted_completion_probability !== null
                          ? `${prediction.predicted_completion_probability}%`
                          : '-'}
                      </TableCell>
                      <TableCell>{getTrendIcon(prediction.engagement_trend)}</TableCell>
                      <TableCell>
                        {prediction.last_activity_at
                          ? new Date(prediction.last_activity_at).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="interventions" className="mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4" />
              <p>Select a prediction to view intervention history</p>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Auto Intervention</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.rule_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">&gt;= {rule.risk_threshold}%</Badge>
                    </TableCell>
                    <TableCell>{(rule.alert_recipients as string[])?.join(', ') || '-'}</TableCell>
                    <TableCell>{rule.auto_intervention_type || 'None'}</TableCell>
                    <TableCell>
                      {rule.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
