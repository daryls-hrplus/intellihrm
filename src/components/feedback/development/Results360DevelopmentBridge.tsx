import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRight, 
  Lightbulb, 
  TrendingDown, 
  AlertTriangle,
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface SignalSummary {
  id: string;
  signal_code: string;
  signal_name: string;
  category: string;
  score: number;
  benchmark_score?: number;
  gap?: number;
}

interface Results360DevelopmentBridgeProps {
  cycleId: string;
  employeeId: string;
  companyId: string;
  signals: SignalSummary[];
  onThemesGenerated?: () => void;
}

export function Results360DevelopmentBridge({
  cycleId,
  employeeId,
  companyId,
  signals,
  onThemesGenerated,
}: Results360DevelopmentBridgeProps) {
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // Sort signals by gap (development areas first)
  const sortedSignals = [...signals].sort((a, b) => {
    const gapA = a.gap ?? (a.benchmark_score ? a.benchmark_score - a.score : 0);
    const gapB = b.gap ?? (b.benchmark_score ? b.benchmark_score - b.score : 0);
    return gapB - gapA; // Higher gap = more development needed
  });

  const developmentAreas = sortedSignals.filter(s => {
    const gap = s.gap ?? (s.benchmark_score ? s.benchmark_score - s.score : 0);
    return gap > 0.5 || s.score < 3;
  });

  const handleToggleSignal = (signalId: string) => {
    setSelectedSignals(prev => 
      prev.includes(signalId) 
        ? prev.filter(id => id !== signalId)
        : [...prev, signalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSignals.length === developmentAreas.length) {
      setSelectedSignals([]);
    } else {
      setSelectedSignals(developmentAreas.map(s => s.id));
    }
  };

  const handleGenerateThemes = async () => {
    if (selectedSignals.length === 0) {
      toast.error('Please select at least one focus area');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('feedback-development-generator', {
        body: {
          cycleId,
          employeeId,
          companyId,
          selectedSignalIds: selectedSignals,
          signals: signals.filter(s => selectedSignals.includes(s.id)),
        },
      });

      if (error) throw error;

      toast.success(`Generated ${data?.themes?.length || 0} development themes`);
      queryClient.invalidateQueries({ queryKey: ['development-themes', employeeId] });
      onThemesGenerated?.();
    } catch (error: any) {
      console.error('Failed to generate themes:', error);
      toast.error('Failed to generate development themes', { description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Create Development Focus
        </CardTitle>
        <CardDescription>
          Select areas from your 360° feedback to focus on for development.
          AI will generate personalized themes and recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {developmentAreas.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No significant development areas identified.</p>
            <p className="text-xs mt-1">Your feedback scores are above benchmark in all areas.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Development Areas ({developmentAreas.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedSignals.length === developmentAreas.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="space-y-2">
              {developmentAreas.map((signal) => {
                const gap = signal.gap ?? (signal.benchmark_score ? signal.benchmark_score - signal.score : 0);
                const isSelected = selectedSignals.includes(signal.id);

                return (
                  <div
                    key={signal.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => handleToggleSignal(signal.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{signal.signal_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {signal.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Score: {signal.score.toFixed(1)}</span>
                        {signal.benchmark_score && (
                          <span>Benchmark: {signal.benchmark_score.toFixed(1)}</span>
                        )}
                        {gap > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            Gap: {gap.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t">
              <Button
                className="w-full"
                onClick={handleGenerateThemes}
                disabled={selectedSignals.length === 0 || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Themes...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Development Themes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {selectedSignals.length} area{selectedSignals.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
