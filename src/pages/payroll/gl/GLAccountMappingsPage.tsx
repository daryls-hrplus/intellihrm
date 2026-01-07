import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePageAudit } from '@/hooks/usePageAudit';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PayrollFilters, usePayrollFilters } from '@/components/payroll/PayrollFilters';

interface GLAccount {
  id: string;
  account_code: string;
  account_name: string;
}

interface PayElement {
  id: string;
  code: string;
  name: string;
}

interface CostCenter {
  id: string;
  cost_center_code: string;
  cost_center_name: string;
}

interface Mapping {
  id: string;
  company_id: string;
  pay_element_id: string | null;
  mapping_type: string;
  debit_account_id: string | null;
  credit_account_id: string | null;
  default_cost_center_id: string | null;
  description: string | null;
  is_active: boolean;
  priority: number;
}

const GLAccountMappingsPage = () => {
  const { t } = useTranslation();
  usePageAudit('gl_account_mappings', 'Payroll');
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<Mapping | null>(null);

  const [formData, setFormData] = useState({
    pay_element_id: '',
    mapping_type: 'wages_expense',
    debit_account_id: '',
    credit_account_id: '',
    default_cost_center_id: '',
    description: '',
    priority: 0
  });

  const mappingTypes = [
    { value: 'wages_expense', label: t('payroll.gl.wagesExpense', 'Wages Expense') },
    { value: 'tax_liability', label: t('payroll.gl.taxLiability', 'Tax Liability') },
    { value: 'tax_expense', label: t('payroll.gl.taxExpense', 'Tax Expense') },
    { value: 'deduction_liability', label: t('payroll.gl.deductionLiability', 'Deduction Liability') },
    { value: 'benefit_expense', label: t('payroll.gl.benefitExpense', 'Benefit Expense') },
    { value: 'benefit_liability', label: t('payroll.gl.benefitLiability', 'Benefit Liability') },
    { value: 'payroll_clearing', label: t('payroll.gl.payrollClearing', 'Payroll Clearing') },
    { value: 'employer_contribution', label: t('payroll.gl.employerContribution', 'Employer Contribution') },
    { value: 'employee_deduction', label: t('payroll.gl.employeeDeduction', 'Employee Deduction') },
    { value: 'net_pay', label: t('payroll.gl.netPay', 'Net Pay') },
    { value: 'savings_employee_deduction', label: t('payroll.gl.savingsEmployeeDeduction', 'Savings - Employee Deduction') },
    { value: 'savings_employer_contribution', label: t('payroll.gl.savingsEmployerContribution', 'Savings - Employer Match') },
    { value: 'savings_employer_liability', label: t('payroll.gl.savingsEmployerLiability', 'Savings - Employer Liability') },
    { value: 'loan_repayment', label: t('payroll.gl.loanRepayment', 'Loan Repayment') },
    { value: 'garnishment', label: t('payroll.gl.garnishment', 'Garnishment') },
    { value: 'union_dues', label: t('payroll.gl.unionDues', 'Union Dues') },
    { value: 'retirement_expense', label: t('payroll.gl.retirementExpense', 'Retirement Expense') },
    { value: 'retirement_liability', label: t('payroll.gl.retirementLiability', 'Retirement Liability') },
    { value: 'custom', label: t('payroll.gl.custom', 'Custom') }
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
      const { data: mappingData, error: mappingError } = await supabase
        .from('gl_account_mappings')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('priority', { ascending: false });
      if (mappingError) throw mappingError;
      setMappings(mappingData || []);

      const { data: glData } = await supabase
        .from('gl_accounts')
        .select('id, account_code, account_name')
        .eq('company_id', selectedCompanyId)
        .eq('is_active', true)
        .order('account_code');
      setGLAccounts(glData || []);

      const { data: peData } = await supabase
        .from('pay_elements')
        .select('id, code, name')
        .eq('company_id', selectedCompanyId)
        .eq('is_active', true)
        .order('code');
      setPayElements(peData || []);

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

  const handleSave = async () => {
    if (!selectedCompanyId) return;
    try {
      const payload = {
        company_id: selectedCompanyId,
        pay_element_id: formData.pay_element_id || null,
        mapping_type: formData.mapping_type,
        debit_account_id: formData.debit_account_id || null,
        credit_account_id: formData.credit_account_id || null,
        default_cost_center_id: formData.default_cost_center_id || null,
        description: formData.description || null,
        priority: formData.priority
      };

      if (editingMapping) {
        const { error } = await supabase
          .from('gl_account_mappings')
          .update(payload)
          .eq('id', editingMapping.id);
        if (error) throw error;
        toast.success(t('common.updated', 'Mapping updated'));
      } else {
        const { error } = await supabase
          .from('gl_account_mappings')
          .insert(payload);
        if (error) throw error;
        toast.success(t('common.created', 'Mapping created'));
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error saving'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete', 'Are you sure?'))) return;
    try {
      const { error } = await supabase.from('gl_account_mappings').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('common.deleted', 'Mapping deleted'));
      loadData();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error deleting'));
    }
  };

  const openEdit = (mapping: Mapping) => {
    setEditingMapping(mapping);
    setFormData({
      pay_element_id: mapping.pay_element_id || '',
      mapping_type: mapping.mapping_type,
      debit_account_id: mapping.debit_account_id || '',
      credit_account_id: mapping.credit_account_id || '',
      default_cost_center_id: mapping.default_cost_center_id || '',
      description: mapping.description || '',
      priority: mapping.priority
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMapping(null);
    setFormData({
      pay_element_id: '',
      mapping_type: 'wages_expense',
      debit_account_id: '',
      credit_account_id: '',
      default_cost_center_id: '',
      description: '',
      priority: 0
    });
  };

  const getPayElementName = (id: string | null) => {
    if (!id) return t('common.all', 'All');
    const pe = payElements.find(p => p.id === id);
    return pe ? `${pe.code} - ${pe.name}` : '-';
  };

  const getAccountName = (id: string | null) => {
    if (!id) return '-';
    const acc = glAccounts.find(a => a.id === id);
    return acc ? `${acc.account_code} - ${acc.account_name}` : '-';
  };

  const getCostCenterName = (id: string | null) => {
    if (!id) return '-';
    const cc = costCenters.find(c => c.id === id);
    return cc ? `${cc.cost_center_code}` : '-';
  };

  const getMappingTypeLabel = (type: string) => {
    const mt = mappingTypes.find(m => m.value === type);
    return mt?.label || type;
  };

  const filteredMappings = mappings.filter(m =>
    getMappingTypeLabel(m.mapping_type).toLowerCase().includes(searchQuery.toLowerCase()) ||
    getPayElementName(m.pay_element_id).toLowerCase().includes(searchQuery.toLowerCase())
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
            { label: t('payroll.gl.accountMappings', 'Account Mappings') }
          ]}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('payroll.gl.accountMappings', 'Account Mappings')}</h1>
            <p className="text-muted-foreground">{t('payroll.gl.accountMappingsDesc', 'Map pay elements to GL accounts')}</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add', 'Add Mapping')}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('payroll.gl.mappingType', 'Type')}</TableHead>
                  <TableHead>{t('payroll.gl.payElement', 'Pay Element')}</TableHead>
                  <TableHead>{t('payroll.gl.debitAccount', 'Debit')}</TableHead>
                  <TableHead>{t('payroll.gl.creditAccount', 'Credit')}</TableHead>
                  <TableHead>{t('payroll.gl.costCenter', 'Cost Center')}</TableHead>
                  <TableHead>{t('common.priority', 'Priority')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">{t('common.loading', 'Loading...')}</TableCell>
                  </TableRow>
                ) : filteredMappings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('common.noData', 'No mappings found')}</TableCell>
                  </TableRow>
                ) : (
                  filteredMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <Badge variant="outline">{getMappingTypeLabel(mapping.mapping_type)}</Badge>
                      </TableCell>
                      <TableCell>{getPayElementName(mapping.pay_element_id)}</TableCell>
                      <TableCell className="font-mono text-sm">{getAccountName(mapping.debit_account_id)}</TableCell>
                      <TableCell className="font-mono text-sm">{getAccountName(mapping.credit_account_id)}</TableCell>
                      <TableCell className="font-mono text-sm">{getCostCenterName(mapping.default_cost_center_id)}</TableCell>
                      <TableCell>{mapping.priority}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(mapping)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(mapping.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMapping ? t('common.edit', 'Edit Mapping') : t('common.add', 'Add Mapping')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('payroll.gl.mappingType', 'Mapping Type')}</Label>
                  <Select value={formData.mapping_type} onValueChange={(v) => setFormData({ ...formData, mapping_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mappingTypes.map(mt => (
                        <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('payroll.gl.payElement', 'Pay Element')}</Label>
                  <Select
                    value={formData.pay_element_id || 'all'}
                    onValueChange={(v) => setFormData({ ...formData, pay_element_id: v === 'all' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.all', 'All (Default)')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'All (Default)')}</SelectItem>
                      {payElements.map(pe => (
                        <SelectItem key={pe.id} value={pe.id}>{pe.code} - {pe.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('payroll.gl.debitAccount', 'Debit Account')}</Label>
                  <Select
                    value={formData.debit_account_id || 'none'}
                    onValueChange={(v) => setFormData({ ...formData, debit_account_id: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.select', 'Select...')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('common.none', 'None')}</SelectItem>
                      {glAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.account_code} - {acc.account_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('payroll.gl.creditAccount', 'Credit Account')}</Label>
                  <Select
                    value={formData.credit_account_id || 'none'}
                    onValueChange={(v) => setFormData({ ...formData, credit_account_id: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.select', 'Select...')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('common.none', 'None')}</SelectItem>
                      {glAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.account_code} - {acc.account_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('payroll.gl.defaultCostCenter', 'Default Cost Center')}</Label>
                  <Select
                    value={formData.default_cost_center_id || 'none'}
                    onValueChange={(v) => setFormData({ ...formData, default_cost_center_id: v === 'none' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.none', 'None')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('common.none', 'None')}</SelectItem>
                      {costCenters.map(cc => (
                        <SelectItem key={cc.id} value={cc.id}>{cc.cost_center_code} - {cc.cost_center_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.priority', 'Priority')}</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">{t('payroll.gl.priorityHint', 'Higher priority mappings take precedence')}</p>
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
              <Button onClick={handleSave}>{t('common.save', 'Save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default GLAccountMappingsPage;
