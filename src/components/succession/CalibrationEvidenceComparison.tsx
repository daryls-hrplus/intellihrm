import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Shield,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  job_title?: string;
}

interface EmployeeComparison {
  employee: Employee;
  performanceRating: number;
  potentialRating: number;
  leadershipScore: number;
  confidenceScore: number;
  biasRiskLevel: 'low' | 'medium' | 'high';
  sourceCount: number;
  signalCount: number;
}

interface CalibrationEvidenceComparisonProps {
  employeeIds: string[];
  companyId: string;
}

export function CalibrationEvidenceComparison({
  employeeIds,
  companyId,
}: CalibrationEvidenceComparisonProps) {
  const { t } = useLanguage();
  const [comparisons, setComparisons] = useState<EmployeeComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparisonData();
  }, [employeeIds]);

  const loadComparisonData = async () => {
    setLoading(true);
    try {
      const comparisonData: EmployeeComparison[] = [];

      for (const employeeId of employeeIds) {
        // Fetch employee data
        const { data: employee } = await supabase
          .from('profiles')
          .select('id, first_name, avatar_url, job_title')
          .eq('id', employeeId)
          .single();

        if (!employee) continue;
        const employeeData = employee as any;

        // Fetch 9-box assessment
        const { data: assessment } = await supabase
          .from('nine_box_assessments')
          .select('performance_rating, potential_rating')
          .eq('employee_id', employeeId)
          .eq('is_current', true)
          .single();

        // Fetch signals
        const { data: signals } = await supabase
          .from('talent_signal_snapshots')
          .select(`
            signal_value,
            confidence_score,
            bias_risk_level,
            talent_signal_definitions(signal_category)
          `)
          .eq('employee_id', employeeId)
          .eq('is_current', true);

        // Fetch evidence
        const { data: evidence } = await supabase
          .from('talent_profile_evidence')
          .select('id')
          .eq('employee_id', employeeId)
          .eq('is_current', true);

        // Calculate leadership score
        const leadershipSignals = (signals || []).filter(
          s => (s.talent_signal_definitions as any)?.signal_category === 'leadership'
        );
        const leadershipScore = leadershipSignals.length > 0
          ? leadershipSignals.reduce((sum, s) => sum + (s.signal_value || 0), 0) / leadershipSignals.length
          : 0;

        // Calculate average confidence
        const avgConfidence = (signals || []).length > 0
          ? (signals || []).reduce((sum, s) => sum + (s.confidence_score || 0), 0) / signals!.length
          : 0;

        // Determine bias risk
        const highBiasCount = (signals || []).filter(s => s.bias_risk_level === 'high').length;
        const biasRiskLevel = highBiasCount > (signals || []).length * 0.3 ? 'high' :
                             highBiasCount > (signals || []).length * 0.1 ? 'medium' : 'low';

        comparisonData.push({
          employee: { 
            id: employeeData.id, 
            first_name: employeeData.first_name || '', 
            last_name: '', 
            avatar_url: employeeData.avatar_url, 
            job_title: employeeData.job_title 
          },
          performanceRating: assessment?.performance_rating || 0,
          potentialRating: assessment?.potential_rating || 0,
          leadershipScore: leadershipScore * 20, // Convert to percentage
          confidenceScore: avgConfidence * 100,
          biasRiskLevel,
          sourceCount: evidence?.length || 0,
          signalCount: signals?.length || 0,
        });
      }

      setComparisons(comparisonData);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getBiasColor = (level: string) => {
    if (level === 'low') return 'bg-success/10 text-success border-success/30';
    if (level === 'medium') return 'bg-warning/10 text-warning border-warning/30';
    return 'bg-destructive/10 text-destructive border-destructive/30';
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 1) return 'Low';
    if (rating === 2) return 'Medium';
    return 'High';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading comparison data...</div>
        </CardContent>
      </Card>
    );
  }

  if (comparisons.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
          Select employees to compare
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Calibration Comparison
        </CardTitle>
        <CardDescription>
          Side-by-side comparison of selected employees for calibration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-max">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium min-w-[200px]">Employee</th>
                  {comparisons.map(c => (
                    <th key={c.employee.id} className="p-3 text-center min-w-[150px]">
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={c.employee.avatar_url} />
                          <AvatarFallback>
                            {getInitials(c.employee.first_name, c.employee.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {c.employee.first_name} {c.employee.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {c.employee.job_title || 'No title'}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Performance Rating */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">Performance Rating</td>
                  {comparisons.map(c => (
                    <td key={c.employee.id} className="p-3 text-center">
                      <Badge variant={c.performanceRating >= 3 ? 'default' : 'secondary'}>
                        {getRatingLabel(c.performanceRating)} ({c.performanceRating})
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Potential Rating */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">Potential Rating</td>
                  {comparisons.map(c => (
                    <td key={c.employee.id} className="p-3 text-center">
                      <Badge variant={c.potentialRating >= 3 ? 'default' : 'secondary'}>
                        {getRatingLabel(c.potentialRating)} ({c.potentialRating})
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Leadership Score */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Leadership Score
                    </div>
                  </td>
                  {comparisons.map(c => (
                    <td key={c.employee.id} className="p-3">
                      <div className="space-y-1">
                        <div className="text-center font-semibold">
                          {Math.round(c.leadershipScore)}%
                        </div>
                        <Progress value={c.leadershipScore} className="h-2" />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Confidence Score */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Confidence
                    </div>
                  </td>
                  {comparisons.map(c => (
                    <td key={c.employee.id} className="p-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-1 cursor-help">
                              <div className={cn(
                                "text-center font-semibold",
                                c.confidenceScore >= 70 ? 'text-success' :
                                c.confidenceScore >= 40 ? 'text-warning' : 'text-destructive'
                              )}>
                                {Math.round(c.confidenceScore)}%
                              </div>
                              <Progress value={c.confidenceScore} className="h-2" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            Based on {c.signalCount} signals from {c.sourceCount} sources
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  ))}
                </tr>

                {/* Bias Risk */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Bias Risk
                    </div>
                  </td>
                  {comparisons.map(c => (
                    <td key={c.employee.id} className="p-3 text-center">
                      <Badge variant="outline" className={getBiasColor(c.biasRiskLevel)}>
                        {c.biasRiskLevel.charAt(0).toUpperCase() + c.biasRiskLevel.slice(1)}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Evidence Sources */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Evidence
                    </div>
                  </td>
                  {comparisons.map(c => (
                    <td key={c.employee.id} className="p-3 text-center">
                      <div className="text-sm">
                        <span className="font-semibold">{c.sourceCount}</span> sources
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.signalCount} signals
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
