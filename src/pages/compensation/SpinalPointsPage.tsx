import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Company {
  id: string;
  name: string;
}

interface PaySpine {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  effective_date: string;
  end_date: string | null;
  currency: string;
  is_active: boolean;
}

interface SpinalPoint {
  id: string;
  pay_spine_id: string;
  point_number: number;
  annual_salary: number;
  hourly_rate: number | null;
  effective_date: string;
  end_date: string | null;
  notes: string | null;
}

export default function SpinalPointsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [paySpines, setPaySpines] = useState<PaySpine[]>([]);
  const [spinalPoints, setSpinalPoints] = useState<Record<string, SpinalPoint[]>>({});
  const [expandedSpines, setExpandedSpines] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Spine dialog state
  const [spineDialogOpen, setSpineDialogOpen] = useState(false);
  const [editingSpine, setEditingSpine] = useState<PaySpine | null>(null);
  const [spineForm, setSpineForm] = useState({
    name: "",
    code: "",
    description: "",
    effective_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    currency: "GBP",
    is_active: true,
  });

  // Point dialog state
  const [pointDialogOpen, setPointDialogOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<SpinalPoint | null>(null);
  const [selectedSpineId, setSelectedSpineId] = useState<string>("");
  const [pointForm, setPointForm] = useState({
    point_number: "",
    annual_salary: "",
    hourly_rate: "",
    effective_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    notes: "",
  });

  const breadcrumbItems = [
    { label: "Compensation", href: "/compensation" },
    { label: "Spinal Points" },
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadPaySpines();
    }
  }, [selectedCompanyId]);

  async function loadCompanies() {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    
    if (data && data.length > 0) {
      setCompanies(data);
      setSelectedCompanyId(data[0].id);
    }
    setIsLoading(false);
  }

  async function loadPaySpines() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("pay_spines")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .order("code");

    if (error) {
      toast.error("Failed to load pay spines");
    } else {
      setPaySpines(data || []);
    }
    setIsLoading(false);
  }

  async function loadSpinalPoints(spineId: string) {
    const { data, error } = await supabase
      .from("spinal_points")
      .select("*")
      .eq("pay_spine_id", spineId)
      .order("point_number");

    if (!error && data) {
      setSpinalPoints(prev => ({ ...prev, [spineId]: data }));
    }
  }

  function toggleSpine(spineId: string) {
    const newExpanded = new Set(expandedSpines);
    if (newExpanded.has(spineId)) {
      newExpanded.delete(spineId);
    } else {
      newExpanded.add(spineId);
      if (!spinalPoints[spineId]) {
        loadSpinalPoints(spineId);
      }
    }
    setExpandedSpines(newExpanded);
  }

  function openSpineDialog(spine?: PaySpine) {
    if (spine) {
      setEditingSpine(spine);
      setSpineForm({
        name: spine.name,
        code: spine.code,
        description: spine.description || "",
        effective_date: spine.effective_date,
        end_date: spine.end_date || "",
        currency: spine.currency,
        is_active: spine.is_active,
      });
    } else {
      setEditingSpine(null);
      setSpineForm({
        name: "",
        code: "",
        description: "",
        effective_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        currency: "GBP",
        is_active: true,
      });
    }
    setSpineDialogOpen(true);
  }

  function openPointDialog(spineId: string, point?: SpinalPoint) {
    setSelectedSpineId(spineId);
    if (point) {
      setEditingPoint(point);
      setPointForm({
        point_number: point.point_number.toString(),
        annual_salary: point.annual_salary.toString(),
        hourly_rate: point.hourly_rate?.toString() || "",
        effective_date: point.effective_date,
        end_date: point.end_date || "",
        notes: point.notes || "",
      });
    } else {
      setEditingPoint(null);
      const existingPoints = spinalPoints[spineId] || [];
      const nextPoint = existingPoints.length > 0 
        ? Math.max(...existingPoints.map(p => p.point_number)) + 1 
        : 1;
      setPointForm({
        point_number: nextPoint.toString(),
        annual_salary: "",
        hourly_rate: "",
        effective_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        notes: "",
      });
    }
    setPointDialogOpen(true);
  }

  async function handleSaveSpine() {
    if (!spineForm.name || !spineForm.code) {
      toast.error("Name and code are required");
      return;
    }

    setIsSaving(true);
    const payload = {
      company_id: selectedCompanyId,
      name: spineForm.name,
      code: spineForm.code,
      description: spineForm.description || null,
      effective_date: spineForm.effective_date,
      end_date: spineForm.end_date || null,
      currency: spineForm.currency,
      is_active: spineForm.is_active,
    };

    let error;
    if (editingSpine) {
      ({ error } = await supabase
        .from("pay_spines")
        .update(payload)
        .eq("id", editingSpine.id));
    } else {
      ({ error } = await supabase.from("pay_spines").insert(payload));
    }

    if (error) {
      toast.error("Failed to save pay spine");
    } else {
      toast.success(editingSpine ? "Pay spine updated" : "Pay spine created");
      setSpineDialogOpen(false);
      loadPaySpines();
    }
    setIsSaving(false);
  }

  async function handleDeleteSpine(spine: PaySpine) {
    if (!confirm(`Delete pay spine "${spine.name}"? This will also delete all spinal points.`)) {
      return;
    }

    const { error } = await supabase.from("pay_spines").delete().eq("id", spine.id);
    if (error) {
      toast.error("Failed to delete pay spine");
    } else {
      toast.success("Pay spine deleted");
      loadPaySpines();
    }
  }

  async function handleSavePoint() {
    if (!pointForm.point_number || !pointForm.annual_salary) {
      toast.error("Point number and annual salary are required");
      return;
    }

    setIsSaving(true);
    const payload = {
      pay_spine_id: selectedSpineId,
      point_number: parseInt(pointForm.point_number),
      annual_salary: parseFloat(pointForm.annual_salary),
      hourly_rate: pointForm.hourly_rate ? parseFloat(pointForm.hourly_rate) : null,
      effective_date: pointForm.effective_date,
      end_date: pointForm.end_date || null,
      notes: pointForm.notes || null,
    };

    let error;
    if (editingPoint) {
      ({ error } = await supabase
        .from("spinal_points")
        .update(payload)
        .eq("id", editingPoint.id));
    } else {
      ({ error } = await supabase.from("spinal_points").insert(payload));
    }

    if (error) {
      toast.error("Failed to save spinal point");
    } else {
      toast.success(editingPoint ? "Spinal point updated" : "Spinal point created");
      setPointDialogOpen(false);
      loadSpinalPoints(selectedSpineId);
    }
    setIsSaving(false);
  }

  async function handleDeletePoint(point: SpinalPoint) {
    if (!confirm(`Delete point ${point.point_number}?`)) return;

    const { error } = await supabase.from("spinal_points").delete().eq("id", point.id);
    if (error) {
      toast.error("Failed to delete spinal point");
    } else {
      toast.success("Spinal point deleted");
      loadSpinalPoints(point.pay_spine_id);
    }
  }

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
    }).format(amount);
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Spinal Points</h1>
            <p className="text-muted-foreground">
              Manage pay spines and spinal point salary scales
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => openSpineDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Pay Spine
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pay Spines</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : paySpines.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pay spines found. Create one to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {paySpines.map((spine) => (
                  <Collapsible
                    key={spine.id}
                    open={expandedSpines.has(spine.id)}
                    onOpenChange={() => toggleSpine(spine.id)}
                  >
                    <div className="border rounded-lg">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            {expandedSpines.has(spine.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <div>
                              <p className="font-medium">
                                {spine.name}{" "}
                                <span className="text-muted-foreground">({spine.code})</span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {spine.currency} • Effective: {spine.effective_date}
                                {!spine.is_active && " • Inactive"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openSpineDialog(spine)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSpine(spine)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-t p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Spinal Points</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPointDialog(spine.id)}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Add Point
                            </Button>
                          </div>
                          {!spinalPoints[spine.id] ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : spinalPoints[spine.id].length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No spinal points defined
                            </p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-20">Point</TableHead>
                                  <TableHead>Annual Salary</TableHead>
                                  <TableHead>Hourly Rate</TableHead>
                                  <TableHead>Effective Date</TableHead>
                                  <TableHead>End Date</TableHead>
                                  <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {spinalPoints[spine.id].map((point) => (
                                  <TableRow key={point.id}>
                                    <TableCell className="font-medium">
                                      SCP {point.point_number}
                                    </TableCell>
                                    <TableCell>
                                      {formatCurrency(point.annual_salary, spine.currency)}
                                    </TableCell>
                                    <TableCell>
                                      {point.hourly_rate
                                        ? formatCurrency(point.hourly_rate, spine.currency)
                                        : "-"}
                                    </TableCell>
                                    <TableCell>{point.effective_date}</TableCell>
                                    <TableCell>{point.end_date || "-"}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => openPointDialog(spine.id, point)}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={() => handleDeletePoint(point)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pay Spine Dialog */}
        <Dialog open={spineDialogOpen} onOpenChange={setSpineDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSpine ? "Edit Pay Spine" : "Create Pay Spine"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={spineForm.name}
                    onChange={(e) => setSpineForm({ ...spineForm, name: e.target.value })}
                    placeholder="e.g., NJC Pay Spine"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={spineForm.code}
                    onChange={(e) => setSpineForm({ ...spineForm, code: e.target.value })}
                    placeholder="e.g., NJC-2024"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={spineForm.description}
                  onChange={(e) => setSpineForm({ ...spineForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={spineForm.currency}
                    onValueChange={(v) => setSpineForm({ ...spineForm, currency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={spineForm.effective_date}
                    onChange={(e) => setSpineForm({ ...spineForm, effective_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={spineForm.end_date}
                    onChange={(e) => setSpineForm({ ...spineForm, end_date: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={spineForm.is_active}
                    onCheckedChange={(v) => setSpineForm({ ...spineForm, is_active: v })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSpineDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSpine} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSpine ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Spinal Point Dialog */}
        <Dialog open={pointDialogOpen} onOpenChange={setPointDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPoint ? "Edit Spinal Point" : "Add Spinal Point"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Point Number *</Label>
                  <Input
                    type="number"
                    value={pointForm.point_number}
                    onChange={(e) => setPointForm({ ...pointForm, point_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Annual Salary *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pointForm.annual_salary}
                    onChange={(e) => setPointForm({ ...pointForm, annual_salary: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate (optional)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={pointForm.hourly_rate}
                  onChange={(e) => setPointForm({ ...pointForm, hourly_rate: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={pointForm.effective_date}
                    onChange={(e) => setPointForm({ ...pointForm, effective_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={pointForm.end_date}
                    onChange={(e) => setPointForm({ ...pointForm, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={pointForm.notes}
                  onChange={(e) => setPointForm({ ...pointForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPointDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePoint} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPoint ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
