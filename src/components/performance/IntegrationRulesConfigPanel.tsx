import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  Settings,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';
import { useAppraisalIntegration, IntegrationRule } from '@/hooks/useAppraisalIntegration';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface IntegrationRulesConfigPanelProps {
  companyId: string;
}

const TRIGGER_EVENTS = [
  { value: 'appraisal_finalized', label: 'Appraisal Finalized' },
  { value: 'score_threshold', label: 'Score Threshold Met' },
  { value: 'category_assigned', label: 'Category Assigned' }
];

const CONDITION_TYPES = [
  { value: 'category_match', label: 'Category Match' },
  { value: 'score_range', label: 'Score Range' },
  { value: 'trend_direction', label: 'Trend Direction' },
  { value: 'readiness_threshold', label: 'Readiness Threshold' }
];

const TARGET_MODULES = [
  { value: 'nine_box', label: '9-Box Assessment' },
  { value: 'succession', label: 'Succession Planning' },
  { value: 'idp', label: 'Development Plan (IDP)' },
  { value: 'pip', label: 'Performance Improvement (PIP)' },
  { value: 'compensation', label: 'Compensation Review' },
  { value: 'workforce_analytics', label: 'Workforce Analytics' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'reminders', label: 'HR Reminders' }
];

const ACTION_TYPES = [
  { value: 'create', label: 'Create Record' },
  { value: 'update', label: 'Update Record' },
  { value: 'flag', label: 'Flag for Review' },
  { value: 'archive', label: 'Archive' },
  { value: 'notify', label: 'Send Notification' },
  { value: 'sync', label: 'Sync Data' }
];

const OPERATORS = [
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not Equals' },
  { value: '>', label: 'Greater Than' },
  { value: '<', label: 'Less Than' },
  { value: '>=', label: 'Greater or Equal' },
  { value: '<=', label: 'Less or Equal' },
  { value: 'in', label: 'In List' },
  { value: 'not_in', label: 'Not In List' },
  { value: 'between', label: 'Between' }
];

function SortableRuleCard({ rule, onEdit, onDelete, onToggle }: { 
  rule: IntegrationRule; 
  onEdit: () => void; 
  onDelete: () => void;
  onToggle: (active: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex items-center gap-2 p-3 rounded-lg border bg-card"
    >
      <button {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1 rounded">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">{rule.name}</p>
          <Badge variant="outline" className="text-xs">{rule.target_module}</Badge>
          {rule.requires_approval && (
            <Badge variant="secondary" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Approval Required
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{rule.description}</p>
      </div>

      <div className="flex items-center gap-2">
        <Switch 
          checked={rule.is_active} 
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-green-600"
        />
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function IntegrationRulesConfigPanel({ companyId }: IntegrationRulesConfigPanelProps) {
  const { rules, loading, createRule, updateRule, deleteRule, toggleRule, reorderRules } = useAppraisalIntegration(companyId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IntegrationRule | null>(null);
  const [formData, setFormData] = useState<Partial<IntegrationRule>>({
    name: '',
    description: '',
    trigger_event: 'appraisal_finalized',
    condition_type: 'category_match',
    condition_operator: 'in',
    condition_category_codes: [],
    target_module: 'nine_box',
    action_type: 'update',
    action_config: {},
    auto_execute: true,
    requires_approval: false,
    is_active: true
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = rules.findIndex(r => r.id === active.id);
      const newIndex = rules.findIndex(r => r.id === over.id);
      const newOrder = [...rules];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      await reorderRules(newOrder.map(r => r.id));
    }
  };

  const openCreateDialog = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      trigger_event: 'appraisal_finalized',
      condition_type: 'category_match',
      condition_operator: 'in',
      condition_category_codes: [],
      target_module: 'nine_box',
      action_type: 'update',
      action_config: {},
      auto_execute: true,
      requires_approval: false,
      is_active: true
    });
    setDialogOpen(true);
  };

  const openEditDialog = (rule: IntegrationRule) => {
    setEditingRule(rule);
    setFormData(rule);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingRule) {
        await updateRule(editingRule.id, formData);
        toast.success('Rule updated');
      } else {
        await createRule(formData);
        toast.success('Rule created');
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save rule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this integration rule?')) return;
    try {
      await deleteRule(id);
      toast.success('Rule deleted');
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleRule(id, active);
      toast.success(active ? 'Rule enabled' : 'Rule disabled');
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Integration Rules
          </CardTitle>
          <Button size="sm" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No integration rules configured</p>
            <p className="text-xs">Create rules to automate downstream updates</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rules.map(r => r.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {rules.map(rule => (
                  <SortableRuleCard
                    key={rule.id}
                    rule={rule}
                    onEdit={() => openEditDialog(rule)}
                    onDelete={() => handleDelete(rule.id)}
                    onToggle={(active) => handleToggle(rule.id, active)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>

      {/* Rule Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create Integration Rule'}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Exceptional to 9-Box High Potential"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this rule does..."
                  rows={2}
                />
              </div>

              <Separator />

              {/* Trigger */}
              <div className="space-y-2">
                <Label>Trigger Event</Label>
                <Select
                  value={formData.trigger_event}
                  onValueChange={v => setFormData({ ...formData, trigger_event: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_EVENTS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition Type</Label>
                  <Select
                    value={formData.condition_type}
                    onValueChange={v => setFormData({ ...formData, condition_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITION_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select
                    value={formData.condition_operator}
                    onValueChange={v => setFormData({ ...formData, condition_operator: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.condition_type === 'category_match' && (
                <div className="space-y-2">
                  <Label>Category Codes (comma-separated)</Label>
                  <Input
                    value={(formData.condition_category_codes || []).join(', ')}
                    onChange={e => setFormData({ 
                      ...formData, 
                      condition_category_codes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="exceptional, exceeds"
                  />
                </div>
              )}

              {formData.condition_type === 'score_range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={formData.condition_value || ''}
                      onChange={e => setFormData({ ...formData, condition_value: parseFloat(e.target.value) })}
                    />
                  </div>
                  {formData.condition_operator === 'between' && (
                    <div className="space-y-2">
                      <Label>Max Value</Label>
                      <Input
                        type="number"
                        value={formData.condition_value_max || ''}
                        onChange={e => setFormData({ ...formData, condition_value_max: parseFloat(e.target.value) })}
                      />
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Target */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Module</Label>
                  <Select
                    value={formData.target_module}
                    onValueChange={v => setFormData({ ...formData, target_module: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_MODULES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select
                    value={formData.action_type}
                    onValueChange={v => setFormData({ ...formData, action_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Execution Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Execute</Label>
                    <p className="text-xs text-muted-foreground">Run automatically when triggered</p>
                  </div>
                  <Switch
                    checked={formData.auto_execute}
                    onCheckedChange={v => setFormData({ ...formData, auto_execute: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requires Approval</Label>
                    <p className="text-xs text-muted-foreground">Queue for manual approval</p>
                  </div>
                  <Switch
                    checked={formData.requires_approval}
                    onCheckedChange={v => setFormData({ ...formData, requires_approval: v })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">Enable this rule</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={v => setFormData({ ...formData, is_active: v })}
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
