import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  Users, 
  Calendar, 
  Briefcase,
  Settings,
  Loader2,
  Info,
  Save
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VisibilityConfig {
  id: string;
  field_name: string;
  field_label: string;
  visibility_mode: 'all' | 'role_based' | 'grade_based' | 'none';
  visible_to_all_hr: boolean;
  visible_to_managers: boolean;
  allow_employee_opt_out: boolean;
  opt_out_default: boolean;
  is_active: boolean;
  min_visible_grade_id?: string | null;
}

interface SalaryGrade {
  id: string;
  name: string;
  code: string;
  grade_order: number;
}

const FIELD_ICONS: Record<string, React.ElementType> = {
  work_phone: Phone,
  work_mobile: Phone,
  extension: Phone,
  personal_email: Mail,
  manager: Users,
  hire_date: Calendar,
  employment_type: Briefcase,
  employment_status: Briefcase,
};

const VISIBILITY_MODE_LABELS = {
  all: { label: "Everyone", description: "Visible to all employees" },
  role_based: { label: "Role-Based", description: "Visible based on user roles" },
  grade_based: { label: "Grade-Based", description: "Visible based on job grade" },
  none: { label: "Hidden", description: "Not visible in directory" },
};

export default function DirectoryPrivacyConfigPage() {
  const { t } = useLanguage();
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const [editedConfigs, setEditedConfigs] = useState<Record<string, Partial<VisibilityConfig>>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch visibility configurations
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["directory-visibility-config", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("directory_visibility_config")
        .select("*")
        .order("field_name");
      if (error) throw error;
      return (data || []) as VisibilityConfig[];
    },
  });

  // Fetch salary grades for grade-based visibility
  const { data: salaryGrades = [] } = useQuery({
    queryKey: ["salary-grades-for-visibility", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_grades")
        .select("id, name, code, grade_order")
        .eq("is_active", true)
        .order("grade_order", { ascending: true });
      if (error) throw error;
      return (data || []) as SalaryGrade[];
    },
    enabled: !!company?.id,
  });

  // Initialize edited configs when data loads
  useEffect(() => {
    if (configs.length > 0 && Object.keys(editedConfigs).length === 0) {
      const initial: Record<string, Partial<VisibilityConfig>> = {};
      configs.forEach(config => {
        initial[config.id] = { ...config };
      });
      setEditedConfigs(initial);
    }
  }, [configs]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(editedConfigs).map(async ([id, config]) => {
        const { error } = await supabase
          .from("directory_visibility_config")
          .update({
            visibility_mode: config.visibility_mode,
            visible_to_all_hr: config.visible_to_all_hr,
            visible_to_managers: config.visible_to_managers,
            allow_employee_opt_out: config.allow_employee_opt_out,
            opt_out_default: config.opt_out_default,
            is_active: config.is_active,
            min_visible_grade_id: config.visibility_mode === 'grade_based' 
              ? config.min_visible_grade_id 
              : null,
          })
          .eq("id", id);
        if (error) throw error;
      });
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directory-visibility-config"] });
      toast.success("Directory privacy settings saved");
      setHasChanges(false);
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    },
  });

  const updateConfig = (id: string, updates: Partial<VisibilityConfig>) => {
    setEditedConfigs(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
    setHasChanges(true);
  };

  const getConfig = (id: string): Partial<VisibilityConfig> => {
    return editedConfigs[id] || {};
  };

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: "Directory Privacy Settings" },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Directory Privacy Settings</h1>
            <p className="text-muted-foreground">
              Configure which employee information is visible in the Employee Directory
            </p>
          </div>
          <Button 
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            These settings control what contact information is visible in the Employee Directory. 
            HR users and administrators can always see all information regardless of these settings.
          </AlertDescription>
        </Alert>

        {/* Field Visibility Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Field Visibility Rules</CardTitle>
            </div>
            <CardDescription>
              Configure visibility mode, role-based access, and employee opt-out options for each field
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {configs.map((config) => {
              const Icon = FIELD_ICONS[config.field_name] || Settings;
              const editedConfig = getConfig(config.id);
              const visibilityMode = (editedConfig.visibility_mode || config.visibility_mode) as keyof typeof VISIBILITY_MODE_LABELS;

              return (
                <div key={config.id} className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-medium">{config.field_label}</Label>
                          {(editedConfig.is_active ?? config.is_active) ? (
                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                              <Eye className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {VISIBILITY_MODE_LABELS[visibilityMode]?.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={editedConfig.is_active ?? config.is_active}
                      onCheckedChange={(checked) => updateConfig(config.id, { is_active: checked })}
                    />
                  </div>

                  {(editedConfig.is_active ?? config.is_active) && (
                    <div className="ml-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      {/* Visibility Mode */}
                      <div className="space-y-2">
                        <Label className="text-sm">Visibility Mode</Label>
                        <Select
                          value={editedConfig.visibility_mode || config.visibility_mode}
                          onValueChange={(value) => updateConfig(config.id, { 
                            visibility_mode: value as VisibilityConfig['visibility_mode'] 
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Everyone</SelectItem>
                            <SelectItem value="role_based">Role-Based</SelectItem>
                            <SelectItem value="grade_based">Grade-Based</SelectItem>
                            <SelectItem value="none">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* HR Access */}
                      {visibilityMode === 'role_based' && (
                        <div className="space-y-2">
                          <Label className="text-sm">HR Access</Label>
                          <div className="flex items-center space-x-2 h-10">
                            <Switch
                              id={`hr-${config.id}`}
                              checked={editedConfig.visible_to_all_hr ?? config.visible_to_all_hr}
                              onCheckedChange={(checked) => updateConfig(config.id, { visible_to_all_hr: checked })}
                            />
                            <Label htmlFor={`hr-${config.id}`} className="text-sm text-muted-foreground">
                              Visible to HR
                            </Label>
                          </div>
                        </div>
                      )}

                      {/* Manager Access */}
                      {visibilityMode === 'role_based' && (
                        <div className="space-y-2">
                          <Label className="text-sm">Manager Access</Label>
                          <div className="flex items-center space-x-2 h-10">
                            <Switch
                              id={`manager-${config.id}`}
                              checked={editedConfig.visible_to_managers ?? config.visible_to_managers}
                              onCheckedChange={(checked) => updateConfig(config.id, { visible_to_managers: checked })}
                            />
                            <Label htmlFor={`manager-${config.id}`} className="text-sm text-muted-foreground">
                              Visible to Managers
                            </Label>
                          </div>
                        </div>
                      )}

                      {/* Minimum Grade - Only for grade_based */}
                      {visibilityMode === 'grade_based' && (
                        <div className="space-y-2 col-span-2">
                          <Label className="text-sm">Minimum Grade to View</Label>
                          <Select
                            value={editedConfig.min_visible_grade_id ?? config.min_visible_grade_id ?? '__none__'}
                            onValueChange={(value) => updateConfig(config.id, { 
                              min_visible_grade_id: value === '__none__' ? null : value 
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select minimum grade..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">No minimum (visible to all)</SelectItem>
                              {salaryGrades.map(grade => (
                                <SelectItem key={grade.id} value={grade.id}>
                                  {grade.name} ({grade.code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Employees at this grade or higher can view this field
                          </p>
                        </div>
                      )}

                      {/* Employee Opt-Out */}
                      <div className="space-y-2">
                        <Label className="text-sm">Employee Opt-Out</Label>
                        <div className="flex items-center space-x-2 h-10">
                          <Switch
                            id={`optout-${config.id}`}
                            checked={editedConfig.allow_employee_opt_out ?? config.allow_employee_opt_out}
                            onCheckedChange={(checked) => updateConfig(config.id, { allow_employee_opt_out: checked })}
                          />
                          <Label htmlFor={`optout-${config.id}`} className="text-sm text-muted-foreground">
                            Allow Opt-Out
                          </Label>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration Preview</CardTitle>
            <CardDescription>
              Summary of current visibility settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {configs.filter(c => (editedConfigs[c.id]?.is_active ?? c.is_active) && 
                    (editedConfigs[c.id]?.visibility_mode ?? c.visibility_mode) === 'all').length}
                </div>
                <div className="text-sm text-muted-foreground">Visible to Everyone</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {configs.filter(c => (editedConfigs[c.id]?.is_active ?? c.is_active) && 
                    (editedConfigs[c.id]?.visibility_mode ?? c.visibility_mode) === 'role_based').length}
                </div>
                <div className="text-sm text-muted-foreground">Role-Based</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">
                  {configs.filter(c => (editedConfigs[c.id]?.allow_employee_opt_out ?? c.allow_employee_opt_out)).length}
                </div>
                <div className="text-sm text-muted-foreground">Allow Opt-Out</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-muted-foreground">
                  {configs.filter(c => !(editedConfigs[c.id]?.is_active ?? c.is_active) || 
                    (editedConfigs[c.id]?.visibility_mode ?? c.visibility_mode) === 'none').length}
                </div>
                <div className="text-sm text-muted-foreground">Hidden</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
