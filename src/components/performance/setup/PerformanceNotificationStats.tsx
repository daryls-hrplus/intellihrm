import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

import { Skeleton } from "@/components/ui/skeleton";
import { Bell, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const PERFORMANCE_CATEGORIES = [
  'performance_goals',
  'performance_appraisals',
  'performance_360',
  'performance_feedback',
  'performance_succession'
];

interface PerformanceNotificationStatsProps {
  companyId: string;
  className?: string;
}

export function PerformanceNotificationStats({ companyId, className }: PerformanceNotificationStatsProps) {
  // Fetch active rules for performance categories
  const { data: rulesData, isLoading: loadingRules } = useQuery({
    queryKey: ['performance-notification-stats-rules', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminder_rules')
        .select(`
          id,
          event_type:reminder_event_types!inner(category)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Filter to performance categories
      const filtered = (data || []).filter(r => 
        PERFORMANCE_CATEGORIES.includes((r.event_type as any)?.category)
      );
      return filtered;
    },
    enabled: !!companyId,
  });

  // Fetch templates for performance categories
  const { data: templatesData, isLoading: loadingTemplates } = useQuery({
    queryKey: ['performance-notification-stats-templates', companyId],
    queryFn: async () => {
      // Get event types for performance categories
      const { data: eventTypes } = await supabase
        .from('reminder_event_types')
        .select('id, category')
        .in('category', PERFORMANCE_CATEGORIES);
      
      const performanceEventTypeIds = (eventTypes || []).map(et => et.id);
      
      if (performanceEventTypeIds.length === 0) {
        return { total: 0, orphaned: 0, linked: 0 };
      }
      
      const { data, error } = await (supabase as any)
        .from('reminder_templates')
        .select('id, event_type_id, reminder_rules(id)')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .in('event_type_id', performanceEventTypeIds);
      
      if (error) throw error;
      
      const templates = data || [];
      const orphaned = templates.filter((t: any) => !t.reminder_rules || t.reminder_rules.length === 0);
      
      return {
        total: templates.length,
        orphaned: orphaned.length,
        linked: templates.length - orphaned.length
      };
    },
    enabled: !!companyId,
  });

  // Fetch performance event types to calculate coverage
  const { data: eventTypesData, isLoading: loadingEventTypes } = useQuery({
    queryKey: ['performance-event-types-count', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminder_event_types')
        .select('id, category')
        .eq('is_active', true)
        .in('category', PERFORMANCE_CATEGORIES);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });

  const isLoading = loadingRules || loadingTemplates || loadingEventTypes;

  if (isLoading) {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const activeRules = rulesData?.length || 0;
  const totalTemplates = templatesData?.total || 0;
  const orphanedTemplates = templatesData?.orphaned || 0;
  const linkedTemplates = templatesData?.linked || 0;
  const totalEventTypes = eventTypesData?.length || 0;
  
  // Calculate unique event types covered by rules
  const coveredEventTypes = new Set(rulesData?.map(r => (r.event_type as any)?.category)).size;
  const coveragePercentage = totalEventTypes > 0 
    ? Math.round((coveredEventTypes / PERFORMANCE_CATEGORIES.length) * 100) 
    : 0;

  const stats = [
    {
      label: 'Active Rules',
      value: activeRules,
      icon: Bell,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Templates',
      value: totalTemplates,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50',
      subtext: linkedTemplates > 0 ? `${linkedTemplates} linked` : undefined,
    },
    {
      label: 'Coverage',
      value: `${coveragePercentage}%`,
      icon: CheckCircle2,
      color: coveragePercentage >= 60 ? 'text-emerald-600' : 'text-amber-600',
      bgColor: coveragePercentage >= 60 ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-amber-50 dark:bg-amber-950/50',
      subtext: `${coveredEventTypes} of ${PERFORMANCE_CATEGORIES.length} categories`,
    },
    {
      label: 'Orphaned',
      value: orphanedTemplates,
      icon: AlertTriangle,
      color: orphanedTemplates > 0 ? 'text-amber-600' : 'text-muted-foreground',
      bgColor: orphanedTemplates > 0 ? 'bg-amber-50 dark:bg-amber-950/50' : 'bg-muted/50',
      subtext: orphanedTemplates > 0 ? 'templates need rules' : 'all templates linked',
    },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
                  {stat.subtext && (
                    <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
