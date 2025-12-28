import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp } from "lucide-react";

interface TimesheetCostColumnProps {
  timeEntryId: string;
  hours: number;
}

export function TimesheetCostColumn({ timeEntryId, hours }: TimesheetCostColumnProps) {
  const [costData, setCostData] = useState<{
    cost: number | null;
    billable: number | null;
    isLoading: boolean;
  }>({
    cost: null,
    billable: null,
    isLoading: true,
  });

  useEffect(() => {
    const fetchCost = async () => {
      if (!timeEntryId) {
        setCostData({ cost: null, billable: null, isLoading: false });
        return;
      }

      try {
        const { data } = await supabase
          .from('project_cost_entries')
          .select('total_cost, billable_amount')
          .eq('time_entry_id', timeEntryId)
          .maybeSingle();

        setCostData({
          cost: data?.total_cost ?? null,
          billable: data?.billable_amount ?? null,
          isLoading: false,
        });
      } catch (error) {
        setCostData({ cost: null, billable: null, isLoading: false });
      }
    };

    fetchCost();
  }, [timeEntryId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (costData.isLoading) {
    return <span className="text-muted-foreground text-sm">...</span>;
  }

  if (costData.cost === null) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="text-xs">
              Not calculated
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cost not yet calculated for this entry</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const margin = costData.billable && costData.cost > 0 
    ? ((costData.billable - costData.cost) / costData.billable) * 100 
    : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{formatCurrency(costData.cost)}</span>
          </div>
          {costData.billable !== null && costData.billable > 0 && (
            <Badge 
              variant={margin > 20 ? "default" : margin > 0 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {margin > 0 ? '+' : ''}{margin.toFixed(0)}%
            </Badge>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Labor Cost:</span>
              <span className="font-medium">{formatCurrency(costData.cost)}</span>
            </div>
            {costData.billable !== null && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Billable:</span>
                <span className="font-medium">{formatCurrency(costData.billable)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Margin:</span>
              <span className={`font-medium ${margin > 0 ? 'text-success' : 'text-destructive'}`}>
                {margin.toFixed(1)}%
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default TimesheetCostColumn;
