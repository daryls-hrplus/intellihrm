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
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PayrollFilters, usePayrollFilters } from '@/components/payroll/PayrollFilters';

type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

interface GLAccount {
  id: string;
  company_id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_account_id: string | null;
  description: string | null;
  is_active: boolean;
  normal_balance: string | null;
  start_date: string;
  end_date: string | null;
}

const GLAccountsPage = () => {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [accounts, setAccounts] = useState<GLAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GLAccount | null>(null);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'expense' as AccountType,
    description: '',
    normal_balance: 'debit' as string,
    parent_account_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    if (selectedCompanyId) {
      loadAccounts();
    }
  }, [selectedCompanyId]);

  const loadAccounts = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gl_accounts')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('account_code');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
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
        account_code: formData.account_code,
        account_name: formData.account_name,
        account_type: formData.account_type,
        description: formData.description || null,
        normal_balance: formData.normal_balance,
        parent_account_id: formData.parent_account_id || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null
      };

      if (editingAccount) {
        const { error } = await supabase
          .from('gl_accounts')
          .update(payload)
          .eq('id', editingAccount.id);
        if (error) throw error;
        toast.success(t('common.updated', 'Account updated'));
      } else {
        const { error } = await supabase
          .from('gl_accounts')
          .insert(payload);
        if (error) throw error;
        toast.success(t('common.created', 'Account created'));
      }

      setDialogOpen(false);
      resetForm();
      loadAccounts();
    } catch (error: any) {
      console.error('Error saving account:', error);
      toast.error(error.message || t('common.error', 'Error saving'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete', 'Are you sure?'))) return;
    try {
      const { error } = await supabase.from('gl_accounts').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('common.deleted', 'Account deleted'));
      loadAccounts();
    } catch (error: any) {
      toast.error(error.message || t('common.error', 'Error deleting'));
    }
  };

  const openEditDialog = (account: GLAccount) => {
    setEditingAccount(account);
    setFormData({
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type as AccountType,
      description: account.description || '',
      normal_balance: account.normal_balance || 'debit',
      parent_account_id: account.parent_account_id || '',
      start_date: account.start_date,
      end_date: account.end_date || ''
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      account_code: '',
      account_name: '',
      account_type: 'expense',
      description: '',
      normal_balance: 'debit',
      parent_account_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
  };

  const filteredAccounts = accounts.filter(a =>
    a.account_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.account_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];

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
            { label: t('payroll.gl.chartOfAccounts', 'Chart of Accounts') }
          ]}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('payroll.gl.chartOfAccounts', 'Chart of Accounts')}</h1>
            <p className="text-muted-foreground">{t('payroll.gl.chartOfAccountsDesc', 'Manage GL account codes and hierarchy')}</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('common.add', 'Add Account')}
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
                  <TableHead>{t('payroll.gl.accountCode', 'Code')}</TableHead>
                  <TableHead>{t('payroll.gl.accountName', 'Name')}</TableHead>
                  <TableHead>{t('payroll.gl.accountType', 'Type')}</TableHead>
                  <TableHead>{t('payroll.gl.normalBalance', 'Normal Balance')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {t('common.loading', 'Loading...')}
                    </TableCell>
                  </TableRow>
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('common.noData', 'No accounts found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.account_code}</TableCell>
                      <TableCell>{account.account_name}</TableCell>
                      <TableCell className="capitalize">{account.account_type}</TableCell>
                      <TableCell className="capitalize">{account.normal_balance}</TableCell>
                      <TableCell>
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(account)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)}>
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? t('common.edit', 'Edit Account') : t('common.add', 'Add Account')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('payroll.gl.accountCode', 'Account Code')}</Label>
                  <Input
                    value={formData.account_code}
                    onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                    placeholder="e.g., 5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('payroll.gl.accountType', 'Account Type')}</Label>
                  <Select value={formData.account_type} onValueChange={(v) => setFormData({ ...formData, account_type: v as AccountType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('payroll.gl.accountName', 'Account Name')}</Label>
                <Input
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="e.g., Wages Expense"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('payroll.gl.normalBalance', 'Normal Balance')}</Label>
                  <Select value={formData.normal_balance} onValueChange={(v) => setFormData({ ...formData, normal_balance: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">{t('payroll.gl.debit', 'Debit')}</SelectItem>
                      <SelectItem value="credit">{t('payroll.gl.credit', 'Credit')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('payroll.gl.parentAccount', 'Parent Account')}</Label>
                  <Select value={formData.parent_account_id} onValueChange={(v) => setFormData({ ...formData, parent_account_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.none', 'None')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('common.none', 'None')}</SelectItem>
                      {accounts.filter(a => a.id !== editingAccount?.id).map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.account_code} - {a.account_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('common.description', 'Description')}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('common.startDate', 'Start Date')}</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button onClick={handleSave}>
                {t('common.save', 'Save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default GLAccountsPage;
