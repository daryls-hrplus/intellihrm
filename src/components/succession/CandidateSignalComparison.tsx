import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Users, 
  TrendingUp, 
  BarChart3,
  Loader2,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateData {
  id: string;
  employeeId: string;
  employeeName: string;
  avatarUrl?: string;
  jobTitle?: string;
  readinessLevel: string;
  overallScore: number;
  signals: Array<{
    name: string;
    score: number;
    category: string;
  }>;
}

interface CandidateSignalComparisonProps {
  candidateIds: string[];
  positionId?: string;
  onSelectCandidate?: (candidateId: string) => void;
}

export function CandidateSignalComparison({
  candidateIds,
  positionId,
  onSelectCandidate,
}: CandidateSignalComparisonProps) {
  const { t } = useLanguage();
  const [candidates, setCandidates] = useState<CandidateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'readiness' | 'name'>('score');

  useEffect(() => {
    if (candidateIds.length > 0) {
      loadCandidates();
    }
  }, [candidateIds]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const candidateData: CandidateData[] = [];

      for (const candidateId of candidateIds) {
        // Fetch candidate and employee data
        const { data: candidate } = await supabase
          .from('succession_candidates')
          .select(`
            id,
            employee_id,
            readiness_level,
            profiles:employee_id(
              id,
              first_name,
              last_name,
              avatar_url,
              job_title
            )
          `)
          .eq('id', candidateId)
          .single();

        if (!candidate || !candidate.profiles) continue;

        const profile = candidate.profiles as any;

        // Fetch signals
        const { data: signals } = await supabase
          .from('talent_signal_snapshots')
          .select(`
            signal_value,
            normalized_score,
            talent_signal_definitions(
              name,
              signal_category
            )
          `)
          .eq('employee_id', candidate.employee_id)
          .eq('is_current', true);

        const signalList = (signals || [])
          .filter(s => s.signal_value || s.normalized_score)
          .map(s => ({
            name: (s.talent_signal_definitions as any)?.name || 'Unknown',
            score: s.signal_value || s.normalized_score || 0,
            category: (s.talent_signal_definitions as any)?.signal_category || 'general',
          }))
          .sort((a, b) => b.score - a.score);

        const overallScore = signalList.length > 0
          ? signalList.reduce((sum, s) => sum + s.score, 0) / signalList.length
          : 0;

        candidateData.push({
          id: candidate.id,
          employeeId: candidate.employee_id,
          employeeName: `${profile.first_name} ${profile.last_name}`,
          avatarUrl: profile.avatar_url,
          jobTitle: profile.job_title,
          readinessLevel: candidate.readiness_level || 'Unknown',
          overallScore,
          signals: signalList,
        });
      }

      setCandidates(candidateData);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getReadinessColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'ready_now': return 'bg-success text-success-foreground';
      case 'ready_1_year': return 'bg-primary text-primary-foreground';
      case 'ready_2_years': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getReadinessLabel = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'ready_now': return 'Ready Now';
      case 'ready_1_year': return '1 Year';
      case 'ready_2_years': return '2 Years';
      case 'ready_3_plus_years': return '3+ Years';
      default: return level;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4) return 'text-success';
    if (score >= 3) return 'text-primary';
    if (score >= 2) return 'text-warning';
    return 'text-destructive';
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.overallScore - a.overallScore;
      case 'readiness':
        const readinessOrder = ['ready_now', 'ready_1_year', 'ready_2_years', 'ready_3_plus_years'];
        return readinessOrder.indexOf(a.readinessLevel.toLowerCase()) - 
               readinessOrder.indexOf(b.readinessLevel.toLowerCase());
      case 'name':
        return a.employeeName.localeCompare(b.employeeName);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
          No candidates to compare
        </CardContent>
      </Card>
    );
  }

  // Get all unique signal names for comparison
  const allSignalNames = [...new Set(candidates.flatMap(c => c.signals.map(s => s.name)))];
  const leadershipSignals = allSignalNames.filter(name => 
    candidates.some(c => c.signals.find(s => s.name === name && s.category === 'leadership'))
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Candidate Comparison
            </CardTitle>
            <CardDescription>
              Compare succession candidates based on their talent signals
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-1">
              {(['score', 'readiness', 'name'] as const).map(option => (
                <Button
                  key={option}
                  size="sm"
                  variant={sortBy === option ? 'default' : 'outline'}
                  onClick={() => setSortBy(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {sortedCandidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  onSelectCandidate && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => onSelectCandidate?.(candidate.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                    #{index + 1}
                  </div>

                  {/* Avatar & Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={candidate.avatarUrl} />
                      <AvatarFallback>{getInitials(candidate.employeeName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{candidate.employeeName}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {candidate.jobTitle || 'No title'}
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold", getScoreColor(candidate.overallScore))}>
                        {candidate.overallScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Overall</div>
                    </div>
                    <Badge className={getReadinessColor(candidate.readinessLevel)}>
                      {getReadinessLabel(candidate.readinessLevel)}
                    </Badge>
                    {onSelectCandidate && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Leadership Signals */}
                {candidate.signals.filter(s => s.category === 'leadership').length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Leadership Signals</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidate.signals
                        .filter(s => s.category === 'leadership')
                        .slice(0, 5)
                        .map(signal => (
                          <Badge 
                            key={signal.name} 
                            variant="outline"
                            className={cn("text-xs", getScoreColor(signal.score))}
                          >
                            {signal.name}: {signal.score.toFixed(1)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {/* Top Strengths */}
                {candidate.signals.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {candidate.signals.slice(0, 4).map(signal => (
                      <Badge key={signal.name} variant="secondary" className="text-xs">
                        {signal.name.split(' ')[0]}
                      </Badge>
                    ))}
                    {candidate.signals.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{candidate.signals.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
