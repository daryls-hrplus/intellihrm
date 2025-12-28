import { useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Wrench, 
  Info, 
  Link2, 
  AlertTriangle,
  Pencil,
  X,
  Check,
  Loader2
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { ProficiencyLevelBadge, ProficiencyLevelPicker } from "@/components/capabilities/ProficiencyLevelPicker";

export interface LinkedSkill {
  id: string;
  skill_id: string;
  min_proficiency_level: number | null;
  weight: number;
  is_required: boolean;
  skill: {
    id: string;
    name: string;
    code: string;
    category: string;
    proficiency_indicators?: { [level: string]: string[] } | null;
  } | null;
  override?: {
    id: string;
    override_proficiency_level: number;
    override_reason: string | null;
  } | null;
}

export interface CompetencyRequirement {
  id: string;
  job_id: string;
  capability_id: string;
  required_proficiency_level: number;
  weighting: number;
  is_required: boolean;
  is_preferred: boolean;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  skills_competencies?: {
    name: string;
    code: string;
    type: string;
    category: string;
    description?: string;
  };
}

interface CompetencyRequirementRowProps {
  requirement: CompetencyRequirement;
  linkedSkills: LinkedSkill[];
  onDelete: (id: string) => void;
  onEdit: (requirement: CompetencyRequirement) => void;
  onSkillOverride: (
    skillId: string, 
    overrideLevel: number | null, 
    reason: string | null,
    existingOverrideId?: string
  ) => Promise<void>;
  isLoadingSkills: boolean;
}

export function CompetencyRequirementRow({
  requirement,
  linkedSkills,
  onDelete,
  onEdit,
  onSkillOverride,
  isLoadingSkills,
}: CompetencyRequirementRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [overrideLevel, setOverrideLevel] = useState<number | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  const hasLinkedSkills = linkedSkills.length > 0;
  const overriddenSkillsCount = linkedSkills.filter(s => s.override).length;

  const handleStartEdit = (skill: LinkedSkill) => {
    setEditingSkillId(skill.skill_id);
    setOverrideLevel(skill.override?.override_proficiency_level ?? skill.min_proficiency_level);
    setOverrideReason(skill.override?.override_reason || "");
  };

  const handleCancelEdit = () => {
    setEditingSkillId(null);
    setOverrideLevel(null);
    setOverrideReason("");
  };

  const handleSaveOverride = async (skill: LinkedSkill) => {
    if (!overrideLevel) return;
    
    // Only save if the level differs from baseline
    const baselineLevel = skill.min_proficiency_level;
    const isRemovingOverride = overrideLevel === baselineLevel;
    
    setIsSavingOverride(true);
    try {
      await onSkillOverride(
        skill.skill_id,
        isRemovingOverride ? null : overrideLevel,
        isRemovingOverride ? null : (overrideReason || null),
        skill.override?.id
      );
      handleCancelEdit();
    } finally {
      setIsSavingOverride(false);
    }
  };

  const handleRemoveOverride = async (skill: LinkedSkill) => {
    if (!skill.override) return;
    setIsSavingOverride(true);
    try {
      await onSkillOverride(skill.skill_id, null, null, skill.override.id);
    } finally {
      setIsSavingOverride(false);
    }
  };

  return (
    <Fragment>
      <TableRow className="group hover:bg-muted/50">
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {hasLinkedSkills ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 shrink-0"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6 shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span className="font-medium">{requirement.skills_competencies?.name}</span>
              </div>
              <div className="flex items-center gap-1.5 ml-3.5 text-xs text-muted-foreground">
                <span className="font-mono">{requirement.skills_competencies?.code}</span>
                {hasLinkedSkills ? (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Link2 className="h-3 w-3" />
                      {linkedSkills.length} skill{linkedSkills.length !== 1 ? "s" : ""}
                    </span>
                    {overriddenSkillsCount > 0 && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                        {overriddenSkillsCount}
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <span>·</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-[10px] h-4 px-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 cursor-help">
                            <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                            No Skills
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-2">
                            <p>This competency has no skills mapped.</p>
                            <Link 
                              to="/capabilities/competency-skill-mapping" 
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              <Wrench className="h-3 w-3" />
                              Manage Skill Mappings
                            </Link>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <span className="capitalize text-muted-foreground">
            {requirement.skills_competencies?.category}
          </span>
        </TableCell>
        <TableCell>
          <ProficiencyLevelBadge level={requirement.required_proficiency_level} size="sm" />
        </TableCell>
        <TableCell>
          <Badge variant="outline">{requirement.weighting}%</Badge>
        </TableCell>
        <TableCell>{formatDateForDisplay(requirement.start_date)}</TableCell>
        <TableCell>
          {requirement.end_date ? formatDateForDisplay(requirement.end_date) : "—"}
        </TableCell>
        <TableCell>
          <Badge variant={requirement.is_required ? "default" : "secondary"}>
            {requirement.is_required ? "Yes" : "No"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-0.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(requirement)}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit requirement</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDelete(requirement.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove requirement</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
      </TableRow>

      {isOpen && (
        <>
          {isLoadingSkills ? (
            <TableRow className="bg-muted/30">
              <TableCell colSpan={8} className="py-2 pl-14">
                <span className="text-sm text-muted-foreground">Loading linked skills...</span>
              </TableCell>
            </TableRow>
          ) : linkedSkills.length === 0 ? (
            <TableRow className="bg-muted/30">
              <TableCell colSpan={8} className="py-2 pl-14">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>No skills linked to this competency.</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-primary underline cursor-help">
                          Manage in Competency Settings
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Link skills to this competency in the Capability Platform → Competency-Skill Mapping section.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            linkedSkills.map((skill) => {
              const isEditing = editingSkillId === skill.skill_id;
              const hasOverride = !!skill.override;
              const displayLevel = skill.override?.override_proficiency_level ?? skill.min_proficiency_level;
              
              return (
                <TableRow 
                  key={skill.id} 
                  className={`bg-muted/30 hover:bg-muted/50 ${hasOverride ? 'border-l-2 border-l-amber-500' : ''}`}
                >
                  <TableCell className="py-2 pl-14">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-sm">{skill.skill?.name}</span>
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                        Skill
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {skill.skill?.category}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7">
                              {overrideLevel ? (
                                <ProficiencyLevelBadge level={overrideLevel} size="sm" />
                              ) : (
                                "Select level"
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-3" align="start">
                            <ProficiencyLevelPicker
                              value={overrideLevel}
                              onChange={setOverrideLevel}
                              showDescription
                            />
                            <div className="mt-3 pt-3 border-t">
                              <label className="text-xs font-medium text-muted-foreground">Override Reason (optional)</label>
                              <Input
                                value={overrideReason}
                                onChange={(e) => setOverrideReason(e.target.value)}
                                placeholder="Why is a different level needed?"
                                className="mt-1 h-8 text-sm"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {displayLevel ? (
                          <ProficiencyLevelBadge 
                            level={displayLevel} 
                            size="sm" 
                            skillId={skill.skill?.id}
                            skillName={skill.skill?.name}
                            skillIndicators={skill.skill?.proficiency_indicators}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {hasOverride && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Override
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-medium">Job-Specific Override</p>
                                  <p className="text-xs">Baseline level: {skill.min_proficiency_level || "Not set"}</p>
                                  {skill.override?.override_reason && (
                                    <p className="text-xs">Reason: {skill.override.override_reason}</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{skill.weight}%</Badge>
                  </TableCell>
                  <TableCell colSpan={2}>
                    {hasOverride ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400 italic flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Job-specific level (baseline: L{skill.min_proficiency_level || "?"})
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Inherited from competency mapping
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={skill.is_required ? "secondary" : "outline"} className="text-xs">
                      {skill.is_required ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleSaveOverride(skill)}
                            disabled={isSavingOverride || !overrideLevel}
                          >
                            {isSavingOverride ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 text-green-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleCancelEdit}
                            disabled={isSavingOverride}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleStartEdit(skill)}
                              >
                                <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {hasOverride ? "Edit override" : "Override skill level for this job"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {hasOverride && !isEditing && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleRemoveOverride(skill)}
                                disabled={isSavingOverride}
                              >
                                <X className="h-3 w-3 text-amber-600 hover:text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove override (use baseline)</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </>
      )}
    </Fragment>
  );
}