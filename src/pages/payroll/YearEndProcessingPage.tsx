import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePayroll, PayrollYearEnd } from "@/hooks/usePayroll";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { Plus, FileCheck, Calendar, DollarSign, Users, AlertCircle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePageAudit } from "@/hooks/usePageAudit";

export default function YearEndProcessingPage() {
  const { t } = useTranslation();
  usePageAudit('year_end_processing', 'Payroll');
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const {
    isLoading,
    fetchYearEndProcessing,
    createYearEndProcessing,
    updateYearEndProcessing,
  } = usePayroll();

  const [yearEnds, setYearEnds] = useState<PayrollYearEnd[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedYearEnd, setSelectedYearEnd] = useState<PayrollYearEnd | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    tax_year: new Date().getFullYear(),
    processing_notes: "",
  });

  useEffect(() => {
    if (selectedCompanyId) {
      loadData();
    }
  }, [selectedCompanyId]);

  const loadData = async () => {
    if (!selectedCompanyId) return;
    const data = await fetchYearEndProcessing(selectedCompanyId);
    setYearEnds(data);
  };

  const handleCreate = async () => {
    if (!selectedCompanyId) return;

    const result = await createYearEndProcessing({
      company_id: selectedCompanyId,
      tax_year: createForm.tax_year,
      processing_notes: createForm.processing_notes,
    });

    if (result) {
      setCreateDialogOpen(false);
      setCreateForm({ tax_year: new Date().getFullYear(), processing_notes: "" });
      loadData();
    }
  };

  const handleGenerateW2s = async (yearEnd: PayrollYearEnd) => {
    const success = await updateYearEndProcessing(yearEnd.id, {
      status: 'processing',
    });

    // Simulate W2 generation
    setTimeout(async () => {
      await updateYearEndProcessing(yearEnd.id, {
        status: 'generated',
        w2_generated: true,
        w2_generated_at: new Date().toISOString(),
      });
      loadData();
    }, 2000);

    if (success) loadData();
  };

  const handleSubmitW2s = async (yearEnd: PayrollYearEnd) => {
    const success = await updateYearEndProcessing(yearEnd.id, {
      w2_submitted: true,
      w2_submitted_at: new Date().toISOString(),
      status: 'submitted',
    });
    if (success) loadData();
  };

  const handleClose = async (yearEnd: PayrollYearEnd) => {
    const success = await updateYearEndProcessing(yearEnd.id, {
      status: 'closed',
    });
    if (success) loadData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-warning/10 text-warning",
      processing: "bg-primary/10 text-primary",
      generated: "bg-success/10 text-success",
      submitted: "bg-success/10 text-success",
      corrected: "bg-warning/10 text-warning",
      closed: "bg-muted text-muted-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const viewDetails = (yearEnd: PayrollYearEnd) => {
    setSelectedYearEnd(yearEnd);
    setDetailDialogOpen(true);
  };

  if (!selectedCompanyId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("payroll.yearEnd.selectCompanyPrompt")}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("payroll.title"), href: "/payroll" },
            { label: t("payroll.yearEnd.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <FileCheck className="h-6 w-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.yearEnd.title")}</h1>
              <p className="text-muted-foreground">{t("payroll.yearEnd.subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("payroll.yearEnd.newTaxYear")}
          </Button>
        </div>

        {/* Year End Processing List */}
        <Card>
          <CardHeader>
            <CardTitle>{t("payroll.yearEnd.taxYearProcessing")}</CardTitle>
            <CardDescription>{t("payroll.yearEnd.taxYearProcessingSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payroll.yearEnd.taxYear")}</TableHead>
                  <TableHead>{t("payroll.yearEnd.employees")}</TableHead>
                  <TableHead>{t("payroll.yearEnd.totalWages")}</TableHead>
                  <TableHead>{t("payroll.yearEnd.taxesWithheld")}</TableHead>
                  <TableHead>{t("payroll.yearEnd.w2Status")}</TableHead>
                  <TableHead>{t("payroll.yearEnd.overallStatus")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearEnds.map((yearEnd) => (
                  <TableRow key={yearEnd.id}>
                    <TableCell className="font-medium">{yearEnd.tax_year}</TableCell>
                    <TableCell>{yearEnd.total_employees}</TableCell>
                    <TableCell>{formatCurrency(yearEnd.total_wages)}</TableCell>
                    <TableCell>{formatCurrency(yearEnd.total_taxes_withheld)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {yearEnd.w2_generated ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">
                          {yearEnd.w2_submitted
                            ? t("payroll.yearEnd.submitted")
                            : yearEnd.w2_generated
                              ? t("payroll.yearEnd.generated")
                              : t("payroll.yearEnd.pending")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(yearEnd.status)}>
                        {yearEnd.status.charAt(0).toUpperCase() + yearEnd.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => viewDetails(yearEnd)}>
                          {t("common.view")}
                        </Button>
                        {yearEnd.status === 'open' && (
                          <Button variant="outline" size="sm" onClick={() => handleGenerateW2s(yearEnd)}>
                            {t("payroll.yearEnd.generateW2s")}
                          </Button>
                        )}
                        {yearEnd.status === 'generated' && !yearEnd.w2_submitted && (
                          <Button variant="outline" size="sm" onClick={() => handleSubmitW2s(yearEnd)}>
                            {t("payroll.yearEnd.submitW2s")}
                          </Button>
                        )}
                        {yearEnd.status === 'submitted' && (
                          <Button variant="outline" size="sm" onClick={() => handleClose(yearEnd)}>
                            {t("payroll.yearEnd.closeYear")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {yearEnds.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("payroll.yearEnd.noYearEndRecords")}
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
              <DialogTitle>{t("payroll.yearEnd.startYearEndProcessing")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("payroll.yearEnd.taxYear")}</Label>
                <Input
                  type="number"
                  min={2020}
                  max={2030}
                  value={createForm.tax_year}
                  onChange={(e) => setCreateForm({ ...createForm, tax_year: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("payroll.yearEnd.processingNotes")}</Label>
                <Textarea
                  value={createForm.processing_notes}
                  onChange={(e) => setCreateForm({ ...createForm, processing_notes: e.target.value })}
                  placeholder={t("payroll.yearEnd.optionalNotes")}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCreate} disabled={isLoading}>
                {t("payroll.yearEnd.startProcessing")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("payroll.yearEnd.yearEndDetails", { year: selectedYearEnd?.tax_year })}</DialogTitle>
            </DialogHeader>
            {selectedYearEnd && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Users className="h-4 w-4" />
                      {t("payroll.yearEnd.employees")}
                    </div>
                    <p className="text-lg font-semibold">{selectedYearEnd.total_employees}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <DollarSign className="h-4 w-4" />
                      {t("payroll.yearEnd.totalWages")}
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(selectedYearEnd.total_wages)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <DollarSign className="h-4 w-4" />
                      {t("payroll.yearEnd.taxesWithheld")}
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(selectedYearEnd.total_taxes_withheld)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" />
                      {t("common.status")}
                    </div>
                    <Badge className={getStatusColor(selectedYearEnd.status)}>
                      {selectedYearEnd.status.charAt(0).toUpperCase() + selectedYearEnd.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">{t("payroll.yearEnd.w2Processing")}</h4>
                  <div className="flex items-center gap-3">
                    {selectedYearEnd.w2_generated ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span>{t("payroll.yearEnd.generatedOn", { date: selectedYearEnd.w2_generated_at && new Date(selectedYearEnd.w2_generated_at).toLocaleDateString() })}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-muted-foreground">{t("payroll.yearEnd.notYetGenerated")}</span>
                      </>
                    )}
                  </div>
                  {selectedYearEnd.w2_submitted && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span>{t("payroll.yearEnd.submittedOn", { date: selectedYearEnd.w2_submitted_at && new Date(selectedYearEnd.w2_submitted_at).toLocaleDateString() })}</span>
                    </div>
                  )}
                </div>

                {selectedYearEnd.processing_notes && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{t("common.notes")}</h4>
                    <p className="text-sm text-muted-foreground">{selectedYearEnd.processing_notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
