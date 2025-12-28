import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown, Trash2, Wrench, Info, Link2 } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { ProficiencyLevelBadge } from "@/components/capabilities/ProficiencyLevelPicker";

interface LinkedSkill {
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
  } | null;
}

interface CompetencyRequirement {
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
  isLoadingSkills: boolean;
}

export function CompetencyRequirementRow({
  requirement,
  linkedSkills,
  onDelete,
  isLoadingSkills,
}: CompetencyRequirementRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasLinkedSkills = linkedSkills.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow className="group hover:bg-muted/50">
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {hasLinkedSkills ? (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            ) : (
              <div className="w-6" />
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>{requirement.skills_competencies?.name}</span>
                <span className="text-muted-foreground text-sm">
                  ({requirement.skills_competencies?.code})
                </span>
              </div>
              {hasLinkedSkills && (
                <span className="text-xs text-muted-foreground ml-6 flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  {linkedSkills.length} linked skill{linkedSkills.length !== 1 ? "s" : ""}
                </span>
              )}
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(requirement.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove requirement</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      </TableRow>

      <CollapsibleContent asChild>
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
            linkedSkills.map((skill) => (
              <TableRow key={skill.id} className="bg-muted/30 hover:bg-muted/50">
                <TableCell className="py-2 pl-14">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-sm">{skill.skill?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({skill.skill?.code})
                    </span>
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                      Skill
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground capitalize">
                  {skill.skill?.category}
                </TableCell>
                <TableCell>
                  {skill.min_proficiency_level ? (
                    <ProficiencyLevelBadge level={skill.min_proficiency_level} size="sm" />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{skill.weight}%</Badge>
                </TableCell>
                <TableCell colSpan={2} className="text-xs text-muted-foreground italic">
                  Inherited from competency mapping
                </TableCell>
                <TableCell>
                  <Badge variant={skill.is_required ? "secondary" : "outline"} className="text-xs">
                    {skill.is_required ? "Required" : "Optional"}
                  </Badge>
                </TableCell>
                <TableCell />
              </TableRow>
            ))
          )}
        </>
      </CollapsibleContent>
    </Collapsible>
  );
}
