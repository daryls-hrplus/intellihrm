import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, ChevronDown, ChevronRight, Download, FileText, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PayrollFilters, usePayrollFilters } from '@/components/payroll/PayrollFilters';
import { formatDateForDisplay } from '@/utils/dateUtils';

interface JournalBatch {
  id: string;
  company_id: string;
  batch_number: string;
  batch_date: string;
  payroll_run_id: string | null;
  description: string | null;
  status: string;
  total_debits: number;
  total_credits: number;
  posted_at: string | null;
  created_at: string;
}

interface JournalEntry {
  id: string;
  batch_id: string;
  entry_number: number;
  entry_date: string;
  account_id: string;
  cost_center_id: string | null;
  employee_id: string | null;
  debit_amount: number;
  credit_amount: number;
  description: string | null;
  source_type: string | null;
}

interface GLAccount {
  id: string;
  account_code: string;
  account_name: string;
}

interface CostCenter {
  id: string;
  cost_center_code: string;
}

const GLJournalBatchesPage = () => {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const [batches, setBatches] = useState<JournalBatch[]>([]);
  const [entries, setEntries] = useState<Record<string, JournalEntry[]>>({});
  const [glAccounts, setGLAccounts] = useState<GLAccount[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBatches, setExpandedBatches] = useState<string[]>([]);

  useEffect(() => {
    if (selectedCompanyId) {
      loadData();
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    try {
      const { data: batchData, error: batchError } = await supabase
        .from('gl_journal_batches')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('batch_date', { ascending: false });
      if (batchError) throw batchError;
      setBatches(batchData || []);

      const { data: glData } = await supabase
        .from('gl_accounts')
        .select('id, account_code, account_name')
        .eq('company_id', selectedCompanyId);
      setGLAccounts(glData || []);

      const { data: ccData } = await supabase
        .from('gl_cost_centers')
        .select('id, cost_center_code')
        .eq('company_id', selectedCompanyId);
      setCostCenters(ccData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('common.error', 'Error loading data'));
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async (batchId: string) => {
    try {
      const { data, error } = await supabase
        .from('gl_journal_entries')
        .select('*')
        .eq('batch_id', batchId)
        .order('entry_number');
      if (error) throw error;
      setEntries(prev => ({ ...prev, [batchId]: data || [] }));
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const toggleExpand = async (batchId: string) => {
    if (!expandedBatches.includes(batchId)) {
      await loadEntries(batchId);
    }
    setExpandedBatches(prev =>
      prev.includes(batchId) ? prev.filter(b => b !== batchId) : [...prev, batchId]
    );
  };

  const getAccountName = (id: string) => {
    const acc = glAccounts.find(a => a.id === id);
    return acc ? `${acc.account_code} - ${acc.account_name}` : '-';
  };

  const getCostCenterCode = (id: string | null) => {
    if (!id) return '-';
    const cc = costCenters.find(c => c.id === id);
    return cc?.cost_center_code || '-';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'secondary',
      pending: 'outline',
      posted: 'default',
      reversed: 'destructive',
      failed: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleExportCSV = (batch: JournalBatch) => {
    const batchEntries = entries[batch.id] || [];
    if (batchEntries.length === 0) {
      toast.error(t('common.noData', 'No entries to export'));
      return;
    }

    const headers = ['Entry#', 'Date', 'Account', 'Cost Center', 'Debit', 'Credit', 'Description'];
    const rows = batchEntries.map(e => [
      e.entry_number,
      e.entry_date,
      getAccountName(e.account_id),
      getCostCenterCode(e.cost_center_id),
      e.debit_amount || '',
      e.credit_amount || '',
      e.description || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batch.batch_number}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('common.exported', 'Exported successfully'));
  };

  const filteredBatches = batches.filter(b =>
    b.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description || '').toLowerCase().includes(searchQuery.toLowerCase())
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
            { label: t('payroll.gl.journalBatches', 'Journal Batches') }
          ]}
        />

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('payroll.gl.journalBatches', 'Journal Batches')}</h1>
            <p className="text-muted-foreground">{t('payroll.gl.journalBatchesDesc', 'View and manage GL journal entries')}</p>
          </div>
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
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t('common.noData', 'No journal batches')}</div>
            ) : (
              <div className="space-y-2">
                {filteredBatches.map((batch) => (
                  <Collapsible
                    key={batch.id}
                    open={expandedBatches.includes(batch.id)}
                    onOpenChange={() => toggleExpand(batch.id)}
                  >
                    <div className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-4">
                            {expandedBatches.includes(batch.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {batch.batch_number}
                                {getStatusBadge(batch.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDateForDisplay(batch.batch_date, 'MMM dd, yyyy')}
                                {batch.description && ` • ${batch.description}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">{t('payroll.gl.totalDebits', 'Debits')}</div>
                              <div className="font-mono">{formatCurrency(batch.total_debits || 0)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">{t('payroll.gl.totalCredits', 'Credits')}</div>
                              <div className="font-mono">{formatCurrency(batch.total_credits || 0)}</div>
                            </div>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" onClick={() => handleExportCSV(batch)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              {batch.status === 'posted' && (
                                <Button variant="ghost" size="sm" title={t('payroll.gl.reverse', 'Reverse')}>
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t p-4 bg-muted/20">
                          <h4 className="text-sm font-medium mb-3">{t('payroll.gl.journalEntries', 'Journal Entries')}</h4>
                          {(entries[batch.id] || []).length === 0 ? (
                            <p className="text-sm text-muted-foreground">{t('common.noEntries', 'No entries')}</p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-16">#</TableHead>
                                  <TableHead>{t('payroll.gl.account', 'Account')}</TableHead>
                                  <TableHead>{t('payroll.gl.costCenter', 'Cost Center')}</TableHead>
                                  <TableHead className="text-right">{t('payroll.gl.debit', 'Debit')}</TableHead>
                                  <TableHead className="text-right">{t('payroll.gl.credit', 'Credit')}</TableHead>
                                  <TableHead>{t('common.description', 'Description')}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(entries[batch.id] || []).map((entry) => (
                                  <TableRow key={entry.id}>
                                    <TableCell className="font-mono">{entry.entry_number}</TableCell>
                                    <TableCell className="font-mono text-sm">{getAccountName(entry.account_id)}</TableCell>
                                    <TableCell className="font-mono text-sm">{getCostCenterCode(entry.cost_center_id)}</TableCell>
                                    <TableCell className="text-right font-mono">
                                      {entry.debit_amount ? formatCurrency(entry.debit_amount) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                      {entry.credit_amount ? formatCurrency(entry.credit_amount) : '-'}
                                    </TableCell>
                                    <TableCell className="text-sm">{entry.description || '-'}</TableCell>
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
      </div>
    </AppLayout>
  );
};

export default GLJournalBatchesPage;
