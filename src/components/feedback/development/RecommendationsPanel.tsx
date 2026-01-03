import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  MessageCircle, 
  Target,
  CheckCircle2,
  Circle,
  ExternalLink
} from 'lucide-react';
import { useThemeRecommendations, useAcceptRecommendation } from '@/hooks/feedback/useDevelopmentThemes';
import { Skeleton } from '@/components/ui/skeleton';
import type { RecommendationType } from '@/types/developmentThemes';

interface RecommendationsPanelProps {
  themeId: string;
  themeName?: string;
  isEditable?: boolean;
}

const typeConfig: Record<RecommendationType, { icon: React.ElementType; label: string; color: string }> = {
  learning: { 
    icon: GraduationCap, 
    label: 'Learning', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
  },
  experience: { 
    icon: Briefcase, 
    label: 'Experience', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
  },
  mentoring: { 
    icon: Users, 
    label: 'Mentoring', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
  },
  coaching: { 
    icon: MessageCircle, 
    label: 'Coaching', 
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' 
  },
  stretch_assignment: { 
    icon: Target, 
    label: 'Stretch Assignment', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
  },
};

export function RecommendationsPanel({ 
  themeId, 
  themeName,
  isEditable = true 
}: RecommendationsPanelProps) {
  const { data: recommendations, isLoading } = useThemeRecommendations(themeId);
  const acceptRecommendation = useAcceptRecommendation();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const accepted = recommendations?.filter(r => r.is_accepted) || [];
  const pending = recommendations?.filter(r => !r.is_accepted) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Development Recommendations
        </CardTitle>
        {themeName && (
          <CardDescription>
            For: {themeName}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations?.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No recommendations generated yet.
          </div>
        )}

        {/* Pending recommendations */}
        {pending.map((rec) => {
          const config = typeConfig[rec.recommendation_type];
          const Icon = config.icon;

          return (
            <div
              key={rec.id}
              className="flex items-start gap-3 p-3 border rounded-lg bg-card"
            >
              <div className="shrink-0 mt-0.5">
                <Circle className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className={config.color}>
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Priority {rec.priority_order}
                  </Badge>
                </div>
                <p className="text-sm">{rec.recommendation_text}</p>
                
                {rec.linked_learning_path_id && (
                  <Button variant="link" size="sm" className="h-auto p-0 mt-1 text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Learning Path
                  </Button>
                )}
              </div>

              {isEditable && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => acceptRecommendation.mutate(rec.id)}
                  disabled={acceptRecommendation.isPending}
                >
                  Accept
                </Button>
              )}
            </div>
          );
        })}

        {/* Accepted recommendations */}
        {accepted.length > 0 && (
          <>
            {pending.length > 0 && (
              <div className="text-xs text-muted-foreground pt-2">
                Accepted ({accepted.length})
              </div>
            )}
            {accepted.map((rec) => {
              const config = typeConfig[rec.recommendation_type];
              const Icon = config.icon;

              return (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 opacity-75"
                >
                  <div className="shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={`${config.color} opacity-75`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm line-through">{rec.recommendation_text}</p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
