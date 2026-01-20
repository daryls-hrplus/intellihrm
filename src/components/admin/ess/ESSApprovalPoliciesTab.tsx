import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useESSApprovalPolicies, ApprovalMode, PolicyFormData } from "@/hooks/useESSApprovalPolicy";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Edit, Loader2, Info, Sparkles, UserCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const REQUEST_TYPES = [
  { value: 'emergency_contact', label: 'Emergency Contact', risk: 'low' },
  { value: 'address', label: 'Address', risk: 'low' },
  { value: 'medical_info', label: 'Medical Information', risk: 'low' },
  { value: 'personal_contact', label: 'Personal Contact (Phone, Email)', risk: 'medium' },
  { value: 'qualification', label: 'Qualification / Certification', risk: 'medium' },
  { value: 'dependent', label: 'Dependents', risk: 'medium' },
  { value: 'marital_status', label: 'Marital Status', risk: 'medium' },
  { value: 'government_id', label: 'Government IDs', risk: 'medium' },
  { value: 'name_change', label: 'Name Change', risk: 'medium' },
  { value: 'banking', label: 'Banking Details', risk: 'high' },
];

const APPROVAL_MODES: { value: ApprovalMode; label: string; description: string }[] = [
  { value: 'auto_approve', label: 'Auto-Approve', description: 'Changes are applied immediately without review' },
  { value: 'manager_review', label: 'Manager Review', description: 'Changes require direct manager approval' },
  { value: 'hr_review', label: 'HR Review', description: 'Changes require HR approval before being applied' },
  { value: 'workflow', label: 'Workflow', description: 'Changes go through a configured workflow process' },
];

interface ESSApprovalPoliciesTabProps {
  companyId?: string | null;
}

export function ESSApprovalPoliciesTab({ companyId }: ESSApprovalPoliciesTabProps) {
  const { policies, isLoading, createPolicy, updatePolicy, deletePolicy, seedDefaultPolicies, hasNoPolicies } = useESSApprovalPolicies(companyId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [formData, setFormData] = useState<PolicyFormData>({
    request_type: '',
    approval_mode: 'hr_review',
    notification_only: false,
    requires_documentation: false,
    is_active: true,
  });

  const handleOpenDialog = (policyId?: string) => {
    if (policyId) {
      const policy = policies?.find(p => p.id === policyId);
      if (policy) {
        setEditingPolicy(policyId);
        setFormData({
          request_type: policy.request_type,
          approval_mode: policy.approval_mode as ApprovalMode,
          notification_only: policy.notification_only,
          requires_documentation: policy.requires_documentation,
          is_active: policy.is_active,
          workflow_template_id: policy.workflow_template_id,
        });
      }
    } else {
      setEditingPolicy(null);
      setFormData({
        request_type: '',
        approval_mode: 'hr_review',
        notification_only: false,
        requires_documentation: false,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.request_type) return;
    
    if (editingPolicy) {
      await updatePolicy.mutateAsync({ id: editingPolicy, ...formData });
    } else {
      await createPolicy.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      await deletePolicy.mutateAsync(id);
    }
  };

  const handleToggleActive = async (id: string, currentValue: boolean) => {
    await updatePolicy.mutateAsync({ id, is_active: !currentValue });
  };

  const getApprovalModeBadge = (mode: string, notificationOnly: boolean) => {
    if (mode === 'auto_approve') {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Auto-Approve
          </Badge>
          {notificationOnly && (
            <Badge variant="outline" className="text-xs">Notify HR</Badge>
          )}
        </div>
      );
    } else if (mode === 'manager_review') {
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          <UserCheck className="h-3 w-3 mr-1" />
          Manager Review
        </Badge>
      );
    } else if (mode === 'workflow') {
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Workflow</Badge>;
    }
    return <Badge variant="default">HR Review</Badge>;
  };

  const getRequestTypeLabel = (type: string) => {
    return REQUEST_TYPES.find(rt => rt.value === type)?.label || type;
  };

  const getRiskBadge = (type: string) => {
    const requestType = REQUEST_TYPES.find(rt => rt.value === type);
    if (!requestType) return null;
    
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-amber-100 text-amber-700',
      high: 'bg-red-100 text-red-700',
    };
    
    return (
      <Badge variant="outline" className={colors[requestType.risk as keyof typeof colors]}>
        {requestType.risk.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure how employee self-service changes are approved. Different data types can have different approval requirements based on risk level.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {/* Seed Default Policies CTA */}
      {hasNoPolicies && (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Sparkles className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Policies Configured</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Start with industry-standard defaults that you can customize later. Low-risk changes auto-approve while high-risk changes require workflow approval.
            </p>
            <Button onClick={() => seedDefaultPolicies.mutateAsync()} disabled={seedDefaultPolicies.isPending}>
              {seedDefaultPolicies.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Default Policies
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Policies Table */}
      {!hasNoPolicies && (
        <Card>
          <CardHeader>
            <CardTitle>Configured Policies</CardTitle>
            <CardDescription>Define approval requirements for each type of employee self-service request</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Approval Mode</TableHead>
                    <TableHead>Documentation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies?.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">
                        {getRequestTypeLabel(policy.request_type)}
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(policy.request_type)}
                      </TableCell>
                      <TableCell>
                        {getApprovalModeBadge(policy.approval_mode, policy.notification_only)}
                      </TableCell>
                      <TableCell>
                        {policy.requires_documentation ? (
                          <Badge variant="outline">Required</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Optional</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={policy.is_active}
                          onCheckedChange={() => handleToggleActive(policy.id, policy.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(policy.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(policy.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? "Edit Policy" : "Add Policy"}
            </DialogTitle>
            <DialogDescription>
              Configure how this type of self-service request should be processed
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select
                value={formData.request_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, request_type: value }))}
                disabled={!!editingPolicy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select request type..." />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Approval Mode</Label>
              <Select
                value={formData.approval_mode}
                onValueChange={(value) => setFormData(prev => ({ ...prev, approval_mode: value as ApprovalMode }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPROVAL_MODES.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div>
                        <div className="font-medium">{mode.label}</div>
                        <div className="text-xs text-muted-foreground">{mode.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.approval_mode === 'auto_approve' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notification_only"
                  checked={formData.notification_only}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notification_only: !!checked }))}
                />
                <Label htmlFor="notification_only" className="text-sm">
                  Send notification to HR (changes still auto-apply)
                </Label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requires_documentation"
                checked={formData.requires_documentation}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_documentation: !!checked }))}
              />
              <Label htmlFor="requires_documentation" className="text-sm">
                Require supporting documentation
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!formData.request_type || createPolicy.isPending || updatePolicy.isPending}
            >
              {(createPolicy.isPending || updatePolicy.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingPolicy ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
