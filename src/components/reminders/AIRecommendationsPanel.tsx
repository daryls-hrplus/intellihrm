import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Lightbulb,
  TrendingUp,
  Shield,
  Clock,
  Database,
  PlusCircle,
  Search
} from 'lucide-react';

interface Recommendation {
  eventTypeId: string;
  eventTypeName: string;
  eventTypeCode: string;
  type: 'missing_rule' | 'insufficient_coverage' | 'high_volume';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedIntervals: number[];
  affectedEmployees: number;
  suggestedRecipients: {
    employee: boolean;
    manager: boolean;
    hr: boolean;
  };
  suggestedPriority: 'low' | 'medium' | 'high' | 'critical';
  suggestedTemplate: string;
}

interface DiscoveredEventType {
  tableName: string;
  dateField: string;
  potentialEventName: string;
  suggestedCode: string;
  suggestedCategory: string;
  recordCount: number;
  urgentRecords: number;
  hasEmployeeLink: boolean;
}

interface AnalysisSummary {
  totalEventTypes: number;
  coveredEventTypes: number;
  uncoveredEventTypes: number;
  totalUpcomingExpirations: number;
  criticalRecommendations: number;
  discoveredDataSources: number;
  urgentDiscoveries: number;
  aiSummary: string;
}

interface AIRecommendationsPanelProps {
  companyId: string;
  onApplyRecommendation: (recommendation: Recommendation) => void;
}

