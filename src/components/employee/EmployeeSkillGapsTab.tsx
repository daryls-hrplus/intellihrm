import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Link as LinkIcon,
  Loader2,
  Target,
  CheckCircle2
} from 'lucide-react';
import { useSkillGapManagement } from '@/hooks/performance/useSkillGapManagement';
import { EmployeeSkillGap } from '@/types/valuesAssessment';

interface EmployeeSkillGapsTabProps {
  employeeId: string;
  isReadOnly?: boolean;
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  addressed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  closed: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
};

export function EmployeeSkillGapsTab({ employeeId, isReadOnly = false }: EmployeeSkillGapsTabProps) {
  const { gaps, loading, fetchEmployeeGaps, updateGapStatus } = useSkillGapManagement();
  const [localGaps, setLocalGaps] = useState<EmployeeSkillGap[]>([]);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeGaps(employeeId);
    }
  }, [employeeId, fetchEmployeeGaps]);

  useEffect(() => {
    setLocalGaps(gaps);
  }, [gaps]);

  const openGaps = localGaps.filter(g => g.status === 'open');
  const inProgressGaps = localGaps.filter(g => g.status === 'in_progress');
  const addressedGaps = localGaps.filter(g => g.status === 'addressed' || g.status === 'closed');

  const handleStatusChange = async (gapId: string, newStatus: EmployeeSkillGap['status']) => {
    const success = await updateGapStatus(gapId, newStatus);
    if (success) {
      setLocalGaps(prev => prev.map(g => 
        g.id === gapId ? { ...g, status: newStatus } : g
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openGaps.length}</p>
                <p className="text-sm text-muted-foreground">Open Gaps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressGaps.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{addressedGaps.length}</p>
                <p className="text-sm text-muted-foreground">Addressed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {localGaps.filter(g => g.priority === 'critical' || g.priority === 'high').length}
                </p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gaps List */}
      {localGaps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="text-lg font-medium mb-2">No skill gaps identified</h4>
            <p className="text-sm text-muted-foreground">
              Skill gaps are detected from appraisal evaluations and job requirements
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {localGaps.map((gap) => (
            <Card key={gap.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{gap.capability_name}</h4>
                      <Badge className={priorityColors[gap.priority]}>
                        {gap.priority}
                      </Badge>
                      <Badge className={statusColors[gap.status]}>
                        {gap.status.replace('_', ' ')}
                      </Badge>
                      {gap.source && (
                        <Badge variant="outline" className="text-xs">
                          {gap.source}
                        </Badge>
                      )}
                    </div>

                    {/* Level Gap Visualization */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Current: Level {gap.current_level}
                        </span>
                        <span className="text-muted-foreground">
                          Required: Level {gap.required_level}
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute inset-y-0 left-0 bg-primary/50 rounded-full"
                          style={{ width: `${(gap.current_level / gap.required_level) * 100}%` }}
                        />
                        <div 
                          className="absolute inset-y-0 bg-destructive/30 rounded-full"
                          style={{ 
                            left: `${(gap.current_level / gap.required_level) * 100}%`,
                            right: 0 
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Gap: {gap.gap_score} level{gap.gap_score !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Recommended Actions */}
                    {gap.recommended_actions && gap.recommended_actions.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Recommended Actions:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                      {gap.recommended_actions.slice(0, 3).map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <BookOpen className="h-4 w-4 mt-0.5 shrink-0" />
                              <span>{action.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* IDP Link */}
                    {gap.idp_item_id && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <LinkIcon className="h-4 w-4" />
                        <span>Linked to IDP goal</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isReadOnly && gap.status === 'open' && (
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(gap.id, 'in_progress')}
                      >
                        Start Working
                      </Button>
                    </div>
                  )}
                  {!isReadOnly && gap.status === 'in_progress' && (
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm"
                        onClick={() => handleStatusChange(gap.id, 'addressed')}
                      >
                        Mark Addressed
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
