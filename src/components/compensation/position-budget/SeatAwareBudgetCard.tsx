import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DollarSign, 
  Users, 
  Armchair, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  PieChart,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeatBudgetData {
  seat_id: string;
  seat_code: string;
  seat_status: string;
  seat_budget: number | null;
  seat_currency: string;
  budget_funding_source: string | null;
  budget_cost_center_code: string | null;
  is_shared_seat: boolean;
  max_occupants: number;
  current_occupant_count: number;
  actual_fte_allocated: number;
  actual_budget_percentage_allocated: number;
  position_title: string;
}

interface BudgetItem {
  id: string;
  position_title: string;
  seat_id: string | null;
  base_salary: number;
  annual_cost: number;
  fully_loaded_cost: number;
  fte: number;
  headcount: number;
  is_vacant: boolean;
  seat_data?: SeatBudgetData | null;
}

interface SeatAwareBudgetCardProps {
  item: BudgetItem;
  currency?: string;
}

export function SeatAwareBudgetCard({ item, currency = 'USD' }: SeatAwareBudgetCardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const seatData = item.seat_data;
  const hasSeatLink = !!seatData;
  
  // Calculate variances
  const budgetVariance = hasSeatLink && seatData.seat_budget
    ? item.annual_cost - seatData.seat_budget
    : null;
  
  const fteVariance = hasSeatLink
    ? (item.fte * 100) - seatData.actual_fte_allocated
    : null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      FILLED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      VACANT: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
      FROZEN: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
      APPROVED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      PLANNED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
      ELIMINATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <Card className={cn(
      "transition-all",
      !hasSeatLink && "border-dashed border-muted-foreground/30"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {item.position_title}
            {item.is_vacant && (
              <Badge variant="outline" className="text-xs">Vacant</Badge>
            )}
          </CardTitle>
          {hasSeatLink ? (
            <Badge className={getStatusColor(seatData.seat_status)}>
              {seatData.seat_code}
            </Badge>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    No Seat Link
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This budget item is not linked to a specific seat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Budget Amounts */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Budgeted Cost</p>
            <p className="font-semibold">{formatCurrency(item.annual_cost)}</p>
          </div>
          {hasSeatLink && seatData.seat_budget && (
            <div>
              <p className="text-xs text-muted-foreground">Seat Allocation</p>
              <p className="font-semibold">{formatCurrency(seatData.seat_budget)}</p>
            </div>
          )}
        </div>

        {/* FTE Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Budgeted FTE
          </span>
          <span className="font-medium">{item.fte.toFixed(2)}</span>
        </div>

        {/* Seat-Specific Info */}
        {hasSeatLink && (
          <>
            {/* Occupancy */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Armchair className="h-3 w-3" />
                  Seat Occupancy
                </span>
                <span className={cn(
                  "font-medium",
                  seatData.current_occupant_count > seatData.max_occupants && "text-destructive"
                )}>
                  {seatData.current_occupant_count} / {seatData.max_occupants}
                </span>
              </div>
              
              {/* FTE Allocation Progress */}
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Actual FTE Allocated</span>
                <span className={cn(
                  "font-medium",
                  seatData.actual_fte_allocated > 100 && "text-destructive",
                  seatData.actual_fte_allocated === 100 && "text-green-600"
                )}>
                  {seatData.actual_fte_allocated.toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={Math.min(seatData.actual_fte_allocated, 100)} 
                className={cn(
                  "h-1.5",
                  seatData.actual_fte_allocated > 100 && "[&>div]:bg-destructive"
                )}
              />
            </div>

            {/* Funding Source */}
            {(seatData.budget_funding_source || seatData.budget_cost_center_code) && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Funding
                </span>
                <div className="flex items-center gap-1">
                  {seatData.budget_funding_source && (
                    <Badge variant="outline" className="text-xs">
                      {seatData.budget_funding_source}
                    </Badge>
                  )}
                  {seatData.budget_cost_center_code && (
                    <span className="font-mono text-xs">
                      {seatData.budget_cost_center_code}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Variance Indicators */}
            {(budgetVariance !== null || fteVariance !== null) && (
              <div className="pt-2 border-t space-y-1.5">
                {budgetVariance !== null && Math.abs(budgetVariance) > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <PieChart className="h-3 w-3" />
                      Budget Variance
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 font-medium",
                      budgetVariance > 0 ? "text-destructive" : "text-green-600"
                    )}>
                      {budgetVariance > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {formatCurrency(Math.abs(budgetVariance))}
                    </span>
                  </div>
                )}
                
                {fteVariance !== null && Math.abs(fteVariance) > 5 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">FTE Variance</span>
                    <span className={cn(
                      "flex items-center gap-1 font-medium",
                      fteVariance < 0 ? "text-amber-600" : "text-green-600"
                    )}>
                      {fteVariance < 0 ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {fteVariance > 0 ? '+' : ''}{fteVariance.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Shared Seat Indicator */}
            {seatData.is_shared_seat && (
              <Badge variant="secondary" className="text-xs w-full justify-center">
                <Users className="h-3 w-3 mr-1" />
                Shared Seat (max {seatData.max_occupants} occupants)
              </Badge>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
