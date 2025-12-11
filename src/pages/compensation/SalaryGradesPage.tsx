import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Layers, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useCompensation, SalaryGrade } from "@/hooks/useCompensation";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function SalaryGradesPage() {
  const {
    isLoading,
    fetchSalaryGrades,
    createSalaryGrade,
    updateSalaryGrade,
    deleteSalaryGrade,
  } = useCompensation();

  const [grades, setGrades] = useState<SalaryGrade[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryGrade | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMinSalary, setFormMinSalary] = useState("");
  const [formMidSalary, setFormMidSalary] = useState("");
  const [formMaxSalary, setFormMaxSalary] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadGrades();
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name");

    if (data && data.length > 0) {
      setCompanies(data);
      setSelectedCompanyId(data[0].id);
    }
  };

  const loadGrades = async () => {
    const data = await fetchSalaryGrades(selectedCompanyId);
    setGrades(data);
  };

  const openCreate = () => {
    setEditing(null);
    setFormCode("");
    setFormName("");
    setFormDescription("");
    setFormMinSalary("");
    setFormMidSalary("");
    setFormMaxSalary("");
    setFormCurrency("USD");
    setFormIsActive(true);
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setDialogOpen(true);
  };

  const openEdit = (grade: SalaryGrade) => {
    setEditing(grade);
    setFormCode(grade.code);
    setFormName(grade.name);
    setFormDescription(grade.description || "");
    setFormMinSalary(grade.min_salary?.toString() || "");
    setFormMidSalary(grade.mid_salary?.toString() || "");
    setFormMaxSalary(grade.max_salary?.toString() || "");
    setFormCurrency(grade.currency);
    setFormIsActive(grade.is_active);
    setFormStartDate(grade.start_date || new Date().toISOString().split("T")[0]);
    setFormEndDate(grade.end_date || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formCode.trim() || !formName.trim()) return;

    setIsProcessing(true);
    const data = {
      code: formCode.trim(),
      name: formName.trim(),
      description: formDescription.trim() || null,
      min_salary: formMinSalary ? parseFloat(formMinSalary) : null,
      mid_salary: formMidSalary ? parseFloat(formMidSalary) : null,
      max_salary: formMaxSalary ? parseFloat(formMaxSalary) : null,
      currency: formCurrency,
      company_id: selectedCompanyId || null,
      is_active: formIsActive,
      start_date: formStartDate,
      end_date: formEndDate || null,
    };

    let success: boolean;
    if (editing) {
      success = await updateSalaryGrade(editing.id, data);
    } else {
      success = await createSalaryGrade(data);
    }

    if (success) {
      setDialogOpen(false);
      loadGrades();
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this salary grade?")) return;
    const success = await deleteSalaryGrade(id);
    if (success) loadGrades();
  };

  const formatCurrency = (value: number | null, currency: string) => {
    if (value === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Compensation", href: "/compensation" },
            { label: "Salary Grades" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Layers className="h-5 w-5 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Salary Grades
              </h1>
              <p className="text-muted-foreground">
                Define salary bands and compensation ranges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
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
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Grade
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : grades.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No salary grades found. Create one to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Min</TableHead>
                    <TableHead className="text-right">Mid</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-mono text-sm">
                        {grade.code}
                      </TableCell>
                      <TableCell className="font-medium">{grade.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(grade.min_salary, grade.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(grade.mid_salary, grade.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(grade.max_salary, grade.currency)}
                      </TableCell>
                      <TableCell>{grade.start_date}</TableCell>
                      <TableCell>{grade.end_date || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={grade.is_active ? "default" : "secondary"}>
                          {grade.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(grade)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(grade.id)}
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Salary Grade" : "Create Salary Grade"}
              </DialogTitle>
              <DialogDescription>
                Define the salary range for this grade
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g., G1, L5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Grade 1, Level 5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={formCurrency} onValueChange={setFormCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                    <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minSalary">Minimum</Label>
                  <Input
                    id="minSalary"
                    type="number"
                    value={formMinSalary}
                    onChange={(e) => setFormMinSalary(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="midSalary">Midpoint</Label>
                  <Input
                    id="midSalary"
                    type="number"
                    value={formMidSalary}
                    onChange={(e) => setFormMidSalary(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSalary">Maximum</Label>
                  <Input
                    id="maxSalary"
                    type="number"
                    value={formMaxSalary}
                    onChange={(e) => setFormMaxSalary(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
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

              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isProcessing}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
