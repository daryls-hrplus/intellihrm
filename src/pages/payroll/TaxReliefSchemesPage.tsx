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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Info, User, PiggyBank, Home, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePageAudit } from "@/hooks/usePageAudit";

interface TaxReliefScheme {
  id: string;
  country: string;
  scheme_code: string;
  scheme_name: string;
  scheme_category: string;
  relief_type: string;
  calculation_method: string;
  relief_value: number | null;
  relief_percentage: number | null;
  annual_cap: number | null;
  monthly_cap: number | null;
  min_age: number | null;
  max_age: number | null;
  requires_proof: boolean;
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

const CATEGORY_CONFIG = {
  personal_relief: { label: "Personal Reliefs", icon: User, color: "bg-blue-500/10 text-blue-600" },
  savings_investment: { label: "Savings & Investment", icon: PiggyBank, color: "bg-green-500/10 text-green-600" },
  housing_education: { label: "Housing & Education", icon: Home, color: "bg-purple-500/10 text-purple-600" },
  youth_intern: { label: "Youth & Intern", icon: GraduationCap, color: "bg-orange-500/10 text-orange-600" },
};

const RELIEF_TYPES = [
  { value: "deduction", label: "Deduction (reduces taxable income)" },
  { value: "credit", label: "Credit (reduces tax directly)" },
  { value: "exemption", label: "Exemption (income not taxed)" },
  { value: "reduced_rate", label: "Reduced Rate (lower tax rate)" },
];

const CALC_METHODS = [
  { value: "fixed_amount", label: "Fixed Amount" },
  { value: "percentage_of_income", label: "Percentage of Income" },
  { value: "percentage_of_contribution", label: "Percentage of Contribution" },
  { value: "tiered", label: "Tiered Calculation" },
];

const getCountryName = (code: string) => COUNTRY_OPTIONS.find(c => c.code === code)?.name || code;

const getFlagEmoji = (countryCode: string): string => {
  const flags: Record<string, string> = {
    JM: "🇯🇲", TT: "🇹🇹", BB: "🇧🇧", GH: "🇬🇭", NG: "🇳🇬",
    DO: "🇩🇴", GB: "🇬🇧", GY: "🇬🇾", BS: "🇧🇸", KY: "🇰🇾",
  };
  return flags[countryCode] || "🏳️";
};

export default function TaxReliefSchemesPage() {
  usePageAudit('tax_relief_schemes', 'Payroll');
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState<TaxReliefScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<TaxReliefScheme | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [formData, setFormData] = useState({
    country: "",
    scheme_code: "",
    scheme_name: "",
    scheme_category: "personal_relief",
    relief_type: "deduction",
    calculation_method: "fixed_amount",
    relief_value: "",
    relief_percentage: "",
    annual_cap: "",
    monthly_cap: "",
    min_age: "",
    max_age: "",
    requires_proof: false,
    description: "",
    legal_reference: "",
    effective_from: new Date().toISOString().split("T")[0],
    effective_to: "",
    is_active: true,
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tax_relief_schemes")
      .select("*")
      .order("country")
      .order("scheme_category")
      .order("scheme_name");

    if (error) {
      toast.error("Failed to load tax relief schemes");
      console.error(error);
    } else {
      setSchemes(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      country: "",
      scheme_code: "",
      scheme_name: "",
      scheme_category: "personal_relief",
      relief_type: "deduction",
      calculation_method: "fixed_amount",
      relief_value: "",
      relief_percentage: "",
      annual_cap: "",
      monthly_cap: "",
      min_age: "",
      max_age: "",
      requires_proof: false,
      description: "",
      legal_reference: "",
      effective_from: new Date().toISOString().split("T")[0],
      effective_to: "",
      is_active: true,
    });
    setEditingScheme(null);
  };

  const handleEdit = (scheme: TaxReliefScheme) => {
    setEditingScheme(scheme);
    setFormData({
      country: scheme.country,
      scheme_code: scheme.scheme_code,
      scheme_name: scheme.scheme_name,
      scheme_category: scheme.scheme_category,
      relief_type: scheme.relief_type,
      calculation_method: scheme.calculation_method,
      relief_value: scheme.relief_value?.toString() || "",
      relief_percentage: scheme.relief_percentage?.toString() || "",
      annual_cap: scheme.annual_cap?.toString() || "",
      monthly_cap: scheme.monthly_cap?.toString() || "",
      min_age: scheme.min_age?.toString() || "",
      max_age: scheme.max_age?.toString() || "",
      requires_proof: scheme.requires_proof,
      description: scheme.description || "",
      legal_reference: scheme.legal_reference || "",
      effective_from: scheme.effective_from,
      effective_to: scheme.effective_to || "",
      is_active: scheme.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.country || !formData.scheme_code || !formData.scheme_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      country: formData.country,
      scheme_code: formData.scheme_code.toUpperCase(),
      scheme_name: formData.scheme_name,
      scheme_category: formData.scheme_category,
      relief_type: formData.relief_type,
      calculation_method: formData.calculation_method,
      relief_value: formData.relief_value ? parseFloat(formData.relief_value) : null,
      relief_percentage: formData.relief_percentage ? parseFloat(formData.relief_percentage) : null,
      annual_cap: formData.annual_cap ? parseFloat(formData.annual_cap) : null,
      monthly_cap: formData.monthly_cap ? parseFloat(formData.monthly_cap) : null,
      min_age: formData.min_age ? parseInt(formData.min_age) : null,
      max_age: formData.max_age ? parseInt(formData.max_age) : null,
      requires_proof: formData.requires_proof,
      description: formData.description || null,
      legal_reference: formData.legal_reference || null,
      effective_from: formData.effective_from,
      effective_to: formData.effective_to || null,
      is_active: formData.is_active,
    };

    let error;
    if (editingScheme) {
      ({ error } = await supabase
        .from("tax_relief_schemes")
        .update(payload)
        .eq("id", editingScheme.id));
    } else {
      ({ error } = await supabase
        .from("tax_relief_schemes")
        .insert(payload));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingScheme ? "Scheme updated" : "Scheme created");
      setDialogOpen(false);
      resetForm();
      fetchSchemes();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scheme?")) return;

    const { error } = await supabase
      .from("tax_relief_schemes")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Scheme deleted");
      fetchSchemes();
    }
  };

  const toggleActive = async (scheme: TaxReliefScheme) => {
    const { error } = await supabase
      .from("tax_relief_schemes")
      .update({ is_active: !scheme.is_active })
      .eq("id", scheme.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Scheme ${scheme.is_active ? "deactivated" : "activated"}`);
      fetchSchemes();
    }
  };

  const filteredSchemes = schemes.filter(s => {
    if (selectedCountry !== "all" && s.country !== selectedCountry) return false;
    if (selectedCategory !== "all" && s.scheme_category !== selectedCategory) return false;
    return true;
  });

  const countriesWithSchemes = [...new Set(schemes.map(s => s.country))];
  const categoryCounts = Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
    acc[cat] = schemes.filter(s => s.scheme_category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const breadcrumbItems = [
    { label: "Payroll", href: "/payroll" },
    { label: "Tax Relief Schemes" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tax Relief Schemes</h1>
            <p className="text-muted-foreground mt-1">
              Configure country-specific tax reliefs, credits, and exemptions
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Scheme
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingScheme ? "Edit" : "Add"} Tax Relief Scheme</DialogTitle>
                <DialogDescription>
                  Configure tax relief eligibility and calculation rules
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                      <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent>
                        {COUNTRY_OPTIONS.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{getFlagEmoji(c.code)} {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Scheme Code *</Label>
                    <Input
                      value={formData.scheme_code}
                      onChange={(e) => setFormData({ ...formData, scheme_code: e.target.value.toUpperCase() })}
                      placeholder="e.g., AGE_RELIEF"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={formData.scheme_category} onValueChange={(v) => setFormData({ ...formData, scheme_category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Scheme Name *</Label>
                  <Input
                    value={formData.scheme_name}
                    onChange={(e) => setFormData({ ...formData, scheme_name: e.target.value })}
                    placeholder="e.g., Age Relief (55-64)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Relief Type *</Label>
                    <Select value={formData.relief_type} onValueChange={(v) => setFormData({ ...formData, relief_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RELIEF_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Calculation Method *</Label>
                    <Select value={formData.calculation_method} onValueChange={(v) => setFormData({ ...formData, calculation_method: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CALC_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Relief Value</Label>
                    <Input
                      type="number"
                      value={formData.relief_value}
                      onChange={(e) => setFormData({ ...formData, relief_value: e.target.value })}
                      placeholder="Fixed amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relief %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.relief_percentage}
                      onChange={(e) => setFormData({ ...formData, relief_percentage: e.target.value })}
                      placeholder="%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Cap</Label>
                    <Input
                      type="number"
                      value={formData.annual_cap}
                      onChange={(e) => setFormData({ ...formData, annual_cap: e.target.value })}
                      placeholder="No limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Cap</Label>
                    <Input
                      type="number"
                      value={formData.monthly_cap}
                      onChange={(e) => setFormData({ ...formData, monthly_cap: e.target.value })}
                      placeholder="No limit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Min Age</Label>
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      value={formData.min_age}
                      onChange={(e) => setFormData({ ...formData, min_age: e.target.value })}
                      placeholder="Any"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Age</Label>
                    <Input
                      type="number"
                      min="0"
                      max="120"
                      value={formData.max_age}
                      onChange={(e) => setFormData({ ...formData, max_age: e.target.value })}
                      placeholder="Any"
                    />
                  </div>
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

                <div className="flex items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.requires_proof}
                      onCheckedChange={(c) => setFormData({ ...formData, requires_proof: c })}
                    />
                    <Label>Requires Proof Documents</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave}>{editingScheme ? "Update" : "Create"} Scheme</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${selectedCategory === key ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === key ? "all" : key)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Badge variant="secondary">{categoryCounts[key]}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-sm">{config.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tax Relief Schemes by Country</CardTitle>
                <CardDescription>
                  {schemes.length} scheme{schemes.length !== 1 ? "s" : ""} across {countriesWithSchemes.length} countr{countriesWithSchemes.length !== 1 ? "ies" : "y"}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countriesWithSchemes.map((code) => (
                      <SelectItem key={code} value={code}>{getFlagEmoji(code)} {getCountryName(code)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory !== "all" && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategory("all")}>
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredSchemes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No schemes found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Scheme</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Value/Rate</TableHead>
                    <TableHead className="text-center">Age</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchemes.map((scheme) => {
                    const catConfig = CATEGORY_CONFIG[scheme.scheme_category as keyof typeof CATEGORY_CONFIG];
                    const CatIcon = catConfig?.icon || User;
                    return (
                      <TableRow key={scheme.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getFlagEmoji(scheme.country)}</span>
                            <span className="text-sm">{getCountryName(scheme.country)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{scheme.scheme_name}</div>
                            <div className="text-xs text-muted-foreground">{scheme.scheme_code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={catConfig?.color}>
                            <CatIcon className="h-3 w-3 mr-1" />
                            {catConfig?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">{scheme.relief_type.replace("_", " ")}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {scheme.relief_value && <div>{scheme.relief_value.toLocaleString()}</div>}
                          {scheme.relief_percentage && <div>{scheme.relief_percentage}%</div>}
                          {!scheme.relief_value && !scheme.relief_percentage && <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {scheme.min_age || scheme.max_age ? (
                            <span>
                              {scheme.min_age || "0"} - {scheme.max_age || "∞"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Any</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant={scheme.is_active ? "default" : "secondary"}
                                  className="cursor-pointer"
                                  onClick={() => toggleActive(scheme)}
                                >
                                  {scheme.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>Click to toggle</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {scheme.description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <Info className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{scheme.description}</p>
                                    {scheme.legal_reference && (
                                      <p className="text-xs mt-1 opacity-75">{scheme.legal_reference}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(scheme)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(scheme.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
