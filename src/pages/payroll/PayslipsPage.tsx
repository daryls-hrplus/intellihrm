import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePayroll, Payslip } from "@/hooks/usePayroll";
import { usePayslipTemplates, PayslipTemplate } from "@/hooks/usePayslipTemplates";
import { useAuth } from "@/contexts/AuthContext";
import { PayslipDocument } from "@/components/payroll/PayslipDocument";
import { FileText, Download, Eye, Search, DollarSign, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
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
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const filteredPayslips = payslips.filter(p =>
    p.payslip_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    format(new Date(p.pay_date), "MMM yyyy").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setDetailDialogOpen(true);
  };

  const downloadPayslipPDF = async (payslip: Payslip) => {
    setIsDownloading(true);
    
    try {
      // Wait for dialog to render if not already open
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("payroll.payslips.payslipHistory")}</CardTitle>
                <CardDescription>{t("payroll.payslips.payslipHistorySubtitle")}</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("payroll.payslips.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
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
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">{payslip.payslip_number}</TableCell>
                    <TableCell>
                      {format(new Date(payslip.pay_period_start), "MMM d")} - {format(new Date(payslip.pay_period_end), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{format(new Date(payslip.pay_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{formatCurrency(payslip.gross_pay, payslip.currency)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      -{formatCurrency(payslip.total_deductions, payslip.currency)}
                    </TableCell>
                    <TableCell className="font-semibold text-success">
                      {formatCurrency(payslip.net_pay, payslip.currency)}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayslips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    {t("common.close")}
                  </Button>
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
      </div>
    </AppLayout>
  );
}
