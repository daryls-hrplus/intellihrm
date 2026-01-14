import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Pencil,
  Loader2,
  AlertCircle,
  Shield,
  Briefcase,
  Calendar,
  Trophy,
  Users,
  MessageSquare,
  UserCheck,
  GraduationCap,
  Heart,
  FileText,
  Settings,
  Bell,
  ArrowRight,
  Mail,
  FolderOpen
} from 'lucide-react';
import { REMINDER_CATEGORIES, type ReminderCategory } from '@/types/reminders';

interface QuickSetupWizardProps {
  companyId: string;
  categoryCoverage: Record<string, { count: number; hasRules: boolean }>;
  onRuleCreated: () => void;
  onCustomize: (recommendation: AIRecommendation) => void;
}

interface AIRecommendation {
  name: string;
  eventTypeCode: string;
  eventTypeName: string;
  intervals: number[];
  recipients: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  templateId?: string;
  templateName?: string;
  category: string;
  sourceType: 'category' | 'template';
}

interface OrphanedTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  custom: <Settings className="h-4 w-4" />,
  onboarding: <UserCheck className="h-4 w-4" />,
  employment: <Briefcase className="h-4 w-4" />,
  leave: <Calendar className="h-4 w-4" />,
  performance_appraisals: <Trophy className="h-4 w-4" />,
  performance_360: <Users className="h-4 w-4" />,
  performance_goals: <CheckCircle2 className="h-4 w-4" />,
  performance_feedback: <MessageSquare className="h-4 w-4" />,
  performance_succession: <UserCheck className="h-4 w-4" />,
  employee_voice: <MessageSquare className="h-4 w-4" />,
  training: <GraduationCap className="h-4 w-4" />,
  benefits: <Heart className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  milestone: <Trophy className="h-4 w-4" />,
};

