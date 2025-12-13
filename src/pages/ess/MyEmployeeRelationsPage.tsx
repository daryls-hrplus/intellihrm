import { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Heart, 
  Plus, 
  Award,
  MessageSquare,
  Activity,
  AlertTriangle,
  Loader2,
  Star
} from 'lucide-react';
import { useEmployeeRelations } from '@/hooks/useEmployeeRelations';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

const CASE_TYPES = ['grievance', 'complaint', 'harassment', 'discrimination', 'workplace_safety', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export default function MyEmployeeRelationsPage() {
  const { t } = useTranslation();
  const { user, company } = useAuth();
  const [isGrievanceDialogOpen, setIsGrievanceDialogOpen] = useState(false);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [surveyResponses, setSurveyResponses] = useState<Record<string, any>>({});

  const [grievanceForm, setGrievanceForm] = useState({
    title: '',
    description: '',
    case_type: 'grievance',
    severity: 'medium',
    is_confidential: false,
  });

  const { 
    cases,
    recognitions, 
    surveys,
    wellnessPrograms,
    loadingCases,
    loadingRecognition,
    loadingSurveys,
    loadingWellness,
    createCase,
  } = useEmployeeRelations(company?.id);

  const breadcrumbItems = [
    { label: t('common.home'), path: '/' },
    { label: 'Employee Self Service', path: '/ess' },
    { label: 'Employee Relations' },
  ];

  // Filter to current user's data
  const myCases = cases.filter(c => c.employee_id === user?.id || c.reported_by === user?.id);
  const myRecognitions = recognitions.filter(r => r.employee_id === user?.id);
  const activeSurveys = surveys.filter(s => s.status === 'active');
  const activeWellnessPrograms = wellnessPrograms.filter(w => w.status === 'active');

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !company?.id) return;

    await createCase.mutateAsync({
      company_id: company.id,
      employee_id: user.id,
      reported_by: user.id,
      title: grievanceForm.title,
      description: grievanceForm.description,
      case_type: grievanceForm.case_type,
      severity: grievanceForm.severity,
      is_confidential: grievanceForm.is_confidential,
      reported_date: new Date().toISOString().split('T')[0],
      status: 'open',
    });

    setIsGrievanceDialogOpen(false);
    setGrievanceForm({
      title: '',
      description: '',
      case_type: 'grievance',
      severity: 'medium',
      is_confidential: false,
    });
    toast.success('Your case has been submitted and will be reviewed by HR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress': return 'bg-info/10 text-info border-info/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  const isLoading = loadingCases || loadingRecognition || loadingSurveys || loadingWellness;

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
              Employee Relations
            </h1>
            <p className="text-muted-foreground">View recognition, submit concerns, and participate in surveys</p>
          </div>
          <Dialog open={isGrievanceDialogOpen} onOpenChange={setIsGrievanceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Report a Concern
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report a Workplace Concern</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={grievanceForm.title}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, title: e.target.value })}
                    placeholder="Brief description of the concern"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={grievanceForm.case_type} 
                      onValueChange={(v) => setGrievanceForm({ ...grievanceForm, case_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CASE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select 
                      value={grievanceForm.severity} 
                      onValueChange={(v) => setGrievanceForm({ ...grievanceForm, severity: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={grievanceForm.description}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
                    placeholder="Please describe your concern in detail..."
                    rows={4}
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confidential"
                    checked={grievanceForm.is_confidential}
                    onChange={(e) => setGrievanceForm({ ...grievanceForm, is_confidential: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="confidential" className="text-sm">Keep my identity confidential</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsGrievanceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCase.isPending}>
                    {createCase.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-warning/10">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Cases</p>
                  <p className="text-2xl font-bold">{myCases.filter(c => c.status === 'open').length}</p>
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
                  <p className="text-sm text-muted-foreground">Recognition Received</p>
                  <p className="text-2xl font-bold">{myRecognitions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-info/10">
                  <MessageSquare className="h-6 w-6 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Surveys</p>
                  <p className="text-2xl font-bold">{activeSurveys.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wellness Programs</p>
                  <p className="text-2xl font-bold">{activeWellnessPrograms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="recognition" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recognition" className="gap-2">
              <Award className="h-4 w-4" />
              My Recognition ({myRecognitions.length})
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              My Cases ({myCases.length})
            </TabsTrigger>
            <TabsTrigger value="surveys" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Surveys ({activeSurveys.length})
            </TabsTrigger>
            <TabsTrigger value="wellness" className="gap-2">
              <Activity className="h-4 w-4" />
              Wellness ({activeWellnessPrograms.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recognition">
            <Card>
              <CardHeader>
                <CardTitle>Recognition & Awards</CardTitle>
                <CardDescription>Recognition you've received from colleagues and management</CardDescription>
              </CardHeader>
              <CardContent>
                {myRecognitions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recognition received yet</p>
                    <p className="text-sm">Keep up the great work!</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {myRecognitions.map((rec) => (
                      <Card key={rec.id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-amber-500/20">
                              <Star className="h-6 w-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{rec.title}</h4>
                              <p className="text-sm text-muted-foreground capitalize">{rec.recognition_type.replace(/_/g, ' ')}</p>
                              {rec.description && (
                                <p className="mt-2 text-sm">{rec.description}</p>
                              )}
                              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                <span>From: {rec.awarder?.full_name || 'Anonymous'}</span>
                                <span>{format(new Date(rec.award_date), 'PP')}</span>
                              </div>
                              {rec.monetary_value && (
                                <Badge variant="secondary" className="mt-2">
                                  {rec.currency} {rec.monetary_value.toLocaleString()}
                                </Badge>
                              )}
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

          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>My Cases</CardTitle>
                <CardDescription>Track the status of your submitted concerns</CardDescription>
              </CardHeader>
              <CardContent>
                {myCases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No cases submitted</p>
                    <p className="text-sm">Use "Report a Concern" if you need to raise an issue</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case #</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myCases.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono text-sm">{c.case_number}</TableCell>
                          <TableCell>{c.title}</TableCell>
                          <TableCell className="capitalize">{c.case_type.replace(/_/g, ' ')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(c.status)}>
                              {c.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(c.reported_date), 'PP')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surveys">
            <Card>
              <CardHeader>
                <CardTitle>Active Surveys</CardTitle>
                <CardDescription>Participate in employee feedback surveys</CardDescription>
              </CardHeader>
              <CardContent>
                {activeSurveys.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active surveys at this time</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeSurveys.map((survey) => (
                      <Card key={survey.id}>
                        <CardContent className="pt-6">
                          <h4 className="font-semibold">{survey.title}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{survey.survey_type.replace(/_/g, ' ')}</p>
                          {survey.description && (
                            <p className="mt-2 text-sm">{survey.description}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Ends: {format(new Date(survey.end_date), 'PP')}
                            </span>
                            <Button size="sm">Take Survey</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wellness">
            <Card>
              <CardHeader>
                <CardTitle>Wellness Programs</CardTitle>
                <CardDescription>Available wellness initiatives you can participate in</CardDescription>
              </CardHeader>
              <CardContent>
                {activeWellnessPrograms.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active wellness programs</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeWellnessPrograms.map((program) => (
                      <Card key={program.id}>
                        <CardContent className="pt-6">
                          <h4 className="font-semibold">{program.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{program.program_type.replace(/_/g, ' ')}</p>
                          {program.description && (
                            <p className="mt-2 text-sm">{program.description}</p>
                          )}
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {program.enrollment_count || 0} enrolled
                              {program.max_participants && ` / ${program.max_participants} max`}
                            </span>
                            <Button size="sm" variant="outline">Enroll</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
