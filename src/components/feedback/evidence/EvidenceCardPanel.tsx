import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useModuleEvidence, useLogEvidenceUsage, type ModuleEvidenceCard } from '@/hooks/feedback/useModuleEvidence';
import { EvidenceLineagePopover } from './EvidenceLineagePopover';
import { SignalConfidenceIndicator } from '../signals/SignalConfidenceIndicator';

interface EvidenceCardPanelProps {
  employeeId: string;
  moduleType: string;
  moduleEntityId?: string;
  onCiteEvidence?: (evidenceId: string) => void;
  showActions?: boolean;
}

export function EvidenceCardPanel({
  employeeId,
  moduleType,
  moduleEntityId,
  onCiteEvidence,
  showActions = true,
}: EvidenceCardPanelProps) {
  const { data: evidenceCards, isLoading } = useModuleEvidence(employeeId, moduleType);
  const logUsage = useLogEvidenceUsage();

  const handleView = (card: ModuleEvidenceCard) => {
    logUsage.mutate({
      evidence_card_id: card.id,
      used_in_module: moduleType,
      used_in_entity_id: moduleEntityId,
      action: 'viewed',
    });
  };

  const handleCite = (card: ModuleEvidenceCard) => {
    logUsage.mutate({
      evidence_card_id: card.id,
      used_in_module: moduleType,
      used_in_entity_id: moduleEntityId,
      action: 'cited',
    });
    onCiteEvidence?.(card.id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!evidenceCards || evidenceCards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Evidence & Signals
          </CardTitle>
          <CardDescription>No evidence available for this context</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Evidence & Signals
        </CardTitle>
        <CardDescription>
          {evidenceCards.length} evidence card{evidenceCards.length !== 1 ? 's' : ''} available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {evidenceCards.map((card) => (
          <div
            key={card.id}
            className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
            onClick={() => handleView(card)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {card.evidence_type}
                </Badge>
                {card.is_referenced && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Cited
                  </Badge>
                )}
              </div>
              {card.confidence_level !== null && (
                <SignalConfidenceIndicator confidence={card.confidence_level} size="sm" />
              )}
            </div>

            {card.display_summary && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {card.display_summary}
              </p>
            )}

            {card.source_snapshot && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  {card.source_snapshot.signal_definition?.name}
                </span>
                <span>•</span>
                <span>
                  Score: {card.source_snapshot.signal_value?.toFixed(0)}%
                </span>
                {card.source_snapshot.bias_risk_level !== 'low' && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-warning">
                      <AlertCircle className="h-3 w-3" />
                      Bias risk: {card.source_snapshot.bias_risk_level}
                    </span>
                  </>
                )}
              </div>
            )}

            {showActions && (
              <div className="flex items-center gap-2 pt-2">
                <EvidenceLineagePopover snapshotId={card.source_snapshot_id || undefined} />
                {onCiteEvidence && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCite(card);
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Cite
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
