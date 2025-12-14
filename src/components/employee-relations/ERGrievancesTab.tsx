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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Scale, FileText, Search, Loader2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ERGrievancesTabProps {
  companyId: string;
  departmentId?: string;
}

const GRIEVANCE_TYPES = ['wages', 'working_conditions', 'discrimination', 'harassment', 'unfair_treatment', 'safety', 'policy_violation', 'termination', 'other'];
const GRIEVANCE_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const GRIEVANCE_STATUSES = ['filed', 'under_review', 'in_progress', 'escalated', 'resolved', 'closed', 'withdrawn'];

export function ERGrievancesTab({ companyId, departmentId }: ERGrievancesTabProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcedureDialogOpen, setIsProcedureDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [grievanceForm, setGrievanceForm] = useState({
    employee_id: '',
    title: '',
    description: '',
    grievance_type: 'unfair_treatment',
    severity: 'medium',
    procedure_id: '',
    union_id: '',
    is_union_represented: false,
  });

  const [procedureForm, setProcedureForm] = useState({
    name: '',
    code: '',
    description: '',
    union_id: '',
    is_default: false,
  });

  // Fetch grievances
  const { data: grievances = [], isLoading: loadingGrievances } = useQuery({
    queryKey: ['grievances', companyId, departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grievances')
        .select('*, profiles(full_name), unions(name), grievance_procedures(name)')
        .eq('company_id', companyId)
        .order('filed_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Fetch procedures
  const { data: procedures = [] } = useQuery({
    queryKey: ['grievance_procedures', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grievance_procedures')
        .select('*, unions(name)')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Fetch unions
  const { data: unions = [] } = useQuery({
    queryKey: ['unions', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unions')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Fetch employees
  const { data: employees = [] } = useQuery({
    queryKey: ['employees', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Create grievance mutation
  const createGrievance = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const { error } = await supabase.from('grievances').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievances'] });
      toast.success(t('employeeRelationsModule.grievances.grievanceFiled'));
      setIsDialogOpen(false);
      resetGrievanceForm();
    },
    onError: () => toast.error(t('common.error')),
  });

  // Create procedure mutation
  const createProcedure = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('grievance_procedures').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grievance_procedures'] });
      toast.success(t('employeeRelationsModule.grievances.procedureCreated'));
      setIsProcedureDialogOpen(false);
      resetProcedureForm();
    },
    onError: () => toast.error(t('common.error')),
  });

  const resetGrievanceForm = () => {
    setGrievanceForm({
      employee_id: '',
      title: '',
      description: '',
      grievance_type: 'unfair_treatment',
      severity: 'medium',
      procedure_id: '',
      union_id: '',
      is_union_represented: false,
    });
  };

  const resetProcedureForm = () => {
    setProcedureForm({
      name: '',
      code: '',
      description: '',
      union_id: '',
      is_default: false,
    });
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGrievance.mutate({
      ...grievanceForm,
      company_id: companyId,
      procedure_id: grievanceForm.procedure_id || null,
      union_id: grievanceForm.union_id || null,
    });
  };

  const handleProcedureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProcedure.mutate({
      ...procedureForm,
      company_id: companyId,
      union_id: procedureForm.union_id || null,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed': return 'bg-info/10 text-info border-info/20';
      case 'under_review': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'escalated': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      case 'closed': return 'bg-muted text-muted-foreground';
      case 'withdrawn': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return '';
    }
  };

  const filteredGrievances = grievances.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.grievance_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('employeeRelationsModule.grievances.title')}</CardTitle>
            <CardDescription>{t('employeeRelationsModule.grievances.description')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('employeeRelationsModule.grievances.fileGrievance')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('employeeRelationsModule.grievances.fileNewGrievance')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('common.employee')} *</Label>
                      <Select 
                        value={grievanceForm.employee_id} 
                        onValueChange={(v) => setGrievanceForm({ ...grievanceForm, employee_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.selectEmployee')} />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.grievances.grievanceType')} *</Label>
                      <Select 
                        value={grievanceForm.grievance_type} 
                        onValueChange={(v) => setGrievanceForm({ ...grievanceForm, grievance_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GRIEVANCE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {t(`employeeRelationsModule.grievances.types.${type}`, type.replace(/_/g, ' '))}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.grievances.grievanceTitle')} *</Label>
                    <Input
                      value={grievanceForm.title}
                      onChange={(e) => setGrievanceForm({ ...grievanceForm, title: e.target.value })}
                      placeholder={t('employeeRelationsModule.grievances.titlePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.description')} *</Label>
                    <Textarea
                      value={grievanceForm.description}
                      onChange={(e) => setGrievanceForm({ ...grievanceForm, description: e.target.value })}
                      placeholder={t('employeeRelationsModule.grievances.descriptionPlaceholder')}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.grievances.severity')}</Label>
                      <Select 
                        value={grievanceForm.severity} 
                        onValueChange={(v) => setGrievanceForm({ ...grievanceForm, severity: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GRIEVANCE_SEVERITIES.map((sev) => (
                            <SelectItem key={sev} value={sev}>
                              {t(`employeeRelationsModule.cases.severities.${sev}`, sev)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.grievances.procedure')}</Label>
                      <Select 
                        value={grievanceForm.procedure_id} 
                        onValueChange={(v) => setGrievanceForm({ ...grievanceForm, procedure_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('employeeRelationsModule.grievances.selectProcedure')} />
                        </SelectTrigger>
                        <SelectContent>
                          {procedures.map((proc: any) => (
                            <SelectItem key={proc.id} value={proc.id}>{proc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('employeeRelationsModule.unions.union')}</Label>
                      <Select 
                        value={grievanceForm.union_id} 
                        onValueChange={(v) => setGrievanceForm({ ...grievanceForm, union_id: v, is_union_represented: !!v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('employeeRelationsModule.grievances.selectUnion')} />
                        </SelectTrigger>
                        <SelectContent>
                          {unions.map((union: any) => (
                            <SelectItem key={union.id} value={union.id}>{union.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <input
                        type="checkbox"
                        id="unionRep"
                        checked={grievanceForm.is_union_represented}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, is_union_represented: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="unionRep" className="text-sm">{t('employeeRelationsModule.grievances.unionRepresented')}</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={createGrievance.isPending}>
                      {createGrievance.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('employeeRelationsModule.grievances.file')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isProcedureDialogOpen} onOpenChange={setIsProcedureDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  {t('employeeRelationsModule.grievances.newProcedure')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('employeeRelationsModule.grievances.createProcedure')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleProcedureSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('common.name')} *</Label>
                      <Input
                        value={procedureForm.name}
                        onChange={(e) => setProcedureForm({ ...procedureForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.code')} *</Label>
                      <Input
                        value={procedureForm.code}
                        onChange={(e) => setProcedureForm({ ...procedureForm, code: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.description')}</Label>
                    <Textarea
                      value={procedureForm.description}
                      onChange={(e) => setProcedureForm({ ...procedureForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('employeeRelationsModule.grievances.associatedUnion')}</Label>
                    <Select 
                      value={procedureForm.union_id} 
                      onValueChange={(v) => setProcedureForm({ ...procedureForm, union_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('employeeRelationsModule.grievances.selectUnion')} />
                      </SelectTrigger>
                      <SelectContent>
                        {unions.map((union: any) => (
                          <SelectItem key={union.id} value={union.id}>{union.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={procedureForm.is_default}
                      onChange={(e) => setProcedureForm({ ...procedureForm, is_default: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isDefault" className="text-sm">{t('employeeRelationsModule.grievances.setAsDefault')}</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsProcedureDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={createProcedure.isPending}>
                      {createProcedure.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('common.create')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grievances" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grievances" className="gap-2">
              <Scale className="h-4 w-4" />
              {t('employeeRelationsModule.grievances.grievances')} ({grievances.length})
            </TabsTrigger>
            <TabsTrigger value="procedures" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              {t('employeeRelationsModule.grievances.procedures')} ({procedures.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grievances">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('employeeRelationsModule.grievances.searchGrievances')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('employeeRelationsModule.cases.filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('employeeRelationsModule.cases.allStatuses')}</SelectItem>
                    {GRIEVANCE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`employeeRelationsModule.grievances.statuses.${status}`, status.replace(/_/g, ' '))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loadingGrievances ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredGrievances.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('employeeRelationsModule.grievances.noGrievances')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('employeeRelationsModule.grievances.grievanceNumber')}</TableHead>
                      <TableHead>{t('common.employee')}</TableHead>
                      <TableHead>{t('employeeRelationsModule.grievances.grievanceTitle')}</TableHead>
                      <TableHead>{t('common.type')}</TableHead>
                      <TableHead>{t('employeeRelationsModule.grievances.severity')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('employeeRelationsModule.grievances.filedDate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrievances.map((grievance: any) => (
                      <TableRow key={grievance.id}>
                        <TableCell className="font-mono text-sm">{grievance.grievance_number}</TableCell>
                        <TableCell>{grievance.profiles?.full_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {grievance.title}
                            {grievance.is_union_represented && (
                              <Badge variant="outline" className="text-xs">
                                {t('employeeRelationsModule.grievances.union')}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{grievance.grievance_type.replace(/_/g, ' ')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(grievance.severity)}>
                            {t(`employeeRelationsModule.cases.severities.${grievance.severity}`, grievance.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(grievance.status)}>
                            {t(`employeeRelationsModule.grievances.statuses.${grievance.status}`, grievance.status.replace(/_/g, ' '))}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(grievance.filed_date), 'PP')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="procedures">
            {procedures.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('employeeRelationsModule.grievances.noProcedures')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.code')}</TableHead>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('employeeRelationsModule.grievances.associatedUnion')}</TableHead>
                    <TableHead>{t('employeeRelationsModule.grievances.default')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {procedures.map((proc: any) => (
                    <TableRow key={proc.id}>
                      <TableCell className="font-mono">{proc.code}</TableCell>
                      <TableCell>{proc.name}</TableCell>
                      <TableCell>{proc.unions?.name || '-'}</TableCell>
                      <TableCell>
                        {proc.is_default && <Badge variant="secondary">Default</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={proc.is_active ? 'default' : 'secondary'}>
                          {proc.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
