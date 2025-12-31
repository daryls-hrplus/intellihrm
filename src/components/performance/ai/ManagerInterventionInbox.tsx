import React, { useEffect, useState } from 'react';
import { 
  Inbox, 
  MessageSquare, 
  Award, 
  AlertTriangle,
  Calendar,
  Check,
  X,
  ChevronRight,
  RefreshCw,
  Bell,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  useContinuousPerformance,
  InterventionPrompt
} from '@/hooks/performance/useContinuousPerformance';

interface ManagerInterventionInboxProps {
  managerId: string;
  companyId: string;
  maxItems?: number;
  onActionTaken?: (promptId: string, action: string) => void;
  className?: string;
}

const promptTypeConfig: Record<InterventionPrompt['promptType'], { 
  label: string; 
  icon: React.ReactNode; 
  color: string;
  bgColor: string;
}> = {
  coaching: { 
    label: 'Coaching', 
    icon: <MessageSquare className="h-4 w-4" />, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  recognition: { 
    label: 'Recognition', 
    icon: <Award className="h-4 w-4" />, 
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200'
  },
  check_in: { 
    label: 'Check-in', 
    icon: <Calendar className="h-4 w-4" />, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200'
  },
  concern: { 
    label: 'Concern', 
    icon: <AlertTriangle className="h-4 w-4" />, 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200'
  },
};

const priorityConfig: Record<InterventionPrompt['priority'], { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-destructive/10 text-destructive' },
};

export function ManagerInterventionInbox({
  managerId,
  companyId,
  maxItems = 10,
  onActionTaken,
  className,
}: ManagerInterventionInboxProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<InterventionPrompt | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [showActionDialog, setShowActionDialog] = useState(false);

  const { toast } = useToast();
  const {
    loading,
    interventionPrompts,
    generateInterventionPrompts,
    fetchInterventionPrompts,
    dismissPrompt,
    markPromptActioned,
  } = useContinuousPerformance();

  useEffect(() => {
    if (managerId) {
      fetchInterventionPrompts(managerId);
    }
  }, [managerId, fetchInterventionPrompts]);

  const handleRefresh = async () => {
    await generateInterventionPrompts(managerId, companyId);
  };

  const handleDismiss = async (promptId: string) => {
    const success = await dismissPrompt(promptId);
    if (success) {
      toast({
        title: 'Prompt Dismissed',
        description: 'The intervention prompt has been dismissed.',
      });
    }
  };

  const handleTakeAction = (prompt: InterventionPrompt) => {
    setSelectedPrompt(prompt);
    setShowActionDialog(true);
  };

  const handleConfirmAction = async () => {
    if (selectedPrompt && actionNotes.trim()) {
      const success = await markPromptActioned(selectedPrompt.id, actionNotes);
      if (success) {
        toast({
          title: 'Action Recorded',
          description: 'Your action has been recorded.',
        });
        onActionTaken?.(selectedPrompt.id, actionNotes);
        setShowActionDialog(false);
        setSelectedPrompt(null);
        setActionNotes('');
      }
    }
  };

  const displayedPrompts = interventionPrompts.slice(0, maxItems);

  if (loading && interventionPrompts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Coaching Inbox</CardTitle>
              {interventionPrompts.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {interventionPrompts.length}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
          <CardDescription>
            AI-generated prompts to help you support your team
          </CardDescription>
        </CardHeader>

        <CardContent>
          {displayedPrompts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No intervention prompts</p>
              <p className="text-xs text-muted-foreground">
                Your team is performing well, or we don't have enough data yet.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>
                Check for Updates
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {displayedPrompts.map((prompt) => {
                  const typeConfig = promptTypeConfig[prompt.promptType];
                  const prioConfig = priorityConfig[prompt.priority];
                  
                  return (
                    <div 
                      key={prompt.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        typeConfig.bgColor,
                        prompt.isActioned && "opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={typeConfig.color}>{typeConfig.icon}</span>
                          <span className="text-sm font-medium">{prompt.promptTitle}</span>
                        </div>
                        <Badge className={prioConfig.color}>{prioConfig.label}</Badge>
                      </div>

                      {prompt.employeeName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <User className="h-3 w-3" />
                          {prompt.employeeName}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mb-3">
                        {prompt.promptMessage}
                      </p>

                      {prompt.suggestedActions && prompt.suggestedActions.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium mb-1">Suggested Actions:</p>
                          <ul className="space-y-1">
                            {prompt.suggestedActions.slice(0, 2).map((action, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                <ChevronRight className="h-3 w-3" />
                                {action.action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {!prompt.isActioned && (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleTakeAction(prompt)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Take Action
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleDismiss(prompt.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      )}

                      {prompt.isActioned && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-xs font-medium">Action Taken</span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-2">
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Action Taken</DialogTitle>
            <DialogDescription>
              Describe the action you took in response to this prompt.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrompt && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{selectedPrompt.promptTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedPrompt.promptMessage}</p>
              </div>
              
              <Textarea
                placeholder="Describe the action you took..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAction}
              disabled={!actionNotes.trim()}
            >
              Record Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
