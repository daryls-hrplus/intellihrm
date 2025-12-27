import { Capability } from "@/hooks/useCapabilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  Zap,
  Target,
  Link2,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CapabilityCardProps {
  capability: Capability;
  onEdit: (capability: Capability) => void;
  onDelete: (capability: Capability) => void;
  onStatusChange: (id: string, status: "active" | "deprecated") => void;
  onViewMappings?: (capability: Capability) => void;
}

const statusConfig = {
  draft: { icon: Clock, color: "bg-muted text-muted-foreground", label: "Draft" },
  pending_approval: { icon: AlertCircle, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", label: "Pending" },
  active: { icon: CheckCircle, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Active" },
  deprecated: { icon: Archive, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Deprecated" },
};

const categoryColors: Record<string, string> = {
  technical: "border-l-blue-500",
  functional: "border-l-purple-500",
  behavioral: "border-l-green-500",
  leadership: "border-l-amber-500",
  core: "border-l-rose-500",
};

export function CapabilityCard({
  capability,
  onEdit,
  onDelete,
  onStatusChange,
  onViewMappings,
}: CapabilityCardProps) {
  const status = statusConfig[capability.status];
  const StatusIcon = status.icon;
  const isSkill = capability.type === "SKILL";
  const canBeInferred = isSkill
    ? capability.skill_attributes?.can_be_inferred
    : false;

  return (
    <Card
      className={cn(
        "border-l-4 hover:shadow-md transition-shadow",
        categoryColors[capability.category] || "border-l-border"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isSkill ? (
                <Zap className="h-4 w-4 text-blue-500" />
              ) : (
                <Target className="h-4 w-4 text-purple-500" />
              )}
              <h3 className="font-semibold leading-none">{capability.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              {capability.code}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(capability)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {!isSkill && onViewMappings && (
                <DropdownMenuItem onClick={() => onViewMappings(capability)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Linked Skills
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {capability.status !== "active" && (
                <DropdownMenuItem onClick={() => onStatusChange(capability.id, "active")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate
                </DropdownMenuItem>
              )}
              {capability.status === "active" && (
                <DropdownMenuItem onClick={() => onStatusChange(capability.id, "deprecated")}>
                  <Archive className="h-4 w-4 mr-2" />
                  Deprecate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(capability)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {capability.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {capability.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">
            {capability.category}
          </Badge>
          <Badge className={cn("gap-1", status.color)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
          {capability.company_id === null && (
            <Badge variant="secondary">Global</Badge>
          )}
        </div>

        {/* Skill-specific indicators */}
        {isSkill && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            {canBeInferred && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Brain className="h-3 w-3 text-purple-500" />
                      <span>AI-Inferable</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    This skill can be suggested by AI from text analysis
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {capability.skill_attributes?.expiry_months && (
              <span>Expires: {capability.skill_attributes.expiry_months}mo</span>
            )}
            {(capability.skill_attributes?.synonyms?.length ?? 0) > 0 && (
              <span>{capability.skill_attributes?.synonyms?.length} synonyms</span>
            )}
          </div>
        )}

        {/* Competency-specific indicators */}
        {!isSkill && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            {(capability.competency_attributes?.role_applicability?.length ?? 0) > 0 && (
              <span>
                Roles: {capability.competency_attributes?.role_applicability?.join(", ")}
              </span>
            )}
          </div>
        )}

        {/* Proficiency scale info */}
        {capability.proficiency_scales && (
          <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
            Scale: {capability.proficiency_scales.name}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
