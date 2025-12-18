import { DocumentTemplate } from "./DocumentTemplateConfig";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutTemplate, 
  FileText, 
  Type,
  BookOpen,
  Target,
  HelpCircle,
  CheckSquare,
  ListChecks,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Clock,
  Users,
  Image,
  Hash,
  Link
} from "lucide-react";

interface TemplateConfigurationPanelProps {
  template: DocumentTemplate;
  onTemplateUpdate: (template: DocumentTemplate) => void;
}

// Layout option descriptions
const layoutDescriptions: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  includeTableOfContents: {
    label: "Table of Contents",
    description: "Adds a navigable table of contents at the beginning",
    icon: <ListChecks className="h-4 w-4" />
  },
  includeSummary: {
    label: "Summary",
    description: "Includes an executive summary section",
    icon: <FileText className="h-4 w-4" />
  },
  includePrerequisites: {
    label: "Prerequisites",
    description: "Shows requirements before starting",
    icon: <CheckSquare className="h-4 w-4" />
  },
  includeLearningObjectives: {
    label: "Learning Objectives",
    description: "Lists what users will learn",
    icon: <Target className="h-4 w-4" />
  },
  includeScreenshots: {
    label: "Screenshots",
    description: "Include visual screenshots in steps",
    icon: <Image className="h-4 w-4" />
  },
  includeStepNumbers: {
    label: "Step Numbers",
    description: "Number each step for easy reference",
    icon: <Hash className="h-4 w-4" />
  },
  includeTimeEstimates: {
    label: "Time Estimates",
    description: "Show estimated time for each section",
    icon: <Clock className="h-4 w-4" />
  },
  includeRoleIndicators: {
    label: "Role Indicators",
    description: "Show which roles can perform actions",
    icon: <Users className="h-4 w-4" />
  },
  includeVersionInfo: {
    label: "Version Info",
    description: "Track document version history",
    icon: <LayoutTemplate className="h-4 w-4" />
  },
  includeRelatedDocs: {
    label: "Related Documents",
    description: "Links to related documentation",
    icon: <Link className="h-4 w-4" />
  }
};

// Section descriptions
const sectionDescriptions: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  introduction: {
    label: "Introduction",
    description: "Opening section explaining document purpose",
    icon: <BookOpen className="h-4 w-4" />
  },
  overview: {
    label: "Overview",
    description: "High-level summary of the topic",
    icon: <FileText className="h-4 w-4" />
  },
  prerequisites: {
    label: "Prerequisites",
    description: "Requirements before starting",
    icon: <CheckSquare className="h-4 w-4" />
  },
  stepByStep: {
    label: "Step-by-Step Instructions",
    description: "Detailed procedures with screenshots",
    icon: <ListChecks className="h-4 w-4" />
  },
  bestPractices: {
    label: "Best Practices",
    description: "Tips for optimal results",
    icon: <Lightbulb className="h-4 w-4" />
  },
  troubleshooting: {
    label: "Troubleshooting",
    description: "Common issues and solutions",
    icon: <AlertTriangle className="h-4 w-4" />
  },
  faqs: {
    label: "FAQ Section",
    description: "Frequently asked questions",
    icon: <HelpCircle className="h-4 w-4" />
  },
  glossary: {
    label: "Glossary",
    description: "Definitions of key terms",
    icon: <BookOpen className="h-4 w-4" />
  },
  appendix: {
    label: "Appendix",
    description: "Supplementary reference materials",
    icon: <FileCheck className="h-4 w-4" />
  }
};

