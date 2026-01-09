// Component for detecting and displaying manual changes

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  FileText,
  Code,
  Loader2
} from "lucide-react";
import { 
  useDetectChanges, 
  useManualChangeDetections,
  ChangeDetectionResult 
} from "@/hooks/useManualGeneration";
import { formatDistanceToNow } from "date-fns";

interface ManualChangeDetectorProps {
  manualId?: string;
  onSectionSelect?: (sectionId: string) => void;
  onRegenerateClick?: (affectedSectionIds: string[]) => void;
}

export function ManualChangeDetector({ 
  manualId, 
  onSectionSelect,
  onRegenerateClick 
}: ManualChangeDetectorProps) {
  const [detectionResults, setDetectionResults] = useState<ChangeDetectionResult[]>([]);
  
  const { data: pendingChanges = [], isLoading: loadingChanges } = useManualChangeDetections(manualId);
  const detectChanges = useDetectChanges();

  const handleDetectChanges = async () => {
    const results = await detectChanges.mutateAsync(manualId ? undefined : undefined);
    setDetectionResults(results);
  };

  const getSeverityColor = (severity: 'minor' | 'major' | 'critical') => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'major': return 'bg-orange-500 text-white';
      case 'minor': return 'bg-muted text-muted-foreground';
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'added':
      case 'feature_added': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'modified':
      case 'feature_modified': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'removed':
      case 'feature_removed': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Code className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const totalPendingChanges = pendingChanges.length;
  const affectedSectionIds = [...new Set(pendingChanges.flatMap(c => c.affected_section_ids))];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Change Detection
            </CardTitle>
            <CardDescription>
              Monitor database changes affecting documentation
            </CardDescription>
          </div>
          <Button 
            onClick={handleDetectChanges}
            disabled={detectChanges.isPending}
          >
            {detectChanges.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Scan for Changes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pending Changes Summary */}
        {totalPendingChanges > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Pending Changes Detected</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                {totalPendingChanges} unprocessed change(s) affecting {affectedSectionIds.length} section(s)
              </span>
              {onRegenerateClick && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onRegenerateClick(affectedSectionIds)}
                >
                  Regenerate Affected
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Changes List */}
        {pendingChanges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Pending Changes</h4>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {pendingChanges.map((change) => (
                <div 
                  key={change.id} 
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {getChangeTypeIcon(change.change_type)}
                    <div>
                      <p className="text-sm font-medium">{change.source_code}</p>
                      <p className="text-xs text-muted-foreground">
                        {change.change_summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(change.severity)}>
                      {change.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(change.detected_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Detection Results */}
        {detectionResults.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Latest Scan Results</h4>
              {detectionResults.map((result) => (
                <Card key={result.manualId} className="bg-muted/30">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{result.manualCode}</CardTitle>
                      <Badge className={getSeverityColor(result.severity)}>
                        {result.totalChanges} changes
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.changeReport.summary}
                    </p>
                    
                    {result.affectedSections.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Affected Sections:</p>
                        {result.affectedSections.map((section) => (
                          <Button
                            key={section.sectionId}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-left h-auto py-1"
                            onClick={() => onSectionSelect?.(section.sectionId)}
                          >
                            <FileText className="h-3 w-3 mr-2" />
                            <span className="text-xs">
                              {section.sectionNumber}: {section.title}
                            </span>
                            <ChevronRight className="h-3 w-3 ml-auto" />
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 p-2 bg-background rounded text-xs">
                      <strong>Recommended:</strong> {result.changeReport.recommendedAction}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loadingChanges && pendingChanges.length === 0 && detectionResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No pending changes detected</p>
            <p className="text-xs">Click "Scan for Changes" to check for updates</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
