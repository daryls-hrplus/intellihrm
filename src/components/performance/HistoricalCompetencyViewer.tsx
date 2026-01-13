// Component to display competency definition as it was at the time of rating
// Uses snapshot data stored in appraisal_scores.metadata

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  History,
  GitBranch
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface CompetencySnapshot {
  name: string;
  code?: string;
  description?: string;
  category?: string;
  proficiency_indicators?: Record<string, string[]>;
  version: number;
  captured_at: string;
}

interface CurrentCompetency {
  name: string;
  code?: string;
  description?: string;
  category?: string;
  proficiency_indicators?: Record<string, string[]>;
  version: number;
  status?: string;
}

interface HistoricalCompetencyViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scoreId: string;
  competencyId: string;
  ratedAt?: string;
}

export function HistoricalCompetencyViewer({
  open,
  onOpenChange,
  scoreId,
  competencyId,
  ratedAt,
}: HistoricalCompetencyViewerProps) {
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<CompetencySnapshot | null>(null);
  const [currentCompetency, setCurrentCompetency] = useState<CurrentCompetency | null>(null);
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
    if (open && scoreId) {
      fetchData();
    }
  }, [open, scoreId, competencyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch the score with its metadata snapshot
      const { data: scoreData, error: scoreError } = await supabase
        .from("appraisal_scores")
        .select("metadata, competency_version, created_at")
        .eq("id", scoreId)
        .single();

      if (scoreError) {
        console.error("Error fetching score:", scoreError);
        return;
      }

      // Extract snapshot from metadata if available
      const metadata = scoreData?.metadata as Record<string, any> | null;
      if (metadata?.competency_snapshot) {
        setSnapshot(metadata.competency_snapshot as CompetencySnapshot);
      }

      // Fetch current competency state
      const { data: currentData, error: currentError } = await supabase
        .from("skills_competencies")
        .select("name, code, description, category, proficiency_indicators, version, status")
        .eq("id", competencyId)
        .single();

      if (!currentError && currentData) {
        setCurrentCompetency({
          name: currentData.name,
          code: currentData.code || undefined,
          description: currentData.description || undefined,
          category: currentData.category || undefined,
          proficiency_indicators: currentData.proficiency_indicators as Record<string, string[]> | undefined,
          version: currentData.version || 1,
          status: currentData.status || undefined,
        });

        // Check if competency has changed since rating
        const snapshotVersion = metadata?.competency_snapshot?.version || scoreData?.competency_version;
        if (snapshotVersion && currentData.version !== snapshotVersion) {
          setHasChanged(true);
        } else {
          setHasChanged(false);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const renderIndicators = (indicators: Record<string, string[]> | undefined, label: string) => {
    if (!indicators || Object.keys(indicators).length === 0) {
      return (
        <p className="text-sm text-muted-foreground italic">No behavioral indicators defined</p>
      );
    }

    return (
      <div className="space-y-3">
        {Object.entries(indicators)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([level, behaviors]) => (
            <div key={level} className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Level {level}
                </Badge>
              </div>
              <ul className="space-y-1 pl-4">
                {behaviors.map((behavior, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{behavior}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Competency Definition (As Rated)
          </DialogTitle>
          <DialogDescription>
            This shows the competency definition as it was when the rating was submitted.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Version Change Warning */}
              {hasChanged && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Competency has been updated since this rating
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Version at rating: {snapshot?.version || "Unknown"} → Current version: {currentCompetency?.version}
                    </p>
                  </div>
                </div>
              )}

              {/* Rating Context */}
              {ratedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Rated on: {format(parseISO(ratedAt), "MMMM d, yyyy 'at' h:mm a")}</span>
                </div>
              )}

              {/* Snapshot Data (What was rated) */}
              {snapshot ? (
                <Card className="border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Definition Used for Rating
                      <Badge variant="secondary" className="text-xs ml-auto">
                        v{snapshot.version}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{snapshot.name}</h4>
                      {snapshot.code && (
                        <p className="text-sm text-muted-foreground font-mono">{snapshot.code}</p>
                      )}
                    </div>

                    {snapshot.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">{snapshot.description}</p>
                      </div>
                    )}

                    {snapshot.category && (
                      <Badge variant="outline" className="capitalize">
                        {snapshot.category}
                      </Badge>
                    )}

                    <Separator />

                    <div>
                      <h5 className="text-sm font-medium mb-3">Behavioral Indicators (At Rating Time)</h5>
                      {renderIndicators(snapshot.proficiency_indicators, "Snapshot")}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-muted">
                  <CardContent className="py-6">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-medium">No snapshot available</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          This rating was created before version snapshots were enabled.
                          Showing current competency definition instead.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Definition (for comparison) */}
              {hasChanged && currentCompetency && (
                <>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Current Definition</span>
                  </div>

                  <Card className={cn("border-muted", hasChanged && "opacity-75")}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Current Version
                        <Badge variant="outline" className="text-xs ml-auto">
                          v{currentCompetency.version}
                        </Badge>
                        {currentCompetency.status === "deprecated" && (
                          <Badge variant="destructive" className="text-xs">
                            Deprecated
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold">{currentCompetency.name}</h4>
                        {currentCompetency.code && (
                          <p className="text-sm text-muted-foreground font-mono">{currentCompetency.code}</p>
                        )}
                      </div>

                      {currentCompetency.description && (
                        <p className="text-sm text-muted-foreground">{currentCompetency.description}</p>
                      )}

                      <Separator />

                      <div>
                        <h5 className="text-sm font-medium mb-3">Current Behavioral Indicators</h5>
                        {renderIndicators(currentCompetency.proficiency_indicators, "Current")}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
