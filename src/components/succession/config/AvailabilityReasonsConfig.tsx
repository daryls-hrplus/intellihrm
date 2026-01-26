import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { useAvailabilityReasons, SuccessionAvailabilityReason } from '@/hooks/succession/useAvailabilityReasons';

interface AvailabilityReasonsConfigProps {
  companyId: string;
}

const CATEGORY_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'unplanned', label: 'Unplanned' },
  { value: 'either', label: 'Either' },
];

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
];

export function AvailabilityReasonsConfig({ companyId }: AvailabilityReasonsConfigProps) {
  const {
    loading,
    reasons,
    fetchReasons,
    createReason,
    updateReason,
    deleteReason,
    seedDefaultReasons,
  } = useAvailabilityReasons(companyId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<Partial<SuccessionAvailabilityReason> | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchReasons();
    }
  }, [companyId]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    await seedDefaultReasons();
    setSeeding(false);
  };

  const handleSave = async () => {
    if (!editingReason) return;
    
    if (editingReason.id) {
      await updateReason(editingReason.id, editingReason);
    } else {
      await createReason(editingReason);
    }
    setDialogOpen(false);
    setEditingReason(null);
  };

  const handleEdit = (reason: SuccessionAvailabilityReason) => {
    setEditingReason(reason);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingReason({
      code: '',
      description: '',
      category: 'planned',
      urgency_level: 'medium',
      typical_notice_months: null,
      is_active: true,
      sort_order: reasons.length + 1,
    });
    setDialogOpen(true);
  };

  const handleToggleActive = async (reason: SuccessionAvailabilityReason) => {
    await updateReason(reason.id, { is_active: !reason.is_active });
  };

  const getUrgencyBadge = (level: string) => {
    const option = URGENCY_OPTIONS.find(o => o.value === level);
    return option ? (
      <Badge className={`${option.color} text-white`}>{option.label}</Badge>
    ) : (
      <Badge variant="secondary">{level}</Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'planned':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Planned</Badge>;
      case 'unplanned':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">Unplanned</Badge>;
      case 'either':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Either</Badge>;
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  if (loading && reasons.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reasons.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <p className="text-muted-foreground mb-4">No availability reasons configured</p>
          <Button onClick={handleSeedDefaults} disabled={seeding}>
            {seeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <RefreshCw className="mr-2 h-4 w-4" />
            Initialize Default Reasons
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Reason
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Notice</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reasons.map((reason) => (
                <TableRow key={reason.id}>
                  <TableCell>
                    <Badge variant="outline">{reason.code}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{reason.description}</TableCell>
                  <TableCell>{getCategoryBadge(reason.category)}</TableCell>
                  <TableCell>{getUrgencyBadge(reason.urgency_level)}</TableCell>
                  <TableCell>
                    {reason.typical_notice_months != null 
                      ? `${reason.typical_notice_months} mo` 
                      : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={reason.is_active}
                      onCheckedChange={() => handleToggleActive(reason)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(reason)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteReason(reason.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReason?.id ? 'Edit' : 'Add'} Availability Reason
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={editingReason?.code || ''}
                  onChange={(e) => setEditingReason({ ...editingReason, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., RET"
                  maxLength={5}
                />
                <p className="text-xs text-muted-foreground">
                  Short code (max 5 chars)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={editingReason?.sort_order || 1}
                  onChange={(e) => setEditingReason({ ...editingReason, sort_order: parseInt(e.target.value) })}
                  min={1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editingReason?.description || ''}
                onChange={(e) => setEditingReason({ ...editingReason, description: e.target.value })}
                placeholder="e.g., Retirement"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editingReason?.category || 'planned'}
                  onValueChange={(v) => setEditingReason({ ...editingReason, category: v as 'planned' | 'unplanned' | 'either' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <Select
                  value={editingReason?.urgency_level || 'medium'}
                  onValueChange={(v) => setEditingReason({ ...editingReason, urgency_level: v as 'low' | 'medium' | 'high' | 'critical' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typical Notice (months)</Label>
                <Input
                  type="number"
                  value={editingReason?.typical_notice_months ?? ''}
                  onChange={(e) => setEditingReason({ ...editingReason, typical_notice_months: e.target.value ? parseInt(e.target.value) : null })}
                  min={0}
                  max={36}
                  placeholder="e.g., 12"
                />
                <p className="text-xs text-muted-foreground">
                  Expected lead time (0-36 months)
                </p>
              </div>
              <div className="flex items-center justify-between pt-6">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Available for selection
                  </p>
                </div>
                <Switch
                  checked={editingReason?.is_active !== false}
                  onCheckedChange={(v) => setEditingReason({ ...editingReason, is_active: v })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!editingReason?.code || !editingReason?.description}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
