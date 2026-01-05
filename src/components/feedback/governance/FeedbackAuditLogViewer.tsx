import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  History, 
  Brain, 
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Eye,
  Sparkles,
  BarChart,
  MessageSquare
} from "lucide-react";
import { useFeedbackGovernance, type FeedbackAIActionLog } from "@/hooks/useFeedbackGovernance";
import { format } from "date-fns";

interface FeedbackAuditLogViewerProps {
  cycleId?: string;
  companyId?: string;
  employeeId?: string;
  maxHeight?: string;
}

const ACTION_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  bias_detection: { icon: AlertCircle, label: 'Bias Detection', color: 'text-warning' },
  writing_suggestion: { icon: MessageSquare, label: 'Writing Suggestion', color: 'text-info' },
  signal_extraction: { icon: Sparkles, label: 'Signal Extraction', color: 'text-primary' },
  theme_clustering: { icon: BarChart, label: 'Theme Clustering', color: 'text-secondary' },
  sentiment_analysis: { icon: Eye, label: 'Sentiment Analysis', color: 'text-muted-foreground' },
  readiness_scoring: { icon: CheckCircle, label: 'Readiness Scoring', color: 'text-success' }
};

export function FeedbackAuditLogViewer({ 
  cycleId, 
  companyId,
  employeeId,
  maxHeight = "500px" 
}: FeedbackAuditLogViewerProps) {
  const { aiLogs, loading, fetchAILogs } = useFeedbackGovernance(companyId, cycleId);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAILogs(employeeId);
  }, [fetchAILogs, employeeId]);

  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const filteredLogs = aiLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || log.action_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getActionConfig = (actionType: string) => {
    return ACTION_TYPE_CONFIG[actionType] || { 
      icon: Brain, 
      label: actionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: 'text-muted-foreground'
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">AI Action Audit Log</CardTitle>
              <CardDescription>Complete record of AI decisions with explanations</CardDescription>
            </div>
          </div>
          <Badge variant="outline">{filteredLogs.length} entries</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(ACTION_TYPE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Log List */}
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading audit logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No AI action logs found
              </div>
            ) : (
              filteredLogs.map(log => {
                const config = getActionConfig(log.action_type);
                const Icon = config.icon;
                const isExpanded = expandedLogs.has(log.id);

                return (
                  <div 
                    key={log.id} 
                    className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => toggleExpanded(log.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full bg-background ${config.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{config.label}</span>
                            {log.confidence_score && (
                              <Badge variant="outline" className="text-xs">
                                {Math.round(log.confidence_score * 100)}% confidence
                              </Badge>
                            )}
                            {log.human_override && (
                              <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                                Overridden
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm:ss a")}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        {/* Explanation */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Explanation</p>
                          <p className="text-sm">{log.explanation}</p>
                        </div>

                        {/* Model Info */}
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="text-muted-foreground">Model</p>
                            <p className="font-medium">{log.model_used || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Version</p>
                            <p className="font-medium">{log.model_version || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Processing Time</p>
                            <p className="font-medium">{log.processing_time_ms ? `${log.processing_time_ms}ms` : 'N/A'}</p>
                          </div>
                        </div>

                        {/* Input/Output Summary */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Input Summary</p>
                            <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-24">
                              {JSON.stringify(log.input_summary, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Output Summary</p>
                            <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-24">
                              {JSON.stringify(log.output_summary, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {/* Override Info */}
                        {log.human_override && log.override_reason && (
                          <div className="bg-warning/10 p-2 rounded">
                            <p className="text-xs font-medium text-warning">Human Override Reason</p>
                            <p className="text-sm">{log.override_reason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
