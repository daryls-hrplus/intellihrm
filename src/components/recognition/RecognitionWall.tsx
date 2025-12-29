import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecognition, Recognition } from "@/hooks/useRecognition";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { 
  ThumbsUp, 
  Heart, 
  PartyPopper, 
  Award, 
  Star, 
  Trophy,
  Sparkles,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecognitionWallProps {
  companyId: string;
  showFilters?: boolean;
}

const awardTypeConfig: Record<string, { icon: any; label: string; gradient: string }> = {
  peer_recognition: { icon: ThumbsUp, label: "Peer Recognition", gradient: "from-blue-500/10 to-cyan-500/10" },
  manager_recognition: { icon: Star, label: "Manager Recognition", gradient: "from-amber-500/10 to-yellow-500/10" },
  spot_bonus: { icon: Trophy, label: "Spot Bonus", gradient: "from-purple-500/10 to-pink-500/10" },
  team_award: { icon: Users, label: "Team Award", gradient: "from-green-500/10 to-emerald-500/10" },
  milestone: { icon: Award, label: "Milestone", gradient: "from-indigo-500/10 to-violet-500/10" },
  value_champion: { icon: Heart, label: "Value Champion", gradient: "from-rose-500/10 to-red-500/10" },
  innovation: { icon: Sparkles, label: "Innovation", gradient: "from-orange-500/10 to-amber-500/10" },
  customer_hero: { icon: Trophy, label: "Customer Hero", gradient: "from-teal-500/10 to-cyan-500/10" },
};

const reactions = [
  { type: "like", icon: ThumbsUp, label: "Like" },
  { type: "celebrate", icon: PartyPopper, label: "Celebrate" },
  { type: "love", icon: Heart, label: "Love" },
];

export function RecognitionWall({ companyId, showFilters = true }: RecognitionWallProps) {
  const { user } = useAuth();
  const { recognitions, loadingRecognitions, addReaction } = useRecognition(companyId);
  const [filterType, setFilterType] = useState<string>("all");

  const filteredRecognitions = filterType === "all" 
    ? recognitions 
    : recognitions.filter(r => r.award_type === filterType);

  const getReactionCount = (recognition: Recognition, type: string) => {
    return recognition.reactions?.filter(r => r.reaction_type === type).length || 0;
  };

  const hasUserReacted = (recognition: Recognition, type: string) => {
    return recognition.reactions?.some(r => r.reaction_type === type && r.user_id === user?.id);
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loadingRecognitions) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (recognitions.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="text-center">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No recognitions yet</h3>
          <p className="text-muted-foreground mt-2">
            Be the first to recognize a colleague for their great work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          {Object.entries(awardTypeConfig).slice(0, 4).map(([key, config]) => (
            <Button
              key={key}
              variant={filterType === key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(key)}
            >
              <config.icon className="h-4 w-4 mr-1" />
              {config.label}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredRecognitions.map((recognition) => {
          const config = awardTypeConfig[recognition.award_type] || awardTypeConfig.peer_recognition;
          const Icon = config.icon;

          return (
            <Card key={recognition.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className={cn("pb-3 bg-gradient-to-r", config.gradient)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={recognition.recipient?.avatar_url} />
                      <AvatarFallback>{getInitials(recognition.recipient?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{recognition.recipient?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Recognized by {recognition.nominator?.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">{recognition.title}</h4>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {recognition.description}
                </p>
                
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <Badge variant="secondary" className="text-xs">
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                  {recognition.company_value && (
                    <Badge variant="outline" className="text-xs">
                      {recognition.company_value}
                    </Badge>
                  )}
                  {recognition.points_awarded > 0 && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                      +{recognition.points_awarded} pts
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-1">
                    {reactions.map(reaction => (
                      <Button
                        key={reaction.type}
                        variant={hasUserReacted(recognition, reaction.type) ? "default" : "ghost"}
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => addReaction.mutate({ 
                          recognitionId: recognition.id, 
                          reactionType: reaction.type 
                        })}
                      >
                        <reaction.icon className="h-4 w-4" />
                        {getReactionCount(recognition, reaction.type) > 0 && (
                          <span className="ml-1 text-xs">
                            {getReactionCount(recognition, reaction.type)}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(recognition.created_at), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
