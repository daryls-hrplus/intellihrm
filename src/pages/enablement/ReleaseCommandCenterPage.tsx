import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Rocket, 
  LayoutDashboard, 
  Target, 
  FileText, 
  Settings,
  Save,
  Loader2,
  Clock,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  BarChart3,
  Kanban,
  Upload,
  AlertCircle,
} from "lucide-react";
import { useTabState } from "@/hooks/useTabState";
import { useReleaseLifecycle, ReleaseStatus } from "@/hooks/useReleaseLifecycle";
import { useManualPublishing, MANUAL_CONFIGS } from "@/hooks/useManualPublishing";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { ReleaseStatusBanner } from "@/components/enablement/ReleaseStatusBanner";
import { AIReadinessCard } from "@/components/enablement/AIReadinessCard";
import { MilestoneTimeline } from "@/components/enablement/MilestoneTimeline";
import { AggregatedReleaseNotes } from "@/components/enablement/AggregatedReleaseNotes";
import { ReleaseManagerChat } from "@/components/enablement/ReleaseManagerChat";
import { CoverageAnalysisCard } from "@/components/enablement/CoverageAnalysisCard";
import { ContentWorkflowBoard } from "@/components/enablement/ContentWorkflowBoard";
import { ManualPublishCard } from "@/components/kb/ManualPublishCard";
import { PublishWizard } from "@/components/kb/PublishWizard";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ReleaseCommandCenterPage() {
  const { navigateToRecord } = useWorkspaceNavigation();
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "overview",
      publishingFilter: "all",
      wizardOpen: false,
      selectedManualId: null as string | null,
    },
    syncToUrl: ["activeTab"],
  });

  // Publishing tab data
  const { getManualStatus } = useManualPublishing();
  
  const selectedManual = tabState.selectedManualId 
    ? MANUAL_CONFIGS.find(m => m.id === tabState.selectedManualId) || null 
    : null;

  // Calculate publishing stats
  const publishingStats = MANUAL_CONFIGS.reduce(
    (acc, manual) => {
      const status = getManualStatus(manual.id);
      if (!status.isPublished) acc.notPublished++;
      else if (status.needsSync) acc.needsSync++;
      else acc.published++;
      return acc;
    },
    { notPublished: 0, published: 0, needsSync: 0 }
  );

  // Filter manuals by tab
  const filteredManuals = MANUAL_CONFIGS.filter(manual => {
    const status = getManualStatus(manual.id);
    if (tabState.publishingFilter === "all") return true;
    if (tabState.publishingFilter === "not-published") return !status.isPublished;
    if (tabState.publishingFilter === "needs-sync") return status.isPublished && status.needsSync;
    if (tabState.publishingFilter === "published") return status.isPublished && !status.needsSync;
    return true;
  });

  const handlePublish = (manualId: string) => {
    const manual = MANUAL_CONFIGS.find(m => m.id === manualId);
    if (manual) {
      setTabState({ selectedManualId: manual.id, wizardOpen: true });
    }
  };

  const handlePreview = (manualId: string) => {
    const config = MANUAL_CONFIGS.find(m => m.id === manualId);
    if (config) {
      navigateToRecord({
        route: config.href,
        title: config.name,
        subtitle: "Manual",
        moduleCode: "enablement",
        contextType: "manual",
        contextId: config.id,
        icon: BookOpen,
      });
    }
  };

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
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="coverage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Coverage
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="publishing" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Publishing
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
                    (lifecycle?.last_readiness_score ?? 0) >= 80 ? 'text-[hsl(var(--semantic-success-text))]' :
                    (lifecycle?.last_readiness_score ?? 0) >= 60 ? 'text-[hsl(var(--semantic-warning-text))]' : 'text-[hsl(var(--semantic-error-text))]'
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

          {/* Coverage Tab */}
          <TabsContent value="coverage" className="mt-6">
            <CoverageAnalysisCard />
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="mt-6">
            <ContentWorkflowBoard />
          </TabsContent>

          {/* Publishing Tab */}
          <TabsContent value="publishing" className="mt-6 space-y-6">
            {/* Publishing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{MANUAL_CONFIGS.length}</p>
                      <p className="text-xs text-muted-foreground">Total Manuals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{publishingStats.published}</p>
                      <p className="text-xs text-muted-foreground">Published</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{publishingStats.needsSync}</p>
                      <p className="text-xs text-muted-foreground">Needs Sync</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-500/10">
                      <Clock className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{publishingStats.notPublished}</p>
                      <p className="text-xs text-muted-foreground">Not Published</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Publishing Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={tabState.publishingFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTabState({ publishingFilter: "all" })}
              >
                All Manuals
                <Badge variant="secondary" className="ml-2">{MANUAL_CONFIGS.length}</Badge>
              </Button>
              <Button
                variant={tabState.publishingFilter === "not-published" ? "default" : "outline"}
                size="sm"
                onClick={() => setTabState({ publishingFilter: "not-published" })}
              >
                Not Published
                {publishingStats.notPublished > 0 && (
                  <Badge variant="secondary" className="ml-2">{publishingStats.notPublished}</Badge>
                )}
              </Button>
              <Button
                variant={tabState.publishingFilter === "needs-sync" ? "default" : "outline"}
                size="sm"
                onClick={() => setTabState({ publishingFilter: "needs-sync" })}
              >
                Needs Sync
                {publishingStats.needsSync > 0 && (
                  <Badge variant="outline" className="ml-2 border-amber-500 text-amber-600">
                    {publishingStats.needsSync}
                  </Badge>
                )}
              </Button>
              <Button
                variant={tabState.publishingFilter === "published" ? "default" : "outline"}
                size="sm"
                onClick={() => setTabState({ publishingFilter: "published" })}
              >
                Published
                {publishingStats.published > 0 && (
                  <Badge variant="secondary" className="ml-2">{publishingStats.published}</Badge>
                )}
              </Button>
            </div>

            {/* Manual List */}
            <div className="space-y-4">
              {filteredManuals.map(manual => (
                <ManualPublishCard
                  key={manual.id}
                  manual={manual}
                  status={getManualStatus(manual.id)}
                  onPublish={() => handlePublish(manual.id)}
                  onSync={() => handlePublish(manual.id)}
                  onViewHistory={() => {}}
                  onPreview={() => handlePreview(manual.id)}
                />
              ))}
              
              {filteredManuals.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No manuals match the current filter.
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Publish Wizard */}
            {selectedManual && (
              <PublishWizard
                open={tabState.wizardOpen}
                onOpenChange={(open) => setTabState({ wizardOpen: open })}
                manualId={selectedManual.id}
                manualName={selectedManual.name}
                sourceVersion={selectedManual.version}
                currentPublishedVersion={getManualStatus(selectedManual.id).publishedVersion || undefined}
                sectionsCount={selectedManual.sectionsCount}
                onPublishComplete={() => {
                  setTabState({ wizardOpen: false, selectedManualId: null });
                }}
              />
            )}
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
                          <Clock className="h-4 w-4 text-[hsl(var(--semantic-warning-text))]" />
                          Pre-Release
                        </span>
                      </SelectItem>
                      <SelectItem value="preview">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-[hsl(var(--semantic-info-text))]" />
                          Preview
                        </span>
                      </SelectItem>
                      <SelectItem value="ga-released">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--semantic-success-text))]" />
                          GA Released
                        </span>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <span className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-[hsl(var(--semantic-neutral-text))]" />
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
