import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Target, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Heart,
  ChevronDown,
  ChevronRight,
  Settings2,
  Eye,
  Clock,
  GripVertical,
  Plus,
  Trash2,
  Info,
  AlertTriangle
} from "lucide-react";
import type { 
  AppraisalTemplateSection, 
  CreateTemplateSectionInput,
  SectionScoringMethod,
  AppraisalSectionType 
} from "@/types/appraisalFormTemplates";
import { SECTION_TYPE_PRESETS } from "@/types/appraisalFormTemplates";

interface Props {
  sections: AppraisalTemplateSection[];
  templateId: string;
  weightEnforcement: 'strict' | 'relaxed' | 'none';
  onAddSection: (input: CreateTemplateSectionInput) => Promise<any>;
  onUpdateSection: (data: Partial<AppraisalTemplateSection> & { id: string }) => Promise<any>;
  onDeleteSection: (id: string) => Promise<void>;
  onReorderSections: (orderedIds: string[]) => Promise<void>;
  isUpdating?: boolean;
}

const getSectionIcon = (sectionType: string) => {
  switch (sectionType) {
    case "goals": return Target;
    case "competencies": return BookOpen;
    case "responsibilities": return Users;
    case "feedback_360": return MessageSquare;
    case "values": return Heart;
    default: return Target;
  }
};

const SCORING_METHODS: { value: SectionScoringMethod; label: string; description: string }[] = [
  { value: "numeric", label: "Numeric Rating", description: "1-5 scale scores" },
  { value: "qualitative", label: "Qualitative", description: "Text-only feedback" },
  { value: "advisory", label: "Advisory", description: "Informs but doesn't score" },
  { value: "pass_fail", label: "Pass/Fail", description: "Binary outcome" },
];

