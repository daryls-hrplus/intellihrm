import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ComplexityLevelIndicatorProps {
  level: number | null | undefined;
  showLabel?: boolean;
  size?: 'sm' | 'default';
}

const levelLabels: Record<number, { label: string; description: string }> = {
  1: { label: 'Basic', description: 'Routine tasks with clear instructions' },
  2: { label: 'Intermediate', description: 'Some judgment required, moderate scope' },
  3: { label: 'Advanced', description: 'Significant judgment, cross-functional impact' },
  4: { label: 'Expert', description: 'Strategic thinking, organization-wide impact' },
  5: { label: 'Executive', description: 'Sets direction, enterprise-level decisions' },
};

export function ComplexityLevelIndicator({ 
  level, 
  showLabel = false,
  size = 'default' 
}: ComplexityLevelIndicatorProps) {
  if (!level) return null;
  
  const levelInfo = levelLabels[level];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-sm transition-colors",
                    size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
                    i <= level 
                      ? level <= 2 
                        ? 'bg-green-500' 
                        : level <= 3 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
            {showLabel && levelInfo && (
              <span className={cn(
                "text-muted-foreground",
                size === 'sm' ? 'text-xs' : 'text-sm'
              )}>
                {levelInfo.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Level {level}: {levelInfo?.label}</p>
          <p className="text-xs text-muted-foreground">{levelInfo?.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function getComplexityLevelOptions() {
  return Object.entries(levelLabels).map(([value, info]) => ({
    value: parseInt(value),
    label: `${value} - ${info.label}`,
    description: info.description,
  }));
}
