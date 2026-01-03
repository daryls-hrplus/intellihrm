import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  useRoutingPolicies,
  useManageRoutingPolicy,
  useDeleteRoutingPolicy,
  SOURCE_TYPES,
  TARGET_MODULES,
  type RoutingPolicy,
} from '@/hooks/feedback/useRoutingPolicies';

interface RoutingPolicyManagerProps {
  companyId: string;
}

export function RoutingPolicyManager({ companyId }: RoutingPolicyManagerProps) {
  const { data: policies, isLoading } = useRoutingPolicies(companyId);
  const manageMutation = useManageRoutingPolicy();
  const deleteMutation = useDeleteRoutingPolicy();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Partial<RoutingPolicy> | null>(null);

  const handleSave = () => {
    if (!editingPolicy) return;
    manageMutation.mutate(
      { ...editingPolicy, company_id: companyId } as RoutingPolicy,
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingPolicy(null);
        },
      }
    );
  };

  const handleToggleEnabled = (policy: RoutingPolicy) => {
    manageMutation.mutate({
      ...policy,
      is_enabled: !policy.is_enabled,
    });
  };

  const getSourceLabel = (value: string) =>
    SOURCE_TYPES.find(s => s.value === value)?.label || value;

  const getTargetLabel = (value: string) =>
    TARGET_MODULES.find(t => t.value === value)?.label || value;

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Signal Routing Policies
          </CardTitle>
          <CardDescription>
            Configure how talent signals flow between modules
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setEditingPolicy({ is_enabled: true, visibility_delay_days: 0, require_release: true, min_completion_rate: 0.7 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPolicy?.id ? 'Edit' : 'Add'} Routing Policy</DialogTitle>
              <DialogDescription>
                Define how signals from a source route to a target module.
              </DialogDescription>
            </DialogHeader>
            {editingPolicy && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Source Type</Label>
                  <Select
                    value={editingPolicy.source_type || ''}
                    onValueChange={(v) => setEditingPolicy({ ...editingPolicy, source_type: v })}
                    disabled={!!editingPolicy.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_TYPES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Module</Label>
                  <Select
                    value={editingPolicy.target_module || ''}
                    onValueChange={(v) => setEditingPolicy({ ...editingPolicy, target_module: v })}
                    disabled={!!editingPolicy.id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_MODULES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visibility Delay (days)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingPolicy.visibility_delay_days || 0}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, visibility_delay_days: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Completion Rate</Label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={editingPolicy.min_completion_rate || 0.7}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, min_completion_rate: parseFloat(e.target.value) || 0.7 })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Release</Label>
                  <Switch
                    checked={editingPolicy.require_release ?? true}
                    onCheckedChange={(v) => setEditingPolicy({ ...editingPolicy, require_release: v })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={manageMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {policies && policies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Min Rate</TableHead>
                <TableHead>Release Req.</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <Badge variant="outline">{getSourceLabel(policy.source_type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getTargetLabel(policy.target_module)}</Badge>
                  </TableCell>
                  <TableCell>{policy.visibility_delay_days} days</TableCell>
                  <TableCell>{Math.round(policy.min_completion_rate * 100)}%</TableCell>
                  <TableCell>{policy.require_release ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={policy.is_enabled}
                      onCheckedChange={() => handleToggleEnabled(policy)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(policy.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No routing policies configured. Add one to control signal flow.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
