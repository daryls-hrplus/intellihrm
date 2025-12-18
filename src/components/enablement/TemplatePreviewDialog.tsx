import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  FileText,
  FileCheck,
  Zap,
  LayoutTemplate,
  Check,
  List,
  Image,
  AlertTriangle,
  Info,
  CheckCircle,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { DocumentTemplate } from "./DocumentTemplateConfig";

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: DocumentTemplate | null;
  onSelect: (template: DocumentTemplate) => void;
}

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
  onSelect,
}: TemplatePreviewDialogProps) {
  if (!template) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'training_guide': return <BookOpen className="h-5 w-5" />;
      case 'user_manual': return <FileText className="h-5 w-5" />;
      case 'sop': return <FileCheck className="h-5 w-5" />;
      case 'quick_start': return <Zap className="h-5 w-5" />;
      default: return <LayoutTemplate className="h-5 w-5" />;
    }
  };

  const getIndustryStandard = (type: string) => {
    switch (type) {
      case 'training_guide':
        return {
          standard: "ADDIE Model + Bloom's Taxonomy",
          description: "Follows instructional design best practices with clear learning objectives, scaffolded content, and assessment checkpoints.",
          useCases: ["New employee onboarding", "Feature training", "Role-based learning paths", "Certification programs"]
        };
      case 'user_manual':
        return {
          standard: "DITA (Darwin Information Typing Architecture)",
          description: "Topic-based authoring with modular, reusable content blocks following technical documentation standards.",
          useCases: ["End-user documentation", "Reference guides", "Feature documentation", "Help center articles"]
        };
      case 'sop':
        return {
          standard: "ISO 9001 Documentation Standards",
          description: "Structured procedural documentation with version control, approval workflows, and compliance tracking.",
          useCases: ["Business processes", "Compliance procedures", "Safety protocols", "Quality assurance"]
        };
      case 'quick_start':
        return {
          standard: "Progressive Disclosure Pattern",
          description: "Minimalist approach focusing on immediate value delivery with optional deep-dives for advanced users.",
          useCases: ["Getting started guides", "Quick tutorials", "Cheat sheets", "Executive summaries"]
        };
      case 'technical_doc':
        return {
          standard: "Diátaxis Documentation Framework",
          description: "Separates tutorials, how-to guides, reference, and explanation for comprehensive technical coverage.",
          useCases: ["API documentation", "Developer guides", "System architecture", "Integration manuals"]
        };
      default:
        return {
          standard: "Custom Documentation",
          description: "Flexible template for various documentation needs.",
          useCases: ["General documentation", "Custom requirements"]
        };
    }
  };

  const industryInfo = getIndustryStandard(template.type);

  const handleSelect = () => {
    onSelect(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getCategoryIcon(template.type)}
            </div>
            <div>
              <DialogTitle className="text-xl">{template.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Industry Standard Badge */}
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Industry Standard
              </Badge>
              <span className="font-medium">{industryInfo.standard}</span>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                About This Template
              </h4>
              <p className="text-sm text-muted-foreground">{industryInfo.description}</p>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Ideal Use Cases
              </h4>
              <div className="flex flex-wrap gap-2">
                {industryInfo.useCases.map((useCase, index) => (
                  <Badge key={index} variant="outline">{useCase}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Document Structure Preview */}
            <div>
              <h4 className="font-medium mb-3">Document Structure Preview</h4>
              <div className="border rounded-lg overflow-hidden bg-background">
                {/* Header Preview */}
                <div className={`p-4 border-b ${template.formatting.headerStyle === 'icon' ? 'bg-primary/10' : template.formatting.headerStyle === 'plain' ? 'bg-muted/30' : 'bg-muted/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {template.branding.logoUrl && (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Image className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">{template.branding.companyName || "Company Name"}</div>
                        <div className="text-xs text-muted-foreground">Document Title</div>
                      </div>
                    </div>
                    {template.layout.includeVersionInfo && (
                      <Badge variant="outline" className="text-xs">v1.0</Badge>
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="p-4 space-y-4">
                  {/* Title Section */}
                  <div className="space-y-1">
                    <div className="h-6 w-3/4 bg-foreground/80 rounded" />
                    <div className="h-3 w-1/2 bg-muted-foreground/30 rounded" />
                  </div>

                  {/* Table of Contents */}
                  {template.layout.includeTableOfContents && (
                    <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <List className="h-3 w-3" />
                        Table of Contents
                      </div>
                      <div className="space-y-1 pl-4">
                        <div className="h-2 w-32 bg-muted rounded" />
                        <div className="h-2 w-40 bg-muted rounded" />
                        <div className="h-2 w-36 bg-muted rounded" />
                      </div>
                    </div>
                  )}

                  {/* Sections Preview */}
                  <div className="space-y-3">
                    {template.layout.includeLearningObjectives && (
                      <div className="flex items-start gap-2 p-2 bg-primary/5 rounded border-l-2 border-primary">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-xs font-medium">Learning Objectives</div>
                          <div className="h-2 w-48 bg-muted rounded" />
                        </div>
                      </div>
                    )}
                    {template.sections.prerequisites && (
                      <div className="flex items-start gap-2 p-2 bg-amber-500/5 rounded border-l-2 border-amber-500">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-xs font-medium">Prerequisites</div>
                          <div className="h-2 w-40 bg-muted rounded" />
                        </div>
                      </div>
                    )}
                    {template.sections.stepByStep && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium">Step-by-Step Instructions</div>
                        <div className="space-y-2 pl-4">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">1</div>
                            <div className="h-2 w-48 bg-muted rounded" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">2</div>
                            <div className="h-2 w-52 bg-muted rounded" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">3</div>
                            <div className="h-2 w-44 bg-muted rounded" />
                          </div>
                        </div>
                      </div>
                    )}
                    {template.layout.includeScreenshots && (
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Image className="h-3 w-3" />
                          Screenshot Placeholder
                        </div>
                        <div className="h-20 bg-muted/50 rounded flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      </div>
                    )}
                    {template.sections.bestPractices && (
                      <div className="flex items-start gap-2 p-2 bg-blue-500/5 rounded border-l-2 border-blue-500">
                        <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-xs font-medium">Best Practices</div>
                          <div className="h-2 w-56 bg-muted rounded" />
                        </div>
                      </div>
                    )}
                    {template.sections.troubleshooting && (
                      <div className="flex items-start gap-2 p-2 bg-destructive/5 rounded border-l-2 border-destructive">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-xs font-medium">Troubleshooting</div>
                          <div className="h-2 w-44 bg-muted rounded" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Preview */}
                {template.branding.footerText && (
                  <div className="p-3 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{template.branding.footerText}</span>
                    <span>Page 1 of 5</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Template Features - Layout */}
            <div>
              <h4 className="font-medium mb-3">Layout Features</h4>
              <div className="grid grid-cols-2 gap-3">
                <FeatureItem 
                  enabled={template.layout.includeTableOfContents} 
                  label="Table of Contents" 
                />
                <FeatureItem 
                  enabled={template.layout.includeSummary} 
                  label="Executive Summary" 
                />
                <FeatureItem 
                  enabled={template.layout.includeLearningObjectives} 
                  label="Learning Objectives" 
                />
                <FeatureItem 
                  enabled={template.layout.includePrerequisites} 
                  label="Prerequisites" 
                />
                <FeatureItem 
                  enabled={template.layout.includeScreenshots} 
                  label="Screenshots" 
                />
                <FeatureItem 
                  enabled={template.layout.includeStepNumbers} 
                  label="Step Numbers" 
                />
                <FeatureItem 
                  enabled={template.layout.includeTimeEstimates} 
                  label="Time Estimates" 
                />
                <FeatureItem 
                  enabled={template.layout.includeRoleIndicators} 
                  label="Role Indicators" 
                />
                <FeatureItem 
                  enabled={template.layout.includeVersionInfo} 
                  label="Version Info" 
                />
                <FeatureItem 
                  enabled={template.layout.includeRelatedDocs} 
                  label="Related Documents" 
                />
              </div>
            </div>

            {/* Sections */}
            <div>
              <h4 className="font-medium mb-3">Document Sections</h4>
              <div className="grid grid-cols-3 gap-3">
                <FeatureItem enabled={template.sections.introduction} label="Introduction" />
                <FeatureItem enabled={template.sections.overview} label="Overview" />
                <FeatureItem enabled={template.sections.prerequisites} label="Prerequisites" />
                <FeatureItem enabled={template.sections.stepByStep} label="Step-by-Step" />
                <FeatureItem enabled={template.sections.bestPractices} label="Best Practices" />
                <FeatureItem enabled={template.sections.troubleshooting} label="Troubleshooting" />
                <FeatureItem enabled={template.sections.faqs} label="FAQs" />
                <FeatureItem enabled={template.sections.glossary} label="Glossary" />
                <FeatureItem enabled={template.sections.appendix} label="Appendix" />
              </div>
            </div>

            {/* Formatting Preview */}
            <div>
              <h4 className="font-medium mb-3">Formatting Style</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Header Style</div>
                  <div className="font-medium capitalize">{template.formatting.headerStyle}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Callout Style</div>
                  <div className="font-medium capitalize">{template.formatting.calloutStyle}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Screenshot Placement</div>
                  <div className="font-medium capitalize">{template.formatting.screenshotPlacement}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Code Block Theme</div>
                  <div className="font-medium capitalize">{template.formatting.codeBlockTheme}</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect}>
            <Check className="h-4 w-4 mr-2" />
            Use This Template
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureItem({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${enabled ? 'bg-primary/5' : 'bg-muted/30'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${enabled ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        {enabled && <Check className="h-3 w-3" />}
      </div>
      <span className={`text-sm ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
    </div>
  );
}
