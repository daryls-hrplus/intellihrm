import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Settings2, AlertTriangle, History, Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface RollupConfig {
  id?: string;
  parent_goal_id: string;
  rollup_method: 'weighted_average' | 'simple_average' | 'minimum' | 'maximum' | 'manual';
  auto_calculate: boolean;
  include_aligned_goals: boolean;
  include_child_goals: boolean;
  threshold_percentage: number;
}

interface ProgressOverride {
  id: string;
  previous_value: number;
  override_value: number;
  calculated_value: number | null;
  justification: string;
  created_at: string;
  overridden_by: string;
}

interface ProgressRollupConfigProps {
  goalId: string;
  currentProgress: number;
  onProgressUpdate?: (newProgress: number) => void;
}

const ROLLUP_METHODS = [
  { 
    value: 'weighted_average', 
    label: 'Weighted Average', 
    description: 'Progress calculated based on each contributing goal\'s weight' 
  },
  { 
    value: 'simple_average', 
    label: 'Simple Average', 
    description: 'Equal weight given to all contributing goals' 
  },
  { 
    value: 'minimum', 
    label: 'Minimum', 
    description: 'Progress equals the lowest contributing goal' 
  },
  { 
    value: 'maximum', 
    label: 'Maximum', 
    description: 'Progress equals the highest contributing goal' 
  },
  { 
    value: 'manual', 
    label: 'Manual', 
    description: 'Progress is set manually and not calculated from children' 
  },
];

