import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, TrendingUp, TrendingDown, AlertTriangle, Target, Activity } from "lucide-react";

interface TalentReviewIndicatorSummaryProps {
  companyId: string;
  departmentId?: string;
  cycleId?: string;
}

interface EmployeeIndicator {
  employee_id: string;
  employee_name: string;
  department: string;
  indicators: Array<{
    code: string;
    name: string;
    score: number;
    level: string;
  }>;
  overall_readiness: number;
  risk_flags: string[];
}

export function TalentReviewIndicatorSummary({ 
  companyId, 
  departmentId, 
  cycleId 
}: TalentReviewIndicatorSummaryProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['talent-review-indicators', companyId, departmentId],
    queryFn: async () => {
      // Fetch all indicator scores with employee details
      let query = supabase
        .from('talent_indicator_scores')
        .select(`
          *,
          indicator:talent_indicator_definitions(*),
          employee:profiles(id, full_name, department_id, departments(name))
        `)
        .gte('valid_until', new Date().toISOString());

      const { data: scores, error } = await query;
      if (error) throw error;

      // Group by employee
      const byEmployee: Record<string, EmployeeIndicator> = {};
      
      for (const score of scores || []) {
        const empId = score.employee_id;
        if (!byEmployee[empId]) {
          byEmployee[empId] = {
            employee_id: empId,
            employee_name: (score.employee as any)?.full_name || 'Unknown',
            department: (score.employee as any)?.departments?.name || 'Unknown',
            indicators: [],
            overall_readiness: 0,
            risk_flags: []
          };
        }

        byEmployee[empId].indicators.push({
          code: score.indicator?.code || '',
          name: score.indicator?.name || '',
          score: score.score,
          level: score.level
        });

        // Track risk flags
        if (score.indicator?.code === 'flight_risk' && score.score >= 70) {
          byEmployee[empId].risk_flags.push('High Flight Risk');
        }
        if (score.indicator?.code === 'engagement_level' && score.score < 40) {
          byEmployee[empId].risk_flags.push('Low Engagement');
        }
      }

      // Calculate overall readiness for each employee
      Object.values(byEmployee).forEach(emp => {
        const readinessIndicators = emp.indicators.filter(i => 
          ['leadership_readiness', 'succession_readiness'].includes(i.code)
        );
        if (readinessIndicators.length > 0) {
          emp.overall_readiness = readinessIndicators.reduce((sum, i) => sum + i.score, 0) / readinessIndicators.length;
        }
      });

      const employees = Object.values(byEmployee);

      // Filter by department if specified
      const filtered = departmentId 
        ? employees.filter(e => e.department === departmentId)
        : employees;

      return {
        employees: filtered,
        summary: {
          total: filtered.length,
          highReadiness: filtered.filter(e => e.overall_readiness >= 70).length,
          mediumReadiness: filtered.filter(e => e.overall_readiness >= 40 && e.overall_readiness < 70).length,
          lowReadiness: filtered.filter(e => e.overall_readiness < 40).length,
          withRisks: filtered.filter(e => e.risk_flags.length > 0).length
        }
      };
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-success';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      high: 'default',
      medium: 'secondary',
      low: 'destructive',
      critical: 'destructive'
    };
    return variants[level] || 'outline';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading talent review data...</div>
        </CardContent>
      </Card>
    );
  }

  const { employees, summary } = data || { employees: [], summary: { total: 0, highReadiness: 0, mediumReadiness: 0, lowReadiness: 0, withRisks: 0 } };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{summary.total}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total Employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-success">{summary.highReadiness}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">High Readiness</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold text-warning">{summary.mediumReadiness}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Medium Readiness</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{summary.lowReadiness}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Low Readiness</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{summary.withRisks}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">With Risk Flags</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Talent Indicator Details
          </CardTitle>
          <CardDescription>
            Individual employee readiness and risk indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({summary.total})</TabsTrigger>
              <TabsTrigger value="ready">Ready Now ({summary.highReadiness})</TabsTrigger>
              <TabsTrigger value="developing">Developing ({summary.mediumReadiness})</TabsTrigger>
              <TabsTrigger value="risks">With Risks ({summary.withRisks})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <EmployeeIndicatorTable 
                employees={employees} 
                getScoreColor={getScoreColor}
                getLevelBadge={getLevelBadge}
              />
            </TabsContent>
            <TabsContent value="ready">
              <EmployeeIndicatorTable 
                employees={employees.filter(e => e.overall_readiness >= 70)} 
                getScoreColor={getScoreColor}
                getLevelBadge={getLevelBadge}
              />
            </TabsContent>
            <TabsContent value="developing">
              <EmployeeIndicatorTable 
                employees={employees.filter(e => e.overall_readiness >= 40 && e.overall_readiness < 70)} 
                getScoreColor={getScoreColor}
                getLevelBadge={getLevelBadge}
              />
            </TabsContent>
            <TabsContent value="risks">
              <EmployeeIndicatorTable 
                employees={employees.filter(e => e.risk_flags.length > 0)} 
                getScoreColor={getScoreColor}
                getLevelBadge={getLevelBadge}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployeeIndicatorTable({ 
  employees, 
  getScoreColor,
  getLevelBadge
}: { 
  employees: EmployeeIndicator[];
  getScoreColor: (score: number) => string;
  getLevelBadge: (level: string) => 'default' | 'secondary' | 'destructive' | 'outline';
}) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No employees in this category
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Overall Readiness</TableHead>
          <TableHead>Indicators</TableHead>
          <TableHead>Risk Flags</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.employee_id}>
            <TableCell className="font-medium">{employee.employee_name}</TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress value={employee.overall_readiness} className="w-16 h-2" />
                <span className={`font-medium ${getScoreColor(employee.overall_readiness)}`}>
                  {employee.overall_readiness.toFixed(0)}%
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {employee.indicators.slice(0, 3).map((ind) => (
                  <Badge 
                    key={ind.code} 
                    variant={getLevelBadge(ind.level)}
                    className="text-xs"
                  >
                    {ind.name}: {ind.score.toFixed(0)}%
                  </Badge>
                ))}
                {employee.indicators.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{employee.indicators.length - 3} more
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              {employee.risk_flags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {employee.risk_flags.map((flag, i) => (
                    <Badge key={i} variant="destructive" className="text-xs">
                      {flag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground text-sm">None</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
