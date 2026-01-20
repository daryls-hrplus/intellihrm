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
  Brain,
  ListChecks,
  Briefcase,
  CalendarClock,
  AlertTriangle,
  Ban,
  History,
  Settings2,
  Heart,
  Award,
  Globe,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isFuture, isPast, parseISO, isValid } from "date-fns";
import { CompletionIndicator } from "./CompletionIndicator";

export interface CapabilityWithMeta extends Capability {
  job_count?: number;
  skill_count?: number;
  has_behavioral_indicators?: boolean;
  linked_company_count?: number;
}

interface CapabilityCardProps {
  capability: CapabilityWithMeta;
  onEdit: (capability: Capability) => void;
  onDelete: (capability: Capability) => void;
  onStatusChange: (id: string, status: "active" | "deprecated") => void;
  onViewHistory?: (capability: Capability) => void;
  onConfigure?: (capability: Capability) => void;
  onManageJobs?: (capability: Capability) => void;
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

// Helper functions for date logic
function getDateStatus(effectiveFrom: string | null, effectiveTo: string | null) {
  const now = new Date();
  
  let fromDate: Date | null = null;
  let toDate: Date | null = null;
  
  if (effectiveFrom) {
    fromDate = parseISO(effectiveFrom);
    if (!isValid(fromDate)) fromDate = null;
  }
  
  if (effectiveTo) {
    toDate = parseISO(effectiveTo);
    if (!isValid(toDate)) toDate = null;
  }
  
  // Check if future-dated (scheduled)
  if (fromDate && isFuture(fromDate)) {
    return { type: 'scheduled' as const, date: fromDate };
  }
  
  // Check if expired
  if (toDate && isPast(toDate)) {
    return { type: 'expired' as const, date: toDate };
  }
  
  // Check if expiring soon (within 90 days)
  if (toDate) {
    const daysUntilExpiry = differenceInDays(toDate, now);
    if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) {
      return { type: 'expiring' as const, date: toDate, days: daysUntilExpiry };
    }
  }
  
  return { type: 'current' as const };
}

