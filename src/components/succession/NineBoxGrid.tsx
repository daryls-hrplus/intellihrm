import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NineBoxAssessment } from '@/hooks/useSuccession';

interface NineBoxGridProps {
  assessments: NineBoxAssessment[];
  onEmployeeClick?: (assessment: NineBoxAssessment) => void;
}

const boxLabels = [
  ['Enigma', 'Growth Employee', 'Future Star'],
  ['Dilemma', 'Core Player', 'High Performer'],
  ['Risk', 'Average Performer', 'Solid Contributor'],
];

const boxColors = [
  ['bg-amber-100 dark:bg-amber-900/30', 'bg-blue-100 dark:bg-blue-900/30', 'bg-emerald-100 dark:bg-emerald-900/30'],
  ['bg-orange-100 dark:bg-orange-900/30', 'bg-sky-100 dark:bg-sky-900/30', 'bg-teal-100 dark:bg-teal-900/30'],
  ['bg-red-100 dark:bg-red-900/30', 'bg-slate-100 dark:bg-slate-900/30', 'bg-green-100 dark:bg-green-900/30'],
];

const boxDescriptions = [
  [
    'High potential but low performance - needs development focus',
    'High potential, moderate performance - invest in growth',
    'Top talent - future leaders, retain and develop',
  ],
  [
    'Moderate potential, low performance - performance coaching needed',
    'Moderate potential and performance - solid backbone',
    'High performance, moderate potential - valued contributors',
  ],
  [
    'Low potential and performance - action required',
    'Low potential, moderate performance - maintain',
    'High performance, low potential - maximize contribution',
  ],
];

export function NineBoxGrid({ assessments, onEmployeeClick }: NineBoxGridProps) {
  const gridData = useMemo(() => {
    const grid: NineBoxAssessment[][][] = Array(3).fill(null).map(() => 
      Array(3).fill(null).map(() => [])
    );

    assessments.forEach(assessment => {
      const perfIndex = 3 - assessment.performance_rating; // Flip for visual (high at top)
      const potIndex = assessment.potential_rating - 1;
      if (grid[perfIndex] && grid[perfIndex][potIndex]) {
        grid[perfIndex][potIndex].push(assessment);
      }
    });

    return grid;
  }, [assessments]);

  const stats = useMemo(() => {
    const total = assessments.length;
    const highPotential = assessments.filter(a => a.potential_rating === 3).length;
    const highPerformers = assessments.filter(a => a.performance_rating === 3).length;
    const topTalent = assessments.filter(a => a.performance_rating === 3 && a.potential_rating === 3).length;
    const atRisk = assessments.filter(a => a.performance_rating === 1 && a.potential_rating === 1).length;

    return { total, highPotential, highPerformers, topTalent, atRisk };
  }, [assessments]);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Assessed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.topTalent}</div>
            <div className="text-sm text-muted-foreground">Future Stars</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.highPotential}</div>
            <div className="text-sm text-muted-foreground">High Potential</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-teal-600">{stats.highPerformers}</div>
            <div className="text-sm text-muted-foreground">High Performers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.atRisk}</div>
            <div className="text-sm text-muted-foreground">At Risk</div>
          </CardContent>
        </Card>
      </div>

      {/* Nine Box Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Nine Box Talent Grid</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Y-axis label */}
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-sm font-medium text-muted-foreground whitespace-nowrap">
              Performance →
            </div>

            <div className="ml-4">
              {/* X-axis label */}
              <div className="text-center text-sm font-medium text-muted-foreground mb-2">
                Potential →
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center text-xs text-muted-foreground">Low</div>
                <div className="text-center text-xs text-muted-foreground">Medium</div>
                <div className="text-center text-xs text-muted-foreground">High</div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-3 gap-2">
                {gridData.map((row, rowIndex) => (
                  row.map((cell, colIndex) => (
                    <TooltipProvider key={`${rowIndex}-${colIndex}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              ${boxColors[rowIndex][colIndex]}
                              rounded-lg p-3 min-h-[120px] border border-border/50
                              hover:border-primary/50 transition-colors cursor-pointer
                            `}
                          >
                            <div className="text-xs font-medium mb-2 text-foreground/80">
                              {boxLabels[rowIndex][colIndex]}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {cell.slice(0, 6).map((assessment) => (
                                <Avatar
                                  key={assessment.id}
                                  className="h-8 w-8 cursor-pointer hover:ring-2 ring-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEmployeeClick?.(assessment);
                                  }}
                                >
                                  <AvatarImage src={assessment.employee?.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {assessment.employee?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {cell.length > 6 && (
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                  +{cell.length - 6}
                                </div>
                              )}
                            </div>
                            {cell.length === 0 && (
                              <div className="text-xs text-muted-foreground italic">No employees</div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="font-medium">{boxLabels[rowIndex][colIndex]}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {boxDescriptions[rowIndex][colIndex]}
                          </p>
                          <p className="text-xs mt-2">
                            {cell.length} employee{cell.length !== 1 ? 's' : ''}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))
                ))}
              </div>

              {/* Row labels */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-[104px] text-xs text-muted-foreground">
                <span>High</span>
                <span>Med</span>
                <span>Low</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
