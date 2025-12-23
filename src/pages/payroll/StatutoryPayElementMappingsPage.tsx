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

interface StatutoryType {
  id: string;
  statutory_code: string;
  statutory_name: string;
  statutory_type: string;
  country: string;
}

interface PayElement {
  id: string;
  name: string;
  code: string;
}

interface StatutoryPayElementMapping {
  id: string;
  company_id: string;
  statutory_type_id: string;
  employee_pay_element_id: string | null;
  employer_pay_element_id: string | null;
  is_active: boolean;
  effective_date: string;
  end_date: string | null;
  notes: string | null;
  statutory_type?: StatutoryType;
  employee_pay_element?: PayElement;
  employer_pay_element?: PayElement;
}

export default function StatutoryPayElementMappingsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<{ id: string; name: string; country: string | null }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [mappings, setMappings] = useState<StatutoryPayElementMapping[]>([]);
  const [statutoryTypes, setStatutoryTypes] = useState<StatutoryType[]>([]);
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<StatutoryPayElementMapping | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [companyCountry, setCompanyCountry] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    statutory_type_id: "",
    employee_pay_element_id: "",
    employer_pay_element_id: "",
    is_active: true,
    notes: "",
    effective_date: getTodayString(),
    end_date: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const selected = companies.find(c => c.id === selectedCompany);
      setCompanyCountry(selected?.country || null);
    }
  }, [selectedCompany, companies]);

  useEffect(() => {
    if (selectedCompany && companyCountry) {
      fetchData();
    }
  }, [selectedCompany, companyCountry]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name, country")
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
    if (!selectedCompany || !companyCountry) return;
    setIsLoading(true);
    try {
      const [mappingsRes, typesRes, elementsRes] = await Promise.all([
        supabase
          .from("statutory_pay_element_mappings")
          .select(`
            *,
            statutory_type:statutory_deduction_types(id, statutory_code, statutory_name, statutory_type, country),
            employee_pay_element:pay_elements!statutory_pay_element_mappings_employee_pay_element_id_fkey(id, name, code),
            employer_pay_element:pay_elements!statutory_pay_element_mappings_employer_pay_element_id_fkey(id, name, code)
          `)
          .eq("company_id", selectedCompany)
          .order("created_at", { ascending: false }),
        supabase
          .from("statutory_deduction_types")
          .select("id, statutory_code, statutory_name, statutory_type, country")
          .eq("country", companyCountry)
          .eq("is_active", true)
          .order("statutory_name"),
        supabase
          .from("pay_elements")
          .select("id, name, code")
          .eq("company_id", selectedCompany)
          .eq("is_active", true)
          .order("name"),
      ]);

      if (mappingsRes.error) throw mappingsRes.error;
      if (typesRes.error) throw typesRes.error;
      if (elementsRes.error) throw elementsRes.error;

      setMappings(mappingsRes.data || []);
      setStatutoryTypes(typesRes.data || []);
      setPayElements(elementsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (mapping?: StatutoryPayElementMapping) => {
    if (mapping) {
      setEditingMapping(mapping);
      setFormData({
        statutory_type_id: mapping.statutory_type_id,
        employee_pay_element_id: mapping.employee_pay_element_id || "",
        employer_pay_element_id: mapping.employer_pay_element_id || "",
        is_active: mapping.is_active,
        notes: mapping.notes || "",
        effective_date: mapping.effective_date,
        end_date: mapping.end_date || "",
      });
    } else {
      setEditingMapping(null);
      setFormData({
        statutory_type_id: "",
        employee_pay_element_id: "",
        employer_pay_element_id: "",
        is_active: true,
        notes: "",
        effective_date: getTodayString(),
        end_date: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.statutory_type_id) {
      toast.error("Please select a statutory deduction type");
      return;
    }

    if (!formData.employee_pay_element_id && !formData.employer_pay_element_id) {
      toast.error("Please select at least one pay element (employee or employer)");
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        company_id: selectedCompany,
        statutory_type_id: formData.statutory_type_id,
        employee_pay_element_id: formData.employee_pay_element_id || null,
        employer_pay_element_id: formData.employer_pay_element_id || null,
        is_active: formData.is_active,
        notes: formData.notes || null,
        effective_date: formData.effective_date,
        end_date: formData.end_date || null,
      };

      if (editingMapping) {
        const { error } = await supabase
          .from("statutory_pay_element_mappings")
          .update(data)
          .eq("id", editingMapping.id);
        if (error) throw error;
        toast.success("Mapping updated successfully");
      } else {
        const { error } = await supabase
          .from("statutory_pay_element_mappings")
          .insert(data);
        if (error) throw error;
        toast.success("Mapping created successfully");
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving mapping:", error);
      if (error.code === "23505") {
        toast.error("A mapping for this statutory type already exists");
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
        .from("statutory_pay_element_mappings")
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

  const getDeductionTypeBadge = (type: string) => {
    switch (type) {
      case "tax":
        return <Badge variant="destructive">Tax</Badge>;
      case "social_security":
        return <Badge variant="default">Social Security</Badge>;
      case "health":
        return <Badge variant="secondary">Health</Badge>;
      case "pension":
        return <Badge>Pension</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get unmapped statutory types for the dropdown
  const getAvailableStatutoryTypes = () => {
    const mappedTypeIds = new Set(mappings.map(m => m.statutory_type_id));
    if (editingMapping) {
      mappedTypeIds.delete(editingMapping.statutory_type_id);
    }
    return statutoryTypes.filter(st => !mappedTypeIds.has(st.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {t("payroll.statutoryMapping.title", "Statutory Pay Element Mappings")}
          </h1>
          <p className="text-muted-foreground">
            {t("payroll.statutoryMapping.description", "Map statutory deductions to pay element codes for payroll processing")}
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

      {selectedCompany && !companyCountry && !isLoading && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              No country configured for this company. Please set the company country in company settings first.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedCompany && companyCountry && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              {t("payroll.statutoryMapping.mappings", "Mappings")}
              <Badge variant="outline" className="ml-2">{companyCountry}</Badge>
            </CardTitle>
            <Button onClick={() => handleOpenDialog()} disabled={getAvailableStatutoryTypes().length === 0}>
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
                {t("payroll.statutoryMapping.noMappings", "No statutory pay element mappings configured")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("payroll.statutoryMapping.statutoryType", "Statutory Type")}</TableHead>
                    <TableHead>{t("payroll.statutoryMapping.deductionType", "Category")}</TableHead>
                    <TableHead>{t("payroll.statutoryMapping.employeePayElement", "Employee Pay Element")}</TableHead>
                    <TableHead>{t("payroll.statutoryMapping.employerPayElement", "Employer Pay Element")}</TableHead>
                    <TableHead>{t("common.status", "Status")}</TableHead>
                    <TableHead>{t("common.effectiveDate", "Effective Date")}</TableHead>
                    <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{mapping.statutory_type?.statutory_name}</div>
                          <div className="text-sm text-muted-foreground">{mapping.statutory_type?.statutory_code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {mapping.statutory_type && getDeductionTypeBadge(mapping.statutory_type.statutory_type)}
                      </TableCell>
                      <TableCell>
                        {mapping.employee_pay_element ? (
                          <div>
                            <div className="font-medium">{mapping.employee_pay_element.name}</div>
                            <div className="text-sm text-muted-foreground">{mapping.employee_pay_element.code}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {mapping.employer_pay_element ? (
                          <div>
                            <div className="font-medium">{mapping.employer_pay_element.name}</div>
                            <div className="text-sm text-muted-foreground">{mapping.employer_pay_element.code}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={mapping.is_active ? "default" : "secondary"}>
                          {mapping.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateForDisplay(mapping.effective_date, "MMM d, yyyy")}</TableCell>
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
                ? t("payroll.statutoryMapping.editMapping", "Edit Mapping")
                : t("payroll.statutoryMapping.addMapping", "Add Mapping")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("payroll.statutoryMapping.statutoryType", "Statutory Type")}</Label>
              <Select
                value={formData.statutory_type_id}
                onValueChange={(value) => setFormData({ ...formData, statutory_type_id: value })}
                disabled={!!editingMapping}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.statutoryMapping.selectStatutoryType", "Select statutory type")} />
                </SelectTrigger>
                <SelectContent>
                  {(editingMapping ? statutoryTypes : getAvailableStatutoryTypes()).map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.statutory_name} ({type.statutory_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.statutoryMapping.employeePayElement", "Employee Pay Element")}</Label>
              <Select
                value={formData.employee_pay_element_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, employee_pay_element_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.statutoryMapping.selectPayElement", "Select pay element (optional)")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {payElements.map((element) => (
                    <SelectItem key={element.id} value={element.id}>
                      {element.name} ({element.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The pay element code used for employee statutory deductions
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.statutoryMapping.employerPayElement", "Employer Pay Element")}</Label>
              <Select
                value={formData.employer_pay_element_id || "none"}
                onValueChange={(value) => setFormData({ ...formData, employer_pay_element_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.statutoryMapping.selectPayElement", "Select pay element (optional)")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {payElements.map((element) => (
                    <SelectItem key={element.id} value={element.id}>
                      {element.name} ({element.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The pay element code used for employer statutory contributions
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.effectiveDate", "Effective Date")}</Label>
                <Input
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
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
                placeholder={t("payroll.statutoryMapping.notesPlaceholder", "Optional notes about this mapping")}
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