export function CapabilityCard({
  capability,
  onEdit,
  onDelete,
  onStatusChange,
  onViewHistory,
  onConfigure,
  onManageJobs,
}: CapabilityCardProps) {
  const status = statusConfig[capability.status];
  const StatusIcon = status.icon;
  const isSkill = capability.type === "SKILL";
  const isValue = capability.type === "VALUE";
  const isCompetency = capability.type === "COMPETENCY";
  const canBeInferred = isSkill
    ? capability.skill_attributes?.can_be_inferred
    : false;
  const isPromotionFactor = (capability as any).is_promotion_factor;

  // Date-driven status
  const dateStatus = getDateStatus(capability.effective_from, capability.effective_to);
  const isExpired = dateStatus.type === 'expired';
  const isScheduled = dateStatus.type === 'scheduled';
  const isExpiring = dateStatus.type === 'expiring';

  // Determine behavioral indicators status
  const hasBehavioralIndicators = capability.has_behavioral_indicators ?? 
    (isSkill 
      ? !!(capability.skill_attributes?.inference_keywords?.length ?? 0 > 0)
      : !!(capability.competency_attributes?.behavioral_indicators?.length ?? 0 > 0));

  return (
    <Card
      className={cn(
        "border-l-4 hover:shadow-md transition-shadow",
        categoryColors[capability.category] || "border-l-border",
        isExpired && "opacity-60"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isSkill ? (
                  <Zap className="h-4 w-4 text-blue-500" />
                ) : isValue ? (
                  <Heart className="h-4 w-4 text-rose-500" />
                ) : (
                  <Target className="h-4 w-4 text-purple-500" />
                )}
                <h3 className="font-semibold leading-none">{capability.name}</h3>
                {isValue && isPromotionFactor && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs">
                          <Award className="h-3 w-3" />
                          Promotion Factor
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        This value is required for promotion eligibility
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
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
              {onConfigure && (
                <DropdownMenuItem onClick={() => onConfigure(capability)}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configure Wizard
                </DropdownMenuItem>
              )}
              {onViewHistory && (
                <DropdownMenuItem onClick={() => onViewHistory(capability)}>
                  <History className="h-4 w-4 mr-2" />
                  View History
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

        {/* Status badges row */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">
            {capability.category}
          </Badge>
          <Badge className={cn("gap-1", status.color)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
          {(capability as any).is_global && (
            <Badge variant="secondary" className="gap-1">
              <Globe className="h-3 w-3" />
              Global
            </Badge>
          )}
          {!((capability as any).is_global) && (capability.linked_company_count ?? 0) > 0 && (
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3 w-3" />
              {capability.linked_company_count} {capability.linked_company_count === 1 ? "company" : "companies"}
            </Badge>
          )}
          
          {/* Date-driven status badges */}
          {isScheduled && (
            <Badge className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <CalendarClock className="h-3 w-3" />
              Scheduled
            </Badge>
          )}
          {isExpiring && (
            <Badge className="gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              <AlertTriangle className="h-3 w-3" />
              Expiring
            </Badge>
          )}
          {isExpired && (
            <Badge className="gap-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <Ban className="h-3 w-3" />
              Expired
            </Badge>
          )}
        </div>

        {/* Date indicators */}
        {(isScheduled || isExpiring || isExpired) && dateStatus.date && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            {isScheduled && (
              <span>Starts: {format(dateStatus.date, "MMM d, yyyy")}</span>
            )}
            {isExpiring && (
              <span className="text-orange-600 dark:text-orange-400">
                Expires in {dateStatus.days} days ({format(dateStatus.date, "MMM d, yyyy")})
              </span>
            )}
            {isExpired && (
              <span className="text-red-600 dark:text-red-400">
                Expired: {format(dateStatus.date, "MMM d, yyyy")}
              </span>
            )}
          </div>
        )}

        {/* Configuration Completeness Indicators */}
        <div className="flex items-center gap-4 pt-2 border-t">
          {isSkill ? (
            <>
              <CompletionIndicator
                label="Proficiency Indicators"
                complete={hasBehavioralIndicators}
                icon={ListChecks}
              />
              <CompletionIndicator
                label="AI Inference"
                complete={canBeInferred ?? false}
                icon={Brain}
              />
              <div 
                className={cn(
                  "cursor-pointer",
                  onManageJobs && "hover:opacity-80 transition-opacity"
                )}
                onClick={() => onManageJobs?.(capability)}
              >
                <CompletionIndicator
                  label="Jobs"
                  complete={(capability.job_count ?? 0) > 0}
                  count={capability.job_count}
                  icon={Briefcase}
                />
              </div>
            </>
          ) : isValue ? (
            <>
              <CompletionIndicator
                label="Behavioral Indicators"
                complete={hasBehavioralIndicators}
                icon={ListChecks}
              />
              <CompletionIndicator
                label="Promotion Factor"
                complete={isPromotionFactor}
                icon={Award}
              />
            </>
          ) : (
            <>
              <CompletionIndicator
                label="Behavioral Indicators"
                complete={hasBehavioralIndicators}
                icon={ListChecks}
              />
              <div 
                className={cn(
                  "cursor-pointer",
                  onManageJobs && "hover:opacity-80 transition-opacity"
                )}
                onClick={() => onManageJobs?.(capability)}
              >
                <CompletionIndicator
                  label="Jobs"
                  complete={(capability.job_count ?? 0) > 0}
                  count={capability.job_count}
                  icon={Briefcase}
                />
              </div>
              <CompletionIndicator
                label="Skills"
                complete={(capability.skill_count ?? 0) > 0}
                count={capability.skill_count}
                icon={Zap}
              />
            </>
          )}
        </div>

        {/* Skill-specific indicators */}
        {isSkill && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
