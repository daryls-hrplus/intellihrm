import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bell, 
  Target, 
  Calendar, 
  MessageSquare, 
  Heart,
  Users,
  ExternalLink,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { ConfiguredRulesPreview } from "./ConfiguredRulesPreview";
import { PerformanceNotificationStats } from "./PerformanceNotificationStats";

// Performance-specific categories matching database
const PERFORMANCE_CATEGORIES = [
  'performance_goals',
  'performance_appraisals',
  'performance_360',
  'performance_feedback',
  'performance_succession'
];

const NOTIFICATION_CATEGORIES = [
  {
    id: 'performance_goals',
    title: 'Goal Reminders',
    description: 'Goal check-ins, setting deadlines, milestone tracking, cascade updates',
    icon: Target,
    category: 'performance_goals',
  },
  {
    id: 'performance_appraisals',
    title: 'Appraisal Notifications',
    description: 'Cycle starts/ends, evaluation deadlines, calibration sessions, sign-offs',
    icon: Calendar,
    category: 'performance_appraisals',
  },
  {
    id: 'performance_360',
    title: '360 Feedback Alerts',
    description: 'Cycle activation, self-review deadlines, feedback collection, results release',
    icon: MessageSquare,
    category: 'performance_360',
  },
  {
    id: 'performance_feedback',
    title: 'Continuous Feedback',
    description: 'Feedback requests, praise notifications, weekly check-in reminders',
    icon: Heart,
    category: 'performance_feedback',
  },
  {
    id: 'performance_succession',
    title: 'Succession & Talent',
    description: 'Development plan actions, successor assessments, talent review reminders',
    icon: Users,
    category: 'performance_succession',
  },
];

interface NotificationsLinkSectionProps {
  companyId?: string;
}

export function NotificationsLinkSection({ companyId }: NotificationsLinkSectionProps) {
  const navigate = useNavigate();

  // Fetch rule counts per category
  const { data: categoryRuleCounts } = useQuery({
    queryKey: ['performance-category-rule-counts', companyId],
    queryFn: async () => {
      if (!companyId) return {};
      
      const { data, error } = await supabase
        .from('reminder_rules')
        .select(`
          id,
          event_type:reminder_event_types!inner(category)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Count rules per category
      const counts: Record<string, number> = {};
      (data || []).forEach(rule => {
        const cat = (rule.event_type as any)?.category;
        if (cat && PERFORMANCE_CATEGORIES.includes(cat)) {
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!companyId,
  });

  // Fetch template counts per category
  const { data: categoryTemplateCounts } = useQuery({
    queryKey: ['performance-category-template-counts', companyId],
    queryFn: async () => {
      if (!companyId) return {};
      
      // Get event types for performance categories
      const { data: eventTypes } = await supabase
        .from('reminder_event_types')
        .select('id, category')
        .in('category', PERFORMANCE_CATEGORIES);
      
      const eventTypeMap = new Map((eventTypes || []).map(et => [et.id, et.category]));
      const performanceEventTypeIds = Array.from(eventTypeMap.keys());
      
      if (performanceEventTypeIds.length === 0) return {};
      
      const { data, error } = await (supabase as any)
        .from('reminder_templates')
        .select('id, event_type_id')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .in('event_type_id', performanceEventTypeIds);
      
      if (error) throw error;
      
      // Count templates per category
      const counts: Record<string, number> = {};
      (data || []).forEach((template: any) => {
        const cat = eventTypeMap.get(template.event_type_id);
        if (cat) {
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!companyId,
  });

  const handleNavigateToReminders = (category?: string) => {
    const params = new URLSearchParams();
    params.set('tab', 'rules');
    if (category) {
      params.set('category', category);
    }
    navigate(`/hr-hub/reminders?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Performance Notifications</CardTitle>
                <CardDescription>
                  Configure reminder rules and notification templates for performance-related events
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => handleNavigateToReminders()}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Reminders Module
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Overview */}
          {companyId && (
            <PerformanceNotificationStats companyId={companyId} />
          )}

          {/* Info Banner */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              All notification templates and reminder rules are managed centrally in the <strong>Reminders module</strong>. 
              This ensures consistent notification behavior across all HR processes. Click on any category below to 
              configure its specific reminders.
            </p>
          </div>

          {/* Active Rules Preview */}
          {companyId && (
            <ConfiguredRulesPreview 
              companyId={companyId} 
              categories={PERFORMANCE_CATEGORIES}
              maxRules={5}
            />
          )}

          {/* Category Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {NOTIFICATION_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const ruleCount = categoryRuleCounts?.[category.category] || 0;
              const templateCount = categoryTemplateCounts?.[category.category] || 0;
              const hasRules = ruleCount > 0;
              
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleNavigateToReminders(category.category)}
                >
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{category.title}</h3>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge 
                            variant={hasRules ? "default" : "outline"} 
                            className="text-xs"
                          >
                            {hasRules && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
                          </Badge>
                          {templateCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {templateCount} templates
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
