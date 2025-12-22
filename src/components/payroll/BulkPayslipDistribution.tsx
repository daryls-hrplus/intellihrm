import { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { PayslipDocument } from "@/components/payroll/PayslipDocument";
import { PayslipTemplate } from "@/hooks/usePayslipTemplates";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { 
  Download, 
  Mail, 
  Printer, 
  Loader2, 
  CheckCircle, 
  XCircle,
  FileText,
  Users,
  Save,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface BulkPayslipDistributionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRunId: string;
  companyId: string;
  runNumber: string;
  payslipTemplate: PayslipTemplate | null;
  companyInfo: { name: string; address?: string; logo_url?: string } | null;
}

interface EmployeePayslipInfo {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  payslip_number: string;
  gross_pay: number;
  net_pay: number;
  total_deductions: number;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  currency: string;
}

interface PayslipData {
  employees: EmployeePayslipInfo[];
  payroll_run: {
    run_number: string;
    status: string;
    employee_count: number;
    total_gross_pay: number;
    total_net_pay: number;
  };
  pay_period: {
    period_start: string;
    period_end: string;
    pay_date: string;
  };
}

export function BulkPayslipDistribution({
  open,
  onOpenChange,
  payrollRunId,
  companyId,
  runNumber,
  payslipTemplate,
  companyInfo,
}: BulkPayslipDistributionProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<'download' | 'email' | 'print' | 'store' | null>(null);
  const [progress, setProgress] = useState(0);
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<{ name: string; status: 'success' | 'failed'; error?: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const fetchPayslipData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-payslip-distribution', {
        body: {
          payroll_run_id: payrollRunId,
          action: 'download_info',
          company_id: companyId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setPayslipData(data);
      // Select all employees by default
      setSelectedEmployees(new Set(data.employees.map((e: EmployeePayslipInfo) => e.employee_id)));
    } catch (err: any) {
      console.error("Failed to fetch payslip data:", err);
      toast.error("Failed to load payslip data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && !payslipData) {
      fetchPayslipData();
    }
    if (!isOpen) {
      setShowResults(false);
      setResults([]);
      setProgress(0);
      setAction(null);
    }
    onOpenChange(isOpen);
  };

  const toggleEmployee = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const toggleAll = () => {
    if (selectedEmployees.size === payslipData?.employees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(payslipData?.employees.map(e => e.employee_id)));
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const handleBulkDownload = async () => {
    if (!payslipData || selectedEmployees.size === 0) return;
    
    setAction('download');
    setIsLoading(true);
    setProgress(0);
    setResults([]);

    const selectedEmps = payslipData.employees.filter(e => selectedEmployees.has(e.employee_id));
    const total = selectedEmps.length;
    const newResults: typeof results = [];

    try {
      // Create a combined PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let isFirstPage = true;

      for (let i = 0; i < selectedEmps.length; i++) {
        const emp = selectedEmps[i];
        setProgress(Math.round(((i + 1) / total) * 100));

        try {
          // Create payslip data for this employee
          const payslip = {
            id: emp.employee_id,
            employee_payroll_id: emp.employee_id,
            employee_id: emp.employee_id,
            payslip_number: emp.payslip_number,
            pay_period_start: emp.pay_period_start,
            pay_period_end: emp.pay_period_end,
            pay_date: emp.pay_date,
            gross_pay: emp.gross_pay,
            net_pay: emp.net_pay,
            total_deductions: emp.total_deductions,
            currency: emp.currency,
            pdf_url: null,
            pdf_generated_at: null,
            is_viewable: true,
            viewed_at: null,
            downloaded_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Create a temporary container and render the payslip
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.width = '800px';
          document.body.appendChild(container);

          const root = createRoot(container);
          root.render(
            <PayslipDocument
              payslip={payslip}
              template={payslipTemplate}
              employee={{
                full_name: emp.employee_name,
                email: emp.employee_email,
              }}
              company={companyInfo || undefined}
            />
          );

          // Wait for render
          await new Promise(resolve => setTimeout(resolve, 200));

          // Capture as canvas
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
          });

          // Add new page if not first
          if (!isFirstPage) {
            pdf.addPage();
          }
          isFirstPage = false;

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 10;

          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

          // Cleanup
          root.unmount();
          document.body.removeChild(container);

          newResults.push({ name: emp.employee_name, status: 'success' });
        } catch (err: any) {
          console.error(`Failed to generate payslip for ${emp.employee_name}:`, err);
          newResults.push({ name: emp.employee_name, status: 'failed', error: err.message });
        }
      }

      // Save the combined PDF
      pdf.save(`payslips_${runNumber}.pdf`);
      setResults(newResults);
      setShowResults(true);
      
      const successCount = newResults.filter(r => r.status === 'success').length;
      toast.success(`Downloaded ${successCount} payslips successfully`);
    } catch (err: any) {
      console.error("Bulk download failed:", err);
      toast.error("Bulk download failed");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleStorePayslips = async () => {
    if (!payslipData || selectedEmployees.size === 0) return;
    
    setAction('store');
    setIsLoading(true);
    setProgress(0);
    setResults([]);

    const selectedEmps = payslipData.employees.filter(e => selectedEmployees.has(e.employee_id));
    const total = selectedEmps.length;
    const newResults: typeof results = [];

    try {
      for (let i = 0; i < selectedEmps.length; i++) {
        const emp = selectedEmps[i];
        setProgress(Math.round(((i + 1) / total) * 100));

        try {
          // Create payslip data for this employee
          const payslip = {
            id: emp.employee_id,
            employee_payroll_id: emp.employee_id,
            employee_id: emp.employee_id,
            payslip_number: emp.payslip_number,
            pay_period_start: emp.pay_period_start,
            pay_period_end: emp.pay_period_end,
            pay_date: emp.pay_date,
            gross_pay: emp.gross_pay,
            net_pay: emp.net_pay,
            total_deductions: emp.total_deductions,
            currency: emp.currency,
            pdf_url: null,
            pdf_generated_at: null,
            is_viewable: true,
            viewed_at: null,
            downloaded_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Create a temporary container and render the payslip
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.width = '800px';
          document.body.appendChild(container);

          const root = createRoot(container);
          root.render(
            <PayslipDocument
              payslip={payslip}
              template={payslipTemplate}
              employee={{
                full_name: emp.employee_name,
                email: emp.employee_email,
              }}
              company={companyInfo || undefined}
            />
          );

          // Wait for render
          await new Promise(resolve => setTimeout(resolve, 200));

          // Capture as canvas
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
          });

          // Generate PDF
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 10;

          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

          // Cleanup DOM
          root.unmount();
          document.body.removeChild(container);

          // Convert PDF to blob
          const pdfBlob = pdf.output('blob');
          
          // Upload to storage - path: employee_id/payslip_number.pdf
          const filePath = `${emp.employee_id}/${emp.payslip_number}.pdf`;
          
          const { error: uploadError } = await supabase.storage
            .from('payslips')
            .upload(filePath, pdfBlob, {
              contentType: 'application/pdf',
              upsert: true,
            });

          if (uploadError) throw uploadError;

          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('payslips')
            .getPublicUrl(filePath);

          // Update the payslip record with the PDF URL
          const { error: updateError } = await supabase
            .from('payslips')
            .update({
              pdf_url: urlData.publicUrl,
              pdf_generated_at: new Date().toISOString(),
            })
            .eq('payslip_number', emp.payslip_number);

          if (updateError) {
            console.warn("Could not update payslip record:", updateError);
          }

          newResults.push({ name: emp.employee_name, status: 'success' });
        } catch (err: any) {
          console.error(`Failed to store payslip for ${emp.employee_name}:`, err);
          newResults.push({ name: emp.employee_name, status: 'failed', error: err.message });
        }
      }

      setResults(newResults);
      setShowResults(true);
      
      const successCount = newResults.filter(r => r.status === 'success').length;
      toast.success(`Stored ${successCount} payslips successfully`);
    } catch (err: any) {
      console.error("Store payslips failed:", err);
      toast.error("Failed to store payslips");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleBulkEmail = async () => {
    if (!payslipData || selectedEmployees.size === 0) return;
    
    setAction('email');
    setIsLoading(true);
    setProgress(0);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('bulk-payslip-distribution', {
        body: {
          payroll_run_id: payrollRunId,
          action: 'email',
          company_id: companyId,
        },
      });

      if (error) throw error;

      setProgress(100);
      
      if (data.results) {
        setResults(data.results.map((r: any) => ({
          name: r.employee_name,
          status: r.status === 'sent' ? 'success' : 'failed',
          error: r.error,
        })));
        setShowResults(true);
      }

      if (data.success) {
        toast.success(data.message || `Sent ${data.sent_count} emails successfully`);
      } else {
        toast.error(data.error || "Failed to send emails");
      }
    } catch (err: any) {
      console.error("Bulk email failed:", err);
      toast.error(err.message || "Failed to send emails");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleBulkPrint = async () => {
    if (!payslipData || selectedEmployees.size === 0) return;
    
    setAction('print');
    setIsLoading(true);
    setProgress(0);

    const selectedEmps = payslipData.employees.filter(e => selectedEmployees.has(e.employee_id));
    
    try {
      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to print payslips");
        return;
      }

      const primaryColor = payslipTemplate?.primary_color || '#1e40af';

      let payslipsHtml = '';
      
      for (let i = 0; i < selectedEmps.length; i++) {
        const emp = selectedEmps[i];
        setProgress(Math.round(((i + 1) / selectedEmps.length) * 100));

        payslipsHtml += `
          <div class="payslip-page" style="page-break-after: always; padding: 20px;">
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 2px solid ${primaryColor}; padding-bottom: 16px; margin-bottom: 16px;">
                <div>
                  <h1 style="color: ${primaryColor}; margin: 0; font-size: 24px;">${companyInfo?.name || 'Company'}</h1>
                  ${companyInfo?.address ? `<p style="color: #64748b; margin: 4px 0 0 0;">${companyInfo.address}</p>` : ''}
                </div>
                <div style="text-align: right;">
                  <h2 style="margin: 0; color: #333;">PAYSLIP</h2>
                  <p style="color: #64748b; margin: 4px 0 0 0;">${emp.payslip_number}</p>
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div>
                  <h3 style="color: ${primaryColor}; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase;">Employee</h3>
                  <p style="margin: 0; font-weight: 600;">${emp.employee_name}</p>
                  <p style="margin: 4px 0 0 0; color: #64748b;">${emp.employee_email}</p>
                </div>
                <div style="text-align: right;">
                  <h3 style="color: ${primaryColor}; margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase;">Pay Period</h3>
                  <p style="margin: 0;">${new Date(emp.pay_period_start).toLocaleDateString()} - ${new Date(emp.pay_period_end).toLocaleDateString()}</p>
                  <p style="margin: 4px 0 0 0; color: #64748b;">Pay Date: ${new Date(emp.pay_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background: #f8fafc;">
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0;">Description</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 2px solid #e2e8f0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">Gross Pay</td>
                    <td style="text-align: right; padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${formatCurrency(emp.gross_pay, emp.currency)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #dc2626;">Total Deductions</td>
                    <td style="text-align: right; padding: 12px; border-bottom: 1px solid #e2e8f0; color: #dc2626;">-${formatCurrency(emp.total_deductions, emp.currency)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style="background: ${primaryColor}10;">
                    <th style="text-align: left; padding: 12px; font-size: 16px;">Net Pay</th>
                    <th style="text-align: right; padding: 12px; font-size: 18px; color: #059669;">${formatCurrency(emp.net_pay, emp.currency)}</th>
                  </tr>
                </tfoot>
              </table>
              
              <div style="text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                <p style="margin: 0;">This is a computer-generated document. No signature required.</p>
                <p style="margin: 4px 0 0 0;">CONFIDENTIAL - For employee use only</p>
              </div>
            </div>
          </div>
        `;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Payslips - ${runNumber}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; }
            .payslip-page:last-child { page-break-after: auto; }
            @media print {
              @page { margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${payslipsHtml}
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setProgress(100);
        toast.success(`Prepared ${selectedEmps.length} payslips for printing`);
      }, 500);
    } catch (err: any) {
      console.error("Bulk print failed:", err);
      toast.error("Failed to prepare payslips for printing");
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const selectedCount = selectedEmployees.size;
  const totalCount = payslipData?.employees.length || 0;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t("payroll.bulkDistribution.title", "Bulk Payslip Distribution")}
          </DialogTitle>
          <DialogDescription>
            {t("payroll.bulkDistribution.description", "Download, email, or print payslips for all employees in this payroll run.")}
          </DialogDescription>
        </DialogHeader>

        {isLoading && !payslipData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : showResults ? (
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-sm">
                {results.filter(r => r.status === 'success').length} successful
              </Badge>
              {results.filter(r => r.status === 'failed').length > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {results.filter(r => r.status === 'failed').length} failed
                </Badge>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.status === 'success' ? 'bg-success/10' : 'bg-destructive/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {result.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span>{result.name}</span>
                    </div>
                    {result.error && (
                      <span className="text-sm text-destructive">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : payslipData ? (
          <div className="flex-1 overflow-hidden">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">{t("payroll.bulkDistribution.employees", "Employees")}</p>
                <p className="text-xl font-semibold">{payslipData.payroll_run.employee_count}</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">{t("payroll.bulkDistribution.totalGross", "Total Gross")}</p>
                <p className="text-xl font-semibold">{formatCurrency(payslipData.payroll_run.total_gross_pay)}</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground">{t("payroll.bulkDistribution.totalNet", "Total Net")}</p>
                <p className="text-xl font-semibold text-success">{formatCurrency(payslipData.payroll_run.total_net_pay)}</p>
              </div>
            </div>

            {/* Employee Selection */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedCount === totalCount && totalCount > 0}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm font-medium">
                  {t("payroll.bulkDistribution.selectAll", "Select All")} ({selectedCount}/{totalCount})
                </span>
              </div>
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                {selectedCount} {t("payroll.bulkDistribution.selected", "selected")}
              </Badge>
            </div>

            <ScrollArea className="h-[200px] border rounded-lg">
              <div className="p-2 space-y-1">
                {payslipData.employees.map((emp) => (
                  <div 
                    key={emp.employee_id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted ${
                      selectedEmployees.has(emp.employee_id) ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => toggleEmployee(emp.employee_id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedEmployees.has(emp.employee_id)}
                        onCheckedChange={() => toggleEmployee(emp.employee_id)}
                      />
                      <div>
                        <p className="font-medium text-sm">{emp.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{emp.employee_email || 'No email'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-success">{formatCurrency(emp.net_pay, emp.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Progress */}
            {action && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {action === 'download' && t("payroll.bulkDistribution.generating", "Generating PDFs...")}
                    {action === 'email' && t("payroll.bulkDistribution.sending", "Sending emails...")}
                    {action === 'print' && t("payroll.bulkDistribution.preparing", "Preparing for print...")}
                    {action === 'store' && t("payroll.bulkDistribution.storing", "Storing payslips...")}
                  </span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter className="border-t pt-4">
          {showResults ? (
            <Button onClick={() => { setShowResults(false); setResults([]); }}>
              {t("common.back", "Back")}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleOpen(false)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBulkPrint}
                disabled={isLoading || selectedCount === 0}
              >
                {action === 'print' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4 mr-2" />
                )}
                {t("payroll.bulkDistribution.print", "Print All")}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBulkEmail}
                disabled={isLoading || selectedCount === 0}
              >
                {action === 'email' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {t("payroll.bulkDistribution.email", "Email All")}
              </Button>
              <Button 
                onClick={handleBulkDownload}
                disabled={isLoading || selectedCount === 0}
                variant="outline"
              >
                {action === 'download' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {t("payroll.bulkDistribution.download", "Download All")}
              </Button>
              <Button 
                onClick={handleStorePayslips}
                disabled={isLoading || selectedCount === 0}
              >
                {action === 'store' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {t("payroll.bulkDistribution.storeFinalize", "Store & Finalize")}
              </Button>
            </>
          )}
        </DialogFooter>

        {/* Hidden container for print rendering */}
        <div ref={printContainerRef} style={{ display: 'none' }} />
      </DialogContent>
    </Dialog>
  );
}
