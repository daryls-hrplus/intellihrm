import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, PieChart, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PositionSeat } from './types';

interface SeatBudgetAllocationCardProps {
  seat: PositionSeat;
  occupants?: Array<{
    employee_name?: string;
    budget_percentage: number;
    fte_percentage: number;
  }>;
}

export function SeatBudgetAllocationCard({ seat, occupants = [] }: SeatBudgetAllocationCardProps) {
  const totalBudgetAllocated = occupants.reduce((sum, o) => sum + o.budget_percentage, 0);
  const hasBudget = seat.budget_allocation_amount && seat.budget_allocation_amount > 0;

  if (!hasBudget) {
    return null;
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: seat.budget_allocation_currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Budget Allocation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Total Budget */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Budget</span>
          <span className="text-lg font-semibold">
            {formatCurrency(seat.budget_allocation_amount || 0)}
          </span>
        </div>

        {/* Funding Source */}
        {seat.budget_funding_source && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              Funding Source
            </span>
            <Badge variant="outline">{seat.budget_funding_source}</Badge>
          </div>
        )}

        {/* Cost Center */}
        {seat.budget_cost_center_code && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cost Center</span>
            <span className="font-mono text-xs">{seat.budget_cost_center_code}</span>
          </div>
        )}

        {/* Budget Distribution */}
        {occupants.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <PieChart className="h-3 w-3" />
                Budget Distribution
              </span>
              <span className={cn(
                "font-medium",
                totalBudgetAllocated > 100 && "text-destructive",
                totalBudgetAllocated === 100 && "text-green-600"
              )}>
                {totalBudgetAllocated}% allocated
              </span>
            </div>
            <Progress 
              value={Math.min(totalBudgetAllocated, 100)} 
              className={cn("h-2", totalBudgetAllocated > 100 && "[&>div]:bg-destructive")}
            />
            
            <div className="mt-2 space-y-1">
              {occupants.map((occ, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="truncate">{occ.employee_name || 'Employee'}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{occ.fte_percentage}% FTE</span>
                    <Badge variant="secondary" className="text-xs">
                      {formatCurrency((seat.budget_allocation_amount || 0) * (occ.budget_percentage / 100))}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}