import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useESSFieldPermissions, DEFAULT_FIELD_DEFINITIONS, FieldApprovalMode } from "@/hooks/useESSFieldPermissions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Info, Sparkles, Eye, Edit2, ShieldCheck, UserCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MODULES_WITH_FIELDS = [
  { code: 'personal-info', label: 'Personal Information' },
  { code: 'banking', label: 'Banking' },
  { code: 'dependents', label: 'Dependents' },
  { code: 'qualifications', label: 'Qualifications' },
  { code: 'government-ids', label: 'Government IDs' },
];

const APPROVAL_MODE_OPTIONS: { value: FieldApprovalMode; label: string }[] = [
  { value: 'auto_approve', label: 'Auto-Approve' },
  { value: 'manager_review', label: 'Manager Review' },
  { value: 'hr_review', label: 'HR Review' },
  { value: 'workflow', label: 'Workflow' },
];

export function ESSFieldPermissionsTab() {
  const [selectedModule, setSelectedModule] = useState<string>('personal-info');
  const { 
    permissions, 
    isLoading, 
    updatePermission, 
    seedDefaultPermissions,
    hasNoPermissions 
  } = useESSFieldPermissions(selectedModule);

  const handleToggleView = async (id: string, currentValue: boolean) => {
    await updatePermission.mutateAsync({ id, can_view: !currentValue });
  };

  const handleToggleEdit = async (id: string, currentValue: boolean) => {
    await updatePermission.mutateAsync({ id, can_edit: !currentValue });
  };

  const handleToggleApproval = async (id: string, currentValue: boolean) => {
    await updatePermission.mutateAsync({ id, requires_approval: !currentValue });
  };

  const handleApprovalModeChange = async (id: string, mode: FieldApprovalMode) => {
    await updatePermission.mutateAsync({ id, approval_mode: mode });
  };

  const getApprovalModeBadge = (mode: FieldApprovalMode) => {
    const badges = {
      auto_approve: <Badge variant="secondary" className="bg-green-100 text-green-700">Auto</Badge>,
      manager_review: <Badge className="bg-blue-100 text-blue-700"><UserCheck className="h-3 w-3 mr-1" />Manager</Badge>,
      hr_review: <Badge variant="default">HR</Badge>,
      workflow: <Badge className="bg-purple-100 text-purple-700">Workflow</Badge>,
    };
    return badges[mode] || badges.hr_review;
  };

  const currentModulePermissions = permissions.filter(p => p.module_code === selectedModule);
  const hasPermissionsForModule = currentModulePermissions.length > 0;
  const hasDefaultFields = !!DEFAULT_FIELD_DEFINITIONS[selectedModule];

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure which fields employees can view and edit in self-service. Field-level permissions give you granular control over what data employees can modify.
        </AlertDescription>
      </Alert>

      {/* Module Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Field Permissions by Module</CardTitle>
          <CardDescription>Select a module to configure its field-level permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedModule} onValueChange={setSelectedModule}>
            <TabsList className="grid w-full grid-cols-5">
              {MODULES_WITH_FIELDS.map(module => (
                <TabsTrigger key={module.code} value={module.code}>
                  {module.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {MODULES_WITH_FIELDS.map(module => (
              <TabsContent key={module.code} value={module.code} className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !hasPermissionsForModule ? (
                  <Card className="border-dashed border-2 bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <Sparkles className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Field Permissions Configured</h3>
                      <p className="text-muted-foreground text-center mb-4 max-w-md">
                        {hasDefaultFields 
                          ? "Start with industry-standard defaults that you can customize. Sensitive fields will require approval while basic fields auto-approve."
                          : "No default field definitions available for this module. You can add custom fields manually."
                        }
                      </p>
                      {hasDefaultFields && (
                        <Button 
                          onClick={() => seedDefaultPermissions.mutateAsync(module.code)} 
                          disabled={seedDefaultPermissions.isPending}
                        >
                          {seedDefaultPermissions.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Create Default Permissions
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead className="w-[100px] text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="h-4 w-4" />
                            Can View
                          </div>
                        </TableHead>
                        <TableHead className="w-[100px] text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Edit2 className="h-4 w-4" />
                            Can Edit
                          </div>
                        </TableHead>
                        <TableHead className="w-[120px] text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ShieldCheck className="h-4 w-4" />
                            Approval
                          </div>
                        </TableHead>
                        <TableHead className="w-[150px]">Approval Mode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentModulePermissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="font-medium">
                            {permission.field_label}
                            <p className="text-xs text-muted-foreground">{permission.field_name}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.can_view}
                              onCheckedChange={() => handleToggleView(permission.id, permission.can_view)}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.can_edit}
                              onCheckedChange={() => handleToggleEdit(permission.id, permission.can_edit)}
                              disabled={!permission.can_view}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={permission.requires_approval}
                              onCheckedChange={() => handleToggleApproval(permission.id, permission.requires_approval)}
                              disabled={!permission.can_edit}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={permission.approval_mode}
                              onValueChange={(value) => handleApprovalModeChange(permission.id, value as FieldApprovalMode)}
                              disabled={!permission.requires_approval}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {APPROVAL_MODE_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Explanation Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Field Permission Levels</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Eye className="h-4 w-4 mt-0.5 text-blue-500" />
              <span><strong>Can View:</strong> Employee can see this field in their profile</span>
            </li>
            <li className="flex items-start gap-2">
              <Edit2 className="h-4 w-4 mt-0.5 text-green-500" />
              <span><strong>Can Edit:</strong> Employee can modify this field (requires Can View)</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 mt-0.5 text-amber-500" />
              <span><strong>Requires Approval:</strong> Changes need approval before taking effect</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
