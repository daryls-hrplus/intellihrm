import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  X
} from 'lucide-react';
import { PRIORITY_OPTIONS, NOTIFICATION_METHODS } from '@/types/reminders';

interface ParsedRule {
  name: string;
  description?: string;
  eventTypeCode: string;
  eventTypeName: string;
  daysBeforeIntervals: number[];
  sendToEmployee: boolean;
  sendToManager: boolean;
  sendToHr: boolean;
  notificationMethod: 'in_app' | 'email' | 'both';
  priority: 'low' | 'medium' | 'high' | 'critical';
  messageTemplate?: string;
  confidence: number;
  clarificationNeeded?: string;
}

interface EventType {
  id: string;
  code: string;
  name: string;
  category: string;
}

interface NaturalLanguageRuleInputProps {
  companyId: string;
  onRuleCreated: () => void;
}

export function NaturalLanguageRuleInput({ companyId, onRuleCreated }: NaturalLanguageRuleInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedRule, setParsedRule] = useState<ParsedRule | null>(null);
  const [matchedEventType, setMatchedEventType] = useState<EventType | null>(null);
  const [availableEventTypes, setAvailableEventTypes] = useState<EventType[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // Editable form state for review
  const [editedRule, setEditedRule] = useState<ParsedRule | null>(null);
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>('');

  const examplePrompts = [
    "Remind managers 2 weeks before probation ends",
    "Send urgent email to HR 90 days before visa expires",
    "Notify employee and manager 30, 14, and 7 days before contract ends",
    "Create a high priority reminder for certificate expiry at 60 and 30 days",
  ];

  const handleParse = async () => {
    if (!input.trim()) {
      toast.error('Please enter a description of the reminder rule');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-natural-language-rule', {
        body: { naturalLanguageInput: input, companyId }
      });

      if (error) throw error;

      setParsedRule(data.parsedRule);
      setMatchedEventType(data.matchedEventType);
      setAvailableEventTypes(data.availableEventTypes || []);
      
      // Initialize editable state
      setEditedRule(data.parsedRule);
      setSelectedEventTypeId(data.matchedEventType?.id || '');
      
      setShowReviewDialog(true);

      if (data.parsedRule.confidence < 0.7) {
        toast.warning(data.parsedRule.clarificationNeeded || 'Please review and adjust the parsed rule');
      } else {
        toast.success('Rule parsed successfully! Review and confirm.');
      }
    } catch (error: any) {
      console.error('Error parsing rule:', error);
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        toast.error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message?.includes('402')) {
        toast.error('AI usage limit reached. Please add credits to continue.');
      } else {
        toast.error('Failed to parse the rule. Please try again or use manual creation.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    if (!editedRule || !selectedEventTypeId) {
      toast.error('Please select an event type');
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from('reminder_rules').insert({
        company_id: companyId,
        name: editedRule.name,
        description: editedRule.description || `Auto-generated from: "${input}"`,
        event_type_id: selectedEventTypeId,
        days_before: editedRule.daysBeforeIntervals[0],
        reminder_intervals: editedRule.daysBeforeIntervals,
        send_to_employee: editedRule.sendToEmployee,
        send_to_manager: editedRule.sendToManager,
        send_to_hr: editedRule.sendToHr,
        notification_method: editedRule.notificationMethod,
        message_template: editedRule.messageTemplate || '',
        priority: editedRule.priority,
        is_active: true,
      });

      if (error) throw error;

      toast.success('Reminder rule created successfully!');
      setShowReviewDialog(false);
      setInput('');
      setParsedRule(null);
      setEditedRule(null);
      onRuleCreated();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create rule');
    } finally {
      setCreating(false);
    }
  };

  const removeInterval = (interval: number) => {
    if (!editedRule || editedRule.daysBeforeIntervals.length <= 1) return;
    setEditedRule({
      ...editedRule,
      daysBeforeIntervals: editedRule.daysBeforeIntervals.filter(i => i !== interval)
    });
  };

  const addInterval = (value: string) => {
    if (!editedRule) return;
    const num = parseInt(value);
    if (num > 0 && !editedRule.daysBeforeIntervals.includes(num)) {
      setEditedRule({
        ...editedRule,
        daysBeforeIntervals: [...editedRule.daysBeforeIntervals, num].sort((a, b) => b - a)
      });
    }
  };

  return (
    <>
      <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Create Rule with Natural Language
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe the reminder rule you want in plain English and AI will create it for you
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="e.g., Remind managers 2 weeks before probation ends..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <Button 
            onClick={handleParse} 
            disabled={loading || !input.trim()}
            className="w-full gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? 'Parsing...' : 'Parse & Create Rule'}
          </Button>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Review Parsed Rule
            </DialogTitle>
            <DialogDescription>
              Review and adjust the AI-generated rule before creating it
            </DialogDescription>
          </DialogHeader>

          {editedRule && (
            <div className="space-y-4 py-4">
              {/* Confidence indicator */}
              <div className="flex items-center gap-2">
                {parsedRule && parsedRule.confidence >= 0.7 ? (
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    High Confidence ({Math.round(parsedRule.confidence * 100)}%)
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Needs Review ({Math.round((parsedRule?.confidence || 0) * 100)}%)
                  </Badge>
                )}
                {parsedRule?.clarificationNeeded && (
                  <span className="text-sm text-muted-foreground">{parsedRule.clarificationNeeded}</span>
                )}
              </div>

              {/* Original input */}
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <span className="font-medium">Your request:</span> "{input}"
              </div>

              {/* Rule name */}
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  value={editedRule.name}
                  onChange={(e) => setEditedRule({ ...editedRule, name: e.target.value })}
                />
              </div>

              {/* Event type selector with category grouping */}
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select value={selectedEventTypeId} onValueChange={setSelectedEventTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Group event types by category */}
                    {Object.entries(
                      availableEventTypes.reduce((acc, type) => {
                        const cat = type.category || 'other';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(type);
                        return acc;
                      }, {} as Record<string, EventType[]>)
                    ).map(([category, types]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0">
                          {category.replace(/_/g, ' ')}
                        </div>
                        {types.map((et) => (
                          <SelectItem key={et.id} value={et.id} className="pl-4">
                            {et.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                {matchedEventType && (
                  <p className="text-xs text-muted-foreground">
                    AI matched: <Badge variant="outline" className="ml-1">{matchedEventType.category}</Badge> → {matchedEventType.name}
                  </p>
                )}
              </div>

              {/* Reminder intervals */}
              <div className="space-y-2">
                <Label>Reminder Intervals (days before event)</Label>
                <div className="flex flex-wrap gap-2">
                  {editedRule.daysBeforeIntervals.map((interval) => (
                    <Badge key={interval} variant="secondary" className="px-3 py-1">
                      {interval} days
                      <button
                        onClick={() => removeInterval(interval)}
                        className="ml-2 hover:text-destructive"
                        disabled={editedRule.daysBeforeIntervals.length <= 1}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Input
                    type="number"
                    placeholder="Add..."
                    className="w-20 h-7"
                    min={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addInterval((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <Label>Send To</Label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editedRule.sendToEmployee}
                      onCheckedChange={(v) => setEditedRule({ ...editedRule, sendToEmployee: v })}
                    />
                    <span className="text-sm">Employee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editedRule.sendToManager}
                      onCheckedChange={(v) => setEditedRule({ ...editedRule, sendToManager: v })}
                    />
                    <span className="text-sm">Manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editedRule.sendToHr}
                      onCheckedChange={(v) => setEditedRule({ ...editedRule, sendToHr: v })}
                    />
                    <span className="text-sm">HR</span>
                  </div>
                </div>
              </div>

              {/* Priority and notification method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={editedRule.priority} 
                    onValueChange={(v: any) => setEditedRule({ ...editedRule, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notification Method</Label>
                  <Select 
                    value={editedRule.notificationMethod} 
                    onValueChange={(v: any) => setEditedRule({ ...editedRule, notificationMethod: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_METHODS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message template */}
              <div className="space-y-2">
                <Label>Message Template</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-muted-foreground mr-2">Insert placeholder:</span>
                  {[
                    { key: '{employee_name}', label: 'Employee Name' },
                    { key: '{item_name}', label: 'Item Name' },
                    { key: '{event_date}', label: 'Event Date' },
                    { key: '{days_until}', label: 'Days Until' },
                    { key: '{event_type}', label: 'Event Type' },
                    { key: '{manager_name}', label: 'Manager Name' },
                    { key: '{department}', label: 'Department' },
                  ].map((placeholder) => (
                    <button
                      key={placeholder.key}
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('nl-message-template-textarea') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const currentValue = editedRule.messageTemplate || '';
                          const newValue = currentValue.substring(0, start) + placeholder.key + currentValue.substring(end);
                          setEditedRule({ ...editedRule, messageTemplate: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + placeholder.key.length, start + placeholder.key.length);
                          }, 0);
                        } else {
                          setEditedRule({ 
                            ...editedRule, 
                            messageTemplate: (editedRule.messageTemplate || '') + placeholder.key 
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
                  id="nl-message-template-textarea"
                  value={editedRule.messageTemplate || ''}
                  onChange={(e) => setEditedRule({ ...editedRule, messageTemplate: e.target.value })}
                  placeholder="AI will generate a message template, or write your own..."
                  rows={3}
                  className="font-mono text-sm"
                />
                {!editedRule.messageTemplate && (
                  <p className="text-xs text-amber-600">
                    No template generated. Click placeholder buttons above or type your own message.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRule} 
              disabled={creating || !selectedEventTypeId}
              className="gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}