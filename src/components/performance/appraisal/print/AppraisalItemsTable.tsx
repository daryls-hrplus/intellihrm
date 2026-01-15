import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Heart, 
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ItemLevelContext } from "./ItemLevelContext";
import { ItemEvidence, EvidenceItem, SAMPLE_EVIDENCE } from "./ItemEvidence";
import { RatingDisplay, GapIndicator } from "./RatingDisplay";
import { RatingScaleLegend } from "./RatingScaleLegend";
import { ViewMode, getViewModeVisibility } from "./ViewModeToggle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface AppraisalItem {
  id: string;
  type: "goal" | "competency" | "responsibility" | "feedback_360" | "value" | "custom";
  typeLabel: string;
  name: string;
  description?: string;
  weight: number;
  requiredLevel?: number;
  requiredLevelLabel?: string;
  requiredLevelIndicators?: string[];
  employeeRating?: number;
  employeeRatingLabel?: string;
  managerRating?: number;
  managerRatingLabel?: string;
  gap?: number;
  gapExplanation?: string;
  comments?: string;
  employeeComments?: string;
  managerComments?: string;
  evidence?: EvidenceItem[];
}

interface AppraisalItemsTableProps {
  items: AppraisalItem[];
  minRating?: number;
  maxRating?: number;
  showEmployeeRating?: boolean;
  showRequiredLevel?: boolean;
  viewMode?: ViewMode;
  isPreview?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  goal: <Target className="h-4 w-4" />,
  competency: <BookOpen className="h-4 w-4" />,
  responsibility: <Briefcase className="h-4 w-4" />,
  feedback_360: <MessageSquare className="h-4 w-4" />,
  value: <Heart className="h-4 w-4" />,
  custom: <Users className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  goal: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300",
  competency: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300",
  responsibility: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
  feedback_360: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300",
  value: "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300",
  custom: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/30 dark:text-slate-300",
};

