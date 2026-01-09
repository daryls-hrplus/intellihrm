import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  FileText, 
  FileCheck, 
  Zap, 
  LayoutTemplate,
  Check
} from "lucide-react";
import { DocumentType, DOCUMENT_TYPE_LABELS } from "@/hooks/useDocumentTemplates";

interface TemplateTypeSelectorProps {
  value: DocumentType;
  onChange: (type: DocumentType) => void;
  showDescriptions?: boolean;
}

const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { 
  icon: React.ReactNode; 
  description: string;
  color: string;
}> = {
  training_guide: {
    icon: <BookOpen className="h-5 w-5" />,
    description: "Comprehensive training with learning objectives and assessments",
    color: "text-blue-600"
  },
  user_manual: {
    icon: <FileText className="h-5 w-5" />,
    description: "Standard user manual with detailed instructions",
    color: "text-emerald-600"
  },
  sop: {
    icon: <FileCheck className="h-5 w-5" />,
    description: "Formal SOP with approval sections and compliance elements",
    color: "text-purple-600"
  },
  quick_start: {
    icon: <Zap className="h-5 w-5" />,
    description: "Concise getting-started guide for rapid onboarding",
    color: "text-amber-600"
  },
  technical_doc: {
    icon: <LayoutTemplate className="h-5 w-5" />,
    description: "Technical documentation for developers and admins",
    color: "text-slate-600"
  }
};

export function TemplateTypeSelector({ 
  value, 
  onChange, 
  showDescriptions = true 
}: TemplateTypeSelectorProps) {
  const types: DocumentType[] = ['training_guide', 'user_manual', 'sop', 'quick_start', 'technical_doc'];

  return (
    <div className="grid gap-3">
      {types.map((type) => {
        const config = DOCUMENT_TYPE_CONFIG[type];
        const isSelected = value === type;
        
        return (
          <Card
            key={type}
            className={cn(
              "p-3 cursor-pointer transition-all",
              isSelected 
                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                : "hover:border-muted-foreground/50"
            )}
            onClick={() => onChange(type)}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg bg-muted",
                isSelected && "bg-primary/10"
              )}>
                <span className={config.color}>{config.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{DOCUMENT_TYPE_LABELS[type]}</h4>
                  {isSelected && (
                    <Badge variant="default" className="text-xs gap-1">
                      <Check className="h-3 w-3" />
                      Selected
                    </Badge>
                  )}
                </div>
                {showDescriptions && (
                  <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Compact version for inline use
export function TemplateTypeBadge({ type }: { type: DocumentType }) {
  const config = DOCUMENT_TYPE_CONFIG[type];
  
  return (
    <Badge variant="outline" className="gap-1.5">
      <span className={config.color}>{config.icon}</span>
      {DOCUMENT_TYPE_LABELS[type]}
    </Badge>
  );
}
