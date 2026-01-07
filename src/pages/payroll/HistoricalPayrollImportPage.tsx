import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, 
  XCircle, Clock, Play, History, Trash2, Eye, FileText,
  Calendar, Users, DollarSign, AlertTriangle, Building2, Globe
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCountryStatutories, usePayGroups } from "@/hooks/useCountryStatutories";
import { usePageAudit } from "@/hooks/usePageAudit";

interface Company {
  id: string;
  name: string;
}

interface PayGroup {
  id: string;
  name: string;
  code: string;
}

interface HistoricalImport {
  id: string;
  file_name: string;
  import_type: string;
  period_start_date: string | null;
  period_end_date: string | null;
  total_records: number;
  total_runs_created: number;
  total_entries_created: number;
  failed_records: number;
  errors: any[];
  warnings: any[];
  status: string;
  imported_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: { row: number; field: string; message: string }[];
  warnings: { row: number; field: string; message: string }[];
  summary: {
    totalRows: number;
    uniqueEmployees: number;
    uniquePeriods: number;
    dateRange: { start: string; end: string } | null;
  };
}

interface ParsedPayrollRow {
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  gross_pay: number;
  net_pay: number;
  basic_salary: number;
  overtime_pay: number;
  allowances: number;
  deductions: number;
  income_tax: number;
  nis_employee: number;
  nis_employer: number;
  nht_employee: number;
  nht_employer: number;
  education_tax: number;
  employer_education_tax: number;
  heart: number;
  other_earnings: Record<string, number>;
  other_deductions: Record<string, number>;
}

