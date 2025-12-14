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
  Plus, 
  Award,
  Users,
  AlertTriangle,
  Loader2,
  Star
} from 'lucide-react';
import { useEmployeeRelations } from '@/hooks/useEmployeeRelations';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
    loadingCases,
    loadingRecognition,
    createRecognition,
  } = useEmployeeRelations(company?.id);

  const breadcrumbItems = [
    { label: t('common.home'), path: '/' },
    { label: t('mss.title'), path: '/mss' },
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
      award_date: new Date().toISOString().split('T')[0],
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
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  const isLoading = loadingCases || loadingRecognition;

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
                        {RECOGNITION_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>

        <Tabs defaultValue="recognition" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recognition" className="gap-2">
              <Award className="h-4 w-4" />
              {t('mss.teamRelations.teamRecognition')} ({teamRecognitions.length})
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t('mss.teamRelations.teamCases')} ({teamCases.length})
            </TabsTrigger>
          </TabsList>

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
                                {format(new Date(rec.award_date), 'PP')}
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
        </Tabs>
      </div>
    </AppLayout>
  );
}
