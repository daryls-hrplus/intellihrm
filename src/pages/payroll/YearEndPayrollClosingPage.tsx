import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  FileText, 
  RotateCcw, 
  CalendarPlus, 
  Lock, 
  Play,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface PayGroup {
  id: string;
  name: string;
  code: string;
  pay_frequency: string;
}

interface YearEndClosing {
  id: string;
  company_id: string;
  pay_group_id: string;
  closing_year: number;
  new_year: number;
  status: string;
  ytd_report_generated: boolean;
  ytd_report_generated_at: string | null;
  statutory_report_generated: boolean;
  statutory_report_generated_at: string | null;
  tax_summary_report_generated: boolean;
  tax_summary_report_generated_at: string | null;
  employee_annual_report_generated: boolean;
  employee_annual_report_generated_at: string | null;
  ytd_reset_completed: boolean;
  ytd_reset_completed_at: string | null;
  new_periods_generated: boolean;
  new_periods_generated_at: string | null;
  new_periods_count: number;
  first_new_period_start: string | null;
  closed_at: string | null;
  notes: string | null;
  created_at: string;
  pay_groups?: { name: string; code: string; pay_frequency: string };
}

interface FiscalYearConfig {
  fiscal_year_start_month: number;
  fiscal_year_start_day: number;
}

