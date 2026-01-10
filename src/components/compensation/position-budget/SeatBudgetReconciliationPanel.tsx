import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Armchair,
  TrendingUp,
  TrendingDown,
  Link2,
  Unlink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SeatBudgetReconciliationPanelProps {
  scenarioId: string;
  companyId: string;
  onRefresh?: () => void;
}

interface ReconciliationData {
  position_id: string;
  position_title: string;
  position_code: string;
  department_name: string;
  budget_line_items: number;
  seat_linked_items: number;
  total_budgeted_headcount: number;
  total_budgeted_fte: number;
  total_annual_cost: number;
  actual_total_seats: number;
  actual_filled_seats: number;
  actual_vacant_seats: number;
  actual_seat_budget_allocation: number;
  headcount_variance: number;
  budget_variance: number;
}

export function SeatBudgetReconciliationPanel({ 
  scenarioId, 
  companyId,
  onRefresh 
}: SeatBudgetReconciliationPanelProps) {
  const { data: reconciliationData, isLoading, refetch } = useQuery({
    queryKey: ['seat-budget-reconciliation', scenarioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('position_budget_seat_summary')
        .select('*')
        .eq('scenario_id', scenarioId);
      
      if (error) throw error;
      return data as ReconciliationData[];
    },
    enabled: !!scenarioId,
  });

  const populateFromSeats = async () => {
    try {
      const { data, error } = await supabase.rpc('populate_budget_from_seats', {
        p_scenario_id: scenarioId,
        p_position_ids: null,
      });
      
      if (error) throw error;
      
      toast.success(`Added ${data} budget items from seats`);
      refetch();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to populate from seats');
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBudgeted = reconciliationData?.reduce((sum, r) => sum + (r.total_annual_cost || 0), 0) || 0;
  const totalSeatBudget = reconciliationData?.reduce((sum, r) => sum + (r.actual_seat_budget_allocation || 0), 0) || 0;
  const totalVariance = totalBudgeted - totalSeatBudget;
  
  const itemsWithVariance = reconciliationData?.filter(r => 
    Math.abs(r.headcount_variance) > 0 || Math.abs(r.budget_variance) > 1000
  ) || [];

  const unlinkedItems = reconciliationData?.filter(r => 
    r.seat_linked_items < r.budget_line_items
  ) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Seat-Budget Reconciliation
          </CardTitle>
          <CardDescription>
            Compare budgeted positions against actual seat allocations
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={populateFromSeats}>
            <Armchair className="h-4 w-4 mr-1" />
            Import from Seats
          </Button>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Total Budgeted</p>
            <p className="text-lg font-semibold">{formatCurrency(totalBudgeted)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Seat Allocations</p>
            <p className="text-lg font-semibold">{formatCurrency(totalSeatBudget)}</p>
          </div>
          <div className={cn(
            "rounded-lg border p-3",
            totalVariance > 0 ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20" : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
          )}>
            <p className="text-xs text-muted-foreground">Variance</p>
            <p className={cn(
              "text-lg font-semibold flex items-center gap-1",
              totalVariance > 0 ? "text-amber-600" : "text-green-600"
            )}>
              {totalVariance > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatCurrency(Math.abs(totalVariance))}
            </p>
          </div>
        </div>

        {/* Warnings */}
        {unlinkedItems.length > 0 && (
          <Alert>
            <Unlink className="h-4 w-4" />
            <AlertTitle>Unlinked Budget Items</AlertTitle>
            <AlertDescription>
              {unlinkedItems.length} position(s) have budget items not linked to specific seats.
              Consider linking them for accurate tracking.
            </AlertDescription>
          </Alert>
        )}

        {itemsWithVariance.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Variance Detected</AlertTitle>
            <AlertDescription>
              {itemsWithVariance.length} position(s) have significant variance between budgeted and actual seat allocations.
            </AlertDescription>
          </Alert>
        )}

        {/* Reconciliation Table */}
        {reconciliationData && reconciliationData.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-center">Budgeted HC</TableHead>
                  <TableHead className="text-center">Actual Seats</TableHead>
                  <TableHead className="text-right">Budgeted Cost</TableHead>
                  <TableHead className="text-right">Seat Budget</TableHead>
                  <TableHead className="text-center">Seat Links</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliationData.map((row) => {
                  const hasHeadcountVariance = row.headcount_variance !== 0;
                  const hasBudgetVariance = Math.abs(row.budget_variance) > 1000;
                  const allLinked = row.seat_linked_items === row.budget_line_items;
                  
                  return (
                    <TableRow key={row.position_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{row.position_title}</p>
                          <p className="text-xs text-muted-foreground">{row.department_name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{row.total_budgeted_headcount}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({row.total_budgeted_fte?.toFixed(1)} FTE)
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-medium">{row.actual_total_seats}</span>
                          <span className="text-xs text-muted-foreground">
                            {row.actual_filled_seats} filled / {row.actual_vacant_seats} vacant
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(row.total_annual_cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.actual_seat_budget_allocation)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Progress 
                            value={(row.seat_linked_items / Math.max(row.budget_line_items, 1)) * 100}
                            className="h-1.5 w-16"
                          />
                          <span className="text-xs text-muted-foreground">
                            {row.seat_linked_items}/{row.budget_line_items}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {!hasHeadcountVariance && !hasBudgetVariance && allLinked ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Aligned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Review
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Armchair className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No budget items to reconcile</p>
            <Button variant="link" onClick={populateFromSeats}>
              Import from existing seats
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