// Formatting option descriptions
const formattingDescriptions = {
  headerStyle: {
    label: "Header Style",
    description: "How section headings are formatted",
    options: [
      { value: "numbered", label: "Numbered (1. 1.1 1.1.1)", description: "Traditional numbered headings" },
      { value: "plain", label: "Plain Headers", description: "Clean text headings" },
      { value: "icon", label: "Icon Headers", description: "Headings with icons" }
    ]
  },
  calloutStyle: {
    label: "Callout Style",
    description: "How tips and warnings are displayed",
    options: [
      { value: "confluence", label: "Confluence Style", description: "Colored panels with icons" },
      { value: "github", label: "GitHub Style", description: "Blockquote with left border" },
      { value: "minimal", label: "Minimal", description: "Simple bordered boxes" }
    ]
  },
  screenshotPlacement: {
    label: "Screenshot Layout",
    description: "How images are positioned",
    options: [
      { value: "inline", label: "Inline with Text", description: "Screenshots flow with text" },
      { value: "sidebar", label: "Sidebar Layout", description: "Text left, images right" },
      { value: "annotated", label: "Annotated", description: "With numbered callouts" }
    ]
  }
};

export function TemplateConfigurationPanel({ template, onTemplateUpdate }: TemplateConfigurationPanelProps) {
  const handleLayoutToggle = (key: keyof DocumentTemplate['layout'], checked: boolean) => {
    onTemplateUpdate({
      ...template,
      layout: { ...template.layout, [key]: checked }
    });
  };

  const handleSectionToggle = (key: keyof DocumentTemplate['sections'], checked: boolean) => {
    onTemplateUpdate({
      ...template,
      sections: { ...template.sections, [key]: checked }
    });
  };

  const handleFormattingChange = (key: keyof DocumentTemplate['formatting'], value: string) => {
    onTemplateUpdate({
      ...template,
      formatting: { ...template.formatting, [key]: value }
    });
  };

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        {/* Document Structure */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Document Structure</h3>
              <p className="text-xs text-muted-foreground">Choose which elements to include</p>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(template.layout).map(([key, value]) => {
              const info = layoutDescriptions[key];
              if (!info) return null;
              return (
                <div 
                  key={key} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    value ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {info.icon}
                    </div>
                    <div>
                      <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                        {info.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => handleLayoutToggle(key as keyof DocumentTemplate['layout'], checked)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Content Sections */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Content Sections</h3>
              <p className="text-xs text-muted-foreground">Select which sections to generate</p>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(template.sections).map(([key, value]) => {
              const info = sectionDescriptions[key];
              if (!info) return null;
              return (
                <div 
                  key={key} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    value ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {info.icon}
                    </div>
                    <div>
                      <Label htmlFor={`section-${key}`} className="text-sm font-medium cursor-pointer">
                        {info.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={`section-${key}`}
                    checked={value}
                    onCheckedChange={(checked) => handleSectionToggle(key as keyof DocumentTemplate['sections'], checked)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Formatting Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Formatting & Style</h3>
              <p className="text-xs text-muted-foreground">Customize document appearance</p>
            </div>
          </div>
          <div className="space-y-4">
            {/* Header Style */}
            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div>
                <Label className="text-sm font-medium">{formattingDescriptions.headerStyle.label}</Label>
                <p className="text-xs text-muted-foreground">{formattingDescriptions.headerStyle.description}</p>
              </div>
              <Select
                value={template.formatting.headerStyle}
                onValueChange={(v) => handleFormattingChange('headerStyle', v)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {formattingDescriptions.headerStyle.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Callout Style */}
            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div>
                <Label className="text-sm font-medium">{formattingDescriptions.calloutStyle.label}</Label>
                <p className="text-xs text-muted-foreground">{formattingDescriptions.calloutStyle.description}</p>
              </div>
              <Select
                value={template.formatting.calloutStyle}
                onValueChange={(v) => handleFormattingChange('calloutStyle', v)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {formattingDescriptions.calloutStyle.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Screenshot Placement */}
            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div>
                <Label className="text-sm font-medium">{formattingDescriptions.screenshotPlacement.label}</Label>
                <p className="text-xs text-muted-foreground">{formattingDescriptions.screenshotPlacement.description}</p>
              </div>
              <Select
                value={template.formatting.screenshotPlacement}
                onValueChange={(v) => handleFormattingChange('screenshotPlacement', v)}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {formattingDescriptions.screenshotPlacement.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
