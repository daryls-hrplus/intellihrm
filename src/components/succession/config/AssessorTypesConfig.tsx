import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, RefreshCw, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuccessionAssessorTypes, SuccessionAssessorType } from '@/hooks/succession/useSuccessionAssessorTypes';

interface AssessorTypesConfigProps {
  companyId: string;
}

export function AssessorTypesConfig({ companyId }: AssessorTypesConfigProps) {
  const {
    loading,
    assessorTypes,
    fetchAssessorTypes,
    createAssessorType,
    updateAssessorType,
    deleteAssessorType,
    seedDefaultTypes,
  } = useSuccessionAssessorTypes(companyId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<Partial<SuccessionAssessorType> | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchAssessorTypes();
    }
  }, [companyId]);

  const handleSeedDefaults = async () => {
    setSeeding(true);
    await seedDefaultTypes();
    setSeeding(false);
  };

  const handleSave = async () => {
    if (!editingType) return;
    
    if (editingType.id) {
      await updateAssessorType(editingType.id, editingType);
    } else {
      await createAssessorType(editingType);
    }
    setDialogOpen(false);
    setEditingType(null);
  };

  const handleEdit = (type: SuccessionAssessorType) => {
    setEditingType(type);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingType({
      type_code: '',
      type_label: '',
      is_required: false,
      is_enabled: true,
      sort_order: assessorTypes.length + 1,
    });
    setDialogOpen(true);
  };

  const handleToggleEnabled = async (type: SuccessionAssessorType) => {
    await updateAssessorType(type.id, { is_enabled: !type.is_enabled });
  };

  const handleToggleRequired = async (type: SuccessionAssessorType) => {
    await updateAssessorType(type.id, { is_required: !type.is_required });
  };

  if (loading && assessorTypes.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Industry Standard:</strong> Manager is typically required, HR is optional, 
          and Executive is optional (only for senior leadership positions). 
          Per industry best practice, executive reviews are often handled through calibration sessions 
          rather than individual assessment forms.
        </AlertDescription>
      </Alert>

      {assessorTypes.length === 0 ? (
        <div className="text-center py-8 border rounded-lg border-dashed">
          <p className="text-muted-foreground mb-4">No assessor types configured</p>
          <Button onClick={handleSeedDefaults} disabled={seeding}>
            {seeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <RefreshCw className="mr-2 h-4 w-4" />
            Initialize Default Types
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={handleAdd} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Assessor Type
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type Code</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessorTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>
                    <Badge variant="outline">{type.type_code}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{type.type_label}</TableCell>
                  <TableCell>
                    <Switch
                      checked={type.is_required}
                      onCheckedChange={() => handleToggleRequired(type)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={type.is_enabled}
                      onCheckedChange={() => handleToggleEnabled(type)}
                    />
                  </TableCell>
                  <TableCell>{type.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleEdit(type)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteAssessorType(type.id)}
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
              {editingType?.id ? 'Edit' : 'Add'} Assessor Type
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type Code</Label>
              <Input
                value={editingType?.type_code || ''}
                onChange={(e) => setEditingType({ ...editingType, type_code: e.target.value.toLowerCase() })}
                placeholder="e.g., manager"
                disabled={!!editingType?.id}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier (manager, hr, executive)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Display Label</Label>
              <Input
                value={editingType?.type_label || ''}
                onChange={(e) => setEditingType({ ...editingType, type_label: e.target.value })}
                placeholder="e.g., Direct Manager"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Required</Label>
                <p className="text-xs text-muted-foreground">
                  Must complete assessment before finalization
                </p>
              </div>
              <Switch
                checked={editingType?.is_required || false}
                onCheckedChange={(v) => setEditingType({ ...editingType, is_required: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enabled</Label>
                <p className="text-xs text-muted-foreground">
                  Include in readiness assessment workflow
                </p>
              </div>
              <Switch
                checked={editingType?.is_enabled !== false}
                onCheckedChange={(v) => setEditingType({ ...editingType, is_enabled: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={editingType?.sort_order || 1}
                onChange={(e) => setEditingType({ ...editingType, sort_order: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!editingType?.type_code || !editingType?.type_label}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
