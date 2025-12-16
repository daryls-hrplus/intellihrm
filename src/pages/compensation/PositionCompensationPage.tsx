import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, Plus, Pencil, Trash2, Loader2, Briefcase } from "lucide-react";
import { useCompensation, PayElement, PositionCompensation, LookupValue } from "@/hooks/useCompensation";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Position {
  id: string;
  title: string;
  code: string;
  department?: { name: string };
  compensation_model: 'salary_grade' | 'spinal_point' | 'hybrid';
  pay_spine_id?: string;
  min_spinal_point?: number;
  max_spinal_point?: number;
  entry_spinal_point?: number;
  salary_grade_id?: string;
  salary_grade?: {
    id: string;
    name: string;
    code: string;
    min_salary: number;
    mid_salary: number;
    max_salary: number;
    currency: string;
  };
}

interface PaySpine {
  id: string;
  name: string;
  code: string;
  currency: string;
}

interface SpinalPoint {
  id: string;
  point_number: number;
  annual_salary: number;
}

export default function PositionCompensationPage() {
  const { t } = useTranslation();
  const {
    isLoading,
    fetchPayElements,
    fetchPositionCompensation,
    createPositionCompensation,
    updatePositionCompensation,
    deletePositionCompensation,
    fetchLookupValues,
  } = useCompensation();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [frequencies, setFrequencies] = useState<LookupValue[]>([]);
  const [compensation, setCompensation] = useState<PositionCompensation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PositionCompensation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paySpine, setPaySpine] = useState<PaySpine | null>(null);
  const [spinalPoints, setSpinalPoints] = useState<SpinalPoint[]>([]);

  // Form state
  const [formPayElementId, setFormPayElementId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formFrequencyId, setFormFrequencyId] = useState("");
  const [formEffectiveDate, setFormEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadPositions();
      loadPayElements();
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedPositionId) {
      loadCompensation();
      const pos = positions.find((p) => p.id === selectedPositionId);
      if (pos && (pos.compensation_model === 'spinal_point' || pos.compensation_model === 'hybrid')) {
        loadSpinalPointData(pos);
      } else {
        setPaySpine(null);
        setSpinalPoints([]);
      }
    } else {
      setCompensation([]);
      setPaySpine(null);
      setSpinalPoints([]);
    }
  }, [selectedPositionId]);

  const loadInitialData = async () => {
    const freq = await fetchLookupValues("payment_frequency");
    setFrequencies(freq);

    const { data: companiesData } = await supabase
      .from("companies")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name");

    if (companiesData && companiesData.length > 0) {
      setCompanies(companiesData);
      setSelectedCompanyId(companiesData[0].id);
    }
  };

  const loadPositions = async () => {
    const { data: deptData } = await supabase
      .from("departments")
      .select("id")
      .eq("company_id", selectedCompanyId)
      .eq("is_active", true);

    if (deptData && deptData.length > 0) {
      const deptIds = deptData.map((d) => d.id);
      const { data: posData } = await supabase
        .from("positions")
        .select(`
          id, title, code, 
          department:departments(name), 
          compensation_model, 
          pay_spine_id, min_spinal_point, max_spinal_point, entry_spinal_point,
          salary_grade_id,
          salary_grade:salary_grades(id, name, code, min_salary, mid_salary, max_salary, currency)
        `)
        .in("department_id", deptIds)
        .eq("is_active", true)
        .order("title");

      setPositions((posData as Position[]) || []);
      setSelectedPositionId("");
      setPaySpine(null);
      setSpinalPoints([]);
    } else {
      setPositions([]);
      setSelectedPositionId("");
      setPaySpine(null);
      setSpinalPoints([]);
    }
  };

  const loadSpinalPointData = async (position: Position) => {
    if (!position.pay_spine_id) {
      setPaySpine(null);
      setSpinalPoints([]);
      return;
    }

    // Fetch pay spine
    const { data: spineData } = await supabase
      .from("pay_spines")
      .select("id, name, code, currency")
      .eq("id", position.pay_spine_id)
      .single();

    if (spineData) {
      setPaySpine(spineData);
    }

    // Fetch spinal points within range
    let query = supabase
      .from("spinal_points")
      .select("id, point_number, annual_salary")
      .eq("pay_spine_id", position.pay_spine_id)
      .order("point_number");

    if (position.min_spinal_point !== undefined && position.min_spinal_point !== null) {
      query = query.gte("point_number", position.min_spinal_point);
    }
    if (position.max_spinal_point !== undefined && position.max_spinal_point !== null) {
      query = query.lte("point_number", position.max_spinal_point);
    }

    const { data: pointsData } = await query;
    setSpinalPoints((pointsData as SpinalPoint[]) || []);
  };

  const loadPayElements = async () => {
    const elements = await fetchPayElements(selectedCompanyId);
    setPayElements(elements.filter((e) => e.is_active));
  };

  const loadCompensation = async () => {
    const data = await fetchPositionCompensation(selectedPositionId);
    setCompensation(data);
  };

  const openCreate = () => {
    setEditing(null);
    setFormPayElementId("");
    setFormAmount("");
    setFormCurrency("USD");
    setFormFrequencyId("");
    setFormEffectiveDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setFormNotes("");
    setDialogOpen(true);
  };

  const openEdit = (comp: PositionCompensation) => {
    setEditing(comp);
    setFormPayElementId(comp.pay_element_id);
    setFormAmount(comp.amount.toString());
    setFormCurrency(comp.currency);
    setFormFrequencyId(comp.frequency_id || "");
    setFormEffectiveDate(comp.effective_date);
    setFormEndDate(comp.end_date || "");
    setFormNotes(comp.notes || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formPayElementId || !formAmount || !formEffectiveDate) return;

    setIsProcessing(true);
    const data = {
      position_id: selectedPositionId,
      pay_element_id: formPayElementId,
      amount: parseFloat(formAmount),
      currency: formCurrency,
      frequency_id: formFrequencyId || null,
      effective_date: formEffectiveDate,
      end_date: formEndDate || null,
      notes: formNotes.trim() || null,
      is_active: true,
    };

    let success: boolean;
    if (editing) {
      success = await updatePositionCompensation(editing.id, data);
    } else {
      success = await createPositionCompensation(data);
    }

    if (success) {
      setDialogOpen(false);
      loadCompensation();
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this compensation element?")) return;
    const success = await deletePositionCompensation(id);
    if (success) loadCompensation();
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const totalCompensation = compensation
    .filter((c) => c.is_active && !c.end_date)
    .reduce((sum, c) => sum + c.amount, 0);

  const selectedPosition = positions.find((p) => p.id === selectedPositionId);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("compensation.title"), href: "/compensation" },
            { label: t("compensation.positionCompensation.title") },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Wallet className="h-5 w-5 text-info" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("compensation.positionCompensation.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("compensation.positionCompensation.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("compensation.positionCompensation.company")}</Label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder={t("compensation.positionCompensation.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("compensation.positionCompensation.position")}</Label>
            <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
              <SelectTrigger>
                <SelectValue placeholder={t("compensation.positionCompensation.selectPosition")} />
              </SelectTrigger>
              <SelectContent>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} ({p.code}) - {p.department?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedPositionId && selectedPosition && (
          <>
            {/* Compensation Model Badge with Grade/Spine Info */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">{t("compensation.positionCompensation.compensationModel")}:</span>
              <Badge variant={
                selectedPosition.compensation_model === 'spinal_point' ? 'default' :
                selectedPosition.compensation_model === 'hybrid' ? 'secondary' : 'outline'
              }>
                {selectedPosition.compensation_model === 'salary_grade' && t("compensation.positionCompensation.salaryGrade")}
                {selectedPosition.compensation_model === 'spinal_point' && t("compensation.positionCompensation.spinalPoint")}
                {selectedPosition.compensation_model === 'hybrid' && t("compensation.positionCompensation.hybrid")}
              </Badge>
              
              {/* Show Salary Grade name and range for salary_grade model */}
              {selectedPosition.compensation_model === 'salary_grade' && selectedPosition.salary_grade && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-sm font-medium">
                    {selectedPosition.salary_grade.name} ({selectedPosition.salary_grade.code})
                  </span>
                  <Badge variant="outline" className="font-mono">
                    {formatCurrency(selectedPosition.salary_grade.min_salary, selectedPosition.salary_grade.currency)} - {formatCurrency(selectedPosition.salary_grade.max_salary, selectedPosition.salary_grade.currency)}
                  </Badge>
                </>
              )}
              
              {/* Show Pay Spine name and range for spinal_point model */}
              {selectedPosition.compensation_model === 'spinal_point' && paySpine && spinalPoints.length > 0 && (
                <>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-sm font-medium">
                    {paySpine.name} ({paySpine.code})
                  </span>
                  <Badge variant="outline" className="font-mono">
                    {formatCurrency(spinalPoints[0].annual_salary, paySpine.currency)} - {formatCurrency(spinalPoints[spinalPoints.length - 1].annual_salary, paySpine.currency)}
                  </Badge>
                </>
              )}
            </div>

            {/* Salary Grade Info Card - show for salary_grade or hybrid */}
            {(selectedPosition.compensation_model === 'salary_grade' || selectedPosition.compensation_model === 'hybrid') && selectedPosition.salary_grade && (
              <Card className="border-info/20 bg-info/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    {t("compensation.positionCompensation.salaryGradeBase")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.grade")}</p>
                      <p className="font-medium">{selectedPosition.salary_grade.name} ({selectedPosition.salary_grade.code})</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.minSalary")}</p>
                      <p className="font-medium">{formatCurrency(selectedPosition.salary_grade.min_salary, selectedPosition.salary_grade.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.midSalary")}</p>
                      <p className="font-medium">{formatCurrency(selectedPosition.salary_grade.mid_salary, selectedPosition.salary_grade.currency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.maxSalary")}</p>
                      <p className="font-medium">{formatCurrency(selectedPosition.salary_grade.max_salary, selectedPosition.salary_grade.currency)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Spinal Point Info Card - show for spinal_point or hybrid */}
            {(selectedPosition.compensation_model === 'spinal_point' || selectedPosition.compensation_model === 'hybrid') && paySpine && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    {t("compensation.positionCompensation.spinalPointBase")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("compensation.spinalPoints.paySpine")}</p>
                      <p className="font-medium">{paySpine.name} ({paySpine.code})</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.pointRange")}</p>
                      <p className="font-medium">
                        {selectedPosition.min_spinal_point ?? '-'} - {selectedPosition.max_spinal_point ?? '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.entryPoint")}</p>
                      <p className="font-medium">{selectedPosition.entry_spinal_point ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.salaryRange")}</p>
                      <p className="font-medium">
                        {spinalPoints.length > 0 ? (
                          <>
                            {formatCurrency(spinalPoints[0].annual_salary, paySpine.currency)} - {formatCurrency(spinalPoints[spinalPoints.length - 1].annual_salary, paySpine.currency)}
                          </>
                        ) : '-'}
                      </p>
                    </div>
                  </div>
                  {spinalPoints.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">{t("compensation.positionCompensation.availablePoints")}</p>
                      <div className="flex flex-wrap gap-2">
                        {spinalPoints.map((sp) => (
                          <Badge key={sp.id} variant="outline" className="font-mono">
                            Pt {sp.point_number}: {formatCurrency(sp.annual_salary, paySpine.currency)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between">
              <Card className="w-fit">
                <CardContent className="flex items-center gap-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedPosition.compensation_model === 'spinal_point' 
                        ? t("compensation.positionCompensation.additionalElements")
                        : t("compensation.positionCompensation.totalPackage")}
                    </p>
                    <p className="text-2xl font-bold">{formatCurrency(totalCompensation, "USD")}</p>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                {t("compensation.positionCompensation.addPayElement")}
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("compensation.positionCompensation.compensationFor")}: {selectedPosition?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : compensation.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {t("compensation.positionCompensation.noElements")}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("compensation.positionCompensation.payElement")}</TableHead>
                        <TableHead>{t("compensation.positionCompensation.type")}</TableHead>
                        <TableHead className="text-right">{t("compensation.positionCompensation.amount")}</TableHead>
                        <TableHead>{t("compensation.positionCompensation.frequency")}</TableHead>
                        <TableHead>{t("compensation.positionCompensation.effective")}</TableHead>
                        <TableHead>{t("compensation.positionCompensation.status")}</TableHead>
                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compensation.map((comp) => (
                        <TableRow key={comp.id}>
                          <TableCell className="font-medium">
                            {comp.pay_element?.name || "-"}
                          </TableCell>
                          <TableCell>
                            {comp.pay_element?.element_type?.name || "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(comp.amount, comp.currency)}
                          </TableCell>
                          <TableCell>
                            {comp.frequency?.name || "Monthly"}
                          </TableCell>
                          <TableCell>{comp.effective_date}</TableCell>
                          <TableCell>
                            <Badge variant={comp.is_active && !comp.end_date ? "default" : "secondary"}>
                              {comp.is_active && !comp.end_date ? t("compensation.statuses.active") : t("compensation.statuses.inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(comp)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(comp.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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
          </>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? t("compensation.positionCompensation.dialog.editTitle") : t("compensation.positionCompensation.dialog.createTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("compensation.positionCompensation.dialog.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Salary Range Section - Show at top when position has grade/spine */}
              {selectedPosition && (
                (selectedPosition.compensation_model === 'salary_grade' || selectedPosition.compensation_model === 'hybrid') && selectedPosition.salary_grade ? (
                  <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.salaryGrade")}</p>
                        <p className="font-medium">{selectedPosition.salary_grade.name} ({selectedPosition.salary_grade.code})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.salaryRange")}</p>
                        <p className="font-mono font-semibold">
                          {formatCurrency(selectedPosition.salary_grade.min_salary, selectedPosition.salary_grade.currency)} — {formatCurrency(selectedPosition.salary_grade.max_salary, selectedPosition.salary_grade.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : selectedPosition.compensation_model === 'spinal_point' && paySpine && spinalPoints.length > 0 ? (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.paySpine")}</p>
                        <p className="font-medium">{paySpine.name} ({paySpine.code})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.salaryRange")}</p>
                        <p className="font-mono font-semibold">
                          {formatCurrency(spinalPoints[0].annual_salary, paySpine.currency)} — {formatCurrency(spinalPoints[spinalPoints.length - 1].annual_salary, paySpine.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null
              )}

              {/* Separator when salary range is shown */}
              {selectedPosition && (
                ((selectedPosition.compensation_model === 'salary_grade' || selectedPosition.compensation_model === 'hybrid') && selectedPosition.salary_grade) ||
                (selectedPosition.compensation_model === 'spinal_point' && paySpine && spinalPoints.length > 0)
              ) && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t("compensation.positionCompensation.payElements")}
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>{t("compensation.positionCompensation.payElement")} *</Label>
                <Select value={formPayElementId} onValueChange={setFormPayElementId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("compensation.positionCompensation.dialog.selectPayElement")} />
                  </SelectTrigger>
                  <SelectContent>
                    {payElements.map((pe) => (
                      <SelectItem key={pe.id} value={pe.id}>
                        {pe.name} ({pe.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show element type when a pay element is selected */}
              {formPayElementId && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-sm text-muted-foreground">{t("compensation.positionCompensation.type")}</p>
                  <p className="font-medium">
                    {payElements.find(pe => pe.id === formPayElementId)?.element_type?.name || "-"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("compensation.positionCompensation.amount")} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.currency")}</Label>
                  <Select value={formCurrency} onValueChange={setFormCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("compensation.positionCompensation.dialog.paymentFrequency")}</Label>
                <Select value={formFrequencyId} onValueChange={setFormFrequencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("compensation.positionCompensation.dialog.selectFrequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">{t("compensation.positionCompensation.dialog.effectiveDate")} *</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formEffectiveDate}
                    onChange={(e) => setFormEffectiveDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("common.endDate")}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("compensation.positionCompensation.dialog.notes")}</Label>
                <Input
                  id="notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={t("compensation.positionCompensation.dialog.notesPlaceholder")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isProcessing}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? t("common.update") : t("common.add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
