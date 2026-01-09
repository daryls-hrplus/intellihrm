// Simplified 3-step wizard for creating new manuals with template selection

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  FileText,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Users,
  Layers,
  Eye,
  Star,
} from "lucide-react";
import { DocumentTemplate, DEFAULT_TEMPLATES } from "./DocumentTemplateConfig";
import { TemplateTypeSelector, DOCUMENT_TYPE_CONFIG } from "./TemplateTypeSelector";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  DocumentType, 
  DOCUMENT_TYPE_LABELS,
  SavedDocumentTemplate,
  savedToDocumentTemplate 
} from "@/hooks/useDocumentTemplates";

interface ManualCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManualCreated?: (manualId: string) => void;
}

// Standard 8-part structure matching Appraisals manual
const STANDARD_STRUCTURE = [
  {
    number: "1",
    title: "Module Overview and Conceptual Foundation",
    description: "Introduction, core concepts, terminology, system architecture, user personas",
    subsections: [
      { number: "1.1", title: "Introduction to [Module] in HRplus" },
      { number: "1.2", title: "Core Concepts and Terminology" },
      { number: "1.3", title: "System Architecture Overview" },
      { number: "1.4", title: "User Personas and Journeys" },
      { number: "1.5", title: "Module Calendar and Key Dates" },
    ],
  },
  {
    number: "2",
    title: "Setup and Configuration Guide",
    description: "Prerequisites, initial setup, configuration options, permissions",
    subsections: [
      { number: "2.1", title: "Prerequisites Checklist" },
      { number: "2.2", title: "Initial Setup and Configuration" },
      { number: "2.3", title: "Role and Permission Setup" },
      { number: "2.4", title: "Integration Configuration" },
    ],
  },
  {
    number: "3",
    title: "Operational Workflows",
    description: "Day-to-day procedures and common workflows",
    subsections: [
      { number: "3.1", title: "Standard Workflows" },
      { number: "3.2", title: "Process Automation" },
      { number: "3.3", title: "Data Entry and Management" },
    ],
  },
  {
    number: "4",
    title: "Advanced Features",
    description: "Module-specific advanced capabilities",
    subsections: [
      { number: "4.1", title: "Advanced Configuration" },
      { number: "4.2", title: "Custom Workflows" },
      { number: "4.3", title: "Bulk Operations" },
    ],
  },
  {
    number: "5",
    title: "AI Features and Automation",
    description: "AI assistant capabilities and automation rules",
    subsections: [
      { number: "5.1", title: "AI Assistant Overview" },
      { number: "5.2", title: "Automated Recommendations" },
      { number: "5.3", title: "Predictive Analytics" },
    ],
  },
  {
    number: "6",
    title: "Analytics and Reporting",
    description: "Reports, dashboards, KPIs, and metrics",
    subsections: [
      { number: "6.1", title: "Standard Reports" },
      { number: "6.2", title: "Dashboard Configuration" },
      { number: "6.3", title: "Custom Report Builder" },
    ],
  },
  {
    number: "7",
    title: "Integration Points",
    description: "Cross-module data flow and external integrations",
    subsections: [
      { number: "7.1", title: "Cross-Module Integration" },
      { number: "7.2", title: "External System Integration" },
      { number: "7.3", title: "Data Import/Export" },
    ],
  },
  {
    number: "8",
    title: "Troubleshooting and FAQ",
    description: "Common issues, solutions, and frequently asked questions",
    subsections: [
      { number: "8.1", title: "Common Issues and Solutions" },
      { number: "8.2", title: "Frequently Asked Questions" },
      { number: "8.3", title: "Support Resources" },
    ],
  },
];

// Get structure sections based on document type
function getStructureForType(docType: DocumentType): string[] {
  switch (docType) {
    case 'quick_start':
    case 'job_aid':
      return ["1", "3"]; // Overview + Workflows only
    case 'sop':
      return ["1", "2", "3", "8"]; // Overview, Setup, Workflows, Troubleshooting
    case 'faq_document':
      return ["1", "8"]; // Overview + FAQ/Troubleshooting
    case 'release_notes':
      return ["1", "4"]; // Overview + Features
    case 'reference_guide':
      return ["1", "2", "7"]; // Overview, Setup, Integration
    default:
      // Full structure for user_manual, training_guide, technical_doc, implementation_guide, policy_document
      return STANDARD_STRUCTURE.map(s => s.number);
  }
}

const TARGET_ROLES = [
  { id: "admin", label: "Administrator", description: "System administrators and IT staff" },
  { id: "hr_manager", label: "HR Manager", description: "HR department managers and leads" },
  { id: "hr_user", label: "HR User", description: "HR operations staff" },
  { id: "manager", label: "Line Manager", description: "Department and team managers" },
  { id: "employee", label: "Employee", description: "End-user employees" },
  { id: "consultant", label: "Implementation Consultant", description: "Implementation partners" },
];