export default function YearEndPayrollClosingPage() {
  const { selectedCompanyId } = usePayrollFilters();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);
  const [closings, setClosings] = useState<YearEndClosing[]>([]);
  const [fiscalConfig, setFiscalConfig] = useState<FiscalYearConfig | null>(null);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPayGroupId, setSelectedPayGroupId] = useState<string>("");
  const [closingYear, setClosingYear] = useState<number>(new Date().getFullYear());
  const [notes, setNotes] = useState("");
  
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedClosing, setSelectedClosing] = useState<YearEndClosing | null>(null);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    if (selectedCompanyId) {
      loadData();
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    if (!selectedCompanyId) return;
    setIsLoading(true);
    
    try {
      // Fetch pay groups
      const { data: payGroupData } = await supabase
        .from("pay_groups")
        .select("id, name, code, pay_frequency")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      
      setPayGroups(payGroupData || []);
      
      // Fetch existing closings
      const { data: closingData } = await supabase
        .from("payroll_year_end_closings")
        .select(`
          *,
          pay_groups(name, code, pay_frequency)
        `)
        .eq("company_id", selectedCompanyId)
        .order("closing_year", { ascending: false });
      
      setClosings(closingData || []);
      
      // Fetch fiscal year config
      const { data: company } = await supabase
        .from("companies")
        .select("country")
        .eq("id", selectedCompanyId)
        .single();
      
      if (company?.country) {
        const { data: fiscalData } = await supabase
          .from("country_fiscal_years")
          .select("fiscal_year_start_month, fiscal_year_start_day")
          .eq("country_code", company.country)
          .eq("is_active", true)
          .single();
        
        setFiscalConfig(fiscalData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingClosing = async (payGroupId: string, year: number): Promise<boolean> => {
    const { data } = await supabase
      .from("payroll_year_end_closings")
      .select("id")
      .eq("pay_group_id", payGroupId)
      .eq("closing_year", year)
      .single();
    
    return !!data;
  };

  const handleCreateClosing = async () => {
    if (!selectedCompanyId || !selectedPayGroupId) return;
    
    // Check for duplicate
    const exists = await checkExistingClosing(selectedPayGroupId, closingYear);
    if (exists) {
      toast.error("A year-end closing already exists for this pay group and year");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("payroll_year_end_closings")
        .insert({
          company_id: selectedCompanyId,
          pay_group_id: selectedPayGroupId,
          closing_year: closingYear,
          new_year: closingYear + 1,
          status: "reports_pending",
          notes,
          created_by: user?.id,
        });
      
      if (error) throw error;
      
      toast.success("Year-end closing initiated. Please generate all required reports.");
      setCreateDialogOpen(false);
      setSelectedPayGroupId("");
      setNotes("");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create year-end closing");
    } finally {
      setIsLoading(false);
    }
  };

  const markReportGenerated = async (closingId: string, reportType: string) => {
    const updateData: Record<string, any> = {
      [`${reportType}_generated`]: true,
      [`${reportType}_generated_at`]: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from("payroll_year_end_closings")
      .update(updateData)
      .eq("id", closingId);
    
    if (error) {
      toast.error(`Failed to update ${reportType} status`);
      return;
    }
    
    toast.success(`${reportType.replace(/_/g, " ")} report marked as generated`);
    
    // Check if all reports are complete
    const { data } = await supabase
      .from("payroll_year_end_closings")
      .select("*")
      .eq("id", closingId)
      .single();
    
    if (data && 
        data.ytd_report_generated && 
        data.statutory_report_generated && 
        data.tax_summary_report_generated && 
        data.employee_annual_report_generated) {
      await supabase
        .from("payroll_year_end_closings")
        .update({ status: "reports_complete" })
        .eq("id", closingId);
    }
    
    loadData();
  };

  const executeYearEndClose = async () => {
    if (!selectedClosing || !confirmClose) return;
    
    setProcessingStep("Validating reports...");
    
    // Verify all reports are generated
    if (!selectedClosing.ytd_report_generated || 
        !selectedClosing.statutory_report_generated ||
        !selectedClosing.tax_summary_report_generated ||
        !selectedClosing.employee_annual_report_generated) {
      toast.error("All year-end reports must be generated before closing");
      return;
    }
    
    try {
      // Step 1: Update status to closing
      await supabase
        .from("payroll_year_end_closings")
        .update({ status: "closing" })
        .eq("id", selectedClosing.id);
      
      setProcessingStep("Resetting YTD amounts...");
      
      // Step 2: Reset YTD amounts (mark as complete - actual reset happens via payroll processing)
      await supabase
        .from("payroll_year_end_closings")
        .update({ 
          ytd_reset_completed: true,
          ytd_reset_completed_at: new Date().toISOString(),
        })
        .eq("id", selectedClosing.id);
      
      setProcessingStep("Generating new pay periods...");
      
      // Step 3: Generate new pay periods using database function
      const { data: periodResult, error: periodError } = await supabase
        .rpc("generate_new_year_pay_periods", {
          p_pay_group_id: selectedClosing.pay_group_id,
          p_new_year: selectedClosing.new_year,
          p_created_by: user?.id,
        });
      
      if (periodError) {
        console.error("Period generation error:", periodError);
        throw new Error("Failed to generate new pay periods");
      }
      
      const periodsCreated = periodResult?.[0]?.periods_created || 0;
      const firstPeriodStart = periodResult?.[0]?.first_period_start;
      
      setProcessingStep("Finalizing...");
      
      // Step 4: Update closing record with completion data
      await supabase
        .from("payroll_year_end_closings")
        .update({
          status: "closed",
          new_periods_generated: true,
          new_periods_generated_at: new Date().toISOString(),
          new_periods_count: periodsCreated,
          first_new_period_start: firstPeriodStart,
          closed_at: new Date().toISOString(),
          closed_by: user?.id,
        })
        .eq("id", selectedClosing.id);
      
      toast.success(`Year-end closing complete! Generated ${periodsCreated} pay periods for ${selectedClosing.new_year}`);
      setProcessDialogOpen(false);
      setSelectedClosing(null);
      setConfirmClose(false);
      setProcessingStep("");
      loadData();
    } catch (error: any) {
      // Mark as failed
      await supabase
        .from("payroll_year_end_closings")
        .update({ status: "failed" })
        .eq("id", selectedClosing.id);
      
      toast.error(error.message || "Year-end closing failed");
      setProcessingStep("");
      loadData();
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: string; icon: any }> = {
      pending: { label: "Pending", variant: "bg-muted text-muted-foreground", icon: Clock },
      reports_pending: { label: "Reports Pending", variant: "bg-warning/10 text-warning", icon: FileText },
      reports_complete: { label: "Ready to Close", variant: "bg-primary/10 text-primary", icon: CheckCircle2 },
      closing: { label: "Closing...", variant: "bg-primary/10 text-primary", icon: RefreshCw },
      closed: { label: "Closed", variant: "bg-success/10 text-success", icon: Lock },
      failed: { label: "Failed", variant: "bg-destructive/10 text-destructive", icon: XCircle },
    };
    
    const { label, variant, icon: Icon } = config[status] || config.pending;
    
    return (
      <Badge className={`${variant} gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getReportCheckProgress = (closing: YearEndClosing) => {
    const reports = [
      closing.ytd_report_generated,
      closing.statutory_report_generated,
      closing.tax_summary_report_generated,
      closing.employee_annual_report_generated,
    ];
    const completed = reports.filter(Boolean).length;
    return (completed / reports.length) * 100;
  };

  const openProcessDialog = (closing: YearEndClosing) => {
    setSelectedClosing(closing);
    setProcessDialogOpen(true);
    setConfirmClose(false);
  };

  const getFiscalYearLabel = () => {
    if (!fiscalConfig) return `January 1 - December 31`;
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    const startMonth = months[fiscalConfig.fiscal_year_start_month - 1];
    return `${startMonth} ${fiscalConfig.fiscal_year_start_day} - following year`;
  };

  if (!selectedCompanyId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please select a company to continue</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Payroll", href: "/payroll" },
            { label: "Year End Payroll Closing" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Year End Payroll Closing</h1>
              <p className="text-muted-foreground">
                Roll pay groups into the new fiscal year ({getFiscalYearLabel()})
              </p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Initiate Year End Closing
          </Button>
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Year-end closing resets YTD amounts and generates new pay periods starting at cycle 1.
            All required reports must be generated before closing can proceed. This process cannot be duplicated.
          </AlertDescription>
        </Alert>

        {/* Closings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Year End Closings</CardTitle>
            <CardDescription>Track and manage year-end closing process for each pay group</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pay Group</TableHead>
                  <TableHead>Closing Year</TableHead>
                  <TableHead>New Year</TableHead>
                  <TableHead>Report Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>New Periods</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {closings.map((closing) => (
                  <TableRow key={closing.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{closing.pay_groups?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {closing.pay_groups?.code} • {closing.pay_groups?.pay_frequency}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{closing.closing_year}</TableCell>
                    <TableCell className="font-medium">{closing.new_year}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={getReportCheckProgress(closing)} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {[
                            closing.ytd_report_generated,
                            closing.statutory_report_generated,
                            closing.tax_summary_report_generated,
                            closing.employee_annual_report_generated,
                          ].filter(Boolean).length} of 4 reports
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(closing.status)}</TableCell>
                    <TableCell>
                      {closing.new_periods_generated ? (
                        <div className="text-sm">
                          <p className="font-medium text-success">{closing.new_periods_count} periods</p>
                          {closing.first_new_period_start && (
                            <p className="text-xs text-muted-foreground">
                              Starting {format(new Date(closing.first_new_period_start), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {closing.status !== "closed" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openProcessDialog(closing)}
                          >
                            {closing.status === "reports_complete" ? (
                              <>
                                <Play className="h-3 w-3 mr-1" />
                                Close Year
                              </>
                            ) : (
                              <>
                                <FileText className="h-3 w-3 mr-1" />
                                Manage
                              </>
                            )}
                          </Button>
                        )}
                        {closing.status === "closed" && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {closings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No year-end closings found. Click "Initiate Year End Closing" to start.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Initiate Year End Closing</DialogTitle>
              <DialogDescription>
                Select a pay group and year to begin the year-end closing process.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pay Group</Label>
                <Select value={selectedPayGroupId} onValueChange={setSelectedPayGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay group" />
                  </SelectTrigger>
                  <SelectContent>
                    {payGroups.map((pg) => (
                      <SelectItem key={pg.id} value={pg.id}>
                        {pg.name} ({pg.pay_frequency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Closing Year</Label>
                <Select value={closingYear.toString()} onValueChange={(v) => setClosingYear(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Will roll into year {closingYear + 1}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this closing..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateClosing} disabled={isLoading || !selectedPayGroupId}>
                Initiate Closing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Process Dialog */}
        <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Year End Closing: {selectedClosing?.pay_groups?.name} ({selectedClosing?.closing_year})
              </DialogTitle>
              <DialogDescription>
                Complete all required reports before executing the year-end close.
              </DialogDescription>
            </DialogHeader>
            
            {selectedClosing && (
              <div className="space-y-4">
                {/* Report Checklist */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Required Reports</h4>
                  
                  <div className="space-y-2">
                    {[
                      { key: "ytd_report", label: "YTD Summary Report", generated: selectedClosing.ytd_report_generated, at: selectedClosing.ytd_report_generated_at },
                      { key: "statutory_report", label: "Statutory Deductions Report", generated: selectedClosing.statutory_report_generated, at: selectedClosing.statutory_report_generated_at },
                      { key: "tax_summary_report", label: "Tax Summary Report", generated: selectedClosing.tax_summary_report_generated, at: selectedClosing.tax_summary_report_generated_at },
                      { key: "employee_annual_report", label: "Employee Annual Statements", generated: selectedClosing.employee_annual_report_generated, at: selectedClosing.employee_annual_report_generated_at },
                    ].map((report) => (
                      <div key={report.key} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {report.generated ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{report.label}</p>
                            {report.at && (
                              <p className="text-xs text-muted-foreground">
                                Generated {format(new Date(report.at), "MMM d, yyyy h:mm a")}
                              </p>
                            )}
                          </div>
                        </div>
                        {!report.generated && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markReportGenerated(selectedClosing.id, report.key)}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Close Actions */}
                {selectedClosing.status === "reports_complete" && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium text-sm">Execute Year End Close</h4>
                    
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>This action cannot be undone</AlertTitle>
                      <AlertDescription>
                        Closing will reset all YTD amounts to zero and generate {
                          selectedClosing.pay_groups?.pay_frequency === "weekly" ? "52" :
                          selectedClosing.pay_groups?.pay_frequency === "bi_weekly" ? "26" :
                          selectedClosing.pay_groups?.pay_frequency === "semi_monthly" ? "24" : "12"
                        } new pay periods for {selectedClosing.new_year}.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex items-start gap-2">
                      <Checkbox 
                        id="confirm-close" 
                        checked={confirmClose}
                        onCheckedChange={(checked) => setConfirmClose(checked as boolean)}
                      />
                      <Label htmlFor="confirm-close" className="text-sm leading-tight">
                        I confirm all year-end reports have been reviewed and saved. I understand this will reset YTD amounts and generate new pay periods.
                      </Label>
                    </div>
                    
                    {processingStep && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        {processingStep}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>
                Close
              </Button>
              {selectedClosing?.status === "reports_complete" && (
                <Button 
                  onClick={executeYearEndClose}
                  disabled={!confirmClose || !!processingStep}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Execute Year End Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}