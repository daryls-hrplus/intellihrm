import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Gavel, Search, Loader2, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getTodayString } from '@/utils/dateUtils';

interface ERCourtJudgementsTabProps {
  companyId: string;
}

const CATEGORIES = ['unfair_dismissal', 'discrimination', 'harassment', 'wage_dispute', 'contract_breach', 'redundancy', 'working_conditions', 'trade_union', 'other'];
const OUTCOMES = ['in_favor_employee', 'in_favor_employer', 'settled', 'dismissed', 'partially_upheld'];
const PRECEDENT_VALUES = ['high', 'medium', 'low', 'none'];

export function ERCourtJudgementsTab({ companyId }: ERCourtJudgementsTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedJudgement, setSelectedJudgement] = useState<any>(null);

  const [form, setForm] = useState({
    case_number: '',
    case_name: '',
    court_name: '',
    judgement_date: getTodayString(),
    plaintiff: '',
    defendant: '',
    judge_name: '',
    category: 'unfair_dismissal',
    industry: '',
    subject_matter: '',
    summary: '',
    full_judgement: '',
    outcome: 'in_favor_employee',
    damages_awarded: '',
    currency: 'USD',
    precedent_value: 'medium',
    keywords: '',
    document_url: '',
    is_public: true,
    source: '',
    notes: '',
  });

  // Fetch judgements
  const { data: judgements = [], isLoading } = useQuery({
    queryKey: ['industrial_court_judgements', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industrial_court_judgements')
        .select('*')
        .or(`company_id.eq.${companyId},company_id.is.null`)
        .order('judgement_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Create judgement mutation
  const createJudgement = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('industrial_court_judgements').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industrial_court_judgements'] });
      toast.success(t('employeeRelationsModule.courtJudgements.judgementAdded'));
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error(t('common.error')),
  });

  const resetForm = () => {
    setForm({
      case_number: '',
      case_name: '',
      court_name: '',
      judgement_date: getTodayString(),
      plaintiff: '',
      defendant: '',
      judge_name: '',
      category: 'unfair_dismissal',
      industry: '',
      subject_matter: '',
      summary: '',
      full_judgement: '',
      outcome: 'in_favor_employee',
      damages_awarded: '',
      currency: 'USD',
      precedent_value: 'medium',
      keywords: '',
      document_url: '',
      is_public: true,
      source: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJudgement.mutate({
      ...form,
      company_id: companyId,
      damages_awarded: form.damages_awarded ? parseFloat(form.damages_awarded) : null,
      subject_matter: form.subject_matter ? form.subject_matter.split(',').map(s => s.trim()) : [],
      keywords: form.keywords ? form.keywords.split(',').map(s => s.trim()) : [],
      created_by: user?.id,
    });
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'in_favor_employee': return 'bg-success/10 text-success border-success/20';
      case 'in_favor_employer': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'settled': return 'bg-info/10 text-info border-info/20';
      case 'dismissed': return 'bg-muted text-muted-foreground';
      case 'partially_upheld': return 'bg-warning/10 text-warning border-warning/20';
      default: return '';
    }
  };

  const getPrecedentColor = (value: string) => {
    switch (value) {
      case 'high': return 'bg-primary/10 text-primary border-primary/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground';
      case 'none': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  const filteredJudgements = judgements.filter(j => {
    const matchesSearch = 
      j.case_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.plaintiff?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.defendant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.keywords as string[] || []).some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || j.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('employeeRelationsModule.courtJudgements.title')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.courtJudgements.description')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('employeeRelationsModule.courtJudgements.addJudgement')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('employeeRelationsModule.courtJudgements.recordJudgement')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.caseNumber')} *</Label>
                    <Input
                      value={form.case_number}
                      onChange={(e) => setForm({ ...form, case_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.caseName')} *</Label>
                    <Input
                      value={form.case_name}
                      onChange={(e) => setForm({ ...form, case_name: e.target.value })}
                      placeholder="e.g., Smith v. ABC Corporation"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.courtName')} *</Label>
                    <Input
                      value={form.court_name}
                      onChange={(e) => setForm({ ...form, court_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.judgementDate')} *</Label>
                    <Input
                      type="date"
                      value={form.judgement_date}
                      onChange={(e) => setForm({ ...form, judgement_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.plaintiff')}</Label>
                    <Input
                      value={form.plaintiff}
                      onChange={(e) => setForm({ ...form, plaintiff: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.defendant')}</Label>
                    <Input
                      value={form.defendant}
                      onChange={(e) => setForm({ ...form, defendant: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.judgeName')}</Label>
                    <Input
                      value={form.judge_name}
                      onChange={(e) => setForm({ ...form, judge_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('common.category')}</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {t(`employeeRelationsModule.courtJudgements.categories.${cat}`, cat.replace(/_/g, ' '))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.outcome')} *</Label>
                    <Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {OUTCOMES.map((out) => (
                          <SelectItem key={out} value={out}>
                            {t(`employeeRelationsModule.courtJudgements.outcomes.${out}`, out.replace(/_/g, ' '))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.precedentValue')}</Label>
                    <Select value={form.precedent_value} onValueChange={(v) => setForm({ ...form, precedent_value: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRECEDENT_VALUES.map((pv) => (
                          <SelectItem key={pv} value={pv}>
                            {t(`employeeRelationsModule.courtJudgements.precedentValues.${pv}`, pv)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('common.industry')}</Label>
                    <Input
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.damagesAwarded')}</Label>
                    <Input
                      type="number"
                      value={form.damages_awarded}
                      onChange={(e) => setForm({ ...form, damages_awarded: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.currency')}</Label>
                    <Input
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('employeeRelationsModule.courtJudgements.subjectMatter')}</Label>
                  <Input
                    value={form.subject_matter}
                    onChange={(e) => setForm({ ...form, subject_matter: e.target.value })}
                    placeholder={t('employeeRelationsModule.courtJudgements.subjectMatterPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('employeeRelationsModule.courtJudgements.summary')}</Label>
                  <Textarea
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    placeholder={t('employeeRelationsModule.courtJudgements.summaryPlaceholder')}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('employeeRelationsModule.courtJudgements.keywords')}</Label>
                  <Input
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                    placeholder={t('employeeRelationsModule.courtJudgements.keywordsPlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.documentUrl')}</Label>
                    <Input
                      type="url"
                      value={form.document_url}
                      onChange={(e) => setForm({ ...form, document_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.courtJudgements.source')}</Label>
                    <Input
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={form.is_public}
                    onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isPublic" className="text-sm">{t('employeeRelationsModule.courtJudgements.makePublic')}</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createJudgement.isPending}>
                    {createJudgement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('common.create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('employeeRelationsModule.courtJudgements.searchJudgements')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('employeeRelationsModule.courtJudgements.filterByCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`employeeRelationsModule.courtJudgements.categories.${cat}`, cat.replace(/_/g, ' '))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredJudgements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('employeeRelationsModule.courtJudgements.noJudgements')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('employeeRelationsModule.courtJudgements.caseNumber')}</TableHead>
                  <TableHead>{t('employeeRelationsModule.courtJudgements.caseName')}</TableHead>
                  <TableHead>{t('employeeRelationsModule.courtJudgements.courtName')}</TableHead>
                  <TableHead>{t('common.category')}</TableHead>
                  <TableHead>{t('employeeRelationsModule.courtJudgements.outcome')}</TableHead>
                  <TableHead>{t('employeeRelationsModule.courtJudgements.precedentValue')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJudgements.map((judgement) => (
                  <TableRow key={judgement.id}>
                    <TableCell className="font-mono text-sm">{judgement.case_number}</TableCell>
                    <TableCell className="max-w-xs truncate">{judgement.case_name}</TableCell>
                    <TableCell>{judgement.court_name}</TableCell>
                    <TableCell className="capitalize">{judgement.category?.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getOutcomeColor(judgement.outcome)}>
                        {t(`employeeRelationsModule.courtJudgements.outcomes.${judgement.outcome}`, judgement.outcome.replace(/_/g, ' '))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPrecedentColor(judgement.precedent_value || '')}>
                        {judgement.precedent_value || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(judgement.judgement_date), 'PP')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setSelectedJudgement(judgement)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        {judgement.document_url && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => window.open(judgement.document_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!selectedJudgement} onOpenChange={() => setSelectedJudgement(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedJudgement?.case_name}</DialogTitle>
            </DialogHeader>
            {selectedJudgement && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.courtJudgements.caseNumber')}</Label>
                    <p className="font-mono">{selectedJudgement.case_number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.courtJudgements.courtName')}</Label>
                    <p>{selectedJudgement.court_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.courtJudgements.plaintiff')}</Label>
                    <p>{selectedJudgement.plaintiff || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.courtJudgements.defendant')}</Label>
                    <p>{selectedJudgement.defendant || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.courtJudgements.judgementDate')}</Label>
                    <p>{format(new Date(selectedJudgement.judgement_date), 'PPP')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.courtJudgements.judgeName')}</Label>
                    <p>{selectedJudgement.judge_name || '-'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('employeeRelationsModule.courtJudgements.summary')}</Label>
                  <p className="mt-1">{selectedJudgement.summary || t('common.noDescription')}</p>
                </div>
                {selectedJudgement.damages_awarded && (
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.courtJudgements.damagesAwarded')}</Label>
                    <p className="font-semibold">{selectedJudgement.currency} {selectedJudgement.damages_awarded.toLocaleString()}</p>
                  </div>
                )}
                {(selectedJudgement.keywords as string[] || []).length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.courtJudgements.keywords')}</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(selectedJudgement.keywords as string[]).map((kw, i) => (
                        <Badge key={i} variant="secondary">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
