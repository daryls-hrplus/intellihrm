import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Plus, Search, Loader2, LogOut, Eye, Star } from 'lucide-react';
import { useEmployeeRelations, ERExitInterview } from '@/hooks/useEmployeeRelations';
import { useAuth } from '@/contexts/AuthContext';
import { getTodayString, formatDateForDisplay } from '@/utils/dateUtils';

const DEPARTURE_REASONS = ['resignation', 'retirement', 'termination', 'layoff', 'other'];
const STATUSES = ['scheduled', 'completed', 'cancelled'];

interface ERExitInterviewsTabProps {
  companyId?: string;
}

export function ERExitInterviewsTab({ companyId }: ERExitInterviewsTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { exitInterviews, loadingExitInterviews, createExitInterview, updateExitInterview } = useEmployeeRelations(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<ERExitInterview | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    employee_id: '',
    interview_date: getTodayString(),
    departure_reason: '',
    last_working_date: '',
  });

  const [conductFormData, setConductFormData] = useState({
    would_rejoin: false,
    overall_satisfaction: 3,
    management_satisfaction: 3,
    culture_satisfaction: 3,
    compensation_satisfaction: 3,
    growth_satisfaction: 3,
    worklife_balance_satisfaction: 3,
    feedback_summary: '',
    improvement_suggestions: '',
    positive_aspects: '',
    negative_aspects: '',
  });

  const filteredInterviews = exitInterviews.filter(i => 
    i.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !user?.id) return;

    await createExitInterview.mutateAsync({
      company_id: companyId,
      ...formData,
      interviewer_id: user.id,
      departure_reason: formData.departure_reason || null,
      last_working_date: formData.last_working_date || null,
    });

    setIsDialogOpen(false);
    setFormData({
      employee_id: '',
      interview_date: getTodayString(),
      departure_reason: '',
      last_working_date: '',
    });
  };

  const handleConductInterview = async () => {
    if (!selectedInterview) return;

    await updateExitInterview.mutateAsync({
      id: selectedInterview.id,
      ...conductFormData,
      status: 'completed',
    });

    setIsViewDialogOpen(false);
    setSelectedInterview(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-info/10 text-info border-info/20';
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  const renderStars = (value: number | null) => {
    if (!value) return '-';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`h-3 w-3 ${i <= value ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
        ))}
      </div>
    );
  };

  if (loadingExitInterviews) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              {t('employeeRelationsModule.exitInterviews.title')}
            </CardTitle>
            <CardDescription>{t('employeeRelationsModule.exitInterviews.description')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('employeeRelationsModule.exitInterviews.scheduleInterview')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('employeeRelationsModule.exitInterviews.scheduleExitInterview')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.exitInterviews.interviewDate')} *</Label>
                    <Input
                      type="date"
                      value={formData.interview_date}
                      onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.exitInterviews.lastWorkingDate')}</Label>
                    <Input
                      type="date"
                      value={formData.last_working_date}
                      onChange={(e) => setFormData({ ...formData, last_working_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('employeeRelationsModule.exitInterviews.departureReason')}</Label>
                  <Select value={formData.departure_reason} onValueChange={(v) => setFormData({ ...formData, departure_reason: v })}>
                    <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                    <SelectContent>
                      {DEPARTURE_REASONS.map(reason => (
                        <SelectItem key={reason} value={reason}>
                          {t(`employeeRelationsModule.exitInterviews.reasons.${reason}`, { defaultValue: reason.charAt(0).toUpperCase() + reason.slice(1) })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" disabled={createExitInterview.isPending}>
                    {createExitInterview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('common.create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('employeeRelationsModule.exitInterviews.searchInterviews')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredInterviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <LogOut className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('employeeRelationsModule.exitInterviews.noInterviews')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.employee')}</TableHead>
                <TableHead>{t('employeeRelationsModule.exitInterviews.interviewDate')}</TableHead>
                <TableHead>{t('employeeRelationsModule.exitInterviews.lastWorkingDate')}</TableHead>
                <TableHead>{t('employeeRelationsModule.exitInterviews.departureReason')}</TableHead>
                <TableHead>{t('employeeRelationsModule.exitInterviews.overallScore')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.map(interview => (
                <TableRow key={interview.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{interview.employee?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{interview.employee?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateForDisplay(interview.interview_date, 'PP')}</TableCell>
                  <TableCell>{interview.last_working_date ? formatDateForDisplay(interview.last_working_date, 'PP') : '-'}</TableCell>
                  <TableCell className="capitalize">
                    {interview.departure_reason ? t(`employeeRelationsModule.exitInterviews.reasons.${interview.departure_reason}`, { defaultValue: interview.departure_reason }) : '-'}
                  </TableCell>
                  <TableCell>{renderStars(interview.overall_satisfaction)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(interview.status)}>
                      {t(`employeeRelationsModule.exitInterviews.statuses.${interview.status}`, { defaultValue: interview.status })}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelectedInterview(interview); setIsViewDialogOpen(true); }}
                    >
                      {interview.status === 'scheduled' ? t('employeeRelationsModule.exitInterviews.conductInterview') : <Eye className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* View/Conduct Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedInterview?.status === 'scheduled' 
                  ? t('employeeRelationsModule.exitInterviews.conductInterview') 
                  : t('employeeRelationsModule.exitInterviews.interviewDetails')}
              </DialogTitle>
            </DialogHeader>
            {selectedInterview && (
              <div className="space-y-4">
                {selectedInterview.status === 'scheduled' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {['overall', 'management', 'culture', 'compensation', 'growth', 'worklife_balance'].map(area => (
                        <div key={area} className="space-y-2">
                          <Label className="capitalize">
                            {t(`employeeRelationsModule.exitInterviews.satisfaction.${area}`, { defaultValue: area.replace('_', ' ') })} (1-5)
                          </Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              value={[(conductFormData as any)[`${area}_satisfaction`]]}
                              min={1}
                              max={5}
                              step={1}
                              onValueChange={([v]) => setConductFormData({ ...conductFormData, [`${area}_satisfaction`]: v })}
                              className="flex-1"
                            />
                            <span className="w-8 text-center font-medium">{(conductFormData as any)[`${area}_satisfaction`]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.exitInterviews.wouldRejoin')}</Label>
                      <Select 
                        value={conductFormData.would_rejoin ? 'yes' : 'no'} 
                        onValueChange={(v) => setConductFormData({ ...conductFormData, would_rejoin: v === 'yes' })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">{t('common.yes')}</SelectItem>
                          <SelectItem value="no">{t('common.no')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.exitInterviews.positiveAspects')}</Label>
                      <Textarea
                        value={conductFormData.positive_aspects}
                        onChange={(e) => setConductFormData({ ...conductFormData, positive_aspects: e.target.value })}
                        placeholder={t('employeeRelationsModule.exitInterviews.positiveAspectsPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.exitInterviews.negativeAspects')}</Label>
                      <Textarea
                        value={conductFormData.negative_aspects}
                        onChange={(e) => setConductFormData({ ...conductFormData, negative_aspects: e.target.value })}
                        placeholder={t('employeeRelationsModule.exitInterviews.negativeAspectsPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.exitInterviews.improvementSuggestions')}</Label>
                      <Textarea
                        value={conductFormData.improvement_suggestions}
                        onChange={(e) => setConductFormData({ ...conductFormData, improvement_suggestions: e.target.value })}
                        placeholder={t('employeeRelationsModule.exitInterviews.improvementSuggestionsPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.exitInterviews.summary')}</Label>
                      <Textarea
                        value={conductFormData.feedback_summary}
                        onChange={(e) => setConductFormData({ ...conductFormData, feedback_summary: e.target.value })}
                        placeholder={t('employeeRelationsModule.exitInterviews.summaryPlaceholder')}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>{t('common.cancel')}</Button>
                      <Button onClick={handleConductInterview} disabled={updateExitInterview.isPending}>
                        {updateExitInterview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('employeeRelationsModule.exitInterviews.completeInterview')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-muted-foreground">{t('employeeRelationsModule.exitInterviews.satisfaction.overall')}</Label>{renderStars(selectedInterview.overall_satisfaction)}</div>
                    <div><Label className="text-muted-foreground">{t('employeeRelationsModule.exitInterviews.satisfaction.management')}</Label>{renderStars(selectedInterview.management_satisfaction)}</div>
                    <div><Label className="text-muted-foreground">{t('employeeRelationsModule.exitInterviews.satisfaction.culture')}</Label>{renderStars(selectedInterview.culture_satisfaction)}</div>
                    <div><Label className="text-muted-foreground">{t('employeeRelationsModule.exitInterviews.satisfaction.compensation')}</Label>{renderStars(selectedInterview.compensation_satisfaction)}</div>
                    <div><Label className="text-muted-foreground">{t('employeeRelationsModule.exitInterviews.satisfaction.growth')}</Label>{renderStars(selectedInterview.growth_satisfaction)}</div>
                    <div><Label className="text-muted-foreground">{t('employeeRelationsModule.exitInterviews.satisfaction.worklife_balance')}</Label>{renderStars(selectedInterview.worklife_balance_satisfaction)}</div>
                    <div className="col-span-2"><Label className="text-muted-foreground">{t('employeeRelationsModule.exitInterviews.wouldRejoin')}</Label><p>{selectedInterview.would_rejoin ? t('common.yes') : t('common.no')}</p></div>
                    {selectedInterview.feedback_summary && (
                      <div className="col-span-2"><Label className="text-muted-foreground">{t('employeeRelationsModule.exitInterviews.summary')}</Label><p className="text-sm">{selectedInterview.feedback_summary}</p></div>
                    )}
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
