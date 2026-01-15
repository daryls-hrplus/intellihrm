import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  BookOpen,
  Briefcase,
  MessageSquare,
  Heart,
  Users,
  FileCheck,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AppraisalItem } from "./AppraisalItemsTable";
import { RatingIcon } from "./PrintSafeRatingIcons";
import { GapIndicator } from "./RatingDisplay";
import { ViewMode, getViewModeVisibility } from "./ViewModeToggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompactAppraisalTableProps {
  items: AppraisalItem[];
  minRating?: number;
  maxRating?: number;
  viewMode?: ViewMode;
  className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  goal: <Target className="h-4 w-4" />,
  competency: <BookOpen className="h-4 w-4" />,
  responsibility: <Briefcase className="h-4 w-4" />,
  feedback_360: <MessageSquare className="h-4 w-4" />,
  value: <Heart className="h-4 w-4" />,
  custom: <Users className="h-4 w-4" />,
};

const typeBadgeColors: Record<string, string> = {
  goal: "bg-blue-50 text-blue-700 border-blue-200",
  competency: "bg-purple-50 text-purple-700 border-purple-200",
  responsibility: "bg-amber-50 text-amber-700 border-amber-200",
  feedback_360: "bg-green-50 text-green-700 border-green-200",
  value: "bg-pink-50 text-pink-700 border-pink-200",
  custom: "bg-slate-50 text-slate-700 border-slate-200",
};

// Compact row for each item
function CompactItemRow({
  item,
  index,
  minRating,
  maxRating,
  viewMode,
}: {
  item: AppraisalItem;
  index: number;
  minRating: number;
  maxRating: number;
  viewMode: ViewMode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibility = getViewModeVisibility(viewMode);
  const hasEvidence = item.evidence && item.evidence.length > 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border-b last:border-0">
        {/* Main Row */}
        <CollapsibleTrigger asChild>
          <div className="grid grid-cols-12 gap-2 py-3 px-4 hover:bg-muted/30 cursor-pointer transition-colors items-center">
            {/* # */}
            <div className="col-span-1 text-sm text-muted-foreground font-mono">
              {index + 1}
            </div>

            {/* Item Name & Type */}
            <div className="col-span-4 flex items-center gap-2">
              <span className={cn("p-1 rounded", typeBadgeColors[item.type])}>
                {typeIcons[item.type]}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">{item.typeLabel}</p>
              </div>
            </div>

            {/* Required */}
            <div className="col-span-1 text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1">
                      <RatingIcon level={item.requiredLevel || 3} size="xs" />
                      <span className="text-sm font-medium">{item.requiredLevel || "-"}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Required Level</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Self */}
            <div className="col-span-1 text-center">
              {visibility.showEmployeeRating ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center gap-1">
                        {item.employeeRating ? (
                          <>
                            <RatingIcon level={item.employeeRating} size="xs" />
                            <span className="text-sm font-medium">{item.employeeRating}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Self Assessment</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </div>

            {/* Manager */}
            <div className="col-span-1 text-center">
              {visibility.showManagerRating ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center gap-1">
                        {item.managerRating ? (
                          <>
                            <RatingIcon level={item.managerRating} size="xs" />
                            <span className="text-sm font-medium">{item.managerRating}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Manager Assessment</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </div>

            {/* Gap */}
            <div className="col-span-1 text-center">
              {visibility.showGapAnalysis && item.gap !== undefined ? (
                <GapIndicator gap={item.gap} size="sm" showLabel={false} />
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </div>

            {/* Weight */}
            <div className="col-span-1 text-center">
              <Badge variant="secondary" className="font-mono text-xs">
                {item.weight}%
              </Badge>
            </div>

            {/* Evidence */}
            <div className="col-span-1 text-center">
              {hasEvidence ? (
                <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                  <FileCheck className="h-3 w-3" />
                  {item.evidence?.length}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </div>

            {/* Expand */}
            <div className="col-span-1 flex justify-end">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Expanded Details */}
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 bg-muted/20 border-t space-y-3">
            {/* Description */}
            {item.description && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Description
                </p>
                <p className="text-sm">{item.description}</p>
              </div>
            )}

            {/* Behavioral Anchors */}
            {item.requiredLevelIndicators && item.requiredLevelIndicators.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Expected Behaviors at Level {item.requiredLevel}
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                  {item.requiredLevelIndicators.slice(0, 3).map((indicator, i) => (
                    <li key={i}>{indicator}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Comments Grid */}
            {(item.employeeComments || item.managerComments) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibility.showEmployeeRating && item.employeeComments && (
                  <div className="p-2 rounded bg-blue-50/50 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-1">
                      Employee Comments
                    </p>
                    <p className="text-sm">{item.employeeComments}</p>
                  </div>
                )}
                {visibility.showManagerComments && item.managerComments && (
                  <div className="p-2 rounded bg-purple-50/50 border border-purple-100">
                    <p className="text-xs font-semibold text-purple-700 mb-1">
                      Manager Comments
                    </p>
                    <p className="text-sm">{item.managerComments}</p>
                  </div>
                )}
              </div>
            )}

            {/* Evidence List */}
            {hasEvidence && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Evidence ({item.evidence?.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.evidence?.slice(0, 4).map((ev, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ev.title || `Evidence ${i + 1}`}
                    </Badge>
                  ))}
                  {(item.evidence?.length || 0) > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{(item.evidence?.length || 0) - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function CompactAppraisalTable({
  items,
  minRating = 1,
  maxRating = 5,
  viewMode = "hr",
  className,
}: CompactAppraisalTableProps) {
  const visibility = getViewModeVisibility(viewMode);

  // Group items by type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, AppraisalItem[]>);

  const typeOrder = ["goal", "competency", "responsibility", "feedback_360", "value", "custom"];
  const sortedTypes = Object.keys(groupedItems).sort(
    (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
  );

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No appraisal items configured</p>
        </CardContent>
      </Card>
    );
  }

  let globalIndex = 0;

  return (
    <div className={cn("compact-appraisal-section space-y-4 mb-6", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Items</h3>
          <p className="text-sm text-muted-foreground">
            {items.length} items • Click row to expand details
          </p>
        </div>
      </div>

      {/* Compact Table by Type */}
      {sortedTypes.map((type) => {
        const typeItems = groupedItems[type];
        const firstItem = typeItems[0];

        return (
          <Card key={type} className="overflow-hidden print:break-inside-avoid">
            <CardHeader className="py-3 px-4 bg-muted/20">
              <CardTitle className="text-sm flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("gap-1", typeBadgeColors[type])}
                >
                  {typeIcons[type]}
                  {firstItem.typeLabel}
                </Badge>
                <span className="text-muted-foreground font-normal">
                  {typeItems.length} {typeItems.length === 1 ? "item" : "items"}
                </span>
              </CardTitle>
            </CardHeader>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 py-2 px-4 bg-muted/30 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Item</div>
              <div className="col-span-1 text-center">Req</div>
              <div className="col-span-1 text-center">Self</div>
              <div className="col-span-1 text-center">Mgr</div>
              <div className="col-span-1 text-center">Gap</div>
              <div className="col-span-1 text-center">Wt</div>
              <div className="col-span-1 text-center">Evid</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Body */}
            <CardContent className="p-0">
              {typeItems.map((item) => {
                globalIndex++;
                return (
                  <CompactItemRow
                    key={item.id}
                    item={item}
                    index={globalIndex - 1}
                    minRating={minRating}
                    maxRating={maxRating}
                    viewMode={viewMode}
                  />
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