const HistoricalPayrollImportPage: React.FC = () => {
  usePageAudit('historical_payroll_import', 'Payroll');
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedPayGroupId, setSelectedPayGroupId] = useState<string>("");
  const [imports, setImports] = useState<HistoricalImport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Country-specific statutory hook
  const { company: selectedCompany, statutoryTypes, isLoading: loadingStatutories } = useCountryStatutories(selectedCompanyId || null);
  const { payGroups, isLoading: loadingPayGroups } = usePayGroups(selectedCompanyId || null);
  
  // Import wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>("full");
  const [parsedData, setParsedData] = useState<ParsedPayrollRow[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  // View details state
  const [selectedImport, setSelectedImport] = useState<HistoricalImport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId && selectedPayGroupId) {
      loadImports();
    }
  }, [selectedCompanyId, selectedPayGroupId]);

  // Reset pay group when company changes
  useEffect(() => {
    setSelectedPayGroupId("");
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const { data, error } = await (supabase as any)
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    
    if (!error && data) {
      setCompanies(data);
      if (data.length === 1) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const loadImports = async () => {
    if (!selectedCompanyId || !selectedPayGroupId) return;
    setIsLoading(true);
    
    const { data, error } = await (supabase as any)
      .from("historical_payroll_imports")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setImports(data);
    }
    setIsLoading(false);
  };

  const downloadTemplate = () => {
    const headers = [
      "employee_id",
      "pay_period_start",
      "pay_period_end",
      "pay_date",
      "basic_salary",
      "overtime_pay",
      "allowances",
      "deductions",
      "gross_pay",
      "net_pay",
      "income_tax",
      "nis_employee",
      "nis_employer",
      "nht_employee",
      "nht_employer",
      "education_tax",
      "employer_education_tax",
      "heart",
      "notes"
    ];
    
    const sampleRow = [
      "EMP001",
      "2024-01-01",
      "2024-01-15",
      "2024-01-20",
      "100000.00",
      "5000.00",
      "10000.00",
      "2000.00",
      "115000.00",
      "85000.00",
      "20000.00",
      "3000.00",
      "3000.00",
      "2000.00",
      "3000.00",
      "2500.00",
      "3500.00",
      "3000.00",
      "Imported from previous system"
    ];
    
    const csv = [headers.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historical_payroll_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedPayrollRow[] => {
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    
    const rows: ParsedPayrollRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });
      
      rows.push({
        employee_id: row.employee_id || "",
        pay_period_start: row.pay_period_start || "",
        pay_period_end: row.pay_period_end || "",
        pay_date: row.pay_date || "",
        gross_pay: parseFloat(row.gross_pay) || 0,
        net_pay: parseFloat(row.net_pay) || 0,
        basic_salary: parseFloat(row.basic_salary) || 0,
        overtime_pay: parseFloat(row.overtime_pay) || 0,
        allowances: parseFloat(row.allowances) || 0,
        deductions: parseFloat(row.deductions) || 0,
        income_tax: parseFloat(row.income_tax) || 0,
        nis_employee: parseFloat(row.nis_employee) || 0,
        nis_employer: parseFloat(row.nis_employer) || 0,
        nht_employee: parseFloat(row.nht_employee) || 0,
        nht_employer: parseFloat(row.nht_employer) || 0,
        education_tax: parseFloat(row.education_tax) || 0,
        employer_education_tax: parseFloat(row.employer_education_tax) || 0,
        heart: parseFloat(row.heart) || 0,
        other_earnings: {},
        other_deductions: {}
      });
    }
    
    return rows;
  };

  const validateData = async (data: ParsedPayrollRow[]): Promise<ValidationResult> => {
    const errors: { row: number; field: string; message: string }[] = [];
    const warnings: { row: number; field: string; message: string }[] = [];
    
    // Get employee IDs from database
    const { data: employees } = await (supabase as any)
      .from("profiles")
      .select("id, employee_id")
      .eq("company_id", selectedCompanyId);
    
    const employeeMap = new Map(employees?.map((e: any) => [e.employee_id, e.id]) || []);
    const uniqueEmployees = new Set<string>();
    const uniquePeriods = new Set<string>();
    let minDate: Date | null = null;
    let maxDate: Date | null = null;
    
    data.forEach((row, idx) => {
      const rowNum = idx + 2; // 1-indexed + header
      
      // Required field validation
      if (!row.employee_id) {
        errors.push({ row: rowNum, field: "employee_id", message: "Employee ID is required" });
      } else if (!employeeMap.has(row.employee_id)) {
        errors.push({ row: rowNum, field: "employee_id", message: `Employee ${row.employee_id} not found` });
      } else {
        uniqueEmployees.add(row.employee_id);
      }
      
      if (!row.pay_period_start) {
        errors.push({ row: rowNum, field: "pay_period_start", message: "Period start date is required" });
      }
      if (!row.pay_period_end) {
        errors.push({ row: rowNum, field: "pay_period_end", message: "Period end date is required" });
      }
      
      // Date validation
      if (row.pay_period_start && row.pay_period_end) {
        const start = parseISO(row.pay_period_start);
        const end = parseISO(row.pay_period_end);
        
        if (isNaN(start.getTime())) {
          errors.push({ row: rowNum, field: "pay_period_start", message: "Invalid date format" });
        } else {
          if (!minDate || start < minDate) minDate = start;
          if (!maxDate || start > maxDate) maxDate = start;
        }
        
        if (isNaN(end.getTime())) {
          errors.push({ row: rowNum, field: "pay_period_end", message: "Invalid date format" });
        }
        
        if (start > end) {
          errors.push({ row: rowNum, field: "pay_period_end", message: "End date before start date" });
        }
        
        uniquePeriods.add(`${row.pay_period_start}_${row.pay_period_end}`);
      }
      
      // Amount validation
      if (row.gross_pay < 0) {
        warnings.push({ row: rowNum, field: "gross_pay", message: "Negative gross pay" });
      }
      if (row.net_pay < 0) {
        warnings.push({ row: rowNum, field: "net_pay", message: "Negative net pay" });
      }
      if (row.net_pay > row.gross_pay) {
        warnings.push({ row: rowNum, field: "net_pay", message: "Net pay exceeds gross pay" });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalRows: data.length,
        uniqueEmployees: uniqueEmployees.size,
        uniquePeriods: uniquePeriods.size,
        dateRange: minDate && maxDate ? {
          start: format(minDate, "yyyy-MM-dd"),
          end: format(maxDate, "yyyy-MM-dd")
        } : null
      }
    };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    setIsValidating(true);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      setParsedData(data);
      
      const result = await validateData(data);
      setValidation(result);
      setWizardStep(2);
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to parse CSV file");
    }
    
    setIsValidating(false);
  };

  const handleImport = async () => {
    if (!validation?.isValid || parsedData.length === 0) {
      toast.error("Please fix validation errors before importing");
      return;
    }
    
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      // Create import record
      const { data: importRecord, error: importError } = await (supabase as any)
        .from("historical_payroll_imports")
        .insert({
          company_id: selectedCompanyId,
          file_name: importFile?.name || "import.csv",
          import_type: importType,
          period_start_date: validation.summary.dateRange?.start,
          period_end_date: validation.summary.dateRange?.end,
          total_records: parsedData.length,
          status: "processing",
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (importError) throw importError;
      
      // Get employee mapping
      const { data: employees } = await (supabase as any)
        .from("profiles")
        .select("id, employee_id")
        .eq("company_id", selectedCompanyId);
      
      const employeeMap = new Map(employees?.map((e: any) => [e.employee_id, e.id]) || []);
      
      // Group data by pay period
      const periodGroups = new Map<string, ParsedPayrollRow[]>();
      parsedData.forEach(row => {
        const key = `${row.pay_period_start}_${row.pay_period_end}`;
        if (!periodGroups.has(key)) {
          periodGroups.set(key, []);
        }
        periodGroups.get(key)!.push(row);
      });
      
      let runsCreated = 0;
      let entriesCreated = 0;
      let failedRecords = 0;
      const errors: any[] = [];
      
      const totalPeriods = periodGroups.size;
      let processedPeriods = 0;
      
      for (const [periodKey, rows] of periodGroups) {
        const [startDate, endDate] = periodKey.split("_");
        const payDate = rows[0].pay_date || endDate;
        
        // Create payroll run
        const { data: run, error: runError } = await (supabase as any)
          .from("payroll_runs")
          .insert({
            company_id: selectedCompanyId,
            pay_group_id: selectedPayGroupId || null,
            period_start_date: startDate,
            period_end_date: endDate,
            pay_date: payDate,
            status: "completed",
            is_historical: true,
            historical_import_id: importRecord.id,
            original_run_date: payDate,
            total_gross: rows.reduce((sum, r) => sum + r.gross_pay, 0),
            total_net: rows.reduce((sum, r) => sum + r.net_pay, 0),
            total_deductions: rows.reduce((sum, r) => sum + r.deductions + r.income_tax + r.nis_employee + r.nht_employee + r.education_tax, 0),
            total_taxes: rows.reduce((sum, r) => sum + r.income_tax, 0),
            employee_count: rows.length
          })
          .select()
          .single();
        
        if (runError) {
          errors.push({ period: periodKey, error: runError.message });
          failedRecords += rows.length;
          continue;
        }
        
        runsCreated++;
        
        // Create payroll entries for each employee
        for (const row of rows) {
          const employeeUUID = employeeMap.get(row.employee_id);
          if (!employeeUUID) {
            failedRecords++;
            continue;
          }
          
          const { error: entryError } = await (supabase as any)
            .from("payroll_entries")
            .insert({
              payroll_run_id: run.id,
              employee_id: employeeUUID,
              basic_salary: row.basic_salary,
              overtime_pay: row.overtime_pay,
              allowances: row.allowances,
              deductions: row.deductions,
              gross_pay: row.gross_pay,
              net_pay: row.net_pay,
              tax_amount: row.income_tax,
              nis_employee: row.nis_employee,
              nis_employer: row.nis_employer,
              nht_employee: row.nht_employee,
              nht_employer: row.nht_employer,
              education_tax: row.education_tax,
              employer_education_tax: row.employer_education_tax,
              heart_contribution: row.heart,
              status: "completed"
            });
          
          if (entryError) {
            errors.push({ employee: row.employee_id, period: periodKey, error: entryError.message });
            failedRecords++;
          } else {
            entriesCreated++;
          }
        }
        
        processedPeriods++;
        setImportProgress(Math.round((processedPeriods / totalPeriods) * 100));
      }
      
      // Update import record
      await (supabase as any)
        .from("historical_payroll_imports")
        .update({
          total_runs_created: runsCreated,
          total_entries_created: entriesCreated,
          failed_records: failedRecords,
          errors: errors,
          status: failedRecords === parsedData.length ? "failed" : "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", importRecord.id);
      
      if (failedRecords > 0) {
        toast.warning(`Import completed with ${failedRecords} failed records. ${entriesCreated} entries created across ${runsCreated} payroll runs.`);
      } else {
        toast.success(`Successfully imported ${entriesCreated} payroll entries across ${runsCreated} payroll runs.`);
      }
      
      resetWizard();
      loadImports();
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(`Import failed: ${error.message}`);
    }
    
    setIsImporting(false);
  };

  const resetWizard = () => {
    setShowWizard(false);
    setWizardStep(1);
    setImportFile(null);
    setParsedData([]);
    setValidation(null);
    setImportProgress(0);
  };

  const handleDeleteImport = async (id: string) => {
    if (!confirm("This will delete the import record and all associated historical payroll runs. Continue?")) return;
    
    // First delete associated payroll runs
    await (supabase as any)
      .from("payroll_runs")
      .delete()
      .eq("historical_import_id", id);
    
    // Then delete the import record
    const { error } = await (supabase as any)
      .from("historical_payroll_imports")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete import");
      return;
    }
    
    toast.success("Import and associated data deleted");
    loadImports();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-JM", {
      style: "currency",
      currency: "JMD",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600",
      processing: "bg-blue-500/10 text-blue-600",
      completed: "bg-green-500/10 text-green-600",
      failed: "bg-red-500/10 text-red-600"
    };
    return <Badge className={styles[status] || ""}>{status}</Badge>;
  };

  const breadcrumbItems = [
    { label: t("nav.payroll"), href: "/payroll" },
    { label: "Opening Balances", href: "/payroll/opening-balances" },
    { label: "Historical Import" }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Historical Payroll Import</h1>
            <p className="text-muted-foreground">
              Import complete historical payroll runs from previous systems
            </p>
          </div>
          <Button onClick={() => setShowWizard(true)} disabled={!selectedCompanyId || !selectedPayGroupId}>
            <Upload className="w-4 h-4 mr-2" />
            Import Historical Data
          </Button>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Company *</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
                    <Building2 className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pay Group *</Label>
                <Select 
                  value={selectedPayGroupId} 
                  onValueChange={setSelectedPayGroupId}
                  disabled={!selectedCompanyId || loadingPayGroups}
                >
                  <SelectTrigger>
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={loadingPayGroups ? "Loading..." : "Select pay group"} />
                  </SelectTrigger>
                  <SelectContent>
                    {payGroups.map(pg => (
                      <SelectItem key={pg.id} value={pg.id}>
                        {pg.name} ({pg.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCompany && (
                <div className="flex items-end">
                  <Badge variant="outline" className="gap-1">
                    <Globe className="w-3 h-3" />
                    {selectedCompany.country} - {statutoryTypes.length} statutory types
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Import History
            </CardTitle>
            <CardDescription>
              Previous historical payroll imports for this company
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : imports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No historical imports yet</p>
                <p className="text-sm">Import payroll history to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Period Range</TableHead>
                    <TableHead>Runs Created</TableHead>
                    <TableHead>Entries</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imports.map((imp) => (
                    <TableRow key={imp.id}>
                      <TableCell className="font-medium">{imp.file_name}</TableCell>
                      <TableCell>
                        {imp.period_start_date && imp.period_end_date ? (
                          <span className="text-sm">
                            {format(parseISO(imp.period_start_date), "MMM yyyy")} - {format(parseISO(imp.period_end_date), "MMM yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{imp.total_runs_created}</TableCell>
                      <TableCell>
                        <span className="text-green-600">{imp.total_entries_created}</span>
                        {imp.failed_records > 0 && (
                          <span className="text-red-600"> / {imp.failed_records} failed</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(imp.status)}</TableCell>
                      <TableCell>{format(parseISO(imp.created_at), "MMM d, yyyy HH:mm")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => { setSelectedImport(imp); setShowDetails(true); }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleDeleteImport(imp.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Import Wizard Dialog */}
        <Dialog open={showWizard} onOpenChange={(open) => { if (!open) resetWizard(); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import Historical Payroll</DialogTitle>
              <DialogDescription>
                Step {wizardStep} of 3: {wizardStep === 1 ? "Upload File" : wizardStep === 2 ? "Validate Data" : "Confirm Import"}
              </DialogDescription>
            </DialogHeader>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    wizardStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {wizardStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-24 h-1 mx-2 ${wizardStep > step ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Step 1: Upload */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Import Type</Label>
                    <Select value={importType} onValueChange={setImportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Payroll Data</SelectItem>
                        <SelectItem value="earnings_only">Earnings Only</SelectItem>
                        <SelectItem value="statutory_only">Statutory Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pay Group (Optional)</Label>
                    <Select value={selectedPayGroupId} onValueChange={setSelectedPayGroupId}>
                      <SelectTrigger>
                        <SelectValue placeholder="All pay groups" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All pay groups</SelectItem>
                        {payGroups.map(pg => (
                          <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {isValidating ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
                      <p>Validating data...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        Upload a CSV file with historical payroll data
                      </p>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Select File
                      </Button>
                    </>
                  )}
                </div>
                
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription className="flex justify-between items-center">
                    <span>Need the template? Download and fill it with your historical data.</span>
                    <Button size="sm" variant="link" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-1" />
                      Download Template
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {/* Step 2: Validation */}
            {wizardStep === 2 && validation && (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{validation.summary.totalRows}</p>
                          <p className="text-xs text-muted-foreground">Total Records</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{validation.summary.uniqueEmployees}</p>
                          <p className="text-xs text-muted-foreground">Employees</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-2xl font-bold">{validation.summary.uniquePeriods}</p>
                          <p className="text-xs text-muted-foreground">Pay Periods</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        {validation.isValid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="text-2xl font-bold">{validation.errors.length}</p>
                          <p className="text-xs text-muted-foreground">Errors</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {validation.summary.dateRange && (
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertTitle>Date Range</AlertTitle>
                    <AlertDescription>
                      Data spans from {format(parseISO(validation.summary.dateRange.start), "MMMM yyyy")} to {format(parseISO(validation.summary.dateRange.end), "MMMM yyyy")}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Errors */}
                {validation.errors.length > 0 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="errors">
                      <AccordionTrigger className="text-red-600">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          {validation.errors.length} Error(s) - Must fix before importing
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ScrollArea className="h-48">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Row</TableHead>
                                <TableHead>Field</TableHead>
                                <TableHead>Error</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {validation.errors.slice(0, 50).map((err, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{err.row}</TableCell>
                                  <TableCell>{err.field}</TableCell>
                                  <TableCell>{err.message}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {validation.errors.length > 50 && (
                            <p className="text-sm text-muted-foreground p-2">
                              ...and {validation.errors.length - 50} more errors
                            </p>
                          )}
                        </ScrollArea>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                
                {/* Warnings */}
                {validation.warnings.length > 0 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="warnings">
                      <AccordionTrigger className="text-yellow-600">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {validation.warnings.length} Warning(s) - Review recommended
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ScrollArea className="h-32">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Row</TableHead>
                                <TableHead>Field</TableHead>
                                <TableHead>Warning</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {validation.warnings.slice(0, 20).map((warn, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{warn.row}</TableCell>
                                  <TableCell>{warn.field}</TableCell>
                                  <TableCell>{warn.message}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                
                {validation.isValid && (
                  <Alert className="border-green-500 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle>Validation Passed</AlertTitle>
                    <AlertDescription>
                      All records are valid and ready for import.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            
            {/* Step 3: Confirm & Import */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                {isImporting ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Importing payroll data...</p>
                    <Progress value={importProgress} className="w-64 mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">{importProgress}% complete</p>
                  </div>
                ) : (
                  <>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Ready to Import</AlertTitle>
                      <AlertDescription>
                        This will create {validation?.summary.uniquePeriods} historical payroll runs with {validation?.summary.totalRows} employee entries.
                        These will be marked as historical imports and won't affect current payroll processing.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-medium mb-2">Import Summary</h4>
                      <ul className="text-sm space-y-1">
                        <li>• File: {importFile?.name}</li>
                        <li>• Total Records: {validation?.summary.totalRows}</li>
                        <li>• Employees: {validation?.summary.uniqueEmployees}</li>
                        <li>• Pay Periods: {validation?.summary.uniquePeriods}</li>
                        {validation?.summary.dateRange && (
                          <li>• Date Range: {validation.summary.dateRange.start} to {validation.summary.dateRange.end}</li>
                        )}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <DialogFooter>
              {wizardStep > 1 && !isImporting && (
                <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)}>
                  Back
                </Button>
              )}
              {wizardStep === 2 && (
                <Button 
                  onClick={() => setWizardStep(3)} 
                  disabled={!validation?.isValid}
                >
                  Continue
                </Button>
              )}
              {wizardStep === 3 && !isImporting && (
                <Button onClick={handleImport}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Import
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Import Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Details</DialogTitle>
            </DialogHeader>
            {selectedImport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">File Name</p>
                    <p className="font-medium">{selectedImport.file_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    {getStatusBadge(selectedImport.status)}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period Range</p>
                    <p className="font-medium">
                      {selectedImport.period_start_date && selectedImport.period_end_date
                        ? `${format(parseISO(selectedImport.period_start_date), "MMM yyyy")} - ${format(parseISO(selectedImport.period_end_date), "MMM yyyy")}`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Imported At</p>
                    <p className="font-medium">{format(parseISO(selectedImport.created_at), "MMM d, yyyy HH:mm")}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedImport.total_runs_created}</p>
                      <p className="text-xs text-muted-foreground">Payroll Runs Created</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedImport.total_entries_created}</p>
                      <p className="text-xs text-muted-foreground">Entries Created</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{selectedImport.failed_records}</p>
                      <p className="text-xs text-muted-foreground">Failed Records</p>
                    </CardContent>
                  </Card>
                </div>
                
                {selectedImport.errors && (selectedImport.errors as any[]).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Errors</h4>
                    <ScrollArea className="h-32 border rounded p-2">
                      {(selectedImport.errors as any[]).map((err, idx) => (
                        <p key={idx} className="text-sm">{JSON.stringify(err)}</p>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default HistoricalPayrollImportPage;
