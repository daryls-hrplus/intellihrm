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
import { Plus, Search, Loader2, Eye, AlertCircle } from 'lucide-react';
import { useEmployeeRelations, ERCase } from '@/hooks/useEmployeeRelations';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { getTodayString } from '@/utils/dateUtils';

const CASE_TYPES = ['grievance', 'complaint', 'investigation', 'harassment', 'discrimination', 'conflict'];
const CATEGORIES = ['workplace_safety', 'harassment', 'discrimination', 'policy_violation', 'manager_conflict', 'peer_conflict', 'compensation', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['open', 'investigating', 'pending_resolution', 'resolved', 'closed', 'escalated', 'appealed'];

interface ERCasesTabProps {
  companyId?: string;
}

export function ERCasesTab({ companyId }: ERCasesTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cases, loadingCases, createCase, updateCase } = useEmployeeRelations(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ERCase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    employee_id: '',
    case_type: 'grievance',
    category: '',
    severity: 'medium',
    title: '',
    description: '',
    target_resolution_date: '',
  });

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !user?.id) return;

    await createCase.mutateAsync({
      company_id: companyId,
      ...formData,
      reported_by: user.id,
    });

    setIsDialogOpen(false);
    setFormData({
      employee_id: '',
      case_type: 'grievance',
      category: '',
      severity: 'medium',
      title: '',
      description: '',
      target_resolution_date: '',
    });
  };

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    const updates: Partial<ERCase> = { status: newStatus };
    if (newStatus === 'resolved' || newStatus === 'closed') {
      updates.actual_resolution_date = getTodayString();
    }
    await updateCase.mutateAsync({ id: caseId, ...updates });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-info/10 text-info border-info/20';
      case 'investigating': return 'bg-warning/10 text-warning border-warning/20';
      case 'pending_resolution': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      case 'closed': return 'bg-muted text-muted-foreground';
      case 'escalated': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'appealed': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return '';
    }
  };

  if (loadingCases) {
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
              <AlertCircle className="h-5 w-5" />
              {t('employeeRelationsModule.cases.title')}
            </CardTitle>
            <CardDescription>{t('employeeRelationsModule.cases.description')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('employeeRelationsModule.cases.newCase')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('employeeRelationsModule.cases.createNewCase')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('employeeRelationsModule.cases.caseTitle')} *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('employeeRelationsModule.cases.briefTitle')}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.cases.caseType')} *</Label>
                    <Select value={formData.case_type} onValueChange={(v) => setFormData({ ...formData, case_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CASE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {t(`employeeRelationsModule.cases.types.${type}`, { defaultValue: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.category')}</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue placeholder={t('common.select')} /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {t(`employeeRelationsModule.cases.categories.${cat}`, { defaultValue: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.cases.severity')} *</Label>
                    <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SEVERITIES.map(sev => (
                          <SelectItem key={sev} value={sev}>
                            {t(`employeeRelationsModule.cases.severities.${sev}`, { defaultValue: sev.charAt(0).toUpperCase() + sev.slice(1) })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.cases.targetResolutionDate')}</Label>
                    <Input
                      type="date"
                      value={formData.target_resolution_date}
                      onChange={(e) => setFormData({ ...formData, target_resolution_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.description')}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('employeeRelationsModule.cases.detailedDescription')}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" disabled={createCase.isPending}>
                    {createCase.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('common.create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('employeeRelationsModule.cases.searchCases')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('employeeRelationsModule.cases.filterByStatus')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('employeeRelationsModule.cases.allStatuses')}</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s}>
                  {t(`employeeRelationsModule.cases.statuses.${s}`, { defaultValue: s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredCases.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('employeeRelationsModule.cases.noCases')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employeeRelationsModule.cases.caseNumber')}</TableHead>
                <TableHead>{t('employeeRelationsModule.cases.caseTitle')}</TableHead>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead>{t('employeeRelationsModule.cases.severity')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('employeeRelationsModule.cases.reportedDate')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.case_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{c.title}</p>
                      {c.employee && <p className="text-xs text-muted-foreground">{c.employee.full_name}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {t(`employeeRelationsModule.cases.types.${c.case_type}`, { defaultValue: c.case_type.replace('_', ' ') })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSeverityColor(c.severity)}>
                      {t(`employeeRelationsModule.cases.severities.${c.severity}`, { defaultValue: c.severity })}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={c.status} onValueChange={(v) => handleStatusChange(c.id, v)}>
                      <SelectTrigger className="w-[140px] h-8">
                        <Badge variant="outline" className={getStatusColor(c.status)}>
                          {t(`employeeRelationsModule.cases.statuses.${c.status}`, { defaultValue: c.status.replace(/_/g, ' ') })}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(s => (
                          <SelectItem key={s} value={s}>
                            {t(`employeeRelationsModule.cases.statuses.${s}`, { defaultValue: s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(c.reported_date), 'PP')}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelectedCase(c); setIsViewDialogOpen(true); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* View Case Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('employeeRelationsModule.cases.caseDetails')} - {selectedCase?.case_number}</DialogTitle>
            </DialogHeader>
            {selectedCase && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.cases.caseTitle')}</Label>
                    <p className="font-medium">{selectedCase.title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('common.employee')}</Label>
                    <p>{selectedCase.employee?.full_name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('common.type')}</Label>
                    <p className="capitalize">{t(`employeeRelationsModule.cases.types.${selectedCase.case_type}`, { defaultValue: selectedCase.case_type.replace('_', ' ') })}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('common.category')}</Label>
                    <p className="capitalize">{selectedCase.category ? t(`employeeRelationsModule.cases.categories.${selectedCase.category}`, { defaultValue: selectedCase.category.replace(/_/g, ' ') }) : '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.cases.severity')}</Label>
                    <Badge variant="outline" className={getSeverityColor(selectedCase.severity)}>
                      {t(`employeeRelationsModule.cases.severities.${selectedCase.severity}`, { defaultValue: selectedCase.severity })}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('common.status')}</Label>
                    <Badge variant="outline" className={getStatusColor(selectedCase.status)}>
                      {t(`employeeRelationsModule.cases.statuses.${selectedCase.status}`, { defaultValue: selectedCase.status.replace(/_/g, ' ') })}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.cases.reportedDate')}</Label>
                    <p>{format(new Date(selectedCase.reported_date), 'PPP')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.cases.targetResolutionDate')}</Label>
                    <p>{selectedCase.target_resolution_date ? format(new Date(selectedCase.target_resolution_date), 'PPP') : '-'}</p>
                  </div>
                </div>
                {selectedCase.description && (
                  <div>
                    <Label className="text-muted-foreground">{t('common.description')}</Label>
                    <p className="mt-1 text-sm">{selectedCase.description}</p>
                  </div>
                )}
                {selectedCase.resolution_summary && (
                  <div>
                    <Label className="text-muted-foreground">{t('employeeRelationsModule.cases.resolutionSummary')}</Label>
                    <p className="mt-1 text-sm">{selectedCase.resolution_summary}</p>
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
