import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit2, Trash2, Heart, Shield, GripVertical, Loader2 } from 'lucide-react';
import { useValuesAssessment } from '@/hooks/performance/useValuesAssessment';

import { CompanyValue, BehavioralIndicator } from '@/types/valuesAssessment';
import { LeaveCompanyFilter, useLeaveCompanyFilter } from '@/components/leave/LeaveCompanyFilter';

export default function CompanyValuesPage() {
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const {
    values,
    loading,
    fetchCompanyValues,
    createCompanyValue,
    updateCompanyValue,
    deleteCompanyValue,
  } = useValuesAssessment();

  const [showDialog, setShowDialog] = useState(false);
  const [editingValue, setEditingValue] = useState<CompanyValue | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    weight: 0,
    is_promotion_factor: false,
    behavioral_indicators: [] as BehavioralIndicator[],
  });
  const [newIndicator, setNewIndicator] = useState({ level: 1, description: '' });

  useEffect(() => {
    if (selectedCompanyId && selectedCompanyId !== 'all') {
      fetchCompanyValues(selectedCompanyId);
    }
  }, [selectedCompanyId, fetchCompanyValues]);

  const resetForm = () => {
    setForm({
      name: '',
      code: '',
      description: '',
      weight: 0,
      is_promotion_factor: false,
      behavioral_indicators: [],
    });
    setNewIndicator({ level: 1, description: '' });
    setEditingValue(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const openEditDialog = (value: CompanyValue) => {
    setEditingValue(value);
    setForm({
      name: value.name,
      code: value.code || '',
      description: value.description || '',
      weight: value.weight,
      is_promotion_factor: value.is_promotion_factor,
      behavioral_indicators: value.behavioral_indicators || [],
    });
    setShowDialog(true);
  };

  const handleAddIndicator = () => {
    if (!newIndicator.description.trim()) return;
    setForm(prev => ({
      ...prev,
      behavioral_indicators: [
        ...prev.behavioral_indicators,
        { level: newIndicator.level, description: newIndicator.description.trim() }
      ].sort((a, b) => a.level - b.level)
    }));
    setNewIndicator({ level: newIndicator.level + 1, description: '' });
  };

  const handleRemoveIndicator = (index: number) => {
    setForm(prev => ({
      ...prev,
      behavioral_indicators: prev.behavioral_indicators.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCompanyId || selectedCompanyId === 'all') return;

    if (editingValue) {
      await updateCompanyValue(editingValue.id, form);
    } else {
      await createCompanyValue(selectedCompanyId, form);
    }

    await fetchCompanyValues(selectedCompanyId);
    setShowDialog(false);
    resetForm();
  };

  const handleDelete = async (valueId: string) => {
    if (!confirm('Are you sure you want to deactivate this value?')) return;
    await deleteCompanyValue(valueId);
    if (selectedCompanyId && selectedCompanyId !== 'all') {
      await fetchCompanyValues(selectedCompanyId);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Company Values</h1>
              <p className="text-muted-foreground">
                Define organizational values for performance appraisals and succession planning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            <Button onClick={openCreateDialog} disabled={!selectedCompanyId || selectedCompanyId === 'all'}>
              <Plus className="h-4 w-4 mr-2" />
              Add Value
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : values.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Company Values Defined</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                Add your organization's core values to include them in performance appraisals.
              </p>
              <Button onClick={openCreateDialog} disabled={!selectedCompanyId || selectedCompanyId === 'all'}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Value
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Active Values ({values.length})</CardTitle>
              <CardDescription>
                These values will be available for assessment in performance appraisals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Indicators</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Promotion Factor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {values.map((value, index) => (
                    <TableRow key={value.id}>
                      <TableCell className="text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{value.name}</div>
                          {value.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {value.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {value.code && <Badge variant="outline">{value.code}</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {value.behavioral_indicators?.length || 0} indicators
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {value.weight > 0 ? `${value.weight}%` : 'Qualitative'}
                      </TableCell>
                      <TableCell>
                        {value.is_promotion_factor && (
                          <Badge className="bg-primary/10 text-primary">
                            <Shield className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(value)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(value.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingValue ? 'Edit Company Value' : 'Add Company Value'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Value Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Integrity"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g., INT"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe what this value means to your organization..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Weight (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Set to 0 for qualitative-only assessment
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Promotion Factor</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={form.is_promotion_factor}
                      onCheckedChange={(checked) => setForm({ ...form, is_promotion_factor: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      Required for succession/promotion
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Behavioral Indicators</Label>
                <p className="text-sm text-muted-foreground">
                  Define observable behaviors at different proficiency levels
                </p>

                {form.behavioral_indicators.length > 0 && (
                  <div className="space-y-2 border rounded-lg p-3">
                    {form.behavioral_indicators.map((indicator, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Badge variant="outline" className="shrink-0">
                          L{indicator.level}
                        </Badge>
                        <span className="text-sm flex-1">{indicator.description}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveIndicator(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    className="w-20"
                    value={newIndicator.level}
                    onChange={(e) => setNewIndicator({ ...newIndicator, level: parseInt(e.target.value) || 1 })}
                    placeholder="Level"
                  />
                  <Input
                    className="flex-1"
                    value={newIndicator.description}
                    onChange={(e) => setNewIndicator({ ...newIndicator, description: e.target.value })}
                    placeholder="Behavioral indicator description..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddIndicator()}
                  />
                  <Button variant="outline" onClick={handleAddIndicator}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!form.name.trim()}>
                {editingValue ? 'Update Value' : 'Create Value'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
