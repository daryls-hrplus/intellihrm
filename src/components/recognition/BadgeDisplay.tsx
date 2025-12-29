import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Award, 
  Star, 
  Trophy, 
  Heart, 
  Sparkles, 
  Crown, 
  Users,
  Lightbulb,
  Shield
} from "lucide-react";
import { useRecognition, EmployeeBadge } from "@/hooks/useRecognition";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface BadgeDisplayProps {
  userId?: string;
  showTitle?: boolean;
  maxBadges?: number;
  size?: "sm" | "md" | "lg";
}

const iconMap: Record<string, any> = {
  award: Award,
  star: Star,
  trophy: Trophy,
  heart: Heart,
  sparkles: Sparkles,
  crown: Crown,
  users: Users,
  lightbulb: Lightbulb,
  shield: Shield,
};

const colorMap: Record<string, string> = {
  yellow: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  gold: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  blue: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  green: "bg-green-500/10 text-green-600 border-green-500/30",
  purple: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  pink: "bg-pink-500/10 text-pink-600 border-pink-500/30",
  cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  amber: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  primary: "bg-primary/10 text-primary border-primary/30",
};

const sizeConfig = {
  sm: { icon: "h-4 w-4", container: "h-8 w-8", text: "text-xs" },
  md: { icon: "h-5 w-5", container: "h-10 w-10", text: "text-sm" },
  lg: { icon: "h-6 w-6", container: "h-12 w-12", text: "text-base" },
};

export function BadgeDisplay({ 
  userId, 
  showTitle = true, 
  maxBadges = 8,
  size = "md" 
}: BadgeDisplayProps) {
  const { myBadges, loadingBadges } = useRecognition();
  const config = sizeConfig[size];

  if (loadingBadges) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className={cn("rounded-full", config.container)} />
        ))}
      </div>
    );
  }

  const displayedBadges = myBadges.slice(0, maxBadges);

  if (displayedBadges.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className={config.text}>No badges earned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showTitle && (
        <h4 className="font-medium flex items-center gap-2">
          <Award className="h-4 w-4" />
          Badges ({myBadges.length})
        </h4>
      )}
      <div className="flex flex-wrap gap-2">
        {displayedBadges.map((badge) => {
          const Icon = iconMap[badge.badge?.icon_name || "award"] || Award;
          const colorClass = colorMap[badge.badge?.color || "primary"];

          return (
            <div
              key={badge.id}
              className="group relative"
              title={`${badge.badge?.badge_name}: ${badge.badge?.description}`}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full border-2 transition-transform group-hover:scale-110",
                  config.container,
                  colorClass
                )}
              >
                <Icon className={config.icon} />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-popover text-popover-foreground rounded-lg shadow-lg p-2 text-xs whitespace-nowrap border">
                  <p className="font-semibold">{badge.badge?.badge_name}</p>
                  <p className="text-muted-foreground">{badge.badge?.description}</p>
                </div>
              </div>
            </div>
          );
        })}
        {myBadges.length > maxBadges && (
          <div className={cn(
            "flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
            config.container,
            config.text
          )}>
            +{myBadges.length - maxBadges}
          </div>
        )}
      </div>
    </div>
  );
}

export function BadgeGrid() {
  const { myBadges, loadingBadges } = useRecognition();

  if (loadingBadges) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (myBadges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold">No badges yet</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Start receiving recognitions to earn badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {myBadges.map((badge) => {
        const Icon = iconMap[badge.badge?.icon_name || "award"] || Award;
        const colorClass = colorMap[badge.badge?.color || "primary"];

        return (
          <Card key={badge.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div
                className={cn(
                  "h-14 w-14 mx-auto flex items-center justify-center rounded-full border-2",
                  colorClass
                )}
              >
                <Icon className="h-7 w-7" />
              </div>
              <h4 className="font-semibold mt-3 text-sm">
                {badge.badge?.badge_name}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {badge.badge?.description}
              </p>
              <BadgeComponent variant="outline" className="mt-2 text-xs">
                {formatDistanceToNow(new Date(badge.awarded_at), { addSuffix: true })}
              </BadgeComponent>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