export function TemplateSectionConfigPanel({
  sections,
  templateId,
  weightEnforcement,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onReorderSections,
  isUpdating,
}: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionType, setNewSectionType] = useState<AppraisalSectionType>("goals");

  // Calculate total weight
  const totalWeight = sections
    .filter(s => s.include_in_final_score && s.is_active && !s.is_advisory_only)
    .reduce((sum, s) => sum + s.weight, 0);

  const weightValid = 
    weightEnforcement === 'none' ||
    (weightEnforcement === 'relaxed' && totalWeight <= 100) ||
    (weightEnforcement === 'strict' && totalWeight === 100);

  const handleAddSection = async () => {
    const preset = SECTION_TYPE_PRESETS[newSectionType];
    const newSection: CreateTemplateSectionInput = {
      template_id: templateId,
      section_type: newSectionType,
      display_name: preset.label,
      display_order: sections.length,
      scoring_method: preset.defaultScoringMethod,
      data_source: preset.defaultDataSource,
      ai_interpretation_hint: preset.aiHint,
      is_advisory_only: preset.is360,
      weight: preset.is360 ? 0 : 20,
      include_in_final_score: !preset.is360,
    };
    
    await onAddSection(newSection);
    setShowAddSection(false);
  };

  const handleUpdateWeight = async (section: AppraisalTemplateSection, weight: number) => {
    await onUpdateSection({ id: section.id, weight });
  };

  const handleUpdateScoring = async (section: AppraisalTemplateSection, scoring_method: SectionScoringMethod) => {
    const isAdvisory = scoring_method === 'advisory';
    await onUpdateSection({ 
      id: section.id, 
      scoring_method,
      is_advisory_only: isAdvisory,
      include_in_final_score: !isAdvisory,
      weight: isAdvisory ? 0 : section.weight,
    });
  };

  return (
    <div className="space-y-4">
      {/* Weight Summary Alert */}
      <Alert variant={weightValid ? "default" : "destructive"}>
        {weightValid ? (
          <Info className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <AlertDescription className="flex items-center justify-between">
          <span>
            {weightEnforcement === 'none' 
              ? "Qualitative mode - weights not enforced"
              : `Total weight: ${totalWeight}%`}
          </span>
          {weightEnforcement !== 'none' && (
            <Badge variant={weightValid ? "outline" : "destructive"}>
              {weightEnforcement === 'strict' ? "Must equal 100%" : "Max 100%"}
            </Badge>
          )}
        </AlertDescription>
      </Alert>

      {/* Section List */}
      <div className="space-y-2">
        {sections.map((section) => {
          const Icon = getSectionIcon(section.section_type);
          const isExpanded = expandedSection === section.id;
          const is360 = section.section_type === 'feedback_360';

          return (
            <Collapsible
              key={section.id}
              open={isExpanded}
              onOpenChange={(open) => setExpandedSection(open ? section.id : null)}
            >
              <Card className={`border ${!section.is_active ? 'opacity-50' : ''}`}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium flex-1 text-left">{section.display_name}</span>
                    
                    {section.is_advisory_only ? (
                      <Badge variant="secondary" className="mr-2">Advisory</Badge>
                    ) : (
                      <Badge variant="outline" className="mr-2">{section.weight}%</Badge>
                    )}
                    
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 space-y-4">
                    {/* 360 Advisory Warning */}
                    {is360 && !section.is_advisory_only && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Industry Best Practice:</strong> 360 feedback is typically advisory-only. 
                          Scoring 360 feedback directly may introduce bias and reduce legal defensibility.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Scoring Method */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Scoring Method</Label>
                        <Select 
                          value={section.scoring_method} 
                          onValueChange={(v) => handleUpdateScoring(section, v as SectionScoringMethod)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SCORING_METHODS.map(method => (
                              <SelectItem key={method.value} value={method.value}>
                                <div>
                                  <div>{method.label}</div>
                                  <div className="text-xs text-muted-foreground">{method.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Weight (only if not advisory) */}
                      {!section.is_advisory_only && weightEnforcement !== 'none' && (
                        <div className="space-y-2">
                          <Label>Weight</Label>
                          <div className="flex items-center gap-3">
                            <Slider
                              value={[section.weight]}
                              onValueChange={([v]) => handleUpdateWeight(section, v)}
                              max={100}
                              step={5}
                              className="flex-1"
                              disabled={isUpdating}
                            />
                            <span className="w-12 text-right font-mono text-sm">{section.weight}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date & Reminder Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Deadline Offset (days before evaluation)
                        </Label>
                        <Input
                          type="number"
                          value={section.deadline_offset_days}
                          onChange={(e) => onUpdateSection({ 
                            id: section.id, 
                            deadline_offset_days: parseInt(e.target.value) || 0 
                          })}
                          min={0}
                          max={90}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Settings2 className="h-3 w-3" />
                          Required
                        </Label>
                        <div className="flex items-center gap-2 h-10">
                          <Switch
                            checked={section.is_required}
                            onCheckedChange={(checked) => onUpdateSection({ 
                              id: section.id, 
                              is_required: checked 
                            })}
                          />
                          <span className="text-sm text-muted-foreground">
                            {section.is_required ? "Required" : "Optional"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visibility Settings */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        Visibility
                      </Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <Switch
                            checked={section.visible_to_employee}
                            onCheckedChange={(checked) => onUpdateSection({ 
                              id: section.id, 
                              visible_to_employee: checked 
                            })}
                          />
                          Employee
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Switch
                            checked={section.visible_to_manager}
                            onCheckedChange={(checked) => onUpdateSection({ 
                              id: section.id, 
                              visible_to_manager: checked 
                            })}
                          />
                          Manager
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Switch
                            checked={section.visible_to_hr}
                            onCheckedChange={(checked) => onUpdateSection({ 
                              id: section.id, 
                              visible_to_hr: checked 
                            })}
                          />
                          HR
                        </label>
                      </div>
                    </div>

                    {/* AI Interpretation Hint */}
                    <div className="space-y-2">
                      <Label>AI Interpretation Hint</Label>
                      <Textarea
                        value={section.ai_interpretation_hint || ""}
                        onChange={(e) => onUpdateSection({ 
                          id: section.id, 
                          ai_interpretation_hint: e.target.value 
                        })}
                        placeholder="Describe how AI should interpret this section..."
                        className="h-20 resize-none text-sm"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.is_active}
                          onCheckedChange={(checked) => onUpdateSection({ 
                            id: section.id, 
                            is_active: checked 
                          })}
                        />
                        <span className="text-sm text-muted-foreground">
                          {section.is_active ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSection(section.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Add Section */}
      {showAddSection ? (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Select value={newSectionType} onValueChange={(v) => setNewSectionType(v as AppraisalSectionType)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SECTION_TYPE_PRESETS).map(([type, preset]) => (
                    <SelectItem key={type} value={type}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddSection} disabled={isUpdating}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setShowAddSection(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          className="w-full border-dashed"
          onClick={() => setShowAddSection(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      )}
    </div>
  );
}
