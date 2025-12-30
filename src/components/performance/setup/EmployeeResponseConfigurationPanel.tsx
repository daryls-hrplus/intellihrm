import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Clock,
  Eye,
  Bell,
  Shield,
  Save,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { EmployeeResponseConfiguration } from "@/hooks/useEmployeeReviewResponse";

interface EmployeeResponseConfigurationPanelProps {
  companyId: string;
  cycleId?: string;
}

const DEFAULT_CONFIG: Partial<EmployeeResponseConfiguration> = {
  is_enabled: true,
  response_window_days: 7,
  allow_late_responses: false,
  allow_disagree: true,
  allow_partial_disagree: true,
  allow_hr_escalation: true,
  require_comments_for_disagree: true,
  show_response_to_manager: true,
  allow_manager_rebuttal: true,
  include_in_permanent_record: true,
  notify_hr_on_disagreement: true,
  notify_hr_on_escalation: true,
  auto_escalate_on_disagree: false,
};

export function EmployeeResponseConfigurationPanel({ 
  companyId, 
  cycleId 
}: EmployeeResponseConfigurationPanelProps) {
  const [config, setConfig] = useState<Partial<EmployeeResponseConfiguration>>(DEFAULT_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<Partial<EmployeeResponseConfiguration>>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    fetchConfiguration();
  }, [companyId, cycleId]);

  const fetchConfiguration = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('employee_response_configuration')
        .select('*')
        .eq('company_id', companyId);

      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      } else {
        query = query.is('cycle_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data);
        setOriginalConfig(data);
        setExistingId(data.id);
      } else {
        setConfig(DEFAULT_CONFIG);
        setOriginalConfig(DEFAULT_CONFIG);
        setExistingId(null);
      }
    } catch (error) {
      console.error('Error fetching configuration:', error);
      toast.error('Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const configData = {
        company_id: companyId,
        cycle_id: cycleId || null,
        is_enabled: config.is_enabled,
        response_window_days: config.response_window_days,
        allow_late_responses: config.allow_late_responses,
        allow_disagree: config.allow_disagree,
        allow_partial_disagree: config.allow_partial_disagree,
        allow_hr_escalation: config.allow_hr_escalation,
        require_comments_for_disagree: config.require_comments_for_disagree,
        show_response_to_manager: config.show_response_to_manager,
        allow_manager_rebuttal: config.allow_manager_rebuttal,
        include_in_permanent_record: config.include_in_permanent_record,
        notify_hr_on_disagreement: config.notify_hr_on_disagreement,
        notify_hr_on_escalation: config.notify_hr_on_escalation,
        auto_escalate_on_disagree: config.auto_escalate_on_disagree,
      };

      if (existingId) {
        const { error } = await supabase
          .from('employee_response_configuration')
          .update(configData)
          .eq('id', existingId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('employee_response_configuration')
          .insert(configData as any)
          .select()
          .single();

        if (error) throw error;
        setExistingId(data.id);
      }

      setOriginalConfig(config);
      toast.success('Configuration saved successfully');
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(originalConfig);
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  const updateConfig = (key: keyof EmployeeResponseConfiguration, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
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
              <MessageSquare className="h-5 w-5 text-primary" />
              Employee Response Configuration
            </CardTitle>
            <CardDescription>
              Configure how employees can respond to their manager's performance review
            </CardDescription>
          </div>
          <Badge variant={config.is_enabled ? "default" : "secondary"}>
            {config.is_enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Employee Response Phase</Label>
            <p className="text-sm text-muted-foreground">
              Allow employees to formally respond to their manager's review
            </p>
          </div>
          <Switch
            checked={config.is_enabled}
            onCheckedChange={(checked) => updateConfig('is_enabled', checked)}
          />
        </div>

        <Separator />

        {/* Timing Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timing
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Response Window (Days)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={config.response_window_days || 7}
                onChange={(e) => updateConfig('response_window_days', parseInt(e.target.value) || 7)}
              />
              <p className="text-xs text-muted-foreground">
                Days employees have to respond after manager submits review
              </p>
            </div>
            <div className="flex items-center justify-between pt-6">
              <div className="space-y-0.5">
                <Label>Allow Late Responses</Label>
                <p className="text-xs text-muted-foreground">
                  Accept responses after window closes
                </p>
              </div>
              <Switch
                checked={config.allow_late_responses}
                onCheckedChange={(checked) => updateConfig('allow_late_responses', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Response Options Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Response Options
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Disagree</Label>
                <p className="text-xs text-muted-foreground">
                  Employees can disagree with their evaluation
                </p>
              </div>
              <Switch
                checked={config.allow_disagree}
                onCheckedChange={(checked) => updateConfig('allow_disagree', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Partial Disagree</Label>
                <p className="text-xs text-muted-foreground">
                  Employees can partially disagree
                </p>
              </div>
              <Switch
                checked={config.allow_partial_disagree}
                onCheckedChange={(checked) => updateConfig('allow_partial_disagree', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow HR Escalation</Label>
                <p className="text-xs text-muted-foreground">
                  Employees can escalate concerns to HR
                </p>
              </div>
              <Switch
                checked={config.allow_hr_escalation}
                onCheckedChange={(checked) => updateConfig('allow_hr_escalation', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Comments for Disagree</Label>
                <p className="text-xs text-muted-foreground">
                  Mandatory comments when disagreeing
                </p>
              </div>
              <Switch
                checked={config.require_comments_for_disagree}
                onCheckedChange={(checked) => updateConfig('require_comments_for_disagree', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Visibility Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visibility
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Response to Manager</Label>
                <p className="text-xs text-muted-foreground">
                  Managers can see employee responses
                </p>
              </div>
              <Switch
                checked={config.show_response_to_manager}
                onCheckedChange={(checked) => updateConfig('show_response_to_manager', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Manager Rebuttal</Label>
                <p className="text-xs text-muted-foreground">
                  Managers can respond to employee feedback
                </p>
              </div>
              <Switch
                checked={config.allow_manager_rebuttal}
                onCheckedChange={(checked) => updateConfig('allow_manager_rebuttal', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include in Permanent Record</Label>
                <p className="text-xs text-muted-foreground">
                  Store responses in employee file
                </p>
              </div>
              <Switch
                checked={config.include_in_permanent_record}
                onCheckedChange={(checked) => updateConfig('include_in_permanent_record', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notify HR on Disagreement</Label>
                <p className="text-xs text-muted-foreground">
                  Alert HR when employees disagree
                </p>
              </div>
              <Switch
                checked={config.notify_hr_on_disagreement}
                onCheckedChange={(checked) => updateConfig('notify_hr_on_disagreement', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notify HR on Escalation</Label>
                <p className="text-xs text-muted-foreground">
                  Alert HR when employees escalate
                </p>
              </div>
              <Switch
                checked={config.notify_hr_on_escalation}
                onCheckedChange={(checked) => updateConfig('notify_hr_on_escalation', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Escalate on Disagree</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically escalate all disagreements to HR
                </p>
              </div>
              <Switch
                checked={config.auto_escalate_on_disagree}
                onCheckedChange={(checked) => updateConfig('auto_escalate_on_disagree', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
