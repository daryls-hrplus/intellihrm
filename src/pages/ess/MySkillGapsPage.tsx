import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSkillGapManagement } from '@/hooks/performance/useSkillGapManagement';
import { useEffect, useState } from 'react';
import { EmployeeSkillGap } from '@/types/valuesAssessment';

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

export default function MySkillGapsPage() {
  const { user } = useAuth();
  const { gaps, loading, fetchEmployeeGaps } = useSkillGapManagement();
  const [localGaps, setLocalGaps] = useState<EmployeeSkillGap[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchEmployeeGaps(user.id);
    }
  }, [user?.id, fetchEmployeeGaps]);

  useEffect(() => {
    setLocalGaps(gaps);
  }, [gaps]);

  const openGaps = localGaps.filter(g => g.status === 'open' || g.status === 'in_progress');
  const completedGaps = localGaps.filter(g => g.status === 'addressed' || g.status === 'closed');

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Self Service', href: '/ess' },
            { label: 'My Skill Gaps' },
          ]}
        />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Skill Gaps</h1>
            <p className="text-muted-foreground">
              Track your development areas and recommended learning paths
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{openGaps.length}</p>
                  <p className="text-sm text-muted-foreground">Active Gaps</p>
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
                  <p className="text-2xl font-bold">{completedGaps.length}</p>
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
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {localGaps.filter(g => g.idp_item_id).length}
                  </p>
                  <p className="text-sm text-muted-foreground">In IDP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : localGaps.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="h-12 w-12 text-emerald-500/50 mb-4" />
              <h4 className="text-lg font-medium mb-2">No skill gaps identified</h4>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Great job! You're currently meeting all skill requirements for your role. 
                Keep building your capabilities through continuous learning.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Gaps */}
            {openGaps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Development Areas
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {openGaps.map((gap) => (
                    <Card key={gap.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{gap.capability_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Level {gap.current_level} → Level {gap.required_level}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={priorityColors[gap.priority]}>
                              {gap.priority}
                            </Badge>
                            <Badge className={statusColors[gap.status]}>
                              {gap.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${(gap.current_level / gap.required_level) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {Math.round((gap.current_level / gap.required_level) * 100)}% of target
                          </p>
                        </div>

                        {/* Recommendations */}
                        {gap.recommended_actions && gap.recommended_actions.length > 0 && (
                          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Lightbulb className="h-4 w-4 text-amber-500" />
                              Suggested Actions
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {gap.recommended_actions.slice(0, 2).map((action, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {action.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Gaps */}
            {completedGaps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Addressed Gaps
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {completedGaps.map((gap) => (
                    <Card key={gap.id} className="opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{gap.capability_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Reached Level {gap.required_level}
                            </p>
                          </div>
                          <Badge className={statusColors[gap.status]}>
                            {gap.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
