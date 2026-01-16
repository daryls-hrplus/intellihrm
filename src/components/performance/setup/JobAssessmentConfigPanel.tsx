import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Target,
  Scale,
  Info,
  Layers
} from 'lucide-react';
import { useAppraisalReadinessValidation, ValidationIssue } from '@/hooks/useAppraisalReadinessValidation';
import { ASSESSMENT_MODE_LABELS, AssessmentMode } from '@/types/appraisalKRASnapshot';
import { cn } from '@/lib/utils';

interface JobAssessmentConfigPanelProps {
  companyId: string;
}

interface JobValidationResult {
  jobId: string;
  jobName: string;
  responsibilityCount: number;
  responsibilityWeightTotal: number;
  kraCount: number;
  status: 'valid' | 'warning' | 'error';
  issues: ValidationIssue[];
  responsibilities: {
    id: string;
    name: string;
    weight: number;
    assessmentMode: AssessmentMode;
    kraCount: number;
    kraWeightTotal: number;
  }[];
}

export function JobAssessmentConfigPanel({ companyId }: JobAssessmentConfigPanelProps) {
  const navigate = useNavigate();
  const { validateJobConfiguration } = useAppraisalReadinessValidation();
  const [jobs, setJobs] = useState<JobValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  const fetchAndValidateJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all jobs for the company with responsibilities and KRAs
      const { data: jobsData, error } = await supabase
        .from('jobs')
        .select(`
          id,
          name,
          job_responsibilities (
            id,
            responsibility_id,
            weighting,
            assessment_mode,
            responsibilities (id, name),
            job_responsibility_kras (id, weight)
          )
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Process and validate each job
      const validatedJobs: JobValidationResult[] = (jobsData || []).map((job: any) => {
        const responsibilities = (job.job_responsibilities || []).filter((r: any) => !r.end_date);
        const respWeightTotal = responsibilities.reduce((sum: number, r: any) => sum + (r.weighting || 0), 0);
        const totalKras = responsibilities.reduce((sum: number, r: any) => sum + (r.job_responsibility_kras?.length || 0), 0);
        
        const issues: ValidationIssue[] = [];
        
        // Check responsibility configuration
        if (responsibilities.length === 0) {
          issues.push({
            type: 'error',
            category: 'responsibility',
            message: 'No responsibilities assigned',
            actionable: true,
          });
        } else if (respWeightTotal !== 100) {
          issues.push({
            type: 'warning',
            category: 'responsibility',
            message: `Responsibility weights total ${respWeightTotal}% (should be 100%)`,
            actionable: true,
          });
        }

        // Check KRA configuration per responsibility
        responsibilities.forEach((resp: any) => {
          const mode: AssessmentMode = resp.assessment_mode || 'auto';
          const kras = resp.job_responsibility_kras || [];
          const kraWeight = kras.reduce((sum: number, k: any) => sum + (k.weight || 0), 0);
          
          const needsKRAs = mode === 'kra_based' || mode === 'hybrid' || 
            (mode === 'auto' && kras.length > 0);

          if (needsKRAs && kras.length > 0 && kraWeight !== 100) {
            issues.push({
              type: 'warning',
              category: 'kra',
              message: `"${resp.responsibilities?.name}": KRA weights total ${kraWeight}%`,
              actionable: true,
            });
          }
        });

        // Determine status
        let status: 'valid' | 'warning' | 'error' = 'valid';
        if (issues.some(i => i.type === 'error')) {
          status = 'error';
        } else if (issues.some(i => i.type === 'warning')) {
          status = 'warning';
        }

        return {
          jobId: job.id,
          jobName: job.name,
          responsibilityCount: responsibilities.length,
          responsibilityWeightTotal: respWeightTotal,
          kraCount: totalKras,
          status,
          issues,
          responsibilities: responsibilities.map((r: any) => ({
            id: r.responsibility_id,
            name: r.responsibilities?.name || 'Unknown',
            weight: r.weighting || 0,
            assessmentMode: r.assessment_mode || 'auto',
            kraCount: r.job_responsibility_kras?.length || 0,
            kraWeightTotal: (r.job_responsibility_kras || []).reduce((sum: number, k: any) => sum + (k.weight || 0), 0),
          })),
        };
      });

      setJobs(validatedJobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchAndValidateJobs();
    }
  }, [companyId, fetchAndValidateJobs]);

  const handleRefresh = async () => {
    setIsValidating(true);
    await fetchAndValidateJobs();
    setIsValidating(false);
  };

  const toggleJobExpanded = (jobId: string) => {
    setExpandedJobs(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const validCount = jobs.filter(j => j.status === 'valid').length;
  const warningCount = jobs.filter(j => j.status === 'warning').length;
  const errorCount = jobs.filter(j => j.status === 'error').length;

  const getStatusBadge = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Valid
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warnings
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" />
            Errors
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Job Assessment Configuration</CardTitle>
                <CardDescription>
                  Ensure jobs have properly configured responsibilities and KRAs for appraisal scoring
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isValidating}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isValidating && "animate-spin")} />
              Validate All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{jobs.length}</span>
              <span className="text-muted-foreground">Jobs</span>
            </div>
            <div className="h-4 border-r border-border" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">{validCount}</span>
              <span className="text-muted-foreground">Valid</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{warningCount}</span>
              <span className="text-muted-foreground">Warnings</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="font-medium">{errorCount}</span>
              <span className="text-muted-foreground">Errors</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guidance Alert */}
      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription>
          For accurate appraisal scoring, each job should have responsibility weights totaling 100%. 
          If using KRA-based assessment, each responsibility's KRA weights should also total 100%.
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 ml-2"
            onClick={() => navigate('/workforce/jobs')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Manage Jobs
          </Button>
        </AlertDescription>
      </Alert>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No active jobs found for this company</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => navigate('/workforce/jobs')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-3 pr-4">
            {jobs.map((job) => (
              <Card 
                key={job.jobId}
                className={cn(
                  "transition-colors",
                  job.status === 'error' && "border-destructive/50",
                  job.status === 'warning' && "border-amber-500/50"
                )}
              >
                <Collapsible 
                  open={expandedJobs.has(job.jobId)}
                  onOpenChange={() => toggleJobExpanded(job.jobId)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedJobs.has(job.jobId) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-medium">{job.jobName}</div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Layers className="h-3 w-3" />
                                {job.responsibilityCount} responsibilities ({job.responsibilityWeightTotal}%)
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {job.kraCount} KRAs
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(job.status)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/workforce/jobs/${job.jobId}`);
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4">
                      {/* Issues */}
                      {job.issues.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {job.issues.map((issue, idx) => (
                            <div 
                              key={idx}
                              className={cn(
                                "flex items-start gap-2 text-sm p-2 rounded-md",
                                issue.type === 'error' && "bg-destructive/10 text-destructive",
                                issue.type === 'warning' && "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              )}
                            >
                              {issue.type === 'error' ? (
                                <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                              )}
                              <span>{issue.message}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Responsibilities Detail */}
                      {job.responsibilities.length > 0 && (
                        <div className="border rounded-md">
                          <div className="grid grid-cols-5 gap-2 p-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                            <div className="col-span-2">Responsibility</div>
                            <div className="text-center">Weight</div>
                            <div className="text-center">Assessment Mode</div>
                            <div className="text-center">KRAs</div>
                          </div>
                          {job.responsibilities.map((resp) => {
                            const hasKRAWarning = (resp.assessmentMode === 'kra_based' || resp.assessmentMode === 'hybrid' || 
                              (resp.assessmentMode === 'auto' && resp.kraCount > 0)) && 
                              resp.kraCount > 0 && resp.kraWeightTotal !== 100;
                            
                            return (
                              <div 
                                key={resp.id}
                                className={cn(
                                  "grid grid-cols-5 gap-2 p-2 text-sm border-b last:border-b-0",
                                  hasKRAWarning && "bg-amber-500/5"
                                )}
                              >
                                <div className="col-span-2 truncate">{resp.name}</div>
                                <div className="text-center">
                                  <Badge variant="secondary" className="text-xs">
                                    {resp.weight}%
                                  </Badge>
                                </div>
                                <div className="text-center">
                                  <Badge variant="outline" className="text-xs">
                                    {ASSESSMENT_MODE_LABELS[resp.assessmentMode] || resp.assessmentMode}
                                  </Badge>
                                </div>
                                <div className="text-center">
                                  <span className={cn(
                                    "text-xs",
                                    hasKRAWarning && "text-amber-600"
                                  )}>
                                    {resp.kraCount} ({resp.kraWeightTotal}%)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
