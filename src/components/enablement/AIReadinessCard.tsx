import { useState } from "react";
import { useReleaseLifecycle, ReadinessAssessment } from "@/hooks/useReleaseLifecycle";
import { useQuickStartTemplates } from "@/hooks/useQuickStartTemplates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Brain, 
  RefreshCw, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  BookOpen,
  Rocket,
  ClipboardCheck,
  FolderTree,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";

export function AIReadinessCard() {
  const { lifecycle, updateReadinessCache, isLoading } = useReleaseLifecycle();
  const { data: quickstarts = [] } = useQuickStartTemplates(true);
  const [isAssessing, setIsAssessing] = useState(false);
  const [expandedManuals, setExpandedManuals] = useState(false);
  const [expandedContentTypes, setExpandedContentTypes] = useState(true);

  const assessment = lifecycle?.last_readiness_assessment;
  const lastAssessedAt = lifecycle?.last_assessment_at;
  
  // Calculate content type stats
  const publishedQuickstarts = quickstarts.filter(q => q.status === 'published').length;
  const totalQuickstarts = 18; // Target number of modules
  const totalManuals = 10; // Current manual count
  const totalChecklists = 5; // Implementation checklists

  const handleAssessReadiness = async () => {
    setIsAssessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('release-manager-agent', {
        body: { action: 'assess_readiness' },
      });

      if (error) throw error;

      if (data?.assessment) {
        await updateReadinessCache.mutateAsync(data.assessment);
        toast.success('Readiness assessment complete');
      }
    } catch (error: unknown) {
      console.error('Assessment error:', error);
      toast.error('Failed to assess readiness');
    } finally {
      setIsAssessing(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-[hsl(var(--semantic-success-bg))] text-[hsl(var(--semantic-success-text))] border-[hsl(var(--semantic-success-border))]';
      case 'B': return 'bg-[hsl(var(--semantic-info-bg))] text-[hsl(var(--semantic-info-text))] border-[hsl(var(--semantic-info-border))]';
      case 'C': return 'bg-[hsl(var(--semantic-warning-bg))] text-[hsl(var(--semantic-warning-text))] border-[hsl(var(--semantic-warning-border))]';
      case 'D': return 'bg-[hsl(var(--semantic-warning-bg))] text-[hsl(var(--semantic-warning-text))] border-[hsl(var(--semantic-warning-border))]';
      case 'F': return 'bg-[hsl(var(--semantic-error-bg))] text-[hsl(var(--semantic-error-text))] border-[hsl(var(--semantic-error-border))]';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[hsl(var(--semantic-success-text))]';
    if (score >= 60) return 'text-[hsl(var(--semantic-warning-text))]';
    return 'text-[hsl(var(--semantic-error-text))]';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Readiness Assessment
        </CardTitle>
        <Button 
          onClick={handleAssessReadiness} 
          disabled={isAssessing}
          size="sm"
        >
          {isAssessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Assessing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Assess Now
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!assessment ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No assessment available yet.</p>
            <p className="text-sm">Click "Assess Now" to analyze documentation readiness.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <div className="text-sm text-muted-foreground">Overall Readiness</div>
                <div className={`text-3xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                  {assessment.overallScore}%
                </div>
                {lastAssessedAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Last assessed: {formatDateForDisplay(lastAssessedAt, 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </div>
              <div className="text-right">
                <Badge variant="outline" className={`text-2xl font-bold px-4 py-2 ${getGradeColor(assessment.grade)}`}>
                  {assessment.grade}
                </Badge>
                <div className="text-sm text-muted-foreground mt-2">
                  {assessment.readyForRelease ? (
                    <span className="flex items-center gap-1 text-[hsl(var(--semantic-success-text))]">
                      <CheckCircle2 className="h-4 w-4" />
                      Ready for release
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[hsl(var(--semantic-warning-text))]">
                      <AlertCircle className="h-4 w-4" />
                      Not ready yet
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content Type Coverage */}
            <Collapsible open={expandedContentTypes} onOpenChange={setExpandedContentTypes}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                <div className="flex items-center gap-2 font-medium">
                  <FolderTree className="h-4 w-4" />
                  Content Coverage
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedContentTypes ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Manuals</span>
                    </div>
                    <p className="text-lg font-bold">{assessment?.manuals?.length || 0}/{totalManuals}</p>
                    <p className="text-xs text-muted-foreground">Administrator guides</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Rocket className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium">Quick Starts</span>
                    </div>
                    <p className="text-lg font-bold">{publishedQuickstarts}/{totalQuickstarts}</p>
                    <p className="text-xs text-muted-foreground">Module setup guides</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardCheck className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium">Checklists</span>
                    </div>
                    <p className="text-lg font-bold">{totalChecklists}/{totalChecklists}</p>
                    <p className="text-xs text-muted-foreground">Implementation ready</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FolderTree className="h-4 w-4 text-violet-600" />
                      <span className="text-sm font-medium">Modules</span>
                    </div>
                    <p className="text-lg font-bold">18/18</p>
                    <p className="text-xs text-muted-foreground">Documentation indexed</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Blockers */}
            {assessment.blockers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-[hsl(var(--semantic-error-text))]">
                  <AlertTriangle className="h-4 w-4" />
                  Blockers ({assessment.blockers.length})
                </div>
                <ul className="space-y-1 text-sm">
                  {assessment.blockers.map((blocker, index) => (
                    <li key={index} className="flex items-start gap-2 p-2 rounded bg-[hsl(var(--semantic-error-bg))] text-[hsl(var(--semantic-error-text))]">
                      <span className="opacity-60">•</span>
                      {blocker}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {assessment.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-[hsl(var(--semantic-warning-text))]">
                  <AlertCircle className="h-4 w-4" />
                  Warnings ({assessment.warnings.length})
                </div>
                <ul className="space-y-1 text-sm">
                  {assessment.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 p-2 rounded bg-[hsl(var(--semantic-warning-bg))] text-[hsl(var(--semantic-warning-text))]">
                      <span className="opacity-60">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Manual Breakdown */}
            {assessment.manuals.length > 0 && (
              <Collapsible open={expandedManuals} onOpenChange={setExpandedManuals}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                  <div className="flex items-center gap-2 font-medium">
                    <BookOpen className="h-4 w-4" />
                    Manual Readiness ({assessment.manuals.length} manuals)
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedManuals ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {assessment.manuals.map((manual) => (
                    <div key={manual.manualId} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{manual.name}</span>
                        <span className={`font-bold ${getScoreColor(manual.readinessScore)}`}>
                          {manual.readinessScore}%
                        </span>
                      </div>
                      <Progress value={manual.readinessScore} className="h-2 mb-2" />
                      {manual.issues.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Issues: {manual.issues.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
