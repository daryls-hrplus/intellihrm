// Report showing version usage across appraisals and rating trends
// Helps understand impact of competency version changes

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
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Calendar,
  Users,
  GitBranch,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface VersionStats {
  version: number;
  scoreCount: number;
  avgRating: number;
  minRating: number;
  maxRating: number;
  cycleNames: string[];
  firstUsedAt: string;
  lastUsedAt: string;
}

interface VersionImpactReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competencyId: string;
  competencyName: string;
  currentVersion: number;
}

export function VersionImpactReport({
  open,
  onOpenChange,
  competencyId,
  competencyName,
  currentVersion,
}: VersionImpactReportProps) {
  const [loading, setLoading] = useState(false);
  const [versionStats, setVersionStats] = useState<VersionStats[]>([]);
  const [totalScores, setTotalScores] = useState(0);
  const [uniqueCycles, setUniqueCycles] = useState(0);

  useEffect(() => {
    if (open && competencyId) {
      fetchVersionData();
    }
  }, [open, competencyId]);

  const fetchVersionData = async () => {
    setLoading(true);
    try {
      // Fetch all scores for this competency
      const { data: scoresData, error } = await supabase
        .from("appraisal_scores")
        .select(`
          id,
          rating,
          competency_version,
          metadata,
          created_at,
          appraisal_participants!inner(
            cycle_id,
            appraisal_cycles!inner(
              id,
              name
            )
          )
        `)
        .eq("evaluation_type", "competency")
        .or(`item_id.eq.${competencyId},item_id.ilike.%-${competencyId}`);

      if (error) {
        console.error("Error fetching version data:", error);
        return;
      }

      // Group by version
      const versionMap = new Map<number, {
        scores: number[];
        cycles: Set<string>;
        dates: Date[];
      }>();

      const allCycles = new Set<string>();

      for (const score of scoresData || []) {
        // Try to get version from metadata snapshot first, then competency_version column
        const metadata = score.metadata as Record<string, any> | null;
        const version = metadata?.competency_snapshot?.version || score.competency_version || 1;
        
        if (!versionMap.has(version)) {
          versionMap.set(version, {
            scores: [],
            cycles: new Set(),
            dates: [],
          });
        }

        const entry = versionMap.get(version)!;
        if (score.rating !== null) {
          entry.scores.push(score.rating);
        }
        
        const cycleName = (score as any).appraisal_participants?.appraisal_cycles?.name;
        if (cycleName) {
          entry.cycles.add(cycleName);
          allCycles.add(cycleName);
        }
        
        if (score.created_at) {
          entry.dates.push(new Date(score.created_at));
        }
      }

      // Calculate stats per version
      const stats: VersionStats[] = [];
      for (const [version, data] of versionMap) {
        if (data.scores.length === 0) continue;

        const sortedScores = [...data.scores].sort((a, b) => a - b);
        const avgRating = data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length;
        const sortedDates = data.dates.sort((a, b) => a.getTime() - b.getTime());

        stats.push({
          version,
          scoreCount: data.scores.length,
          avgRating: Math.round(avgRating * 100) / 100,
          minRating: sortedScores[0],
          maxRating: sortedScores[sortedScores.length - 1],
          cycleNames: Array.from(data.cycles),
          firstUsedAt: sortedDates.length > 0 ? sortedDates[0].toISOString() : "",
          lastUsedAt: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1].toISOString() : "",
        });
      }

      // Sort by version descending (newest first)
      stats.sort((a, b) => b.version - a.version);

      setVersionStats(stats);
      setTotalScores(scoresData?.length || 0);
      setUniqueCycles(allCycles.size);
    } finally {
      setLoading(false);
    }
  };

  const getRatingTrend = (currentStats: VersionStats, prevStats?: VersionStats) => {
    if (!prevStats) return null;
    const diff = currentStats.avgRating - prevStats.avgRating;
    if (Math.abs(diff) < 0.1) return "stable";
    return diff > 0 ? "up" : "down";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Version Impact Report
          </DialogTitle>
          <DialogDescription>
            Historical usage and rating trends for "{competencyName}" across all versions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{totalScores}</p>
                        <p className="text-xs text-muted-foreground">Total Ratings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{uniqueCycles}</p>
                        <p className="text-xs text-muted-foreground">Appraisal Cycles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{versionStats.length}</p>
                        <p className="text-xs text-muted-foreground">Versions Used</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Version Details */}
              {versionStats.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No rating data available</p>
                    <p className="text-sm mt-1">This competency hasn't been used in any appraisals yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {versionStats.map((stats, index) => {
                    const prevStats = versionStats[index + 1];
                    const trend = getRatingTrend(stats, prevStats);
                    const isCurrentVersion = stats.version === currentVersion;

                    return (
                      <Card 
                        key={stats.version}
                        className={cn(
                          isCurrentVersion && "border-primary/40 bg-primary/5"
                        )}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Badge 
                              variant={isCurrentVersion ? "default" : "secondary"}
                              className="text-xs"
                            >
                              Version {stats.version}
                            </Badge>
                            {isCurrentVersion && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Current
                              </Badge>
                            )}
                            <span className="text-muted-foreground font-normal ml-auto text-xs">
                              {stats.scoreCount} rating{stats.scoreCount !== 1 ? "s" : ""}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Rating Stats */}
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Avg Rating:</span>
                              <span className="text-lg font-semibold">{stats.avgRating}</span>
                              {trend && (
                                <div className={cn(
                                  "flex items-center gap-0.5 text-xs",
                                  trend === "up" && "text-success",
                                  trend === "down" && "text-destructive",
                                  trend === "stable" && "text-muted-foreground"
                                )}>
                                  {trend === "up" && <TrendingUp className="h-3 w-3" />}
                                  {trend === "down" && <TrendingDown className="h-3 w-3" />}
                                  {trend === "stable" && <Minus className="h-3 w-3" />}
                                  <span>
                                    {trend === "up" && "vs prev"}
                                    {trend === "down" && "vs prev"}
                                    {trend === "stable" && "stable"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Range: {stats.minRating} - {stats.maxRating}
                            </div>
                          </div>

                          {/* Cycles Used */}
                          <div>
                            <span className="text-xs text-muted-foreground">Used in cycles:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {stats.cycleNames.slice(0, 3).map((name) => (
                                <Badge key={name} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))}
                              {stats.cycleNames.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{stats.cycleNames.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Date Range */}
                          {stats.firstUsedAt && (
                            <div className="text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {format(parseISO(stats.firstUsedAt), "MMM d, yyyy")}
                              {stats.lastUsedAt !== stats.firstUsedAt && (
                                <> – {format(parseISO(stats.lastUsedAt), "MMM d, yyyy")}</>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Insights */}
              {versionStats.length > 1 && (
                <>
                  <Separator />
                  <Card className="border-info/20 bg-info/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-info" />
                        Version Change Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {(() => {
                          const latestTwo = versionStats.slice(0, 2);
                          if (latestTwo.length === 2) {
                            const diff = latestTwo[0].avgRating - latestTwo[1].avgRating;
                            if (Math.abs(diff) >= 0.3) {
                              return (
                                <li className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500" />
                                  <span>
                                    Significant rating change detected between version {latestTwo[1].version} 
                                    and {latestTwo[0].version} ({diff > 0 ? "+" : ""}{diff.toFixed(2)} average).
                                    Consider reviewing the version changes for impact.
                                  </span>
                                </li>
                              );
                            }
                          }
                          return (
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 text-success" />
                              <span>Rating patterns remain consistent across versions.</span>
                            </li>
                          );
                        })()}
                      </ul>
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
