import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, FileText, ExternalLink, Mail } from 'lucide-react';
import { REMINDER_CATEGORIES } from '@/types/reminders';

interface EmailTemplate {
  id: string;
  company_id: string | null;
  event_type_id: string | null;
  category: string;
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
  is_active: boolean;
}

interface TemplateSelectorProps {
  companyId: string;
  category: string | null;
  selectedTemplateId: string | null;
  onSelect: (templateId: string | null) => void;
  useCustom: boolean;
  onUseCustomChange: (useCustom: boolean) => void;
  onNavigateToTemplates?: () => void;
}

export function TemplateSelector({
  companyId,
  category,
  selectedTemplateId,
  onSelect,
  useCustom,
  onUseCustomChange,
  onNavigateToTemplates,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    if (!category) {
      setTemplates([]);
      return;
    }

    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reminder_email_templates')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)
          .or(`is_default.eq.true,company_id.eq.${companyId}`)
          .order('is_default', { ascending: false })
          .order('name');

        if (error) throw error;
        setTemplates(data || []);

        // Auto-select first matching template if none selected and not using custom
        if (!selectedTemplateId && !useCustom && data && data.length > 0) {
          onSelect(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [category, companyId]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const getCategoryLabel = (cat: string) => 
    REMINDER_CATEGORIES.find(c => c.value === cat)?.label || cat;

  const previewBody = (text: string) => {
    return text
      .replace(/\{\{employee_first_name\}\}/gi, 'John')
      .replace(/\{\{employee_full_name\}\}/gi, 'John Doe')
      .replace(/\{\{manager_name\}\}/gi, 'Jane Smith')
      .replace(/\{\{company_name\}\}/gi, 'Acme Corp')
      .replace(/\{\{event_date\}\}/gi, 'January 15, 2025')
      .replace(/\{\{event_title\}\}/gi, 'Work Permit Renewal')
      .replace(/\{\{days_until\}\}/gi, '14')
      .replace(/\{\{item_name\}\}/gi, 'Work Permit')
      .replace(/\{employee_name\}/gi, 'John Doe')
      .replace(/\{event_date\}/gi, 'January 15, 2025')
      .replace(/\{days_until\}/gi, '14')
      .replace(/\{item_name\}/gi, 'Work Permit');
  };

  if (!category) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg border border-dashed">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="text-sm">Select an event type to see available email templates</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-dashed">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          Email Template
          <Badge variant="outline" className="text-xs">
            {getCategoryLabel(category)}
          </Badge>
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Use custom message</span>
          <Switch
            checked={useCustom}
            onCheckedChange={(checked) => {
              onUseCustomChange(checked);
              if (checked) {
                onSelect(null);
              } else if (templates.length > 0) {
                onSelect(templates[0].id);
              }
            }}
          />
        </div>
      </div>

      {!useCustom && (
        <>
          {templates.length === 0 ? (
            <div className="text-sm text-muted-foreground py-2">
              No templates available for this category.{' '}
              {onNavigateToTemplates && (
                <button
                  type="button"
                  onClick={onNavigateToTemplates}
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Create one <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Select
                  value={selectedTemplateId || ''}
                  onValueChange={(v) => onSelect(v || null)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select email template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          {template.name}
                          {template.is_default && (
                            <Badge variant="secondary" className="text-[10px] ml-1">
                              Default
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setPreviewTemplate(selectedTemplate)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {selectedTemplate && (
                <div className="text-xs text-muted-foreground bg-background p-2 rounded border">
                  <p className="font-medium">Subject: {selectedTemplate.subject}</p>
                  <p className="line-clamp-2 mt-1">{selectedTemplate.body.substring(0, 120)}...</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {useCustom && (
        <p className="text-xs text-muted-foreground">
          The "Message Template" field below will be used for both in-app and email notifications.
        </p>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name} - Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{previewBody(previewTemplate.subject)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm max-h-80 overflow-y-auto">
                {previewBody(previewTemplate.body)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
