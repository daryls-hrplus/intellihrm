import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Users, Building2, Globe, Lock, UserPlus, Pencil, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VisibilitySettings {
  id?: string;
  goal_id: string;
  visibility_scope: 'owner_only' | 'team' | 'department' | 'company' | 'custom';
  can_view_roles: string[];
  can_edit_roles: string[];
  custom_viewer_ids: string[];
  custom_editor_ids: string[];
  inherit_from_parent: boolean;
}

interface GoalVisibilitySettingsProps {
  goalId: string;
  onSave?: () => void;
}

const VISIBILITY_SCOPES = [
  { value: 'owner_only', label: 'Owner Only', icon: Lock, description: 'Only goal owner can view' },
  { value: 'team', label: 'Team', icon: Users, description: 'Manager and team members can view' },
  { value: 'department', label: 'Department', icon: Building2, description: 'All department members can view' },
  { value: 'company', label: 'Company-Wide', icon: Globe, description: 'Everyone in the company can view' },
  { value: 'custom', label: 'Custom', icon: UserPlus, description: 'Specific roles and users' },
];

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
];

export function GoalVisibilitySettings({ goalId, onSave }: GoalVisibilitySettingsProps) {
  const [settings, setSettings] = useState<VisibilitySettings>({
    goal_id: goalId,
    visibility_scope: 'owner_only',
    can_view_roles: [],
    can_edit_roles: [],
    custom_viewer_ids: [],
    custom_editor_ids: [],
    inherit_from_parent: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [goalId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('goal_visibility_rules')
        .select('*')
        .eq('goal_id', goalId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          ...data,
          can_view_roles: data.can_view_roles || [],
          can_edit_roles: data.can_edit_roles || [],
          custom_viewer_ids: data.custom_viewer_ids || [],
          custom_editor_ids: data.custom_editor_ids || [],
        });
      }
    } catch (error) {
      console.error('Error fetching visibility settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScopeChange = (scope: VisibilitySettings['visibility_scope']) => {
    setSettings(prev => ({ ...prev, visibility_scope: scope }));
    setHasChanges(true);
  };

  const handleRoleToggle = (role: string, type: 'view' | 'edit') => {
    const key = type === 'view' ? 'can_view_roles' : 'can_edit_roles';
    setSettings(prev => {
      const currentRoles = prev[key];
      const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];
      return { ...prev, [key]: newRoles };
    });
    setHasChanges(true);
  };

  const handleInheritToggle = (checked: boolean) => {
    setSettings(prev => ({ ...prev, inherit_from_parent: checked }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, ...settingsData } = settings;

      if (id) {
        // Update existing
        const { error } = await supabase
          .from('goal_visibility_rules')
          .update(settingsData)
          .eq('id', id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('goal_visibility_rules')
          .insert(settingsData);

        if (error) throw error;
      }

      toast.success('Visibility settings saved');
      setHasChanges(false);
      onSave?.();
    } catch (error) {
      console.error('Error saving visibility settings:', error);
      toast.error('Failed to save visibility settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground text-sm">Loading visibility settings...</div>;
  }

  const CurrentIcon = VISIBILITY_SCOPES.find(s => s.value === settings.visibility_scope)?.icon || Lock;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5" />
              Visibility Settings
            </CardTitle>
            <CardDescription className="mt-1">
              Control who can view and edit this goal
            </CardDescription>
          </div>
          {hasChanges && (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visibility Scope */}
        <div className="space-y-3">
          <Label>Visibility Scope</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {VISIBILITY_SCOPES.map(scope => {
              const Icon = scope.icon;
              const isSelected = settings.visibility_scope === scope.value;
              
              return (
                <button
                  key={scope.value}
                  onClick={() => handleScopeChange(scope.value as VisibilitySettings['visibility_scope'])}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {scope.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {scope.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inherit from Parent */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label>Inherit from Parent Goal</Label>
            <p className="text-sm text-muted-foreground">
              Apply parent goal's visibility settings to this goal
            </p>
          </div>
          <Switch
            checked={settings.inherit_from_parent}
            onCheckedChange={handleInheritToggle}
          />
        </div>

        {/* Role-based Permissions */}
        {settings.visibility_scope === 'custom' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Access by Role
              </Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ROLES.map(role => {
                  const isChecked = settings.can_view_roles.includes(role.value);
                  return (
                    <label
                      key={role.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleRoleToggle(role.value, 'view')}
                      />
                      <span className="text-sm">{role.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit Access by Role
              </Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ROLES.map(role => {
                  const isChecked = settings.can_edit_roles.includes(role.value);
                  return (
                    <label
                      key={role.value}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleRoleToggle(role.value, 'edit')}
                      />
                      <span className="text-sm">{role.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Current Visibility Summary */}
        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <CurrentIcon className="h-4 w-4" />
            Current Visibility
          </h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Scope: {VISIBILITY_SCOPES.find(s => s.value === settings.visibility_scope)?.label}
            </Badge>
            {settings.inherit_from_parent && (
              <Badge variant="secondary">Inherits from Parent</Badge>
            )}
            {settings.can_view_roles.length > 0 && (
              <Badge variant="outline" className="text-primary">
                {settings.can_view_roles.length} Role(s) can view
              </Badge>
            )}
            {settings.can_edit_roles.length > 0 && (
              <Badge variant="outline" className="text-success">
                {settings.can_edit_roles.length} Role(s) can edit
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
