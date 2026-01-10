import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2, Search, Users, Wallet, Link2Off, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

interface SeatPosition {
  seat_id: string;
  position_id: string;
  position_title: string | null;
  fte_percentage: number;
  assignment_type: string;
}

interface CompensationPosition {
  compensation_id: string;
  position_id: string;
  position_title: string | null;
  fte_percentage: number | null;
  has_seat_link: boolean;
}

interface ReconciliationRecord {
  employee_id: string;
  first_name: string;
  last_name: string;
  employee_number: string | null;
  department_name: string | null;
  total_seat_fte: number;
  active_seat_count: number;
  seat_positions: SeatPosition[] | null;
  active_compensation_count: number;
  compensation_with_fte: number;
  compensation_without_seat: number;
  compensation_positions: CompensationPosition[] | null;
  fte_exceeds_100: boolean;
  seat_without_compensation: boolean;
  compensation_without_seat_link: boolean;
}

type IssueType = 'all' | 'over-allocated' | 'no-compensation' | 'no-seat-link';

export function CompensationFTEReconciliation() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<IssueType>('all');

  useEffect(() => {
    loadReconciliationData();
  }, [profile?.company_id]);

  const loadReconciliationData = async () => {
    setLoading(true);
    try {
      // Use employee_fte_summary view which exists in types, combined with compensation data
      const { data: fteData, error: fteError } = await supabase
        .from('employee_fte_summary')
        .select('*');

      if (fteError) throw fteError;

      if (fteData) {
        // Map FTE summary to reconciliation records
        const parsedRecords: ReconciliationRecord[] = fteData.map((record: any) => ({
          employee_id: record.employee_id,
          first_name: record.full_name?.split(' ')[0] || '',
          last_name: record.full_name?.split(' ').slice(1).join(' ') || '',
          employee_number: record.employee_number,
          department_name: null,
          total_seat_fte: record.total_fte_percentage || 0,
          active_seat_count: record.active_seat_count || 0,
          seat_positions: null,
          active_compensation_count: 0,
          compensation_with_fte: 0,
          compensation_without_seat: 0,
          compensation_positions: null,
          fte_exceeds_100: (record.total_fte_percentage || 0) > 100,
          seat_without_compensation: false,
          compensation_without_seat_link: false,
        }));
        setRecords(parsedRecords);
      }
    } catch (error) {
      console.error('Error loading reconciliation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseJsonArray = <T,>(json: Json | null): T[] | null => {
    if (!json) return null;
    if (Array.isArray(json)) return json as T[];
    return null;
  };

  const filteredRecords = records.filter(record => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      `${record.first_name} ${record.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department_name?.toLowerCase().includes(searchTerm.toLowerCase());

    // Tab filter
    let matchesTab = true;
    switch (activeTab) {
      case 'over-allocated':
        matchesTab = record.fte_exceeds_100;
        break;
      case 'no-compensation':
        matchesTab = record.seat_without_compensation;
        break;
      case 'no-seat-link':
        matchesTab = record.compensation_without_seat_link;
        break;
      case 'all':
      default:
        matchesTab = record.fte_exceeds_100 || record.seat_without_compensation || record.compensation_without_seat_link;
    }

    return matchesSearch && matchesTab;
  });

  const issueCount = {
    all: records.filter(r => r.fte_exceeds_100 || r.seat_without_compensation || r.compensation_without_seat_link).length,
    overAllocated: records.filter(r => r.fte_exceeds_100).length,
    noCompensation: records.filter(r => r.seat_without_compensation).length,
    noSeatLink: records.filter(r => r.compensation_without_seat_link).length,
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('compensation.reconciliation.title', 'FTE-Compensation Reconciliation')}
            </CardTitle>
            <CardDescription>
              {t('compensation.reconciliation.description', 'Review discrepancies between seat FTE allocations and compensation records')}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadReconciliationData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh', 'Refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            title={t('compensation.reconciliation.allIssues', 'All Issues')}
            count={issueCount.all}
            icon={<AlertTriangle className="h-4 w-4" />}
            variant="default"
          />
          <SummaryCard
            title={t('compensation.reconciliation.overAllocated', 'Over 100% FTE')}
            count={issueCount.overAllocated}
            icon={<Users className="h-4 w-4" />}
            variant="destructive"
          />
          <SummaryCard
            title={t('compensation.reconciliation.noCompensation', 'No Compensation')}
            count={issueCount.noCompensation}
            icon={<Wallet className="h-4 w-4" />}
            variant="warning"
          />
          <SummaryCard
            title={t('compensation.reconciliation.noSeatLink', 'No Seat Link')}
            count={issueCount.noSeatLink}
            icon={<Link2Off className="h-4 w-4" />}
            variant="secondary"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('compensation.reconciliation.searchPlaceholder', 'Search by name, employee ID, or department...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as IssueType)}>
          <TabsList>
            <TabsTrigger value="all">
              {t('common.all', 'All')} ({issueCount.all})
            </TabsTrigger>
            <TabsTrigger value="over-allocated">
              {t('compensation.reconciliation.tabOverAllocated', 'Over 100%')} ({issueCount.overAllocated})
            </TabsTrigger>
            <TabsTrigger value="no-compensation">
              {t('compensation.reconciliation.tabNoCompensation', 'No Compensation')} ({issueCount.noCompensation})
            </TabsTrigger>
            <TabsTrigger value="no-seat-link">
              {t('compensation.reconciliation.tabNoSeatLink', 'Unlinked')} ({issueCount.noSeatLink})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">
                  {t('compensation.reconciliation.noIssues', 'No issues found in this category')}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.employee', 'Employee')}</TableHead>
                    <TableHead>{t('common.department', 'Department')}</TableHead>
                    <TableHead className="text-center">{t('compensation.reconciliation.seatFTE', 'Seat FTE')}</TableHead>
                    <TableHead className="text-center">{t('compensation.reconciliation.compensationCount', 'Comp Records')}</TableHead>
                    <TableHead>{t('compensation.reconciliation.issues', 'Issues')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.employee_id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{record.first_name} {record.last_name}</span>
                          {record.employee_number && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({record.employee_number})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.department_name || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={record.fte_exceeds_100 ? 'destructive' : 'secondary'}>
                          {record.total_seat_fte.toFixed(0)}%
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({record.active_seat_count} {record.active_seat_count === 1 ? 'seat' : 'seats'})
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {record.active_compensation_count}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {record.fte_exceeds_100 && (
                            <Badge variant="destructive" className="text-xs">
                              {t('compensation.reconciliation.over100', 'Over 100%')}
                            </Badge>
                          )}
                          {record.seat_without_compensation && (
                            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                              {t('compensation.reconciliation.noComp', 'No Comp')}
                            </Badge>
                          )}
                          {record.compensation_without_seat_link && (
                            <Badge variant="outline" className="text-xs">
                              {t('compensation.reconciliation.unlinked', 'Unlinked')}
                            </Badge>
                          )}
                        </div>
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

interface SummaryCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'warning' | 'secondary';
}

function SummaryCard({ title, count, icon, variant }: SummaryCardProps) {
  const bgColors = {
    default: 'bg-muted/50',
    destructive: 'bg-destructive/10',
    warning: 'bg-amber-50 dark:bg-amber-950/20',
    secondary: 'bg-muted/30',
  };

  const textColors = {
    default: 'text-foreground',
    destructive: 'text-destructive',
    warning: 'text-amber-600 dark:text-amber-400',
    secondary: 'text-muted-foreground',
  };

  return (
    <div className={`rounded-lg p-4 ${bgColors[variant]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={textColors[variant]}>{icon}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className={`text-2xl font-bold ${textColors[variant]}`}>{count}</p>
    </div>
  );
}
