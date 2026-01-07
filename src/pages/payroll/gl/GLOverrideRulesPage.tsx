import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePageAudit } from '@/hooks/usePageAudit';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, Filter, Copy, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PayrollFilters, usePayrollFilters } from '@/components/payroll/PayrollFilters';
import { useGLOverrideRules, GLOverrideRule, GLOverrideCondition, CreateOverrideRuleInput } from '@/hooks/useGLOverrideRules';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface GLAccount {
  id: string;
  account_code: string;
  account_name: string;
}

interface Department {
  id: string;
  code: string;
  name: string;
}

interface PayElement {
  id: string;
  code: string;
  name: string;
}

interface CostCenterSegment {
  id: string;
  segment_code: string;
  segment_name: string;
}

const dimensionTypes = [
  { value: 'pay_element', label: 'Pay Element' },
  { value: 'department', label: 'Department' },
  { value: 'division', label: 'Division' },
  { value: 'location', label: 'Location' },
  { value: 'job', label: 'Job/Position' },
  { value: 'cost_center', label: 'Cost Center' },
  { value: 'mapping_type', label: 'Mapping Type' },
  { value: 'pay_group', label: 'Pay Group' },
];

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'in', label: 'In List' },
  { value: 'any', label: 'Any (Wildcard)' },
];

const overrideTypes = [
  { value: 'account', label: 'Replace Account' },
  { value: 'segment', label: 'Override Segments' },
  { value: 'full_string', label: 'Custom GL String' },
];

const mappingTypeOptions = [
  { value: 'wages_expense', label: 'Wages Expense' },
  { value: 'tax_liability', label: 'Tax Liability' },
  { value: 'tax_expense', label: 'Tax Expense' },
  { value: 'deduction_liability', label: 'Deduction Liability' },
  { value: 'benefit_expense', label: 'Benefit Expense' },
  { value: 'benefit_liability', label: 'Benefit Liability' },
  { value: 'employer_contribution', label: 'Employer Contribution' },
  { value: 'savings_employee_deduction', label: 'Savings - Employee' },
  { value: 'savings_employer_contribution', label: 'Savings - Employer' },
  { value: 'loan_repayment', label: 'Loan Repayment' },
  { value: 'garnishment', label: 'Garnishment' },
];

interface ConditionFormData {
  dimension_type: string;
  dimension_value_id: string;
  dimension_value_code: string;
  operator: string;
  value_list: string[];
}

