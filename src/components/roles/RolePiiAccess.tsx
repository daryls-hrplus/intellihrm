import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, Save, RefreshCw, Shield, Lock, Download, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { PiiLevel } from "@/types/roles";

interface PiiAccessConfig {
  id?: string;
  role_id: string;
  pii_level: PiiLevel;
  access_personal_details: boolean;
  access_compensation: boolean;
  access_banking: boolean;
  access_medical: boolean;
  access_disciplinary: boolean;
  masking_enabled: boolean;
  export_permission: string;
  jit_access_required: boolean;
  approval_required_for_full: boolean;
}

const PII_LEVELS: { value: PiiLevel; label: string; description: string }[] = [
  { value: "none", label: "No Access", description: "Cannot view any PII data" },
  { value: "limited", label: "Limited", description: "Sees redacted/masked data only" },
  { value: "limited", label: "Partial", description: "Sees some fields, others masked" },
  { value: "full", label: "Full Access", description: "Complete access to all PII" },
];

const PII_DOMAINS = [
  { key: "access_personal_details", label: "Personal Details", description: "Name, DOB, address, ID numbers" },
  { key: "access_compensation", label: "Compensation", description: "Salary, bonuses, pay history" },
  { key: "access_banking", label: "Banking Details", description: "Bank accounts, routing numbers" },
  { key: "access_medical", label: "Medical Records", description: "Health info, leave reasons" },
  { key: "access_disciplinary", label: "Disciplinary Records", description: "Warnings, performance issues" },
];

interface RolePiiAccessProps {
  roleId: string;
}

export function RolePiiAccess({ roleId }: RolePiiAccessProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<PiiAccessConfig>({
    role_id: roleId,
    pii_level: "none",
    access_personal_details: false,
    access_compensation: false,
    access_banking: false,
    access_medical: false,
    access_disciplinary: false,
    masking_enabled: true,
    export_permission: "none",
    jit_access_required: false,
    approval_required_for_full: false,
  });
  const [originalConfig, setOriginalConfig] = useState<PiiAccessConfig | null>(null);

  useEffect(() => {
    fetchConfig();
  }, [roleId]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("role_pii_access")
        .select("*")
        .eq("role_id", roleId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const configData = data as PiiAccessConfig;
        setConfig(configData);
        setOriginalConfig(configData);
      }
    } catch (error) {
      console.error("Error fetching PII config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (originalConfig?.id) {
        const { error } = await supabase
          .from("role_pii_access")
          .update({
            pii_level: config.pii_level,
            access_personal_details: config.access_personal_details,
            access_compensation: config.access_compensation,
            access_banking: config.access_banking,
            access_medical: config.access_medical,
            access_disciplinary: config.access_disciplinary,
            access_documents: config.access_documents,
            access_notes: config.access_notes,
            masking_enabled: config.masking_enabled,
            export_permission: config.export_permission,
            jit_access_required: config.jit_access_required,
            approval_required_for_full: config.approval_required_for_full,
          })
          .eq("id", originalConfig.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("role_pii_access").insert(config);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "PII access settings saved",
      });
      fetchConfig();
    } catch (error) {
      console.error("Error saving PII config:", error);
      toast({
        title: "Error",
        description: "Failed to save PII settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = <K extends keyof PiiAccessConfig>(key: K, value: PiiAccessConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* PII Level Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              PII Access Level
            </CardTitle>
            <CardDescription>
              Configure the overall PII visibility level for this role
            </CardDescription>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {PII_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => updateConfig("pii_level", level.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  config.pii_level === level.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{level.label}</div>
                <p className="text-xs text-muted-foreground mt-1">{level.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Domain-Specific Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Domain-Specific Access
          </CardTitle>
          <CardDescription>
            Fine-tune access to specific categories of sensitive data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {PII_DOMAINS.map((domain) => (
              <div
                key={domain.key}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium text-sm">{domain.label}</div>
                  <p className="text-xs text-muted-foreground">{domain.description}</p>
                </div>
                <Switch
                  checked={config[domain.key as keyof PiiAccessConfig] as boolean}
                  onCheckedChange={(v) => updateConfig(domain.key as keyof PiiAccessConfig, v as any)}
                  disabled={config.pii_level === "none"}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Advanced Controls
          </CardTitle>
          <CardDescription>
            Additional security controls for PII handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Enable Masking</Label>
                <p className="text-xs text-muted-foreground">
                  Mask sensitive fields by default (SSN, bank accounts)
                </p>
              </div>
            </div>
            <Switch
              checked={config.masking_enabled}
              onCheckedChange={(v) => updateConfig("masking_enabled", v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Allow Export</Label>
                <p className="text-xs text-muted-foreground">
                  Permit exporting PII data to files
                </p>
              </div>
            </div>
            <Switch
              checked={config.export_permission}
              onCheckedChange={(v) => updateConfig("export_permission", v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <Label>Just-in-Time Access</Label>
                <p className="text-xs text-muted-foreground">
                  Require real-time approval for each PII view
                </p>
              </div>
            </div>
            <Switch
              checked={config.jit_access_required}
              onCheckedChange={(v) => updateConfig("jit_access_required", v)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-amber-500" />
              <div>
                <Label>Approval for Full Access</Label>
                <p className="text-xs text-muted-foreground">
                  Require manager approval to unmask data
                </p>
              </div>
            </div>
            <Switch
              checked={config.approval_required_for_full}
              onCheckedChange={(v) => updateConfig("approval_required_for_full", v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
