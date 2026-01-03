import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  UserCircle, 
  Shield, 
  Clock, 
  Bell,
  Eye,
  MessageSquare,
  BarChart3,
  Users
} from "lucide-react";

export interface AccessLevelConfig {
  enabled: boolean;
  show_scores: boolean;
  show_comments: boolean;
  show_reviewer_breakdown: boolean;
  release_trigger: 'immediate' | 'cycle_close' | 'manual';
}

export interface HrAccessConfig extends AccessLevelConfig {
  show_individual_responses: boolean;
}

export interface ReleaseSettings {
  auto_release_on_close: boolean;
  release_delay_days: number;
  require_hr_approval: boolean;
  notify_on_release: boolean;
}

export interface VisibilityRules {
  employee_access: AccessLevelConfig;
  manager_access: AccessLevelConfig;
  hr_access: HrAccessConfig;
  release_settings: ReleaseSettings;
}

export const DEFAULT_VISIBILITY_RULES: VisibilityRules = {
  employee_access: {
    enabled: true,
    show_scores: true,
    show_comments: true,
    show_reviewer_breakdown: false,
    release_trigger: 'cycle_close',
  },
  manager_access: {
    enabled: true,
    show_scores: true,
    show_comments: true,
    show_reviewer_breakdown: true,
    release_trigger: 'cycle_close',
  },
  hr_access: {
    enabled: true,
    show_scores: true,
    show_comments: true,
    show_reviewer_breakdown: true,
    show_individual_responses: true,
    release_trigger: 'immediate',
  },
  release_settings: {
    auto_release_on_close: false,
    release_delay_days: 0,
    require_hr_approval: true,
    notify_on_release: true,
  },
};

interface CycleVisibilityRulesEditorProps {
  value: VisibilityRules;
  onChange: (value: VisibilityRules) => void;
  disabled?: boolean;
}

