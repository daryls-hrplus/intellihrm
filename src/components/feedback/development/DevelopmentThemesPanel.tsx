import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  Lightbulb, 
  Sparkles,
  ChevronRight,
  User
} from 'lucide-react';
import { useDevelopmentThemes, useConfirmTheme } from '@/hooks/feedback/useDevelopmentThemes';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface DevelopmentThemesPanelProps {
  employeeId: string;
  userId: string;
  isEditable?: boolean;
  onThemeSelect?: (themeId: string) => void;
}

export function DevelopmentThemesPanel({
  employeeId,
  userId,
  isEditable = true,
  onThemeSelect,
}: DevelopmentThemesPanelProps) {
  const { data: themes, isLoading } = useDevelopmentThemes(employeeId);
  const confirmTheme = useConfirmTheme();

  const handleConfirmTheme = (themeId: string) => {
    confirmTheme.mutate({ themeId, userId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const confirmedThemes = themes?.filter(t => t.is_confirmed) || [];
  const pendingThemes = themes?.filter(t => !t.is_confirmed) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Development Themes
        </CardTitle>
        <CardDescription>
          Focus areas identified from 360° feedback. Confirm themes to create development plans.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {themes?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No development themes identified yet.</p>
            <p className="text-xs mt-1">Themes are generated after completing 360° feedback cycles.</p>
          </div>
        )}

        {/* Pending themes (need confirmation) */}
        {pendingThemes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Circle className="h-4 w-4" />
              Pending Confirmation ({pendingThemes.length})
            </div>

            {pendingThemes.map((theme) => (
              <Card 
                key={theme.id} 
                className="border-dashed border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{theme.theme_name}</span>
                        {theme.ai_generated && (
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Suggested
                          </Badge>
                        )}
                        {theme.confidence_score && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(theme.confidence_score * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                      {theme.theme_description && (
                        <p className="text-sm text-muted-foreground">
                          {theme.theme_description}
                        </p>
                      )}
                    </div>

                    {isEditable && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmTheme(theme.id)}
                        disabled={confirmTheme.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Confirmed themes */}
        {confirmedThemes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Confirmed ({confirmedThemes.length})
            </div>

            {confirmedThemes.map((theme) => (
              <Card 
                key={theme.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onThemeSelect?.(theme.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{theme.theme_name}</span>
                      </div>
                      {theme.theme_description && (
                        <p className="text-sm text-muted-foreground">
                          {theme.theme_description}
                        </p>
                      )}
                      {theme.confirmed_at && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          Confirmed on {format(new Date(theme.confirmed_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>

                    {onThemeSelect && (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
