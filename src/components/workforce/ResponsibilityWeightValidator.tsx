import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { Scale, ChevronDown, ChevronUp, Wand2, CheckCircle2, AlertTriangle, Target, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AssessmentMode, ASSESSMENT_MODE_LABELS } from '@/types/appraisalKRASnapshot';

interface ResponsibilityWeight {
  id: string;
  responsibilityId: string;
  name: string;
  weight: number;
  assessmentMode: AssessmentMode;
  kraCount: number;
  kraWeightTotal: number;
  kras: { id: string; name: string; weight: number }[];
}

interface ResponsibilityWeightValidatorProps {
  jobId: string;
  onValidationChange?: (isValid: boolean) => void;
  showAutoDistribute?: boolean;
  compact?: boolean;
}

export function ResponsibilityWeightValidator({
  jobId,
  onValidationChange,
  showAutoDistribute = true,
  compact = false,
}: ResponsibilityWeightValidatorProps) {
  const [responsibilities, setResponsibilities] = useState<ResponsibilityWeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [distributing, setDistributing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('job_responsibilities')
        .select(`
          id,
          responsibility_id,
          weighting,
          assessment_mode,
          responsibilities (id, name),
          job_responsibility_kras (id, name, weight)
        `)
        .eq('job_id', jobId)
        .is('end_date', null);

      if (error) throw error;

      const mapped: ResponsibilityWeight[] = (data || []).map((jr: any) => ({
        id: jr.id,
        responsibilityId: jr.responsibility_id,
        name: jr.responsibilities?.name || 'Unknown',
        weight: jr.weighting || 0,
        assessmentMode: jr.assessment_mode || 'auto',
        kraCount: jr.job_responsibility_kras?.length || 0,
        kraWeightTotal: (jr.job_responsibility_kras || []).reduce(
          (sum: number, k: any) => sum + (k.weight || 0), 
          0
        ),
        kras: (jr.job_responsibility_kras || []).map((k: any) => ({
          id: k.id,
          name: k.name,
          weight: k.weight || 0,
        })),
      }));

      setResponsibilities(mapped);
    } catch (err) {
      console.error('Error fetching responsibilities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  // Calculate totals
  const respWeightTotal = responsibilities.reduce((sum, r) => sum + r.weight, 0);
  const isRespWeightValid = respWeightTotal === 100;
  
  const invalidKRAWeights = responsibilities.filter(r => {
    const needsKRAs = r.assessmentMode === 'kra_based' || r.assessmentMode === 'hybrid' ||
      (r.assessmentMode === 'auto' && r.kraCount > 0);
    return needsKRAs && r.kraCount > 0 && r.kraWeightTotal !== 100;
  });
  
  const isFullyValid = isRespWeightValid && invalidKRAWeights.length === 0;

  useEffect(() => {
    onValidationChange?.(isFullyValid);
  }, [isFullyValid, onValidationChange]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const distributeRespWeightsEvenly = async () => {
    if (responsibilities.length === 0) return;
    
    setDistributing(true);
    try {
      const baseWeight = Math.floor(100 / responsibilities.length);
      const remainder = 100 - (baseWeight * responsibilities.length);

      for (let i = 0; i < responsibilities.length; i++) {
        const newWeight = baseWeight + (i < remainder ? 1 : 0);
        await supabase
          .from('job_responsibilities')
          .update({ weighting: newWeight })
          .eq('id', responsibilities[i].id);
      }

      toast.success('Weights distributed evenly');
      fetchData();
    } catch (err) {
      toast.error('Failed to distribute weights');
    } finally {
      setDistributing(false);
    }
  };

  const distributeKRAWeightsEvenly = async (respId: string) => {
    const resp = responsibilities.find(r => r.id === respId);
    if (!resp || resp.kras.length === 0) return;

    setDistributing(true);
    try {
      const baseWeight = Math.floor(100 / resp.kras.length);
      const remainder = 100 - (baseWeight * resp.kras.length);

      for (let i = 0; i < resp.kras.length; i++) {
        const newWeight = baseWeight + (i < remainder ? 1 : 0);
        await supabase
          .from('job_responsibility_kras')
          .update({ weight: newWeight })
          .eq('id', resp.kras[i].id);
      }

      toast.success('KRA weights distributed evenly');
      fetchData();
    } catch (err) {
      toast.error('Failed to distribute KRA weights');
    } finally {
      setDistributing(false);
    }
  };

  if (loading) {
    return (
      <Card className={compact ? 'p-3' : ''}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Scale className="h-4 w-4 text-muted-foreground" />
        <span>Responsibilities: {respWeightTotal}%</span>
        {isRespWeightValid ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
        {invalidKRAWeights.length > 0 && (
          <Badge variant="outline" className="text-amber-600">
            {invalidKRAWeights.length} KRA issue(s)
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-5 w-5" />
            Weight Validation
          </CardTitle>
          {isFullyValid ? (
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Issues Found
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Responsibility Weights Total */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Responsibility Weights</span>
            <Badge variant={isRespWeightValid ? 'outline' : 'destructive'}>
              {respWeightTotal}% / 100%
            </Badge>
          </div>
          <Progress 
            value={Math.min(respWeightTotal, 100)} 
            max={100} 
            className={cn("h-2", !isRespWeightValid && "bg-destructive/20")}
          />
        </div>

        {/* Per-Responsibility KRA Weights */}
        <div className="space-y-2 border-t pt-3">
          <span className="text-sm font-medium text-muted-foreground">
            Per-Responsibility KRA Weights
          </span>
          
          {responsibilities.map((resp) => {
            const isExpanded = expandedItems.has(resp.id);
            const needsKRAs = resp.assessmentMode === 'kra_based' || 
              resp.assessmentMode === 'hybrid' ||
              (resp.assessmentMode === 'auto' && resp.kraCount > 0);
            const hasKRAIssue = needsKRAs && resp.kraCount > 0 && resp.kraWeightTotal !== 100;

            return (
              <Collapsible 
                key={resp.id} 
                open={isExpanded} 
                onOpenChange={() => toggleExpanded(resp.id)}
              >
                <div className="pl-3 border-l-2 border-muted">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-muted/30 px-2 rounded -mx-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm truncate">{resp.name}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {resp.weight}%
                        </Badge>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {ASSESSMENT_MODE_LABELS[resp.assessmentMode]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {resp.kraCount > 0 && (
                          <Badge 
                            variant={hasKRAIssue ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            KRAs: {resp.kraWeightTotal}%
                          </Badge>
                        )}
                        {resp.kraCount > 0 && (
                          isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  {resp.kraCount > 0 && (
                    <CollapsibleContent>
                      <div className="pl-4 py-2 space-y-2">
                        {resp.kras.map((kra) => (
                          <div key={kra.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Target className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{kra.name}</span>
                            </div>
                            <span className="font-medium">{kra.weight}%</span>
                          </div>
                        ))}
                        {hasKRAIssue && showAutoDistribute && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => distributeKRAWeightsEvenly(resp.id)}
                            disabled={distributing}
                            className="text-xs h-7"
                          >
                            <Wand2 className="h-3 w-3 mr-1" />
                            Auto-Distribute KRA Weights
                          </Button>
                        )}
                      </div>
                    </CollapsibleContent>
                  )}
                </div>
              </Collapsible>
            );
          })}
        </div>

        {/* Auto-distribute button */}
        {showAutoDistribute && !isRespWeightValid && responsibilities.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={distributeRespWeightsEvenly}
            disabled={distributing}
            className="w-full"
          >
            {distributing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            Auto-Distribute Responsibility Weights
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
