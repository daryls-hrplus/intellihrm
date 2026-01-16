import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Briefcase, Target, ChevronRight, AlertTriangle, Loader2, Plus, FileText } from 'lucide-react';
import { AssessmentModeIndicator } from '@/components/workforce/AssessmentModeIndicator';
import { AssessmentMode } from '@/types/appraisalKRASnapshot';

interface KRATarget {
  id: string;
  name: string;
  description: string | null;
  target_metric: string | null;
  job_specific_target: string | null;
  weight: number;
  measurement_method: string | null;
}

interface ResponsibilityTarget {
  id: string;
  responsibilityId: string;
  name: string;
  description: string | null;
  weight: number;
  assessmentMode: AssessmentMode;
  kras: KRATarget[];
  kraWeightTotal: number;
}

interface PositionInfo {
  id: string;
  title: string;
  jobId: string | null;
  jobName: string | null;
  department: string | null;
}

export default function MyPerformanceTargetsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState<PositionInfo | null>(null);
  const [responsibilities, setResponsibilities] = useState<ResponsibilityTarget[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchTargets();
    }
  }, [user?.id]);

  const fetchTargets = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // 1. Get employee's current position
      const { data: positions, error: posError } = await supabase
        .from('employee_positions')
        .select(`
          id,
          position_id,
          positions (
            id,
            title,
            job_id,
            department_id,
            jobs (id, name),
            departments (id, name)
          )
        `)
        .eq('employee_id', user.id)
        .eq('is_active', true)
        .is('end_date', null)
        .limit(1);

      if (posError) throw posError;

      if (!positions || positions.length === 0) {
        setLoading(false);
        return;
      }

      const pos = positions[0] as any;
      setPosition({
        id: pos.position_id,
        title: pos.positions?.title || 'Unknown Position',
        jobId: pos.positions?.job_id || null,
        jobName: pos.positions?.jobs?.name || null,
        department: pos.positions?.departments?.name || null,
      });

      const jobId = pos.positions?.job_id;
      if (!jobId) {
        setLoading(false);
        return;
      }

      // 2. Fetch job responsibilities with KRAs
      const { data: jobResps, error: respError } = await supabase
        .from('job_responsibilities')
        .select(`
          id,
          responsibility_id,
          weighting,
          assessment_mode,
          responsibilities (id, name, description),
          job_responsibility_kras (
            id,
            name,
            job_specific_target,
            weight,
            measurement_method,
            responsibility_kra_id,
            responsibility_kras (
              id, name, description, target_metric
            )
          )
        `)
        .eq('job_id', jobId)
        .is('end_date', null)
        .order('weighting', { ascending: false });

      if (respError) throw respError;

      const mapped: ResponsibilityTarget[] = (jobResps || []).map((jr: any) => {
        const kras: KRATarget[] = (jr.job_responsibility_kras || []).map((jk: any) => ({
          id: jk.id,
          name: jk.name || jk.responsibility_kras?.name || 'Unknown KRA',
          description: jk.responsibility_kras?.description || null,
          target_metric: jk.responsibility_kras?.target_metric || null,
          job_specific_target: jk.job_specific_target,
          weight: jk.weight || 0,
          measurement_method: jk.measurement_method,
        }));

        const kraWeightTotal = kras.reduce((sum, k) => sum + k.weight, 0);

        return {
          id: jr.id,
          responsibilityId: jr.responsibility_id,
          name: jr.responsibilities?.name || 'Unknown',
          description: jr.responsibilities?.description || null,
          weight: jr.weighting || 0,
          assessmentMode: jr.assessment_mode || 'auto',
          kras,
          kraWeightTotal,
        };
      });

      setResponsibilities(mapped);
    } catch (err) {
      console.error('Error fetching targets:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRespWeight = responsibilities.reduce((sum, r) => sum + r.weight, 0);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Performance Targets</h1>
        <p className="text-muted-foreground">
          Your responsibilities and key result areas for the current performance period
        </p>
      </div>

      {/* Position Card */}
      {position ? (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{position.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {position.jobName && (
                    <>
                      <span>{position.jobName}</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                  {position.department && <span>{position.department}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="text-muted-foreground">No active position found</p>
            <p className="text-sm text-muted-foreground">
              Contact HR to have your position assigned
            </p>
          </CardContent>
        </Card>
      )}

      {/* Weight Summary */}
      {responsibilities.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Total Responsibility Weight</span>
              <Badge variant={totalRespWeight === 100 ? 'outline' : 'secondary'}>
                {totalRespWeight}% / 100%
              </Badge>
            </div>
            <Progress value={Math.min(totalRespWeight, 100)} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Responsibilities Accordion */}
      {responsibilities.length > 0 ? (
        <Accordion type="multiple" className="space-y-3">
          {responsibilities.map((resp) => (
            <AccordionItem
              key={resp.id}
              value={resp.id}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="font-medium block truncate">{resp.name}</span>
                      {resp.description && (
                        <span className="text-sm text-muted-foreground line-clamp-1">
                          {resp.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <AssessmentModeIndicator
                      mode={resp.assessmentMode}
                      kraCount={resp.kras.length}
                      weightsValid={resp.kraWeightTotal === 100 || resp.kras.length === 0}
                      totalWeight={resp.kraWeightTotal}
                      size="sm"
                    />
                    <Badge className="text-base font-semibold">
                      {resp.weight}%
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 pt-2">
                  {resp.description && (
                    <p className="text-sm text-muted-foreground">{resp.description}</p>
                  )}

                  {/* KRAs */}
                  {resp.kras.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Key Result Areas ({resp.kras.length})
                        </span>
                        <Badge
                          variant={resp.kraWeightTotal === 100 ? 'outline' : 'secondary'}
                          className="text-xs"
                        >
                          {resp.kraWeightTotal}% total
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {resp.kras.map((kra, idx) => (
                          <Card key={kra.id} className="bg-muted/30">
                            <CardContent className="py-3 px-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-primary">
                                      {idx + 1}.
                                    </span>
                                    <span className="font-medium">{kra.name}</span>
                                    {kra.measurement_method && (
                                      <Badge variant="secondary" className="text-xs">
                                        {kra.measurement_method}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {kra.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {kra.description}
                                    </p>
                                  )}
                                  
                                  {(kra.job_specific_target || kra.target_metric) && (
                                    <div className="mt-2 p-2 bg-background rounded border">
                                      <div className="flex items-center gap-1 text-xs font-medium text-primary mb-1">
                                        <Target className="h-3 w-3" />
                                        Target
                                      </div>
                                      <p className="text-sm">
                                        {kra.job_specific_target || kra.target_metric}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <Badge variant="outline" className="shrink-0">
                                  {kra.weight}%
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <FileText className="h-5 w-5 mx-auto mb-1 opacity-50" />
                      No specific KRAs defined - rated as overall responsibility
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Performance Targets Found</h3>
            <p className="text-muted-foreground mb-4">
              Your job doesn't have any responsibilities or KRAs configured yet
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Personal Stretch Target Button (Future Feature) */}
      {responsibilities.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" disabled className="gap-2">
            <Plus className="h-4 w-4" />
            Add Personal Stretch Target
            <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
          </Button>
        </div>
      )}
    </div>
  );
}
