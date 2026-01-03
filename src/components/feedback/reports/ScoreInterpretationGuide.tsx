import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, TrendingUp, Minus, TrendingDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScoreInterpretationGuideProps {
  scaleMin?: number;
  scaleMax?: number;
  showInline?: boolean;
}

const scoreRanges = [
  { 
    min: 4.5, 
    max: 5.0, 
    label: 'Exceptional', 
    description: 'Role model. Top performers. Consistently exceeds expectations.',
    color: 'bg-green-600',
    textColor: 'text-green-700',
    icon: TrendingUp,
  },
  { 
    min: 4.0, 
    max: 4.49, 
    label: 'Strong', 
    description: 'Above average. Reliable strength area. Keep leveraging.',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    icon: TrendingUp,
  },
  { 
    min: 3.5, 
    max: 3.99, 
    label: 'Solid', 
    description: 'Meets expectations well. Room for growth but not critical.',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    icon: Minus,
  },
  { 
    min: 3.0, 
    max: 3.49, 
    label: 'Adequate', 
    description: 'Meets basic expectations. Consider for development.',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    icon: Minus,
  },
  { 
    min: 2.0, 
    max: 2.99, 
    label: 'Development Area', 
    description: 'Below expectations. Prioritize for improvement.',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    icon: TrendingDown,
  },
  { 
    min: 1.0, 
    max: 1.99, 
    label: 'Critical Gap', 
    description: 'Significant gap. Requires immediate attention and support.',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    icon: TrendingDown,
  },
];

export function ScoreInterpretationGuide({ 
  scaleMin = 1, 
  scaleMax = 5,
  showInline = false 
}: ScoreInterpretationGuideProps) {
  if (showInline) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Info className="h-3 w-3" />
              Score guide
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <div className="space-y-2">
              <p className="font-medium text-sm">Score Interpretation</p>
              {scoreRanges.map((range) => (
                <div key={range.label} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${range.color}`} />
                  <span className="font-medium">{range.min}-{range.max}:</span>
                  <span className="text-muted-foreground">{range.label}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Score Interpretation Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Visual scale bar */}
          <div className="flex h-4 rounded-full overflow-hidden">
            {scoreRanges.map((range) => (
              <div 
                key={range.label} 
                className={`flex-1 ${range.color}`}
                title={range.label}
              />
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{scaleMin}</span>
            <span>{scaleMax}</span>
          </div>

          {/* Legend */}
          <div className="grid gap-2 sm:grid-cols-2 mt-4">
            {scoreRanges.map((range) => {
              const Icon = range.icon;
              return (
                <div 
                  key={range.label}
                  className="flex items-start gap-2 p-2 rounded-lg bg-muted/30"
                >
                  <div className={`w-3 h-3 rounded-full ${range.color} mt-0.5 shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`font-medium text-sm ${range.textColor}`}>
                        {range.min}-{range.max}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {range.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {range.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Context note */}
          <p className="text-xs text-muted-foreground pt-2 border-t">
            💡 <span className="font-medium">Tip:</span> Most organizational averages fall between 3.2-3.8. 
            A score of 3.5 represents solid, expected performance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get interpretation for a specific score
export function getScoreInterpretation(score: number) {
  return scoreRanges.find(range => score >= range.min && score <= range.max) || scoreRanges[3];
}