export function CycleVisibilityRulesEditor({
  value,
  onChange,
  disabled = false,
}: CycleVisibilityRulesEditorProps) {
  const updateEmployeeAccess = (updates: Partial<AccessLevelConfig>) => {
    onChange({
      ...value,
      employee_access: { ...value.employee_access, ...updates },
    });
  };

  const updateManagerAccess = (updates: Partial<AccessLevelConfig>) => {
    onChange({
      ...value,
      manager_access: { ...value.manager_access, ...updates },
    });
  };

  const updateHrAccess = (updates: Partial<HrAccessConfig>) => {
    onChange({
      ...value,
      hr_access: { ...value.hr_access, ...updates },
    });
  };

  const updateReleaseSettings = (updates: Partial<ReleaseSettings>) => {
    onChange({
      ...value,
      release_settings: { ...value.release_settings, ...updates },
    });
  };

  return (
    <div className="space-y-6">
      {/* Access Level Cards */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Access Level Configuration
        </h4>
        
        {/* Employee Access */}
        <Card className={!value.employee_access.enabled ? "opacity-60" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Employee Access</CardTitle>
                  <CardDescription>What the reviewed employee can see</CardDescription>
                </div>
              </div>
              <Switch
                checked={value.employee_access.enabled}
                onCheckedChange={(checked) => updateEmployeeAccess({ enabled: checked })}
                disabled={disabled}
              />
            </div>
          </CardHeader>
          {value.employee_access.enabled && (
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Aggregate Scores</Label>
                  </div>
                  <Switch
                    checked={value.employee_access.show_scores}
                    onCheckedChange={(checked) => updateEmployeeAccess({ show_scores: checked })}
                    disabled={disabled}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Text Comments</Label>
                  </div>
                  <Switch
                    checked={value.employee_access.show_comments}
                    onCheckedChange={(checked) => updateEmployeeAccess({ show_comments: checked })}
                    disabled={disabled}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Breakdown by Reviewer Type</Label>
                  </div>
                  <Switch
                    checked={value.employee_access.show_reviewer_breakdown}
                    onCheckedChange={(checked) => updateEmployeeAccess({ show_reviewer_breakdown: checked })}
                    disabled={disabled}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Manager Access */}
        <Card className={!value.manager_access.enabled ? "opacity-60" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <UserCircle className="h-5 w-5 text-info" />
                </div>
                <div>
                  <CardTitle className="text-base">Manager Access</CardTitle>
                  <CardDescription>What the employee's manager can see</CardDescription>
                </div>
              </div>
              <Switch
                checked={value.manager_access.enabled}
                onCheckedChange={(checked) => updateManagerAccess({ enabled: checked })}
                disabled={disabled}
              />
            </div>
          </CardHeader>
          {value.manager_access.enabled && (
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Aggregate Scores</Label>
                  </div>
                  <Switch
                    checked={value.manager_access.show_scores}
                    onCheckedChange={(checked) => updateManagerAccess({ show_scores: checked })}
                    disabled={disabled}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Text Comments</Label>
                  </div>
                  <Switch
                    checked={value.manager_access.show_comments}
                    onCheckedChange={(checked) => updateManagerAccess({ show_comments: checked })}
                    disabled={disabled}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Breakdown by Reviewer Type</Label>
                  </div>
                  <Switch
                    checked={value.manager_access.show_reviewer_breakdown}
                    onCheckedChange={(checked) => updateManagerAccess({ show_reviewer_breakdown: checked })}
                    disabled={disabled}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* HR Access */}
        <Card className={!value.hr_access.enabled ? "opacity-60" : ""}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Shield className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-base">HR/Admin Access</CardTitle>
                  <CardDescription>What HR administrators can see</CardDescription>
                </div>
              </div>
              <Switch
                checked={value.hr_access.enabled}
                onCheckedChange={(checked) => updateHrAccess({ enabled: checked })}
                disabled={disabled}
              />
            </div>
          </CardHeader>
          {value.hr_access.enabled && (
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Aggregate Scores</Label>
                  </div>
                  <Switch
                    checked={value.hr_access.show_scores}
                    onCheckedChange={(checked) => updateHrAccess({ show_scores: checked })}
                    disabled={disabled}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Text Comments</Label>
                  </div>
                  <Switch
                    checked={value.hr_access.show_comments}
                    onCheckedChange={(checked) => updateHrAccess({ show_comments: checked })}
                    disabled={disabled}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Reviewer Breakdown</Label>
                  </div>
                  <Switch
                    checked={value.hr_access.show_reviewer_breakdown}
                    onCheckedChange={(checked) => updateHrAccess({ show_reviewer_breakdown: checked })}
                    disabled={disabled}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">Show Individual Responses</Label>
                  </div>
                  <Switch
                    checked={value.hr_access.show_individual_responses}
                    onCheckedChange={(checked) => updateHrAccess({ show_individual_responses: checked })}
                    disabled={disabled}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <Separator />

      {/* Release Timing */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Release Timing
        </h4>
        
        <RadioGroup
          value={value.release_settings.auto_release_on_close ? 
            (value.release_settings.release_delay_days > 0 ? 'delayed' : 'auto') : 
            'manual'
          }
          onValueChange={(val) => {
            if (val === 'auto') {
              updateReleaseSettings({ 
                auto_release_on_close: true, 
                release_delay_days: 0,
                require_hr_approval: false 
              });
            } else if (val === 'delayed') {
              updateReleaseSettings({ 
                auto_release_on_close: true, 
                release_delay_days: value.release_settings.release_delay_days || 3,
                require_hr_approval: false 
              });
            } else {
              updateReleaseSettings({ 
                auto_release_on_close: false, 
                release_delay_days: 0,
                require_hr_approval: true 
              });
            }
          }}
          disabled={disabled}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <RadioGroupItem value="auto" id="auto" />
            <div className="flex-1">
              <Label htmlFor="auto" className="font-medium cursor-pointer">
                Automatic on Cycle Close
              </Label>
              <p className="text-sm text-muted-foreground">
                Results are released immediately when the cycle ends
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <RadioGroupItem value="delayed" id="delayed" />
            <div className="flex-1">
              <Label htmlFor="delayed" className="font-medium cursor-pointer">
                Automatic with Delay
              </Label>
              <p className="text-sm text-muted-foreground">
                Results are released after a specified delay period
              </p>
              {value.release_settings.auto_release_on_close && value.release_settings.release_delay_days > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={value.release_settings.release_delay_days}
                    onChange={(e) => updateReleaseSettings({ release_delay_days: parseInt(e.target.value) || 0 })}
                    className="w-20"
                    disabled={disabled}
                  />
                  <span className="text-sm text-muted-foreground">days after cycle close</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
            <RadioGroupItem value="manual" id="manual" />
            <div className="flex-1">
              <Label htmlFor="manual" className="font-medium cursor-pointer">
                Manual Release
              </Label>
              <p className="text-sm text-muted-foreground">
                HR must explicitly release results after review
              </p>
            </div>
            <Badge variant="secondary">Recommended</Badge>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Notification Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </h4>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div>
            <Label className="text-sm font-medium">Notify on Results Release</Label>
            <p className="text-xs text-muted-foreground">
              Send email notifications when results become available
            </p>
          </div>
          <Switch
            checked={value.release_settings.notify_on_release}
            onCheckedChange={(checked) => updateReleaseSettings({ notify_on_release: checked })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
