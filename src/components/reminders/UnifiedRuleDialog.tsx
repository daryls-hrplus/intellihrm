import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { 
  Sparkles, 
  FileText, 
  Zap,
  Settings,
  Plus,
  X,
  Loader2,
  CalendarIcon,
  CalendarRange
} from 'lucide-react';
import { PRIORITY_OPTIONS, NOTIFICATION_METHODS, REMINDER_CATEGORIES } from '@/types/reminders';
import type { ReminderRule, ReminderEventType } from '@/types/reminders';
import { AIAssistRuleInput } from './AIAssistRuleInput';
import { QuickSetupWizard } from './QuickSetupWizard';
import { RuleSourcePreview } from './RuleSourcePreview';
import { TemplateMessagePreview } from './TemplateMessagePreview';
import { TemplateSelector } from './TemplateSelector';
import { useReminderSourcePreview, type SourcePreviewData } from '@/hooks/useReminderSourcePreview';

export type DialogMode = 'ai-assist' | 'manual' | 'quick-setup';

interface UnifiedRuleDialogProps {
  companyId: string;
  companyName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: DialogMode;
  editingRule?: ReminderRule | null;
  linkedTemplate?: { id: string; name: string; category: string } | null;
  eventTypes: ReminderEventType[];
  categoryCoverage: Record<string, { count: number; hasRules: boolean }>;
  onRuleCreated: () => void;
  onRuleUpdated: () => void;
}

export interface UnifiedRuleDialogRef {
  setMode: (mode: DialogMode) => void;
}

const CYCLE_TYPE_OPTIONS = [
  { value: 'annual', label: 'Annual Review' },
  { value: 'quarterly', label: 'Quarterly Review' },
  { value: 'probation', label: 'Probation Review' },
  { value: 'project', label: 'Project-Based' },
  { value: 'mid_year', label: 'Mid-Year Review' },
];

