import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Lightbulb, 
  ChevronDown, 
  ChevronRight,
  MessageSquare,
  Target,
  AlertTriangle,
  CheckCircle,
  X,
  TrendingUp,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertSeverity, AlertType } from "@/types/goalDependencies";

interface CoachingPrompt {
  id: string;
  goalId: string;
  goalTitle: string;
  employeeId: string;
  employeeName: string;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  aiExplanation: string | null;
  recommendedActions: string[];
  conversationStarters: string[];
}

interface ManagerCoachingPromptsProps {
  managerId?: string;
  maxItems?: number;
  onStartConversation?: (employeeId: string, goalId: string, prompt: string) => void;
}

const severityConfig: Record<AlertSeverity, { color: string; icon: React.ReactNode }> = {
  critical: { 
    color: "bg-destructive text-destructive-foreground", 
    icon: <AlertTriangle className="h-4 w-4" /> 
  },
  warning: { 
    color: "bg-warning text-warning-foreground", 
    icon: <AlertTriangle className="h-4 w-4" /> 
  },
  info: { 
    color: "bg-info text-info-foreground", 
    icon: <Lightbulb className="h-4 w-4" /> 
  },
};

const alertTypeLabels: Record<AlertType, string> = {
  dependency_blocked: "Blocked by Dependency",
  progress_behind: "Progress Behind",
  deadline_risk: "Deadline at Risk",
  cascade_impact: "Cascade Impact",
};

// Generate coaching conversation starters based on alert type
const generateConversationStarters = (alertType: AlertType, goalTitle: string): string[] => {
  switch (alertType) {
    case 'dependency_blocked':
      return [
        `I noticed ${goalTitle} is waiting on some dependencies. What can I do to help unblock this?`,
        `Let's talk about what's needed to move ${goalTitle} forward. Are there any resources I can provide?`,
        `I want to understand the blockers better. Can we walk through what's holding up ${goalTitle}?`,
      ];
    case 'progress_behind':
      return [
        `How are things going with ${goalTitle}? I noticed progress has slowed - is there anything I can help with?`,
        `Let's check in on ${goalTitle}. What challenges are you facing, and how can I support you?`,
        `I want to make sure you have what you need for ${goalTitle}. What would help you get back on track?`,
      ];
    case 'deadline_risk':
      return [
        `The deadline for ${goalTitle} is approaching. Let's discuss if we need to adjust scope or get additional support.`,
        `I want to ensure we hit our target for ${goalTitle}. What do you need to make that happen?`,
        `Let's review the timeline for ${goalTitle} together. Are there any concerns we should address?`,
      ];
    case 'cascade_impact':
      return [
        `${goalTitle} is connected to several other goals. Let's discuss how to minimize any ripple effects.`,
        `I want to understand the impact on related work. Can we map out the dependencies together?`,
        `Let's prioritize and see if there's a way to protect other goals while addressing ${goalTitle}.`,
      ];
    default:
      return [
        `Let's check in on ${goalTitle}. How can I support you?`,
        `I'd like to discuss your progress on ${goalTitle}. What's going well and what's challenging?`,
      ];
  }
};

