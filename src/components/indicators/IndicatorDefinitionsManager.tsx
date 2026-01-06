import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Activity, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { toast } from "sonner";

interface IndicatorDefinition {
  id: string;
  company_id: string | null;
  code: string;
  name: string;
  description: string | null;
  calculation_method: string | null;
  threshold_levels: { low: number; medium: number; high: number } | null;
  applies_to: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface IndicatorDefinitionsManagerProps {
  companyId: string;
}

const DEFAULT_INDICATORS = [
  { code: 'flight_risk', name: 'Flight Risk', description: 'Likelihood of employee leaving', icon: AlertTriangle },
  { code: 'leadership_readiness', name: 'Leadership Readiness', description: 'Ready for leadership role', icon: TrendingUp },
  { code: 'succession_readiness', name: 'Succession Readiness', description: 'Ready for promotion', icon: Target },
  { code: 'engagement_level', name: 'Engagement Level', description: 'Current engagement score', icon: Activity },
];

export function IndicatorDefinitionsManager({ companyId }: IndicatorDefinitionsManagerProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<IndicatorDefinition | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    calculation_method: '',
    threshold_low: 30,
    threshold_medium: 60,
    threshold_high: 80,
    applies_to: [] as string[],
    is_active: true
  });

  const { data: indicators, isLoading } = useQuery({
    queryKey: ['indicator-definitions', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_indicator_definitions')
        .select('*')
        .or(`company_id.is.null,company_id.eq.${companyId}`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as IndicatorDefinition[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        company_id: companyId,
        code: data.code,
        name: data.name,
        description: data.description || null,
        calculation_method: data.calculation_method || null,
        threshold_levels: {
          low: data.threshold_low,
          medium: data.threshold_medium,
          high: data.threshold_high
        },
        applies_to: data.applies_to.length > 0 ? data.applies_to : null,
        is_active: data.is_active
      };

      if (data.id) {
        const { error } = await supabase
          .from('talent_indicator_definitions')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('talent_indicator_definitions')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicator-definitions'] });
      setIsDialogOpen(false);
      setEditingIndicator(null);
      resetForm();
      toast.success(editingIndicator ? 'Indicator updated' : 'Indicator created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save indicator');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('talent_indicator_definitions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicator-definitions'] });
      toast.success('Indicator deleted');
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('talent_indicator_definitions')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['indicator-definitions'] });
    }
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      calculation_method: '',
      threshold_low: 30,
      threshold_medium: 60,
      threshold_high: 80,
      applies_to: [],
      is_active: true
    });
  };

  const handleEdit = (indicator: IndicatorDefinition) => {
    setEditingIndicator(indicator);
    setFormData({
      code: indicator.code,
      name: indicator.name,
      description: indicator.description || '',
      calculation_method: indicator.calculation_method || '',
      threshold_low: indicator.threshold_levels?.low || 30,
      threshold_medium: indicator.threshold_levels?.medium || 60,
      threshold_high: indicator.threshold_levels?.high || 80,
      applies_to: indicator.applies_to || [],
      is_active: indicator.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name) {
      toast.error('Code and name are required');
      return;
    }
    saveMutation.mutate({ ...formData, id: editingIndicator?.id });
  };

  const getIndicatorIcon = (code: string) => {
    const found = DEFAULT_INDICATORS.find(i => i.code === code);
    return found?.icon || Activity;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading indicators...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Talent Indicator Definitions</h2>
          <p className="text-sm text-muted-foreground">
            Configure readiness and risk indicators for talent decisions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingIndicator(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Indicator
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingIndicator ? 'Edit Indicator' : 'Create Indicator'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
                    placeholder="flight_risk"
                    disabled={!!editingIndicator}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="Flight Risk"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe what this indicator measures..."
                />
              </div>

              <div className="space-y-2">
                <Label>Calculation Method</Label>
                <Select
                  value={formData.calculation_method}
                  onValueChange={(v) => setFormData(p => ({ ...p, calculation_method: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weighted_average">Weighted Average</SelectItem>
                    <SelectItem value="rule_based">Rule-Based</SelectItem>
                    <SelectItem value="ml_model">ML Model</SelectItem>
                    <SelectItem value="composite">Composite Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Threshold Levels</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Low (&lt;)</Label>
                    <Input
                      type="number"
                      value={formData.threshold_low}
                      onChange={(e) => setFormData(p => ({ ...p, threshold_low: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Medium (&lt;)</Label>
                    <Input
                      type="number"
                      value={formData.threshold_medium}
                      onChange={(e) => setFormData(p => ({ ...p, threshold_medium: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">High (&ge;)</Label>
                    <Input
                      type="number"
                      value={formData.threshold_high}
                      onChange={(e) => setFormData(p => ({ ...p, threshold_high: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(p => ({ ...p, is_active: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {indicators?.map((indicator) => {
          const IconComponent = getIndicatorIcon(indicator.code);
          return (
            <Card key={indicator.id} className={!indicator.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{indicator.name}</CardTitle>
                      <code className="text-xs text-muted-foreground">{indicator.code}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={indicator.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: indicator.id, is_active: checked })}
                    />
                    {indicator.company_id && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(indicator)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteMutation.mutate(indicator.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {indicator.description || 'No description'}
                </p>
                {indicator.threshold_levels && (
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      Low: &lt;{indicator.threshold_levels.low}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Med: {indicator.threshold_levels.low}-{indicator.threshold_levels.high}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      High: &ge;{indicator.threshold_levels.high}
                    </Badge>
                  </div>
                )}
                {!indicator.company_id && (
                  <Badge variant="secondary" className="mt-2">System Default</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!indicators || indicators.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No indicators configured yet</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Indicator
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
