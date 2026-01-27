import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Rocket, 
  LayoutDashboard, 
  Target, 
  FileText, 
  Settings,
  Calendar,
  Save,
  Loader2,
  Clock,
  CheckCircle2,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { useTabState } from "@/hooks/useTabState";
import { useReleaseLifecycle, ReleaseStatus } from "@/hooks/useReleaseLifecycle";
import { ReleaseStatusBanner } from "@/components/enablement/ReleaseStatusBanner";
import { AIReadinessCard } from "@/components/enablement/AIReadinessCard";
import { MilestoneTimeline } from "@/components/enablement/MilestoneTimeline";
import { AggregatedReleaseNotes } from "@/components/enablement/AggregatedReleaseNotes";
import { ReleaseManagerChat } from "@/components/enablement/ReleaseManagerChat";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ReleaseCommandCenterPage() {
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "overview",
    },
    syncToUrl: ["activeTab"],
  });

  const { 
    lifecycle, 
    isLoading, 
    updateLifecycle,
    getDaysToGA,
    getMilestoneProgress,
  } = useReleaseLifecycle();

  const [settingsForm, setSettingsForm] = useState<{
    release_status: ReleaseStatus;
    version_freeze_enabled: boolean;
    base_version: string;
    target_ga_date: string;
  }>({
    release_status: 'pre-release',
    version_freeze_enabled: true,
    base_version: '1.0.0',
    target_ga_date: '',
  });

  // Sync form with lifecycle data when it loads
  useEffect(() => {
    if (lifecycle) {
      setSettingsForm({
        release_status: lifecycle.release_status,
        version_freeze_enabled: lifecycle.version_freeze_enabled,
        base_version: lifecycle.base_version,
        target_ga_date: lifecycle.target_ga_date || '',
      });
    }
  }, [lifecycle]);

  const handleSaveSettings = async () => {
    try {
      await updateLifecycle.mutateAsync({
        release_status: settingsForm.release_status,
        version_freeze_enabled: settingsForm.version_freeze_enabled,
        base_version: settingsForm.base_version,
        target_ga_date: settingsForm.target_ga_date || null,
      });
      toast.success('Settings saved');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const daysToGA = getDaysToGA();
  const milestoneProgress = getMilestoneProgress();

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Release Command Center" },
          ]}
        />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Release Command Center</h1>
            <p className="text-muted-foreground">
              Unified version lifecycle, milestones, and release notes management
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <ReleaseStatusBanner />

        {/* Tabs */}
        <Tabs 
          value={tabState.activeTab} 
          onValueChange={(value) => setTabState({ activeTab: value })}
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Milestones
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Release Notes
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Version
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">v{lifecycle?.base_version || '1.0.0'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lifecycle?.version_freeze_enabled ? 'Version freeze active' : 'Version open'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Days to GA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {daysToGA !== null ? daysToGA : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lifecycle?.target_ga_date 
                      ? formatDateForDisplay(lifecycle.target_ga_date, 'MMM d, yyyy')
                      : 'No target set'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Milestone Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {milestoneProgress.completed}/{milestoneProgress.total}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {milestoneProgress.percentage}% complete
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Readiness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    (lifecycle?.last_readiness_score ?? 0) >= 80 ? 'text-green-600' :
                    (lifecycle?.last_readiness_score ?? 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {lifecycle?.last_readiness_score != null 
                      ? `${lifecycle?.last_readiness_score}%` 
                      : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lifecycle?.last_assessment_at 
                      ? `Last: ${formatDateForDisplay(lifecycle.last_assessment_at, 'MMM d')}`
                      : 'Not assessed'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI Readiness Assessment */}
            <AIReadinessCard />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-4"
                    onClick={() => setTabState({ activeTab: 'milestones' })}
                  >
                    <Target className="h-5 w-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">Manage Milestones</div>
                      <div className="text-xs text-muted-foreground">
                        Track release progress
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-4"
                    onClick={() => setTabState({ activeTab: 'notes' })}
                  >
                    <FileText className="h-5 w-5 mr-3 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium">View Release Notes</div>
                      <div className="text-xs text-muted-foreground">
                        Aggregated changelogs
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="justify-start h-auto py-4"
                    onClick={() => setTabState({ activeTab: 'ai' })}
                  >
                    <Rocket className="h-5 w-5 mr-3 text-amber-500" />
                    <div className="text-left">
                      <div className="font-medium">Ask AI Assistant</div>
                      <div className="text-xs text-muted-foreground">
                        Get intelligent insights
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="mt-6">
            <MilestoneTimeline />
          </TabsContent>

          {/* Release Notes Tab */}
          <TabsContent value="notes" className="mt-6">
            <AggregatedReleaseNotes />
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai" className="mt-6">
            <ReleaseManagerChat />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Version Lifecycle Settings
                </CardTitle>
                <CardDescription>
                  Configure release status, version freeze, and target dates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Release Status */}
                <div className="space-y-2">
                  <Label htmlFor="release-status">Release Status</Label>
                  <Select 
                    value={settingsForm.release_status}
                    onValueChange={(value: ReleaseStatus) => setSettingsForm(prev => ({ ...prev, release_status: value }))}
                  >
                    <SelectTrigger id="release-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre-release">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          Pre-Release
                        </span>
                      </SelectItem>
                      <SelectItem value="preview">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          Preview
                        </span>
                      </SelectItem>
                      <SelectItem value="ga-released">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          GA Released
                        </span>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <span className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-slate-500" />
                          Maintenance
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Current phase of the release lifecycle
                  </p>
                </div>

                {/* Version Freeze */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="version-freeze">Version Freeze Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      When enabled, all updates stay at the current major version (1.0.x)
                    </p>
                  </div>
                  <Switch
                    id="version-freeze"
                    checked={settingsForm.version_freeze_enabled}
                    onCheckedChange={(checked) => setSettingsForm(prev => ({ 
                      ...prev, 
                      version_freeze_enabled: checked 
                    }))}
                  />
                </div>

                {/* Base Version */}
                <div className="space-y-2">
                  <Label htmlFor="base-version">Base Version</Label>
                  <Input
                    id="base-version"
                    placeholder="1.0.0"
                    value={settingsForm.base_version}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, base_version: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    The current version baseline for all documentation
                  </p>
                </div>

                {/* Target GA Date */}
                <div className="space-y-2">
                  <Label htmlFor="target-ga">Target GA Date</Label>
                  <Input
                    id="target-ga"
                    type="date"
                    value={settingsForm.target_ga_date}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, target_ga_date: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Planned general availability release date
                  </p>
                </div>

                {/* Save Button */}
                <Button 
                  onClick={handleSaveSettings}
                  disabled={updateLifecycle.isPending}
                >
                  {updateLifecycle.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
