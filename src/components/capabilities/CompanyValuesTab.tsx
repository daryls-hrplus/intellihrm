import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Heart, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Shield, 
  Loader2,
  GripVertical,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useValuesAssessment } from '@/hooks/performance/useValuesAssessment';
import { CompanyValue } from '@/types/valuesAssessment';

interface CompanyValuesTabProps {
  companyId: string;
}

import { BehavioralIndicator } from '@/types/valuesAssessment';

export function CompanyValuesTab({ companyId }: CompanyValuesTabProps) {
  const { values, loading, fetchCompanyValues, createCompanyValue, updateCompanyValue, deleteCompanyValue } = useValuesAssessment();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<CompanyValue | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    weight: 0,
    is_promotion_factor: false,
    behavioral_indicators: [] as BehavioralIndicator[],
  });

  useEffect(() => {
    if (companyId) {
      fetchCompanyValues(companyId);
    }
  }, [companyId, fetchCompanyValues]);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      weight: 0,
      is_promotion_factor: false,
      behavioral_indicators: [],
    });
    setSelectedValue(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEdit = (value: CompanyValue) => {
    setSelectedValue(value);
    setFormData({
      name: value.name,
      code: value.code || '',
      description: value.description || '',
      weight: value.weight || 0,
      is_promotion_factor: value.is_promotion_factor || false,
      behavioral_indicators: value.behavioral_indicators || [],
    });
    setIsFormOpen(true);
  };

  const handleDelete = (value: CompanyValue) => {
    setSelectedValue(value);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedValue) return;
    const success = await deleteCompanyValue(selectedValue.id);
    if (success) {
      toast.success('Value deleted successfully');
      fetchCompanyValues(companyId);
    }
    setIsDeleteOpen(false);
    setSelectedValue(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    const payload = {
      company_id: companyId,
      name: formData.name,
      code: formData.code || formData.name.toUpperCase().replace(/\s+/g, '_'),
      description: formData.description,
      weight: formData.weight,
      is_promotion_factor: formData.is_promotion_factor,
      behavioral_indicators: formData.behavioral_indicators,
      display_order: selectedValue?.display_order ?? values.length,
    };

    let success = false;
    if (selectedValue) {
      success = await updateCompanyValue(selectedValue.id, payload);
    } else {
      const result = await createCompanyValue(companyId, payload);
      success = !!result;
    }

    if (success) {
      toast.success(selectedValue ? 'Value updated' : 'Value created');
      fetchCompanyValues(companyId);
      setIsFormOpen(false);
      resetForm();
    }
  };

  const addBehavioralIndicator = () => {
    setFormData(prev => ({
      ...prev,
      behavioral_indicators: [
        ...prev.behavioral_indicators,
        { level: prev.behavioral_indicators.length + 1, description: '', examples: [] }
      ]
    }));
  };

  const updateBehavioralIndicator = (index: number, field: keyof BehavioralIndicator, value: any) => {
    setFormData(prev => ({
      ...prev,
      behavioral_indicators: prev.behavioral_indicators.map((bi, i) => 
        i === index ? { ...bi, [field]: value } : bi
      )
    }));
  };

  const removeBehavioralIndicator = (index: number) => {
    setFormData(prev => ({
      ...prev,
      behavioral_indicators: prev.behavioral_indicators.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Context Info Card */}
      <Card className="border-info/30 bg-info/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-info" />
            Understanding Skills, Competencies & Values
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <div className="font-medium text-foreground">Skills</div>
              <p className="text-muted-foreground">
                Technical abilities and knowledge that can be learned and measured (e.g., Python programming, Financial modeling). 
                <span className="text-primary"> Used in: Job requirements, capability assessments.</span>
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-foreground">Competencies</div>
              <p className="text-muted-foreground">
                Observable behaviors and attributes that drive performance (e.g., Leadership, Problem Solving). 
                <span className="text-primary"> Used in: Performance appraisals (weighted scoring).</span>
              </p>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-foreground">Values</div>
              <p className="text-muted-foreground">
                Cultural principles and beliefs that guide how work gets done (e.g., Integrity, Customer Focus). 
                <span className="text-primary"> Used in: Appraisals (typically unweighted/commentary), Succession planning.</span>
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Best Practice:</strong> Values assessments in appraisals are typically descriptive 
              (Demonstrates / Developing) rather than numerically weighted, and are often excluded from compensation calculations. 
              This aligns with SHRM guidance and union-safe practices.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Company Values</h3>
          <p className="text-sm text-muted-foreground">
            Define your organization's core values for cultural assessment
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Value
        </Button>
      </div>

      {/* Values Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : values.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="text-lg font-medium mb-2">No values defined yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Define your company's core values to include them in performance assessments
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Value
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <Card key={value.id} className="relative group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900">
                      <Heart className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{value.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">{value.code}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(value)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(value)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {value.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {value.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {value.is_promotion_factor && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Promotion Factor
                    </Badge>
                  )}
                  {value.weight > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {value.weight}% weight
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {value.behavioral_indicators?.length || 0} indicators
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedValue ? 'Edit Value' : 'Add Company Value'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Integrity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="AUTO_GENERATED"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this value means for your organization..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight % (0 = qualitative only)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground">
                  Set to 0 for descriptive-only assessment (recommended)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Promotion Factor</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.is_promotion_factor}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_promotion_factor: checked }))}
                  />
                  <span className="text-sm text-muted-foreground">
                    Used in succession planning checks
                  </span>
                </div>
              </div>
            </div>

            {/* Behavioral Indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Behavioral Indicators (Optional)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addBehavioralIndicator}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Level
                </Button>
              </div>
              {formData.behavioral_indicators.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                  No behavioral indicators defined. Add levels to describe expected behaviors.
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.behavioral_indicators.map((indicator, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Level {indicator.level}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-auto"
                              onClick={() => removeBehavioralIndicator(index)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          <Textarea
                            value={indicator.description}
                            onChange={(e) => updateBehavioralIndicator(index, 'description', e.target.value)}
                            placeholder="Describe behaviors expected at this level..."
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedValue ? 'Update' : 'Create'} Value
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Value</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedValue?.name}"? This will remove it from all future assessments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
