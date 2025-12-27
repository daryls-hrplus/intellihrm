import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  Brain, 
  Users, 
  Clock, 
  Award, 
  Link2, 
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

interface SkillAttribute {
  id: string;
  is_ai_inferable: boolean;
  inference_keywords: string[];
  adjacent_skills: string[];
  synonyms: string[];
  expires_in_months: number | null;
}

interface CompetencyAttribute {
  id: string;
  role_applicability: string[];
  development_resources: any[];
}

interface ProficiencyLevel {
  level: number;
  name: string;
  description?: string;
}

interface CompetencySkillMapping {
  id: string;
  skill: { id: string; name: string; code: string };
  weight: number;
  min_proficiency_level: number;
  is_required: boolean;
}

interface Capability {
  id: string;
  company_id: string | null;
  type: "SKILL" | "COMPETENCY";
  name: string;
  code: string;
  description: string | null;
  category: string;
  proficiency_scale_id: string | null;
  status: string;
  version: number;
  effective_from: string | null;
  effective_to: string | null;
  owner_role: string | null;
  parent_capability_id: string | null;
  external_id: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  skill_attributes?: SkillAttribute | null;
  competency_attributes?: CompetencyAttribute | null;
  proficiency_scales?: { levels: ProficiencyLevel[] } | null;
  competency_skill_mappings?: CompetencySkillMapping[];
}

interface CapabilityDetailPanelProps {
  capability: Capability;
  onViewMappings?: () => void;
  onEdit?: () => void;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: "bg-muted text-muted-foreground", label: "Draft" },
  pending_approval: { color: "bg-yellow-500/10 text-yellow-600", label: "Pending" },
  active: { color: "bg-green-500/10 text-green-600", label: "Active" },
  deprecated: { color: "bg-destructive/10 text-destructive", label: "Deprecated" },
};

const categoryColors: Record<string, string> = {
  technical: "bg-blue-500/10 text-blue-600 border-blue-200",
  functional: "bg-purple-500/10 text-purple-600 border-purple-200",
  behavioral: "bg-orange-500/10 text-orange-600 border-orange-200",
  leadership: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  core: "bg-slate-500/10 text-slate-600 border-slate-200",
};

