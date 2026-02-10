import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Award,
  Users,
  AlertTriangle,
  Loader2,
  Star,
  Scale,
  DoorOpen,
  BarChart3
} from 'lucide-react';
import { useEmployeeRelations } from '@/hooks/useEmployeeRelations';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getTodayString, formatDateForDisplay } from '@/utils/dateUtils';

const RECOGNITION_TYPES = ['spot_award', 'peer_recognition', 'team_achievement', 'service_milestone', 'innovation', 'customer_service', 'leadership', 'other'];
const RECOGNITION_CATEGORIES = ['excellence', 'teamwork', 'innovation', 'customer_focus', 'leadership', 'integrity', 'other'];

export default function MssEmployeeRelationsPage() {
  const { t } = useTranslation();
  const { user, company } = useAuth();
  const [directReports, setDirectReports] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [isRecognitionDialogOpen, setIsRecognitionDialogOpen] = useState(false);

  const [recognitionForm, setRecognitionForm] = useState({
    employee_id: '',
    recognition_type: 'spot_award',
    category: 'excellence',
    title: '',
    description: '',
    is_public: true,
    monetary_value: '',
  });

  const { 
    cases,
    recognitions,
    disciplinaryActions,
    exitInterviews,
    surveys,
    loadingCases,
    loadingRecognition,
    loadingDisciplinary,
    loadingExitInterviews,
    loadingSurveys,
    createRecognition,
  } = useEmployeeRelations(company?.id);

  const breadcrumbItems = [
    { label: t('common.home'), href: '/' },
    { label: t('mss.title'), href: '/mss' },
    { label: t('mss.teamRelations.title') },
  ];

  // Fetch direct reports
  useEffect(() => {
    if (user?.id) {
      supabase.rpc('get_manager_direct_reports', { p_manager_id: user.id })
        .then(({ data, error }) => {
          if (!error && data) {
            setDirectReports(data.map((d: any) => ({
              id: d.employee_id,
              full_name: d.employee_name,
              email: d.employee_email,
            })));
          }
        });
    }
  }, [user?.id]);

  const directReportIds = directReports.map(d => d.id);

  // Filter to team data
  const teamCases = cases.filter(c => directReportIds.includes(c.employee_id));
  const teamRecognitions = recognitions.filter(r => directReportIds.includes(r.employee_id));
  const teamDisciplinary = disciplinaryActions.filter(d => directReportIds.includes(d.employee_id));
  const teamExitInterviews = exitInterviews.filter(e => directReportIds.includes(e.employee_id));
  const activeSurveys = surveys.filter(s => s.status === 'active' || s.status === 'completed');

  const handleRecognitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !company?.id) return;

    await createRecognition.mutateAsync({
      company_id: company.id,
      employee_id: recognitionForm.employee_id,
      awarded_by: user.id,
      recognition_type: recognitionForm.recognition_type,
      category: recognitionForm.category,
      title: recognitionForm.title,
      description: recognitionForm.description || undefined,
      is_public: recognitionForm.is_public,
      monetary_value: recognitionForm.monetary_value ? parseFloat(recognitionForm.monetary_value) : undefined,
      award_date: getTodayString(),
    });

    setIsRecognitionDialogOpen(false);
    setRecognitionForm({
      employee_id: '',
      recognition_type: 'spot_award',
      category: 'excellence',
      title: '',
      description: '',
      is_public: true,
      monetary_value: '',
    });
    toast.success(t('mss.teamRelations.recognitionSuccess'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress': return 'bg-info/10 text-info border-info/20';
      case 'resolved': case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  const isLoading = loadingCases || loadingRecognition || loadingDisciplinary || loadingExitInterviews || loadingSurveys;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-8 w-8" />
              {t('mss.teamRelations.title')}
            </h1>
            <p className="text-muted-foreground">{t('mss.teamRelations.subtitle')}</p>
          </div>
          <Dialog open={isRecognitionDialogOpen} onOpenChange={setIsRecognitionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={directReports.length === 0}>
                <Award className="h-4 w-4" />
                {t('mss.teamRelations.giveRecognition')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('mss.teamRelations.recognizeTeamMember')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRecognitionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('mss.teamRelations.teamMember')} *</Label>
                  <Select 
                    value={recognitionForm.employee_id} 
                    onValueChange={(v) => setRecognitionForm({ ...recognitionForm, employee_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('mss.teamRelations.selectTeamMember')} />
                    </SelectTrigger>
                    <SelectContent>
                      {directReports.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('mss.teamRelations.recognitionTitle')} *</Label>
                  <Input
                    value={recognitionForm.title}
                    onChange={(e) => setRecognitionForm({ ...recognitionForm, title: e.target.value })}
                    placeholder="e.g., Outstanding Customer Service"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('mss.teamRelations.recognitionType')}</Label>
                    <Select 
                      value={recognitionForm.recognition_type} 
                      onValueChange={(v) => setRecognitionForm({ ...recognitionForm, recognition_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RECOGNITION_TYPES.map((rt) => (
                          <SelectItem key={rt} value={rt}>
                            {rt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('mss.teamRelations.category')}</Label>
                    <Select 
                      value={recognitionForm.category} 
                      onValueChange={(v) => setRecognitionForm({ ...recognitionForm, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RECOGNITION_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('mss.teamRelations.description')}</Label>
                  <Textarea
                    value={recognitionForm.description}
                    onChange={(e) => setRecognitionForm({ ...recognitionForm, description: e.target.value })}
                    placeholder={t('mss.teamRelations.description')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('mss.teamRelations.monetaryValue')}</Label>
                    <Input
                      type="number"
                      value={recognitionForm.monetary_value}
                      onChange={(e) => setRecognitionForm({ ...recognitionForm, monetary_value: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      type="checkbox"
                      id="public"
                      checked={recognitionForm.is_public}
                      onChange={(e) => setRecognitionForm({ ...recognitionForm, is_public: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="public" className="text-sm">{t('mss.teamRelations.makePublic')}</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsRecognitionDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createRecognition.isPending || !recognitionForm.employee_id}>
                    {createRecognition.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('mss.teamRelations.awardRecognition')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mss.teamRelations.directReports')}</p>
                  <p className="text-2xl font-bold">{directReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mss.teamRelations.openTeamCases')}</p>
                  <p className="text-2xl font-bold">{teamCases.filter(c => c.status === 'open').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-success/10">
                  <Award className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('mss.teamRelations.recognitionGiven')}</p>
                  <p className="text-2xl font-bold">{teamRecognitions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <Scale className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Disciplinary</p>
                  <p className="text-2xl font-bold">{teamDisciplinary.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-info/10">
                  <DoorOpen className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Exits</p>
                  <p className="text-2xl font-bold">{teamExitInterviews.filter(e => e.status !== 'completed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recognition" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="recognition" className="gap-2">
              <Award className="h-4 w-4" />
              {t('mss.teamRelations.teamRecognition')} ({teamRecognitions.length})
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t('mss.teamRelations.teamCases')} ({teamCases.length})
            </TabsTrigger>
            <TabsTrigger value="disciplinary" className="gap-2">
              <Scale className="h-4 w-4" />
              Team Disciplinary ({teamDisciplinary.length})
            </TabsTrigger>
            <TabsTrigger value="exits" className="gap-2">
              <DoorOpen className="h-4 w-4" />
              Team Exits ({teamExitInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Team Sentiment
            </TabsTrigger>
          </TabsList>

          {/* ==================== RECOGNITION TAB ==================== */}
          <TabsContent value="recognition">
            <Card>
              <CardHeader>
                <CardTitle>{t('mss.teamRelations.teamRecognition')}</CardTitle>
                <CardDescription>{t('mss.teamRelations.teamRecognitionDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {teamRecognitions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('mss.teamRelations.noRecognitionYet')}</p>
                    <p className="text-sm">{t('mss.teamRelations.useGiveRecognition')}</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {teamRecognitions.map((rec) => (
                      <Card key={rec.id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-amber-500/20">
                              <Star className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{rec.title}</h4>
                              <p className="text-sm font-medium text-foreground">{rec.employee?.full_name}</p>
                              <p className="text-sm text-muted-foreground capitalize">{rec.recognition_type.replace(/_/g, ' ')}</p>
                              {rec.description && (
                                <p className="mt-2 text-sm">{rec.description}</p>
                              )}
                              <div className="mt-3 text-xs text-muted-foreground">
                                {formatDateForDisplay(rec.award_date, 'PP')}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== CASES TAB ==================== */}
          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>{t('mss.teamRelations.teamCases')}</CardTitle>
                <CardDescription>{t('mss.teamRelations.teamCasesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {teamCases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('mss.teamRelations.noCases')}</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('mss.teamRelations.caseNumber')}</TableHead>
                        <TableHead>{t('common.employee')}</TableHead>
                        <TableHead>{t('mss.teamRelations.caseTitle')}</TableHead>
                        <TableHead>{t('mss.teamRelations.caseType')}</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead>{t('mss.teamRelations.reported')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamCases.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-sm">{c.case_number}</TableCell>
                          <TableCell>{c.employee?.full_name}</TableCell>
                          <TableCell>{c.title}</TableCell>
                          <TableCell className="capitalize">{c.case_type.replace(/_/g, ' ')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(c.status)}>
                              {c.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateForDisplay(c.reported_date, 'PP')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== TEAM DISCIPLINARY TAB (NEW) ==================== */}
          <TabsContent value="disciplinary">
            <Card>
              <CardHeader>
                <CardTitle>Team Disciplinary Actions</CardTitle>
                <CardDescription>Disciplinary actions for your direct reports</CardDescription>
              </CardHeader>
              <CardContent>
                {teamDisciplinary.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No disciplinary actions for your team</p>
                    <p className="text-sm">All team members have a clean record</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Action Type</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Issued Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Acknowledged</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamDisciplinary.map((action) => (
                        <TableRow key={action.id}>
                          <TableCell className="font-medium">{action.employee?.full_name}</TableCell>
                          <TableCell className="capitalize">{action.action_type.replace(/_/g, ' ')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              action.severity === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                              action.severity === 'high' ? 'bg-warning/10 text-warning border-warning/20' :
                              action.severity === 'medium' ? 'bg-info/10 text-info border-info/20' :
                              'bg-muted text-muted-foreground'
                            }>
                              {action.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{action.reason}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDateForDisplay(action.issued_date, 'PP')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(action.status)}>
                              {action.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={action.acknowledged_by_employee ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
                              {action.acknowledged_by_employee ? 'Yes' : 'Pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== TEAM EXITS TAB (NEW) ==================== */}
          <TabsContent value="exits">
            <Card>
              <CardHeader>
                <CardTitle>Team Exit Interviews</CardTitle>
                <CardDescription>Exit interviews for departing team members</CardDescription>
              </CardHeader>
              <CardContent>
                {teamExitInterviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <DoorOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No exit interviews for your team</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {teamExitInterviews.map((interview) => (
                      <Card key={interview.id} className="border-border">
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{interview.employee?.full_name}</h4>
                            <Badge variant="outline" className={getStatusColor(interview.status)}>
                              {interview.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Interview Date</p>
                              <p className="font-medium">{formatDateForDisplay(interview.interview_date, 'PP')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Interviewer</p>
                              <p className="font-medium">{interview.interviewer?.full_name || 'TBD'}</p>
                            </div>
                            {interview.departure_reason && (
                              <div>
                                <p className="text-muted-foreground">Departure Reason</p>
                                <p className="font-medium capitalize">{interview.departure_reason.replace(/_/g, ' ')}</p>
                              </div>
                            )}
                            {interview.last_working_date && (
                              <div>
                                <p className="text-muted-foreground">Last Working Date</p>
                                <p className="font-medium">{formatDateForDisplay(interview.last_working_date, 'PP')}</p>
                              </div>
                            )}
                          </div>
                          {interview.overall_satisfaction != null && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Satisfaction</p>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= (interview.overall_satisfaction || 0)
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-muted-foreground/30'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm">{interview.overall_satisfaction}/5</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== TEAM SENTIMENT TAB (NEW) ==================== */}
          <TabsContent value="sentiment">
            <Card>
              <CardHeader>
                <CardTitle>Team Sentiment Overview</CardTitle>
                <CardDescription>Survey participation and wellness engagement for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Survey Participation */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Recent Surveys</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activeSurveys.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No surveys available</p>
                      ) : (
                        <div className="space-y-3">
                          {activeSurveys.slice(0, 5).map((survey) => (
                            <div key={survey.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="text-sm font-medium">{survey.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">{survey.survey_type.replace(/_/g, ' ')}</p>
                              </div>
                              <Badge variant="outline" className={getStatusColor(survey.status)}>
                                {survey.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Team Health Summary */}
                  <Card className="border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Team Health Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Team Size</span>
                          <span className="font-semibold">{directReports.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Open Cases</span>
                          <span className="font-semibold">{teamCases.filter(c => c.status === 'open').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Active Disciplinary</span>
                          <span className="font-semibold">{teamDisciplinary.filter(d => d.status === 'active' || d.status === 'open').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Pending Exits</span>
                          <span className="font-semibold">{teamExitInterviews.filter(e => e.status !== 'completed').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Recognition Given</span>
                          <span className="font-semibold">{teamRecognitions.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
