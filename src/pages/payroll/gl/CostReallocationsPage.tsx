import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PayrollFilters, usePayrollFilters } from '@/components/payroll/PayrollFilters';

interface CostCenter {
  id: string;
  cost_center_code: string;
  cost_center_name: string;
}

interface Reallocation {
  id: string;
  company_id: string;
  rule_name: string;
  rule_code: string;
  description: string | null;
  source_cost_center_id: string;
  allocation_method: string;
  is_active: boolean;
  effective_date: string;
  end_date: string | null;
}

interface ReallocationTarget {
  id: string;
  reallocation_id: string;
  target_cost_center_id: string;
  allocation_percentage: number | null;
  allocation_amount: number | null;
  notes: string | null;
  is_active: boolean;
}

const CostReallocationsPage = () => {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [reallocations, setReallocations] = useState<Reallocation[]>([]);
  const [targets, setTargets] = useState<Record<string, ReallocationTarget[]>>({});
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRules, setExpandedRules] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Reallocation | null>(null);
  const [editingTarget, setEditingTarget] = useState<ReallocationTarget | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    rule_name: '',
    rule_code: '',
    description: '',
    source_cost_center_id: '',
    allocation_method: 'percentage',
    effective_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  const [targetFormData, setTargetFormData] = useState({
    target_cost_center_id: '',
    allocation_percentage: '',
    allocation_amount: '',
    notes: ''
  });

  const allocationMethods = [
    { value: 'percentage', label: t('payroll.gl.percentage', 'Percentage') },
    { value: 'fixed_amount', label: t('payroll.gl.fixedAmount', 'Fixed Amount') },
    { value: 'headcount', label: t('payroll.gl.headcount', 'Headcount') },
    { value: 'hours_worked', label: t('payroll.gl.hoursWorked', 'Hours Worked') }
  ];

  useEffect(() => {
    if (selectedCompanyId) {
      loadData();
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const { data: reallocData, error: reallocError } = await supabase
        .from('gl_cost_reallocations')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('rule_code');
      if (reallocError) throw reallocError;
      setReallocations(reallocData || []);

      for (const rule of reallocData || []) {
        await loadTargets(rule.id);
      }

      const { data: ccData } = await supabase
        .from('gl_cost_centers')
        .select('id, cost_center_code, cost_center_name')
        .eq('company_id', selectedCompanyId)
        .eq('is_active', true)
        .order('cost_center_code');
      setCostCenters(ccData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('common.error', 'Error loading data'));
    } finally {
      setLoading(false);
    }
  };

  const loadTargets = async (reallocationId: string) => {
    try {
      const { data, error } = await supabase
        .from('gl_cost_reallocation_targets')
        .select('*')
        .eq('reallocation_id', reallocationId)
        .order('created_at');
      if (error) throw error;
      setTargets(prev => ({ ...prev, [reallocationId]: data || [] }));
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  const handleSaveRule = async () => {
    if (!selectedCompanyId) return;
    try {
      const payload = {
        company_id: selectedCompanyId,
        rule_name: formData.rule_name,
        rule_code: formData.rule_code,
        description: formData.description || null,
        source_cost_center_id: formData.source_cost_center_id,
        allocation_method: formData.allocation_method,
        effective_date: formData.effective_date,
        end_date: formData.end_date || null
      };

      if (editingRule) {
        const { error } = await supabase
          .from('gl_cost_reallocations')
          .update(payload)
          .eq('id', editingRule.id);
        if (error) throw error;
        toast.success(t('common.updated', 'Rule updated'));
      } else {
        const { error } = await supabase
          .from('gl_cost_reallocations')
          .insert(payload);
        if (error) throw error;
        toast.success(t('common.created', 'Rule created'));
      }

      setDialogOpen(false);
      resetRuleForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error saving'));
    }
  };

  const handleSaveTarget = async () => {
    if (!selectedRuleId) return;
    try {
      const payload = {
        reallocation_id: selectedRuleId,
        target_cost_center_id: targetFormData.target_cost_center_id,
        allocation_percentage: targetFormData.allocation_percentage ? parseFloat(targetFormData.allocation_percentage) : null,
        allocation_amount: targetFormData.allocation_amount ? parseFloat(targetFormData.allocation_amount) : null,
        notes: targetFormData.notes || null
      };

      if (editingTarget) {
        const { error } = await supabase
          .from('gl_cost_reallocation_targets')
          .update(payload)
          .eq('id', editingTarget.id);
        if (error) throw error;
        toast.success(t('common.updated', 'Target updated'));
      } else {
        const { error } = await supabase
          .from('gl_cost_reallocation_targets')
          .insert(payload);
        if (error) throw error;
        toast.success(t('common.created', 'Target added'));
      }

      setTargetDialogOpen(false);
      resetTargetForm();
      loadTargets(selectedRuleId);
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error saving'));
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm(t('common.confirmDelete', 'Are you sure?'))) return;
    try {
      const { error } = await supabase.from('gl_cost_reallocations').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('common.deleted', 'Rule deleted'));
      loadData();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error deleting'));
    }
  };

  const handleDeleteTarget = async (id: string, ruleId: string) => {
    if (!confirm(t('common.confirmDelete', 'Are you sure?'))) return;
    try {
      const { error } = await supabase.from('gl_cost_reallocation_targets').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('common.deleted', 'Target deleted'));
      loadTargets(ruleId);
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error deleting'));
    }
  };

  const openEditRule = (rule: Reallocation) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      rule_code: rule.rule_code,
      description: rule.description || '',
      source_cost_center_id: rule.source_cost_center_id,
      allocation_method: rule.allocation_method,
      effective_date: rule.effective_date,
      end_date: rule.end_date || ''
    });
    setDialogOpen(true);
  };

  const openAddTarget = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setEditingTarget(null);
    resetTargetForm();
    setTargetDialogOpen(true);
  };

  const openEditTarget = (target: ReallocationTarget) => {
    setSelectedRuleId(target.reallocation_id);
    setEditingTarget(target);
    setTargetFormData({
      target_cost_center_id: target.target_cost_center_id,
      allocation_percentage: target.allocation_percentage?.toString() || '',
      allocation_amount: target.allocation_amount?.toString() || '',
      notes: target.notes || ''
    });
    setTargetDialogOpen(true);
  };

  const resetRuleForm = () => {
    setEditingRule(null);
    setFormData({
      rule_name: '',
      rule_code: '',
      description: '',
      source_cost_center_id: '',
      allocation_method: 'percentage',
      effective_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
  };

  const resetTargetForm = () => {
    setEditingTarget(null);
    setTargetFormData({
      target_cost_center_id: '',
      allocation_percentage: '',
      allocation_amount: '',
      notes: ''
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedRules(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const getCostCenterName = (id: string) => {
    const cc = costCenters.find(c => c.id === id);
    return cc ? `${cc.cost_center_code} - ${cc.cost_center_name}` : '-';
  };

  const getTotalPercentage = (ruleId: string) => {
    const ruleTargets = targets[ruleId] || [];
    return ruleTargets.reduce((sum, t) => sum + (t.allocation_percentage || 0), 0);
  };

  const filteredRules = reallocations.filter(r =>
    r.rule_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.rule_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedCompanyId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('common.selectCompany', 'Please select a company')}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('payroll.title', 'Payroll'), href: '/payroll' },
            { label: t('payroll.gl.title', 'GL Interface'), href: '/payroll/gl' },
            { label: t('payroll.gl.costReallocations', 'Cost Reallocations') }
          ]}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('payroll.gl.costReallocations', 'Cost Reallocations')}</h1>
            <p className="text-muted-foreground">{t('payroll.gl.costReallocationsDesc', 'Redirect costs between cost centers')}</p>
          </div>
          <Button onClick={() => { resetRuleForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.addRule', 'Add Rule')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex gap-4 items-center">
              <PayrollFilters
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
                showPayGroupFilter={false}
              />
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search', 'Search...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{t('common.loading', 'Loading...')}</div>
            ) : filteredRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t('common.noData', 'No reallocation rules')}</div>
            ) : (
              <div className="space-y-2">
                {filteredRules.map((rule) => (
                  <Collapsible
                    key={rule.id}
                    open={expandedRules.includes(rule.id)}
                    onOpenChange={() => toggleExpand(rule.id)}
                  >
                    <div className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-4">
                            {expandedRules.includes(rule.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {rule.rule_name}
                                <span className="text-sm text-muted-foreground font-mono">({rule.rule_code})</span>
                                <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                  {rule.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2">
                                <span>{getCostCenterName(rule.source_cost_center_id)}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>{(targets[rule.id] || []).length} {t('payroll.gl.targets', 'targets')}</span>
                                {rule.allocation_method === 'percentage' && (
                                  <Badge variant="outline">{getTotalPercentage(rule.id)}%</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" onClick={() => openAddTarget(rule.id)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditRule(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t p-4 bg-muted/20">
                          <h4 className="text-sm font-medium mb-2">{t('payroll.gl.allocationTargets', 'Allocation Targets')}</h4>
                          {(targets[rule.id] || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('common.noTargets', 'No targets defined')}</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t('payroll.gl.targetCostCenter', 'Target Cost Center')}</TableHead>
                                  <TableHead>{t('payroll.gl.percentage', 'Percentage')}</TableHead>
                                  <TableHead>{t('payroll.gl.amount', 'Amount')}</TableHead>
                                  <TableHead>{t('common.notes', 'Notes')}</TableHead>
                                  <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(targets[rule.id] || []).map((target) => (
                                  <TableRow key={target.id}>
                                    <TableCell>{getCostCenterName(target.target_cost_center_id)}</TableCell>
                                    <TableCell>{target.allocation_percentage ? `${target.allocation_percentage}%` : '-'}</TableCell>
                                    <TableCell>{target.allocation_amount || '-'}</TableCell>
                                    <TableCell>{target.notes || '-'}</TableCell>
                                    <TableCell className="text-right">
                                      <Button variant="ghost" size="sm" onClick={() => openEditTarget(target)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTarget(target.id, rule.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rule Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? t('common.edit', 'Edit Rule') : t('common.add', 'Add Rule')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('common.name', 'Rule Name')}</Label>
                  <Input
                    value={formData.rule_name}
                    onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.code', 'Rule Code')}</Label>
                  <Input
                    value={formData.rule_code}
                    onChange={(e) => setFormData({ ...formData, rule_code: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('payroll.gl.sourceCostCenter', 'Source Cost Center')}</Label>
                <Select value={formData.source_cost_center_id} onValueChange={(v) => setFormData({ ...formData, source_cost_center_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select', 'Select...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenters.map(cc => (
                      <SelectItem key={cc.id} value={cc.id}>{cc.cost_center_code} - {cc.cost_center_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('payroll.gl.allocationMethod', 'Allocation Method')}</Label>
                <Select value={formData.allocation_method} onValueChange={(v) => setFormData({ ...formData, allocation_method: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allocationMethods.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('common.effectiveDate', 'Effective Date')}</Label>
                  <Input
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.endDate', 'End Date')}</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', 'Description')}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handleSaveRule}>{t('common.save', 'Save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Target Dialog */}
        <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTarget ? t('common.edit', 'Edit Target') : t('common.add', 'Add Target')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>{t('payroll.gl.targetCostCenter', 'Target Cost Center')}</Label>
                <Select value={targetFormData.target_cost_center_id} onValueChange={(v) => setTargetFormData({ ...targetFormData, target_cost_center_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select', 'Select...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenters.map(cc => (
                      <SelectItem key={cc.id} value={cc.id}>{cc.cost_center_code} - {cc.cost_center_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('payroll.gl.percentage', 'Percentage (%)')}</Label>
                  <Input
                    type="number"
                    value={targetFormData.allocation_percentage}
                    onChange={(e) => setTargetFormData({ ...targetFormData, allocation_percentage: e.target.value })}
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('payroll.gl.amount', 'Fixed Amount')}</Label>
                  <Input
                    type="number"
                    value={targetFormData.allocation_amount}
                    onChange={(e) => setTargetFormData({ ...targetFormData, allocation_amount: e.target.value })}
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('common.notes', 'Notes')}</Label>
                <Input
                  value={targetFormData.notes}
                  onChange={(e) => setTargetFormData({ ...targetFormData, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTargetDialogOpen(false)}>{t('common.cancel', 'Cancel')}</Button>
              <Button onClick={handleSaveTarget}>{t('common.save', 'Save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default CostReallocationsPage;
