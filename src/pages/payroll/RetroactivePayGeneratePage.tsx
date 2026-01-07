import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Calculator, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Users,
  DollarSign,
  Calendar,
  FileSpreadsheet
} from "lucide-react";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useNavigate, useParams } from "react-router-dom";
import { useRetroactivePay, RetroactivePayCalculation, RetroactivePayConfig } from "@/hooks/useRetroactivePay";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { usePageAudit } from "@/hooks/usePageAudit";

interface GroupedCalculations {
  employeeId: string;
  employeeName: string;
  employeeNumber: string | null;
  employeeStatus: string;
  calculations: RetroactivePayCalculation[];
  totalOriginal: number;
  totalAdjustment: number;
}

interface YearCycleGroup {
  year: number;
  cycle: number;
  periodDates: string;
  calculations: RetroactivePayCalculation[];
  totalOriginal: number;
  totalAdjustment: number;
}

export default function RetroactivePayGeneratePage() {
  usePageAudit('retroactive_pay_generate', 'Payroll');
  
  const navigate = useNavigate();
  const { configId } = useParams<{ configId: string }>();
  const queryClient = useQueryClient();
  const { generateCalculations, approveConfig } = useRetroactivePay();

  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  // Fetch config details
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["retroactive-pay-config", configId],
    queryFn: async () => {
      if (!configId) return null;
      const { data, error } = await supabase
        .from("retroactive_pay_configs")
        .select(`
          *,
          pay_group:pay_groups(id, name, code)
        `)
        .eq("id", configId)
        .single();
      if (error) throw error;
      return data as RetroactivePayConfig;
    },
    enabled: !!configId,
  });

  // Fetch calculations
  const { data: calculations, isLoading: calculationsLoading } = useQuery({
    queryKey: ["retroactive-pay-calculations", configId],
    queryFn: async () => {
      if (!configId) return [];
      const { data, error } = await supabase
        .from("retroactive_pay_calculations")
        .select(`
          *,
          pay_element:pay_elements(id, name, code)
        `)
        .eq("config_id", configId)
        .order("pay_year")
        .order("pay_cycle_number")
        .order("employee_id");
      if (error) throw error;
      return (data || []) as unknown as RetroactivePayCalculation[];
    },
    enabled: !!configId,
  });

  // Generate mutations
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!configId) throw new Error("Config ID required");
      const result = await generateCalculations(configId);
      if (!result.success) throw new Error("Failed to generate calculations");
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["retroactive-pay-calculations", configId] });
      toast.success(
        `Generated ${result.count} calculations. Total adjustment: $${result.totalAdjustment.toFixed(2)}`
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate calculations");
    },
  });

  // Get unique years for filtering
  const years = useMemo(() => {
    if (!calculations) return [];
    const uniqueYears = [...new Set(calculations.map((c) => c.pay_year))];
    return uniqueYears.sort((a, b) => b - a);
  }, [calculations]);

  // Filter and group calculations
  const groupedByEmployee = useMemo(() => {
    if (!calculations) return [];

    let filtered = calculations;

    if (filterYear !== "all") {
      filtered = filtered.filter((c) => c.pay_year === parseInt(filterYear));
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.employee_status === filterStatus);
    }

    // Group by employee
    const groups: Record<string, GroupedCalculations> = {};

    for (const calc of filtered) {
      const empId = calc.employee_id;
      if (!groups[empId]) {
        groups[empId] = {
          employeeId: empId,
          employeeName: `${calc.employee?.first_name || ""} ${calc.employee?.last_name || ""}`.trim() || "Unknown",
          employeeNumber: calc.employee?.employee_id || null,
          employeeStatus: calc.employee_status,
          calculations: [],
          totalOriginal: 0,
          totalAdjustment: 0,
        };
      }
      groups[empId].calculations.push(calc);
      groups[empId].totalOriginal += calc.original_amount;
      groups[empId].totalAdjustment += calc.adjustment_amount;
    }

    return Object.values(groups).sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }, [calculations, filterYear, filterStatus]);

  // Group employee calculations by year/cycle
  const getYearCycleGroups = (employeeCalcs: RetroactivePayCalculation[]): YearCycleGroup[] => {
    const groups: Record<string, YearCycleGroup> = {};

    for (const calc of employeeCalcs) {
      const key = `${calc.pay_year}-${calc.pay_cycle_number}`;
      if (!groups[key]) {
        const periodDates = calc.pay_period
          ? `${formatDateForDisplay(calc.pay_period.start_date, "MMM d")} - ${formatDateForDisplay(calc.pay_period.end_date, "MMM d, yyyy")}`
          : `Cycle ${calc.pay_cycle_number}`;
        groups[key] = {
          year: calc.pay_year,
          cycle: calc.pay_cycle_number,
          periodDates,
          calculations: [],
          totalOriginal: 0,
          totalAdjustment: 0,
        };
      }
      groups[key].calculations.push(calc);
      groups[key].totalOriginal += calc.original_amount;
      groups[key].totalAdjustment += calc.adjustment_amount;
    }

    return Object.values(groups).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.cycle - b.cycle;
    });
  };

  // Summary stats
  const summary = useMemo(() => {
    const totalEmployees = groupedByEmployee.length;
    const totalOriginal = groupedByEmployee.reduce((sum, g) => sum + g.totalOriginal, 0);
    const totalAdjustment = groupedByEmployee.reduce((sum, g) => sum + g.totalAdjustment, 0);
    const activeEmployees = groupedByEmployee.filter((g) => g.employeeStatus === "active").length;
    const inactiveEmployees = totalEmployees - activeEmployees;

    return { totalEmployees, totalOriginal, totalAdjustment, activeEmployees, inactiveEmployees };
  }, [groupedByEmployee]);

  const toggleEmployee = (employeeId: string) => {
    setExpandedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedEmployees(new Set(groupedByEmployee.map((g) => g.employeeId)));
  };

  const collapseAll = () => {
    setExpandedEmployees(new Set());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  const formatIncreaseDisplay = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return formatCurrency(value);
  };

  if (configLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10 text-center">Loading...</CardContent>
        </Card>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Configuration not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll/retroactive-pay")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Retroactive Pay Calculations</h1>
          <p className="text-muted-foreground">{config.config_name}</p>
        </div>
      </div>

      {/* Config Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Configuration Details</CardTitle>
              <CardDescription>
                {config.pay_group?.name} ({config.pay_group?.code})
              </CardDescription>
            </div>
            <Badge variant={config.status === "approved" ? "default" : "secondary"}>
              {config.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Period</p>
                <p className="font-medium text-sm">
                  {formatDateForDisplay(config.effective_start_date, "PP")} -{" "}
                  {formatDateForDisplay(config.effective_end_date, "PP")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Employees</p>
                <p className="font-medium text-sm">
                  {summary.totalEmployees} ({summary.activeEmployees} active, {summary.inactiveEmployees} inactive)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Original Pay</p>
                <p className="font-medium text-sm">{formatCurrency(summary.totalOriginal)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Adjustment</p>
                <p className="font-medium text-sm text-primary">{formatCurrency(summary.totalAdjustment)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Year:</span>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {config.status === "draft" && (
            <Button
              variant="outline"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generateMutation.isPending ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Calculations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employee Adjustments</CardTitle>
          <CardDescription>
            Grouped by employee showing pay year, pay cycle, original amount, and adjustment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calculationsLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading calculations...</div>
          ) : groupedByEmployee.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No calculations found</p>
              {config.status === "draft" && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Generate Calculations
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {groupedByEmployee.map((group) => (
                <Collapsible
                  key={group.employeeId}
                  open={expandedEmployees.has(group.employeeId)}
                  onOpenChange={() => toggleEmployee(group.employeeId)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {expandedEmployees.has(group.employeeId) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{group.employeeName}</span>
                            {group.employeeNumber && (
                              <span className="text-sm text-muted-foreground">
                                ({group.employeeNumber})
                              </span>
                            )}
                            {getStatusBadge(group.employeeStatus)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {group.calculations.length} calculation(s) across{" "}
                            {getYearCycleGroups(group.calculations).length} pay period(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Original</p>
                          <p className="font-mono">{formatCurrency(group.totalOriginal)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Adjustment</p>
                          <p className="font-mono text-primary font-medium">
                            {formatCurrency(group.totalAdjustment)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-7 mt-2 border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead>Pay Year</TableHead>
                            <TableHead>Pay Cycle</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Pay Element</TableHead>
                            <TableHead className="text-right">Original</TableHead>
                            <TableHead className="text-center">Increase</TableHead>
                            <TableHead className="text-right">Adjustment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getYearCycleGroups(group.calculations).map((cycleGroup) => (
                            <>
                              {cycleGroup.calculations.map((calc, idx) => (
                                <TableRow key={calc.id}>
                                  {idx === 0 && (
                                    <>
                                      <TableCell
                                        rowSpan={cycleGroup.calculations.length}
                                        className="font-medium bg-muted/10"
                                      >
                                        {cycleGroup.year}
                                      </TableCell>
                                      <TableCell
                                        rowSpan={cycleGroup.calculations.length}
                                        className="bg-muted/10"
                                      >
                                        {cycleGroup.cycle}
                                      </TableCell>
                                      <TableCell
                                        rowSpan={cycleGroup.calculations.length}
                                        className="bg-muted/10"
                                      >
                                        {cycleGroup.periodDates}
                                      </TableCell>
                                    </>
                                  )}
                                  <TableCell>
                                    <div>
                                      <p>{calc.pay_element?.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {calc.pay_element?.code}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {formatCurrency(calc.original_amount)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline">
                                      {formatIncreaseDisplay(calc.increase_type, calc.increase_value)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-primary">
                                    {formatCurrency(calc.adjustment_amount)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {/* Cycle subtotal */}
                              <TableRow className="bg-muted/20 font-medium">
                                <TableCell colSpan={4} className="text-right">
                                  Cycle {cycleGroup.cycle} Subtotal
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatCurrency(cycleGroup.totalOriginal)}
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right font-mono text-primary">
                                  {formatCurrency(cycleGroup.totalAdjustment)}
                                </TableCell>
                              </TableRow>
                            </>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={4} className="text-right font-bold">
                              Employee Total
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold">
                              {formatCurrency(group.totalOriginal)}
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right font-mono font-bold text-primary">
                              {formatCurrency(group.totalAdjustment)}
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}

              {/* Grand Total */}
              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg mt-4">
                <span className="font-bold text-lg">Grand Total</span>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Original Pay</p>
                    <p className="font-mono text-lg">{formatCurrency(summary.totalOriginal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Adjustment</p>
                    <p className="font-mono text-lg font-bold text-primary">
                      {formatCurrency(summary.totalAdjustment)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
