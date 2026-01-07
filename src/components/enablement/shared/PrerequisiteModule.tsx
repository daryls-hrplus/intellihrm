import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrerequisiteItem {
  moduleCode: string;
  moduleName: string;
  sectionId: string;
  sectionTitle: string;
  description: string;
  isCompleted?: boolean;
  manualPath?: string;
}

interface PrerequisiteModuleProps {
  title?: string;
  description?: string;
  prerequisites: PrerequisiteItem[];
  className?: string;
}

export function PrerequisiteModule({
  title = 'Before You Begin',
  description = 'Complete these configurations in other modules first:',
  prerequisites,
  className
}: PrerequisiteModuleProps) {
  const completedCount = prerequisites.filter(p => p.isCompleted).length;
  const allCompleted = completedCount === prerequisites.length;

  return (
    <Card className={cn('border-amber-500/30 bg-amber-500/5', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            {title}
          </CardTitle>
          <Badge 
            variant={allCompleted ? 'default' : 'secondary'}
            className={cn(
              allCompleted && 'bg-green-500/10 text-green-600 border-green-500/30'
            )}
          >
            {completedCount}/{prerequisites.length} complete
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {prerequisites.map((prereq, index) => (
            <div
              key={`${prereq.moduleCode}-${prereq.sectionId}-${index}`}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                prereq.isCompleted 
                  ? 'bg-green-500/5 border-green-500/30' 
                  : 'bg-background border-border'
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                {prereq.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {prereq.moduleName}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Section {prereq.sectionId.split('-').pop()}
                  </span>
                </div>
                <p className="text-sm font-medium mt-1">{prereq.sectionTitle}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {prereq.description}
                </p>
              </div>
              {prereq.manualPath && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => window.location.href = `${prereq.manualPath}#${prereq.sectionId}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
