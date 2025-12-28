import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Target, 
  GripVertical,
  AlertCircle,
  Check,
  Scale,
  Loader2,
} from 'lucide-react';
import { useResponsibilityKRAs } from '@/hooks/useResponsibilityKRAs';
import { ResponsibilityKRA, MEASUREMENT_METHODS } from '@/types/responsibilityKRA';

interface ResponsibilityKRAManagerProps {
  responsibilityId: string;
  companyId: string;
  readOnly?: boolean;
}

const emptyForm = {
  name: '',
  description: '',
  target_metric: '',
  measurement_method: '',
  weight: 0,
  is_required: true,
};

export function ResponsibilityKRAManager({ 
  responsibilityId, 
  companyId,
  readOnly = false,
}: ResponsibilityKRAManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKRA, setSelectedKRA] = useState<ResponsibilityKRA | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const { 
    kras, 
    isLoading, 
    fetchKRAs, 
    createKRA, 
    updateKRA, 
    deleteKRA,
    validateWeights,
    distributeWeightsEvenly,
  } = useResponsibilityKRAs({ responsibilityId, companyId });

  useEffect(() => {
    if (responsibilityId) {
      fetchKRAs(responsibilityId);
    }
  }, [responsibilityId, fetchKRAs]);

  const validation = validateWeights(kras);
  const totalWeight = kras.reduce((sum, kra) => sum + kra.weight, 0);

  const handleOpenDialog = (kra?: ResponsibilityKRA) => {
    if (kra) {
      setSelectedKRA(kra);
      setFormData({
        name: kra.name,
        description: kra.description || '',
        target_metric: kra.target_metric || '',
        measurement_method: kra.measurement_method || '',
        weight: kra.weight,
        is_required: kra.is_required,
      });
    } else {
      setSelectedKRA(null);
      // Auto-calculate remaining weight for new KRA
      const remainingWeight = Math.max(0, 100 - totalWeight);
      setFormData({ ...emptyForm, weight: remainingWeight });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('KRA name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (selectedKRA) {
        const { error } = await updateKRA(selectedKRA.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          target_metric: formData.target_metric.trim() || null,
          measurement_method: formData.measurement_method || null,
          weight: formData.weight,
          is_required: formData.is_required,
        });

        if (error) throw new Error(error);
        toast.success('KRA updated');
      } else {
        const { error } = await createKRA({
          responsibility_id: responsibilityId,
          company_id: companyId,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          target_metric: formData.target_metric.trim() || null,
          measurement_method: formData.measurement_method || null,
          weight: formData.weight,
          is_required: formData.is_required,
          sequence_order: kras.length,
        });

        if (error) throw new Error(error);
        toast.success('KRA created');
      }

      setDialogOpen(false);
      fetchKRAs(responsibilityId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save KRA');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedKRA) return;

    try {
      const { error } = await deleteKRA(selectedKRA.id);
      if (error) throw new Error(error);
      
      toast.success('KRA deleted');
      setDeleteDialogOpen(false);
      fetchKRAs(responsibilityId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete KRA');
    }
  };

  const handleDistributeEvenly = async () => {
    const distributed = distributeWeightsEvenly(kras);
    
    try {
      for (const kra of distributed) {
        await updateKRA(kra.id, { weight: kra.weight });
      }
      toast.success('Weights distributed evenly');
      fetchKRAs(responsibilityId);
    } catch (err: any) {
      toast.error('Failed to distribute weights');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Key Result Areas (KRAs)
          </h4>
          <p className="text-xs text-muted-foreground">
            Define measurable outcomes with individual weights
          </p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-2">
            {kras.length > 0 && !validation.isValid && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDistributeEvenly}
              >
                <Scale className="h-4 w-4 mr-1" />
                Distribute Evenly
              </Button>
            )}
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              Add KRA
            </Button>
          </div>
        )}
      </div>

      {/* Weight Summary */}
      {kras.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Weight</span>
            <span className={validation.isValid ? 'text-green-600' : 'text-amber-600'}>
              {totalWeight}% / 100%
              {validation.isValid && <Check className="inline-block h-4 w-4 ml-1" />}
            </span>
          </div>
          <Progress 
            value={Math.min(totalWeight, 100)} 
            className={`h-2 ${!validation.isValid ? '[&>div]:bg-amber-500' : ''}`}
          />
          {!validation.isValid && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validation.message}
            </p>
          )}
        </div>
      )}

      {/* KRA List */}
      {kras.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No KRAs defined yet</p>
          {!readOnly && (
            <p className="text-xs mt-1">Add KRAs to enable granular rating</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {kras.map((kra, index) => (
            <Card key={kra.id} className="overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                {!readOnly && (
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{kra.name}</span>
                    {kra.is_required && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                  </div>
                  {kra.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {kra.description}
                    </p>
                  )}
                  {kra.target_metric && (
                    <p className="text-xs text-primary mt-0.5">
                      Target: {kra.target_metric}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="font-semibold text-lg">{kra.weight}%</span>
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(kra)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedKRA(kra);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedKRA ? 'Edit KRA' : 'Add Key Result Area'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>KRA Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Budget Adherence"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this KRA measures..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Metric</Label>
              <Input
                value={formData.target_metric}
                onChange={(e) => setFormData({ ...formData, target_metric: e.target.value })}
                placeholder="e.g., 98% budget adherence, 5 projects delivered"
              />
            </div>

            <div className="space-y-2">
              <Label>Measurement Method</Label>
              <Select
                value={formData.measurement_method}
                onValueChange={(value) => setFormData({ ...formData, measurement_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {MEASUREMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Weight (%)</Label>
                <span className="text-lg font-semibold">{formData.weight}%</span>
              </div>
              <Slider
                value={[formData.weight]}
                min={0}
                max={100}
                step={5}
                onValueChange={([value]) => setFormData({ ...formData, weight: value })}
              />
              <p className="text-xs text-muted-foreground">
                Available: {100 - totalWeight + (selectedKRA?.weight || 0)}%
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Required</Label>
                <p className="text-xs text-muted-foreground">Must be rated during appraisal</p>
              </div>
              <Switch
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {selectedKRA ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete KRA</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedKRA?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