export function CapabilityDetailPanel({ 
  capability, 
  onViewMappings,
  onEdit 
}: CapabilityDetailPanelProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const isSkill = capability.type === "SKILL";
  const isCompetency = capability.type === "COMPETENCY";
  const skillAttrs = capability.skill_attributes;
  const compAttrs = capability.competency_attributes;
  const proficiencyLevels = capability.proficiency_scales?.levels || [];
  const skillMappings = capability.competency_skill_mappings || [];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isSkill ? (
                <Target className="h-5 w-5 text-primary" />
              ) : (
                <Brain className="h-5 w-5 text-primary" />
              )}
              <CardTitle className="text-lg">{capability.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {capability.code}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${categoryColors[capability.category] || categoryColors.core}`}
              >
                {capability.category}
              </Badge>
              <Badge 
                variant="outline" 
                className={`text-xs ${statusConfig[capability.status]?.color || ""}`}
              >
                {statusConfig[capability.status]?.label || capability.status}
              </Badge>
              {!capability.company_id && (
                <Badge variant="secondary" className="text-xs">
                  Global
                </Badge>
              )}
            </div>
          </div>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proficiency">Proficiency</TabsTrigger>
            <TabsTrigger value="details">
              {isSkill ? "Skill Details" : "Competency Details"}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {capability.description || "No description provided."}
                </p>
              </div>

              <Separator />

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Version</h4>
                  <p className="text-sm">{capability.version}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Type</h4>
                  <p className="text-sm capitalize">{capability.type.toLowerCase()}</p>
                </div>
                {capability.effective_from && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Effective From</h4>
                    <p className="text-sm">{format(new Date(capability.effective_from), "MMM d, yyyy")}</p>
                  </div>
                )}
                {capability.effective_to && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Effective To</h4>
                    <p className="text-sm">{format(new Date(capability.effective_to), "MMM d, yyyy")}</p>
                  </div>
                )}
                {capability.owner_role && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Owner Role</h4>
                    <p className="text-sm">{capability.owner_role}</p>
                  </div>
                )}
              </div>

              {/* Quick Stats for Competencies */}
              {isCompetency && skillMappings.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Linked Skills</h4>
                      {onViewMappings && (
                        <Button variant="ghost" size="sm" onClick={onViewMappings}>
                          View All <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skillMappings.slice(0, 5).map((mapping) => (
                        <Badge key={mapping.id} variant="outline" className="text-xs">
                          <Link2 className="h-3 w-3 mr-1" />
                          {mapping.skill.name}
                          {mapping.is_required && (
                            <span className="ml-1 text-destructive">*</span>
                          )}
                        </Badge>
                      ))}
                      {skillMappings.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{skillMappings.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="proficiency" className="mt-0 space-y-4">
              {proficiencyLevels.length > 0 ? (
                <div className="space-y-3">
                  {proficiencyLevels.sort((a, b) => a.level - b.level).map((level) => (
                    <div 
                      key={level.level} 
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {level.level}
                        </div>
                        <span className="font-medium text-sm">{level.name}</span>
                      </div>
                      {level.description && (
                        <p className="text-xs text-muted-foreground ml-8">
                          {level.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No proficiency scale defined</p>
                  <p className="text-xs">Link a proficiency scale to enable level-based assessments</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-0 space-y-4">
              {isSkill && skillAttrs && (
                <>
                  {/* AI Inference */}
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <h4 className="text-sm font-medium">AI Inference</h4>
                      <Badge variant={skillAttrs.is_ai_inferable ? "default" : "secondary"} className="text-xs ml-auto">
                        {skillAttrs.is_ai_inferable ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {skillAttrs.is_ai_inferable && skillAttrs.inference_keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {skillAttrs.inference_keywords.map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expiry */}
                  {skillAttrs.expires_in_months && (
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <h4 className="text-sm font-medium">Expiry</h4>
                        <span className="text-sm text-muted-foreground ml-auto">
                          {skillAttrs.expires_in_months} months
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Synonyms */}
                  {skillAttrs.synonyms?.length > 0 && (
                    <div className="p-3 rounded-lg border bg-card">
                      <h4 className="text-sm font-medium mb-2">Synonyms</h4>
                      <div className="flex flex-wrap gap-1">
                        {skillAttrs.synonyms.map((syn, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {syn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Adjacent Skills */}
                  {skillAttrs.adjacent_skills?.length > 0 && (
                    <div className="p-3 rounded-lg border bg-card">
                      <h4 className="text-sm font-medium mb-2">Adjacent Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {skillAttrs.adjacent_skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Link2 className="h-3 w-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {isCompetency && compAttrs && (
                <>
                  {/* Role Applicability */}
                  {compAttrs.role_applicability?.length > 0 && (
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <h4 className="text-sm font-medium">Role Applicability</h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {compAttrs.role_applicability.map((role, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skill Mappings with Weights */}
                  {skillMappings.length > 0 && (
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 mb-3">
                        <Link2 className="h-4 w-4 text-emerald-500" />
                        <h4 className="text-sm font-medium">Skill Requirements</h4>
                      </div>
                      <div className="space-y-2">
                        {skillMappings.map((mapping) => (
                          <div 
                            key={mapping.id} 
                            className="flex items-center justify-between p-2 rounded bg-accent/30"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{mapping.skill.name}</span>
                              {mapping.is_required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Weight: {Math.round(mapping.weight * 100)}%</span>
                              <span>Min Level: {mapping.min_proficiency_level}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Development Resources */}
                  {compAttrs.development_resources?.length > 0 && (
                    <div className="p-3 rounded-lg border bg-card">
                      <h4 className="text-sm font-medium mb-2">Development Resources</h4>
                      <div className="space-y-2">
                        {compAttrs.development_resources.map((resource: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{resource.title || resource.name || "Resource"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Show message if no details available */}
              {isSkill && !skillAttrs && (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No skill attributes configured</p>
                </div>
              )}
              {isCompetency && !compAttrs && skillMappings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No competency details configured</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
