import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { usePayroll, PayrollTaxConfig, PayrollDeductionConfig } from "@/hooks/usePayroll";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { Plus, Edit, Trash2, Receipt, Percent, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TaxConfigPage() {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId } = usePayrollFilters();
  const {
    isLoading,
    fetchTaxConfig,
    createTaxConfig,
    updateTaxConfig,
    deleteTaxConfig,
    fetchDeductionConfig,
    createDeductionConfig,
    updateDeductionConfig,
    deleteDeductionConfig,
  } = usePayroll();

  const [taxConfigs, setTaxConfigs] = useState<PayrollTaxConfig[]>([]);
  const [deductionConfigs, setDeductionConfigs] = useState<PayrollDeductionConfig[]>([]);
  const [taxDialogOpen, setTaxDialogOpen] = useState(false);
  const [deductionDialogOpen, setDeductionDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<PayrollTaxConfig | null>(null);
  const [editingDeduction, setEditingDeduction] = useState<PayrollDeductionConfig | null>(null);
  const [activeTab, setActiveTab] = useState("taxes");

  const [taxForm, setTaxForm] = useState({
    country_code: "US",
    region_code: "",
    tax_type: "federal_income" as string,
    tax_name: "",
    calculation_method: "percentage" as PayrollTaxConfig['calculation_method'],
    rate: 0,
    wage_base_limit: null as number | null,
    exempt_amount: 0,
    employer_rate: null as number | null,
    employer_wage_base_limit: null as number | null,
    is_employee_tax: true,
    is_employer_tax: false,
    is_active: true,
    notes: "",
  });

  const [deductionForm, setDeductionForm] = useState({
    code: "",
    name: "",
    description: "",
    deduction_type: "pre_tax" as PayrollDeductionConfig['deduction_type'],
    calculation_method: "fixed" as PayrollDeductionConfig['calculation_method'],
    default_amount: null as number | null,
    default_percentage: null as number | null,
    max_amount: null as number | null,
    annual_limit: null as number | null,
    is_active: true,
    is_mandatory: false,
    affects_taxable_income: true,
    affects_pensionable_income: false,
  });

  useEffect(() => {
    loadData();
  }, [selectedCompanyId]);

  const loadData = async () => {
    const [taxData, deductionData] = await Promise.all([
      fetchTaxConfig(selectedCompanyId || undefined),
      selectedCompanyId ? fetchDeductionConfig(selectedCompanyId) : Promise.resolve([]),
    ]);
    setTaxConfigs(taxData);
    setDeductionConfigs(deductionData);
  };

  const handleTaxSubmit = async () => {
    const data = {
      ...taxForm,
      company_id: selectedCompanyId,
      effective_date: new Date().toISOString().split('T')[0],
    };

    let success;
    if (editingTax) {
      success = await updateTaxConfig(editingTax.id, data);
    } else {
      success = await createTaxConfig(data);
    }

    if (success) {
      setTaxDialogOpen(false);
      resetTaxForm();
      loadData();
    }
  };

  const handleDeductionSubmit = async () => {
    if (!selectedCompanyId) return;

    const data = {
      ...deductionForm,
      company_id: selectedCompanyId,
      start_date: new Date().toISOString().split('T')[0],
    };

    let success;
    if (editingDeduction) {
      success = await updateDeductionConfig(editingDeduction.id, data);
    } else {
      success = await createDeductionConfig(data);
    }

    if (success) {
      setDeductionDialogOpen(false);
      resetDeductionForm();
      loadData();
    }
  };

  const handleDeleteTax = async (id: string) => {
    if (confirm("Are you sure you want to delete this tax configuration?")) {
      const success = await deleteTaxConfig(id);
      if (success) loadData();
    }
  };

  const handleDeleteDeduction = async (id: string) => {
    if (confirm("Are you sure you want to delete this deduction configuration?")) {
      const success = await deleteDeductionConfig(id);
      if (success) loadData();
    }
  };

  const resetTaxForm = () => {
    setEditingTax(null);
    setTaxForm({
      country_code: "US",
      region_code: "",
      tax_type: "federal_income",
      tax_name: "",
      calculation_method: "percentage",
      rate: 0,
      wage_base_limit: null,
      exempt_amount: 0,
      employer_rate: null,
      employer_wage_base_limit: null,
      is_employee_tax: true,
      is_employer_tax: false,
      is_active: true,
      notes: "",
    });
  };

  const resetDeductionForm = () => {
    setEditingDeduction(null);
    setDeductionForm({
      code: "",
      name: "",
      description: "",
      deduction_type: "pre_tax",
      calculation_method: "fixed",
      default_amount: null,
      default_percentage: null,
      max_amount: null,
      annual_limit: null,
      is_active: true,
      is_mandatory: false,
      affects_taxable_income: true,
      affects_pensionable_income: false,
    });
  };

  const openEditTax = (tax: PayrollTaxConfig) => {
    setEditingTax(tax);
    setTaxForm({
      country_code: tax.country_code,
      region_code: tax.region_code || "",
      tax_type: tax.tax_type,
      tax_name: tax.tax_name,
      calculation_method: tax.calculation_method,
      rate: tax.rate || 0,
      wage_base_limit: tax.wage_base_limit,
      exempt_amount: tax.exempt_amount,
      employer_rate: tax.employer_rate,
      employer_wage_base_limit: tax.employer_wage_base_limit,
      is_employee_tax: tax.is_employee_tax,
      is_employer_tax: tax.is_employer_tax,
      is_active: tax.is_active,
      notes: tax.notes || "",
    });
    setTaxDialogOpen(true);
  };

  const openEditDeduction = (deduction: PayrollDeductionConfig) => {
    setEditingDeduction(deduction);
    setDeductionForm({
      code: deduction.code,
      name: deduction.name,
      description: deduction.description || "",
      deduction_type: deduction.deduction_type,
      calculation_method: deduction.calculation_method,
      default_amount: deduction.default_amount,
      default_percentage: deduction.default_percentage,
      max_amount: deduction.max_amount,
      annual_limit: deduction.annual_limit,
      is_active: deduction.is_active,
      is_mandatory: deduction.is_mandatory,
      affects_taxable_income: deduction.affects_taxable_income,
      affects_pensionable_income: deduction.affects_pensionable_income,
    });
    setDeductionDialogOpen(true);
  };

  const getTaxTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      federal_income: "Federal Income",
      state_income: "State Income",
      local_income: "Local Income",
      social_security: "Social Security",
      medicare: "Medicare",
      unemployment: "Unemployment",
      disability: "Disability",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getDeductionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      pre_tax: "Pre-Tax",
      post_tax: "Post-Tax",
      garnishment: "Garnishment",
      loan: "Loan",
      other: "Other",
    };
    return labels[type] || type;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("payroll.title"), href: "/payroll" },
            { label: t("payroll.taxConfig.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <Receipt className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.taxConfig.title")}</h1>
              <p className="text-muted-foreground">{t("payroll.taxConfig.subtitle")}</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="taxes">{t("payroll.taxConfig.taxConfigTab")}</TabsTrigger>
            <TabsTrigger value="deductions">{t("payroll.taxConfig.deductionRulesTab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="taxes" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { resetTaxForm(); setTaxDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                {t("payroll.taxConfig.addTax")}
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("payroll.taxConfig.taxName")}</TableHead>
                      <TableHead>{t("payroll.taxConfig.taxType")}</TableHead>
                      <TableHead>{t("payroll.taxConfig.countryRegion")}</TableHead>
                      <TableHead>{t("payroll.taxConfig.rate")}</TableHead>
                      <TableHead>{t("payroll.taxConfig.wageBase")}</TableHead>
                      <TableHead>{t("payroll.taxConfig.appliesTo")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxConfigs.map((tax) => (
                      <TableRow key={tax.id}>
                        <TableCell className="font-medium">{tax.tax_name}</TableCell>
                        <TableCell>{getTaxTypeLabel(tax.tax_type)}</TableCell>
                        <TableCell>
                          {tax.country_code}
                          {tax.region_code && ` - ${tax.region_code}`}
                        </TableCell>
                        <TableCell>
                          {tax.rate ? `${(tax.rate * 100).toFixed(2)}%` : "-"}
                        </TableCell>
                        <TableCell>
                          {tax.wage_base_limit ? `$${tax.wage_base_limit.toLocaleString()}` : t("payroll.taxConfig.noLimit")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {tax.is_employee_tax && <Badge variant="outline">{t("payroll.taxConfig.employee")}</Badge>}
                            {tax.is_employer_tax && <Badge variant="outline">{t("payroll.taxConfig.employer")}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tax.is_active ? "default" : "secondary"}>
                            {tax.is_active ? t("common.active") : t("common.inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditTax(tax)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTax(tax.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {taxConfigs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {t("payroll.taxConfig.noTaxes")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deductions" className="space-y-4">
            {!selectedCompanyId ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Please select a company to manage deduction rules.
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button onClick={() => { resetDeductionForm(); setDeductionDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deduction
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Calculation</TableHead>
                          <TableHead>Default Amount</TableHead>
                          <TableHead>Annual Limit</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deductionConfigs.map((deduction) => (
                          <TableRow key={deduction.id}>
                            <TableCell className="font-medium">{deduction.code}</TableCell>
                            <TableCell>{deduction.name}</TableCell>
                            <TableCell>{getDeductionTypeLabel(deduction.deduction_type)}</TableCell>
                            <TableCell className="capitalize">{deduction.calculation_method}</TableCell>
                            <TableCell>
                              {deduction.calculation_method === "percentage"
                                ? `${(deduction.default_percentage || 0) * 100}%`
                                : deduction.default_amount
                                  ? `$${deduction.default_amount.toLocaleString()}`
                                  : "-"}
                            </TableCell>
                            <TableCell>
                              {deduction.annual_limit ? `$${deduction.annual_limit.toLocaleString()}` : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={deduction.is_active ? "default" : "secondary"}>
                                {deduction.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditDeduction(deduction)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteDeduction(deduction.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {deductionConfigs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              No deduction rules configured
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Tax Dialog */}
        <Dialog open={taxDialogOpen} onOpenChange={setTaxDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTax ? "Edit Tax Configuration" : "Add Tax Configuration"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country Code</Label>
                  <Input
                    value={taxForm.country_code}
                    onChange={(e) => setTaxForm({ ...taxForm, country_code: e.target.value })}
                    placeholder="e.g., US"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Region Code</Label>
                  <Input
                    value={taxForm.region_code}
                    onChange={(e) => setTaxForm({ ...taxForm, region_code: e.target.value })}
                    placeholder="e.g., CA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tax Type</Label>
                <Select
                  value={taxForm.tax_type}
                  onValueChange={(value) => setTaxForm({ ...taxForm, tax_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="federal_income">Federal Income</SelectItem>
                    <SelectItem value="state_income">State Income</SelectItem>
                    <SelectItem value="local_income">Local Income</SelectItem>
                    <SelectItem value="social_security">Social Security</SelectItem>
                    <SelectItem value="medicare">Medicare</SelectItem>
                    <SelectItem value="unemployment">Unemployment</SelectItem>
                    <SelectItem value="disability">Disability</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tax Name</Label>
                <Input
                  value={taxForm.tax_name}
                  onChange={(e) => setTaxForm({ ...taxForm, tax_name: e.target.value })}
                  placeholder="e.g., Federal Income Tax"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Calculation Method</Label>
                  <Select
                    value={taxForm.calculation_method}
                    onValueChange={(value) => setTaxForm({ ...taxForm, calculation_method: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="bracket">Bracket</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="formula">Formula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={taxForm.rate * 100}
                    onChange={(e) => setTaxForm({ ...taxForm, rate: parseFloat(e.target.value) / 100 || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Wage Base Limit</Label>
                  <Input
                    type="number"
                    value={taxForm.wage_base_limit || ""}
                    onChange={(e) => setTaxForm({ ...taxForm, wage_base_limit: parseFloat(e.target.value) || null })}
                    placeholder="No limit"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Exempt Amount</Label>
                  <Input
                    type="number"
                    value={taxForm.exempt_amount}
                    onChange={(e) => setTaxForm({ ...taxForm, exempt_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={taxForm.is_employee_tax}
                    onCheckedChange={(checked) => setTaxForm({ ...taxForm, is_employee_tax: checked })}
                  />
                  <Label>Employee Tax</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={taxForm.is_employer_tax}
                    onCheckedChange={(checked) => setTaxForm({ ...taxForm, is_employer_tax: checked })}
                  />
                  <Label>Employer Tax</Label>
                </div>
              </div>

              {taxForm.is_employer_tax && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employer Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={(taxForm.employer_rate || 0) * 100}
                      onChange={(e) => setTaxForm({ ...taxForm, employer_rate: parseFloat(e.target.value) / 100 || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Employer Wage Base</Label>
                    <Input
                      type="number"
                      value={taxForm.employer_wage_base_limit || ""}
                      onChange={(e) => setTaxForm({ ...taxForm, employer_wage_base_limit: parseFloat(e.target.value) || null })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={taxForm.notes}
                  onChange={(e) => setTaxForm({ ...taxForm, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTaxDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleTaxSubmit} disabled={isLoading}>
                {editingTax ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deduction Dialog */}
        <Dialog open={deductionDialogOpen} onOpenChange={setDeductionDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDeduction ? "Edit Deduction Rule" : "Add Deduction Rule"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={deductionForm.code}
                    onChange={(e) => setDeductionForm({ ...deductionForm, code: e.target.value })}
                    placeholder="e.g., 401K"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={deductionForm.name}
                    onChange={(e) => setDeductionForm({ ...deductionForm, name: e.target.value })}
                    placeholder="e.g., 401(k) Contribution"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deduction Type</Label>
                  <Select
                    value={deductionForm.deduction_type}
                    onValueChange={(value) => setDeductionForm({ ...deductionForm, deduction_type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre_tax">Pre-Tax</SelectItem>
                      <SelectItem value="post_tax">Post-Tax</SelectItem>
                      <SelectItem value="garnishment">Garnishment</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Calculation Method</Label>
                  <Select
                    value={deductionForm.calculation_method}
                    onValueChange={(value) => setDeductionForm({ ...deductionForm, calculation_method: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="formula">Formula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {deductionForm.calculation_method === "fixed" ? (
                  <div className="space-y-2">
                    <Label>Default Amount</Label>
                    <Input
                      type="number"
                      value={deductionForm.default_amount || ""}
                      onChange={(e) => setDeductionForm({ ...deductionForm, default_amount: parseFloat(e.target.value) || null })}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Default Percentage (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={(deductionForm.default_percentage || 0) * 100}
                      onChange={(e) => setDeductionForm({ ...deductionForm, default_percentage: parseFloat(e.target.value) / 100 || null })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Max Amount per Period</Label>
                  <Input
                    type="number"
                    value={deductionForm.max_amount || ""}
                    onChange={(e) => setDeductionForm({ ...deductionForm, max_amount: parseFloat(e.target.value) || null })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Annual Limit</Label>
                <Input
                  type="number"
                  value={deductionForm.annual_limit || ""}
                  onChange={(e) => setDeductionForm({ ...deductionForm, annual_limit: parseFloat(e.target.value) || null })}
                  placeholder="No limit"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={deductionForm.description}
                  onChange={(e) => setDeductionForm({ ...deductionForm, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={deductionForm.is_mandatory}
                    onCheckedChange={(checked) => setDeductionForm({ ...deductionForm, is_mandatory: checked })}
                  />
                  <Label>Mandatory</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={deductionForm.affects_taxable_income}
                    onCheckedChange={(checked) => setDeductionForm({ ...deductionForm, affects_taxable_income: checked })}
                  />
                  <Label>Affects Taxable Income</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeductionDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDeductionSubmit} disabled={isLoading}>
                {editingDeduction ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
