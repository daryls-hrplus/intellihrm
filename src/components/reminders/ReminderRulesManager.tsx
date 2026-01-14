import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReminders } from '@/hooks/useReminders';
import { useReminderSourcePreview } from '@/hooks/useReminderSourcePreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Pencil, Trash2, Bell, Mail, BellRing, Loader2, X, Settings, HelpCircle, Zap, FileText, Users, ExternalLink, CalendarIcon, CalendarRange } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ReminderRule, ReminderEventType } from '@/types/reminders';
import { PRIORITY_OPTIONS, NOTIFICATION_METHODS } from '@/types/reminders';
import { NaturalLanguageRuleInput } from './NaturalLanguageRuleInput';
import { RuleSourcePreview } from './RuleSourcePreview';
import { TemplateMessagePreview } from './TemplateMessagePreview';
import { TemplateSelector } from './TemplateSelector';
import type { SourcePreviewData } from '@/hooks/useReminderSourcePreview';

interface ReminderRulesManagerProps {
  companyId: string;
  companyName?: string;
  highlightRuleId?: string | null;
  onEditRule?: (ruleId: string) => void;
}

export interface ReminderRulesManagerRef {
  reload: () => void;
  scrollToRule: (ruleId: string) => void;
  openEditDialog: (ruleId: string) => void;
  openCreateDialogWithTemplate: (template: { id: string; name: string; category: string }) => void;
}