export function ManualCreationWizard({
  open,
  onOpenChange,
  onManualCreated,
}: ManualCreationWizardProps) {
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [manualName, setManualName] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["admin"]);

  // Fetch available modules
  const { data: modules = [] } = useQuery({
    queryKey: ["application-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_modules")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data;
    },
  });

  // Fetch saved templates by document type
  const { data: savedTemplates = [] } = useQuery({
    queryKey: ["enablement-templates-by-type", selectedDocumentType],
    queryFn: async () => {
      if (!selectedDocumentType) return [];
      const { data, error } = await supabase
        .from("enablement_document_templates")
        .select("*")
        .or(`document_type.eq.${selectedDocumentType},category.eq.${selectedDocumentType}`)
        .eq("is_active", true)
        .order("is_default_for_type", { ascending: false });

      if (error) throw error;
      return data as SavedDocumentTemplate[];
    },
    enabled: !!selectedDocumentType,
  });

  // Get available templates (saved + system defaults for this type)
  const availableTemplates = useMemo(() => {
    if (!selectedDocumentType) return [];
    
    // Convert saved templates
    const saved = savedTemplates.map(t => ({
      ...savedToDocumentTemplate(t),
      isSaved: true,
      isDefault: t.is_default_for_type,
    }));
    
    // Get system default for this type
    const systemDefault = DEFAULT_TEMPLATES.find(t => t.type === selectedDocumentType);
    const system = systemDefault ? [{ 
      ...systemDefault, 
      isSaved: false, 
      isDefault: saved.length === 0 
    }] : [];
    
    return [...saved, ...system];
  }, [selectedDocumentType, savedTemplates]);

  // Auto-select first template when document type changes
  const handleDocumentTypeChange = (type: DocumentType) => {
    setSelectedDocumentType(type);
    setSelectedTemplate(null); // Reset template selection
  };

  // Auto-determine structure based on document type
  const selectedSections = selectedDocumentType 
    ? getStructureForType(selectedDocumentType)
    : STANDARD_STRUCTURE.map(s => s.number);

  const createManualMutation = useMutation({
    mutationFn: async () => {
      // Create manual definition
      const { data: manual, error: manualError } = await supabase
        .from("manual_definitions")
        .insert({
          manual_code: manualCode.toLowerCase().replace(/\s+/g, "_"),
          manual_name: manualName,
          description,
          module_codes: selectedModules,
          current_version: "1.0.0",
          generation_status: "idle",
          structure_template: selectedTemplate?.type || selectedDocumentType || "training_guide",
          template_config: {
            templateId: selectedTemplate?.id,
            templateType: selectedTemplate?.type || selectedDocumentType,
            branding: selectedTemplate?.branding,
            layout: selectedTemplate?.layout,
            formatting: selectedTemplate?.formatting,
            targetRoles: selectedRoles,
          },
        })
        .select()
        .single();

      if (manualError) throw manualError;

      // Create sections based on auto-selected structure
      const sectionsToCreate: Array<{
        manual_id: string;
        section_number: string;
        title: string;
        content: Record<string, never>;
        source_module_codes: string[];
        display_order: number;
        parent_section_id: null;
        target_roles: string[];
      }> = [];

      let displayOrder = 0;
      for (const section of STANDARD_STRUCTURE) {
        if (!selectedSections.includes(section.number)) continue;

        // Add parent section
        displayOrder++;
        sectionsToCreate.push({
          manual_id: manual.id,
          section_number: section.number,
          title: section.title.replace("[Module]", manualName.replace(" Manual", "")),
          content: {},
          source_module_codes: selectedModules,
          display_order: displayOrder,
          parent_section_id: null,
          target_roles: selectedRoles,
        });

        // Add subsections
        for (const subsection of section.subsections) {
          displayOrder++;
          sectionsToCreate.push({
            manual_id: manual.id,
            section_number: subsection.number,
            title: subsection.title.replace("[Module]", manualName.replace(" Manual", "")),
            content: {},
            source_module_codes: selectedModules,
            display_order: displayOrder,
            parent_section_id: null,
            target_roles: selectedRoles,
          });
        }
      }

      const { error: sectionsError } = await supabase
        .from("manual_sections")
        .insert(sectionsToCreate);

      if (sectionsError) throw sectionsError;

      return manual;
    },
    onSuccess: (manual) => {
      queryClient.invalidateQueries({ queryKey: ["manual-definitions"] });
      toast.success(`Manual "${manual.manual_name}" created successfully!`);
      onManualCreated?.(manual.id);
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create manual: ${error.message}`);
      setIsCreating(false);
    },
  });

  const handleClose = () => {
    setStep(1);
    setManualName("");
    setManualCode("");
    setDescription("");
    setSelectedModules([]);
    setSelectedDocumentType(null);
    setSelectedTemplate(null);
    setSelectedRoles(["admin"]);
    setIsCreating(false);
    onOpenChange(false);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    await createManualMutation.mutateAsync();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return manualName.trim() !== "" && manualCode.trim() !== "";
      case 2:
        return selectedDocumentType !== null && selectedTemplate !== null;
      case 3:
        return selectedRoles.length > 0;
      default:
        return true;
    }
  };

  const stepTitles = [
    { icon: BookOpen, label: "Basic Info" },
    { icon: FileText, label: "Template" },
    { icon: Users, label: "Target Roles" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create New Manual
          </DialogTitle>
          <DialogDescription>
            Select a template and target roles for your documentation
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 py-3 border-b">
          {stepTitles.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i + 1;
            const isComplete = step > i + 1;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm ${
                  isActive
                    ? "text-primary font-medium"
                    : isComplete
                    ? "text-green-600"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isComplete
                      ? "bg-green-100 text-green-600"
                      : "bg-muted"
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className="hidden md:inline">{s.label}</span>
              </div>
            );
          })}
        </div>

        <ScrollArea className="flex-1 max-h-[50vh] px-1">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="manual-name">Manual Name *</Label>
                <Input
                  id="manual-name"
                  placeholder="e.g., Recruitment Administrator Manual"
                  value={manualName}
                  onChange={(e) => {
                    setManualName(e.target.value);
                    if (!manualCode) {
                      setManualCode(
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "_")
                          .replace(/[^a-z0-9_]/g, "")
                      );
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-code">Manual Code *</Label>
                <Input
                  id="manual-code"
                  placeholder="e.g., recruitment_admin"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for this manual (lowercase, no spaces)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the manual's purpose and audience"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Link to Modules</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Select which modules this manual should document
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                        selectedModules.includes(module.module_code)
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => {
                        setSelectedModules((prev) =>
                          prev.includes(module.module_code)
                            ? prev.filter((c) => c !== module.module_code)
                            : [...prev, module.module_code]
                        );
                      }}
                    >
                      <Checkbox
                        checked={selectedModules.includes(module.module_code)}
                        onCheckedChange={() => {}}
                      />
                      <span className="text-sm">{module.module_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Document Type + Template Selection */}
          {step === 2 && (
            <div className="space-y-6 py-4">
              {/* Document Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Select Document Type</Label>
                <p className="text-sm text-muted-foreground">
                  Choose the type of documentation you want to create
                </p>
                <TemplateTypeSelector
                  value={selectedDocumentType}
                  onChange={handleDocumentTypeChange}
                  showDescriptions={false}
                />
              </div>

              {/* Template Selection - only show after document type selected */}
              {selectedDocumentType && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Select Template for {DOCUMENT_TYPE_LABELS[selectedDocumentType]}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {availableTemplates.length === 0 
                        ? "Loading templates..." 
                        : `${availableTemplates.length} template${availableTemplates.length !== 1 ? 's' : ''} available`}
                    </p>
                    
                    <div className="grid gap-3">
                      {availableTemplates.map((template) => {
                        const config = DOCUMENT_TYPE_CONFIG[template.type];
                        const brandingColor = template.branding?.primaryColor || config?.color || "#3b82f6";
                        
                        return (
                          <div
                            key={template.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedTemplate?.id === template.id
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "hover:border-muted-foreground/50"
                            }`}
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1">
                                {/* Branding color indicator */}
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: `${brandingColor}20` }}
                                >
                                  <div 
                                    className="w-5 h-5 rounded"
                                    style={{ backgroundColor: brandingColor }}
                                  />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium">{template.name}</h4>
                                    {(template as any).isDefault && (
                                      <Badge variant="secondary" className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        Default
                                      </Badge>
                                    )}
                                    {(template as any).isSaved && (
                                      <Badge variant="outline">Saved</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {template.description}
                                  </p>
                                  
                                  {/* Template preview info */}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    {template.branding?.companyName && (
                                      <span>{template.branding.companyName}</span>
                                    )}
                                    {template.layout?.includeTableOfContents && (
                                      <span>• Table of Contents</span>
                                    )}
                                    {template.layout?.includeScreenshots && (
                                      <span>• Screenshots</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {selectedTemplate?.id === template.id && (
                                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-4 w-4 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Target Roles */}
          {step === 3 && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Select the target audience for this manual. This influences the content depth and
                terminology used.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {TARGET_ROLES.map((role) => (
                  <div
                    key={role.id}
                    className={`p-3 border rounded-lg cursor-pointer ${
                      selectedRoles.includes(role.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => {
                      setSelectedRoles((prev) =>
                        prev.includes(role.id)
                          ? prev.filter((r) => r !== role.id)
                          : [...prev, role.id]
                      );
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={() => {}}
                      />
                      <div>
                        <span className="font-medium text-sm">{role.label}</span>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Summary */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Manual Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{manualName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">
                      {selectedDocumentType ? DOCUMENT_TYPE_LABELS[selectedDocumentType] : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Template:</span>
                    <span className="ml-2 font-medium">{selectedTemplate?.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Structure:</span>
                    <span className="ml-2 font-medium">{selectedSections.length} parts</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Target Roles:</span>
                    <span className="ml-2 font-medium">
                      {selectedRoles.map(r => TARGET_ROLES.find(tr => tr.id === r)?.label).join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => (step === 1 ? handleClose() : setStep(step - 1))}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={!canProceed() || isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Manual
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