const GLOverrideRulesPage = () => {
  const { t } = useTranslation();
  usePageAudit('gl_override_rules', 'Payroll');
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const { isLoading, fetchOverrideRules, createOverrideRule, updateOverrideRule, deleteOverrideRule, toggleRuleActive } = useGLOverrideRules();
  
  const [rules, setRules] = useState<GLOverrideRule[]>([]);
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [segments, setSegments] = useState<CostCenterSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRules, setExpandedRules] = useState<string[]>([]);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<GLOverrideRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    rule_code: '',
    rule_name: '',
    description: '',
    priority: 0,
    override_type: 'segment' as 'account' | 'segment' | 'full_string',
    applies_to_debit: true,
    applies_to_credit: true,
    effective_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });
  
  const [conditions, setConditions] = useState<ConditionFormData[]>([
    { dimension_type: '', dimension_value_id: '', dimension_value_code: '', operator: 'equals', value_list: [] }
  ]);
  
  const [targetData, setTargetData] = useState({
    target_debit_account_id: '',
    target_credit_account_id: '',
    segment_overrides: {} as Record<string, string>,
    custom_gl_string: '',
  });

  useEffect(() => {
    if (selectedCompanyId) {
      loadData();
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const [rulesData, glData, deptData, peData, segData] = await Promise.all([
        fetchOverrideRules(selectedCompanyId),
        supabase.from('gl_accounts').select('id, account_code, account_name').eq('company_id', selectedCompanyId).eq('is_active', true).order('account_code'),
        supabase.from('departments').select('id, code, name').eq('company_id', selectedCompanyId).order('name'),
        supabase.from('pay_elements').select('id, code, name').eq('company_id', selectedCompanyId).eq('is_active', true).order('code'),
        supabase.from('gl_cost_center_segments').select('id, segment_code, segment_name').eq('company_id', selectedCompanyId).eq('is_active', true).order('display_order'),
      ]);
      
      setRules(rulesData);
      setGLAccounts(glData.data || []);
      setDepartments(deptData.data || []);
      setPayElements(peData.data || []);
      setSegments(segData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingRule(null);
    setFormData({
      rule_code: '',
      rule_name: '',
      description: '',
      priority: 0,
      override_type: 'segment',
      applies_to_debit: true,
      applies_to_credit: true,
      effective_date: new Date().toISOString().split('T')[0],
      end_date: '',
    });
    setConditions([{ dimension_type: '', dimension_value_id: '', dimension_value_code: '', operator: 'equals', value_list: [] }]);
    setTargetData({
      target_debit_account_id: '',
      target_credit_account_id: '',
      segment_overrides: {},
      custom_gl_string: '',
    });
  };

  const openEditDialog = (rule: GLOverrideRule) => {
    setEditingRule(rule);
    setFormData({
      rule_code: rule.rule_code,
      rule_name: rule.rule_name,
      description: rule.description || '',
      priority: rule.priority,
      override_type: rule.override_type,
      applies_to_debit: rule.applies_to_debit,
      applies_to_credit: rule.applies_to_credit,
      effective_date: rule.effective_date,
      end_date: rule.end_date || '',
    });
    
    if (rule.conditions && rule.conditions.length > 0) {
      setConditions(rule.conditions.map(c => ({
        dimension_type: c.dimension_type,
        dimension_value_id: c.dimension_value_id || '',
        dimension_value_code: c.dimension_value_code || '',
        operator: c.operator,
        value_list: c.value_list || [],
      })));
    } else {
      setConditions([{ dimension_type: '', dimension_value_id: '', dimension_value_code: '', operator: 'equals', value_list: [] }]);
    }
    
    const target = rule.targets?.[0];
    if (target) {
      setTargetData({
        target_debit_account_id: target.target_debit_account_id || '',
        target_credit_account_id: target.target_credit_account_id || '',
        segment_overrides: target.segment_overrides || {},
        custom_gl_string: target.custom_gl_string || '',
      });
    }
    
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCompanyId || !formData.rule_code || !formData.rule_name) {
      toast.error('Please fill in required fields');
      return;
    }
    
    const validConditions = conditions.filter(c => c.dimension_type);
    
    if (editingRule) {
      const success = await updateOverrideRule(
        editingRule.id,
        {
          rule_code: formData.rule_code,
          rule_name: formData.rule_name,
          description: formData.description || null,
          priority: formData.priority,
          override_type: formData.override_type,
          applies_to_debit: formData.applies_to_debit,
          applies_to_credit: formData.applies_to_credit,
          effective_date: formData.effective_date,
          end_date: formData.end_date || null,
        },
        validConditions.map(c => ({
          dimension_type: c.dimension_type as any,
          dimension_value_id: c.dimension_value_id || null,
          dimension_value_code: c.dimension_value_code || null,
          operator: c.operator as any,
          value_list: c.value_list.length > 0 ? c.value_list : null,
        })),
        {
          target_debit_account_id: targetData.target_debit_account_id || null,
          target_credit_account_id: targetData.target_credit_account_id || null,
          segment_overrides: targetData.segment_overrides,
          custom_gl_string: targetData.custom_gl_string || null,
        }
      );
      
      if (success) {
        setDialogOpen(false);
        resetForm();
        loadData();
      }
    } else {
      const input: CreateOverrideRuleInput = {
        company_id: selectedCompanyId,
        rule_code: formData.rule_code,
        rule_name: formData.rule_name,
        description: formData.description,
        priority: formData.priority,
        override_type: formData.override_type,
        applies_to_debit: formData.applies_to_debit,
        applies_to_credit: formData.applies_to_credit,
        effective_date: formData.effective_date,
        end_date: formData.end_date || null,
        conditions: validConditions.map(c => ({
          dimension_type: c.dimension_type as any,
          dimension_value_id: c.dimension_value_id || null,
          dimension_value_code: c.dimension_value_code || null,
          operator: c.operator as any,
          value_list: c.value_list.length > 0 ? c.value_list : null,
        })),
        target: {
          target_debit_account_id: targetData.target_debit_account_id || null,
          target_credit_account_id: targetData.target_credit_account_id || null,
          segment_overrides: targetData.segment_overrides,
          custom_gl_string: targetData.custom_gl_string || null,
        },
      };
      
      const result = await createOverrideRule(input);
      if (result) {
        setDialogOpen(false);
        resetForm();
        loadData();
      }
    }
  };

  const handleDelete = async () => {
    if (!ruleToDelete) return;
    const success = await deleteOverrideRule(ruleToDelete);
    if (success) {
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
      loadData();
    }
  };

  const addCondition = () => {
    setConditions([...conditions, { dimension_type: '', dimension_value_id: '', dimension_value_code: '', operator: 'equals', value_list: [] }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof ConditionFormData, value: any) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const updateSegmentOverride = (segmentCode: string, value: string) => {
    setTargetData(prev => ({
      ...prev,
      segment_overrides: {
        ...prev.segment_overrides,
        [segmentCode]: value,
      },
    }));
  };

  const toggleExpand = (ruleId: string) => {
    setExpandedRules(prev =>
      prev.includes(ruleId) ? prev.filter(r => r !== ruleId) : [...prev, ruleId]
    );
  };

  const getAccountLabel = (id: string | null) => {
    if (!id) return '-';
    const acc = glAccounts.find(a => a.id === id);
    return acc ? `${acc.account_code} - ${acc.account_name}` : '-';
  };

  const getDimensionValueLabel = (condition: GLOverrideCondition) => {
    if (condition.operator === 'any') return '(Any)';
    if (condition.dimension_value_code) return condition.dimension_value_code;
    if (condition.dimension_type === 'department' && condition.dimension_value_id) {
      const dept = departments.find(d => d.id === condition.dimension_value_id);
      return dept ? `${dept.code} - ${dept.name}` : condition.dimension_value_id;
    }
    if (condition.dimension_type === 'pay_element' && condition.dimension_value_id) {
      const pe = payElements.find(p => p.id === condition.dimension_value_id);
      return pe ? `${pe.code} - ${pe.name}` : condition.dimension_value_id;
    }
    return condition.dimension_value_id || '-';
  };

  const filteredRules = rules.filter(r =>
    r.rule_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.rule_name.toLowerCase().includes(searchQuery.toLowerCase())
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
            { label: t('payroll.gl.overrideRules', 'Override Rules') }
          ]}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('payroll.gl.overrideRules', 'GL Override Rules')}</h1>
            <p className="text-muted-foreground">{t('payroll.gl.overrideRulesDesc', 'Route payroll entries to different GL accounts based on conditions')}</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add', 'Add Rule')}
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
                  placeholder={t('common.search', 'Search rules...')}
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
              <div className="text-center py-12">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t('payroll.gl.noOverrideRules', 'No Override Rules')}</h3>
                <p className="text-muted-foreground mt-1 mb-4">Create rules to route payroll entries to specific GL accounts</p>
                <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </div>
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
                                <span className="font-mono text-sm text-muted-foreground">{rule.rule_code}</span>
                                {rule.rule_name}
                                <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                  {rule.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant="outline">{overrideTypes.find(t => t.value === rule.override_type)?.label}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Priority: {rule.priority} • 
                                {rule.applies_to_debit && ' Debit'}
                                {rule.applies_to_debit && rule.applies_to_credit && ' &'}
                                {rule.applies_to_credit && ' Credit'}
                                {rule.conditions && rule.conditions.length > 0 && ` • ${rule.conditions.length} condition(s)`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={(checked) => toggleRuleActive(rule.id, checked).then(() => loadData())}
                            />
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setRuleToDelete(rule.id); setDeleteDialogOpen(true); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t p-4 bg-muted/20 space-y-4">
                          {rule.description && (
                            <p className="text-sm text-muted-foreground">{rule.description}</p>
                          )}
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Conditions</h4>
                              {rule.conditions && rule.conditions.length > 0 ? (
                                <div className="space-y-1">
                                  {rule.conditions.map((cond, idx) => (
                                    <div key={cond.id} className="text-sm flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">{dimensionTypes.find(d => d.value === cond.dimension_type)?.label}</Badge>
                                      <span className="text-muted-foreground">{operators.find(o => o.value === cond.operator)?.label}</span>
                                      <span className="font-mono">{getDimensionValueLabel(cond)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No conditions (applies to all)</p>
                              )}
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Target</h4>
                              {rule.targets && rule.targets.length > 0 ? (
                                <div className="space-y-1 text-sm">
                                  {rule.targets[0].target_debit_account_id && (
                                    <div>Debit: <span className="font-mono">{getAccountLabel(rule.targets[0].target_debit_account_id)}</span></div>
                                  )}
                                  {rule.targets[0].target_credit_account_id && (
                                    <div>Credit: <span className="font-mono">{getAccountLabel(rule.targets[0].target_credit_account_id)}</span></div>
                                  )}
                                  {rule.targets[0].custom_gl_string && (
                                    <div>GL String: <span className="font-mono">{rule.targets[0].custom_gl_string}</span></div>
                                  )}
                                  {rule.targets[0].segment_overrides && Object.keys(rule.targets[0].segment_overrides).length > 0 && (
                                    <div>
                                      Segment Overrides: 
                                      {Object.entries(rule.targets[0].segment_overrides).map(([seg, val]) => (
                                        <Badge key={seg} variant="secondary" className="ml-1 text-xs">{seg}={val}</Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No target configured</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Override Rule' : 'Create Override Rule'}</DialogTitle>
              <DialogDescription>Define conditions to route payroll entries to specific GL accounts</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Code *</Label>
                  <Input
                    value={formData.rule_code}
                    onChange={(e) => setFormData({ ...formData, rule_code: e.target.value.toUpperCase() })}
                    placeholder="e.g., OT_OPS_WH"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rule Name *</Label>
                  <Input
                    value={formData.rule_name}
                    onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                    placeholder="e.g., Overtime - Operations Warehouse"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when this rule applies..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">Higher = evaluated first</p>
                </div>
                <div className="space-y-2">
                  <Label>Override Type</Label>
                  <Select value={formData.override_type} onValueChange={(v: any) => setFormData({ ...formData, override_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {overrideTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.applies_to_debit}
                    onCheckedChange={(v) => setFormData({ ...formData, applies_to_debit: v })}
                  />
                  <Label>Applies to Debits</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.applies_to_credit}
                    onCheckedChange={(v) => setFormData({ ...formData, applies_to_credit: v })}
                  />
                  <Label>Applies to Credits</Label>
                </div>
              </div>
              
              {/* Conditions */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Conditions</Label>
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="h-3 w-3 mr-1" /> Add Condition
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">All conditions must match for the rule to apply (AND logic)</p>
                
                {conditions.map((cond, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Select value={cond.dimension_type} onValueChange={(v) => updateCondition(idx, 'dimension_type', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Dimension" />
                        </SelectTrigger>
                        <SelectContent>
                          {dimensionTypes.map(d => (
                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={cond.operator} onValueChange={(v) => updateCondition(idx, 'operator', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(o => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {cond.operator !== 'any' && (
                        cond.dimension_type === 'department' ? (
                          <Select value={cond.dimension_value_id} onValueChange={(v) => updateCondition(idx, 'dimension_value_id', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.code} - {d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : cond.dimension_type === 'pay_element' ? (
                          <Select value={cond.dimension_value_id} onValueChange={(v) => updateCondition(idx, 'dimension_value_id', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {payElements.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : cond.dimension_type === 'mapping_type' ? (
                          <Select value={cond.dimension_value_code} onValueChange={(v) => updateCondition(idx, 'dimension_value_code', v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {mappingTypeOptions.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={cond.dimension_value_code}
                            onChange={(e) => updateCondition(idx, 'dimension_value_code', e.target.value)}
                            placeholder="Value or code"
                          />
                        )
                      )}
                    </div>
                    {conditions.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeCondition(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Target */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Target Override</Label>
                
                {formData.override_type === 'account' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Override Debit Account</Label>
                      <Select value={targetData.target_debit_account_id || 'none'} onValueChange={(v) => setTargetData({ ...targetData, target_debit_account_id: v === 'none' ? '' : v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="No override" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No override</SelectItem>
                          {glAccounts.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.account_code} - {a.account_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Override Credit Account</Label>
                      <Select value={targetData.target_credit_account_id || 'none'} onValueChange={(v) => setTargetData({ ...targetData, target_credit_account_id: v === 'none' ? '' : v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="No override" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No override</SelectItem>
                          {glAccounts.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.account_code} - {a.account_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                {formData.override_type === 'segment' && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Override specific segment values in the GL string</p>
                    {segments.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        No segments configured. Set up cost center segments first.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {segments.map(seg => (
                          <div key={seg.id} className="space-y-1">
                            <Label className="text-xs">{seg.segment_name} ({seg.segment_code})</Label>
                            <Input
                              value={targetData.segment_overrides[seg.segment_code] || ''}
                              onChange={(e) => updateSegmentOverride(seg.segment_code, e.target.value)}
                              placeholder="Override value"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {formData.override_type === 'full_string' && (
                  <div className="space-y-2">
                    <Label>Custom GL String</Label>
                    <Input
                      value={targetData.custom_gl_string}
                      onChange={(e) => setTargetData({ ...targetData, custom_gl_string: e.target.value })}
                      placeholder="e.g., 01-OP-6120-WH-00"
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Enter the complete GL string to use for matching entries</p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingRule ? 'Update Rule' : 'Create Rule')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Override Rule?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the rule and its conditions. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default GLOverrideRulesPage;