export const ReminderRulesManager = forwardRef<ReminderRulesManagerRef, ReminderRulesManagerProps>(
  function ReminderRulesManager({ companyId, companyName, highlightRuleId, onEditRule }, ref) {
  const navigate = useNavigate();
  const { fetchRules, fetchEventTypes, createRule, updateRule, deleteRule, isLoading } = useReminders();
  const { fetchRuleAffectedCount, fetchPreview, previewData, loading: previewLoading } = useReminderSourcePreview();
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);
  const ruleRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [eventTypes, setEventTypes] = useState<ReminderEventType[]>([]);
  const [ruleAffectedCounts, setRuleAffectedCounts] = useState<Record<string, { count: number; employeeCount: number }>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null);
  const [linkedTemplate, setLinkedTemplate] = useState<{ id: string; name: string; category: string } | null>(null);
  const [newInterval, setNewInterval] = useState<string>('');
  const [dialogPreviewData, setDialogPreviewData] = useState<SourcePreviewData | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    event_type_id: string;
    days_before: number;
    reminder_intervals: number[];
    send_to_employee: boolean;
    send_to_manager: boolean;
    send_to_hr: boolean;
    notification_method: 'in_app' | 'email' | 'both';
    message_template: string;
    email_template_id: string | null;
    use_custom_email: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    is_active: boolean;
    cycle_type_filter: string[];
    effective_from: string | null;
    effective_to: string | null;
  }>({
    name: '',
    description: '',
    event_type_id: '',
    days_before: 7,
    reminder_intervals: [7],
    send_to_employee: true,
    send_to_manager: true,
    send_to_hr: false,
    notification_method: 'both',
    message_template: '',
    email_template_id: null,
    use_custom_email: false,
    priority: 'medium',
    is_active: true,
    cycle_type_filter: [],
    effective_from: null,
    effective_to: null,
  });

  const CYCLE_TYPE_OPTIONS = [
    { value: 'annual', label: 'Annual Review' },
    { value: 'quarterly', label: 'Quarterly Review' },
    { value: 'probation', label: 'Probation Review' },
    { value: 'project', label: 'Project-Based' },
    { value: 'mid_year', label: 'Mid-Year Review' },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesData, typesData] = await Promise.all([
        fetchRules(companyId),
        fetchEventTypes(),
      ]);
      // Sort rules by created_at DESC (newest first)
      const sortedRules = [...rulesData].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRules(sortedRules);
      setEventTypes(typesData);
      
      // Fetch affected counts for each rule
      const counts: Record<string, { count: number; employeeCount: number }> = {};
      await Promise.all(
        sortedRules.map(async (rule) => {
          if (rule.event_type) {
            const result = await fetchRuleAffectedCount(rule.event_type, companyId);
            if (result) {
              counts[rule.id] = result;
            }
          }
        })
      );
      setRuleAffectedCounts(counts);
    } catch (error) {
      console.error('Error loading rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToRule = (ruleId: string) => {
    setHighlightedRuleId(ruleId);
    setTimeout(() => {
      const row = ruleRowRefs.current[ruleId];
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedRuleId(null), 3000);
    }, 100);
  };

  const openEditDialog = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      handleOpenDialog(rule);
    }
  };

  const openCreateDialogWithTemplate = (template: { id: string; name: string; category: string }) => {
    setLinkedTemplate(template);
    setEditingRule(null);
    setFormData({
      name: `${template.name} Notification Rule`,
      description: `Auto-generated rule using template: ${template.name}`,
      event_type_id: '',
      days_before: 7,
      reminder_intervals: [7],
      send_to_employee: true,
      send_to_manager: true,
      send_to_hr: false,
      notification_method: 'both',
      message_template: '',
      email_template_id: template.id,
      use_custom_email: false,
      priority: 'medium',
      is_active: true,
      cycle_type_filter: [],
      effective_from: null,
      effective_to: null,
    });
    setNewInterval('');
    setDialogOpen(true);
  };

  useImperativeHandle(ref, () => ({
    reload: loadData,
    scrollToRule,
    openEditDialog,
    openCreateDialogWithTemplate,
  }));

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  // Fetch preview data when event type changes in dialog
  useEffect(() => {
    if (dialogOpen && formData.event_type_id) {
      const eventType = eventTypes.find(t => t.id === formData.event_type_id);
      if (eventType) {
        fetchPreview(eventType, companyId, formData.reminder_intervals).then(data => {
          setDialogPreviewData(data);
        });
      }
    } else {
      setDialogPreviewData(null);
    }
  }, [dialogOpen, formData.event_type_id, formData.reminder_intervals, eventTypes, companyId]);

  const handleOpenDialog = (rule?: ReminderRule) => {
    // Clear linked template when opening dialog normally (not from Use in Rule)
    setLinkedTemplate(null);
    
    if (rule) {
      setEditingRule(rule);
      const intervals = rule.reminder_intervals || [rule.days_before];
      const hasEmailTemplate = !!(rule as any).email_template_id;
      setFormData({
        name: rule.name,
        description: rule.description || '',
        event_type_id: rule.event_type_id,
        days_before: rule.days_before,
        reminder_intervals: intervals,
        send_to_employee: rule.send_to_employee,
        send_to_manager: rule.send_to_manager,
        send_to_hr: rule.send_to_hr,
        notification_method: rule.notification_method as 'in_app' | 'email' | 'both',
        message_template: rule.message_template || '',
        email_template_id: (rule as any).email_template_id || null,
        use_custom_email: !hasEmailTemplate && !!rule.message_template,
        priority: rule.priority as 'low' | 'medium' | 'high' | 'critical',
        is_active: rule.is_active,
        cycle_type_filter: (rule as any).cycle_type_filter || [],
        effective_from: rule.effective_from || null,
        effective_to: rule.effective_to || null,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        event_type_id: '',
        days_before: 7,
        reminder_intervals: [7],
        send_to_employee: true,
        send_to_manager: true,
        send_to_hr: false,
        notification_method: 'both',
        message_template: '',
        email_template_id: null,
        use_custom_email: false,
        priority: 'medium',
        is_active: true,
        cycle_type_filter: [],
        effective_from: null,
        effective_to: null,
      });
    }
    setNewInterval('');

    setDialogOpen(true);
  };

  const addInterval = () => {
    const value = parseInt(newInterval);
    if (value > 0 && value <= 365 && !formData.reminder_intervals.includes(value)) {
      const newIntervals = [...formData.reminder_intervals, value].sort((a, b) => b - a);
      setFormData({ ...formData, reminder_intervals: newIntervals, days_before: newIntervals[0] });
      setNewInterval('');
    }
  };

  const removeInterval = (interval: number) => {
    const newIntervals = formData.reminder_intervals.filter(i => i !== interval);
    if (newIntervals.length > 0) {
      setFormData({ ...formData, reminder_intervals: newIntervals, days_before: newIntervals[0] });
    }
  };

  const handleSave = async () => {
    try {
      const saveData = {
        ...formData,
        email_template_id: formData.use_custom_email ? null : formData.email_template_id,
      };
      // Remove form-only field
      delete (saveData as any).use_custom_email;
      
      if (editingRule) {
        await updateRule(editingRule.id, saveData);
      } else {
        await createRule({
          ...saveData,
          company_id: companyId,
        });
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      await deleteRule(id);
      loadData();
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'in_app': return <Bell className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <BellRing className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const option = PRIORITY_OPTIONS.find(p => p.value === priority);
    return option?.color || 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Natural Language Rule Input */}
      <NaturalLanguageRuleInput companyId={companyId} onRuleCreated={loadData} />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Automatic Reminder Rules</h3>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm p-4">
                <div className="space-y-2">
                  <p className="font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    When to use Reminder Rules
                  </p>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    <li>Set up <strong>automated reminders</strong> that trigger for ALL employees</li>
                    <li>Perfect for recurring events like contract renewals, certifications, or probation reviews</li>
                    <li>Reminders are sent automatically based on event dates in the system</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    Example: "Send reminder 30 days before passport expiry" will auto-notify every employee approaching expiry.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setLinkedTemplate(null);
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                <Zap className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-t-4 border-t-primary">
            <DialogHeader className="pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{editingRule ? 'Edit Reminder Rule' : 'Create Automated Reminder Rule'}</DialogTitle>
                  <DialogDescription className="mt-1">
                    Configure a rule to automatically send reminders to all employees matching certain criteria
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            {/* Quick Guide Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
              <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-primary">Automated Rule</p>
                <p className="text-muted-foreground">
                  This rule will apply to <strong>all employees</strong> with matching events. 
                  Use for system-wide policies like expiring documents, upcoming reviews, or certification renewals.
                </p>
              </div>
            </div>

            {/* Linked Template Banner - Show when coming from "Use in Rule" */}
            {linkedTemplate && (
              <div className="flex items-center gap-2 p-3 bg-accent/50 border border-accent rounded-lg">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm">
                  Creating rule with template: <strong>{linkedTemplate.name}</strong>
                </span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {linkedTemplate.category.replace(/_/g, ' ')}
                </Badge>
              </div>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Rule Name
                    <span className="text-xs text-muted-foreground">(Template identifier)</span>
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., 30-day probation reminder"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Event Type
                    {linkedTemplate && (
                      <span className="text-xs text-primary ml-1">(Recommended matches shown first)</span>
                    )}
                  </Label>
                  <Select
                    value={formData.event_type_id}
                    onValueChange={(v) => setFormData({ ...formData, event_type_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* When linked template exists, show matching category first */}
                      {linkedTemplate && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 sticky top-0 flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Recommended for this template
                          </div>
                          {eventTypes
                            .filter(type => type.category === linkedTemplate.category)
                            .map((type) => (
                              <SelectItem key={type.id} value={type.id} className="pl-4">
                                <div className="flex items-center gap-2">
                                  <span>{type.name}</span>
                                  <Badge variant="default" className="text-[10px] px-1.5 py-0">Match</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0 mt-2">
                            Other event types
                          </div>
                          {eventTypes
                            .filter(type => type.category !== linkedTemplate.category)
                            .map((type) => (
                              <SelectItem key={type.id} value={type.id} className="pl-4">
                                {type.name}
                              </SelectItem>
                            ))}
                        </>
                      )}
                      
                      {/* Default grouping when no linked template */}
                      {!linkedTemplate && Object.entries(
                        eventTypes.reduce((acc, type) => {
                          const cat = type.category || 'other';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(type);
                          return acc;
                        }, {} as Record<string, ReminderEventType[]>)
                      ).map(([category, types]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0">
                            {category.replace(/_/g, ' ')}
                          </div>
                          {types.map((type) => (
                            <SelectItem key={type.id} value={type.id} className="pl-4">
                              {type.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Source Record Preview - Shows affected items when event type is selected */}
              <RuleSourcePreview
                eventType={eventTypes.find(t => t.id === formData.event_type_id) || null}
                companyId={companyId}
                daysBeforeArray={formData.reminder_intervals}
              />

              {/* Cycle Type Filter - Only show for performance category events */}
              {eventTypes.find(t => t.id === formData.event_type_id)?.category === 'performance' && (
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-dashed">
                  <Label className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Filter by Appraisal Cycle Type
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Optionally restrict this rule to specific appraisal cycle types. Leave empty to trigger for all cycle types.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CYCLE_TYPE_OPTIONS.map((option) => {
                      const isSelected = formData.cycle_type_filter.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            const newFilter = isSelected
                              ? formData.cycle_type_filter.filter(v => v !== option.value)
                              : [...formData.cycle_type_filter, option.value];
                            setFormData({ ...formData, cycle_type_filter: newFilter });
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted border-border'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  {formData.cycle_type_filter.length > 0 && (
                    <p className="text-xs text-primary mt-2">
                      ✓ Will only trigger for: {formData.cycle_type_filter.map(v => 
                        CYCLE_TYPE_OPTIONS.find(o => o.value === v)?.label
                      ).join(', ')}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="space-y-2">
                <Label>Reminder Intervals (days before event)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.reminder_intervals.map((interval) => (
                    <Badge key={interval} variant="secondary" className="px-3 py-1 text-sm">
                      {interval} days
                      <button
                        type="button"
                        onClick={() => removeInterval(interval)}
                        className="ml-2 hover:text-destructive"
                        disabled={formData.reminder_intervals.length === 1}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    placeholder="Add interval (e.g., 10)"
                    value={newInterval}
                    onChange={(e) => setNewInterval(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterval())}
                    className="w-40"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addInterval}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add multiple intervals to send reminders at different times (e.g., 30, 14, 7, 3 days before)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v: any) => setFormData({ ...formData, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notification Method</Label>
                  <Select
                    value={formData.notification_method}
                    onValueChange={(v: any) => setFormData({ ...formData, notification_method: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_METHODS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Send To</Label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.send_to_employee}
                      onCheckedChange={(v) => setFormData({ ...formData, send_to_employee: v })}
                    />
                    <span className="text-sm">Employee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.send_to_manager}
                      onCheckedChange={(v) => setFormData({ ...formData, send_to_manager: v })}
                    />
                    <span className="text-sm">Manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.send_to_hr}
                      onCheckedChange={(v) => setFormData({ ...formData, send_to_hr: v })}
                    />
                    <span className="text-sm">HR</span>
                  </div>
                </div>
              </div>

              {/* Email Template Selector - Show when email or both is selected */}
              {(formData.notification_method === 'email' || formData.notification_method === 'both') && (
                <TemplateSelector
                  companyId={companyId}
                  companyName={companyName}
                  category={eventTypes.find(t => t.id === formData.event_type_id)?.category || null}
                  eventTypeId={formData.event_type_id}
                  selectedTemplateId={formData.email_template_id}
                  onSelect={(templateId) => setFormData({ ...formData, email_template_id: templateId })}
                  useCustom={formData.use_custom_email}
                  onUseCustomChange={(useCustom) => setFormData({ ...formData, use_custom_email: useCustom })}
                  onNavigateToTemplates={() => {
                    setDialogOpen(false);
                    navigate('/hr-hub/reminders?tab=templates');
                  }}
                />
              )}

              <div className="space-y-2">
                <Label>
                  {formData.notification_method === 'email' && !formData.use_custom_email
                    ? 'In-App Message (if enabled later)'
                    : formData.use_custom_email || formData.notification_method === 'in_app'
                    ? 'Message Template'
                    : 'In-App Message Template'}
                </Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-muted-foreground mr-2">Insert placeholder:</span>
                  {[
                    { key: '{employee_name}', label: 'Full Name' },
                    { key: '{employee_first_name}', label: 'First Name' },
                    { key: '{employee_last_name}', label: 'Last Name' },
                    { key: '{item_name}', label: 'Item Name' },
                    { key: '{event_date}', label: 'Event Date' },
                    { key: '{days_until}', label: 'Days Until' },
                    { key: '{event_type}', label: 'Event Type' },
                    { key: '{manager_name}', label: 'Manager' },
                    { key: '{department}', label: 'Department' },
                    { key: '{position}', label: 'Position' },
                    { key: '{company_name}', label: 'Company' },
                  ].map((placeholder) => (
                    <button
                      key={placeholder.key}
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('message-template-textarea') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const currentValue = formData.message_template || '';
                          const newValue = currentValue.substring(0, start) + placeholder.key + currentValue.substring(end);
                          setFormData({ ...formData, message_template: newValue });
                          // Restore cursor position after the inserted placeholder
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + placeholder.key.length, start + placeholder.key.length);
                          }, 0);
                        } else {
                          setFormData({ 
                            ...formData, 
                            message_template: (formData.message_template || '') + placeholder.key 
                          });
                        }
                      }}
                      className="text-xs px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                    >
                      {placeholder.label}
                    </button>
                  ))}
                </div>
                <Textarea
                  id="message-template-textarea"
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  placeholder="Custom message template..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">{'{item_name}'}</code> for specific certificate/license names
                </p>
                
                {/* Live Template Preview */}
                <TemplateMessagePreview
                  template={formData.message_template}
                  sampleItems={dialogPreviewData?.items || []}
                  eventTypeName={eventTypes.find(t => t.id === formData.event_type_id)?.name}
                  loading={previewLoading}
                />
              </div>

              {/* Effective Dating Section */}
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-dashed">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarRange className="h-4 w-4 text-primary" />
                  <Label className="font-medium">Rule Effective Period</Label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Schedule when this rule becomes active or expires. Leave empty for no date restriction.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Effective From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.effective_from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.effective_from 
                            ? format(parseISO(formData.effective_from), "PPP") 
                            : "No start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.effective_from ? parseISO(formData.effective_from) : undefined}
                          onSelect={(date) => setFormData({ 
                            ...formData, 
                            effective_from: date ? format(date, 'yyyy-MM-dd') : null 
                          })}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                        {formData.effective_from && (
                          <div className="p-2 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full"
                              onClick={() => setFormData({ ...formData, effective_from: null })}
                            >
                              Clear date
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Effective Until</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.effective_to && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.effective_to 
                            ? format(parseISO(formData.effective_to), "PPP") 
                            : "No end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.effective_to ? parseISO(formData.effective_to) : undefined}
                          onSelect={(date) => setFormData({ 
                            ...formData, 
                            effective_to: date ? format(date, 'yyyy-MM-dd') : null 
                          })}
                          disabled={(date) => formData.effective_from ? date < parseISO(formData.effective_from) : false}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                        {formData.effective_to && (
                          <div className="p-2 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full"
                              onClick={() => setFormData({ ...formData, effective_to: null })}
                            >
                              Clear date
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {formData.effective_from && new Date(formData.effective_from) > new Date() && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>This rule is scheduled to become active on {format(parseISO(formData.effective_from), "PPP")}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !formData.name || !formData.event_type_id}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingRule ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reminder rules configured</p>
            <p className="text-sm text-muted-foreground">Create rules to automatically send reminders for important events</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Affected Items</TableHead>
                <TableHead>Intervals</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => {
                const intervals = rule.reminder_intervals || [rule.days_before];
                const affectedData = ruleAffectedCounts[rule.id];
                const sourceTableLabel = rule.event_type?.source_table
                  ?.replace('employee_', '')
                  .replace(/_/g, ' ') || 'records';
                const isHighlighted = highlightedRuleId === rule.id || highlightRuleId === rule.id;
                
                // Determine effective status
                const today = new Date().toISOString().split('T')[0];
                const isScheduled = rule.effective_from && rule.effective_from > today;
                const isExpired = rule.effective_to && rule.effective_to < today;
                const effectiveStatus = isExpired ? 'expired' : isScheduled ? 'scheduled' : rule.is_active ? 'active' : 'inactive';
                
                return (
                <TableRow 
                  key={rule.id}
                  ref={(el) => { ruleRowRefs.current[rule.id] = el; }}
                  className={isHighlighted ? 'animate-pulse bg-primary/10 transition-colors duration-1000' : ''}
                >
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>
                    <span className="text-sm">{rule.event_type?.name || '-'}</span>
                  </TableCell>
                  <TableCell>
                    {affectedData ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge 
                              variant="secondary" 
                              className="cursor-pointer hover:bg-primary/20 transition-colors gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              {affectedData.count} {sourceTableLabel}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{affectedData.count} records across {affectedData.employeeCount} employees</p>
                            <p className="text-xs text-muted-foreground">Click edit to see details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {intervals.sort((a, b) => b - a).map((interval) => (
                        <Badge key={interval} variant="outline" className="text-xs">
                          {interval}d
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {rule.send_to_employee && <Badge variant="outline" className="text-xs">Emp</Badge>}
                      {rule.send_to_manager && <Badge variant="outline" className="text-xs">Mgr</Badge>}
                      {rule.send_to_hr && <Badge variant="outline" className="text-xs">HR</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={getPriorityColor(rule.priority)}>{rule.priority}</span>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant={effectiveStatus === 'active' ? 'default' : effectiveStatus === 'scheduled' ? 'outline' : 'secondary'}
                            className={cn(
                              effectiveStatus === 'scheduled' && 'border-amber-500 text-amber-600',
                              effectiveStatus === 'expired' && 'border-destructive/50 text-destructive'
                            )}
                          >
                            {effectiveStatus === 'active' && 'Active'}
                            {effectiveStatus === 'scheduled' && 'Scheduled'}
                            {effectiveStatus === 'expired' && 'Expired'}
                            {effectiveStatus === 'inactive' && 'Inactive'}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          {rule.effective_from && <p>Starts: {format(parseISO(rule.effective_from), 'PPP')}</p>}
                          {rule.effective_to && <p>Ends: {format(parseISO(rule.effective_to), 'PPP')}</p>}
                          {!rule.effective_from && !rule.effective_to && <p>No date restrictions</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(rule)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
});
