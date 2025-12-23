import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
interface PayElement {
  id: string;
  name: string;
  code: string;
}

interface TransactionPayrollMapping {
  id: string;
  company_id: string;
  transaction_type: string;
  pay_element_id: string;
  mapping_type: string;
  is_active: boolean;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  pay_element?: PayElement;
}

const TRANSACTION_TYPES = [
  { value: "HIRE", label: "Hire" },
  { value: "REHIRE", label: "Rehire" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "DEMOTION", label: "Demotion" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "SALARY_CHANGE", label: "Salary Change" },
  { value: "JOB_CHANGE", label: "Job Change" },
  { value: "PROBATION_EXTENSION", label: "Probation Extension" },
  { value: "CONFIRMATION", label: "Confirmation" },
  { value: "CONTRACT_RENEWAL", label: "Contract Renewal" },
  { value: "ACTING_APPOINTMENT", label: "Acting Appointment" },
  { value: "SECONDMENT", label: "Secondment" },
  { value: "LEAVE_OF_ABSENCE", label: "Leave of Absence" },
  { value: "RETURN_FROM_LEAVE", label: "Return from Leave" },
  { value: "SUSPENSION", label: "Suspension" },
  { value: "REINSTATEMENT", label: "Reinstatement" },
  { value: "SEPARATION", label: "Separation" },
  { value: "RETIREMENT", label: "Retirement" },
];

const MAPPING_TYPES = [
  { value: "earning", label: "Earning" },
  { value: "deduction", label: "Deduction" },
  { value: "employer_contribution", label: "Employer Contribution" },
  { value: "allowance", label: "Allowance" },
  { value: "bonus", label: "Bonus" },
];

export default function EmployeeTransactionPayrollMappingsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [mappings, setMappings] = useState<TransactionPayrollMapping[]>([]);
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<TransactionPayrollMapping | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    transaction_type: "",
    pay_element_id: "",
    mapping_type: "earning",
    is_active: true,
    notes: "",
    start_date: getTodayString(),
    end_date: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchData();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    if (data) {
      setCompanies(data);
      if (data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0].id);
      }
    }
  };

  const fetchData = async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
      const [mappingsRes, elementsRes] = await Promise.all([
        supabase
          .from("employee_transaction_payroll_mappings")
          .select(`
            *,
            pay_element:pay_elements(id, name, code)
          `)
          .eq("company_id", selectedCompany)
          .order("transaction_type"),
        supabase
          .from("pay_elements")
          .select("id, name, code")
          .eq("company_id", selectedCompany)
          .eq("is_active", true)
          .order("name"),
      ]);

      if (mappingsRes.error) throw mappingsRes.error;
      if (elementsRes.error) throw elementsRes.error;

      setMappings(mappingsRes.data || []);
      setPayElements(elementsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (mapping?: TransactionPayrollMapping) => {
    if (mapping) {
      setEditingMapping(mapping);
      setFormData({
        transaction_type: mapping.transaction_type,
        pay_element_id: mapping.pay_element_id,
        mapping_type: mapping.mapping_type,
        is_active: mapping.is_active,
        notes: mapping.notes || "",
        start_date: mapping.start_date,
        end_date: mapping.end_date || "",
      });
    } else {
      setEditingMapping(null);
      setFormData({
        transaction_type: "",
        pay_element_id: "",
        mapping_type: "earning",
        is_active: true,
        notes: "",
        start_date: getTodayString(),
        end_date: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.transaction_type || !formData.pay_element_id) {
      toast.error("Please select both a transaction type and pay element");
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        company_id: selectedCompany,
        transaction_type: formData.transaction_type,
        pay_element_id: formData.pay_element_id,
        mapping_type: formData.mapping_type,
        is_active: formData.is_active,
        notes: formData.notes || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
      };

      if (editingMapping) {
        const { error } = await supabase
          .from("employee_transaction_payroll_mappings")
          .update(data)
          .eq("id", editingMapping.id);
        if (error) throw error;
        toast.success("Mapping updated successfully");
      } else {
        const { error } = await supabase
          .from("employee_transaction_payroll_mappings")
          .insert(data);
        if (error) throw error;
        toast.success("Mapping created successfully");
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving mapping:", error);
      if (error.code === "23505") {
        toast.error("This mapping already exists");
      } else {
        toast.error("Failed to save mapping");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mapping?")) return;

    try {
      const { error } = await supabase
        .from("employee_transaction_payroll_mappings")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Mapping deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting mapping:", error);
      toast.error("Failed to delete mapping");
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const found = TRANSACTION_TYPES.find(t => t.value === type);
    return found?.label || type;
  };

  const getMappingTypeLabel = (type: string) => {
    const found = MAPPING_TYPES.find(t => t.value === type);
    return found?.label || type;
  };

  const getMappingTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "earning":
        return "default";
      case "deduction":
        return "destructive";
      case "employer_contribution":
        return "secondary";
      case "allowance":
        return "outline";
      case "bonus":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {t("payroll.transactionMapping.title", "Employee Transaction Payroll Mappings")}
          </h1>
          <p className="text-muted-foreground">
            {t("payroll.transactionMapping.description", "Map workforce employee transactions to pay element codes")}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="w-64">
            <Label>{t("common.company", "Company")}</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder={t("common.selectCompany", "Select company")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedCompany && (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            {t("payroll.transactionMapping.mappings", "Transaction Mappings")}
          </CardTitle>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            {t("common.add", "Add Mapping")}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : mappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("payroll.transactionMapping.noMappings", "No transaction payroll mappings configured")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payroll.transactionMapping.transactionType", "Transaction Type")}</TableHead>
                  <TableHead>{t("payroll.transactionMapping.payElement", "Pay Element")}</TableHead>
                  <TableHead>{t("payroll.transactionMapping.mappingType", "Mapping Type")}</TableHead>
                  <TableHead>{t("common.status", "Status")}</TableHead>
                  <TableHead>{t("common.startDate", "Start Date")}</TableHead>
                  <TableHead>{t("common.endDate", "End Date")}</TableHead>
                  <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {getTransactionTypeLabel(mapping.transaction_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{mapping.pay_element?.name}</div>
                        <div className="text-sm text-muted-foreground">{mapping.pay_element?.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getMappingTypeBadgeVariant(mapping.mapping_type) as any}>
                        {getMappingTypeLabel(mapping.mapping_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={mapping.is_active ? "default" : "secondary"}>
                        {mapping.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateForDisplay(mapping.start_date, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {mapping.end_date ? formatDateForDisplay(mapping.end_date, "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(mapping)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(mapping.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMapping
                ? t("payroll.transactionMapping.editMapping", "Edit Transaction Mapping")
                : t("payroll.transactionMapping.addMapping", "Add Transaction Mapping")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("payroll.transactionMapping.transactionType", "Transaction Type")}</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.transactionMapping.selectTransactionType", "Select transaction type")} />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.transactionMapping.payElement", "Pay Element")}</Label>
              <Select
                value={formData.pay_element_id}
                onValueChange={(value) => setFormData({ ...formData, pay_element_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.transactionMapping.selectPayElement", "Select pay element")} />
                </SelectTrigger>
                <SelectContent>
                  {payElements.map((element) => (
                    <SelectItem key={element.id} value={element.id}>
                      {element.name} ({element.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.transactionMapping.mappingType", "Mapping Type")}</Label>
              <Select
                value={formData.mapping_type}
                onValueChange={(value) => setFormData({ ...formData, mapping_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAPPING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.startDate", "Start Date")}</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("common.endDate", "End Date")}</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("common.notes", "Notes")}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t("payroll.transactionMapping.notesPlaceholder", "Optional notes about this mapping")}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>{t("common.active", "Active")}</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingMapping ? t("common.save", "Save") : t("common.create", "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