export function QuickSetupWizard({ 
  companyId, 
  categoryCoverage, 
  onRuleCreated, 
  onCustomize 
}: QuickSetupWizardProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'templates'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [creating, setCreating] = useState(false);
  const [orphanedTemplates, setOrphanedTemplates] = useState<OrphanedTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Get categories without rules
  const uncoveredCategories = useMemo(() => {
    return REMINDER_CATEGORIES.filter(
      cat => !categoryCoverage[cat.value]?.hasRules
    );
  }, [categoryCoverage]);

  // Fetch orphaned templates (templates with no associated rules)
  useEffect(() => {
    const fetchOrphanedTemplates = async () => {
      setLoadingTemplates(true);
      try {
        // Get all active templates
        const { data: allTemplates, error: templatesError } = await supabase
          .from('reminder_email_templates')
          .select('id, name, category, subject')
          .eq('is_active', true)
          .order('category', { ascending: true });

        if (templatesError) throw templatesError;

        // Get all templates that have rules
        const { data: templatesWithRules, error: rulesError } = await supabase
          .from('reminder_rules')
          .select('email_template_id')
          .not('email_template_id', 'is', null);

        if (rulesError) throw rulesError;

        // Filter to find orphaned templates
        const templateIdsWithRules = new Set(
          templatesWithRules?.map(r => r.email_template_id) || []
        );

        const orphaned = (allTemplates || []).filter(
          t => !templateIdsWithRules.has(t.id)
        );

        setOrphanedTemplates(orphaned);
      } catch (error) {
        console.error('Error fetching orphaned templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchOrphanedTemplates();
  }, []);

  // Group orphaned templates by category
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, OrphanedTemplate[]> = {};
    orphanedTemplates.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    });
    return grouped;
  }, [orphanedTemplates]);

  const handleAISuggest = async (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setSelectedTemplateId(null);
    setLoading(true);
    setRecommendation(null);

    try {
      // Fetch event types for this category
      const { data: eventTypes, error: eventError } = await supabase
        .from('reminder_event_types')
        .select('*')
        .eq('category', categoryValue)
        .eq('is_active', true)
        .limit(1);

      if (eventError) throw eventError;

      // Fetch templates for this category
      const { data: templates, error: templateError } = await supabase
        .from('reminder_email_templates')
        .select('id, name')
        .eq('category', categoryValue)
        .eq('is_active', true)
        .limit(1);

      if (templateError) throw templateError;

      const eventType = eventTypes?.[0];
      const template = templates?.[0];
      const categoryLabel = REMINDER_CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue;

      // Generate AI recommendation based on category patterns
      const aiRecommendation: AIRecommendation = generateRecommendation(
        categoryValue,
        categoryLabel,
        eventType,
        template,
        'category'
      );

      setRecommendation(aiRecommendation);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      toast.error('Failed to generate recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestForTemplate = async (template: OrphanedTemplate) => {
    setSelectedTemplateId(template.id);
    setSelectedCategory(null);
    setLoading(true);
    setRecommendation(null);

    try {
      // Fetch event types for this category
      const { data: eventTypes, error: eventError } = await supabase
        .from('reminder_event_types')
        .select('*')
        .eq('category', template.category)
        .eq('is_active', true)
        .limit(1);

      if (eventError) throw eventError;

      const eventType = eventTypes?.[0];
      const categoryLabel = REMINDER_CATEGORIES.find(c => c.value === template.category)?.label || template.category;

      // Generate AI recommendation with the template pre-selected
      const aiRecommendation: AIRecommendation = generateRecommendation(
        template.category,
        categoryLabel,
        eventType,
        { id: template.id, name: template.name },
        'template'
      );

      // Use template name for rule name
      aiRecommendation.name = `${template.name} Automation`;

      setRecommendation(aiRecommendation);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      toast.error('Failed to generate recommendation');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendation = (
    category: string,
    categoryLabel: string,
    eventType: any,
    template: any,
    sourceType: 'category' | 'template'
  ): AIRecommendation => {
    // Default recommendations based on category patterns
    const patterns: Record<string, Partial<AIRecommendation>> = {
      compliance: {
        intervals: [90, 60, 30, 14, 7],
        priority: 'critical',
        recipients: ['employee', 'manager', 'hr'],
      },
      document: {
        intervals: [60, 30, 14, 7],
        priority: 'high',
        recipients: ['employee', 'hr'],
      },
      employment: {
        intervals: [30, 14, 7],
        priority: 'high',
        recipients: ['employee', 'manager'],
      },
      onboarding: {
        intervals: [7, 3, 1],
        priority: 'medium',
        recipients: ['employee', 'manager'],
      },
      performance_appraisals: {
        intervals: [14, 7, 3],
        priority: 'high',
        recipients: ['employee', 'manager'],
      },
      training: {
        intervals: [30, 14, 7],
        priority: 'medium',
        recipients: ['employee', 'manager'],
      },
      leave: {
        intervals: [7, 3],
        priority: 'medium',
        recipients: ['employee', 'manager'],
      },
      benefits: {
        intervals: [30, 14, 7],
        priority: 'medium',
        recipients: ['employee', 'hr'],
      },
    };

    const pattern = patterns[category] || {
      intervals: [14, 7],
      priority: 'medium',
      recipients: ['employee', 'manager'],
    };

    return {
      name: `${categoryLabel} Reminder`,
      eventTypeCode: eventType?.code || '',
      eventTypeName: eventType?.name || `${categoryLabel} Event`,
      intervals: pattern.intervals as number[],
      recipients: pattern.recipients as string[],
      priority: pattern.priority as 'low' | 'medium' | 'high' | 'critical',
      templateId: template?.id,
      templateName: template?.name,
      category,
      sourceType,
    };
  };

  const handleAcceptRecommendation = async () => {
    if (!recommendation) return;

    setCreating(true);
    try {
      // Find the event type ID
      const { data: eventTypes } = await supabase
        .from('reminder_event_types')
        .select('id')
        .eq('category', recommendation.category)
        .eq('is_active', true)
        .limit(1);

      const eventTypeId = eventTypes?.[0]?.id;

      if (!eventTypeId) {
        toast.error('No event type available for this category');
        setCreating(false);
        return;
      }

      const { error } = await supabase.from('reminder_rules').insert({
        company_id: companyId,
        name: recommendation.name,
        description: `AI-generated rule for ${recommendation.category}`,
        event_type_id: eventTypeId,
        days_before: recommendation.intervals[0],
        reminder_intervals: recommendation.intervals,
        send_to_employee: recommendation.recipients.includes('employee'),
        send_to_manager: recommendation.recipients.includes('manager'),
        send_to_hr: recommendation.recipients.includes('hr'),
        notification_method: 'both',
        email_template_id: recommendation.templateId || null,
        priority: recommendation.priority,
        is_active: false,
      });

      if (error) throw error;

      toast.success(`Rule created for ${recommendation.eventTypeName}`);
      setRecommendation(null);
      setSelectedCategory(null);
      setSelectedTemplateId(null);
      
      // Remove template from orphaned list if it was a template-based rule
      if (recommendation.sourceType === 'template' && recommendation.templateId) {
        setOrphanedTemplates(prev => prev.filter(t => t.id !== recommendation.templateId));
      }
      
      onRuleCreated();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create rule');
    } finally {
      setCreating(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    return REMINDER_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  // Check if fully configured
  const isFullyConfigured = uncoveredCategories.length === 0 && orphanedTemplates.length === 0;

  if (isFullyConfigured) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
        <h3 className="text-lg font-medium text-green-700">Fully Configured!</h3>
        <p className="text-sm text-muted-foreground mt-2">
          All categories have rules and all templates are linked to automation rules.
        </p>
      </div>
    );
  }

  // Render recommendation card
  const renderRecommendationCard = () => {
    if (!recommendation) return null;

    return (
      <div className="p-3 bg-background rounded-lg border space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Recommended Rule</p>
          {recommendation.sourceType === 'template' && (
            <Badge variant="secondary" className="text-[10px]">Template-based</Badge>
          )}
        </div>
        
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{recommendation.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event:</span>
            <span>{recommendation.eventTypeName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Intervals:</span>
            <div className="flex gap-1">
              {recommendation.intervals.map(i => (
                <Badge key={i} variant="outline" className="text-xs">{i}d</Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Recipients:</span>
            <div className="flex gap-1">
              {recommendation.recipients.map(r => (
                <Badge key={r} variant="secondary" className="text-xs capitalize">{r}</Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Template:</span>
            <span className={recommendation.templateName ? '' : 'text-amber-600'}>
              {recommendation.templateName || 'None available'}
            </span>
          </div>
        </div>
        
        {/* Warning if no template */}
        {!recommendation.templateId && (
          <div className="text-xs text-amber-600 flex items-center gap-1 p-2 bg-amber-50 dark:bg-amber-950/30 rounded">
            <AlertCircle className="h-3 w-3" />
            No template found. Create one in the Templates tab first, or use custom message.
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={handleAcceptRecommendation}
            disabled={creating}
            className="flex-1"
          >
            {creating ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            )}
            Accept & Create
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onCustomize(recommendation)}
            className="flex-1"
          >
            <Pencil className="h-3 w-3 mr-1" />
            Customize
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <Zap className="h-10 w-10 mx-auto mb-2 text-amber-500" />
        <h3 className="text-lg font-medium">Quick Setup Wizard</h3>
        <p className="text-sm text-muted-foreground">
          Rapidly configure rules for categories and templates without automation
        </p>
      </div>
      
      {/* Coverage Summary */}
      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg space-y-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Quick Setup Opportunities
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-amber-700 dark:text-amber-300">
          <span className="flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            {uncoveredCategories.length} categories without rules
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {loadingTemplates ? '...' : orphanedTemplates.length} templates without linked rules
          </span>
        </div>
      </div>

      {/* Tabs for Categories and Templates */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'categories' | 'templates')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="h-3 w-3" />
            Categories
            {uncoveredCategories.length > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {uncoveredCategories.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-3 w-3" />
            Templates
            {orphanedTemplates.length > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {orphanedTemplates.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-4">
          {uncoveredCategories.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <h4 className="font-medium text-green-700">All Categories Covered!</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Every category has at least one automation rule.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {uncoveredCategories.map((category) => {
                const isSelected = selectedCategory === category.value;
                const hasRecommendation = isSelected && recommendation;
                
                return (
                  <Card 
                    key={category.value} 
                    className={`border-dashed transition-all ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                  >
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                            {CATEGORY_ICONS[category.value] || <Bell className="h-4 w-4" />}
                          </div>
                          <div>
                            <span className="font-medium text-sm">{category.label}</span>
                            <p className="text-xs text-muted-foreground">No rules configured</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleAISuggest(category.value)}
                          disabled={loading && isSelected}
                        >
                          {loading && isSelected ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          AI Suggest
                        </Button>
                      </div>
                    </CardHeader>
                    
                    {/* AI-generated recommendation */}
                    {hasRecommendation && (
                      <CardContent className="pt-0">
                        {renderRecommendationCard()}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          {loadingTemplates ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : orphanedTemplates.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-500" />
              <h4 className="font-medium text-green-700">All Templates Linked!</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Every template is connected to an automation rule.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 sticky top-0 bg-background py-1">
                    <div className="p-1.5 rounded bg-muted">
                      {CATEGORY_ICONS[category] || <FileText className="h-3 w-3" />}
                    </div>
                    <span className="text-sm font-medium">{getCategoryLabel(category)}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {templates.length} template{templates.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  {templates.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    const hasRecommendation = isSelected && recommendation;
                    
                    return (
                      <Card 
                        key={template.id} 
                        className={`border-dashed ml-4 transition-all ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                      >
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                <Mail className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{template.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  No automation rule linked
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => handleSuggestForTemplate(template)}
                              disabled={loading && isSelected}
                              className="flex-shrink-0"
                            >
                              {loading && isSelected ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3 mr-1" />
                              )}
                              Create Rule
                            </Button>
                          </div>
                        </CardHeader>
                        
                        {/* AI-generated recommendation */}
                        {hasRecommendation && (
                          <CardContent className="pt-0">
                            {renderRecommendationCard()}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Quick action for all */}
      {(uncoveredCategories.length > 3 || orphanedTemplates.length > 5) && (
        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full" disabled>
            <Zap className="h-4 w-4 mr-2" />
            Setup All at Once (Coming Soon)
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
