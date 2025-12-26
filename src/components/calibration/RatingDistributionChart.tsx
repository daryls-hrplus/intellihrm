import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalibrationEmployee, TargetDistribution } from "@/types/calibration";
import { useMemo } from "react";

interface RatingDistributionChartProps {
  employees: CalibrationEmployee[];
  targetDistribution?: TargetDistribution;
}

const RATING_CATEGORIES = [
  { key: 'exceptional', label: 'Exceptional', min: 4.5, color: 'bg-green-500' },
  { key: 'exceeds', label: 'Exceeds', min: 3.5, color: 'bg-blue-500' },
  { key: 'meets', label: 'Meets', min: 2.5, color: 'bg-yellow-500' },
  { key: 'needs_improvement', label: 'Needs Improvement', min: 1.5, color: 'bg-orange-500' },
  { key: 'unsatisfactory', label: 'Unsatisfactory', min: 0, color: 'bg-red-500' },
];

export function RatingDistributionChart({ employees, targetDistribution }: RatingDistributionChartProps) {
  const distribution = useMemo(() => {
    const total = employees.length;
    if (total === 0) return [];

    const counts: Record<string, number> = {
      exceptional: 0,
      exceeds: 0,
      meets: 0,
      needs_improvement: 0,
      unsatisfactory: 0,
    };

    employees.forEach(emp => {
      const score = emp.currentScore;
      if (score >= 4.5) counts.exceptional++;
      else if (score >= 3.5) counts.exceeds++;
      else if (score >= 2.5) counts.meets++;
      else if (score >= 1.5) counts.needs_improvement++;
      else counts.unsatisfactory++;
    });

    return RATING_CATEGORIES.map(cat => ({
      ...cat,
      count: counts[cat.key],
      percentage: (counts[cat.key] / total) * 100,
      target: targetDistribution?.[cat.key as keyof TargetDistribution] || 0,
    }));
  }, [employees, targetDistribution]);

  const maxPercentage = Math.max(...distribution.map(d => Math.max(d.percentage, d.target)), 50);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Rating Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current distribution vs target {targetDistribution ? '(with forced distribution)' : ''}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {distribution.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center gap-4">
                  <span>{item.count} ({item.percentage.toFixed(1)}%)</span>
                  {targetDistribution && (
                    <span className="text-muted-foreground">
                      Target: {item.target}%
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-6 bg-muted rounded-full overflow-hidden">
                {/* Current percentage bar */}
                <div
                  className={`absolute h-full ${item.color} rounded-full transition-all duration-300`}
                  style={{ width: `${(item.percentage / maxPercentage) * 100}%` }}
                />
                {/* Target line */}
                {targetDistribution && item.target > 0 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-foreground/50"
                    style={{ left: `${(item.target / maxPercentage) * 100}%` }}
                  />
                )}
              </div>
              {/* Variance indicator */}
              {targetDistribution && item.target > 0 && (
                <div className="text-xs">
                  {item.percentage > item.target + 2 ? (
                    <span className="text-red-500">
                      ↑ {(item.percentage - item.target).toFixed(1)}% over target
                    </span>
                  ) : item.percentage < item.target - 2 ? (
                    <span className="text-blue-500">
                      ↓ {(item.target - item.percentage).toFixed(1)}% under target
                    </span>
                  ) : (
                    <span className="text-green-500">✓ Within target</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Total Employees</span>
            <span className="font-bold">{employees.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
