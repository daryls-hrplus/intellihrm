import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Info, Calculator } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePageAudit } from "@/hooks/usePageAudit";

interface TaxReliefRule {
  id: string;
  country: string;
  statutory_type_code: string;
  statutory_type_name: string;
  relief_percentage: number;
  annual_cap: number | null;
  monthly_cap: number | null;
  applies_to_employee_contribution: boolean;
  applies_to_employer_contribution: boolean;
  description: string | null;
  legal_reference: string | null;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
}

const COUNTRY_OPTIONS = [
  { code: "JM", name: "Jamaica" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "BB", name: "Barbados" },
  { code: "GH", name: "Ghana" },
  { code: "NG", name: "Nigeria" },
  { code: "DO", name: "Dominican Republic" },
  { code: "GB", name: "United Kingdom" },
  { code: "GY", name: "Guyana" },
  { code: "BS", name: "Bahamas" },
  { code: "KY", name: "Cayman Islands" },
];

const getCountryName = (code: string) => {
  return COUNTRY_OPTIONS.find(c => c.code === code)?.name || code;
};

export default function StatutoryTaxReliefPage() {
  usePageAudit('statutory_tax_relief', 'Payroll');
  const { t } = useTranslation();
  const [rules, setRules] = useState<TaxReliefRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxReliefRule | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    country: "",
    statutory_type_code: "",
    statutory_type_name: "",
    relief_percentage: 100,
    annual_cap: "",
    monthly_cap: "",
    applies_to_employee_contribution: true,
    applies_to_employer_contribution: false,
    description: "",
    legal_reference: "",
    effective_from: new Date().toISOString().split("T")[0],
    effective_to: "",
    is_active: true,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("statutory_tax_relief_rules")
      .select("*")
      .order("country")
      .order("statutory_type_code");

    if (error) {
      toast.error("Failed to load tax relief rules");
      console.error(error);
    } else {
      setRules(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      country: "",
      statutory_type_code: "",
      statutory_type_name: "",
      relief_percentage: 100,
      annual_cap: "",
      monthly_cap: "",
      applies_to_employee_contribution: true,
      applies_to_employer_contribution: false,
      description: "",
      legal_reference: "",
      effective_from: new Date().toISOString().split("T")[0],
      effective_to: "",
      is_active: true,
    });
    setEditingRule(null);
  };

  const handleEdit = (rule: TaxReliefRule) => {
    setEditingRule(rule);
    setFormData({
      country: rule.country,
      statutory_type_code: rule.statutory_type_code,
      statutory_type_name: rule.statutory_type_name,
      relief_percentage: rule.relief_percentage,
      annual_cap: rule.annual_cap?.toString() || "",
      monthly_cap: rule.monthly_cap?.toString() || "",
      applies_to_employee_contribution: rule.applies_to_employee_contribution,
      applies_to_employer_contribution: rule.applies_to_employer_contribution,
      description: rule.description || "",
      legal_reference: rule.legal_reference || "",
      effective_from: rule.effective_from,
      effective_to: rule.effective_to || "",
      is_active: rule.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.country || !formData.statutory_type_code || !formData.statutory_type_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      country: formData.country,
      statutory_type_code: formData.statutory_type_code.toUpperCase(),
      statutory_type_name: formData.statutory_type_name,
      relief_percentage: formData.relief_percentage,
      annual_cap: formData.annual_cap ? parseFloat(formData.annual_cap) : null,
      monthly_cap: formData.monthly_cap ? parseFloat(formData.monthly_cap) : null,
      applies_to_employee_contribution: formData.applies_to_employee_contribution,
      applies_to_employer_contribution: formData.applies_to_employer_contribution,
      description: formData.description || null,
      legal_reference: formData.legal_reference || null,
      effective_from: formData.effective_from,
      effective_to: formData.effective_to || null,
      is_active: formData.is_active,
    };

    let error;
    if (editingRule) {
      ({ error } = await supabase
        .from("statutory_tax_relief_rules")
        .update(payload)
        .eq("id", editingRule.id));
    } else {
      ({ error } = await supabase
        .from("statutory_tax_relief_rules")
        .insert(payload));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingRule ? "Rule updated" : "Rule created");
      setDialogOpen(false);
      resetForm();
      fetchRules();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    
    const { error } = await supabase
      .from("statutory_tax_relief_rules")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Rule deleted");
      fetchRules();
    }
  };

  const toggleActive = async (rule: TaxReliefRule) => {
    const { error } = await supabase
      .from("statutory_tax_relief_rules")
      .update({ is_active: !rule.is_active })
      .eq("id", rule.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Rule ${rule.is_active ? "deactivated" : "activated"}`);
      fetchRules();
    }
  };

  const filteredRules = selectedCountry === "all" 
    ? rules 
    : rules.filter(r => r.country === selectedCountry);

  const countriesWithRules = [...new Set(rules.map(r => r.country))];

  const breadcrumbItems = [
    { label: "Payroll", href: "/payroll" },
    { label: "Statutory Tax Relief" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Statutory Tax Relief Rules</h1>
            <p className="text-muted-foreground mt-1">
              Configure which statutory deductions reduce taxable income
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingRule ? "Edit" : "Add"} Tax Relief Rule</DialogTitle>
                <DialogDescription>
                  Configure how statutory deductions reduce taxable income
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData({ ...formData, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_OPTIONS.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Statutory Type Code *</Label>
                    <Input
                      value={formData.statutory_type_code}
                      onChange={(e) => setFormData({ ...formData, statutory_type_code: e.target.value.toUpperCase() })}
                      placeholder="e.g., NIS, SSNIT"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Statutory Type Name *</Label>
                  <Input
                    value={formData.statutory_type_name}
                    onChange={(e) => setFormData({ ...formData, statutory_type_name: e.target.value })}
                    placeholder="e.g., National Insurance Scheme"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Relief Percentage (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.relief_percentage}
                      onChange={(e) => setFormData({ ...formData, relief_percentage: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Annual Cap</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.annual_cap}
                      onChange={(e) => setFormData({ ...formData, annual_cap: e.target.value })}
                      placeholder="No limit"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Monthly Cap</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monthly_cap}
                      onChange={(e) => setFormData({ ...formData, monthly_cap: e.target.value })}
                      placeholder="No limit"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.applies_to_employee_contribution}
                      onCheckedChange={(checked) => setFormData({ ...formData, applies_to_employee_contribution: checked })}
                    />
                    <Label>Applies to Employee Contribution</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.applies_to_employer_contribution}
                      onCheckedChange={(checked) => setFormData({ ...formData, applies_to_employer_contribution: checked })}
                    />
                    <Label>Applies to Employer Contribution</Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Effective From *</Label>
                    <Input
                      type="date"
                      value={formData.effective_from}
                      onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Effective To</Label>
                    <Input
                      type="date"
                      value={formData.effective_to}
                      onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Explain how this relief works..."
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Legal Reference</Label>
                  <Input
                    value={formData.legal_reference}
                    onChange={(e) => setFormData({ ...formData, legal_reference: e.target.value })}
                    placeholder="e.g., Income Tax Act Section 12"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>
                  {editingRule ? "Update" : "Create"} Rule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Alert>
          <Calculator className="h-4 w-4" />
          <AlertTitle>How Tax Relief Works</AlertTitle>
          <AlertDescription>
            When a statutory deduction (like NIS or SSNIT) has a tax relief rule, the specified percentage of the 
            employee's contribution is subtracted from their gross income before calculating income tax. This reduces 
            their taxable income and ultimately their tax liability.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tax Relief Rules by Country</CardTitle>
                <CardDescription>
                  {rules.length} rule{rules.length !== 1 ? "s" : ""} configured across {countriesWithRules.length} countr{countriesWithRules.length !== 1 ? "ies" : "y"}
                </CardDescription>
              </div>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countriesWithRules.map((code) => (
                    <SelectItem key={code} value={code}>
                      {getCountryName(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredRules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tax relief rules configured
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Statutory Type</TableHead>
                    <TableHead className="text-center">Relief %</TableHead>
                    <TableHead className="text-center">Applies To</TableHead>
                    <TableHead className="text-center">Caps</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFlagEmoji(rule.country)}</span>
                          {getCountryName(rule.country)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.statutory_type_code}</div>
                          <div className="text-sm text-muted-foreground">{rule.statutory_type_name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={rule.relief_percentage === 100 ? "default" : "secondary"}>
                          {rule.relief_percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {rule.applies_to_employee_contribution && (
                            <Badge variant="outline" className="text-xs">Employee</Badge>
                          )}
                          {rule.applies_to_employer_contribution && (
                            <Badge variant="outline" className="text-xs">Employer</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {rule.annual_cap || rule.monthly_cap ? (
                          <div>
                            {rule.annual_cap && <div>Annual: {rule.annual_cap.toLocaleString()}</div>}
                            {rule.monthly_cap && <div>Monthly: {rule.monthly_cap.toLocaleString()}</div>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No limit</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant={rule.is_active ? "default" : "secondary"}
                                className="cursor-pointer"
                                onClick={() => toggleActive(rule)}
                              >
                                {rule.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Click to toggle</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {rule.description && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p>{rule.description}</p>
                                  {rule.legal_reference && (
                                    <p className="text-xs mt-1 opacity-75">{rule.legal_reference}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
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
      </div>
    </AppLayout>
  );
}

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    JM: "🇯🇲",
    TT: "🇹🇹",
    BB: "🇧🇧",
    GH: "🇬🇭",
    NG: "🇳🇬",
    DO: "🇩🇴",
    GB: "🇬🇧",
    GY: "🇬🇾",
    BS: "🇧🇸",
    KY: "🇰🇾",
  };
  return flags[countryCode] || "🏳️";
}