function AppraisalItemCard({
  item,
  index,
  minRating,
  maxRating,
  viewMode,
  isPreview,
}: {
  item: AppraisalItem;
  index: number;
  minRating: number;
  maxRating: number;
  viewMode: ViewMode;
  isPreview: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const visibility = getViewModeVisibility(viewMode);
  
  // Use sample evidence for preview, or actual evidence
  const evidence = isPreview 
    ? (index % 2 === 0 ? SAMPLE_EVIDENCE : []) 
    : (item.evidence || []);

  return (
    <Card className="overflow-hidden print:break-inside-avoid">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        {/* Card Header */}
        <CardHeader className="py-3 px-4 bg-muted/30">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-lg font-semibold text-muted-foreground shrink-0">
                  #{index + 1}
                </span>
                <Badge 
                  variant="outline" 
                  className={cn("gap-1.5 px-2 py-1 shrink-0", typeColors[item.type] || typeColors.custom)}
                >
                  {typeIcons[item.type] || typeIcons.custom}
                  <span>{item.typeLabel}</span>
                </Badge>
                <div className="text-left">
                  <h4 className="font-semibold text-base">{item.name}</h4>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="secondary" className="font-mono text-xs">
                  Weight: {item.weight}%
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="p-4 space-y-4">
            {/* Full Description */}
            {item.description && (
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Description
                </h5>
                <p className="text-sm leading-relaxed">{item.description}</p>
              </div>
            )}

            <Separator />

            {/* Required Level Context - Shows what the level means */}
            <ItemLevelContext
              requiredLevel={item.requiredLevel}
              requiredLevelLabel={item.requiredLevelLabel}
              requiredLevelIndicators={item.requiredLevelIndicators}
              currentRating={
                viewMode === "employee" 
                  ? item.employeeRating 
                  : item.managerRating
              }
              currentRatingLabel={
                viewMode === "employee"
                  ? item.employeeRatingLabel
                  : item.managerRatingLabel
              }
              isEmployeeView={viewMode === "employee"}
              showDevelopmentSuggestion={viewMode !== "employee"}
            />

            <Separator />

            {/* Ratings Section */}
            <div className="space-y-3">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Ratings
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Required Level */}
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <RatingDisplay
                    rating={item.requiredLevel}
                    maxRating={maxRating}
                    minRating={minRating}
                    label="Required Level"
                    showDots={true}
                    size="sm"
                  />
                </div>

                {/* Self Assessment - visible to employee and HR */}
                {visibility.showEmployeeRating && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <RatingDisplay
                      rating={item.employeeRating}
                      maxRating={maxRating}
                      minRating={minRating}
                      label="Self Assessment"
                      sublabel={item.employeeComments}
                      showDots={true}
                      size="sm"
                    />
                  </div>
                )}

                {/* Manager Assessment - visible to manager and HR */}
                {visibility.showManagerRating && (
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <RatingDisplay
                      rating={item.managerRating}
                      maxRating={maxRating}
                      minRating={minRating}
                      label="Manager Assessment"
                      sublabel={item.managerComments}
                      showDots={true}
                      size="sm"
                    />
                  </div>
                )}
              </div>

              {/* Gap Analysis - shown to manager and HR */}
              {visibility.showGapAnalysis && item.gap !== undefined && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border">
                  <span className="text-sm font-medium">Gap Analysis:</span>
                  <GapIndicator gap={item.gap} size="md" showLabel={true} />
                  {item.gapExplanation && (
                    <span className="text-sm text-muted-foreground">
                      — {item.gapExplanation}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Comments Section */}
            {(item.comments || item.employeeComments || item.managerComments) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Comments
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibility.showEmployeeRating && item.employeeComments && (
                      <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                          Employee Comments
                        </p>
                        <p className="text-sm">{item.employeeComments}</p>
                      </div>
                    )}
                    {visibility.showManagerComments && (item.managerComments || item.comments) && (
                      <div className="p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border">
                        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
                          Manager Comments
                        </p>
                        <p className="text-sm">{item.managerComments || item.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Evidence Section */}
            {(evidence.length > 0 || viewMode === "employee") && (
              <>
                <Separator />
                <ItemEvidence
                  evidence={evidence}
                  isEmployeeView={viewMode === "employee"}
                  isPreview={isPreview}
                />
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function AppraisalItemsTable({
  items,
  minRating = 1,
  maxRating = 5,
  showEmployeeRating = true,
  showRequiredLevel = true,
  viewMode = "hr",
  isPreview = false,
}: AppraisalItemsTableProps) {
  // Group items by type for organized display
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, AppraisalItem[]>);

  const typeOrder = ["goal", "competency", "responsibility", "feedback_360", "value", "custom"];
  const sortedTypes = Object.keys(groupedItems).sort(
    (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
  );

  let itemNumber = 0;

  if (items.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="py-12 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No appraisal items configured</p>
          <p className="text-sm mt-1">
            Add sections to the template to see items appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="appraisal-items-section space-y-6 mb-6">
      {/* Section Header with Rating Legend */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold">Appraisal Items</h3>
          <p className="text-sm text-muted-foreground">
            {items.length} items across {sortedTypes.length} categories
          </p>
        </div>
        <RatingScaleLegend minRating={minRating} maxRating={maxRating} />
      </div>

      {/* Items grouped by type */}
      {sortedTypes.map((type) => {
        const typeItems = groupedItems[type];
        const firstItem = typeItems[0];
        
        return (
          <div key={type} className="space-y-4">
            {/* Type Section Header */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Badge 
                variant="outline" 
                className={cn("gap-1.5 px-3 py-1.5 text-sm", typeColors[type] || typeColors.custom)}
              >
                {typeIcons[type] || typeIcons.custom}
                <span>{firstItem.typeLabel}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                {typeItems.length} {typeItems.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Items in this type */}
            <div className="space-y-4 pl-0 md:pl-4">
              {typeItems.map((item) => {
                itemNumber++;
                return (
                  <AppraisalItemCard
                    key={item.id}
                    item={item}
                    index={itemNumber - 1}
                    minRating={minRating}
                    maxRating={maxRating}
                    viewMode={viewMode}
                    isPreview={isPreview}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
