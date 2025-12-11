import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Eye, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LetterTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  subject: string;
  body_template: string;
  available_variables: string[];
}

interface WorkflowLetterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionType?: string;
  transactionData?: Record<string, any>;
  employeeId: string;
  employeeName?: string;
  onLetterGenerated: (letterId: string, content: string, templateId: string, variables: Record<string, string>) => void;
}

export function WorkflowLetterDialog({
  open,
  onOpenChange,
  transactionType,
  transactionData,
  employeeId,
  employeeName,
  onLetterGenerated,
}: WorkflowLetterDialogProps) {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("select");

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open, transactionType]);

  useEffect(() => {
    if (selectedTemplate && transactionData) {
      prefillVariables();
    }
  }, [selectedTemplate, transactionData]);

  useEffect(() => {
    if (selectedTemplate) {
      generatePreview();
    }
  }, [variables, selectedTemplate]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("letter_templates")
        .select("*")
        .eq("is_active", true);

      // Map transaction type to letter code
      const typeToCode: Record<string, string> = {
        hire: "hire_letter",
        confirmation: "confirmation_letter",
        probation_extension: "probation_extension_letter",
        acting: "acting_letter",
        promotion: "promotion_letter",
        transfer: "transfer_letter",
        termination: "termination_letter",
      };

      if (transactionType && typeToCode[transactionType]) {
        query = query.eq("code", typeToCode[transactionType]);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      setTemplates(data as LetterTemplate[]);
      
      // Auto-select if only one template matches
      if (data.length === 1) {
        setSelectedTemplate(data[0] as LetterTemplate);
        setActiveTab("variables");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load letter templates");
    } finally {
      setIsLoading(false);
    }
  };

  const prefillVariables = () => {
    if (!selectedTemplate || !transactionData) return;

    const prefilled: Record<string, string> = {
      current_date: new Date().toLocaleDateString("en-US", { 
        year: "numeric", month: "long", day: "numeric" 
      }),
      employee_name: employeeName || "",
    };

    // Map transaction data to template variables
    if (transactionData.effective_date) {
      prefilled.effective_date = new Date(transactionData.effective_date).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
    }

    if (transactionData.position?.title) {
      prefilled.position_title = transactionData.position.title;
      prefilled.new_position_title = transactionData.position.title;
    }

    if (transactionData.department?.name) {
      prefilled.department_name = transactionData.department.name;
      prefilled.new_department_name = transactionData.department.name;
    }

    if (transactionData.from_position?.title) {
      prefilled.old_position_title = transactionData.from_position.title;
      prefilled.from_position = transactionData.from_position.title;
    }

    if (transactionData.from_department?.name) {
      prefilled.from_department = transactionData.from_department.name;
    }

    if (transactionData.to_position?.title) {
      prefilled.to_position = transactionData.to_position.title;
    }

    if (transactionData.to_department?.name) {
      prefilled.to_department = transactionData.to_department.name;
    }

    if (transactionData.company?.name) {
      prefilled.company_name = transactionData.company.name;
    }

    if (transactionData.probation_end_date) {
      prefilled.original_end_date = new Date(transactionData.probation_end_date).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
    }

    if (transactionData.new_probation_end_date) {
      prefilled.new_end_date = new Date(transactionData.new_probation_end_date).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
    }

    if (transactionData.extension_days) {
      prefilled.extension_days = transactionData.extension_days.toString();
    }

    if (transactionData.acting_position?.title) {
      prefilled.acting_position = transactionData.acting_position.title;
    }

    if (transactionData.acting_start_date) {
      prefilled.acting_start_date = new Date(transactionData.acting_start_date).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
    }

    if (transactionData.acting_end_date) {
      prefilled.acting_end_date = new Date(transactionData.acting_end_date).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
    }

    if (transactionData.acting_allowance) {
      prefilled.acting_allowance = transactionData.acting_allowance.toString();
    }

    if (transactionData.last_working_date) {
      prefilled.last_working_date = new Date(transactionData.last_working_date).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });
    }

    if (transactionData.termination_type) {
      prefilled.termination_type = transactionData.termination_type;
    }

    // Add placeholder for signature block
    prefilled.signature_block = "{{SIGNATURE_BLOCK}}";
    prefilled.company_letterhead = "{{COMPANY_LETTERHEAD}}";
    prefilled.letter_number = "{{AUTO_GENERATED}}";

    setVariables(prefilled);
  };

  const generatePreview = () => {
    if (!selectedTemplate) return;

    let content = selectedTemplate.body_template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      content = content.replace(regex, value || `[${key}]`);
    });

    // Replace any remaining variables with placeholder
    content = content.replace(/{{(\w+)}}/g, "[$1]");

    setPreview(content);
  };

  const handleSelectTemplate = (template: LetterTemplate) => {
    setSelectedTemplate(template);
    setActiveTab("variables");
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    if (!selectedTemplate) return;

    // Validate required variables
    const missingVars = selectedTemplate.available_variables.filter(
      v => !variables[v] && !["signature_block", "company_letterhead", "letter_number"].includes(v)
    );

    if (missingVars.length > 0) {
      toast.error(`Please fill in: ${missingVars.join(", ")}`);
      return;
    }

    onLetterGenerated(
      "", // Will be created when workflow starts
      preview,
      selectedTemplate.id,
      variables
    );
    onOpenChange(false);
  };

  const getVariableLabel = (variable: string): string => {
    return variable
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isSystemVariable = (variable: string): boolean => {
    return ["signature_block", "company_letterhead", "letter_number"].includes(variable);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Transaction Letter
          </DialogTitle>
          <DialogDescription>
            Select a letter template and fill in the required information
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="select" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Select Template
              </TabsTrigger>
              <TabsTrigger value="variables" disabled={!selectedTemplate} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Fill Variables
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!selectedTemplate} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="grid gap-3">
                  {templates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No letter templates available</p>
                    </div>
                  ) : (
                    templates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedTemplate?.id === template.id ? "border-primary bg-muted/30" : ""
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.subject}</p>
                            </div>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="variables" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="grid gap-4 pr-4">
                  {selectedTemplate?.available_variables
                    .filter(v => !isSystemVariable(v))
                    .map((variable) => (
                      <div key={variable} className="space-y-2">
                        <Label htmlFor={variable}>{getVariableLabel(variable)}</Label>
                        {variable.includes("reason") || variable.includes("notes") ? (
                          <Textarea
                            id={variable}
                            value={variables[variable] || ""}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            placeholder={`Enter ${getVariableLabel(variable).toLowerCase()}`}
                            rows={2}
                          />
                        ) : (
                          <Input
                            id={variable}
                            value={variables[variable] || ""}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            placeholder={`Enter ${getVariableLabel(variable).toLowerCase()}`}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border whitespace-pre-wrap font-serif text-sm leading-relaxed">
                  {preview || "Fill in the variables to see a preview"}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!selectedTemplate || !preview}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Letter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}