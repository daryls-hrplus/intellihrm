import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TYPE_FIELD_CONFIG, GoalType } from "./LevelFieldConfig";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SmartCriteria {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
}

interface StepAlignmentProps {
  goalType: GoalType;
  smartCriteria: SmartCriteria;
  onSmartChange: (updates: Partial<SmartCriteria>) => void;
}

const SMART_FIELDS = [
  {
    key: "specific" as const,
    label: "Specific",
    placeholder: "What exactly do you want to accomplish? Be precise and clear.",
    helper: "Define the who, what, where, when, and why",
  },
  {
    key: "measurable" as const,
    label: "Measurable",
    placeholder: "How will you measure success? What metrics will you track?",
    helper: "Include quantities, percentages, or clear indicators",
  },
  {
    key: "achievable" as const,
    label: "Achievable",
    placeholder: "Is this goal realistic given your resources and constraints?",
    helper: "Consider skills, time, and available support",
  },
  {
    key: "relevant" as const,
    label: "Relevant",
    placeholder: "Why is this goal important? How does it align with broader objectives?",
    helper: "Connect to team, department, or company priorities",
  },
  {
    key: "time_bound" as const,
    label: "Time-Bound",
    placeholder: "What is the deadline? What are the key milestones?",
    helper: "Set clear checkpoints and final completion date",
  },
];

export function StepAlignment({
  goalType,
  smartCriteria,
  onSmartChange,
}: StepAlignmentProps) {
  const typeConfig = TYPE_FIELD_CONFIG[goalType];
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["specific"]));

  const toggleSection = (key: string) => {
    const newSet = new Set(openSections);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setOpenSections(newSet);
  };

  const isCriteriaFilled = (key: keyof SmartCriteria) => {
    return smartCriteria[key] && smartCriteria[key].trim().length > 0;
  };

  const filledCount = SMART_FIELDS.filter(f => isCriteriaFilled(f.key)).length;

  // SMART Goals - show SMART criteria
  if (typeConfig.showSmartCriteria) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">SMART Criteria</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Complete each section to ensure your goal is well-defined
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {filledCount}/5 completed
          </div>
        </div>

        <div className="space-y-2">
          {SMART_FIELDS.map((field) => {
            const isFilled = isCriteriaFilled(field.key);
            const isOpen = openSections.has(field.key);

            return (
              <Collapsible
                key={field.key}
                open={isOpen}
                onOpenChange={() => toggleSection(field.key)}
              >
                <CollapsibleTrigger className="w-full">
                  <div
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      isOpen ? "bg-muted/50" : "hover:bg-muted/30",
                      isFilled && !isOpen && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {isFilled ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        isFilled && "text-primary"
                      )}>
                        {field.label}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-3 pb-1 px-1">
                    <p className="text-xs text-muted-foreground mb-2">{field.helper}</p>
                    <Textarea
                      value={smartCriteria[field.key]}
                      onChange={(e) => onSmartChange({ [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={2}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    );
  }

  // OKR Objective - Show key results info
  if (typeConfig.showKeyResults) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Key Results</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Key Results are measurable outcomes that track progress toward your objective
          </p>
        </div>

        <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-center">
          <p className="text-sm text-muted-foreground">
            After creating this objective, you'll be able to add Key Results to measure progress.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Tip: Aim for 3-5 Key Results per Objective for optimal focus.
          </p>
        </div>

        {/* Optional notes section */}
        <div className="space-y-2">
          <Label htmlFor="objective_notes">Objective Notes (Optional)</Label>
          <Textarea
            id="objective_notes"
            value={smartCriteria.specific}
            onChange={(e) => onSmartChange({ specific: e.target.value })}
            placeholder="Add any additional context or notes for this objective..."
            rows={3}
          />
        </div>
      </div>
    );
  }

  // Key Result - Link to parent objective info
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium">Key Result Configuration</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Key Results should be quantifiable and directly contribute to an objective
        </p>
      </div>

      <div className="p-3 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Tip:</span>{" "}
          Use the "Align to Parent Goal" option in Step 2 to link this Key Result to its parent Objective.
        </p>
      </div>

      {/* Success criteria */}
      <div className="space-y-2">
        <Label htmlFor="success_criteria">Success Criteria</Label>
        <Textarea
          id="success_criteria"
          value={smartCriteria.measurable}
          onChange={(e) => onSmartChange({ measurable: e.target.value })}
          placeholder="Describe what success looks like for this Key Result..."
          rows={2}
        />
      </div>
    </div>
  );
}
