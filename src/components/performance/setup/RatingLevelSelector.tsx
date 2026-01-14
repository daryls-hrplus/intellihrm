import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { usePerformanceCategories, PerformanceCategory } from "@/hooks/usePerformanceCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Award, TrendingUp, UserCheck, AlertTriangle, XCircle } from "lucide-react";

interface RatingLevelSelectorProps {
  companyId: string;
  selectedCodes: string[];
  onSelectionChange: (codes: string[]) => void;
  multiSelect?: boolean;
  showEligibility?: boolean;
  className?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  exceptional: Award,
  exceeds: TrendingUp,
  meets: UserCheck,
  needs_improvement: AlertTriangle,
  unsatisfactory: XCircle,
};

export function RatingLevelSelector({
  companyId,
  selectedCodes,
  onSelectionChange,
  multiSelect = true,
  showEligibility = true,
  className,
}: RatingLevelSelectorProps) {
  const { data: categories, isLoading } = usePerformanceCategories(companyId);

  const handleSelect = (code: string) => {
    if (multiSelect) {
      if (selectedCodes.includes(code)) {
        onSelectionChange(selectedCodes.filter((c) => c !== code));
      } else {
        onSelectionChange([...selectedCodes, code]);
      }
    } else {
      onSelectionChange([code]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 border border-dashed rounded-lg text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">No rating levels configured. Please set up rating levels first.</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {categories.map((category) => {
        const isSelected = selectedCodes.includes(category.code);
        const Icon = CATEGORY_ICONS[category.code.toLowerCase()] || UserCheck;

        return (
          <div
            key={category.id}
            onClick={() => handleSelect(category.code)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            {multiSelect ? (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleSelect(category.code)}
                className="pointer-events-none"
              />
            ) : (
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                )}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
              </div>
            )}

            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: category.color + "20", color: category.color }}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {category.min_score.toFixed(1)} - {category.max_score.toFixed(1)}
                </Badge>
              </div>

              {showEligibility && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {category.requires_pip && (
                    <Badge variant="destructive" className="text-[10px] h-5">
                      PIP Required
                    </Badge>
                  )}
                  {category.succession_eligible && (
                    <Badge variant="default" className="text-[10px] h-5 bg-emerald-500">
                      Succession
                    </Badge>
                  )}
                  {category.promotion_eligible && (
                    <Badge variant="default" className="text-[10px] h-5 bg-blue-500">
                      Promotion
                    </Badge>
                  )}
                  {category.bonus_eligible && (
                    <Badge variant="default" className="text-[10px] h-5 bg-amber-500">
                      Bonus
                    </Badge>
                  )}
                  {!category.requires_pip && !category.succession_eligible && !category.promotion_eligible && !category.bonus_eligible && (
                    <span className="text-xs text-muted-foreground">Standard</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RatingLevelBadge({ category }: { category: PerformanceCategory }) {
  const Icon = CATEGORY_ICONS[category.code.toLowerCase()] || UserCheck;
  
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm"
      style={{ backgroundColor: category.color + "20", color: category.color }}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{category.name}</span>
    </div>
  );
}