export function ProgressRollupConfig({ goalId, currentProgress, onProgressUpdate }: ProgressRollupConfigProps) {
  const [config, setConfig] = useState<RollupConfig>({
    parent_goal_id: goalId,
    rollup_method: 'weighted_average',
    auto_calculate: true,
    include_aligned_goals: true,
    include_child_goals: true,
    threshold_percentage: 100,
  });
  const [overrideHistory, setOverrideHistory] = useState<ProgressOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [overrideValue, setOverrideValue] = useState(currentProgress);
  const [overrideJustification, setOverrideJustification] = useState('');
  const [calculatedProgress, setCalculatedProgress] = useState<number | null>(null);

  useEffect(() => {
    fetchConfig();
    fetchOverrideHistory();
    calculateRollup();
  }, [goalId]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('goal_progress_rollup_config')
        .select('*')
        .eq('parent_goal_id', goalId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching rollup config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverrideHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('goal_progress_overrides')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setOverrideHistory(data || []);
    } catch (error) {
      console.error('Error fetching override history:', error);
    }
  };

  const calculateRollup = async () => {
    try {
      const { data, error } = await supabase.rpc('calculate_goal_progress_rollup', {
        p_goal_id: goalId
      });

      if (error) throw error;
      setCalculatedProgress(data);
    } catch (error) {
      console.error('Error calculating rollup:', error);
    }
  };

  const handleConfigChange = <K extends keyof RollupConfig>(key: K, value: RollupConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const { id, ...configData } = config;

      if (id) {
        const { error } = await supabase
          .from('goal_progress_rollup_config')
          .update(configData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('goal_progress_rollup_config')
          .insert(configData);

        if (error) throw error;
      }

      toast.success('Rollup configuration saved');
      setHasChanges(false);
      
      // Recalculate after config change
      calculateRollup();
    } catch (error) {
      console.error('Error saving rollup config:', error);
      toast.error('Failed to save rollup configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleOverride = async () => {
    if (!overrideJustification.trim()) {
      toast.error('Please provide a justification for the override');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Insert override record
      const { error: overrideError } = await supabase
        .from('goal_progress_overrides')
        .insert({
          goal_id: goalId,
          previous_value: currentProgress,
          override_value: overrideValue,
          calculated_value: calculatedProgress,
          justification: overrideJustification,
          overridden_by: userData.user.id,
        });

      if (overrideError) throw overrideError;

      // Update goal progress
      const { error: goalError } = await supabase
        .from('performance_goals')
        .update({ progress_percentage: overrideValue })
        .eq('id', goalId);

      if (goalError) throw goalError;

      toast.success('Progress overridden successfully');
      setOverrideDialogOpen(false);
      setOverrideJustification('');
      onProgressUpdate?.(overrideValue);
      fetchOverrideHistory();
    } catch (error) {
      console.error('Error overriding progress:', error);
      toast.error('Failed to override progress');
    }
  };

  const handleRecalculate = async () => {
    await calculateRollup();
    if (calculatedProgress !== null && config.auto_calculate) {
      try {
        const { error } = await supabase
          .from('performance_goals')
          .update({ progress_percentage: calculatedProgress })
          .eq('id', goalId);

        if (error) throw error;
        
        onProgressUpdate?.(calculatedProgress);
        toast.success('Progress recalculated');
      } catch (error) {
        console.error('Error updating progress:', error);
        toast.error('Failed to update progress');
      }
    }
  };

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading rollup configuration...</div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5" />
              Progress Rollup
            </CardTitle>
            <CardDescription className="mt-1">
              Configure how child and aligned goals affect this goal's progress
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button size="sm" onClick={handleSaveConfig} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Progress Summary */}
        <div className="rounded-lg border p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Progress</p>
              <p className="text-2xl font-bold text-primary">{currentProgress}%</p>
            </div>
            {calculatedProgress !== null && calculatedProgress !== currentProgress && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Calculated</p>
                <p className="text-lg font-semibold">{calculatedProgress}%</p>
                {Math.abs(calculatedProgress - currentProgress) > 5 && (
                  <Badge variant="outline" className="text-warning mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {calculatedProgress > currentProgress ? '+' : ''}{(calculatedProgress - currentProgress).toFixed(1)}%
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={handleRecalculate}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Recalculate
            </Button>
            <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-1" />
                  Override
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Override Progress</DialogTitle>
                  <DialogDescription>
                    Manually set the progress value. This requires justification.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>New Progress Value: {overrideValue}%</Label>
                    <Slider
                      value={[overrideValue]}
                      onValueChange={([v]) => setOverrideValue(v)}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: {currentProgress}%</span>
                      {calculatedProgress !== null && <span>Calculated: {calculatedProgress}%</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Justification *</Label>
                    <Textarea
                      value={overrideJustification}
                      onChange={(e) => setOverrideJustification(e.target.value)}
                      placeholder="Explain why you're overriding the calculated progress..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleOverride}>
                    Apply Override
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Override History</DialogTitle>
                  <DialogDescription>
                    Previous manual progress overrides
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {overrideHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No overrides recorded
                    </p>
                  ) : (
                    overrideHistory.map(override => (
                      <div key={override.id} className="rounded-lg border p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {override.previous_value}% → {override.override_value}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(override.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        {override.calculated_value !== null && (
                          <p className="text-xs text-muted-foreground">
                            Calculated was: {override.calculated_value}%
                          </p>
                        )}
                        <p className="text-sm">{override.justification}</p>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Rollup Method */}
        <div className="space-y-3">
          <Label>Rollup Method</Label>
          <Select 
            value={config.rollup_method} 
            onValueChange={(v) => handleConfigChange('rollup_method', v as RollupConfig['rollup_method'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLLUP_METHODS.map(method => (
                <SelectItem key={method.value} value={method.value}>
                  <div>
                    <p className="font-medium">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Auto Calculate Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>Auto Calculate</Label>
            <p className="text-sm text-muted-foreground">
              Automatically update progress when child goals change
            </p>
          </div>
          <Switch
            checked={config.auto_calculate}
            onCheckedChange={(v) => handleConfigChange('auto_calculate', v)}
            disabled={config.rollup_method === 'manual'}
          />
        </div>

        {/* Include Sources */}
        <div className="space-y-3">
          <Label>Progress Sources</Label>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Child Goals</p>
                <p className="text-xs text-muted-foreground">
                  Goals where this is the parent (via hierarchy)
                </p>
              </div>
              <Switch
                checked={config.include_child_goals}
                onCheckedChange={(v) => handleConfigChange('include_child_goals', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Aligned Goals</p>
                <p className="text-xs text-muted-foreground">
                  Goals that contribute via alignment relationships
                </p>
              </div>
              <Switch
                checked={config.include_aligned_goals}
                onCheckedChange={(v) => handleConfigChange('include_aligned_goals', v)}
              />
            </div>
          </div>
        </div>

        {/* Threshold */}
        <div className="space-y-3">
          <Label>Maximum Progress Cap: {config.threshold_percentage}%</Label>
          <Slider
            value={[config.threshold_percentage]}
            onValueChange={([v]) => handleConfigChange('threshold_percentage', v)}
            min={50}
            max={100}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            Calculated progress will not exceed this value (useful for phased goals)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
