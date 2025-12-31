import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Info, 
  Check, 
  X, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Brain
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { BiasPattern, BiasNudge, BiasType } from '@/hooks/performance/useEnhancedBiasDetector';

interface BiasNudgeAlertProps {
  nudge: BiasNudge;
  pattern?: BiasPattern;
  onAcknowledge?: () => void;
  onDispute?: (reason: string) => void;
  onLearnMore?: () => void;
  className?: string;
}

const biasTypeLabels: Record<BiasType, { label: string; description: string }> = {
  recency_bias: {
    label: 'Recency Bias',
    description: 'Tendency to overweight recent events when evaluating overall performance.',
  },
  leniency_bias: {
    label: 'Leniency Bias', 
    description: 'Tendency to rate employees higher than their actual performance warrants.',
  },
  severity_bias: {
    label: 'Severity Bias',
    description: 'Tendency to rate employees lower than their actual performance warrants.',
  },
  halo_effect: {
    label: 'Halo Effect',
    description: 'Letting one positive trait influence ratings across all dimensions.',
  },
  horn_effect: {
    label: 'Horn Effect',
    description: 'Letting one negative trait influence ratings across all dimensions.',
  },
  central_tendency: {
    label: 'Central Tendency',
    description: 'Avoiding extreme ratings by clustering scores in the middle range.',
  },
  contrast_effect: {
    label: 'Contrast Effect',
    description: 'Rating employees relative to others just reviewed rather than against standards.',
  },
};

const severityStyles = {
  low: 'border-yellow-200 bg-yellow-50',
  medium: 'border-orange-200 bg-orange-50',
  high: 'border-destructive/20 bg-destructive/5',
};

export function BiasNudgeAlert({
  nudge,
  pattern,
  onAcknowledge,
  onDispute,
  onLearnMore,
  className,
}: BiasNudgeAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const biasInfo = biasTypeLabels[nudge.biasType];

  const handleAcknowledge = () => {
    setIsAcknowledged(true);
    onAcknowledge?.();
  };

  const handleDispute = () => {
    if (disputeReason.trim()) {
      onDispute?.(disputeReason);
      setShowDisputeDialog(false);
      setDisputeReason('');
    }
  };

  if (isAcknowledged) {
    return (
      <Alert className={cn("opacity-60", className)}>
        <Check className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Bias Alert Acknowledged
          <Badge variant="outline" className="text-xs">Reviewed</Badge>
        </AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          Thank you for reviewing this coaching prompt.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Alert 
        className={cn(
          "transition-all duration-200",
          severityStyles[nudge.severity],
          className
        )}
      >
        <Brain className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <span>{nudge.title}</span>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              nudge.severity === 'high' && "border-destructive text-destructive"
            )}
          >
            {nudge.severity}
          </Badge>
        </AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-sm">{nudge.message}</p>

          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                <Info className="h-3 w-3 mr-1" />
                {isExpanded ? 'Hide' : 'Learn about'} {biasInfo.label}
                {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 rounded-lg bg-background/50 border space-y-2">
                <p className="text-sm font-medium">{biasInfo.label}</p>
                <p className="text-xs text-muted-foreground">{biasInfo.description}</p>
                
                {nudge.suggestedAction && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium mb-1">Suggested Action:</p>
                    <p className="text-xs text-muted-foreground">{nudge.suggestedAction}</p>
                  </div>
                )}

                {pattern && pattern.evidenceCount > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Based on analysis of {pattern.evidenceCount} rating{pattern.evidenceCount > 1 ? 's' : ''} • 
                      Confidence: {Math.round((pattern.detectionConfidence || 0.7) * 100)}%
                    </p>
                  </div>
                )}

                {nudge.learnMoreUrl && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs"
                    onClick={onLearnMore}
                  >
                    Learn more about reducing bias
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-center gap-2 pt-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAcknowledge}
              className="h-8"
            >
              <Check className="h-3 w-3 mr-1" />
              I've reviewed this
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDisputeDialog(true)}
              className="h-8 text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Dispute
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-1 border-t">
            This is a coaching prompt, not an accusation. Our goal is to help you deliver fair, 
            evidence-based feedback. Your review will continue regardless of this alert.
          </p>
        </AlertDescription>
      </Alert>

      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispute Bias Detection</DialogTitle>
            <DialogDescription>
              If you believe this bias detection is incorrect, please explain why. 
              Your feedback helps improve our detection algorithms.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">{biasInfo.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{nudge.message}</p>
            </div>
            
            <Textarea
              placeholder="Please explain why you believe this detection is incorrect..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDispute}
              disabled={!disputeReason.trim()}
            >
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
