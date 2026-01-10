import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, DollarSign, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeatOccupancySummary, FTEStatus } from './types';
import { FTE_STATUS_CONFIG, ASSIGNMENT_TYPE_CONFIG } from './types';

interface MultiOccupancySeatCardProps {
  seat: SeatOccupancySummary;
  onViewDetails?: (seatId: string) => void;
}

export function MultiOccupancySeatCard({ seat, onViewDetails }: MultiOccupancySeatCardProps) {
  const fteConfig = FTE_STATUS_CONFIG[seat.allocation_status as FTEStatus];
  const isOverAllocated = seat.allocation_status === 'OVER_ALLOCATED';
  const isShared = seat.is_shared_seat || seat.current_occupant_count > 1;

  return (
    <div 
      className={cn(
        "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
        isOverAllocated && "border-destructive/50 bg-destructive/5",
        isShared && !isOverAllocated && "border-primary/30 bg-primary/5"
      )}
      onClick={() => onViewDetails?.(seat.seat_id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">{seat.seat_code}</span>
            {isShared && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                Shared
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{seat.position_title}</p>
        </div>
        
        {isOverAllocated && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </TooltipTrigger>
              <TooltipContent>
                <p>FTE over-allocated: {seat.total_fte_allocated}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* FTE Allocation Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">FTE Allocation</span>
          <span className={cn("font-medium", fteConfig?.color)}>
            {seat.total_fte_allocated}%
          </span>
        </div>
        <Progress 
          value={Math.min(seat.total_fte_allocated, 100)} 
          className={cn("h-2", isOverAllocated && "[&>div]:bg-destructive")}
        />
      </div>

      {/* Occupants List */}
      {seat.occupants && seat.occupants.length > 0 && (
        <div className="space-y-2">
          {seat.occupants.map((occ, idx) => {
            const typeConfig = ASSIGNMENT_TYPE_CONFIG[occ.assignment_type];
            return (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {occ.assignment_type === 'secondment' && (
                    <ArrowRightLeft className="h-3 w-3 text-cyan-500" />
                  )}
                  <span className={cn("text-xs", typeConfig?.color)}>
                    {typeConfig?.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {occ.fte_percentage}% FTE
                  </Badge>
                  {occ.budget_percentage !== 100 && (
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-0.5" />
                      {occ.budget_percentage}%
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Info */}
      {seat.budget_allocation_amount && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Budget
          </span>
          <span className="font-medium">
            {new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: seat.budget_allocation_currency || 'USD',
              minimumFractionDigits: 0
            }).format(seat.budget_allocation_amount)}
          </span>
        </div>
      )}
    </div>
  );
}