export const UnifiedRuleDialog = forwardRef<UnifiedRuleDialogRef, UnifiedRuleDialogProps>(
  function UnifiedRuleDialog({
    companyId,
    companyName,
    open,
    onOpenChange,
    defaultMode = 'ai-assist',
    editingRule,
    linkedTemplate,
    eventTypes,
    categoryCoverage,
    onRuleCreated,
    onRuleUpdated,
  }, ref) {
    const navigate = useNavigate();
    const { fetchPreview, loading: previewLoading } = useReminderSourcePreview();
    const [mode, setMode] = useState<DialogMode>(defaultMode);
    const [isLoading, setIsLoading] = useState(false);
    const [newInterval, setNewInterval] = useState('');
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
      is_active: false,
      cycle_type_filter: [],
      effective_from: null,
      effective_to: null,
    });

    useImperativeHandle(ref, () => ({
      setMode: (newMode: DialogMode) => setMode(newMode),
    }));

    // Reset form when dialog opens/closes or editingRule changes
    useEffect(() => {
      if (open) {
        if (editingRule) {
          setMode('manual');
          const intervals = editingRule.reminder_intervals || [editingRule.days_before];
          const hasEmailTemplate = !!(editingRule as any).email_template_id;
          setFormData({
            name: editingRule.name,
            description: editingRule.description || '',
            event_type_id: editingRule.event_type_id,
            days_before: editingRule.days_before,
            reminder_intervals: intervals,
            send_to_employee: editingRule.send_to_employee,
            send_to_manager: editingRule.send_to_manager,
            send_to_hr: editingRule.send_to_hr,
            notification_method: editingRule.notification_method as 'in_app' | 'email' | 'both',
            message_template: editingRule.message_template || '',
            email_template_id: (editingRule as any).email_template_id || null,
            use_custom_email: !hasEmailTemplate && !!editingRule.message_template,
            priority: editingRule.priority as 'low' | 'medium' | 'high' | 'critical',
            is_active: editingRule.is_active,
            cycle_type_filter: (editingRule as any).cycle_type_filter || [],
            effective_from: editingRule.effective_from || null,
            effective_to: editingRule.effective_to || null,
          });
        } else if (linkedTemplate) {
          setMode('manual');
          setFormData(prev => ({
            ...prev,
            name: `${linkedTemplate.name} Notification Rule`,
            description: `Auto-generated rule using template: ${linkedTemplate.name}`,
            email_template_id: linkedTemplate.id,
            use_custom_email: false,
          }));
        } else {
          setMode(defaultMode);
          resetForm();
        }
      }
    }, [open, editingRule, linkedTemplate, defaultMode]);

    // Fetch preview data when event type changes
    useEffect(() => {
      if (open && formData.event_type_id && mode === 'manual') {
        const eventType = eventTypes.find(t => t.id === formData.event_type_id);
        if (eventType) {
          fetchPreview(eventType, companyId, formData.reminder_intervals).then(data => {
            setDialogPreviewData(data);
          });
        }
      } else {
        setDialogPreviewData(null);
      }
    }, [open, formData.event_type_id, formData.reminder_intervals, eventTypes, companyId, mode]);

    const resetForm = () => {
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
        is_active: false,
        cycle_type_filter: [],
        effective_from: null,
        effective_to: null,
      });
      setNewInterval('');
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
      setIsLoading(true);
      try {
        const saveData = {
          ...formData,
          email_template_id: formData.use_custom_email ? null : formData.email_template_id,
        };
        delete (saveData as any).use_custom_email;
        
        if (editingRule) {
          const { error } = await supabase
            .from('reminder_rules')
            .update(saveData)
            .eq('id', editingRule.id);
          if (error) throw error;
          toast.success('Rule updated successfully');
          onRuleUpdated();
        } else {
          const { error } = await supabase
            .from('reminder_rules')
            .insert({ ...saveData, company_id: companyId });
          if (error) throw error;
          toast.success('Rule created successfully');
          onRuleCreated();
        }
        onOpenChange(false);
      } catch (error) {
        console.error('Error saving rule:', error);
        toast.error('Failed to save rule');
      } finally {
        setIsLoading(false);
      }
    };

    const handleQuickSetupCustomize = (recommendation: any) => {
      // Pre-fill form with recommendation data
      const eventType = eventTypes.find(t => t.category === recommendation.category);
      setFormData({
        ...formData,
        name: recommendation.name,
        event_type_id: eventType?.id || '',
        reminder_intervals: recommendation.intervals,
        days_before: recommendation.intervals[0],
        send_to_employee: recommendation.recipients.includes('employee'),
        send_to_manager: recommendation.recipients.includes('manager'),
        send_to_hr: recommendation.recipients.includes('hr'),
        priority: recommendation.priority,
        email_template_id: recommendation.templateId || null,
      });
      setMode('manual');
    };

    const handleRuleCreated = () => {
      onRuleCreated();
      onOpenChange(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-t-4 border-t-primary">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  {editingRule ? 'Edit Reminder Rule' : 'Create Automation Rule'}
                </DialogTitle>
                {companyName && (
                  <p className="text-sm text-muted-foreground">{companyName}</p>
                )}
                <DialogDescription className="mt-1">
                  {editingRule 
                    ? 'Modify the rule configuration below'
                    : 'Choose how you want to create your automation rule'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Tabs - Only show when creating new rule */}
          {!editingRule && (
            <Tabs value={mode} onValueChange={(v) => setMode(v as DialogMode)} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ai-assist" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI Assist
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Manual
                </TabsTrigger>
                <TabsTrigger value="quick-setup" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Setup
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai-assist" className="mt-4">
                <AIAssistRuleInput
                  companyId={companyId}
                  onRuleCreated={handleRuleCreated}
                  onSwitchToManual={() => setMode('manual')}
                />
              </TabsContent>

              <TabsContent value="quick-setup" className="mt-4">
                <QuickSetupWizard
                  companyId={companyId}
                  categoryCoverage={categoryCoverage}
                  onRuleCreated={handleRuleCreated}
                  onCustomize={handleQuickSetupCustomize}
                />
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                {renderManualForm()}
              </TabsContent>
            </Tabs>
          )}

          {/* Manual form when editing */}
          {editingRule && (
            <div className="mt-4">
              {renderManualForm()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );

    function renderManualForm() {
      return (
        <div className="space-y-4">
          {/* Linked Template Banner */}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 30-day probation reminder"
              />
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={formData.event_type_id}
                onValueChange={(v) => setFormData({ ...formData, event_type_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {linkedTemplate ? (
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
                  ) : (
                    Object.entries(
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
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Source Record Preview */}
          <RuleSourcePreview
            eventType={eventTypes.find(t => t.id === formData.event_type_id) || null}
            companyId={companyId}
            daysBeforeArray={formData.reminder_intervals}
          />

          {/* Cycle Type Filter */}
          {eventTypes.find(t => t.id === formData.event_type_id)?.category === 'performance' && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-dashed">
              <Label className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Filter by Appraisal Cycle Type
              </Label>
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

          {/* Reminder Intervals */}
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
                placeholder="Add interval"
                value={newInterval}
                onChange={(e) => setNewInterval(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterval())}
                className="w-40"
              />
              <Button type="button" variant="outline" size="sm" onClick={addInterval}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Priority & Notification */}
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
                  {NOTIFICATION_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
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

          {/* Email Template Selector */}
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
                onOpenChange(false);
                navigate('/hr-hub/reminders?tab=templates');
              }}
            />
          )}

          {/* Message Template */}
          <div className="space-y-2">
            <Label>Message Template</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              <span className="text-xs text-muted-foreground mr-2">Insert placeholder:</span>
              {[
                { key: '{employee_name}', label: 'Full Name' },
                { key: '{item_name}', label: 'Item Name' },
                { key: '{event_date}', label: 'Event Date' },
                { key: '{days_until}', label: 'Days Until' },
              ].map((placeholder) => (
                <button
                  key={placeholder.key}
                  type="button"
                  onClick={() => {
                    setFormData({ 
                      ...formData, 
                      message_template: (formData.message_template || '') + placeholder.key 
                    });
                  }}
                  className="text-xs px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                >
                  {placeholder.label}
                </button>
              ))}
            </div>
            <Textarea
              value={formData.message_template}
              onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
              placeholder="Custom message template..."
              rows={3}
            />
            <TemplateMessagePreview
              template={formData.message_template}
              sampleItems={dialogPreviewData?.items || []}
              eventTypeName={eventTypes.find(t => t.id === formData.event_type_id)?.name}
              loading={previewLoading}
            />
          </div>

          {/* Effective Dating */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-dashed">
            <div className="flex items-center gap-2 mb-2">
              <CalendarRange className="h-4 w-4 text-primary" />
              <Label className="font-medium">Rule Effective Period</Label>
              <Badge variant="destructive" className="text-[10px] px-1.5">Required</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Effective From <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.effective_from && "text-muted-foreground border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.effective_from 
                        ? format(parseISO(formData.effective_from), "PPP") 
                        : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
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
                          onClick={() => setFormData({ ...formData, effective_from: null, is_active: false })}
                        >
                          Clear date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                {!formData.effective_from && (
                  <p className="text-xs text-destructive">Required to activate rule</p>
                )}
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
                    <CalendarComponent
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
          </div>

          {/* Active switch */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => {
                  if (v && !formData.effective_from) {
                    toast.error('Set an effective date before activating the rule');
                    return;
                  }
                  setFormData({ ...formData, is_active: v });
                }}
                disabled={!formData.effective_from && !formData.is_active}
              />
              <Label className={!formData.effective_from ? 'text-muted-foreground' : ''}>Active</Label>
            </div>
            {!formData.effective_from && (
              <p className="text-xs text-muted-foreground ml-10">
                Set an effective date to enable activation
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !formData.name || !formData.event_type_id}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingRule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </div>
      );
    }
  }
);
