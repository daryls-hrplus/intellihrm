import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Eye,
  Info 
} from 'lucide-react';
import { useAppraisalFeedbackInsights, useTrackEvidenceView } from '@/hooks/appraisal/useAppraisalFeedbackInsights';
import { FeedbackSignalSummary } from './FeedbackSignalSummary';
import { CoachingPromptsPanel } from './CoachingPromptsPanel';
import { InsightCautionBadges } from './InsightCautionBadges';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AppraisalFeedback360PanelProps {
  participantId?: string;
  employeeId?: string;
  employeeName?: string;
  isReadOnly?: boolean;
  visibilityLevel?: 'summary' | 'detailed' | 'full';
}

export function AppraisalFeedback360Panel({
  participantId,
  employeeId,
  employeeName = 'Employee',
  isReadOnly = true,
  visibilityLevel = 'summary',
}: AppraisalFeedback360PanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: insights, isLoading } = useAppraisalFeedbackInsights(participantId, employeeId);
  const trackView = useTrackEvidenceView();

  const handleViewSignals = () => {
    if (participantId) {
      trackView.mutate({ 
        participantId, 
        evidenceType: 'talent_signals' 
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading 360° insights...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.signals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No 360° feedback data available for this employee.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    360° Feedback Insights
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          These insights are derived from recent 360° feedback cycles. 
                          Use them to inform your conversation, not as definitive ratings.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <CardDescription>
                    Use these insights to guide your appraisal conversation with {employeeName}
                  </CardDescription>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            {/* Caution badges always visible */}
            {insights.cautions.length > 0 && (
              <InsightCautionBadges cautions={insights.cautions} />
            )}
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <Tabs defaultValue="signals" className="w-full" onValueChange={handleViewSignals}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signals" className="gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Signal Summary
                  </TabsTrigger>
                  <TabsTrigger value="coaching" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Coaching Prompts
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signals" className="mt-4">
                  <FeedbackSignalSummary 
                    signals={insights.signals} 
                    visibilityLevel={visibilityLevel}
                  />
                </TabsContent>

                <TabsContent value="coaching" className="mt-4">
                  <CoachingPromptsPanel 
                    prompts={insights.coachingPrompts}
                    isReadOnly={isReadOnly}
                  />
                </TabsContent>
              </Tabs>

              {/* View tracking indicator */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  {insights.evidenceUsage.some(e => e.was_viewed) 
                    ? 'You have reviewed this feedback'
                    : 'Mark as reviewed when done'
                  }
                </div>
                {isReadOnly && (
                  <Badge variant="outline" className="text-xs">
                    Read-only
                  </Badge>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </TooltipProvider>
  );
}
