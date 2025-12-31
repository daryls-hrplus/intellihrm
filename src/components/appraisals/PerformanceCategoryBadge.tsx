import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, TrendingUp, Users } from "lucide-react";
import { PerformanceCategory } from "@/hooks/usePerformanceCategories";

interface PerformanceCategoryBadgeProps {
  category: PerformanceCategory | null;
  score?: number | null;
  showEligibility?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PerformanceCategoryBadge({ 
  category, 
  score,
  showEligibility = true,
  size = "md" 
}: PerformanceCategoryBadgeProps) {
  if (!category) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Not Rated
      </Badge>
    );
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2">
            <Badge 
              className={`${sizeClasses[size]} font-medium`}
              style={{ 
                backgroundColor: category.color, 
                color: getContrastColor(category.color) 
              }}
            >
              {category.name}
            </Badge>
            {showEligibility && (
              <div className="flex items-center gap-1">
                {category.promotion_eligible && (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                {category.succession_eligible && (
                  <Users className="h-4 w-4 text-blue-500" />
                )}
                {category.bonus_eligible && (
                  <Award className="h-4 w-4 text-amber-500" />
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{category.name}</p>
            {category.description && (
              <p className="text-sm text-muted-foreground">{category.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Score Range: {category.min_score.toFixed(2)} - {category.max_score.toFixed(2)}
            </p>
            {score !== undefined && score !== null && (
              <p className="text-xs font-medium">
                Your Score: {score.toFixed(2)}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1 border-t">
              {category.promotion_eligible && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" /> Promotion Eligible
                </Badge>
              )}
              {category.succession_eligible && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  <Users className="h-3 w-3 mr-1" /> Succession Eligible
                </Badge>
              )}
              {category.bonus_eligible && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  <Award className="h-3 w-3 mr-1" /> Bonus Eligible
                </Badge>
              )}
              {category.requires_pip && (
                <Badge variant="destructive" className="text-xs">
                  Requires PIP
                </Badge>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
