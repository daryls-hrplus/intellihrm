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

interface BenefitPlan {
  id: string;
  name: string;
  code: string;
  plan_type: string;
}

interface PayElement {
  id: string;
  name: string;
  code: string;
}

interface BenefitPayrollMapping {
  id: string;
  company_id: string;
  benefit_plan_id: string;
  pay_element_id: string;
  mapping_type: string;
  is_active: boolean;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  benefit_plan?: BenefitPlan;
  pay_element?: PayElement;
}

export default function BenefitPayrollMappingsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [mappings, setMappings] = useState<BenefitPayrollMapping[]>([]);
  const [benefitPlans, setBenefitPlans] = useState<BenefitPlan[]>([]);
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<BenefitPayrollMapping | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    benefit_plan_id: "",
    pay_element_id: "",
    mapping_type: "deduction",
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
      const [mappingsRes, plansRes, elementsRes] = await Promise.all([
        supabase
          .from("benefit_payroll_mappings")
          .select(`
            *,
            benefit_plan:benefit_plans(id, name, code, plan_type),
            pay_element:pay_elements(id, name, code)
          `)
          .eq("company_id", selectedCompany)
          .order("created_at", { ascending: false }),
        supabase
          .from("benefit_plans")
          .select("id, name, code, plan_type")
          .eq("company_id", selectedCompany)
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("pay_elements")
          .select("id, name, code")
          .eq("company_id", selectedCompany)
          .eq("is_active", true)
          .order("name"),
      ]);

      if (mappingsRes.error) throw mappingsRes.error;
      if (plansRes.error) throw plansRes.error;
      if (elementsRes.error) throw elementsRes.error;

      setMappings(mappingsRes.data || []);
      setBenefitPlans(plansRes.data || []);
      setPayElements(elementsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (mapping?: BenefitPayrollMapping) => {
    if (mapping) {
      setEditingMapping(mapping);
      setFormData({
        benefit_plan_id: mapping.benefit_plan_id,
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
        benefit_plan_id: "",
        pay_element_id: "",
        mapping_type: "deduction",
        is_active: true,
        notes: "",
        start_date: getTodayString(),
        end_date: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.benefit_plan_id || !formData.pay_element_id) {
      toast.error("Please select both a benefit plan and pay element");
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        company_id: selectedCompany,
        benefit_plan_id: formData.benefit_plan_id,
        pay_element_id: formData.pay_element_id,
        mapping_type: formData.mapping_type,
        is_active: formData.is_active,
        notes: formData.notes || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
      };

      if (editingMapping) {
        const { error } = await supabase
          .from("benefit_payroll_mappings")
          .update(data)
          .eq("id", editingMapping.id);
        if (error) throw error;
        toast.success("Mapping updated successfully");
      } else {
        const { error } = await supabase
          .from("benefit_payroll_mappings")
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
        .from("benefit_payroll_mappings")
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

  const getMappingTypeLabel = (type: string) => {
    switch (type) {
      case "deduction":
        return t("payroll.benefitMapping.types.deduction", "Employee Deduction");
      case "contribution":
        return t("payroll.benefitMapping.types.contribution", "Employee Contribution");
      case "employer_contribution":
        return t("payroll.benefitMapping.types.employerContribution", "Employer Contribution");
      default:
        return type;
    }
  };

  const getMappingTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "deduction":
        return "destructive";
      case "contribution":
        return "default";
      case "employer_contribution":
        return "secondary";
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
            {t("payroll.benefitMapping.title", "Benefit Payroll Mappings")}
          </h1>
          <p className="text-muted-foreground">
            {t("payroll.benefitMapping.description", "Map benefit plans to pay element codes for payroll processing")}
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
            {t("payroll.benefitMapping.mappings", "Mappings")}
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
              {t("payroll.benefitMapping.noMappings", "No benefit payroll mappings configured")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payroll.benefitMapping.benefitPlan", "Benefit Plan")}</TableHead>
                  <TableHead>{t("payroll.benefitMapping.payElement", "Pay Element")}</TableHead>
                  <TableHead>{t("payroll.benefitMapping.mappingType", "Type")}</TableHead>
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
                      <div>
                        <div className="font-medium">{mapping.benefit_plan?.name}</div>
                        <div className="text-sm text-muted-foreground">{mapping.benefit_plan?.code}</div>
                      </div>
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
                ? t("payroll.benefitMapping.editMapping", "Edit Mapping")
                : t("payroll.benefitMapping.addMapping", "Add Mapping")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("payroll.benefitMapping.benefitPlan", "Benefit Plan")}</Label>
              <Select
                value={formData.benefit_plan_id}
                onValueChange={(value) => setFormData({ ...formData, benefit_plan_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.benefitMapping.selectBenefitPlan", "Select benefit plan")} />
                </SelectTrigger>
                <SelectContent>
                  {benefitPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} ({plan.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.benefitMapping.payElement", "Pay Element")}</Label>
              <Select
                value={formData.pay_element_id}
                onValueChange={(value) => setFormData({ ...formData, pay_element_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("payroll.benefitMapping.selectPayElement", "Select pay element")} />
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
              <Label>{t("payroll.benefitMapping.mappingType", "Mapping Type")}</Label>
              <Select
                value={formData.mapping_type}
                onValueChange={(value) => setFormData({ ...formData, mapping_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deduction">
                    {t("payroll.benefitMapping.types.deduction", "Employee Deduction")}
                  </SelectItem>
                  <SelectItem value="contribution">
                    {t("payroll.benefitMapping.types.contribution", "Employee Contribution")}
                  </SelectItem>
                  <SelectItem value="employer_contribution">
                    {t("payroll.benefitMapping.types.employerContribution", "Employer Contribution")}
                  </SelectItem>
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
                placeholder={t("payroll.benefitMapping.notesPlaceholder", "Optional notes about this mapping")}
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
