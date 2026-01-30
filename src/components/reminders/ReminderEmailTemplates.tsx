import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { REMINDER_CATEGORIES, WORKFORCE_SUBCATEGORIES } from '@/types/reminders';
import { TEMPLATE_PLACEHOLDERS } from './templatePlaceholders';
import { useTemplateAI, EmailTemplateSuggestion } from '@/hooks/useTemplateAI';
import { EmailTemplateRenderedPreview } from './EmailTemplateRenderedPreview';
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
  Zap,
  Sparkles,
  RefreshCw,
  Wand2,
  ClipboardCheck,
  Users,
  Target,
  MessageCircle,
  GitBranch,
  Files,
  Search,
  AlertTriangle
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  company_id: string | null;
  event_type_id: string | null;
  category: string;
  subcategory: string | null;
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

interface TemplateUsageInfo {
  ruleId: string;
  ruleName: string;
}

interface ReminderEmailTemplatesProps {
  companyId: string;
  companyName?: string;
  onUseTemplate?: (template: EmailTemplate) => void;
  onEditRule?: (ruleId: string, ruleName: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  compliance: <Shield className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  employment: <Briefcase className="h-4 w-4" />,
  training: <GraduationCap className="h-4 w-4" />,
  benefits: <Heart className="h-4 w-4" />,
  leave: <Calendar className="h-4 w-4" />,
  milestone: <Award className="h-4 w-4" />,
  performance_appraisals: <ClipboardCheck className="h-4 w-4" />,
  performance_360: <Users className="h-4 w-4" />,
  performance_goals: <Target className="h-4 w-4" />,
  performance_feedback: <MessageCircle className="h-4 w-4" />,
  performance_succession: <GitBranch className="h-4 w-4" />,
  employee_voice: <MessageSquare className="h-4 w-4" />,
  onboarding: <UserPlus className="h-4 w-4" />,
  workforce: <Users className="h-4 w-4" />,
};

export function ReminderEmailTemplates({ companyId, companyName, onUseTemplate, onEditRule }: ReminderEmailTemplatesProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templateUsage, setTemplateUsage] = useState<Map<string, TemplateUsageInfo[]>>(new Map());
  const [cascadeToRules, setCascadeToRules] = useState(true);

  const { 
    isGenerating, 
    isImproving, 
    emailSuggestions, 
    suggestEmailTemplates, 
    improveEmailContent, 
    clearSuggestions 
  } = useTemplateAI();

