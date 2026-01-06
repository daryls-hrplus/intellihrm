import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { GitBranch, Database, FileText, ChevronDown, ChevronRight, Eye, BarChart3 } from 'lucide-react';

interface SignalSnapshot {
  id: string;
  signal_value: number | null;
  confidence_score: number | null;
  bias_risk_level: string;
  evidence_count: number;
  evidence_summary: any;
  rater_breakdown: any;
  computed_at: string;
  signal_definition?: {
    name: string;
    signal_category: string;
  };
}

interface EvidenceLink {
  id: string;
  source_table: string;
  source_id: string;
  source_field: string | null;
  contribution_weight: number;
  contribution_value: number | null;
  metadata: any;
}

interface EvidenceLineageViewerProps {
  employeeId: string;
  signalId?: string;
}

export function EvidenceLineageViewer({ employeeId, signalId }: EvidenceLineageViewerProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(signalId || null);
  const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());

  const { data: snapshots, isLoading: loadingSnapshots } = useQuery({
    queryKey: ['signal-snapshots', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_signal_snapshots')
        .select(`
          *,
          signal_definition:signal_definition_id(name, signal_category)
        `)
        .eq('employee_id', employeeId)
        .eq('is_current', true)
        .order('computed_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as SignalSnapshot[];
    },
  });

  const { data: evidenceLinks, isLoading: loadingLinks } = useQuery({
    queryKey: ['evidence-links', selectedSnapshot],
    queryFn: async () => {
      if (!selectedSnapshot) return [];
      const { data, error } = await supabase
        .from('signal_evidence_links')
        .select('*')
        .eq('snapshot_id', selectedSnapshot)
        .order('contribution_weight', { ascending: false });
      if (error) throw error;
      return data as EvidenceLink[];
    },
    enabled: !!selectedSnapshot,
  });

  const toggleLink = (id: string) => {
    setExpandedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSourceIcon = (table: string) => {
    switch (table) {
      case 'feedback_360_responses':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'appraisal_responses':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'continuous_performance_signals':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      default:
        return <Database className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatSourceTable = (table: string) => {
    const labels: Record<string, string> = {
      feedback_360_responses: '360 Feedback',
      appraisal_responses: 'Appraisal',
      continuous_performance_signals: 'Continuous Feedback',
      project_feedback: 'Project Feedback',
    };
    return labels[table] || table.replace(/_/g, ' ');
  };

  const getBiasColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const currentSnapshot = snapshots?.find((s) => s.id === selectedSnapshot);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Evidence Lineage</h2>
      </div>

      <Tabs defaultValue="signals" className="w-full">
        <TabsList>
          <TabsTrigger value="signals">Signal Overview</TabsTrigger>
          <TabsTrigger value="lineage" disabled={!selectedSnapshot}>
            Lineage Detail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-3 mt-4">
          {loadingSnapshots ? (
            <div className="text-center py-8 text-muted-foreground">Loading signals...</div>
          ) : snapshots?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No signal data available for this employee
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {snapshots?.map((snapshot) => (
                <Card
                  key={snapshot.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSnapshot === snapshot.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedSnapshot(snapshot.id)}
                >
                  <CardHeader className="py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm">
                          {snapshot.signal_definition?.name || 'Unknown Signal'}
                        </CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {snapshot.signal_definition?.signal_category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {snapshot.signal_value?.toFixed(1) || '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {snapshot.confidence_score
                            ? `${(snapshot.confidence_score * 100).toFixed(0)}% confidence`
                            : 'No confidence'}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 pb-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant={getBiasColor(snapshot.bias_risk_level) as any}>
                          {snapshot.bias_risk_level} bias risk
                        </Badge>
                        <span className="text-muted-foreground">
                          {snapshot.evidence_count} evidence points
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lineage" className="space-y-4 mt-4">
          {currentSnapshot && (
            <>
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Rater Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {currentSnapshot.rater_breakdown &&
                  Object.keys(currentSnapshot.rater_breakdown).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(currentSnapshot.rater_breakdown as Record<string, { avg: number; count: number }>).map(([group, data]) => (
                        <div key={group}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{group.replace('_', ' ')}</span>
                            <span>
                              {data.avg.toFixed(1)} ({data.count} responses)
                            </span>
                          </div>
                          <Progress value={data.avg * 20} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No rater breakdown available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Evidence Sources ({evidenceLinks?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {loadingLinks ? (
                    <div className="text-center py-4 text-muted-foreground">Loading...</div>
                  ) : evidenceLinks?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No evidence links recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {evidenceLinks?.map((link) => (
                        <Collapsible key={link.id}>
                          <CollapsibleTrigger
                            className="flex items-center w-full p-2 hover:bg-muted/50 rounded"
                            onClick={() => toggleLink(link.id)}
                          >
                            {expandedLinks.has(link.id) ? (
                              <ChevronDown className="h-4 w-4 mr-2" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2" />
                            )}
                            {getSourceIcon(link.source_table)}
                            <span className="ml-2 text-sm font-medium">
                              {formatSourceTable(link.source_table)}
                            </span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {(link.contribution_weight * 100).toFixed(0)}% weight
                            </Badge>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-8 pr-2 pb-2">
                            <div className="text-xs space-y-1 bg-muted/30 p-2 rounded">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Source ID:</span>
                                <span className="font-mono">{link.source_id.slice(0, 12)}...</span>
                              </div>
                              {link.source_field && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Field:</span>
                                  <span>{link.source_field}</span>
                                </div>
                              )}
                              {link.contribution_value !== null && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Value:</span>
                                  <span>{link.contribution_value.toFixed(2)}</span>
                                </div>
                              )}
                              {link.metadata && Object.keys(link.metadata).length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <span className="text-muted-foreground">Metadata:</span>
                                  <pre className="text-xs mt-1 overflow-x-auto">
                                    {JSON.stringify(link.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
