import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, Save, Globe, Calendar, Database, Info, AlertCircle } from "lucide-react";

interface ExternalBenchmarkConfigPanelProps {
  companyId: string;
}

interface BenchmarkConfig {
  id?: string;
  benchmark_source: string;
  industry_code: string;
  region_code: string;
  refresh_schedule: string;
  last_refresh_at: string | null;
  is_active: boolean;
  config_data: Record<string, unknown>;
}

const defaultConfig: BenchmarkConfig = {
  benchmark_source: "",
  industry_code: "",
  region_code: "",
  refresh_schedule: "quarterly",
  last_refresh_at: null,
  is_active: false,
  config_data: {},
};

const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Financial Services" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "hospitality", label: "Hospitality" },
  { value: "education", label: "Education" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

const REGION_OPTIONS = [
  { value: "caribbean", label: "Caribbean" },
  { value: "north_america", label: "North America" },
  { value: "latin_america", label: "Latin America" },
  { value: "europe", label: "Europe" },
  { value: "africa", label: "Africa" },
  { value: "asia_pacific", label: "Asia Pacific" },
  { value: "middle_east", label: "Middle East" },
  { value: "global", label: "Global" },
];

export function ExternalBenchmarkConfigPanel({ companyId }: ExternalBenchmarkConfigPanelProps) {
  const [config, setConfig] = useState<BenchmarkConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [companyId]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("external_benchmark_config")
        .select("*")
        .eq("company_id", companyId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          id: data.id,
          benchmark_source: data.benchmark_source || "",
          industry_code: data.industry_code || "",
          region_code: data.region_code || "",
          refresh_schedule: data.refresh_schedule || "quarterly",
          last_refresh_at: data.last_refresh_at,
          is_active: data.is_active,
          config_data: data.config_data as Record<string, unknown> || {},
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        company_id: companyId,
        benchmark_source: config.benchmark_source || null,
        industry_code: config.industry_code || null,
        region_code: config.region_code || null,
        refresh_schedule: config.refresh_schedule,
        is_active: config.is_active,
        config_data: config.config_data,
      };

      const { error } = await supabase
        .from("external_benchmark_config")
        .upsert(payload as any, { onConflict: "company_id" });

      if (error) throw error;

      toast.success("Benchmark configuration saved");
      setHasChanges(false);
      await fetchConfig();
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = <K extends keyof BenchmarkConfig>(key: K, value: BenchmarkConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
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
              <BarChart3 className="h-5 w-5" />
              External Benchmark Configuration
              <Badge variant="secondary" className="ml-2">Future</Badge>
            </CardTitle>
            <CardDescription>
              Configure external benchmark data sources for market comparisons
            </CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>
            External benchmark integration is under development. Configure your preferences now to be ready when the feature launches.
          </AlertDescription>
        </Alert>

        {/* Industry and Region */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Industry
            </Label>
            <Select 
              value={config.industry_code} 
              onValueChange={(v) => updateConfig("industry_code", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Region
            </Label>
            <Select 
              value={config.region_code} 
              onValueChange={(v) => updateConfig("region_code", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {REGION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Refresh Schedule */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Refresh Schedule
          </Label>
          <Select 
            value={config.refresh_schedule} 
            onValueChange={(v) => updateConfig("refresh_schedule", v)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="semi_annually">Semi-Annually</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            How often benchmark data should be refreshed from external sources
          </p>
        </div>

        {/* Benchmark Source (disabled for now) */}
        <div className="space-y-2">
          <Label>Benchmark Data Source</Label>
          <Input
            value={config.benchmark_source}
            onChange={(e) => updateConfig("benchmark_source", e.target.value)}
            placeholder="e.g., radford, mercer, compensation-data-api"
            disabled
          />
          <p className="text-xs text-muted-foreground">
            Integration with benchmark data providers will be available in a future release
          </p>
        </div>

        {/* Enable Toggle */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="space-y-0.5">
            <Label>Enable Benchmark Integration</Label>
            <p className="text-xs text-muted-foreground">
              When available, show external benchmark comparisons in performance analytics
            </p>
          </div>
          <Switch
            checked={config.is_active}
            onCheckedChange={(v) => updateConfig("is_active", v)}
          />
        </div>

        {config.last_refresh_at && (
          <div className="text-xs text-muted-foreground pt-2">
            Last refreshed: {new Date(config.last_refresh_at).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
