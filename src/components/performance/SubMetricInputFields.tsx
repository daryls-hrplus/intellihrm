import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileText, Link as LinkIcon, MessageSquare, CheckSquare } from "lucide-react";
import { useState } from "react";
import type { GoalSubMetricValue } from "@/hooks/useGoalSubMetrics";
import type { EvidenceType } from "@/types/goalEnhancements";
import { EVIDENCE_TYPE_LABELS } from "@/types/goalEnhancements";

interface SubMetricInputFieldsProps {
  subMetrics: GoalSubMetricValue[];
  onUpdate: (index: number, updates: Partial<GoalSubMetricValue>) => void;
  compositeProgress: number;
  subMetricProgress: { name: string; progress: number; weight: number }[];
  showEvidence?: boolean;
  showBaseline?: boolean;
  disabled?: boolean;
}

const evidenceIcons: Record<EvidenceType, typeof FileText> = {
  file: FileText,
  link: LinkIcon,
  note: MessageSquare,
  approval: CheckSquare,
};

export function SubMetricInputFields({
  subMetrics,
  onUpdate,
  compositeProgress,
  subMetricProgress,
  showEvidence = true,
  showBaseline = false,
  disabled = false,
}: SubMetricInputFieldsProps) {
  const [expandedEvidence, setExpandedEvidence] = useState<number | null>(null);

  if (subMetrics.length === 0) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-4 space-y-4">
        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">Composite Progress</span>
            <span className="text-lg font-bold text-primary">{compositeProgress.toFixed(1)}%</span>
          </div>
          <Progress value={compositeProgress} className="h-3" />
          {subMetricProgress.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
              {subMetricProgress.map((sm, i) => (
                <span key={i} className="bg-muted px-2 py-0.5 rounded">
                  {sm.name}: {sm.progress.toFixed(0)}% ({sm.weight}%)
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sub-Metric Inputs */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sub-Metrics</Label>
          {subMetrics.map((sm, idx) => {
            const progress = subMetricProgress.find((p) => p.name === sm.subMetricName);
            const EvidenceIcon = sm.evidenceType ? evidenceIcons[sm.evidenceType] : null;

            return (
              <div key={idx} className="p-3 bg-background rounded-lg border space-y-3">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{sm.subMetricName}</span>
                    {sm.unitOfMeasure && (
                      <span className="text-xs text-muted-foreground">({sm.unitOfMeasure})</span>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">{sm.weight}%</Badge>
                </div>

                {/* Input Row */}
                <div className="grid grid-cols-3 gap-2">
                  {showBaseline && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Baseline</Label>
                      <Input
                        type="number"
                        value={sm.baselineValue ?? ""}
                        onChange={(e) => onUpdate(idx, { 
                          baselineValue: e.target.value ? parseFloat(e.target.value) : null 
                        })}
                        placeholder="Before"
                        disabled={disabled}
                        className="h-8 text-sm"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Target</Label>
                    <Input
                      type="number"
                      value={sm.targetValue ?? ""}
                      onChange={(e) => onUpdate(idx, { 
                        targetValue: e.target.value ? parseFloat(e.target.value) : null 
                      })}
                      placeholder="Target"
                      disabled={disabled}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Current</Label>
                    <Input
                      type="number"
                      value={sm.currentValue || ""}
                      onChange={(e) => onUpdate(idx, { 
                        currentValue: parseFloat(e.target.value) || 0 
                      })}
                      placeholder="Current"
                      disabled={disabled}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                {progress && (
                  <div className="flex items-center gap-2">
                    <Progress value={progress.progress} className="h-1.5 flex-1" />
                    <span className="text-xs font-medium w-12 text-right">
                      {progress.progress.toFixed(0)}%
                    </span>
                  </div>
                )}

                {/* Evidence Section */}
                {showEvidence && (
                  <Collapsible 
                    open={expandedEvidence === idx} 
                    onOpenChange={(open) => setExpandedEvidence(open ? idx : null)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs">
                        <span className="flex items-center gap-1">
                          {EvidenceIcon && <EvidenceIcon className="h-3 w-3" />}
                          Evidence {sm.evidenceUrl || sm.evidenceNotes ? '✓' : ''}
                        </span>
                        <ChevronDown className={`h-3 w-3 transition-transform ${expandedEvidence === idx ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 space-y-2">
                      <Select
                        value={sm.evidenceType || ""}
                        onValueChange={(value: EvidenceType) => onUpdate(idx, { evidenceType: value })}
                        disabled={disabled}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Evidence type..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(EVIDENCE_TYPE_LABELS) as EvidenceType[]).map((type) => (
                            <SelectItem key={type} value={type} className="text-xs">
                              {EVIDENCE_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(sm.evidenceType === 'link' || sm.evidenceType === 'file') && (
                        <Input
                          type="url"
                          value={sm.evidenceUrl || ""}
                          onChange={(e) => onUpdate(idx, { evidenceUrl: e.target.value })}
                          placeholder={sm.evidenceType === 'link' ? 'https://...' : 'File URL...'}
                          disabled={disabled}
                          className="h-8 text-xs"
                        />
                      )}
                      {(sm.evidenceType === 'note' || sm.evidenceType === 'approval') && (
                        <Textarea
                          value={sm.evidenceNotes || ""}
                          onChange={(e) => onUpdate(idx, { evidenceNotes: e.target.value })}
                          placeholder={sm.evidenceType === 'note' ? 'Add notes...' : 'Approval details...'}
                          disabled={disabled}
                          className="text-xs min-h-[60px]"
                        />
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