  const [newTemplate, setNewTemplate] = useState({
    category: '',
    subcategory: '',
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
        .order('subcategory')
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

  const fetchTemplateUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('reminder_rules')
        .select('email_template_id, id, name')
        .eq('company_id', companyId)
        .not('email_template_id', 'is', null);

      if (error) throw error;

      // Group by template_id to support multiple rules per template
      const usageMap = new Map<string, TemplateUsageInfo[]>();
      data?.forEach(rule => {
        if (rule.email_template_id) {
          const existing = usageMap.get(rule.email_template_id) || [];
          existing.push({ ruleId: rule.id, ruleName: rule.name });
          usageMap.set(rule.email_template_id, existing);
        }
      });
      setTemplateUsage(usageMap);
    } catch (error) {
      console.error('Error fetching template usage:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchTemplateUsage();
  }, [companyId]);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = !searchQuery || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, selectedCategory]);

  // Group filtered templates by category
  const groupedTemplates = useMemo(() => {
    return filteredTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, EmailTemplate[]>);
  }, [filteredTemplates]);

  // For workforce category, group by subcategory
  const getWorkforceSubcategoryGroups = useCallback((categoryTemplates: EmailTemplate[]) => {
    const groups: Record<string, EmailTemplate[]> = {};
    
    categoryTemplates.forEach(template => {
      const subcat = template.subcategory || 'other_workforce';
      if (!groups[subcat]) {
        groups[subcat] = [];
      }
      groups[subcat].push(template);
    });
    
    // Sort by WORKFORCE_SUBCATEGORIES order
    const sortedGroups: Record<string, EmailTemplate[]> = {};
    WORKFORCE_SUBCATEGORIES.forEach(sub => {
      if (groups[sub.value]) {
        sortedGroups[sub.value] = groups[sub.value];
      }
    });
    
    return sortedGroups;
  }, []);

  const getSubcategoryLabel = useCallback((subcategory: string) => {
    return WORKFORCE_SUBCATEGORIES.find(s => s.value === subcategory)?.label || subcategory;
  }, []);

  const handleCopyTemplate = (template: EmailTemplate) => {
    navigator.clipboard.writeText(template.body);
    toast.success('Template copied to clipboard');
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setCascadeToRules(true); // Default to cascade
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    setSaving(true);

    try {
      if (editingTemplate.is_default) {
        // Create a company-specific copy of the default template
        const { data: newTemplate, error } = await supabase
          .from('reminder_email_templates')
          .insert({
            company_id: companyId,
            event_type_id: editingTemplate.event_type_id,
            category: editingTemplate.category,
            subcategory: editingTemplate.subcategory,
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            body: editingTemplate.body,
            is_default: false,
            is_active: true,
          })
          .select('id')
          .single();

        if (error) throw error;

        // If cascade is enabled and there are rules using the default template, update them
        const rulesUsingDefault = templateUsage.get(editingTemplate.id) || [];
        if (cascadeToRules && rulesUsingDefault.length > 0 && newTemplate) {
          const { error: updateError } = await supabase
            .from('reminder_rules')
            .update({ email_template_id: newTemplate.id })
            .in('id', rulesUsingDefault.map(r => r.ruleId));

          if (updateError) {
            console.error('Error updating rules:', updateError);
            toast.warning('Template created, but some rules could not be updated');
          } else {
            toast.success(`Custom template created and ${rulesUsingDefault.length} rule(s) updated`);
          }
        } else {
          toast.success('Custom template created');
        }
      } else {
        // Update existing company template - changes cascade automatically via FK
        const { error } = await supabase
          .from('reminder_email_templates')
          .update({
            name: editingTemplate.name,
            subject: editingTemplate.subject,
            body: editingTemplate.body,
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;

        // Notify user about affected rules
        const rulesUsingTemplate = templateUsage.get(editingTemplate.id) || [];
        if (rulesUsingTemplate.length > 0) {
          toast.success(`Template updated — ${rulesUsingTemplate.length} active rule(s) will use the new content`);
        } else {
          toast.success('Template updated');
        }
      }

      setIsEditing(false);
      setEditingTemplate(null);
      fetchTemplates();
      fetchTemplateUsage();
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
          subcategory: newTemplate.category === 'workforce' ? newTemplate.subcategory : null,
          name: newTemplate.name,
          subject: newTemplate.subject,
          body: newTemplate.body,
          is_default: false,
          is_active: true,
        });

      if (error) throw error;
      
      toast.success('Template created');
      setIsCreating(false);
      setNewTemplate({ category: '', subcategory: '', name: '', subject: '', body: '' });
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

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    setSaving(true);
    try {
      // Generate a unique name for the duplicate
      const baseName = template.name.replace(/\s*\(Copy\s*\d*\)$/, '');
      const existingCopies = templates.filter(t => 
        t.name.startsWith(baseName) && t.name !== template.name
      ).length;
      const newName = existingCopies > 0 
        ? `${baseName} (Copy ${existingCopies + 1})`
        : `${baseName} (Copy)`;

      const { error } = await supabase
        .from('reminder_email_templates')
        .insert({
          company_id: companyId,
          category: template.category,
          subcategory: template.subcategory,
          name: newName,
          subject: template.subject,
          body: template.body,
          is_default: false,
          is_active: true,
        });

      if (error) throw error;
      
      toast.success(`Template duplicated as "${newName}"`);
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    } finally {
      setSaving(false);
    }
  };

  const replacementOptions = useMemo(() => ({
    companyName: companyName || 'Your Company',
  }), [companyName]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategory: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategory)) {
      newExpanded.delete(subcategory);
    } else {
      newExpanded.add(subcategory);
    }
    setExpandedSubcategories(newExpanded);
  };

  const getCategoryLabel = useCallback((category: string) => {
    return REMINDER_CATEGORIES.find(c => c.value === category)?.label || category;
  }, []);

  // Trigger AI suggestions when category changes in create dialog
  const handleCategoryChange = useCallback((category: string) => {
    setNewTemplate(prev => ({ ...prev, category, subcategory: '' }));
    
    // Get existing templates in this category
    const existingInCategory = templates
      .filter(t => t.category === category)
      .map(t => t.name);
    
    // Trigger AI suggestions
    const categoryLabel = getCategoryLabel(category);
    suggestEmailTemplates(categoryLabel, existingInCategory);
  }, [templates, getCategoryLabel, suggestEmailTemplates]);

  // Apply AI suggestion to form
  const applySuggestion = useCallback((suggestion: EmailTemplateSuggestion) => {
    setNewTemplate(prev => ({
      ...prev,
      name: suggestion.title,
      subject: suggestion.subject,
      body: suggestion.content.replace(/\\n/g, '\n'),
    }));
    toast.success('Template applied! You can customize it further.');
  }, []);

  // Improve body content with AI
  const handleImproveBody = useCallback(async () => {
    if (!newTemplate.body.trim()) {
      toast.error('Please add some content first');
      return;
    }
    
    const improved = await improveEmailContent(newTemplate.body);
    if (improved) {
      setNewTemplate(prev => ({ ...prev, body: improved }));
      toast.success('Content improved!');
    }
  }, [newTemplate.body, improveEmailContent]);

  // Refresh AI suggestions
  const handleRefreshSuggestions = useCallback(() => {
    if (!newTemplate.category) return;
    
    const existingInCategory = templates
      .filter(t => t.category === newTemplate.category)
      .map(t => t.name);
    
    const categoryLabel = getCategoryLabel(newTemplate.category);
    suggestEmailTemplates(categoryLabel, existingInCategory);
  }, [newTemplate.category, templates, getCategoryLabel, suggestEmailTemplates]);

  // Clear suggestions when dialog closes
  useEffect(() => {
    if (!isCreating) {
      clearSuggestions();
    }
  }, [isCreating, clearSuggestions]);

  // Render template card
  const renderTemplateCard = (template: EmailTemplate) => {
    const usageList = templateUsage.get(template.id) || [];
    const isInUse = usageList.length > 0;

    return (
      <div 
        key={template.id}
        className="p-4 border rounded-lg bg-background hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-sm">{template.name}</p>
            {template.is_default && (
              <Badge variant="secondary" className="text-xs">
                Default
              </Badge>
            )}
            {isInUse && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                <Zap className="h-3 w-3 mr-1" />
                In Use{usageList.length > 1 ? ` (${usageList.length})` : ''}
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
          {onUseTemplate && !isInUse && (
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
          {onEditRule && isInUse && usageList.length === 1 && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onEditRule(usageList[0].ruleId, usageList[0].ruleName)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit Rule
            </Button>
          )}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleDuplicateTemplate(template)}
          disabled={saving}
          title="Duplicate template"
        >
          <Files className="h-3.5 w-3.5 mr-1" />
          Duplicate
        </Button>
        {!template.is_default && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleResetToDefault(template)}
            className="text-muted-foreground"
            title="Delete custom template"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        )}
        </div>
      </div>
    );
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {REMINDER_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                  {category === 'workforce' ? (
                    // Workforce category with subcategories
                    <div className="space-y-4">
                      {Object.entries(getWorkforceSubcategoryGroups(categoryTemplates)).map(([subcategory, subTemplates]) => (
                        <Collapsible
                          key={subcategory}
                          open={expandedSubcategories.has(subcategory)}
                          onOpenChange={() => toggleSubcategory(subcategory)}
                        >
                          <div className="border rounded-lg">
                            <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{getSubcategoryLabel(subcategory)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {subTemplates.length}
                                </Badge>
                              </div>
                              {expandedSubcategories.has(subcategory) 
                                ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              }
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {subTemplates.map(template => renderTemplateCard(template))}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    // Other categories - flat list
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {categoryTemplates.map(template => renderTemplateCard(template))}
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No templates found matching your search.</p>
        </div>
      )}

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
            <EmailTemplateRenderedPreview
              subject={previewTemplate.subject}
              body={previewTemplate.body}
              replacementOptions={replacementOptions}
              maxHeight="400px"
            />
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
              {/* Warning for templates in use */}
              {(() => {
                const rulesUsingTemplate = templateUsage.get(editingTemplate.id) || [];
                if (rulesUsingTemplate.length > 0) {
                  return (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-amber-800 dark:text-amber-200">
                            {editingTemplate.is_default 
                              ? 'This template is used by active automations'
                              : 'Changes will affect active automations'
                            }
                          </p>
                          <p className="text-amber-700 dark:text-amber-300 mt-1">
                            {editingTemplate.is_default
                              ? `${rulesUsingTemplate.length} rule(s) currently use this default template.`
                              : `${rulesUsingTemplate.length} rule(s) will automatically use the updated content.`
                            }
                          </p>
                          {rulesUsingTemplate.length <= 3 && (
                            <ul className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                              {rulesUsingTemplate.map(r => (
                                <li key={r.ruleId}>• {r.ruleName}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Cascade option for default templates */}
              {editingTemplate.is_default && (templateUsage.get(editingTemplate.id) || []).length > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <Label htmlFor="cascade-toggle" className="text-sm font-medium">
                      Update existing rules to use custom template
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Switch rules from the default template to your new custom version
                    </p>
                  </div>
                  <Switch
                    id="cascade-toggle"
                    checked={cascadeToRules}
                    onCheckedChange={setCascadeToRules}
                  />
                </div>
              )}

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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a custom email template for your organization
            </DialogDescription>
          </DialogHeader>
          
          {/* Company Indicator */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 border rounded-lg">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Creating template for:</span>
            <Badge variant="secondary" className="font-medium">
              {companyName || 'Selected Company'}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select 
                  value={newTemplate.category}
                  onValueChange={handleCategoryChange}
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

            {/* Subcategory selector for workforce */}
            {newTemplate.category === 'workforce' && (
              <div>
                <Label>Subcategory</Label>
                <Select 
                  value={newTemplate.subcategory}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, subcategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFORCE_SUBCATEGORIES.map(sub => (
                      <SelectItem key={sub.value} value={sub.value}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* AI Suggestions Section */}
            {newTemplate.category && (
              <Card className="border-dashed border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm">AI Suggestions</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRefreshSuggestions}
                      disabled={isGenerating}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    Based on "{getCategoryLabel(newTemplate.category)}"
                    {(() => {
                      const existingTemplates = templates.filter(t => t.category === newTemplate.category);
                      if (existingTemplates.length > 0) {
                        return (
                          <>
                            {` • ${existingTemplates.length} templates already exist`}
                            <span className="block mt-1 text-muted-foreground/80 italic">
                              Existing: {existingTemplates.map(t => t.name).join(', ')}
                            </span>
                          </>
                        );
                      }
                      return null;
                    })()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {isGenerating ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-3 border rounded-lg bg-background">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-full mb-1" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : emailSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {emailSuggestions.map((suggestion, index) => (
                        <div 
                          key={index}
                          className="p-3 border rounded-lg bg-background hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                          onClick={() => applySuggestion(suggestion)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-medium text-sm line-clamp-1">{suggestion.title}</p>
                            <Badge variant="outline" className="text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              Use
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {suggestion.useCase}
                          </p>
                          <p className="text-xs text-muted-foreground/70 line-clamp-1 italic">
                            Subject: {suggestion.subject}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No suggestions available. Click refresh to generate.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Click a suggestion to use it, or write your own below ↓
                  </p>
                </CardContent>
              </Card>
            )}

            <div>
              <Label>Subject Line</Label>
              <Input
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                placeholder="e.g., Reminder: {{event_title}} Due {{event_date}}"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Email Body</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleImproveBody}
                  disabled={isImproving || !newTemplate.body.trim()}
                  className="h-7 text-xs gap-1.5"
                >
                  {isImproving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3" />
                  )}
                  Improve with AI
                </Button>
              </div>
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
