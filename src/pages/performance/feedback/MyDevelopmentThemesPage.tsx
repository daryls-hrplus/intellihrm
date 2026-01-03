import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Lightbulb,
  Target,
  Calendar,
  ChevronLeft,
  TrendingUp,
  Clock
} from 'lucide-react';
import { DevelopmentThemesPanel } from '@/components/feedback/development/DevelopmentThemesPanel';
import { RecommendationsPanel } from '@/components/feedback/development/RecommendationsPanel';
import { IDPIntegrationPanel } from '@/components/feedback/development/IDPIntegrationPanel';
import { RemeasurementScheduler } from '@/components/feedback/development/RemeasurementScheduler';
import { useDevelopmentThemes } from '@/hooks/feedback/useDevelopmentThemes';

export default function MyDevelopmentThemesPage() {
  const { user, profile } = useAuth();
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const { data: themes } = useDevelopmentThemes(user?.id);

  const selectedTheme = themes?.find(t => t.id === selectedThemeId);
  const confirmedThemes = themes?.filter(t => t.is_confirmed) || [];
  const pendingThemes = themes?.filter(t => !t.is_confirmed) || [];

  if (!user || !profile) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Please log in to view your development themes.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            My Development Themes
          </h1>
          <p className="text-muted-foreground mt-1">
            Focus areas identified from your 360° feedback and approved by your manager
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{confirmedThemes.length}</div>
            <div className="text-xs text-muted-foreground">Active Themes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{pendingThemes.length}</div>
            <div className="text-xs text-muted-foreground">Pending Review</div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <Card className="bg-muted/50 border-muted">
        <CardContent className="py-3 px-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Development themes are generated based on your 360° feedback results 
            and reviewed by your manager or HR before appearing here. You can confirm themes to 
            receive personalized recommendations and link them to your development plan.
          </p>
        </CardContent>
      </Card>

      {/* Main content */}
      {selectedThemeId && selectedTheme ? (
        <div className="space-y-6">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedThemeId(null)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Themes
          </Button>

          {/* Theme detail header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    {selectedTheme.theme_name}
                  </CardTitle>
                  {selectedTheme.theme_description && (
                    <CardDescription className="mt-2">
                      {selectedTheme.theme_description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedTheme.confidence_score && (
                    <Badge variant="outline">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {Math.round(selectedTheme.confidence_score * 100)}% confidence
                    </Badge>
                  )}
                  {selectedTheme.is_confirmed && (
                    <Badge className="bg-green-100 text-green-800">
                      Confirmed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Theme tabs */}
          <Tabs defaultValue="recommendations" className="space-y-4">
            <TabsList>
              <TabsTrigger value="recommendations">
                <Target className="h-4 w-4 mr-1" />
                Recommendations
              </TabsTrigger>
              <TabsTrigger value="idp">
                <Lightbulb className="h-4 w-4 mr-1" />
                IDP Links
              </TabsTrigger>
              <TabsTrigger value="remeasure">
                <Calendar className="h-4 w-4 mr-1" />
                Re-measurement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations">
              <RecommendationsPanel
                themeId={selectedThemeId}
                themeName={selectedTheme.theme_name}
                isEditable={true}
              />
            </TabsContent>

            <TabsContent value="idp">
              <IDPIntegrationPanel
                themeId={selectedThemeId}
                themeName={selectedTheme.theme_name}
                employeeId={user.id}
                cycleId={selectedTheme.source_cycle_id || undefined}
                isEditable={true}
              />
            </TabsContent>

            <TabsContent value="remeasure">
              <RemeasurementScheduler
                employeeId={user.id}
                companyId={profile.company_id || ''}
                sourceCycleId={selectedTheme.source_cycle_id || undefined}
                focusAreas={{
                  themes: [selectedThemeId],
                  signals: selectedTheme.signal_ids || [],
                  competencies: [],
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Themes list */}
          <div className="lg:col-span-2">
            <DevelopmentThemesPanel
              employeeId={user.id}
              userId={user.id}
              isEditable={true}
              onThemeSelect={setSelectedThemeId}
            />
          </div>

          {/* Quick stats sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Progress Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {confirmedThemes.length === 0 && pendingThemes.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <Lightbulb className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p>No development themes yet.</p>
                    <p className="text-xs mt-1">
                      Complete a 360° feedback cycle to receive personalized themes.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Themes Confirmed</span>
                      <Badge variant="secondary">
                        {confirmedThemes.length} / {(themes?.length || 0)}
                      </Badge>
                    </div>

                    {pendingThemes.length > 0 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          {pendingThemes.length} theme{pendingThemes.length > 1 ? 's' : ''} awaiting your review
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Confirm themes to receive development recommendations.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Remeasurement quick view */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RemeasurementScheduler
                  employeeId={user.id}
                  companyId={profile.company_id || ''}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
