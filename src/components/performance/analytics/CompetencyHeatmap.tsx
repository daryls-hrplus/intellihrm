import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CompetencyHeatmapProps {
  companyId?: string;
  cycleId?: string;
}

interface HeatmapCell {
  competencyName: string;
  departmentName: string;
  avgRating: number;
  count: number;
}

interface CompetencyRow {
  competencyName: string;
  departments: Record<string, { avgRating: number; count: number }>;
  overallAvg: number;
}

export function CompetencyHeatmap({ companyId, cycleId }: CompetencyHeatmapProps) {
  const [loading, setLoading] = useState(true);
  const [competencyRows, setCompetencyRows] = useState<CompetencyRow[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (companyId) {
      fetchHeatmapData();
    }
  }, [companyId, cycleId]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      // Get competency scores from appraisal_scores
      const { data: scores, error } = await supabase
        .from('appraisal_scores')
        .select(`
          item_name,
          rating,
          evaluation_type,
          participant:appraisal_participants!inner(
            employee:profiles!employee_id(
              department:departments(name)
            ),
            cycle:appraisal_cycles!inner(company_id)
          )
        `)
        .eq('evaluation_type', 'competency')
        .eq('participant.cycle.company_id', companyId);

      if (error) throw error;

      // Build heatmap data
      const competencyDeptMap: Record<string, Record<string, { sum: number; count: number }>> = {};
      const deptSet = new Set<string>();

      scores?.forEach((score: any) => {
        const competencyName = score.item_name || 'Unknown';
        const deptName = score.participant?.employee?.department?.name || 'No Department';
        const rating = score.rating || 0;

        deptSet.add(deptName);

        if (!competencyDeptMap[competencyName]) {
          competencyDeptMap[competencyName] = {};
        }
        if (!competencyDeptMap[competencyName][deptName]) {
          competencyDeptMap[competencyName][deptName] = { sum: 0, count: 0 };
        }

        competencyDeptMap[competencyName][deptName].sum += rating;
        competencyDeptMap[competencyName][deptName].count += 1;
      });

      const deptList = Array.from(deptSet).sort();
      setDepartments(deptList);

      // Build rows
      const rows: CompetencyRow[] = Object.entries(competencyDeptMap).map(([competencyName, depts]) => {
        const departments: Record<string, { avgRating: number; count: number }> = {};
        let totalSum = 0;
        let totalCount = 0;

        Object.entries(depts).forEach(([deptName, data]) => {
          departments[deptName] = {
            avgRating: data.count > 0 ? data.sum / data.count : 0,
            count: data.count,
          };
          totalSum += data.sum;
          totalCount += data.count;
        });

        return {
          competencyName,
          departments,
          overallAvg: totalCount > 0 ? totalSum / totalCount : 0,
        };
      });

      // Sort by overall average (ascending to show weak areas first)
      rows.sort((a, b) => a.overallAvg - b.overallAvg);
      setCompetencyRows(rows.slice(0, 15)); // Show top 15

    } catch (error) {
      console.error('Error fetching competency heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-blue-500';
    if (rating >= 2) return 'bg-yellow-500';
    if (rating > 0) return 'bg-red-500';
    return 'bg-muted';
  };

  const getRatingOpacity = (rating: number): number => {
    if (rating === 0) return 0.2;
    return 0.3 + (rating / 5) * 0.7;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (competencyRows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competency Heatmap</CardTitle>
          <CardDescription>Average competency ratings by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No competency rating data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competency Heatmap</CardTitle>
        <CardDescription>
          Average competency ratings across departments. Darker = higher rating.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 font-medium border-b">Competency</th>
                  {departments.slice(0, 8).map(dept => (
                    <th key={dept} className="text-center p-2 font-medium border-b text-xs max-w-20 truncate">
                      {dept}
                    </th>
                  ))}
                  <th className="text-center p-2 font-medium border-b">Avg</th>
                </tr>
              </thead>
              <tbody>
                {competencyRows.map((row) => (
                  <tr key={row.competencyName} className="border-b">
                    <td className="p-2 font-medium max-w-40 truncate">{row.competencyName}</td>
                    {departments.slice(0, 8).map(dept => {
                      const cell = row.departments[dept];
                      return (
                        <td key={dept} className="p-1 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`w-10 h-10 mx-auto rounded flex items-center justify-center text-white font-medium text-xs ${getRatingColor(cell?.avgRating || 0)}`}
                                style={{ opacity: getRatingOpacity(cell?.avgRating || 0) }}
                              >
                                {cell?.avgRating ? cell.avgRating.toFixed(1) : '-'}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{row.competencyName}</p>
                              <p className="text-xs text-muted-foreground">{dept}</p>
                              <p className="font-medium">
                                Avg: {cell?.avgRating?.toFixed(2) || 'N/A'} ({cell?.count || 0} ratings)
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center">
                      <Badge variant={row.overallAvg >= 3 ? 'default' : 'destructive'}>
                        {row.overallAvg.toFixed(2)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t justify-center">
          <span className="text-xs text-muted-foreground">Rating Scale:</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-500 opacity-70" />
              <span className="text-xs">1-2</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-500 opacity-80" />
              <span className="text-xs">2-3</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-blue-500 opacity-90" />
              <span className="text-xs">3-4</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-xs">4-5</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
