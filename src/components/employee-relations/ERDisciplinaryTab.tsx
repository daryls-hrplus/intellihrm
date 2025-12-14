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
import { Plus, Search, Loader2, Scale, CheckCircle } from 'lucide-react';
import { useEmployeeRelations } from '@/hooks/useEmployeeRelations';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const ACTION_TYPES = ['verbal_warning', 'written_warning', 'final_warning', 'suspension', 'demotion', 'termination'];
const SEVERITIES = ['minor', 'moderate', 'major', 'severe'];

interface ERDisciplinaryTabProps {
  companyId?: string;
}

export function ERDisciplinaryTab({ companyId }: ERDisciplinaryTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { disciplinaryActions, loadingDisciplinary, createDisciplinaryAction, updateDisciplinaryAction } = useEmployeeRelations(companyId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    employee_id: '',
    action_type: 'verbal_warning',
    severity: 'minor',
    reason: '',
    description: '',
    effective_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
  });

  const filteredActions = disciplinaryActions.filter(a => 
    a.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !user?.id) return;

    await createDisciplinaryAction.mutateAsync({
      company_id: companyId,
      ...formData,
      issued_by: user.id,
      expiry_date: formData.expiry_date || null,
    });

    setIsDialogOpen(false);
    setFormData({
      employee_id: '',
      action_type: 'verbal_warning',
      severity: 'minor',
      reason: '',
      description: '',
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
    });
  };

  const handleAcknowledge = async (id: string) => {
    await updateDisciplinaryAction.mutateAsync({
      id,
      acknowledged_by_employee: true,
      acknowledged_at: new Date().toISOString(),
    });
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'verbal_warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'written_warning': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'final_warning': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'suspension': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'demotion': return 'bg-info/10 text-info border-info/20';
      case 'termination': return 'bg-destructive text-destructive-foreground';
      default: return '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-success/10 text-success border-success/20';
      case 'moderate': return 'bg-warning/10 text-warning border-warning/20';
      case 'major': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'severe': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return '';
    }
  };

  if (loadingDisciplinary) {
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
              <Scale className="h-5 w-5" />
              {t('employeeRelationsModule.disciplinary.title')}
            </CardTitle>
            <CardDescription>{t('employeeRelationsModule.disciplinary.description')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('employeeRelationsModule.disciplinary.newAction')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('employeeRelationsModule.disciplinary.recordAction')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.disciplinary.actionType')} *</Label>
                    <Select value={formData.action_type} onValueChange={(v) => setFormData({ ...formData, action_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {t(`employeeRelationsModule.disciplinary.types.${type}`, { defaultValue: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.cases.severity')} *</Label>
                    <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SEVERITIES.map(sev => (
                          <SelectItem key={sev} value={sev}>
                            {t(`employeeRelationsModule.disciplinary.severities.${sev}`, { defaultValue: sev.charAt(0).toUpperCase() + sev.slice(1) })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('employeeRelationsModule.disciplinary.reason')} *</Label>
                  <Input
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder={t('employeeRelationsModule.disciplinary.reasonPlaceholder')}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.disciplinary.effectiveDate')} *</Label>
                    <Input
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.disciplinary.expiryDate')}</Label>
                    <Input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.description')}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('employeeRelationsModule.disciplinary.additionalDetails')}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" disabled={createDisciplinaryAction.isPending}>
                    {createDisciplinaryAction.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              placeholder={t('employeeRelationsModule.disciplinary.searchActions')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredActions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('employeeRelationsModule.disciplinary.noActions')}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.employee')}</TableHead>
                <TableHead>{t('employeeRelationsModule.disciplinary.actionType')}</TableHead>
                <TableHead>{t('employeeRelationsModule.cases.severity')}</TableHead>
                <TableHead>{t('employeeRelationsModule.disciplinary.reason')}</TableHead>
                <TableHead>{t('employeeRelationsModule.disciplinary.effectiveDate')}</TableHead>
                <TableHead>{t('employeeRelationsModule.disciplinary.acknowledged')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map(action => (
                <TableRow key={action.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{action.employee?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{action.employee?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getActionTypeColor(action.action_type)}>
                      {t(`employeeRelationsModule.disciplinary.types.${action.action_type}`, { defaultValue: action.action_type.replace(/_/g, ' ') })}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getSeverityColor(action.severity)}>
                      {t(`employeeRelationsModule.disciplinary.severities.${action.severity}`, { defaultValue: action.severity })}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{action.reason}</TableCell>
                  <TableCell>{format(new Date(action.effective_date), 'PP')}</TableCell>
                  <TableCell>
                    {action.acknowledged_by_employee ? (
                      <div className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">{action.acknowledged_at ? format(new Date(action.acknowledged_at), 'PP') : t('common.yes')}</span>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleAcknowledge(action.id)}>
                        {t('employeeRelationsModule.disciplinary.acknowledge')}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={action.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                      {action.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
