import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayslipTemplates, PayslipTemplate } from "@/hooks/usePayslipTemplates";
import { PayslipDocument } from "@/components/payroll/PayslipDocument";
import { usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { FileText, Palette, Eye, Settings2, Upload, Save, Star, Trash2, Sparkles, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PayslipTemplateConfigPage() {
  const { t } = useTranslation();
  const { selectedCompanyId } = usePayrollFilters();
  const { 
    isLoading, 
    fetchTemplates, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate,
    setDefaultTemplate 
  } = usePayslipTemplates();

  const [templates, setTemplates] = useState<PayslipTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PayslipTemplate | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [layoutFileName, setLayoutFileName] = useState("");
  const [layoutContent, setLayoutContent] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [formData, setFormData] = useState<Partial<PayslipTemplate>>({
    template_name: "Default Template",
    template_style: "classic",
    primary_color: "#1e40af",
    secondary_color: "#64748b",
    accent_color: "#059669",
    show_company_logo: true,
    show_company_address: true,
    show_employee_address: true,
    show_employee_id: true,
    show_department: true,
    show_position: true,
    show_bank_details: false,
    show_ytd_totals: true,
    show_tax_breakdown: true,
    show_statutory_breakdown: true,
    footer_text: "This is a computer-generated document. No signature required.",
    confidentiality_notice: "CONFIDENTIAL - For employee use only",
  });

  useEffect(() => {
    if (selectedCompanyId) {
      loadTemplates();
    }
  }, [selectedCompanyId]);

  const loadTemplates = async () => {
    if (!selectedCompanyId) return;
    const data = await fetchTemplates(selectedCompanyId);
    setTemplates(data);
    if (data.length > 0 && !selectedTemplate) {
      selectTemplate(data[0]);
    }
  };

  const selectTemplate = (template: PayslipTemplate) => {
    setSelectedTemplate(template);
    setFormData(template);
  };

  const handleInputChange = (field: keyof PayslipTemplate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedCompanyId) return;

    if (selectedTemplate) {
      const result = await updateTemplate(selectedTemplate.id, formData);
      if (result) {
        loadTemplates();
      }
    } else {
      const result = await createTemplate({
        ...formData,
        company_id: selectedCompanyId,
      });
      if (result) {
        setSelectedTemplate(result);
        loadTemplates();
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setFormData({
      template_name: "New Template",
      template_style: "classic",
      primary_color: "#1e40af",
      secondary_color: "#64748b",
      accent_color: "#059669",
      show_company_logo: true,
      show_company_address: true,
      show_employee_address: true,
      show_employee_id: true,
      show_department: true,
      show_position: true,
      show_bank_details: false,
      show_ytd_totals: true,
      show_tax_breakdown: true,
      show_statutory_breakdown: true,
      footer_text: "This is a computer-generated document. No signature required.",
      confidentiality_notice: "CONFIDENTIAL - For employee use only",
    });
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    if (confirm("Are you sure you want to delete this template?")) {
      const success = await deleteTemplate(selectedTemplate.id);
      if (success) {
        setSelectedTemplate(null);
        loadTemplates();
      }
    }
  };

  const handleSetDefault = async () => {
    if (!selectedTemplate || !selectedCompanyId) return;
    await setDefaultTemplate(selectedCompanyId, selectedTemplate.id);
    loadTemplates();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLayoutFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLayoutContent(content);
    };
    
    if (file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else if (file.type.includes('image')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const analyzeLayoutWithAI = async () => {
    if (!layoutContent) {
      toast.error("Please upload a payslip layout first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-payslip-template', {
        body: {
          layoutContent,
          layoutFileName,
          userFeedback: aiFeedback || null,
          currentSettings: aiFeedback ? formData : null
        }
      });

      if (error) throw error;

      if (data?.settings) {
        setFormData(prev => ({
          ...prev,
          ...data.settings
        }));
        toast.success("AI has generated template settings. Review in Branding and Content tabs.");
      }
    } catch (error) {
      console.error("Error analyzing layout:", error);
      toast.error("Failed to analyze layout");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const iterateWithAI = async () => {
    if (!aiFeedback) {
      toast.error("Please provide feedback for the AI");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-payslip-template', {
        body: {
          layoutContent: layoutContent || null,
          layoutFileName,
          userFeedback: aiFeedback,
          currentSettings: formData
        }
      });

      if (error) throw error;

      if (data?.settings) {
        setFormData(prev => ({
          ...prev,
          ...data.settings
        }));
        setAiFeedback("");
        toast.success("Settings updated based on your feedback");
      }
    } catch (error) {
      console.error("Error iterating with AI:", error);
      toast.error("Failed to apply feedback");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mock payslip for preview
  const mockPayslip = {
    id: "preview",
    employee_payroll_id: "preview",
    employee_id: "preview",
    payslip_number: "PS-2024-001234",
    pay_period_start: new Date(2024, 0, 1).toISOString(),
    pay_period_end: new Date(2024, 0, 31).toISOString(),
    pay_date: new Date(2024, 1, 5).toISOString(),
    gross_pay: 5000,
    total_deductions: 1250,
    net_pay: 3750,
    currency: "USD",
    pdf_url: null,
    pdf_generated_at: null,
    is_viewable: true,
    viewed_at: null,
    downloaded_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockEmployee = {
    full_name: "John Smith",
    email: "john.smith@company.com",
    employee_number: "EMP-001",
    department: "Engineering",
    position: "Senior Developer",
  };

  const mockLineItems = {
    earnings: [
      { name: "Base Salary", amount: 4500 },
      { name: "Housing Allowance", amount: 500 },
    ],
    deductions: [
      { name: "Health Insurance", amount: 150 },
      { name: "Pension Contribution", amount: 200 },
    ],
    taxes: [
      { name: "Income Tax (PAYE)", amount: 750 },
      { name: "National Insurance", amount: 150 },
    ],
    employer: [],
  };

  const mockYtd = {
    gross: 5000,
    deductions: 1250,
    net: 3750,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("payroll.title"), href: "/payroll" },
            { label: t("payroll.templates.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.templates.title")}</h1>
              <p className="text-muted-foreground">{t("payroll.templates.subtitle")}</p>
            </div>
          </div>
          <Button onClick={handleCreateNew}>
            {t("common.createNew")}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Template List */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-base">{t("payroll.templates.savedTemplates")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedTemplate?.id === template.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted"
                  }`}
                  onClick={() => selectTemplate(template)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{template.template_name}</span>
                    {template.is_default && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{template.template_style} style</p>
                </div>
              ))}
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("payroll.templates.noTemplates")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {selectedTemplate ? t("payroll.templates.editTemplate") : t("payroll.templates.createTemplate")}
                </CardTitle>
                <div className="flex gap-2">
                  {selectedTemplate && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleSetDefault} disabled={selectedTemplate.is_default}>
                        <Star className="h-4 w-4 mr-1" />
                        {t("payroll.templates.setDefault")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-1" />
                    {t("common.save")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ai-design">
                <TabsList className="mb-4">
                  <TabsTrigger value="ai-design">
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI Design
                  </TabsTrigger>
                  <TabsTrigger value="branding">
                    <Palette className="h-4 w-4 mr-1" />
                    {t("payroll.templates.branding")}
                  </TabsTrigger>
                  <TabsTrigger value="content">
                    <Settings2 className="h-4 w-4 mr-1" />
                    {t("payroll.templates.content")}
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-1" />
                    {t("payroll.templates.preview")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai-design" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Upload Payslip Layout</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload an image or document showing how you want your payslip to look. AI will analyze it and generate template settings.
                      </p>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Supported: Images (PNG, JPG), PDF, Excel, or text files
                        </p>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf,.xlsx,.xls,.csv,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="layout-upload"
                        />
                        <label htmlFor="layout-upload">
                          <Button variant="outline" asChild>
                            <span>Choose File</span>
                          </Button>
                        </label>
                        {layoutFileName && (
                          <p className="mt-3 text-sm text-success font-medium">{layoutFileName}</p>
                        )}
                      </div>
                    </div>

                    {layoutContent && (
                      <Button 
                        onClick={analyzeLayoutWithAI} 
                        disabled={isAnalyzing}
                        className="w-full"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing Layout...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analyze Layout with AI
                          </>
                        )}
                      </Button>
                    )}

                    <div className="border-t pt-4">
                      <Label className="text-base font-medium">Iterate with AI</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Provide feedback to refine the template settings. Tell AI what to change.
                      </p>
                      <Textarea
                        value={aiFeedback}
                        onChange={(e) => setAiFeedback(e.target.value)}
                        placeholder="e.g., 'Make the colors more corporate blue', 'Add more spacing', 'Hide the bank details section'"
                        rows={3}
                      />
                      <Button 
                        onClick={iterateWithAI} 
                        disabled={isAnalyzing || !aiFeedback}
                        variant="outline"
                        className="mt-3"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Apply Feedback
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Tips for Best Results</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Upload a clear image or scan of your desired payslip layout</li>
                        <li>• Include examples of colors, logos, and text formatting you want</li>
                        <li>• After analysis, review Branding and Content tabs to fine-tune</li>
                        <li>• Use the Preview tab to see how the template will look</li>
                        <li>• Click Save when satisfied to use this template</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="branding" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("payroll.templates.templateName")}</Label>
                      <Input
                        value={formData.template_name || ""}
                        onChange={(e) => handleInputChange("template_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("payroll.templates.style")}</Label>
                      <Select
                        value={formData.template_style}
                        onValueChange={(v) => handleInputChange("template_style", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("payroll.templates.companyLogo")}</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.company_logo_url || ""}
                        onChange={(e) => handleInputChange("company_logo_url", e.target.value)}
                        placeholder="https://..."
                      />
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("payroll.templates.companyNameOverride")}</Label>
                    <Input
                      value={formData.company_name_override || ""}
                      onChange={(e) => handleInputChange("company_name_override", e.target.value)}
                      placeholder={t("payroll.templates.leaveBlankDefault")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("payroll.templates.companyAddress")}</Label>
                    <Textarea
                      value={formData.company_address || ""}
                      onChange={(e) => handleInputChange("company_address", e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t("payroll.templates.primaryColor")}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange("primary_color", e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={formData.primary_color}
                          onChange={(e) => handleInputChange("primary_color", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("payroll.templates.secondaryColor")}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => handleInputChange("secondary_color", e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={formData.secondary_color}
                          onChange={(e) => handleInputChange("secondary_color", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("payroll.templates.accentColor")}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.accent_color}
                          onChange={(e) => handleInputChange("accent_color", e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={formData.accent_color}
                          onChange={(e) => handleInputChange("accent_color", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">{t("payroll.templates.displayOptions")}</h4>
                      
                      <div className="flex items-center justify-between">
                        <Label>{t("payroll.templates.showCompanyLogo")}</Label>
                        <Switch
                          checked={formData.show_company_logo}
                          onCheckedChange={(v) => handleInputChange("show_company_logo", v)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label>{t("payroll.templates.showCompanyAddress")}</Label>
                        <Switch
                          checked={formData.show_company_address}
                          onCheckedChange={(v) => handleInputChange("show_company_address", v)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>{t("payroll.templates.showEmployeeId")}</Label>
                        <Switch
                          checked={formData.show_employee_id}
                          onCheckedChange={(v) => handleInputChange("show_employee_id", v)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>{t("payroll.templates.showDepartment")}</Label>
                        <Switch
                          checked={formData.show_department}
                          onCheckedChange={(v) => handleInputChange("show_department", v)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>{t("payroll.templates.showPosition")}</Label>
                        <Switch
                          checked={formData.show_position}
                          onCheckedChange={(v) => handleInputChange("show_position", v)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">{t("payroll.templates.payDetails")}</h4>

                      <div className="flex items-center justify-between">
                        <Label>{t("payroll.templates.showYtdTotals")}</Label>
                        <Switch
                          checked={formData.show_ytd_totals}
                          onCheckedChange={(v) => handleInputChange("show_ytd_totals", v)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>{t("payroll.templates.showTaxBreakdown")}</Label>
                        <Switch
                          checked={formData.show_tax_breakdown}
                          onCheckedChange={(v) => handleInputChange("show_tax_breakdown", v)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>{t("payroll.templates.showStatutoryBreakdown")}</Label>
                        <Switch
                          checked={formData.show_statutory_breakdown}
                          onCheckedChange={(v) => handleInputChange("show_statutory_breakdown", v)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label>{t("payroll.templates.showBankDetails")}</Label>
                        <Switch
                          checked={formData.show_bank_details}
                          onCheckedChange={(v) => handleInputChange("show_bank_details", v)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("payroll.templates.headerText")}</Label>
                    <Textarea
                      value={formData.header_text || ""}
                      onChange={(e) => handleInputChange("header_text", e.target.value)}
                      rows={2}
                      placeholder={t("payroll.templates.headerTextPlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("payroll.templates.footerText")}</Label>
                    <Textarea
                      value={formData.footer_text || ""}
                      onChange={(e) => handleInputChange("footer_text", e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("payroll.templates.confidentialityNotice")}</Label>
                    <Input
                      value={formData.confidentiality_notice || ""}
                      onChange={(e) => handleInputChange("confidentiality_notice", e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview">
                  <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                    <PayslipDocument
                      payslip={mockPayslip}
                      template={formData as PayslipTemplate}
                      employee={mockEmployee}
                      lineItems={mockLineItems}
                      ytdTotals={mockYtd}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
