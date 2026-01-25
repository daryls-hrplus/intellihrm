import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { useAvailabilityReasons, SuccessionAvailabilityReason } from '@/hooks/succession/useAvailabilityReasons';

interface AvailabilityReasonsConfigProps {
  companyId: string;
}

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
      is_active: true,
      sort_order: reasons.length + 1,
    });
    setDialogOpen(true);
  };

  const handleToggleActive = async (reason: SuccessionAvailabilityReason) => {
    await updateReason(reason.id, { is_active: !reason.is_active });
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
                <TableHead>Active</TableHead>
                <TableHead>Order</TableHead>
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
                  <TableCell>
                    <Switch
                      checked={reason.is_active}
                      onCheckedChange={() => handleToggleActive(reason)}
                    />
                  </TableCell>
                  <TableCell>{reason.sort_order}</TableCell>
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
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={editingReason?.code || ''}
                onChange={(e) => setEditingReason({ ...editingReason, code: e.target.value.toUpperCase() })}
                placeholder="e.g., RET"
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                Short code (max 5 characters)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={editingReason?.description || ''}
                onChange={(e) => setEditingReason({ ...editingReason, description: e.target.value })}
                placeholder="e.g., Retirement"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Available for selection in succession plans
                </p>
              </div>
              <Switch
                checked={editingReason?.is_active !== false}
                onCheckedChange={(v) => setEditingReason({ ...editingReason, is_active: v })}
              />
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
