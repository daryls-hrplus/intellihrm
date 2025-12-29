import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecognition } from "@/hooks/useRecognition";
import { Trophy, Medal, Award, Crown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecognitionLeaderboardProps {
  companyId: string;
  limit?: number;
  compact?: boolean;
}

const rankConfig: Record<number, { icon: any; color: string; bgColor: string }> = {
  1: { icon: Crown, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  2: { icon: Medal, color: "text-slate-400", bgColor: "bg-slate-400/10" },
  3: { icon: Award, color: "text-amber-700", bgColor: "bg-amber-700/10" },
};

export function RecognitionLeaderboard({ companyId, limit = 10, compact = false }: RecognitionLeaderboardProps) {
  const { leaderboard, loadingLeaderboard } = useRecognition(companyId);

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const displayedLeaderboard = leaderboard.slice(0, limit);

  if (loadingLeaderboard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Recognition Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayedLeaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Recognition Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No leaderboard data yet</p>
            <p className="text-sm mt-1">Start recognizing colleagues to see the leaderboard!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Recognition Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedLeaderboard.map((entry) => {
            const config = rankConfig[entry.rank];
            const RankIcon = config?.icon || null;

            return (
              <div
                key={entry.employee_id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  entry.rank <= 3 && config?.bgColor,
                  !compact && "hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm",
                  entry.rank <= 3 ? config?.color : "text-muted-foreground bg-muted"
                )}>
                  {RankIcon ? <RankIcon className="h-5 w-5" /> : entry.rank}
                </div>
                
                <Avatar className="h-9 w-9">
                  <AvatarImage src={entry.avatar_url} />
                  <AvatarFallback>{getInitials(entry.full_name)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    entry.rank === 1 && "text-amber-600"
                  )}>
                    {entry.full_name}
                  </p>
                  {!compact && (
                    <p className="text-xs text-muted-foreground">
                      {entry.recognition_count} recognition{entry.recognition_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <Badge 
                  variant="secondary" 
                  className={cn(
                    "font-semibold",
                    entry.rank === 1 && "bg-amber-500/10 text-amber-600"
                  )}
                >
                  {entry.points_total} pts
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
