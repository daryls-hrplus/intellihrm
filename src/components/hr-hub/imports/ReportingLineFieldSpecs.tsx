import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Eye, Info, Lightbulb } from "lucide-react";
import { useState } from "react";

interface FieldSpec {
  name: string;
  required: boolean;
  example: string;
  description: string;
  notes?: string[];
}

interface ReportingLineFieldSpecsProps {
  mode: "primary" | "matrix";
  onViewPositions: () => void;
}

export function ReportingLineFieldSpecs({ 
  mode, 
  onViewPositions 
}: ReportingLineFieldSpecsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [tipsOpen, setTipsOpen] = useState(false);

  const primaryFields: FieldSpec[] = [
    {
      name: "position_code",
      required: true,
      example: "HR-MGR-001",
      description: "The position that will have its reporting line updated",
      notes: [
        "Use position code from your company directly",
        "For other companies: use COMPANY_CODE:POSITION_CODE format",
        "Example cross-company: AUR-CORP:CFO-001"
      ]
    },
    {
      name: "reports_to_position_code",
      required: false,
      example: "HR-DIR-001",
      description: "The new supervisor position",
      notes: [
        "Leave empty to clear existing supervisor",
        "Same company: use position code directly",
        "Cross-company: use COMPANY_CODE:POSITION_CODE format"
      ]
    }
  ];

  const matrixFields: FieldSpec[] = [
    {
      name: "position_code",
      required: true,
      example: "FIN-ANALYST-001",
      description: "The position to add/remove matrix supervisor from",
      notes: [
        "Use position code from your company directly"
      ]
    },
    {
      name: "matrix_supervisor_code",
      required: true,
      example: "PROJ:PM-001",
      description: "The matrix supervisor position",
      notes: [
        "Can be from any allowed company",
        "Use COMPANY_CODE:POSITION_CODE for cross-company"
      ]
    },
    {
      name: "relationship_type",
      required: false,
      example: "functional",
      description: "Type of matrix relationship",
      notes: [
        "Options: functional, project, technical, administrative",
        "Defaults to 'functional' if not specified"
      ]
    },
    {
      name: "action",
      required: false,
      example: "add",
      description: "Whether to add or remove this relationship",
      notes: [
        "Options: add, remove",
        "Defaults to 'add' if not specified"
      ]
    }
  ];

  const fields = mode === "primary" ? primaryFields : matrixFields;

  const tips = [
    "Position codes are case-insensitive",
    "Use COMPANY_CODE:POSITION_CODE for cross-company supervisors",
    "Leave reports_to_position_code empty to clear the existing supervisor",
    "Download the position list first to verify codes exist",
    "Check Company Relationships to understand cross-entity rules"
  ];

  return (
    <div className="space-y-3">
      {/* Field Specifications */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Field Specifications</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="border rounded-lg divide-y">
            {fields.map((field) => (
              <div key={field.name} className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-medium bg-muted px-2 py-0.5 rounded">
                      {field.name}
                    </code>
                    {field.required ? (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    )}
                  </div>
                  {field.name.includes("position") && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs gap-1"
                      onClick={onViewPositions}
                    >
                      <Eye className="h-3 w-3" />
                      View valid values
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{field.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Example:</span>
                  <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded">{field.example}</code>
                </div>
                {field.notes && field.notes.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-0.5 pl-4">
                    {field.notes.map((note, idx) => (
                      <li key={idx} className="list-disc">{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Tips Section */}
      <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-sm text-yellow-800 dark:text-yellow-200">Tips for successful imports</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-yellow-600 transition-transform ${tipsOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 bg-yellow-50/50 dark:bg-yellow-950/10">
            <ul className="space-y-1.5">
              {tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
