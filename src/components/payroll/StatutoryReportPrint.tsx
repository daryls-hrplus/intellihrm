import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useUserPermissionContext } from "@/hooks/useUserPermissionContext";
import { Printer, Loader2, FileText, Download, Eye } from "lucide-react";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
}

interface PayGroup {
  id: string;
  name: string;
  company_id: string;
}

interface PayPeriod {
  id: string;
  period_number: string;
  period_start: string;
  period_end: string;
  year: number | null;
}

interface StatutoryReportingDocument {
  id: string;
  document_name: string;
  reporting_interval: string;
  ai_analysis: any;
  required_data_structures: any;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statutoryTypeId: string;
  statutoryName: string;
  statutoryCode: string;
  countryCode: string;
}

export function StatutoryReportPrint({
  open,
  onOpenChange,
  statutoryTypeId,
  statutoryName,
  statutoryCode,
  countryCode,
}: Props) {
  const permissions = useUserPermissionContext();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [reportDocuments, setReportDocuments] = useState<StatutoryReportingDocument[]>([]);
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedPayGroupId, setSelectedPayGroupId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedPayPeriodId, setSelectedPayPeriodId] = useState<string>("");
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportPreview, setReportPreview] = useState<any>(null);

  // Generate year options (current year and past 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (open) {
      loadCompanies();
      loadReportDocuments();
    }
  }, [open, statutoryTypeId]);

  useEffect(() => {
    if (selectedCompanyId) {
      loadPayGroups();
      loadPayPeriods();
    } else {
      setPayGroups([]);
      setPayPeriods([]);
    }
  }, [selectedCompanyId, selectedYear]);

  const loadCompanies = async () => {
    let query = supabase.from('companies').select('id, name').eq('is_active', true);
    
    if (!permissions.isAdmin && permissions.accessibleCompanyIds.length > 0) {
      query = query.in('id', permissions.accessibleCompanyIds);
    }
    
    const { data, error } = await query.order('name');
    if (error) {
      console.error('Error loading companies:', error);
    } else {
      setCompanies(data || []);
    }
  };

  const loadPayGroups = async () => {
    if (!selectedCompanyId) return;
    
    const { data, error } = await supabase
      .from('pay_groups')
      .select('id, name, company_id')
      .eq('company_id', selectedCompanyId)
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error loading pay groups:', error);
    } else {
      setPayGroups(data || []);
    }
  };

  const loadPayPeriods = async () => {
    if (!selectedCompanyId) return;
    
    let query = supabase
      .from('pay_periods')
      .select('id, period_number, period_start, period_end, year')
      .eq('company_id', selectedCompanyId)
      .order('period_start', { ascending: false });
    
    if (selectedYear) {
      query = query.eq('year', parseInt(selectedYear));
    }
    
    const { data, error } = await query.limit(50);
    if (error) {
      console.error('Error loading pay periods:', error);
    } else {
      setPayPeriods(data || []);
    }
  };

  const loadReportDocuments = async () => {
    const { data, error } = await supabase
      .from('statutory_reporting_documents')
      .select('id, document_name, reporting_interval, ai_analysis, required_data_structures')
      .eq('statutory_deduction_type_id', statutoryTypeId)
      .eq('is_active', true)
      .order('document_name');
    
    if (error) {
      console.error('Error loading report documents:', error);
    } else {
      setReportDocuments(data || []);
      if (data && data.length > 0) {
        setSelectedDocumentId(data[0].id);
      }
    }
  };

  const handleGenerateReport = async (preview: boolean = false) => {
    if (!selectedCompanyId) {
      toast.error("Please select a company");
      return;
    }

    setIsGenerating(true);
    setReportPreview(null);

    try {
      // Build filters for payroll runs
      let runsQuery = supabase
        .from('payroll_runs')
        .select('id, pay_period_id, pay_group_id, total_gross_pay, total_net_pay')
        .eq('status', 'paid');

      if (selectedPayGroupId) {
        runsQuery = runsQuery.eq('pay_group_id', selectedPayGroupId);
      }

      if (selectedPayPeriodId) {
        runsQuery = runsQuery.eq('pay_period_id', selectedPayPeriodId);
      }

      const { data: payrollRuns, error: runsError } = await runsQuery;
      if (runsError) throw runsError;

      // Filter by company via pay_groups
      const { data: companyPayGroups } = await supabase
        .from('pay_groups')
        .select('id')
        .eq('company_id', selectedCompanyId);

      const companyPayGroupIds = companyPayGroups?.map(pg => pg.id) || [];
      const filteredRuns = payrollRuns?.filter(r => companyPayGroupIds.includes(r.pay_group_id || '')) || [];
      const runIds = filteredRuns.map(r => r.id);

      if (runIds.length === 0) {
        toast.warning("No payroll data found for the selected filters");
        setIsGenerating(false);
        return;
      }

      // Get payroll records
      const { data: payrollRecords, error: recordsError } = await (supabase as any)
        .from('payroll_records')
        .select('id, employee_id, gross_pay, net_pay, total_deductions, payroll_run_id')
        .in('payroll_run_id', runIds);

      if (recordsError) throw recordsError;

      const records = payrollRecords as any[] || [];

      // Get employee profiles
      const employeeIds = [...new Set(records.map((r: any) => r.employee_id))];
      
      // @ts-ignore - Supabase type instantiation issue
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, employee_code')
        .in('id', employeeIds);

      const profileMap = new Map((profiles as any[] || []).map((p: any) => [p.id, p]));

      // Get selected company info
      const selectedCompany = companies.find(c => c.id === selectedCompanyId);
      const selectedPayGroup = payGroups.find(pg => pg.id === selectedPayGroupId);
      const selectedPayPeriod = payPeriods.find(pp => pp.id === selectedPayPeriodId);
      const selectedDoc = reportDocuments.find(d => d.id === selectedDocumentId);

      // Calculate totals
      const totalGrossPay = records.reduce((sum: number, r: any) => sum + (r.gross_pay || 0), 0);
      const totalNetPay = records.reduce((sum: number, r: any) => sum + (r.net_pay || 0), 0);
      const totalDeductions = records.reduce((sum: number, r: any) => sum + (r.total_deductions || 0), 0);

      // Build report data
      const reportData = {
        reportType: statutoryName,
        statutoryCode,
        country: countryCode,
        company: selectedCompany?.name || 'All Companies',
        payGroup: selectedPayGroup?.name || 'All Pay Groups',
        year: selectedYear,
        payPeriod: selectedPayPeriod 
          ? `${selectedPayPeriod.period_number} (${selectedPayPeriod.period_start} - ${selectedPayPeriod.period_end})`
          : 'All Periods',
        generatedAt: new Date().toISOString(),
        documentTemplate: selectedDoc?.document_name,
        summary: {
          totalRecords: records.length,
          totalGrossPay,
          totalNetPay,
          totalDeductions,
          totalStatutoryDeductions: totalDeductions, // Simplified - using total deductions
        },
        records: records.map((record: any) => {
          const profile = profileMap.get(record.employee_id) as any;
          return {
            employeeCode: profile?.employee_code || '',
            employeeName: profile?.full_name || '',
            grossPay: record.gross_pay,
            netPay: record.net_pay,
            deductions: record.total_deductions,
            statutoryDeduction: record.total_deductions, // Simplified
          };
        }),
      };

      if (preview) {
        setReportPreview(reportData);
      } else {
        // Generate and download the report
        generatePrintableReport(reportData);
      }

      toast.success(preview ? "Report preview generated" : "Report generated successfully");
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.message || "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePrintableReport = (data: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to print the report");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.reportType} Report - ${data.company}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { color: #666; margin-top: 20px; }
          .header-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .header-info div { padding: 5px 0; }
          .header-info label { font-weight: bold; color: #666; }
          .summary { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #333; }
          .summary-label { font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .text-right { text-align: right; }
          .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${data.reportType} Report</h1>
        
        <div class="header-info">
          <div><label>Company:</label> ${data.company}</div>
          <div><label>Country:</label> ${data.country}</div>
          <div><label>Pay Group:</label> ${data.payGroup}</div>
          <div><label>Year:</label> ${data.year}</div>
          <div><label>Pay Period:</label> ${data.payPeriod}</div>
          <div><label>Generated:</label> ${new Date(data.generatedAt).toLocaleString()}</div>
        </div>

        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${data.summary.totalRecords}</div>
              <div class="summary-label">Total Records</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">$${data.summary.totalGrossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div class="summary-label">Total Gross Pay</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">$${data.summary.totalStatutoryDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div class="summary-label">Total ${data.reportType}</div>
            </div>
          </div>
        </div>

        <h2>Detail Records</h2>
        <table>
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th class="text-right">Gross Pay</th>
              <th class="text-right">Deductions</th>
              <th class="text-right">${data.reportType}</th>
              <th class="text-right">Net Pay</th>
            </tr>
          </thead>
          <tbody>
            ${data.records.map((r: any) => `
              <tr>
                <td>${r.employeeCode || '-'}</td>
                <td>${r.employeeName || '-'}</td>
                <td class="text-right">$${(r.grossPay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td class="text-right">$${(r.deductions || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td class="text-right">$${(r.statutoryDeduction || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td class="text-right">$${(r.netPay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold; background-color: #e0e0e0;">
              <td colspan="2">TOTALS</td>
              <td class="text-right">$${data.summary.totalGrossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td class="text-right">$${data.summary.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td class="text-right">$${data.summary.totalStatutoryDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td class="text-right">$${data.summary.totalNetPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          <p>Report generated on ${new Date().toLocaleString()} | Statutory Code: ${data.statutoryCode}</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Statutory Report - {statutoryName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Select value={selectedCompanyId} onValueChange={(v) => {
                    setSelectedCompanyId(v);
                    setSelectedPayGroupId("");
                    setSelectedPayPeriodId("");
                    setReportPreview(null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pay Group</Label>
                  <Select value={selectedPayGroupId} onValueChange={(v) => {
                    setSelectedPayGroupId(v);
                    setReportPreview(null);
                  }}>
                    <SelectTrigger disabled={!selectedCompanyId}>
                      <SelectValue placeholder="All pay groups" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Pay Groups</SelectItem>
                      {payGroups.map((pg) => (
                        <SelectItem key={pg.id} value={pg.id}>
                          {pg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={selectedYear} onValueChange={(v) => {
                    setSelectedYear(v);
                    setSelectedPayPeriodId("");
                    setReportPreview(null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pay Period</Label>
                  <Select value={selectedPayPeriodId} onValueChange={(v) => {
                    setSelectedPayPeriodId(v);
                    setReportPreview(null);
                  }}>
                    <SelectTrigger disabled={!selectedCompanyId}>
                      <SelectValue placeholder="All periods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Periods</SelectItem>
                      {payPeriods.map((pp) => (
                        <SelectItem key={pp.id} value={pp.id}>
                          {pp.period_number} ({pp.period_start} - {pp.period_end})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {reportDocuments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Report Template</Label>
                  <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {reportDocuments.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.document_name} ({doc.reporting_interval})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {reportPreview && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Report Preview</h3>
                  <div className="text-sm text-muted-foreground">
                    {reportPreview.summary.totalRecords} records
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{formatCurrency(reportPreview.summary.totalGrossPay)}</div>
                    <div className="text-xs text-muted-foreground">Total Gross Pay</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{formatCurrency(reportPreview.summary.totalStatutoryDeductions)}</div>
                    <div className="text-xs text-muted-foreground">Total {statutoryName}</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{formatCurrency(reportPreview.summary.totalNetPay)}</div>
                    <div className="text-xs text-muted-foreground">Total Net Pay</div>
                  </div>
                </div>

                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Gross Pay</TableHead>
                        <TableHead className="text-right">{statutoryName}</TableHead>
                        <TableHead className="text-right">Net Pay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportPreview.records.slice(0, 10).map((record: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-xs text-muted-foreground">{record.employeeCode}</div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(record.grossPay || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.statutoryDeduction || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(record.netPay || 0)}</TableCell>
                        </TableRow>
                      ))}
                      {reportPreview.records.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            ... and {reportPreview.records.length - 10} more records
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleGenerateReport(true)}
            disabled={isGenerating || !selectedCompanyId}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Preview
          </Button>
          <Button
            onClick={() => handleGenerateReport(false)}
            disabled={isGenerating || !selectedCompanyId}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Print Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
