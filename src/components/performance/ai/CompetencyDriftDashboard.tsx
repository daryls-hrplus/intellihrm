import React, { useEffect, useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Sparkles,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  useCompetencyDriftAnalyzer,
  CompetencyDriftAnalysis,
  EmergingSkillSignal,
  DriftType,
  RecommendationType,
  DriftStatus
} from '@/hooks/performance/useCompetencyDriftAnalyzer';

interface CompetencyDriftDashboardProps {
  companyId: string;
  onActionTaken?: (driftId: string, action: string) => void;
  className?: string;
}

const driftTypeConfig: Record<DriftType, { label: string; icon: React.ReactNode; color: string }> = {
  declining_relevance: { 
    label: 'Declining Relevance', 
    icon: <TrendingDown className="h-4 w-4" />, 
    color: 'text-orange-600 bg-orange-50 border-orange-200' 
  },
  emerging_importance: { 
    label: 'Emerging Importance', 
    icon: <TrendingUp className="h-4 w-4" />, 
    color: 'text-green-600 bg-green-50 border-green-200' 
  },
  rating_pattern: { 
    label: 'Rating Pattern', 
    icon: <AlertTriangle className="h-4 w-4" />, 
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200' 
  },
};

const recommendationConfig: Record<RecommendationType, { label: string; icon: React.ReactNode }> = {
  update_profile: { label: 'Update Job Profile', icon: <Briefcase className="h-4 w-4" /> },
  add_skill: { label: 'Add New Skill', icon: <Sparkles className="h-4 w-4" /> },
  retire_competency: { label: 'Retire Competency', icon: <X className="h-4 w-4" /> },
};

const statusConfig: Record<DriftStatus, { label: string; color: string }> = {
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-800' },
  actioned: { label: 'Actioned', color: 'bg-green-100 text-green-800' },
  dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-800' },
};

