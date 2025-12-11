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
import { Coins, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useCompensation, PayElement, LookupValue } from "@/hooks/useCompensation";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function PayElementsPage() {
  const {
    isLoading,
    fetchPayElements,
    createPayElement,
    updatePayElement,
    deletePayElement,
    fetchLookupValues,
  } = useCompensation();

  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [elementTypes, setElementTypes] = useState<LookupValue[]>([]);
  const [prorationMethods, setProrationMethods] = useState<LookupValue[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PayElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formElementTypeId, setFormElementTypeId] = useState("");
  const [formProrationMethodId, setFormProrationMethodId] = useState("");
  const [formIsTaxable, setFormIsTaxable] = useState(true);
  const [formIsPensionable, setFormIsPensionable] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState("0");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadPayElements();
    }
  }, [selectedCompanyId]);

  const loadInitialData = async () => {
    const [types, methods] = await Promise.all([
      fetchLookupValues("pay_element_type"),
      fetchLookupValues("proration_method"),
    ]);
    setElementTypes(types);
    setProrationMethods(methods);

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

  const loadPayElements = async () => {
    const data = await fetchPayElements(selectedCompanyId);
    setPayElements(data);
  };

  const openCreate = () => {
    setEditing(null);
    setFormCode("");
    setFormName("");
    setFormDescription("");
    setFormElementTypeId("");
    setFormProrationMethodId("");
    setFormIsTaxable(true);
    setFormIsPensionable(false);
    setFormIsActive(true);
    setFormDisplayOrder("0");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setDialogOpen(true);
  };

  const openEdit = (element: PayElement) => {
    setEditing(element);
    setFormCode(element.code);
    setFormName(element.name);
    setFormDescription(element.description || "");
    setFormElementTypeId(element.element_type_id || "");
    setFormProrationMethodId(element.proration_method_id || "");
    setFormIsTaxable(element.is_taxable);
    setFormIsPensionable(element.is_pensionable);
    setFormIsActive(element.is_active);
    setFormDisplayOrder(element.display_order.toString());
    setFormStartDate(element.start_date || new Date().toISOString().split("T")[0]);
    setFormEndDate(element.end_date || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formCode.trim() || !formName.trim()) {
      return;
    }

    setIsProcessing(true);
    const data = {
      code: formCode.trim(),
      name: formName.trim(),
      description: formDescription.trim() || null,
      element_type_id: formElementTypeId || null,
      proration_method_id: formProrationMethodId || null,
      is_taxable: formIsTaxable,
      is_pensionable: formIsPensionable,
      is_active: formIsActive,
      company_id: selectedCompanyId || null,
      display_order: parseInt(formDisplayOrder) || 0,
      start_date: formStartDate,
      end_date: formEndDate || null,
    };

    let success: boolean;
    if (editing) {
      success = await updatePayElement(editing.id, data);
    } else {
      success = await createPayElement(data);
    }

    if (success) {
      setDialogOpen(false);
      loadPayElements();
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pay element?")) return;
    const success = await deletePayElement(id);
    if (success) loadPayElements();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Compensation", href: "/compensation" },
            { label: "Pay Elements" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Pay Elements
              </h1>
              <p className="text-muted-foreground">
                Manage salary, wages, allowances, and benefits
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
              Add Pay Element
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : payElements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No pay elements found. Create one to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Proration</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payElements.map((element) => (
                    <TableRow key={element.id}>
                      <TableCell className="font-mono text-sm">
                        {element.code}
                      </TableCell>
                      <TableCell className="font-medium">{element.name}</TableCell>
                      <TableCell>
                        {element.element_type?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {element.proration_method?.name || "None"}
                      </TableCell>
                      <TableCell>{element.start_date}</TableCell>
                      <TableCell>{element.end_date || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={element.is_active ? "default" : "secondary"}>
                          {element.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(element)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(element.id)}
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
                {editing ? "Edit Pay Element" : "Create Pay Element"}
              </DialogTitle>
              <DialogDescription>
                Configure the pay element details and properties
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
                    placeholder="e.g., BASE_SALARY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Basic Salary"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Element Type</Label>
                  <Select value={formElementTypeId} onValueChange={setFormElementTypeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {elementTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Proration Method</Label>
                  <Select value={formProrationMethodId} onValueChange={setFormProrationMethodId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {prorationMethods.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="taxable"
                    checked={formIsTaxable}
                    onCheckedChange={setFormIsTaxable}
                  />
                  <Label htmlFor="taxable">Taxable</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="pensionable"
                    checked={formIsPensionable}
                    onCheckedChange={setFormIsPensionable}
                  />
                  <Label htmlFor="pensionable">Pensionable</Label>
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
