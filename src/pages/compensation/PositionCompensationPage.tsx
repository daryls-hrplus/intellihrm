import { useState, useEffect } from "react";
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
}

export default function PositionCompensationPage() {
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
    } else {
      setCompensation([]);
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
        .select("id, title, code, department:departments(name)")
        .in("department_id", deptIds)
        .eq("is_active", true)
        .order("title");

      setPositions(posData || []);
      setSelectedPositionId("");
    } else {
      setPositions([]);
      setSelectedPositionId("");
    }
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
            { label: "Compensation", href: "/compensation" },
            { label: "Position Compensation" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Wallet className="h-5 w-5 text-info" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Position Compensation
              </h1>
              <p className="text-muted-foreground">
                Define compensation structure for job positions
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
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
            <Label>Position</Label>
            <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
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

        {selectedPositionId && (
          <>
            <div className="flex items-center justify-between">
              <Card className="w-fit">
                <CardContent className="flex items-center gap-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Package</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalCompensation, "USD")}</p>
                  </div>
                </CardContent>
              </Card>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Pay Element
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Compensation for: {selectedPosition?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : compensation.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No compensation elements defined for this position.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pay Element</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Effective</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                              {comp.is_active && !comp.end_date ? "Active" : "Ended"}
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
                {editing ? "Edit Compensation" : "Add Compensation"}
              </DialogTitle>
              <DialogDescription>
                Configure compensation element for this position
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pay Element *</Label>
                <Select value={formPayElementId} onValueChange={setFormPayElementId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay element" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
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
                <Label>Payment Frequency</Label>
                <Select value={formFrequencyId} onValueChange={setFormFrequencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
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
                  <Label htmlFor="effectiveDate">Effective Date *</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formEffectiveDate}
                    onChange={(e) => setFormEffectiveDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isProcessing}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
