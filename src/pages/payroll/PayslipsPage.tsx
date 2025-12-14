import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePayroll, Payslip } from "@/hooks/usePayroll";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Download, Eye, Search, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export default function PayslipsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { fetchPayslips, isLoading } = usePayroll();
  
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPayslips();
    }
  }, [user?.id]);

  const loadPayslips = async () => {
    if (!user?.id) return;
    const data = await fetchPayslips(user.id);
    setPayslips(data);
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

  const downloadPayslip = (payslip: Payslip) => {
    // In a real app, this would download the actual PDF
    const content = `
PAYSLIP
${payslip.payslip_number}

Pay Period: ${format(new Date(payslip.pay_period_start), "MMM d, yyyy")} - ${format(new Date(payslip.pay_period_end), "MMM d, yyyy")}
Pay Date: ${format(new Date(payslip.pay_date), "MMM d, yyyy")}

EARNINGS
---------
Gross Pay: ${formatCurrency(payslip.gross_pay)}

DEDUCTIONS
-----------
Total Deductions: ${formatCurrency(payslip.total_deductions)}

NET PAY
--------
${formatCurrency(payslip.net_pay)}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${payslip.payslip_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate YTD totals
  const currentYear = new Date().getFullYear();
  const ytdPayslips = payslips.filter(p => new Date(p.pay_date).getFullYear() === currentYear);
  const ytdGross = ytdPayslips.reduce((sum, p) => sum + p.gross_pay, 0);
  const ytdNet = ytdPayslips.reduce((sum, p) => sum + p.net_pay, 0);
  const ytdDeductions = ytdPayslips.reduce((sum, p) => sum + p.total_deductions, 0);

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
                        <Button variant="ghost" size="sm" onClick={() => downloadPayslip(payslip)}>
                          <Download className="h-4 w-4" />
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

        {/* Payslip Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("payroll.payslips.payslipDetails")}</DialogTitle>
            </DialogHeader>
            {selectedPayslip && (
              <div className="space-y-6">
                <div className="text-center border-b pb-4">
                  <p className="text-lg font-semibold">{selectedPayslip.payslip_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("payroll.payslips.payPeriod")}: {format(new Date(selectedPayslip.pay_period_start), "MMM d")} - {format(new Date(selectedPayslip.pay_period_end), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("payroll.payslips.payDate")}: {format(new Date(selectedPayslip.pay_date), "MMMM d, yyyy")}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{t("payroll.payslips.grossPay")}</span>
                    <span className="font-semibold">{formatCurrency(selectedPayslip.gross_pay)}</span>
                  </div>

                  <div className="border rounded-lg p-3 space-y-2">
                    <p className="font-medium text-sm text-muted-foreground">{t("payroll.payslips.deductions")}</p>
                    <div className="flex justify-between">
                      <span className="text-sm">{t("payroll.payslips.totalDeductions")}</span>
                      <span className="text-sm text-destructive">-{formatCurrency(selectedPayslip.total_deductions)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between p-3 bg-success/10 rounded-lg">
                    <span className="font-bold text-success">{t("payroll.payslips.netPay")}</span>
                    <span className="font-bold text-success text-lg">{formatCurrency(selectedPayslip.net_pay)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    {t("common.close")}
                  </Button>
                  <Button onClick={() => downloadPayslip(selectedPayslip)}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("common.download")}
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
