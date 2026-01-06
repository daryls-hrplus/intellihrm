import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Target, Activity, RefreshCw, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SuccessorIndicatorsPanelProps {
  employeeId: string;
  companyId: string;
  onRefresh?: () => void;
}

interface IndicatorScore {
  id: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  explanation: string;
  explanation_factors: Record<string, any>;
  computed_at: string;
  indicator: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    threshold_levels: { low: number; medium: number; high: number } | null;
  };
}

const INDICATOR_ICONS: Record<string, React.ElementType> = {
  flight_risk: AlertTriangle,
  leadership_readiness: TrendingUp,
  succession_readiness: Target,
  engagement_level: Activity,
};

const LEVEL_COLORS: Record<string, string> = {
  low: 'bg-destructive text-destructive-foreground',
  medium: 'bg-warning text-warning-foreground',
  high: 'bg-success text-success-foreground',
  critical: 'bg-destructive text-destructive-foreground',
};

const LEVEL_PROGRESS_COLORS: Record<string, string> = {
  low: 'bg-destructive',
  medium: 'bg-warning',
  high: 'bg-success',
  critical: 'bg-destructive',
};

export function SuccessorIndicatorsPanel({ employeeId, companyId, onRefresh }: SuccessorIndicatorsPanelProps) {
  const [isComputing, setIsComputing] = React.useState(false);

  const { data: indicators, isLoading, refetch } = useQuery({
    queryKey: ['employee-indicators', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('feedback-readiness-scorer', {
        body: {
          action: 'get_employee_indicators',
          employee_id: employeeId,
          company_id: companyId
        }
      });
      if (error) throw error;
      return data?.indicators as IndicatorScore[] || [];
    },
    enabled: !!employeeId
  });

  const handleCompute = async () => {
    setIsComputing(true);
    try {
      const { data, error } = await supabase.functions.invoke('feedback-readiness-scorer', {
        body: {
          action: 'compute_indicators',
          employee_id: employeeId,
          company_id: companyId
        }
      });
      if (error) throw error;
      toast.success(`Computed ${data?.indicators?.length || 0} indicators`);
      refetch();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to compute indicators');
    } finally {
      setIsComputing(false);
    }
  };

  const getIcon = (code: string) => INDICATOR_ICONS[code] || Activity;

  const getLevelIcon = (level: string, code: string) => {
    // For flight risk, invert the meaning
    if (code === 'flight_risk') {
      if (level === 'high' || level === 'critical') return <AlertCircle className="h-4 w-4 text-destructive" />;
      if (level === 'medium') return <AlertTriangle className="h-4 w-4 text-warning" />;
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
    // For readiness indicators
    if (level === 'high') return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (level === 'medium') return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading indicators...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5" />
              Readiness & Risk Indicators
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCompute}
              disabled={isComputing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isComputing ? 'animate-spin' : ''}`} />
              {isComputing ? 'Computing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {indicators && indicators.length > 0 ? (
            <div className="space-y-4">
              {indicators.map((indicator) => {
                const IconComponent = getIcon(indicator.indicator?.code || '');
                const isFlightRisk = indicator.indicator?.code === 'flight_risk';
                
                return (
                  <div key={indicator.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{indicator.indicator?.name}</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{indicator.indicator?.description}</p>
                            {indicator.explanation_factors && (
                              <div className="mt-2 text-xs space-y-1">
                                {Object.entries(indicator.explanation_factors).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <span>{typeof value === 'number' ? value.toFixed(1) : String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        {getLevelIcon(indicator.level, indicator.indicator?.code || '')}
                        <Badge className={LEVEL_COLORS[indicator.level]}>
                          {indicator.level}
                        </Badge>
                        <span className={`text-lg font-bold ${
                          isFlightRisk 
                            ? (indicator.score >= 70 ? 'text-destructive' : indicator.score >= 40 ? 'text-warning' : 'text-success')
                            : (indicator.score >= 70 ? 'text-success' : indicator.score >= 40 ? 'text-warning' : 'text-destructive')
                        }`}>
                          {indicator.score.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={indicator.score} 
                      className="h-2"
                    />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{indicator.explanation}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="flex items-center gap-1">
                            Confidence: {(indicator.confidence * 100).toFixed(0)}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Based on available data quality and coverage
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No indicators computed yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={handleCompute}>
                Compute Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
