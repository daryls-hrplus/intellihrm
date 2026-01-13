import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  useComplianceTemplate,
  useCreateComplianceDocument,
  useLinkDocumentToSource,
  generateDocumentContent,
  ComplianceTemplate,
} from "@/hooks/useComplianceDocument";
import { ComplianceTemplateSelector } from "./ComplianceTemplateSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Send, Eye, Edit3, Scale, Clock, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface ComplianceDocumentGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  companyId: string;
  sourceType: "disciplinary" | "grievance" | "appraisal" | "termination" | "pip" | "manual";
  sourceId?: string;
  prefilledData?: Record<string, string>;
  category?: string;
  jurisdiction?: string;
  countryCode?: string;
  onDocumentCreated?: (documentId: string) => void;
}

const VARIABLE_LABELS: Record<string, string> = {
  date: "Date",
  employee_name: "Employee Name",
  employee_id: "Employee ID",
  staff_id: "Staff ID",
  staff_number: "Staff Number",
  department: "Department",
  reason: "Reason",
  incident_details: "Incident Details",
  corrective_action: "Corrective Action Required",
  expected_improvement: "Expected Improvement",
  review_date: "Review Date",
  previous_warnings: "Previous Warnings",
  current_issue: "Current Issue",
  current_offense: "Current Offense",
  offense: "Offense",
  effective_date: "Effective Date",
  final_pay: "Final Pay Details",
  deadline: "Deadline",
  entitlements: "Entitlements",
  warning_type: "Warning Type",
  warning_level: "Warning Level",
  matter: "Matter",
  query_date: "Query Date",
  notice_period: "Notice Period",
  start_date: "Start Date",
  end_date: "End Date",
  improvement_areas: "Areas for Improvement",
  success_criteria: "Success Criteria",
  allegation: "Allegation",
  notice_payment: "Notice Payment",
  manager_name: "Manager Name",
  duration: "Duration",
  performance_gaps: "Performance Gaps",
  improvement_goals: "Improvement Goals",
  support: "Support Provided",
  review_schedule: "Review Schedule",
  consequences: "Consequences",
  review_period: "Review Period",
  overall_rating: "Overall Rating",
  rating: "Rating",
  achievements: "Key Achievements",
  development_areas: "Development Areas",
  next_goals: "Goals for Next Period",
  comments: "Comments",
  confirmation_date: "Confirmation Date",
  extension_period: "Extension Period",
  new_end_date: "New End Date",
  grievance_ref: "Grievance Reference",
  grievance_date: "Grievance Date",
  outcome: "Outcome",
  reasoning: "Reasoning",
  actions: "Actions to be Taken",
  appeal_period: "Appeal Period (Days)",
};

