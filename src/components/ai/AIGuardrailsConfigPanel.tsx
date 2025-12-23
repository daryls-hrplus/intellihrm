import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings2, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock,
  Save,
  RefreshCw
} from "lucide-react";

interface GuardrailConfig {
  id: string;
  guardrail_type: string;
  config_key: string;
  config_value: any;
  is_active: boolean;
  company_id: string | null;
}

const DEFAULT_CONFIGS = [
  {
    guardrail_type: "risk_threshold",
    config_key: "high_risk_threshold",
    config_value: { threshold: 0.7, action: "human_review_required" },
    description: "Threshold for flagging high-risk interactions"
  },
  {
    guardrail_type: "risk_threshold",
    config_key: "critical_risk_threshold",
    config_value: { threshold: 0.85, action: "block_response" },
    description: "Threshold for blocking responses"
  },
  {
    guardrail_type: "bias_detection",
    config_key: "bias_sensitivity",
    config_value: { sensitivity: "medium", auto_flag: true },
    description: "Bias detection sensitivity level"
  },
  {
    guardrail_type: "pii_protection",
    config_key: "pii_masking",
    config_value: { enabled: true, mask_pattern: "[REDACTED]" },
    description: "PII masking in AI responses"
  },
  {
    guardrail_type: "escalation",
    config_key: "auto_escalation",
    config_value: { enabled: true, notify_admins: true, topics: ["termination", "harassment", "legal"] },
    description: "Automatic escalation for sensitive topics"
  },
];

export function AIGuardrailsConfigPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [localConfigs, setLocalConfigs] = useState<Record<string, any>>({});

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["ai-guardrails-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_guardrails_config")
        .select("*")
        .order("guardrail_type");
      
      if (error) throw error;
      return data as GuardrailConfig[];
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, config_value, is_active }: { id: string; config_value: any; is_active: boolean }) => {
      const { error } = await supabase
        .from("ai_guardrails_config")
        .update({ config_value, is_active, updated_at: new Date().toISOString() })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-guardrails-config"] });
      toast({ title: "Configuration updated" });
      setEditingConfig(null);
    },
    onError: (error) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
  });

  const createDefaultConfigsMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user?.id)
        .single();

      for (const config of DEFAULT_CONFIGS) {
        const { error } = await supabase
          .from("ai_guardrails_config")
          .upsert({
            guardrail_type: config.guardrail_type,
            config_key: config.config_key,
            config_value: config.config_value,
            is_active: true,
            company_id: profile?.company_id,
          }, {
            onConflict: "config_key,company_id"
          });
        
        if (error) console.error("Config insert error:", error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-guardrails-config"] });
      toast({ title: "Default configurations created" });
    },
  });

  const getConfigIcon = (type: string) => {
    switch (type) {
      case "risk_threshold": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "bias_detection": return <Eye className="h-4 w-4 text-purple-500" />;
      case "pii_protection": return <Lock className="h-4 w-4 text-blue-500" />;
      case "escalation": return <Shield className="h-4 w-4 text-red-500" />;
      default: return <Settings2 className="h-4 w-4" />;
    }
  };

  const handleThresholdChange = (configId: string, value: number[]) => {
    setLocalConfigs(prev => ({
      ...prev,
      [configId]: { ...prev[configId], threshold: value[0] }
    }));
  };

  const handleToggleActive = (config: GuardrailConfig) => {
    updateConfigMutation.mutate({
      id: config.id,
      config_value: config.config_value,
      is_active: !config.is_active
    });
  };

  const handleSaveConfig = (config: GuardrailConfig) => {
    const updatedValue = localConfigs[config.id] 
      ? { ...config.config_value, ...localConfigs[config.id] }
      : config.config_value;
    
    updateConfigMutation.mutate({
      id: config.id,
      config_value: updatedValue,
      is_active: config.is_active
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading configurations...</p>
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
              <Settings2 className="h-5 w-5" />
              AI Guardrails Configuration
            </CardTitle>
            <CardDescription>
              Configure ISO 42001 compliant AI safety thresholds and policies
            </CardDescription>
          </div>
          {configs.length === 0 && (
            <Button onClick={() => createDefaultConfigsMutation.mutate()}>
              Initialize Default Config
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {configs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No guardrail configurations found.</p>
            <p className="text-sm">Click "Initialize Default Config" to create standard ISO 42001 guardrails.</p>
          </div>
        ) : (
          configs.map((config) => (
            <div
              key={config.id}
              className="p-4 border rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getConfigIcon(config.guardrail_type)}
                  <div>
                    <h4 className="font-medium capitalize">
                      {config.config_key.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Type: {config.guardrail_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.is_active ? "default" : "secondary"}>
                    {config.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={config.is_active}
                    onCheckedChange={() => handleToggleActive(config)}
                  />
                </div>
              </div>

              {config.guardrail_type === "risk_threshold" && config.config_value?.threshold !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Threshold: {(localConfigs[config.id]?.threshold ?? config.config_value.threshold * 100).toFixed(0)}%</Label>
                    <span className="text-sm text-muted-foreground">
                      Action: {config.config_value.action?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <Slider
                    value={[localConfigs[config.id]?.threshold ?? config.config_value.threshold * 100]}
                    onValueChange={(v) => handleThresholdChange(config.id, [v[0] / 100])}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}

              {config.guardrail_type === "bias_detection" && (
                <div className="flex items-center gap-4">
                  <Label>Sensitivity:</Label>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={localConfigs[config.id]?.sensitivity ?? config.config_value.sensitivity}
                    onChange={(e) => setLocalConfigs(prev => ({
                      ...prev,
                      [config.id]: { ...prev[config.id], sensitivity: e.target.value }
                    }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <Label className="flex items-center gap-2">
                    <Switch
                      checked={localConfigs[config.id]?.auto_flag ?? config.config_value.auto_flag}
                      onCheckedChange={(v) => setLocalConfigs(prev => ({
                        ...prev,
                        [config.id]: { ...prev[config.id], auto_flag: v }
                      }))}
                    />
                    Auto-flag incidents
                  </Label>
                </div>
              )}

              {config.guardrail_type === "pii_protection" && (
                <div className="flex items-center gap-4">
                  <Label className="flex items-center gap-2">
                    <Switch
                      checked={localConfigs[config.id]?.enabled ?? config.config_value.enabled}
                      onCheckedChange={(v) => setLocalConfigs(prev => ({
                        ...prev,
                        [config.id]: { ...prev[config.id], enabled: v }
                      }))}
                    />
                    Enable PII Masking
                  </Label>
                  <div className="flex items-center gap-2">
                    <Label>Mask Pattern:</Label>
                    <Input
                      className="w-32"
                      value={localConfigs[config.id]?.mask_pattern ?? config.config_value.mask_pattern}
                      onChange={(e) => setLocalConfigs(prev => ({
                        ...prev,
                        [config.id]: { ...prev[config.id], mask_pattern: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              )}

              {localConfigs[config.id] && (
                <Button 
                  size="sm" 
                  onClick={() => handleSaveConfig(config)}
                  className="mt-2"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}