export function ManagerCoachingPrompts({ 
  managerId, 
  maxItems = 5,
  onStartConversation 
}: ManagerCoachingPromptsProps) {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<CoachingPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCoachingPrompts();
  }, [managerId]);

  const loadCoachingPrompts = async () => {
    setLoading(true);
    try {
      // Get risk alerts with goal and employee info
      let query = supabase
        .from('goal_risk_alerts')
        .select(`
          id,
          goal_id,
          alert_type,
          severity,
          message,
          ai_explanation,
          recommended_actions,
          performance_goals!inner(
            id,
            title,
            employee_id,
            profiles!performance_goals_employee_id_fkey(
              id,
              first_name,
              last_name
            )
          )
        `)
        .eq('is_dismissed', false)
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(maxItems * 2);

      const { data, error } = await query;

      if (error) throw error;

      const processedPrompts: CoachingPrompt[] = (data || []).map(alert => {
        const goal = alert.performance_goals as any;
        const profile = goal?.profiles;
        const employeeName = profile 
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
          : 'Unknown Employee';

        return {
          id: alert.id,
          goalId: alert.goal_id,
          goalTitle: goal?.title || 'Unknown Goal',
          employeeId: goal?.employee_id || '',
          employeeName,
          alertType: alert.alert_type as AlertType,
          severity: alert.severity as AlertSeverity,
          message: alert.message,
          aiExplanation: alert.ai_explanation,
          recommendedActions: (alert.recommended_actions as string[]) || [],
          conversationStarters: generateConversationStarters(
            alert.alert_type as AlertType, 
            goal?.title || 'this goal'
          ),
        };
      });

      setPrompts(processedPrompts.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading coaching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (promptId: string) => {
    try {
      const { error } = await supabase
        .from('goal_risk_alerts')
        .update({
          is_dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', promptId);

      if (error) throw error;

      setDismissedIds(prev => new Set([...prev, promptId]));
      toast({
        title: "Prompt Dismissed",
        description: "This coaching prompt has been dismissed",
      });
    } catch (error) {
      console.error('Error dismissing prompt:', error);
      toast({
        title: "Error",
        description: "Failed to dismiss prompt",
        variant: "destructive",
      });
    }
  };

  const handleCopyStarter = (starter: string) => {
    navigator.clipboard.writeText(starter);
    toast({
      title: "Copied!",
      description: "Conversation starter copied to clipboard",
    });
  };

  const visiblePrompts = prompts.filter(p => !dismissedIds.has(p.id));

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-pulse text-muted-foreground">Loading coaching insights...</div>
        </CardContent>
      </Card>
    );
  }

  if (visiblePrompts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Coaching Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-32 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
          <p className="text-muted-foreground">All caught up!</p>
          <p className="text-sm text-muted-foreground">No coaching prompts at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Coaching Insights
        </CardTitle>
        <CardDescription>
          AI-powered conversation starters for your team's goals
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {visiblePrompts.map(prompt => {
              const isExpanded = expandedId === prompt.id;
              const config = severityConfig[prompt.severity];

              return (
                <Collapsible
                  key={prompt.id}
                  open={isExpanded}
                  onOpenChange={() => setExpandedId(isExpanded ? null : prompt.id)}
                >
                  <Card className={cn(
                    "border-l-4",
                    prompt.severity === 'critical' && "border-l-destructive",
                    prompt.severity === 'warning' && "border-l-warning",
                    prompt.severity === 'info' && "border-l-info"
                  )}>
                    <CardContent className="p-4">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 text-left">
                            <div className={cn("p-2 rounded-full", config.color)}>
                              {config.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{prompt.employeeName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {alertTypeLabels[prompt.alertType]}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {prompt.goalTitle}
                              </p>
                              <p className="text-sm mt-1">{prompt.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismiss(prompt.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-4 space-y-4">
                        {prompt.aiExplanation && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              AI Analysis
                            </p>
                            <p className="text-sm">{prompt.aiExplanation}</p>
                          </div>
                        )}

                        {prompt.recommendedActions.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Recommended Actions
                            </p>
                            <ul className="space-y-1">
                              {prompt.recommendedActions.map((action, idx) => (
                                <li key={idx} className="text-sm flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            Conversation Starters
                          </p>
                          <div className="space-y-2">
                            {prompt.conversationStarters.map((starter, idx) => (
                              <div 
                                key={idx}
                                className="group flex items-start gap-2 p-2 rounded-lg bg-background border hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => handleCopyStarter(starter)}
                              >
                                <span className="text-sm flex-1 italic text-muted-foreground group-hover:text-foreground">
                                  "{starter}"
                                </span>
                                <Badge variant="secondary" className="text-xs opacity-0 group-hover:opacity-100">
                                  Click to copy
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStartConversation?.(
                              prompt.employeeId, 
                              prompt.goalId,
                              prompt.conversationStarters[0]
                            )}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Start Conversation
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDismiss(prompt.id)}
                          >
                            Mark as Addressed
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </CardContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
