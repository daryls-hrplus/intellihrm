import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Award,
  Target,
  ChevronRight,
} from "lucide-react";
import { useEmployeeCapabilities } from "@/hooks/capabilities/useCapabilities";
import type { Database } from "@/integrations/supabase/types";

type CapabilityRow = Database['public']['Tables']['skills_competencies']['Row'];

interface EmployeeCapabilityProfileCardProps {
  employeeId: string;
  employeeName?: string;
  showGaps?: boolean;
  maxItems?: number;
  onViewDetails?: () => void;
}

interface AggregatedCapability {
  capability: CapabilityRow;
  current_level: number;
  evidence_count: number;
  latest_date?: string;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    technical: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    leadership: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    functional: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    behavioral: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    core: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300",
  };
  return colors[category] || colors.core;
};

const getLevelLabel = (level: number) => {
  const labels: Record<number, string> = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert",
    5: "Master",
  };
  return labels[level] || `Level ${level}`;
};

export function EmployeeCapabilityProfileCard({
  employeeId,
  employeeName,
  showGaps = false,
  maxItems = 5,
  onViewDetails,
}: EmployeeCapabilityProfileCardProps) {
  const { evidence, isLoading, fetchEmployeeCapabilities } = useEmployeeCapabilities(employeeId);
  const [aggregated, setAggregated] = useState<AggregatedCapability[]>([]);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeCapabilities();
    }
  }, [employeeId, fetchEmployeeCapabilities]);

  useEffect(() => {
    // Aggregate evidence by capability (take highest/latest)
    const capMap = new Map<string, AggregatedCapability>();
    
    for (const ev of evidence) {
      const cap = (ev as any).capability as CapabilityRow | undefined;
      if (!cap) continue;

      const existing = capMap.get(cap.id);
      if (!existing || ev.proficiency_level > existing.current_level) {
        capMap.set(cap.id, {
          capability: cap,
          current_level: ev.proficiency_level,
          evidence_count: (existing?.evidence_count || 0) + 1,
          latest_date: ev.effective_from || ev.created_at || undefined,
        });
      } else {
        capMap.set(cap.id, {
          ...existing,
          evidence_count: existing.evidence_count + 1,
        });
      }
    }

    setAggregated(Array.from(capMap.values()).slice(0, maxItems));
  }, [evidence, maxItems]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const averageLevel = aggregated.length > 0
    ? aggregated.reduce((sum, a) => sum + a.current_level, 0) / aggregated.length
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            {employeeName ? `${employeeName}'s Capabilities` : "Capability Profile"}
          </CardTitle>
          {aggregated.length > 0 && (
            <Badge variant="secondary">
              Avg: {getLevelLabel(Math.round(averageLevel))}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {aggregated.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No capabilities recorded yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {aggregated.map((agg) => (
                <div key={agg.capability.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{agg.capability.name}</span>
                      <Badge 
                        variant="secondary" 
                        className={`text-[10px] px-1.5 py-0 ${getCategoryColor(agg.capability.category)}`}
                      >
                        {agg.capability.category}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getLevelLabel(agg.current_level)}
                    </span>
                  </div>
                  <Progress 
                    value={(agg.current_level / 5) * 100} 
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>

            {onViewDetails && (
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={onViewDetails}
              >
                View Full Profile
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
