import { useState, useEffect, useRef, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { usePayroll, Payslip } from "@/hooks/usePayroll";
import { usePayslipTemplates, PayslipTemplate } from "@/hooks/usePayslipTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PayslipDocument } from "@/components/payroll/PayslipDocument";
import { FileText, Download, Eye, Search, DollarSign, Calendar, Loader2, Filter, CheckCircle, PenLine } from "lucide-react";
import { format, getMonth } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useTranslation } from "react-i18next";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function PayslipsPage() {
  const { t } = useTranslation();
  const { user, company } = useAuth();
  const { fetchPayslips, isLoading } = usePayroll();
  const { fetchDefaultTemplate } = usePayslipTemplates();
  
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [payslipToSign, setPayslipToSign] = useState<Payslip | null>(null);
  const [signAcknowledged, setSignAcknowledged] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [template, setTemplate] = useState<PayslipTemplate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const payslipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadPayslips();
    }
  }, [user?.id]);

  useEffect(() => {
    if (company?.id) {
      loadTemplate();
    }
  }, [company?.id]);

  const loadPayslips = async () => {
    if (!user?.id) return;
    const data = await fetchPayslips(user.id);
    setPayslips(data);
  };

  const loadTemplate = async () => {
    if (!company?.id) return;
    const tmpl = await fetchDefaultTemplate(company.id);
    setTemplate(tmpl);
  };

  // Extract available years from payslips
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    payslips.forEach(p => {
      years.add(new Date(p.pay_date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }, [payslips]);

  // Pay period options (quarters and months)
  const periodOptions = [
    { value: "all", label: t("payroll.payslips.allPeriods", "All Periods") },
    { value: "q1", label: t("payroll.payslips.q1", "Q1 (Jan-Mar)") },
    { value: "q2", label: t("payroll.payslips.q2", "Q2 (Apr-Jun)") },
    { value: "q3", label: t("payroll.payslips.q3", "Q3 (Jul-Sep)") },
    { value: "q4", label: t("payroll.payslips.q4", "Q4 (Oct-Dec)") },
    { value: "jan", label: t("common.months.january", "January") },
    { value: "feb", label: t("common.months.february", "February") },
    { value: "mar", label: t("common.months.march", "March") },
    { value: "apr", label: t("common.months.april", "April") },
    { value: "may", label: t("common.months.may", "May") },
    { value: "jun", label: t("common.months.june", "June") },
    { value: "jul", label: t("common.months.july", "July") },
    { value: "aug", label: t("common.months.august", "August") },
    { value: "sep", label: t("common.months.september", "September") },
    { value: "oct", label: t("common.months.october", "October") },
    { value: "nov", label: t("common.months.november", "November") },
    { value: "dec", label: t("common.months.december", "December") },
  ];

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  // Filter payslips based on year, period, and search
  const filteredPayslips = useMemo(() => {
    return payslips.filter(p => {
      const payDate = new Date(p.pay_date);
      const year = payDate.getFullYear();
      const month = getMonth(payDate); // 0-11

      // Year filter
      if (selectedYear !== "all" && year !== parseInt(selectedYear)) {
        return false;
      }

      // Period filter
      if (selectedPeriod !== "all") {
        const monthMap: Record<string, number> = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };
        const quarterMap: Record<string, number[]> = {
          q1: [0, 1, 2],
          q2: [3, 4, 5],
          q3: [6, 7, 8],
          q4: [9, 10, 11]
        };

        if (quarterMap[selectedPeriod]) {
          if (!quarterMap[selectedPeriod].includes(month)) return false;
        } else if (monthMap[selectedPeriod] !== undefined) {
          if (month !== monthMap[selectedPeriod]) return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          p.payslip_number.toLowerCase().includes(searchLower) ||
          format(payDate, "MMM yyyy").toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [payslips, selectedYear, selectedPeriod, searchQuery]);

  const viewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setDetailDialogOpen(true);
  };

  const openSignDialog = (payslip: Payslip) => {
    setPayslipToSign(payslip);
    setSignAcknowledged(false);
    setSignDialogOpen(true);
  };

  const signPayslip = async () => {
    if (!payslipToSign || !signAcknowledged) return;
    
    setIsSigning(true);
    try {
      // Create a signature hash from payslip data + timestamp
      const signatureData = `${payslipToSign.id}|${payslipToSign.payslip_number}|${user?.id}|${new Date().toISOString()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signatureHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('payslips')
        .update({
          signed_at: new Date().toISOString(),
          signature_hash: signatureHash,
          signature_device_info: navigator.userAgent,
        } as any)
        .eq('id', payslipToSign.id);

      if (error) throw error;

      toast.success(t("payroll.payslips.signSuccess", "Payslip signed successfully"));
      setSignDialogOpen(false);
      loadPayslips(); // Refresh to show signed status
    } catch (error: any) {
      console.error("Error signing payslip:", error);
      toast.error(error.message || t("payroll.payslips.signError", "Failed to sign payslip"));
    } finally {
      setIsSigning(false);
    }
  };

  const downloadPayslipPDF = async (payslip: Payslip) => {
    setIsDownloading(true);
    
    try {
      // Check if stored PDF exists
      if (payslip.pdf_url) {
        // Download from storage
        const response = await fetch(payslip.pdf_url);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `payslip_${payslip.payslip_number}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          // Update downloaded_at timestamp
          await supabase
            .from('payslips')
            .update({ downloaded_at: new Date().toISOString() })
            .eq('id', payslip.id);
          
          toast.success(t("payroll.payslips.downloadSuccess"));
          return;
        }
      }

      // Fallback: Generate on-the-fly if no stored PDF
      if (!detailDialogOpen) {
        setSelectedPayslip(payslip);
        setDetailDialogOpen(true);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const element = payslipRef.current;
      if (!element) {
        throw new Error("Payslip element not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`payslip_${payslip.payslip_number}.pdf`);
      
      toast.success(t("payroll.payslips.downloadSuccess"));
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(t("payroll.payslips.downloadError"));
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculate YTD totals
  const currentYear = new Date().getFullYear();
  const ytdPayslips = payslips.filter(p => new Date(p.pay_date).getFullYear() === currentYear);
  const ytdGross = ytdPayslips.reduce((sum, p) => sum + p.gross_pay, 0);
  const ytdNet = ytdPayslips.reduce((sum, p) => sum + p.net_pay, 0);
  const ytdDeductions = ytdPayslips.reduce((sum, p) => sum + p.total_deductions, 0);

  // Employee info for template
  const employeeInfo = {
    full_name: user?.user_metadata?.full_name || user?.email || 'Employee',
    email: user?.email || '',
    employee_number: '',
    department: '',
    position: '',
  };

  // YTD totals for template
  const ytdTotals = {
    gross: ytdGross,
    deductions: ytdDeductions,
    net: ytdNet,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: t("payroll.payslips.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.payslips.title")}</h1>
              <p className="text-muted-foreground">{t("payroll.payslips.subtitle")}</p>
            </div>
          </div>
        </div>

        {/* YTD Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.payslips.ytdGross")}</p>
                <p className="text-xl font-semibold">{formatCurrency(ytdGross)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.payslips.ytdNet")}</p>
                <p className="text-xl font-semibold">{formatCurrency(ytdNet)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.payslips.ytdDeductions")}</p>
                <p className="text-xl font-semibold">{formatCurrency(ytdDeductions)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.payslips.payslipsCount", { year: currentYear })}</p>
                <p className="text-xl font-semibold">{ytdPayslips.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payslips List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("payroll.payslips.payslipHistory")}</CardTitle>
                  <CardDescription>{t("payroll.payslips.payslipHistorySubtitle")}</CardDescription>
                </div>
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{t("common.filters", "Filters")}:</span>
                </div>
                
                {/* Year Filter */}
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder={t("payroll.payslips.selectYear", "Select Year")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("payroll.payslips.allYears", "All Years")}</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Period Filter */}
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t("payroll.payslips.selectPeriod", "Select Period")} />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("payroll.payslips.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Clear Filters */}
                {(selectedYear !== "all" || selectedPeriod !== "all" || searchQuery) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedYear("all");
                      setSelectedPeriod("all");
                      setSearchQuery("");
                    }}
                  >
                    {t("common.clearFilters", "Clear Filters")}
                  </Button>
                )}
              </div>

              {/* Results count */}
              <div className="text-sm text-muted-foreground">
                {t("payroll.payslips.showingResults", "Showing {{count}} of {{total}} payslips", {
                  count: filteredPayslips.length,
                  total: payslips.length
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payroll.payslips.payslipNumber")}</TableHead>
                  <TableHead>{t("payroll.payslips.payPeriod")}</TableHead>
                  <TableHead>{t("payroll.payslips.payDate")}</TableHead>
                  <TableHead>{t("payroll.payslips.grossPay")}</TableHead>
                  <TableHead>{t("payroll.payslips.deductions")}</TableHead>
                  <TableHead>{t("payroll.payslips.netPay")}</TableHead>
                  <TableHead>{t("payroll.payslips.signed", "Signed")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">{payslip.payslip_number}</TableCell>
                    <TableCell>
                      {formatDateForDisplay(payslip.pay_period_start, "MMM d")} - {formatDateForDisplay(payslip.pay_period_end)}
                    </TableCell>
                    <TableCell>{formatDateForDisplay(payslip.pay_date)}</TableCell>
                    <TableCell>{formatCurrency(payslip.gross_pay, payslip.currency)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      -{formatCurrency(payslip.total_deductions, payslip.currency)}
                    </TableCell>
                    <TableCell className="font-semibold text-success">
                      {formatCurrency(payslip.net_pay, payslip.currency)}
                    </TableCell>
                    <TableCell>
                      {(payslip as any).signed_at ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t("payroll.payslips.signedOn", "Signed")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                          {t("payroll.payslips.pendingSignature", "Pending")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => viewPayslip(payslip)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => downloadPayslipPDF(payslip)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        {!(payslip as any).signed_at && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openSignDialog(payslip)}
                            className="text-primary hover:text-primary"
                          >
                            <PenLine className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayslips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {t("payroll.payslips.noPayslips")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Payslip Detail Dialog with Template */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("payroll.payslips.payslipDetails")}</DialogTitle>
            </DialogHeader>
            {selectedPayslip && (
              <div className="space-y-4">
                <div ref={payslipRef}>
                  <PayslipDocument
                    payslip={selectedPayslip}
                    template={template}
                    employee={employeeInfo}
                    company={{ name: company?.name || 'Company' }}
                    ytdTotals={ytdTotals}
                  />
                </div>

                {(selectedPayslip as any).signed_at && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        {t("payroll.payslips.electronicallySignedOn", "Electronically signed on")} {formatDateForDisplay((selectedPayslip as any).signed_at, "PPP 'at' p")}
                      </p>
                      <p className="text-xs text-green-600">
                        {t("payroll.payslips.signatureHash", "Signature ID")}: {(selectedPayslip as any).signature_hash?.substring(0, 16)}...
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    {t("common.close")}
                  </Button>
                  {!(selectedPayslip as any).signed_at && (
                    <Button variant="outline" onClick={() => {
                      setDetailDialogOpen(false);
                      openSignDialog(selectedPayslip);
                    }}>
                      <PenLine className="h-4 w-4 mr-2" />
                      {t("payroll.payslips.signPayslip", "Sign Payslip")}
                    </Button>
                  )}
                  <Button onClick={() => downloadPayslipPDF(selectedPayslip)} disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {t("payroll.payslips.downloadPdf")}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Electronic Signature Dialog */}
        <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PenLine className="h-5 w-5" />
                {t("payroll.payslips.signPayslip", "Sign Payslip")}
              </DialogTitle>
              <DialogDescription>
                {t("payroll.payslips.signPayslipDescription", "By signing, you acknowledge receipt and confirm you have reviewed this payslip.")}
              </DialogDescription>
            </DialogHeader>

            {payslipToSign && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">{t("payroll.payslips.payslipNumber")}:</div>
                    <div className="font-medium">{payslipToSign.payslip_number}</div>
                    <div className="text-muted-foreground">{t("payroll.payslips.payPeriod")}:</div>
                    <div className="font-medium">
                      {formatDateForDisplay(payslipToSign.pay_period_start, "MMM d")} - {formatDateForDisplay(payslipToSign.pay_period_end, "MMM d, yyyy")}
                    </div>
                    <div className="text-muted-foreground">{t("payroll.payslips.netPay")}:</div>
                    <div className="font-semibold text-success">
                      {formatCurrency(payslipToSign.net_pay, payslipToSign.currency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <Checkbox
                    id="acknowledge"
                    checked={signAcknowledged}
                    onCheckedChange={(checked) => setSignAcknowledged(checked as boolean)}
                  />
                  <Label htmlFor="acknowledge" className="text-sm leading-relaxed cursor-pointer">
                    {t("payroll.payslips.signAcknowledgement", "I acknowledge receipt of this payslip and confirm that I have reviewed the payment details. I understand this electronic signature serves as proof of receipt.")}
                  </Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSignDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={signPayslip} 
                disabled={!signAcknowledged || isSigning}
              >
                {isSigning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PenLine className="h-4 w-4 mr-2" />
                )}
                {t("payroll.payslips.confirmSign", "Confirm & Sign")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