export function ComplianceDocumentGenerator({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  companyId,
  sourceType,
  sourceId,
  prefilledData = {},
  category,
  jurisdiction,
  countryCode,
  onDocumentCreated,
}: ComplianceDocumentGeneratorProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<"select" | "fill" | "preview">("select");
  const [selectedTemplate, setSelectedTemplate] = useState<ComplianceTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const createDocument = useCreateComplianceDocument();
  const linkDocument = useLinkDocumentToSource();

  // Initialize with prefilled data and defaults
  useEffect(() => {
    if (selectedTemplate) {
      const defaults: Record<string, string> = {
        date: format(new Date(), "yyyy-MM-dd"),
        employee_name: employeeName,
        ...prefilledData,
      };
      
      const requiredVars = selectedTemplate.required_variables as string[];
      const initialValues: Record<string, string> = {};
      requiredVars.forEach((v) => {
        initialValues[v] = defaults[v] || variableValues[v] || "";
      });
      setVariableValues(initialValues);
    }
  }, [selectedTemplate, employeeName, prefilledData]);

  const generatedContent = useMemo(() => {
    if (!selectedTemplate) return "";
    return generateDocumentContent(selectedTemplate.template_content, variableValues);
  }, [selectedTemplate, variableValues]);

  const missingVariables = useMemo(() => {
    if (!selectedTemplate) return [];
    const required = selectedTemplate.required_variables as string[];
    return required.filter((v) => !variableValues[v]?.trim());
  }, [selectedTemplate, variableValues]);

  const handleTemplateSelect = (template: ComplianceTemplate) => {
    setSelectedTemplate(template);
    setStep("fill");
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    if (!selectedTemplate || missingVariables.length > 0) return;

    try {
      const result = await createDocument.mutateAsync({
        templateId: selectedTemplate.id,
        employeeId,
        companyId,
        sourceType,
        sourceId,
        variableValues,
        generatedContent,
      });

      // Link to source if applicable
      if (sourceId && (sourceType === "disciplinary" || sourceType === "grievance")) {
        await linkDocument.mutateAsync({
          documentId: result.id,
          sourceType,
          sourceId,
        });
      }

      onDocumentCreated?.(result.id);
      onOpenChange(false);
      resetState();
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  };

  const resetState = () => {
    setStep("select");
    setSelectedTemplate(null);
    setVariableValues({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const isMultiline = (key: string) => {
    const multilineFields = [
      "incident_details",
      "corrective_action",
      "expected_improvement",
      "previous_warnings",
      "current_issue",
      "improvement_areas",
      "success_criteria",
      "allegation",
      "performance_gaps",
      "improvement_goals",
      "support",
      "review_schedule",
      "consequences",
      "achievements",
      "development_areas",
      "next_goals",
      "comments",
      "reasoning",
      "actions",
      "matter",
      "final_pay",
      "entitlements",
    ];
    return multilineFields.includes(key);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            {t("compliance.generateDocument", "Generate Compliance Document")}
          </DialogTitle>
          <DialogDescription>
            {step === "select" && t("compliance.selectTemplateDesc", "Select a jurisdiction-compliant template for this action")}
            {step === "fill" && t("compliance.fillDetailsDesc", "Complete the required fields for the document")}
            {step === "preview" && t("compliance.previewDesc", "Review the generated document before creating")}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 px-1">
          <div className={`flex items-center gap-1.5 ${step === "select" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === "select" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1</div>
            <span className="text-sm">Select</span>
          </div>
          <Separator className="flex-1" />
          <div className={`flex items-center gap-1.5 ${step === "fill" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === "fill" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2</div>
            <span className="text-sm">Details</span>
          </div>
          <Separator className="flex-1" />
          <div className={`flex items-center gap-1.5 ${step === "preview" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === "preview" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>3</div>
            <span className="text-sm">Preview</span>
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div className="flex-1 min-h-0">
          {step === "select" && (
            <ComplianceTemplateSelector
              onSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?.id}
              category={category}
              jurisdiction={jurisdiction}
              countryCode={countryCode}
            />
          )}

          {step === "fill" && selectedTemplate && (
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Form Fields */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {selectedTemplate.name}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{selectedTemplate.category}</Badge>
                        <Badge variant="secondary">{selectedTemplate.country_code || selectedTemplate.jurisdiction}</Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  {(selectedTemplate.required_variables as string[]).map((variable) => (
                    <div key={variable} className="space-y-1.5">
                      <Label htmlFor={variable} className="text-sm">
                        {VARIABLE_LABELS[variable] || variable.replace(/_/g, " ")}
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      {isMultiline(variable) ? (
                        <Textarea
                          id={variable}
                          value={variableValues[variable] || ""}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                          placeholder={`Enter ${VARIABLE_LABELS[variable]?.toLowerCase() || variable}`}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={variable}
                          type={variable.includes("date") ? "date" : "text"}
                          value={variableValues[variable] || ""}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                          placeholder={`Enter ${VARIABLE_LABELS[variable]?.toLowerCase() || variable}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Live Preview */}
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-muted px-3 py-2 flex items-center gap-2 border-b">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-medium">{t("compliance.livePreview", "Live Preview")}</span>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedContent }}
                  />
                </ScrollArea>
              </div>
            </div>
          )}

          {step === "preview" && selectedTemplate && (
            <div className="space-y-4">
              {/* Template Info */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedTemplate.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline">{selectedTemplate.category}</Badge>
                      {selectedTemplate.legal_reference && (
                        <span className="text-xs text-muted-foreground">{selectedTemplate.legal_reference}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Retention: {selectedTemplate.retention_period_years} years
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Document Preview */}
              <Card>
                <CardHeader className="py-3 border-b">
                  <CardTitle className="text-sm">{t("compliance.documentPreview", "Document Preview")}</CardTitle>
                </CardHeader>
                <ScrollArea className="h-[300px]">
                  <CardContent className="py-4">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: generatedContent }}
                    />
                  </CardContent>
                </ScrollArea>
              </Card>

              {missingVariables.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t("compliance.missingFields", "Missing required fields")}: {missingVariables.join(", ")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <Separator />
        <div className="flex justify-between">
          <div>
            {step !== "select" && (
              <Button
                variant="ghost"
                onClick={() => setStep(step === "preview" ? "fill" : "select")}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("common.back", "Back")}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              {t("common.cancel", "Cancel")}
            </Button>
            {step === "select" && selectedTemplate && (
              <Button onClick={() => setStep("fill")}>
                {t("common.continue", "Continue")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
            {step === "fill" && (
              <Button onClick={() => setStep("preview")} disabled={missingVariables.length > 0}>
                <Eye className="h-4 w-4 mr-1" />
                {t("compliance.previewDocument", "Preview Document")}
              </Button>
            )}
            {step === "preview" && (
              <Button
                onClick={handleCreate}
                disabled={createDocument.isPending || missingVariables.length > 0}
              >
                {createDocument.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                {t("compliance.createDocument", "Create Document")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
