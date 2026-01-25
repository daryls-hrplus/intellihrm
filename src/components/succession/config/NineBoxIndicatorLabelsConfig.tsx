import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Grid3X3, Save, RefreshCw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NineBoxIndicatorLabelsConfigProps {
  companyId: string;
}

interface NineBoxIndicatorConfig {
  id?: string;
  company_id: string;
  performance_level: number;
  potential_level: number;
  default_label: string;
  custom_label?: string | null;
  use_custom_label: boolean;
  description?: string | null;
  suggested_actions?: string | null;
  color_code?: string | null;
}

const DEFAULT_LABELS: Record<string, { label: string; color: string; actions: string }> = {
  "3_3": { label: "Star Performer", color: "#22c55e", actions: "Accelerate development, consider for key roles, high visibility projects" },
  "2_3": { label: "High Potential", color: "#3b82f6", actions: "Develop performance skills, stretch assignments, mentoring" },
  "1_3": { label: "Inconsistent Performer", color: "#f59e0b", actions: "Address performance gaps, leverage potential through coaching" },
  "3_2": { label: "Core Player", color: "#06b6d4", actions: "Maintain engagement, develop for future potential" },
  "2_2": { label: "Solid Contributor", color: "#8b5cf6", actions: "Continue development, explore growth opportunities" },
  "1_2": { label: "Underperformer", color: "#f97316", actions: "Performance improvement plan, identify root causes" },
  "3_1": { label: "Technical Expert", color: "#14b8a6", actions: "Leverage expertise, consider technical leadership track" },
  "2_1": { label: "Average Performer", color: "#94a3b8", actions: "Set clear expectations, provide development support" },
  "1_1": { label: "Low Performer", color: "#ef4444", actions: "Immediate intervention required, assess fit for role" },
};

