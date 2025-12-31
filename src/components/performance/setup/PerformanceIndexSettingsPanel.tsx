import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendingUp, Settings, Save, RotateCcw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PerformanceIndexSettingsPanelProps {
  companyId: string;
}

interface IndexSettings {
  id?: string;
  rolling_window_months: number;
  recency_weight_factor: number;
  trend_sensitivity: number;
  minimum_cycles_required: number;
  include_probation_reviews: boolean;
  weight_by_cycle_type: Record<string, number>;
  is_active: boolean;
}

const defaultSettings: IndexSettings = {
  rolling_window_months: 24,
  recency_weight_factor: 0.70,
  trend_sensitivity: 0.50,
  minimum_cycles_required: 2,
  include_probation_reviews: false,
  weight_by_cycle_type: { annual: 1.0, mid_year: 0.5, quarterly: 0.25 },
  is_active: true,
};

export function PerformanceIndexSettingsPanel({ companyId }: PerformanceIndexSettingsPanelProps) {
  const [settings, setSettings] = useState<IndexSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [companyId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("performance_index_settings")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          rolling_window_months: data.rolling_window_months,
          recency_weight_factor: Number(data.recency_weight_factor),
          trend_sensitivity: Number(data.trend_sensitivity),
          minimum_cycles_required: data.minimum_cycles_required,
          include_probation_reviews: data.include_probation_reviews,
          weight_by_cycle_type: data.weight_by_cycle_type as Record<string, number> || defaultSettings.weight_by_cycle_type,
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        company_id: companyId,
        rolling_window_months: settings.rolling_window_months,
        recency_weight_factor: settings.recency_weight_factor,
        trend_sensitivity: settings.trend_sensitivity,
        minimum_cycles_required: settings.minimum_cycles_required,
        include_probation_reviews: settings.include_probation_reviews,
        weight_by_cycle_type: settings.weight_by_cycle_type,
        is_active: settings.is_active,
      };

      const { error } = await supabase
        .from("performance_index_settings")
        .upsert(payload, { onConflict: "company_id" });

      if (error) throw error;

      toast.success("Performance index settings saved");
      setHasChanges(false);
      await fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const updateSetting = <K extends keyof IndexSettings>(key: K, value: IndexSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateCycleWeight = (cycleType: string, weight: number) => {
    setSettings(prev => ({
      ...prev,
      weight_by_cycle_type: { ...prev.weight_by_cycle_type, [cycleType]: weight }
    }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Index Settings
            </CardTitle>
            <CardDescription>
              Configure how the composite performance index is calculated across multiple appraisal cycles
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rolling Window */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Rolling Window Period</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Number of months of historical data to include in index calculation</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={settings.rolling_window_months.toString()} 
              onValueChange={(v) => updateSetting("rolling_window_months", parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 months (1 year)</SelectItem>
                <SelectItem value="24">24 months (2 years)</SelectItem>
                <SelectItem value="36">36 months (3 years)</SelectItem>
                <SelectItem value="48">48 months (4 years)</SelectItem>
                <SelectItem value="60">60 months (5 years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Minimum Cycles Required</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Minimum number of appraisal cycles needed to calculate a performance index</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={settings.minimum_cycles_required.toString()} 
              onValueChange={(v) => updateSetting("minimum_cycles_required", parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 cycle</SelectItem>
                <SelectItem value="2">2 cycles</SelectItem>
                <SelectItem value="3">3 cycles</SelectItem>
                <SelectItem value="4">4 cycles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recency Weight */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Recency Weight Factor</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>How much more weight recent appraisals receive compared to older ones</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline">{Math.round(settings.recency_weight_factor * 100)}%</Badge>
          </div>
          <Slider
            value={[settings.recency_weight_factor * 100]}
            onValueChange={([v]) => updateSetting("recency_weight_factor", v / 100)}
            min={50}
            max={100}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            Higher values give more importance to recent performance. 100% = equal weight to all cycles.
          </p>
        </div>

        {/* Trend Sensitivity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Trend Sensitivity</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>How much the performance trend (improving/declining) affects the index</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline">{Math.round(settings.trend_sensitivity * 100)}%</Badge>
          </div>
          <Slider
            value={[settings.trend_sensitivity * 100]}
            onValueChange={([v]) => updateSetting("trend_sensitivity", v / 100)}
            min={0}
            max={100}
            step={10}
          />
          <p className="text-xs text-muted-foreground">
            Higher values amplify the impact of improving or declining trends.
          </p>
        </div>

        {/* Cycle Type Weights */}
        <div className="space-y-3">
          <Label>Cycle Type Weights</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Relative importance of different appraisal cycle types in the index calculation
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { key: "annual", label: "Annual Review" },
              { key: "mid_year", label: "Mid-Year Review" },
              { key: "quarterly", label: "Quarterly Check-in" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{label}</Label>
                  <Badge variant="secondary">{settings.weight_by_cycle_type[key] || 0}</Badge>
                </div>
                <Slider
                  value={[(settings.weight_by_cycle_type[key] || 0) * 100]}
                  onValueChange={([v]) => updateCycleWeight(key, v / 100)}
                  min={0}
                  max={100}
                  step={25}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Probation Reviews</Label>
              <p className="text-xs text-muted-foreground">
                Include probationary period reviews in the performance index
              </p>
            </div>
            <Switch
              checked={settings.include_probation_reviews}
              onCheckedChange={(v) => updateSetting("include_probation_reviews", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Performance Index</Label>
              <p className="text-xs text-muted-foreground">
                Calculate and display the composite performance index across the platform
              </p>
            </div>
            <Switch
              checked={settings.is_active}
              onCheckedChange={(v) => updateSetting("is_active", v)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