export function AIRecommendationsPanel({ companyId, onApplyRecommendation }: AIRecommendationsPanelProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [discoveredEventTypes, setDiscoveredEventTypes] = useState<DiscoveredEventType[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [creatingEventType, setCreatingEventType] = useState<string | null>(null);

  const analyzeReminders = async () => {
    if (!companyId || companyId === 'all') {
      toast.error('Please select a company first');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-reminder-analysis', {
        body: { companyId }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      setDiscoveredEventTypes(data.discoveredEventTypes || []);
      setSummary(data.summary || null);
      setHasAnalyzed(true);
      setIsOpen(true);

      if (data.recommendations?.length === 0 && data.discoveredEventTypes?.length === 0) {
        toast.success('All event types are covered by reminder rules!');
      }
    } catch (error) {
      console.error('Error analyzing reminders:', error);
      toast.error('Failed to analyze reminder configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (recommendation: Recommendation, index: number) => {
    setApplyingIndex(index);
    try {
      await onApplyRecommendation(recommendation);
      setRecommendations(prev => prev.filter((_, i) => i !== index));
      toast.success(`Rule created for "${recommendation.eventTypeName}"`);
    } catch (error) {
      console.error('Error applying recommendation:', error);
      toast.error('Failed to apply recommendation');
    } finally {
      setApplyingIndex(null);
    }
  };

  const handleCreateEventType = async (discovered: DiscoveredEventType) => {
    setCreatingEventType(discovered.suggestedCode);
    try {
      // Create the event type
      const { data, error } = await supabase
        .from('reminder_event_types')
        .insert({
          code: discovered.suggestedCode,
          name: discovered.potentialEventName,
          description: `Auto-discovered: Reminder for ${discovered.potentialEventName.toLowerCase()}`,
          category: discovered.suggestedCategory,
          source_table: discovered.tableName,
          date_field: discovered.dateField,
          is_active: true,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Event type "${discovered.potentialEventName}" created successfully!`);
      
      // Remove from discovered list and re-analyze
      setDiscoveredEventTypes(prev => prev.filter(d => d.suggestedCode !== discovered.suggestedCode));
      
      // Optionally refresh the analysis
      await analyzeReminders();
    } catch (error) {
      console.error('Error creating event type:', error);
      toast.error('Failed to create event type');
    } finally {
      setCreatingEventType(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'compliance': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      case 'document': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'training': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
      case 'benefits': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'performance': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
      case 'hr': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'wellness': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const coveragePercentage = summary 
    ? Math.round((summary.coveredEventTypes / summary.totalEventTypes) * 100) 
    : 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  AI Recommendations
                  {summary && summary.criticalRecommendations > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {summary.criticalRecommendations} Critical
                    </Badge>
                  )}
                  {summary && summary.urgentDiscoveries > 0 && (
                    <Badge variant="outline" className="ml-1 border-orange-500 text-orange-600">
                      {summary.urgentDiscoveries} New Discoveries
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {hasAnalyzed 
                    ? `${recommendations.length} suggestions, ${discoveredEventTypes.length} discovered data sources`
                    : 'Analyze your reminder configuration for gaps and discover new data sources'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!hasAnalyzed ? (
                <Button 
                  onClick={analyzeReminders} 
                  disabled={loading || !companyId || companyId === 'all'}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Analyze & Discover
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={analyzeReminders}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Coverage Summary */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Coverage</p>
                  <div className="flex items-center gap-2">
                    <Progress value={coveragePercentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{coveragePercentage}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summary.coveredEventTypes} of {summary.totalEventTypes} event types
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{summary.uncoveredEventTypes}</p>
                  <p className="text-sm text-muted-foreground">Uncovered Types</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{summary.totalUpcomingExpirations}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Events (90d)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{summary.criticalRecommendations}</p>
                  <p className="text-sm text-muted-foreground">Critical Gaps</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">{summary.discoveredDataSources}</p>
                  <p className="text-sm text-muted-foreground">Discovered Sources</p>
                </div>
              </div>
            )}

            {/* AI Summary */}
            {summary?.aiSummary && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">AI Analysis</p>
                    <p className="text-sm text-muted-foreground">{summary.aiSummary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Discovered Event Types Section */}
            {discoveredEventTypes.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Discovered Data Sources (Not Yet Configured)
                </h4>
                <p className="text-xs text-muted-foreground">
                  These tables contain date fields that could trigger reminders but are not yet configured as event types.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {discoveredEventTypes.map((discovered) => (
                    <div 
                      key={discovered.suggestedCode}
                      className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{discovered.potentialEventName}</span>
                            <Badge className={getCategoryColor(discovered.suggestedCategory)}>
                              {discovered.suggestedCategory}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              <span className="font-mono bg-muted px-1 rounded">{discovered.tableName}</span>
                              {' → '}
                              <span className="font-mono bg-muted px-1 rounded">{discovered.dateField}</span>
                            </p>
                            <div className="flex gap-2">
                              {discovered.recordCount > 0 && (
                                <span className="px-2 py-0.5 bg-muted rounded">
                                  {discovered.recordCount} records in 90 days
                                </span>
                              )}
                              {discovered.urgentRecords > 0 && (
                                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded">
                                  {discovered.urgentRecords} urgent (30 days)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateEventType(discovered)}
                          disabled={creatingEventType === discovered.suggestedCode}
                          className="shrink-0"
                        >
                          {creatingEventType === discovered.suggestedCode ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Create
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations List */}
            {recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Recommendations
                </h4>
                {recommendations.map((rec, index) => (
                  <div 
                    key={`${rec.eventTypeId}-${index}`}
                    className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(rec.priority)}>
                            {getPriorityIcon(rec.priority)}
                            <span className="ml-1 capitalize">{rec.priority}</span>
                          </Badge>
                          <span className="font-medium">{rec.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 bg-muted rounded">
                            Intervals: {rec.suggestedIntervals.join(', ')} days
                          </span>
                          <span className="px-2 py-1 bg-muted rounded">
                            Recipients: {[
                              rec.suggestedRecipients.employee && 'Employee',
                              rec.suggestedRecipients.manager && 'Manager',
                              rec.suggestedRecipients.hr && 'HR'
                            ].filter(Boolean).join(', ')}
                          </span>
                          {rec.affectedEmployees > 0 && (
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded">
                              {rec.affectedEmployees} employees affected
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleApply(rec, index)}
                        disabled={applyingIndex === index}
                        className="shrink-0"
                      >
                        {applyingIndex === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Apply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Set State */}
            {hasAnalyzed && recommendations.length === 0 && discoveredEventTypes.length === 0 && (
              <div className="py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium">All Set!</p>
                <p className="text-sm text-muted-foreground">
                  All event types have active reminder rules configured and no new data sources were discovered.
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