export function NineBoxIndicatorLabelsConfig({ companyId }: NineBoxIndicatorLabelsConfigProps) {
  const [configs, setConfigs] = useState<NineBoxIndicatorConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{ p: number; pot: number } | null>(null);
  const [editForm, setEditForm] = useState<Partial<NineBoxIndicatorConfig>>({});

  useEffect(() => {
    if (companyId) loadConfigs();
  }, [companyId]);

  const loadConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nine_box_indicator_configs')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      toast.error('Failed to load 9-box configuration');
    } else {
      setConfigs(data || []);
    }
    setLoading(false);
  };

  const getConfig = (performance: number, potential: number): NineBoxIndicatorConfig | undefined => {
    return configs.find(c => c.performance_level === performance && c.potential_level === potential);
  };

  const getLabel = (performance: number, potential: number): string => {
    const config = getConfig(performance, potential);
    if (config?.use_custom_label && config.custom_label) {
      return config.custom_label;
    }
    if (config?.default_label) {
      return config.default_label;
    }
    return DEFAULT_LABELS[`${performance}_${potential}`]?.label || 'Unassigned';
  };

  const getColor = (performance: number, potential: number): string => {
    const config = getConfig(performance, potential);
    return config?.color_code || DEFAULT_LABELS[`${performance}_${potential}`]?.color || '#94a3b8';
  };

  const handleCellClick = (performance: number, potential: number) => {
    const config = getConfig(performance, potential);
    const defaults = DEFAULT_LABELS[`${performance}_${potential}`];
    
    setEditForm({
      performance_level: performance,
      potential_level: potential,
      default_label: config?.default_label || defaults?.label || '',
      custom_label: config?.custom_label || '',
      use_custom_label: config?.use_custom_label || false,
      description: config?.description || '',
      suggested_actions: config?.suggested_actions || defaults?.actions || '',
      color_code: config?.color_code || defaults?.color || '#94a3b8',
    });
    setEditingCell({ p: performance, pot: potential });
  };

  const handleSave = async () => {
    if (!editingCell) return;
    setSaving(true);

    const existing = getConfig(editingCell.p, editingCell.pot);
    const defaults = DEFAULT_LABELS[`${editingCell.p}_${editingCell.pot}`];

    const record = {
      company_id: companyId,
      performance_level: editingCell.p,
      potential_level: editingCell.pot,
      default_label: editForm.default_label || defaults?.label || '',
      custom_label: editForm.custom_label || null,
      use_custom_label: editForm.use_custom_label || false,
      description: editForm.description || null,
      suggested_actions: editForm.suggested_actions || null,
      color_code: editForm.color_code || null,
    };

    let error;
    if (existing?.id) {
      ({ error } = await supabase
        .from('nine_box_indicator_configs')
        .update(record)
        .eq('id', existing.id));
    } else {
      ({ error } = await supabase
        .from('nine_box_indicator_configs')
        .insert(record));
    }

    if (error) {
      toast.error('Failed to save configuration');
    } else {
      toast.success('Configuration saved');
      await loadConfigs();
      setEditingCell(null);
    }
    setSaving(false);
  };

  const initializeDefaults = async () => {
    setSaving(true);
    const records: Omit<NineBoxIndicatorConfig, 'id'>[] = [];

    for (let p = 1; p <= 3; p++) {
      for (let pot = 1; pot <= 3; pot++) {
        const defaults = DEFAULT_LABELS[`${p}_${pot}`];
        records.push({
          company_id: companyId,
          performance_level: p,
          potential_level: pot,
          default_label: defaults?.label || '',
          use_custom_label: false,
          suggested_actions: defaults?.actions || null,
          color_code: defaults?.color || null,
        });
      }
    }

    const { error } = await supabase
      .from('nine_box_indicator_configs')
      .upsert(records, {
        onConflict: 'company_id,performance_level,potential_level',
      });

    if (error) {
      toast.error('Failed to initialize defaults');
    } else {
      toast.success('Default labels initialized');
      await loadConfigs();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                9-Box Quadrant Labels
              </CardTitle>
              <CardDescription>
                Customize labels, descriptions, and suggested actions for each quadrant
              </CardDescription>
            </div>
            {configs.length === 0 && (
              <Button onClick={initializeDefaults} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <RefreshCw className="mr-2 h-4 w-4" />
                Initialize Defaults
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border bg-muted/50 text-left font-medium w-24">
                    Potential ↑
                  </th>
                  <th className="p-2 border bg-muted/50 text-center font-medium">Low Performance</th>
                  <th className="p-2 border bg-muted/50 text-center font-medium">Moderate Performance</th>
                  <th className="p-2 border bg-muted/50 text-center font-medium">High Performance</th>
                </tr>
              </thead>
              <tbody>
                {[3, 2, 1].map((potential) => (
                  <tr key={potential}>
                    <td className="p-2 border bg-muted/30 font-medium text-center">
                      {potential === 3 ? 'High' : potential === 2 ? 'Moderate' : 'Low'}
                    </td>
                    {[1, 2, 3].map((performance) => {
                      const label = getLabel(performance, potential);
                      const color = getColor(performance, potential);
                      return (
                        <td key={performance} className="p-0 border">
                          <button
                            type="button"
                            onClick={() => handleCellClick(performance, potential)}
                            className="w-full h-full p-4 text-center transition-colors hover:bg-muted/50 cursor-pointer"
                            style={{
                              backgroundColor: `${color}20`,
                            }}
                          >
                            <span
                              className="font-semibold block"
                              style={{ color }}
                            >
                              {label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Click to edit
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="p-2 border bg-muted/30"></td>
                  <td colSpan={3} className="p-2 border bg-muted/30 text-center text-sm text-muted-foreground">
                    Performance →
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCell} onOpenChange={(open) => !open && setEditingCell(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Edit Quadrant: {editForm.default_label || 'Untitled'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label>Default Label</Label>
                <Input
                  value={editForm.default_label || ''}
                  onChange={(e) => setEditForm({ ...editForm, default_label: e.target.value })}
                  placeholder="e.g., Star Performer"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={editForm.color_code || '#94a3b8'}
                    onChange={(e) => setEditForm({ ...editForm, color_code: e.target.value })}
                    className="w-12 p-1 h-9"
                  />
                  <Input
                    value={editForm.color_code || ''}
                    onChange={(e) => setEditForm({ ...editForm, color_code: e.target.value })}
                    placeholder="#22c55e"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use_custom"
                  checked={editForm.use_custom_label || false}
                  onChange={(e) => setEditForm({ ...editForm, use_custom_label: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="use_custom" className="font-normal">
                  Use custom label instead of default
                </Label>
              </div>
              {editForm.use_custom_label && (
                <Input
                  value={editForm.custom_label || ''}
                  onChange={(e) => setEditForm({ ...editForm, custom_label: e.target.value })}
                  placeholder="Your custom label"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Describe this quadrant..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Suggested Actions</Label>
              <Textarea
                value={editForm.suggested_actions || ''}
                onChange={(e) => setEditForm({ ...editForm, suggested_actions: e.target.value })}
                placeholder="Recommended development actions..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingCell(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
