import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutGrid, 
  Palette, 
  Sparkles, 
  Zap, 
  RotateCcw, 
  Save,
  Eye,
  Settings,
  CheckCircle2,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { 
  useDashboardConfiguration,
  StatCardStyleConfig,
  ColorSemanticsConfig,
  LayoutConfig,
  AIDashboardConfig,
  QuickActionsConfig
} from '@/hooks/useDashboardConfiguration';
import { UnifiedStatCard, UnifiedStatsRow, UnifiedAIDashboard } from '@/components/dashboard';
import { toast } from 'sonner';

export function DashboardConfigurationPanel() {
  const { config, loading, saving, updateConfiguration, resetToDefaults } = useDashboardConfiguration();
  const [previewMode, setPreviewMode] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  // Update local config when main config changes
  useState(() => {
    setLocalConfig(config);
  });

  const handleStatCardStyleChange = async (key: keyof StatCardStyleConfig, value: any) => {
    const newStyle = { ...localConfig.statCardStyle, [key]: value };
    setLocalConfig(prev => ({ ...prev, statCardStyle: newStyle }));
    
    if (!previewMode) {
      const success = await updateConfiguration('statCardStyle', newStyle);
      if (success) {
        toast.success('Stat card style updated');
      } else {
        toast.error('Failed to update stat card style');
      }
    }
  };

  const handleColorSemanticsChange = async (key: keyof ColorSemanticsConfig, value: any) => {
    const newSemantics = { ...localConfig.colorSemantics, [key]: value };
    setLocalConfig(prev => ({ ...prev, colorSemantics: newSemantics }));
    
    if (!previewMode) {
      const success = await updateConfiguration('colorSemantics', newSemantics);
      if (success) {
        toast.success('Color semantics updated');
      } else {
        toast.error('Failed to update color semantics');
      }
    }
  };

  const handleLayoutChange = async (key: keyof LayoutConfig, value: any) => {
    const newLayout = { ...localConfig.layout, [key]: value };
    setLocalConfig(prev => ({ ...prev, layout: newLayout }));
    
    if (!previewMode) {
      const success = await updateConfiguration('layout', newLayout);
      if (success) {
        toast.success('Layout updated');
      } else {
        toast.error('Failed to update layout');
      }
    }
  };

  const handleAIDashboardChange = async (key: keyof AIDashboardConfig, value: any) => {
    const newAI = { ...localConfig.aiDashboard, [key]: value };
    setLocalConfig(prev => ({ ...prev, aiDashboard: newAI }));
    
    if (!previewMode) {
      const success = await updateConfiguration('aiDashboard', newAI);
      if (success) {
        toast.success('AI Dashboard settings updated');
      } else {
        toast.error('Failed to update AI Dashboard settings');
      }
    }
  };

  const handleQuickActionsChange = async (key: keyof QuickActionsConfig, value: any) => {
    const newQA = { ...localConfig.quickActions, [key]: value };
    setLocalConfig(prev => ({ ...prev, quickActions: newQA }));
    
    if (!previewMode) {
      const success = await updateConfiguration('quickActions', newQA);
      if (success) {
        toast.success('Quick actions settings updated');
      } else {
        toast.error('Failed to update quick actions settings');
      }
    }
  };

  const handleSaveAll = async () => {
    const updates = [
      updateConfiguration('statCardStyle', localConfig.statCardStyle),
      updateConfiguration('colorSemantics', localConfig.colorSemantics),
      updateConfiguration('layout', localConfig.layout),
      updateConfiguration('aiDashboard', localConfig.aiDashboard),
      updateConfiguration('quickActions', localConfig.quickActions),
    ];
    
    const results = await Promise.all(updates);
    if (results.every(Boolean)) {
      toast.success('All dashboard settings saved');
      setPreviewMode(false);
    } else {
      toast.error('Some settings failed to save');
    }
  };

  const handleReset = async () => {
    const success = await resetToDefaults();
    if (success) {
      setLocalConfig(config);
      toast.success('Dashboard settings reset to defaults');
    } else {
      toast.error('Failed to reset settings');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Preview Mode On' : 'Preview Mode'}
          </Button>
          {previewMode && (
            <Badge variant="secondary">Changes are not saved until you click Save All</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          {previewMode && (
            <Button size="sm" onClick={handleSaveAll} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save All
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="layout" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="layout" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-2">
            <Settings className="h-4 w-4" />
            Stat Cards
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Dashboard
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
          </TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Layout Settings</CardTitle>
              <CardDescription>Configure the overall dashboard layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stats Grid Columns</Label>
                  <Select
                    value={String(localConfig.layout.statsColumns)}
                    onValueChange={(v) => handleLayoutChange('statsColumns', Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns (Default)</SelectItem>
                      <SelectItem value="5">5 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Card Spacing</Label>
                  <Select
                    value={localConfig.layout.cardSpacing}
                    onValueChange={(v) => handleLayoutChange('cardSpacing', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium (Default)</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Card Border Radius</Label>
                  <Select
                    value={localConfig.layout.cardRadius}
                    onValueChange={(v) => handleLayoutChange('cardRadius', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large (Default)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Animations</Label>
                  <p className="text-sm text-muted-foreground">Show slide-up animations on page load</p>
                </div>
                <Switch
                  checked={localConfig.layout.showAnimations}
                  onCheckedChange={(v) => handleLayoutChange('showAnimations', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedStatsRow columns={localConfig.layout.statsColumns as 2 | 3 | 4 | 5}>
                <UnifiedStatCard
                  title="Total Employees"
                  value="1,234"
                  change="+12 this month"
                  changeType="positive"
                  icon={CheckCircle2}
                  valueType="neutral"
                />
                <UnifiedStatCard
                  title="Pending Actions"
                  value="23"
                  change="5 urgent"
                  changeType="warning"
                  icon={AlertTriangle}
                  valueType="warning"
                />
                <UnifiedStatCard
                  title="Completed Tasks"
                  value="89%"
                  change="+5% from last week"
                  changeType="positive"
                  icon={TrendingUp}
                  valueType="positive"
                />
                {localConfig.layout.statsColumns >= 4 && (
                  <UnifiedStatCard
                    title="Open Positions"
                    value="8"
                    icon={Settings}
                    valueType="neutral"
                  />
                )}
              </UnifiedStatsRow>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stat Cards Tab */}
        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stat Card Appearance</CardTitle>
              <CardDescription>Customize how stat cards look across all dashboards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Card Variant</Label>
                  <Select
                    value={localConfig.statCardStyle.variant}
                    onValueChange={(v) => handleStatCardStyleChange('variant', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="elevated">Elevated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Icon Style</Label>
                  <Select
                    value={localConfig.statCardStyle.iconStyle}
                    onValueChange={(v) => handleStatCardStyleChange('iconStyle', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accent">Accent Background</SelectItem>
                      <SelectItem value="primary">Primary Tint</SelectItem>
                      <SelectItem value="muted">Muted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value Text Size</Label>
                  <Select
                    value={localConfig.statCardStyle.valueSize}
                    onValueChange={(v) => handleStatCardStyleChange('valueSize', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xl">Small (XL)</SelectItem>
                      <SelectItem value="2xl">Medium (2XL)</SelectItem>
                      <SelectItem value="3xl">Large (3XL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Border</Label>
                    <p className="text-sm text-muted-foreground">Display a border around cards</p>
                  </div>
                  <Switch
                    checked={localConfig.statCardStyle.showBorder}
                    onCheckedChange={(v) => handleStatCardStyleChange('showBorder', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Shadow</Label>
                    <p className="text-sm text-muted-foreground">Add subtle shadow to cards</p>
                  </div>
                  <Switch
                    checked={localConfig.statCardStyle.showShadow}
                    onCheckedChange={(v) => handleStatCardStyleChange('showShadow', v)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Semantic Color Mapping</CardTitle>
              <CardDescription>Define which colors represent different status types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Positive Values</Label>
                  <p className="text-xs text-muted-foreground">Completed, healthy, good metrics</p>
                  <Select
                    value={localConfig.colorSemantics.positive}
                    onValueChange={(v) => handleColorSemanticsChange('positive', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-success" />
                          Success (Green)
                        </span>
                      </SelectItem>
                      <SelectItem value="primary">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-primary" />
                          Primary
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Negative Values</Label>
                  <p className="text-xs text-muted-foreground">Overdue, critical, issues</p>
                  <Select
                    value={localConfig.colorSemantics.negative}
                    onValueChange={(v) => handleColorSemanticsChange('negative', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="destructive">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-destructive" />
                          Destructive (Red)
                        </span>
                      </SelectItem>
                      <SelectItem value="warning">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-warning" />
                          Warning (Amber)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Warning Values</Label>
                  <p className="text-xs text-muted-foreground">Due soon, needs attention</p>
                  <Select
                    value={localConfig.colorSemantics.warning}
                    onValueChange={(v) => handleColorSemanticsChange('warning', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-warning" />
                          Warning (Amber)
                        </span>
                      </SelectItem>
                      <SelectItem value="muted">
                        <span className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-muted-foreground" />
                          Muted
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Neutral Values</Label>
                  <p className="text-xs text-muted-foreground">Standard counts and metrics</p>
                  <Select
                    value={localConfig.colorSemantics.neutral}
                    onValueChange={(v) => handleColorSemanticsChange('neutral', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="foreground">Default Text</SelectItem>
                      <SelectItem value="muted-foreground">Muted Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Dashboard Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Dashboard Settings</CardTitle>
              <CardDescription>Configure the AI insights panel appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Insight Display Style</Label>
                  <Select
                    value={localConfig.aiDashboard.insightStyle}
                    onValueChange={(v) => handleAIDashboardChange('insightStyle', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card (Background)</SelectItem>
                      <SelectItem value="list">List (Clean)</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Stats Position</Label>
                  <Select
                    value={localConfig.aiDashboard.statsPosition}
                    onValueChange={(v) => handleAIDashboardChange('statsPosition', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="side">Side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Gradient Border</Label>
                  <p className="text-sm text-muted-foreground">Add a colored accent border to AI panels</p>
                </div>
                <Switch
                  checked={localConfig.aiDashboard.showGradientBorder}
                  onCheckedChange={(v) => handleAIDashboardChange('showGradientBorder', v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <UnifiedAIDashboard
                title="AI Insights Preview"
                stats={[
                  { label: 'Analyzed', value: '156', icon: CheckCircle2, type: 'positive' },
                  { label: 'Pending', value: '23', icon: AlertTriangle, type: 'warning' },
                ]}
                insights={[
                  { 
                    title: 'Sample Insight', 
                    description: 'This is how insights will appear in the dashboard', 
                    type: 'info' 
                  },
                  { 
                    title: 'Action Recommended', 
                    description: 'AI has identified an opportunity', 
                    type: 'action',
                    action: 'Take Action'
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions Settings</CardTitle>
              <CardDescription>Configure how quick action buttons appear</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Style</Label>
                  <Select
                    value={localConfig.quickActions.style}
                    onValueChange={(v) => handleQuickActionsChange('style', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buttons">Buttons</SelectItem>
                      <SelectItem value="cards">Cards</SelectItem>
                      <SelectItem value="icons">Icons Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Visible Actions</Label>
                  <Select
                    value={String(localConfig.quickActions.maxVisible)}
                    onValueChange={(v) => handleQuickActionsChange('maxVisible', Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Actions</SelectItem>
                      <SelectItem value="6">6 Actions</SelectItem>
                      <SelectItem value="8">8 Actions</SelectItem>
                      <SelectItem value="10">10 Actions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Icons</Label>
                  <p className="text-sm text-muted-foreground">Display icons alongside action labels</p>
                </div>
                <Switch
                  checked={localConfig.quickActions.showIcons}
                  onCheckedChange={(v) => handleQuickActionsChange('showIcons', v)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
