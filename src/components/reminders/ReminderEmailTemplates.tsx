import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { REMINDER_CATEGORIES } from '@/types/reminders';
import { TEMPLATE_PLACEHOLDERS } from './templatePlaceholders';
import { 
  Mail, 
  Copy, 
  Edit, 
  Eye, 
  Save, 
  Plus,
  ChevronDown,
  ChevronRight,
  Shield,
  FileText,
  Briefcase,
  GraduationCap,
  Heart,
  Calendar,
  Award,
  MessageSquare,
  UserPlus,
  Loader2,
  RotateCcw,
  Zap
} from 'lucide-react';

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
  created_at: string;
}

interface ReminderEmailTemplatesProps {
  companyId: string;
  onUseTemplate?: (template: EmailTemplate) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  compliance: <Shield className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  employment: <Briefcase className="h-4 w-4" />,
  training: <GraduationCap className="h-4 w-4" />,
  benefits: <Heart className="h-4 w-4" />,
  leave: <Calendar className="h-4 w-4" />,
  milestone: <Award className="h-4 w-4" />,
  performance: <Award className="h-4 w-4" />,
  employee_voice: <MessageSquare className="h-4 w-4" />,
  onboarding: <UserPlus className="h-4 w-4" />,
};

export function ReminderEmailTemplates({ companyId, onUseTemplate }: ReminderEmailTemplatesProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    category: '',
    name: '',
    subject: '',
    body: '',
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reminder_email_templates')
        .select('*')
        .or(`is_default.eq.true,company_id.eq.${companyId}`)
        .eq('is_active', true)
        .order('category')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);

      // Auto-expand first category with templates
      if (data && data.length > 0) {
        const categories = [...new Set(data.map(t => t.category))];
        setExpandedCategories(new Set([categories[0]]));
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [companyId]);

  const handleCopyTemplate = (template: EmailTemplate) => {
    navigator.clipboard.writeText(template.body);
    toast.success('Template copied to clipboard');
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setSaving(true);

    try {
      if (editingTemplate.is_default) {
        // Create a company-specific copy of the default template
        const { error } = await supabase
          .from('reminder_email_templates')
          .insert({
            company_id: companyId,
            event_type_id: editingTemplate.event_type_id,
            category: editingTemplate.category,
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            body: editingTemplate.body,
            is_default: false,
            is_active: true,
          });

        if (error) throw error;
        toast.success('Custom template created');
      } else {
        // Update existing company template
        const { error } = await supabase
          .from('reminder_email_templates')
          .update({
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            body: editingTemplate.body,
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template updated');
      }

      setIsEditing(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.category || !newTemplate.name || !newTemplate.subject || !newTemplate.body) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('reminder_email_templates')
        .insert({
          company_id: companyId,
          category: newTemplate.category,
          name: newTemplate.name,
          subject: newTemplate.subject,
          body: newTemplate.body,
          is_default: false,
          is_active: true,
        });

      if (error) throw error;
      
      toast.success('Template created');
      setIsCreating(false);
      setNewTemplate({ category: '', name: '', subject: '', body: '' });
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async (template: EmailTemplate) => {
    if (template.is_default) return;
    
    try {
      const { error } = await supabase
        .from('reminder_email_templates')
        .delete()
        .eq('id', template.id);

      if (error) throw error;
      
      toast.success('Reset to default template');
      fetchTemplates();
    } catch (error) {
      console.error('Error resetting template:', error);
      toast.error('Failed to reset template');
    }
  };

  const previewBody = (text: string) => {
    return text
      .replace(/\{\{employee_first_name\}\}/gi, 'John')
      .replace(/\{\{employee_full_name\}\}/gi, 'John Doe')
      .replace(/\{\{manager_name\}\}/gi, 'Jane Smith')
      .replace(/\{\{company_name\}\}/gi, 'Acme Corp')
      .replace(/\{\{event_date\}\}/gi, 'January 15, 2025')
      .replace(/\{\{event_title\}\}/gi, 'Work Permit Renewal')
      .replace(/\{\{days_until\}\}/gi, '14')
      .replace(/\{\{cycle_name\}\}/gi, '2024 Annual Review');
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, EmailTemplate[]>);

  const getCategoryLabel = (category: string) => {
    return REMINDER_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Customize notification emails for all reminder categories
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Placeholder Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Available Placeholders</CardTitle>
          <CardDescription className="text-xs">
            Click to copy. Use double curly braces in templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_PLACEHOLDERS.slice(0, 10).map(placeholder => (
              <Badge 
                key={placeholder.key} 
                variant="outline" 
                className="cursor-pointer hover:bg-muted text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(placeholder.key);
                  toast.success('Copied to clipboard');
                }}
              >
                {placeholder.key}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates by Category */}
      <div className="space-y-3">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <Collapsible 
            key={category}
            open={expandedCategories.has(category)}
            onOpenChange={() => toggleCategory(category)}
          >
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-muted rounded">
                        {CATEGORY_ICONS[category] || <Mail className="h-4 w-4" />}
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-sm">{getCategoryLabel(category)}</CardTitle>
                        <CardDescription className="text-xs">
                          {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                    {expandedCategories.has(category) 
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {categoryTemplates.map(template => (
                      <div 
                        key={template.id}
                        className="p-4 border rounded-lg bg-background hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-medium text-sm">{template.name}</p>
                            {template.is_default && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground">Subject</p>
                          <p className="text-sm truncate">{template.subject}</p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {template.body.substring(0, 100)}...
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            {template.is_default ? 'Customize' : 'Edit'}
                          </Button>
                          {onUseTemplate && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => onUseTemplate(template)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Zap className="h-3.5 w-3.5 mr-1" />
                              Use in Rule
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleCopyTemplate(template)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          {!template.is_default && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleResetToDefault(template)}
                              className="text-muted-foreground"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name} - Preview</DialogTitle>
            <DialogDescription>
              This is how the email will appear with sample data
            </DialogDescription>
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

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.is_default ? 'Customize Template' : 'Edit Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate?.is_default 
                ? 'Create a custom version of this template for your company'
                : 'Update your custom email template'
              }
            </DialogDescription>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    name: e.target.value
                  })}
                />
              </div>
              <div>
                <Label>Subject Line</Label>
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    subject: e.target.value
                  })}
                />
              </div>
              <div>
                <Label>Email Body</Label>
                <Textarea
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    body: e.target.value
                  })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Click placeholders to insert</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {TEMPLATE_PLACEHOLDERS.slice(0, 8).map(p => (
                    <Badge 
                      key={p.key} 
                      variant="secondary" 
                      className="cursor-pointer text-xs"
                      onClick={() => {
                        setEditingTemplate({
                          ...editingTemplate,
                          body: editingTemplate.body + ' ' + p.key
                        });
                      }}
                    >
                      {p.key}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {editingTemplate?.is_default ? 'Create Custom' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a custom email template for your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select 
                  value={newTemplate.category}
                  onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Custom Visa Reminder"
                />
              </div>
            </div>
            <div>
              <Label>Subject Line</Label>
              <Input
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                placeholder="e.g., Reminder: {{event_title}} Due {{event_date}}"
              />
            </div>
            <div>
              <Label>Email Body</Label>
              <Textarea
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                rows={10}
                className="font-mono text-sm"
                placeholder="Dear {{employee_first_name}},&#10;&#10;This is a reminder..."
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Click placeholders to insert</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {TEMPLATE_PLACEHOLDERS.slice(0, 8).map(p => (
                  <Badge 
                    key={p.key} 
                    variant="secondary" 
                    className="cursor-pointer text-xs"
                    onClick={() => {
                      setNewTemplate({
                        ...newTemplate,
                        body: newTemplate.body + ' ' + p.key
                      });
                    }}
                  >
                    {p.key}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
