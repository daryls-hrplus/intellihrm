import { useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, 
  User, 
  UserCheck, 
  Target, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Heart,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  Info,
  Star
} from "lucide-react";
import type { 
  AppraisalTemplateSection, 
  AppraisalTemplatePhase,
  ExtendedAppraisalFormTemplate
} from "@/types/appraisalFormTemplates";
import { 
  SECTION_TYPE_PRESETS, 
  PHASE_TYPE_PRESETS 
} from "@/types/appraisalFormTemplates";
import { calculateAllPhaseDates, formatDateRange } from "@/utils/appraisalDateCalculations";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Props {
  template: Partial<ExtendedAppraisalFormTemplate>;
  sections: AppraisalTemplateSection[];
  phases: AppraisalTemplatePhase[];
  sampleStartDate?: Date;
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

export function AppraisalFormTemplatePreview({ 
  template, 
  sections, 
  phases,
  sampleStartDate = new Date(new Date().getFullYear() + 1, 0, 1) 
}: Props) {
  const [viewAs, setViewAs] = useState<"employee" | "manager">("employee");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["goals"]));

  // Calculate phase dates for preview
  const phasesWithDates = useMemo(() => {
    return calculateAllPhaseDates(phases, sampleStartDate);
  }, [phases, sampleStartDate]);

  // Filter sections by visibility
  const visibleSections = useMemo(() => {
    return sections.filter(s => {
      if (viewAs === "employee") return s.visible_to_employee;
      if (viewAs === "manager") return s.visible_to_manager;
      return true;
    }).filter(s => s.is_active);
  }, [sections, viewAs]);

  // Calculate evaluation deadline
  const evaluationDeadline = useMemo(() => {
    const durationDays = template.default_duration_days || 365;
    const offsetDays = template.default_evaluation_offset_days || 14;
    const endDate = addDays(sampleStartDate, durationDays);
    return addDays(endDate, -offsetDays);
  }, [sampleStartDate, template]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Mock ratings for preview
  const mockRatings = [1, 2, 3, 4, 5];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Template Preview</CardTitle>
          </div>
          <Tabs value={viewAs} onValueChange={(v) => setViewAs(v as "employee" | "manager")}>
            <TabsList className="h-8">
              <TabsTrigger value="employee" className="text-xs px-3">
                <User className="h-3 w-3 mr-1" />
                Employee
              </TabsTrigger>
              <TabsTrigger value="manager" className="text-xs px-3">
                <UserCheck className="h-3 w-3 mr-1" />
                Manager
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ScrollArea className="h-[500px] pr-4">
          {/* Phase Timeline Preview */}
          {phasesWithDates.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Phase Timeline
              </h4>
              <div className="relative pl-4 border-l-2 border-muted space-y-3">
                {phasesWithDates.map((phase, index) => {
                  const presets = PHASE_TYPE_PRESETS[phase.phase_type as keyof typeof PHASE_TYPE_PRESETS];
                  const isFirst = index === 0;
                  
                  return (
                    <div key={phase.id} className="relative">
                      <div className={`absolute -left-[21px] w-4 h-4 rounded-full border-2 ${
                        isFirst ? "bg-primary border-primary" : "bg-background border-muted-foreground"
                      }`} />
                      <div className="ml-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{phase.phase_name}</span>
                          {phase.is_mandatory && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {phase.calculated_start_date && phase.calculated_end_date && (
                            formatDateRange(phase.calculated_start_date, phase.calculated_end_date)
                          )}
                          <span className="text-muted-foreground/60">
                            ({phase.duration_days} days)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Section Preview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Evaluation Sections
            </h4>

            {visibleSections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No sections configured yet
              </div>
            ) : (
              visibleSections.map((section) => {
                const Icon = getSectionIcon(section.section_type);
                const isExpanded = expandedSections.has(section.id);
                const isAdvisory = section.is_advisory_only;
                
                // Calculate section deadline
                const sectionDeadline = addDays(evaluationDeadline, -section.deadline_offset_days);

                return (
                  <Collapsible 
                    key={section.id} 
                    open={isExpanded}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">{section.display_name}</span>
                            {isAdvisory ? (
                              <Badge variant="secondary" className="text-xs">
                                <Info className="h-3 w-3 mr-1" />
                                Advisory
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {section.weight}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Due: {format(sectionDeadline, "MMM d")}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="px-3 pb-3 space-y-3">
                          <Separator />
                          
                          {/* Advisory Message */}
                          {isAdvisory && (
                            <div className="flex items-start gap-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{section.advisory_label || "This feedback informs manager judgment but does not directly calculate into the final score."}</span>
                            </div>
                          )}

                          {/* Mock Content Based on Section Type */}
                          {section.section_type === "goals" && (
                            <div className="space-y-2">
                              <div className="p-2 border rounded bg-background">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm font-medium">Complete Q4 Project Deliverables</span>
                                  <Badge variant="outline" className="text-xs">In Progress</Badge>
                                </div>
                                <Progress value={75} className="h-2 mb-2" />
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Progress: 75%</span>
                                  {!isAdvisory && section.scoring_method === "numeric" && (
                                    <div className="flex gap-1">
                                      {mockRatings.map((r) => (
                                        <button 
                                          key={r}
                                          className={`w-6 h-6 text-xs rounded border ${r === 4 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                                        >
                                          {r}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {section.section_type === "competencies" && (
                            <div className="space-y-2">
                              <div className="p-2 border rounded bg-background">
                                <div className="flex justify-between items-center mb-2">
                                  <div>
                                    <span className="text-sm font-medium">Communication</span>
                                    <span className="text-xs text-muted-foreground ml-2">(Level 3 Expected)</span>
                                  </div>
                                  {!isAdvisory && (
                                    <div className="flex gap-1">
                                      {mockRatings.map((r) => (
                                        <button 
                                          key={r}
                                          className={`w-6 h-6 text-xs rounded border ${r === 3 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                                        >
                                          {r}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <textarea 
                                  placeholder="Add comments..."
                                  className="w-full text-xs p-2 border rounded resize-none h-16 bg-background"
                                  disabled
                                />
                              </div>
                            </div>
                          )}

                          {section.section_type === "feedback_360" && (
                            <div className="space-y-2">
                              <div className="p-2 border rounded bg-background">
                                <div className="flex items-center gap-2 mb-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Peer Feedback Summary</span>
                                </div>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>Responses Received:</span>
                                    <span className="font-medium">5 of 7</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Average Rating:</span>
                                    <span className="font-medium flex items-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-500" /> 4.2
                                    </span>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                                  View Detailed Feedback
                                </Button>
                              </div>
                            </div>
                          )}

                          {(section.section_type === "values" || section.section_type === "responsibilities") && (
                            <div className="space-y-2">
                              <div className="p-2 border rounded bg-background">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium">
                                    {section.section_type === "values" ? "Integrity & Trust" : "Team Leadership"}
                                  </span>
                                  {!isAdvisory && (
                                    <div className="flex gap-1">
                                      {mockRatings.map((r) => (
                                        <button 
                                          key={r}
                                          className={`w-6 h-6 text-xs rounded border hover:bg-muted`}
                                        >
                                          {r}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })
            )}
          </div>

          {/* Weight Summary */}
          {visibleSections.some(s => !s.is_advisory_only) && (
            <>
              <Separator className="my-4" />
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Weight Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {visibleSections
                    .filter(s => !s.is_advisory_only && s.include_in_final_score)
                    .map(section => (
                      <div key={section.id} className="flex justify-between">
                        <span className="text-muted-foreground">{section.display_name}:</span>
                        <span className="font-medium">{section.weight}%</span>
                      </div>
                    ))}
                  <div className="col-span-2 border-t pt-2 mt-1 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>
                      {visibleSections
                        .filter(s => !s.is_advisory_only && s.include_in_final_score)
                        .reduce((sum, s) => sum + s.weight, 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
