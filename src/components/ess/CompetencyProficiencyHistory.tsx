import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, Minus, History, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ProficiencyHistoryEntry {
  date: string;
  old_level: number;
  new_level: number;
  source: string;
  source_id?: string;
  performance_rating?: number;
  changed_by?: string | null;
  reason: string;
}

interface CompetencyProficiencyHistoryProps {
  competencyName: string;
  currentLevel: number;
  history: ProficiencyHistoryEntry[];
  showTitle?: boolean;
}

// Dreyfus proficiency labels
const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Novice",
  2: "Developing",
  3: "Proficient",
  4: "Advanced",
  5: "Expert",
};

const SOURCE_LABELS: Record<string, string> = {
  appraisal: "Performance Appraisal",
  job_requirement: "Job Requirement",
  self_assessment: "Self-Assessment",
  manager_assessment: "Manager Assessment",
  certification: "Certification",
  training: "Training Completion",
};

export function CompetencyProficiencyHistory({
  competencyName,
  currentLevel,
  history,
  showTitle = true,
}: CompetencyProficiencyHistoryProps) {
  // Sort history by date descending
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Proficiency History: {competencyName}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "pt-0" : ""}>
        {/* Current Level */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-medium">Current Level</span>
          </div>
          <Badge variant="default" className="text-sm">
            {PROFICIENCY_LABELS[currentLevel]} ({currentLevel})
          </Badge>
        </div>

        {/* History Timeline */}
        {sortedHistory.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No proficiency changes recorded yet.
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="space-y-3">
              {sortedHistory.map((entry, index) => {
                const change = entry.new_level - entry.old_level;
                const isIncrease = change > 0;
                const isDecrease = change < 0;

                return (
                  <div
                    key={`${entry.date}-${index}`}
                    className={cn(
                      "relative pl-6 pb-3 border-l-2",
                      index === sortedHistory.length - 1 ? "border-transparent" : "border-muted",
                      isIncrease && "border-l-green-300",
                      isDecrease && "border-l-red-300"
                    )}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-[-5px] top-0 w-2 h-2 rounded-full",
                        isIncrease && "bg-green-500",
                        isDecrease && "bg-red-500",
                        !isIncrease && !isDecrease && "bg-muted-foreground"
                      )}
                    />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {format(new Date(entry.date), "MMM d, yyyy")}
                        </span>
                        {change !== 0 && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              isIncrease && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                              isDecrease && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            )}
                          >
                            {isIncrease ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {isIncrease ? "+" : ""}{change} level
                          </Badge>
                        )}
                        {change === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Minus className="h-3 w-3 mr-1" />
                            No change
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          {PROFICIENCY_LABELS[entry.old_level]} ({entry.old_level})
                        </span>
                        <span className="mx-2">→</span>
                        <span className={cn(
                          "font-medium",
                          isIncrease && "text-green-600",
                          isDecrease && "text-red-600"
                        )}>
                          {PROFICIENCY_LABELS[entry.new_level]} ({entry.new_level})
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Source: {SOURCE_LABELS[entry.source] || entry.source}
                        {entry.performance_rating && (
                          <span className="ml-2">
                            (Rating: {entry.performance_rating.toFixed(1)})
                          </span>
                        )}
                      </div>

                      {entry.reason && (
                        <div className="text-xs italic text-muted-foreground">
                          "{entry.reason}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