export function CompetencyDriftDashboard({
  companyId,
  onActionTaken,
  className,
}: CompetencyDriftDashboardProps) {
  const [expandedDrift, setExpandedDrift] = useState<string | null>(null);
  
  const { toast } = useToast();
  const {
    analyzing,
    driftAnalyses,
    emergingSkills,
    analyzeCompetencyDrift,
    fetchDriftAnalyses,
    fetchEmergingSkills,
    updateDriftStatus,
    validateEmergingSkill,
  } = useCompetencyDriftAnalyzer();

  useEffect(() => {
    if (companyId) {
      fetchDriftAnalyses(companyId);
      fetchEmergingSkills(companyId);
    }
  }, [companyId, fetchDriftAnalyses, fetchEmergingSkills]);

  const handleRunAnalysis = async () => {
    const result = await analyzeCompetencyDrift(companyId);
    if (result) {
      toast({
        title: 'Analysis Complete',
        description: `Found ${result.summary.totalDrifts} drift patterns and ${result.summary.emergingSkills} emerging skills.`,
      });
    }
  };

  const handleUpdateStatus = async (driftId: string, status: DriftStatus, userId: string) => {
    const success = await updateDriftStatus(driftId, status, userId);
    if (success) {
      toast({
        title: 'Status Updated',
        description: `Drift analysis marked as ${status}.`,
      });
      onActionTaken?.(driftId, status);
    }
  };

  const handleValidateSkill = async (skillId: string, validated: boolean) => {
    const success = await validateEmergingSkill(skillId, validated);
    if (success) {
      toast({
        title: validated ? 'Skill Validated' : 'Skill Dismissed',
        description: validated 
          ? 'The emerging skill has been validated and can be added to competency framework.'
          : 'The emerging skill signal has been dismissed.',
      });
    }
  };

  const pendingDrifts = driftAnalyses.filter(d => d.status === 'pending');
  const unvalidatedSkills = emergingSkills.filter(s => !s.isValidated);

  if (analyzing && driftAnalyses.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Competency Drift Analysis</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {pendingDrifts.length > 0 && (
              <Badge variant="secondary">
                {pendingDrifts.length} Pending
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRunAnalysis}
              disabled={analyzing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", analyzing && "animate-spin")} />
              Analyze
            </Button>
          </div>
        </div>
        <CardDescription>
          AI-detected competency trends and emerging skills across the organization
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="drifts">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="drifts">
              <TrendingDown className="h-4 w-4 mr-2" />
              Drift Patterns ({driftAnalyses.length})
            </TabsTrigger>
            <TabsTrigger value="emerging">
              <Sparkles className="h-4 w-4 mr-2" />
              Emerging Skills ({emergingSkills.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drifts" className="mt-4">
            {driftAnalyses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No competency drift patterns detected</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={handleRunAnalysis}>
                  Run Analysis
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {driftAnalyses.map((drift) => {
                    const typeConfig = driftTypeConfig[drift.driftType];
                    const recConfig = recommendationConfig[drift.recommendation];
                    const statConfig = statusConfig[drift.status];
                    
                    return (
                      <Collapsible 
                        key={drift.id}
                        open={expandedDrift === drift.id}
                        onOpenChange={() => setExpandedDrift(
                          expandedDrift === drift.id ? null : drift.id
                        )}
                      >
                        <div className={cn("p-4 rounded-lg border", typeConfig.color)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {typeConfig.icon}
                                <span className="font-medium">
                                  {drift.competencyName || drift.skillName || 'Unknown Competency'}
                                </span>
                                <Badge className={statConfig.color}>{statConfig.label}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {typeConfig.label} • Affects {drift.affectedEmployeesCount} employees
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span>
                                  Trend: {drift.avgRatingTrend > 0 ? '+' : ''}{drift.avgRatingTrend.toFixed(1)}%
                                </span>
                                <span>
                                  {drift.affectedJobProfilesCount} job profile{drift.affectedJobProfilesCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                {expandedDrift === drift.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </div>

                          <CollapsibleContent className="mt-3 pt-3 border-t">
                            {drift.recommendationDetails && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 p-2 rounded bg-background/50">
                                  {recConfig.icon}
                                  <span className="text-sm font-medium">{recConfig.label}</span>
                                  {drift.recommendationDetails.urgency && (
                                    <Badge variant="outline" className="ml-auto text-xs">
                                      {drift.recommendationDetails.urgency} urgency
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm">{drift.recommendationDetails.reason}</p>
                                
                                {drift.recommendationDetails.suggestedAction && (
                                  <div className="p-2 rounded bg-primary/5 border border-primary/10">
                                    <p className="text-xs font-medium mb-1">Suggested Action:</p>
                                    <p className="text-sm">{drift.recommendationDetails.suggestedAction}</p>
                                  </div>
                                )}

                                {drift.status === 'pending' && (
                                  <div className="flex items-center gap-2 pt-2">
                                    <Button 
                                      size="sm"
                                      onClick={() => handleUpdateStatus(drift.id, 'actioned', '')}
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Take Action
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateStatus(drift.id, 'reviewed', '')}
                                    >
                                      Mark Reviewed
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleUpdateStatus(drift.id, 'dismissed', '')}
                                    >
                                      Dismiss
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="emerging" className="mt-4">
            {emergingSkills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No emerging skills detected</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {emergingSkills.map((skill) => (
                    <div 
                      key={skill.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        skill.isValidated 
                          ? "bg-green-50 border-green-200" 
                          : "bg-purple-50 border-purple-200"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">{skill.skillName}</span>
                            {skill.isValidated && (
                              <Badge className="bg-green-500">Validated</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Detected from: {skill.detectionSource.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            +{skill.growthRate.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Growth</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Mentions</span>
                            <span>{skill.mentionCount}</span>
                          </div>
                          <Progress value={Math.min(skill.mentionCount * 10, 100)} className="h-1.5" />
                        </div>
                      </div>

                      {!skill.isValidated && (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleValidateSkill(skill.id, true)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Validate & Add
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleValidateSkill(skill.id, false)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
