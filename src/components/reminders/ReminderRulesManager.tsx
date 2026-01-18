import { useState, useEffect, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { useReminders } from '@/hooks/useReminders';
import { useReminderSourcePreview } from '@/hooks/useReminderSourcePreview';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Pencil, Trash2, Bell, Mail, BellRing, Loader2, X, Settings, HelpCircle, Zap, 
  FileText, Search, ChevronDown, ChevronRight, AlertCircle, Shield, Briefcase, 
  GraduationCap, Heart, Calendar, Trophy, MessageSquare, UserCheck, FolderOpen, 
  CheckCircle2, Sparkles, Users, CalendarIcon, ArrowUpDown
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ReminderRule, ReminderEventType } from '@/types/reminders';
import { PRIORITY_OPTIONS, REMINDER_CATEGORIES } from '@/types/reminders';
import { UnifiedRuleDialog, type DialogMode } from './UnifiedRuleDialog';

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

export const ReminderRulesManager = forwardRef<ReminderRulesManagerRef, ReminderRulesManagerProps>(
  function ReminderRulesManager({ companyId, companyName, highlightRuleId }, ref) {
  const { fetchRules, fetchEventTypes, deleteRule, isLoading } = useReminders();
  const { fetchRuleAffectedCount } = useReminderSourcePreview();
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [highlightedRuleId, setHighlightedRuleId] = useState<string | null>(null);
  const ruleRowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [eventTypes, setEventTypes] = useState<ReminderEventType[]>([]);
  const [ruleAffectedCounts, setRuleAffectedCounts] = useState<Record<string, { count: number; employeeCount: number }>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('ai-assist');
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null);
  const [linkedTemplate, setLinkedTemplate] = useState<{ id: string; name: string; category: string } | null>(null);
  
  // Bulk activation states
  const [showBulkDateDialog, setShowBulkDateDialog] = useState(false);
  const [bulkEffectiveDate, setBulkEffectiveDate] = useState<string | null>(null);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  
  // Category-based filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Sorting states
  const [sortField, setSortField] = useState<'sequence' | 'name' | 'priority' | 'status'>('sequence');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sorting
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Quick toggle handler for status
  const handleQuickToggle = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('reminder_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);
      
      if (error) throw error;
      toast.success(isActive ? 'Rule activated' : 'Rule deactivated');
      loadData();
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('Failed to update rule');
    }
  };

  // Get lifecycle stage for visual indicator
  const getLifecycleStage = (code: string) => {
    if (code.includes('STARTING') || code.includes('KICKOFF') || code.includes('ACTIVATED') || code.includes('STARTED')) {
      return { label: 'Start', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
    }
    if (code.includes('DUE') || code.includes('DEADLINE') || code.includes('PROCESSING') || code.includes('SCHEDULED')) {
      return { label: 'Active', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    }
    if (code.includes('ENDING') || code.includes('OVERDUE') || code.includes('EXPIRING') || code.includes('LOW')) {
      return { label: 'Closing', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
    }
    if (code.includes('FINALIZED') || code.includes('CREATED') || code.includes('COMPLETED') || code.includes('AVAILABLE')) {
      return { label: 'Complete', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
    }
    return { label: 'Other', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' };
  };


  // Get rule category from event_type
  const getRuleCategory = (rule: ReminderRule): string => {
    return rule.event_type?.category || 'custom';
  };

  // Group rules by category with filtering and sorting
  const groupedRules = useMemo(() => {
    const filtered = rules.filter(rule => {
      const matchesSearch = !searchQuery || 
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.event_type?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || getRuleCategory(rule) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    
    // Sort filtered rules based on sortField and sortDirection
    const sortedFiltered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'sequence':
          const seqA = a.event_type?.sequence_order ?? 100;
          const seqB = b.event_type?.sequence_order ?? 100;
          comparison = seqA - seqB;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          comparison = (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
          break;
        case 'status':
          const getStatusOrder = (rule: ReminderRule) => {
            const today = new Date().toISOString().split('T')[0];
            const isExpired = rule.effective_to && rule.effective_to < today;
            const isScheduled = rule.effective_from && rule.effective_from > today;
            const isEffectiveNow = rule.effective_from && rule.effective_from <= today;
            if (isExpired) return 4;
            if (!rule.is_active) return 3;
            if (rule.is_active && !rule.effective_from) return 2;
            if (isScheduled) return 1;
            if (rule.is_active && isEffectiveNow) return 0;
            return 5;
          };
          comparison = getStatusOrder(a) - getStatusOrder(b);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sortedFiltered.reduce((acc, rule) => {
      const category = getRuleCategory(rule);
      if (!acc[category]) acc[category] = [];
      acc[category].push(rule);
      return acc;
    }, {} as Record<string, ReminderRule[]>);
  }, [rules, searchQuery, selectedCategory, sortField, sortDirection]);

  // Calculate category coverage
  const categoryCoverage = useMemo(() => {
    const coverage: Record<string, { count: number; hasRules: boolean }> = {};
    
    REMINDER_CATEGORIES.forEach(cat => {
      const rulesInCategory = rules.filter(r => getRuleCategory(r) === cat.value);
      coverage[cat.value] = {
        count: rulesInCategory.length,
        hasRules: rulesInCategory.length > 0
      };
    });
    
    return coverage;
  }, [rules]);

  const categoriesWithRules = Object.values(categoryCoverage).filter(c => c.hasRules).length;

  // Calculate draft rules that need activation (respects category filter)
  const draftRules = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return rules.filter(rule => {
      const hasEffectiveFrom = !!rule.effective_from;
      const isExpired = rule.effective_to && rule.effective_to < today;
      const isDraft = rule.is_active && !hasEffectiveFrom && !isExpired;
      
      // If a category is selected, only include draft rules from that category
      if (selectedCategory) {
        const ruleCategory = rule.event_type?.category || 'custom';
        return isDraft && ruleCategory === selectedCategory;
      }
      
      return isDraft;
    });
  }, [rules, selectedCategory]);

  // Bulk set effective date handler
  const handleBulkSetEffectiveDate = async () => {
    if (!bulkEffectiveDate || draftRules.length === 0) return;
    
    setIsBulkUpdating(true);
    try {
      const ruleIds = draftRules.map(r => r.id);
      
      const { error } = await supabase
        .from('reminder_rules')
        .update({ 
          effective_from: bulkEffectiveDate,
          is_active: true 
        })
        .in('id', ruleIds);
      
      if (error) throw error;
      
      toast.success(`${ruleIds.length} rule${ruleIds.length !== 1 ? 's' : ''} activated`, {
        description: `Effective from ${format(parseISO(bulkEffectiveDate), 'PPP')}`,
      });
      
      setShowBulkDateDialog(false);
      setBulkEffectiveDate(null);
      loadData();
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Failed to update rules');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Auto-expand categories with rules on initial load
  useEffect(() => {
    if (rules.length > 0 && expandedCategories.size === 0) {
      const categoriesWithRulesSet = new Set<string>();
      rules.forEach(rule => {
        const cat = getRuleCategory(rule);
        categoriesWithRulesSet.add(cat);
      });
      setExpandedCategories(categoriesWithRulesSet);
    }
  }, [rules]);

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
    // Find the category of the rule and expand it
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      const category = getRuleCategory(rule);
      setExpandedCategories(prev => new Set([...prev, category]));
    }
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
    setDialogMode('manual');
    setDialogOpen(true);
  };

  const handleOpenDialogWithCategory = (categoryValue: string) => {
    setLinkedTemplate(null);
    setEditingRule(null);
    setDialogMode('manual');
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

  const handleOpenDialog = (rule?: ReminderRule) => {
    setLinkedTemplate(null);
    if (rule) {
      setEditingRule(rule);
    } else {
      setEditingRule(null);
    }
    setDialogMode('manual');
    setDialogOpen(true);
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

  // Render rule row for table
  const renderRuleRow = (rule: ReminderRule) => {
    const intervals = rule.reminder_intervals || [rule.days_before];
    const affectedData = ruleAffectedCounts[rule.id];
    const sourceTableLabel = rule.event_type?.source_table
      ?.replace('employee_', '')
      .replace(/_/g, ' ') || 'records';
    const isHighlighted = highlightedRuleId === rule.id || highlightRuleId === rule.id;
    const lifecycleStage = getLifecycleStage(rule.event_type?.code || '');
    
    // Determine effective status with proper date validation
    const today = new Date().toISOString().split('T')[0];
    const hasEffectiveFrom = !!rule.effective_from;
    const isScheduled = hasEffectiveFrom && rule.effective_from > today;
    const isExpired = rule.effective_to && rule.effective_to < today;
    const isEffectiveNow = hasEffectiveFrom && rule.effective_from <= today;
    
    // Status priority: expired > scheduled > active > draft > inactive
    let effectiveStatus: 'active' | 'scheduled' | 'expired' | 'inactive' | 'draft';
    if (isExpired) {
      effectiveStatus = 'expired';
    } else if (isScheduled) {
      effectiveStatus = 'scheduled';
    } else if (rule.is_active && isEffectiveNow) {
      effectiveStatus = 'active';
    } else if (rule.is_active && !hasEffectiveFrom) {
      effectiveStatus = 'draft';
    } else {
      effectiveStatus = 'inactive';
    }
    
    return (
      <TableRow 
        key={rule.id}
        ref={(el) => { ruleRowRefs.current[rule.id] = el; }}
        className={isHighlighted ? 'animate-pulse bg-primary/10 transition-colors duration-1000' : ''}
      >
        {/* Event Type - FIRST COLUMN with Lifecycle Stage */}
        <TableCell>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{rule.event_type?.name || '-'}</span>
            <Badge variant="outline" className={cn("text-xs w-fit", lifecycleStage.color)}>
              {lifecycleStage.label}
            </Badge>
          </div>
        </TableCell>
        
        {/* Rule Name */}
        <TableCell className="font-medium">{rule.name}</TableCell>
        
        {/* Affected Items */}
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
        
        {/* Intervals */}
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {intervals.sort((a, b) => b - a).map((interval) => (
              <Badge key={interval} variant="outline" className="text-xs">
                {interval}d
              </Badge>
            ))}
          </div>
        </TableCell>
        
        {/* Recipients */}
        <TableCell>
          <div className="flex gap-1">
            {rule.send_to_employee && <Badge variant="outline" className="text-xs">Emp</Badge>}
            {rule.send_to_manager && <Badge variant="outline" className="text-xs">Mgr</Badge>}
            {rule.send_to_hr && <Badge variant="outline" className="text-xs">HR</Badge>}
          </div>
        </TableCell>
        
        {/* Priority */}
        <TableCell>
          <span className={getPriorityColor(rule.priority)}>{rule.priority}</span>
        </TableCell>
        
        {/* Channel - NEW COLUMN with delivery method icons */}
        <TableCell>
          <div className="flex gap-1.5">
            {(rule.notification_method === 'email' || rule.notification_method === 'both') && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Mail className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>Email notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {(rule.notification_method === 'in_app' || rule.notification_method === 'both') && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Bell className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>In-app notifications</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </TableCell>
        
        {/* Status with Inline Toggle */}
        <TableCell>
          <div className="flex items-center gap-2">
            <Switch 
              checked={rule.is_active}
              onCheckedChange={(checked) => handleQuickToggle(rule.id, checked)}
              className="data-[state=checked]:bg-green-500"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant={effectiveStatus === 'active' ? 'default' : effectiveStatus === 'scheduled' || effectiveStatus === 'draft' ? 'outline' : 'secondary'}
                    className={cn(
                      "cursor-default",
                      effectiveStatus === 'scheduled' && 'border-amber-500 text-amber-600',
                      effectiveStatus === 'expired' && 'border-destructive/50 text-destructive',
                      effectiveStatus === 'draft' && 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/30'
                    )}
                  >
                    {effectiveStatus === 'active' && 'Active'}
                    {effectiveStatus === 'scheduled' && 'Scheduled'}
                    {effectiveStatus === 'expired' && 'Expired'}
                    {effectiveStatus === 'inactive' && 'Inactive'}
                    {effectiveStatus === 'draft' && 'Draft'}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {rule.effective_from && <p>Starts: {format(parseISO(rule.effective_from), 'PPP')}</p>}
                  {rule.effective_to && <p>Ends: {format(parseISO(rule.effective_to), 'PPP')}</p>}
                  {effectiveStatus === 'draft' && (
                    <p className="text-amber-600">Set an effective date to activate this rule</p>
                  )}
                  {effectiveStatus === 'active' && !rule.effective_to && (
                    <p className="text-muted-foreground">No end date set</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </TableCell>
        
        {/* Actions */}
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
          <Button 
            onClick={() => {
              setEditingRule(null);
              setLinkedTemplate(null);
              setDialogMode('ai-assist');
              setDialogOpen(true);
            }} 
            className="bg-primary hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Create Rule
          </Button>

          {/* Quick Setup Shortcut when coverage is low */}
          {categoriesWithRules < REMINDER_CATEGORIES.length - 3 && (
            <Button 
              variant="outline"
              onClick={() => {
                setEditingRule(null);
                setLinkedTemplate(null);
                setDialogMode('quick-setup');
                setDialogOpen(true);
              }}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Quick Setup
            </Button>
          )}

          {/* Unified Rule Dialog */}
          <UnifiedRuleDialog
            companyId={companyId}
            companyName={companyName}
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setLinkedTemplate(null);
                setEditingRule(null);
              }
            }}
            defaultMode={dialogMode}
            editingRule={editingRule}
            linkedTemplate={linkedTemplate}
            eventTypes={eventTypes}
            categoryCoverage={categoryCoverage}
            onRuleCreated={loadData}
            onRuleUpdated={loadData}
          />
        </div>

        {/* Bulk Effective Date Dialog */}
        <Dialog open={showBulkDateDialog} onOpenChange={setShowBulkDateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Activate Draft Rules
              </DialogTitle>
              <DialogDescription>
                Set an effective date for {draftRules.length} draft rule{draftRules.length !== 1 ? 's' : ''}
                {selectedCategory && ` in ${REMINDER_CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory}`} to start sending reminders
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Effective From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bulkEffectiveDate 
                        ? format(parseISO(bulkEffectiveDate), "PPP") 
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={bulkEffectiveDate ? parseISO(bulkEffectiveDate) : undefined}
                      onSelect={(date) => setBulkEffectiveDate(date ? format(date, 'yyyy-MM-dd') : null)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  All selected rules will become active starting from this date
                </p>
              </div>
              
              {/* Rules Preview */}
              <div className="space-y-2">
                <Label>Rules to Activate ({draftRules.length})</Label>
                <ScrollArea className="h-48 border rounded-md">
                  <div className="p-3 space-y-2">
                    {draftRules.map(rule => (
                      <div 
                        key={rule.id} 
                        className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50"
                      >
                        <span className="text-sm font-medium">{rule.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {rule.event_type?.category?.replace(/_/g, ' ') || 'custom'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBulkDateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkSetEffectiveDate}
                disabled={!bulkEffectiveDate || isBulkUpdating}
              >
                {isBulkUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Activate {draftRules.length} Rule{draftRules.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Draft Rules Banner */}
      {draftRules.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-background border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                {draftRules.length} rule{draftRules.length !== 1 ? 's' : ''} pending activation
                {selectedCategory && (
                  <span className="font-normal text-blue-600 dark:text-blue-400">
                    {' '}in {REMINDER_CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory}
                  </span>
                )}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Set effective dates to start sending reminders
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
            onClick={() => setShowBulkDateDialog(true)}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Set Dates for All
          </Button>
        </div>
      )}

      {/* Coverage Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium">Automation Coverage</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {categoriesWithRules} of {REMINDER_CATEGORIES.length} categories have automation rules configured
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {REMINDER_CATEGORIES.slice(0, 10).map(cat => (
            <TooltipProvider key={cat.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer",
                    categoryCoverage[cat.value]?.hasRules 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {CATEGORY_ICONS[cat.value] || <Bell className="h-4 w-4" />}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {categoryCoverage[cat.value]?.count || 0} rule{(categoryCoverage[cat.value]?.count || 0) !== 1 ? 's' : ''} configured
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {REMINDER_CATEGORIES.length > 10 && (
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-muted text-muted-foreground text-xs">
              +{REMINDER_CATEGORIES.length - 10}
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search rules..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select 
          value={selectedCategory || 'all'} 
          onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {REMINDER_CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  {CATEGORY_ICONS[cat.value]}
                  <span>{cat.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {categoryCoverage[cat.value]?.count || 0}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(searchQuery || selectedCategory) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Category-Based Rules Display */}
      {rules.length === 0 && !searchQuery && !selectedCategory ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reminder rules configured</p>
            <p className="text-sm text-muted-foreground">Create rules to automatically send reminders for important events</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {REMINDER_CATEGORIES.map(category => {
            const categoryRules = groupedRules[category.value] || [];
            const hasRules = categoryRules.length > 0;
            const isExpanded = expandedCategories.has(category.value);
            const totalInCategory = categoryCoverage[category.value]?.count || 0;
            
            // Skip if filtering and no matching rules
            if ((searchQuery || selectedCategory) && !hasRules) return null;
            
            return (
              <Collapsible
                key={category.value}
                open={isExpanded}
                onOpenChange={() => toggleCategory(category.value)}
              >
                <Card className={cn(
                  "transition-all",
                  !hasRules && "opacity-70 border-dashed"
                )}>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            hasRules ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {CATEGORY_ICONS[category.value] || <Bell className="h-4 w-4" />}
                          </div>
                          <div className="text-left">
                            <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                              {hasRules 
                                ? `${totalInCategory} rule${totalInCategory !== 1 ? 's' : ''} configured`
                                : 'No automation rules'}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!hasRules && (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              No Rules
                            </Badge>
                          )}
                          {hasRules && (
                            <Badge variant="secondary" className="font-normal">
                              {categoryRules.length}
                              {searchQuery && categoryRules.length !== totalInCategory && ` / ${totalInCategory}`}
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4">
                      {hasRules ? (
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead 
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => handleSort('sequence')}
                                >
                                  <div className="flex items-center gap-1">
                                    Event Type
                                    <ArrowUpDown className={cn("h-3 w-3", sortField === 'sequence' && "text-primary")} />
                                  </div>
                                </TableHead>
                                <TableHead 
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => handleSort('name')}
                                >
                                  <div className="flex items-center gap-1">
                                    Rule Name
                                    <ArrowUpDown className={cn("h-3 w-3", sortField === 'name' && "text-primary")} />
                                  </div>
                                </TableHead>
                                <TableHead>Affected Items</TableHead>
                                <TableHead>Intervals</TableHead>
                                <TableHead>Recipients</TableHead>
                                <TableHead 
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => handleSort('priority')}
                                >
                                  <div className="flex items-center gap-1">
                                    Priority
                                    <ArrowUpDown className={cn("h-3 w-3", sortField === 'priority' && "text-primary")} />
                                  </div>
                                </TableHead>
                                <TableHead>Channel</TableHead>
                                <TableHead 
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() => handleSort('status')}
                                >
                                  <div className="flex items-center gap-1">
                                    Status
                                    <ArrowUpDown className={cn("h-3 w-3", sortField === 'status' && "text-primary")} />
                                  </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {categoryRules.map(renderRuleRow)}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed bg-muted/20">
                          <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
                          <p className="text-sm font-medium mb-1">No rules configured for {category.label}</p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Set up automation to send reminders for this category
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialogWithCategory(category.value);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Rule
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
          
          {/* No results message when filtering */}
          {(searchQuery || selectedCategory) && Object.keys(groupedRules).length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rules match your search criteria</p>
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                >
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
});
