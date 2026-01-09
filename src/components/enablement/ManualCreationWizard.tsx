// Multi-step wizard for creating new manuals with template, branding, and structure configuration

import { useState } from "react";
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
  Palette,
  List,
  Layers,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Users,
  Building2,
} from "lucide-react";
import { DocumentTemplate, DEFAULT_TEMPLATES } from "./DocumentTemplateConfig";
import { TemplateStylingEditor } from "./TemplateStylingEditor";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(
    DEFAULT_TEMPLATES[0]
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["admin"]);
  const [selectedSections, setSelectedSections] = useState<string[]>(
    STANDARD_STRUCTURE.map((s) => s.number)
  );

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

  const createManualMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
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
          structure_template: selectedTemplate?.type || "training_guide",
          template_config: {
            templateType: selectedTemplate?.type,
            branding: selectedTemplate?.branding,
            layout: selectedTemplate?.layout,
            formatting: selectedTemplate?.formatting,
            targetRoles: selectedRoles,
          },
        })
        .select()
        .single();

      if (manualError) throw manualError;

      // Create sections based on selected structure
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
    setSelectedTemplate(DEFAULT_TEMPLATES[0]);
    setSelectedRoles(["admin"]);
    setSelectedSections(STANDARD_STRUCTURE.map((s) => s.number));
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
        return selectedTemplate !== null;
      case 3:
        return true; // Branding is optional
      case 4:
        return selectedSections.length > 0;
      case 5:
        return selectedRoles.length > 0;
      default:
        return true;
    }
  };

  const stepTitles = [
    { icon: BookOpen, label: "Basic Info" },
    { icon: FileText, label: "Template" },
    { icon: Palette, label: "Branding" },
    { icon: List, label: "Structure" },
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
            Set up a new documentation manual with templates, branding, and structure
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

          {/* Step 2: Template Selection */}
          {step === 2 && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Select a document template that defines the structure and style of your manual
              </p>
              <div className="grid gap-3">
                {DEFAULT_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <Badge
                        variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                      >
                        {template.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Branding */}
          {step === 3 && (
            <div className="py-4">
              <TemplateStylingEditor
                template={selectedTemplate}
                onTemplateUpdate={(updated) => setSelectedTemplate(updated)}
              />
            </div>
          )}

          {/* Step 4: Section Structure */}
          {step === 4 && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select which sections to include in your manual (8-part standard structure)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSelectedSections(
                      selectedSections.length === STANDARD_STRUCTURE.length
                        ? []
                        : STANDARD_STRUCTURE.map((s) => s.number)
                    )
                  }
                >
                  {selectedSections.length === STANDARD_STRUCTURE.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="space-y-3">
                {STANDARD_STRUCTURE.map((section) => (
                  <div
                    key={section.number}
                    className={`p-3 border rounded-lg ${
                      selectedSections.includes(section.number)
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  >
                    <div
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => {
                        setSelectedSections((prev) =>
                          prev.includes(section.number)
                            ? prev.filter((s) => s !== section.number)
                            : [...prev, section.number]
                        );
                      }}
                    >
                      <Checkbox
                        checked={selectedSections.includes(section.number)}
                        onCheckedChange={() => {}}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Part {section.number}</Badge>
                          <span className="font-medium text-sm">{section.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {section.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {section.subsections.map((sub) => (
                            <Badge key={sub.number} variant="secondary" className="text-xs">
                              {sub.number}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Target Roles */}
          {step === 5 && (
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
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
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
                    <span className="text-muted-foreground">Template:</span>
                    <span className="ml-2 font-medium">{selectedTemplate?.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sections:</span>
                    <span className="ml-2 font-medium">{selectedSections.length} parts</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Roles:</span>
                    <span className="ml-2 font-medium">{selectedRoles.length} selected</span>
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

          {step < 5 ? (
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
