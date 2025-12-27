import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, BookOpen, ChevronRight } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type CapabilityRow = Database['public']['Tables']['capabilities']['Row'];

interface CapabilityGap {
  capability: CapabilityRow;
  required_level: number;
  current_level: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface CapabilityGapSummaryWidgetProps {
  gaps: CapabilityGap[];
  title?: string;
  onViewTraining?: (capabilityId: string) => void;
  onViewAll?: () => void;
  maxItems?: number;
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  };
  return colors[priority] || colors.MEDIUM;
};

const getLevelLabel = (level: number) => {
  const labels: Record<number, string> = {
    0: "None",
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
    5: "Master",
  };
  return labels[level] || `L${level}`;
};

export function CapabilityGapSummaryWidget({
  gaps,
  title = "Capability Gaps",
  onViewTraining,
  onViewAll,
  maxItems = 5,
}: CapabilityGapSummaryWidgetProps) {
  const displayGaps = gaps.slice(0, maxItems);
  const highPriorityCount = gaps.filter(g => g.priority === 'HIGH').length;
  const totalGapPoints = gaps.reduce((sum, g) => sum + g.gap, 0);

  if (gaps.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              No Capability Gaps!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All requirements are met
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {highPriorityCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {highPriorityCount} Critical
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {gaps.length} Total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {displayGaps.map((gap, idx) => (
            <div 
              key={gap.capability.id || idx} 
              className="p-3 rounded-lg border bg-muted/30"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{gap.capability.name}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-[10px] px-1.5 py-0 ${getPriorityColor(gap.priority)}`}
                    >
                      {gap.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Current: {getLevelLabel(gap.current_level)}</span>
                    <span>→</span>
                    <span>Required: {getLevelLabel(gap.required_level)}</span>
                  </div>
                </div>
                {onViewTraining && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onViewTraining(gap.capability.id)}
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Train
                  </Button>
                )}
              </div>
              <div className="relative">
                <Progress 
                  value={(gap.current_level / gap.required_level) * 100} 
                  className="h-2"
                />
                <div 
                  className="absolute top-0 h-2 w-0.5 bg-primary"
                  style={{ left: `${(gap.required_level / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {gaps.length > maxItems && onViewAll && (
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={onViewAll}
          >
            View All {gaps.length} Gaps
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
