import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Bell, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfiguredRulesPreviewProps {
  companyId: string;
  category?: string;
  maxRules?: number;
  className?: string;
}

interface ReminderRule {
  id: string;
  name: string;
  days_before: number;
  reminder_intervals: number[] | null;
  send_to_employee: boolean;
  send_to_manager: boolean;
  send_to_hr: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  event_type: {
    id: string;
    name: string;
    category: string;
    code: string;
  } | null;
}

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Low", variant: "outline" },
  medium: { label: "Medium", variant: "secondary" },
  high: { label: "High", variant: "default" },
  critical: { label: "Critical", variant: "destructive" },
};

export function ConfiguredRulesPreview({ 
  companyId, 
  category = 'performance',
  maxRules = 5,
  className 
}: ConfiguredRulesPreviewProps) {
  const navigate = useNavigate();

  const { data: rules, isLoading } = useQuery({
    queryKey: ['configured-rules-preview', companyId, category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminder_rules')
        .select(`
          id, name, days_before, reminder_intervals, 
          send_to_employee, send_to_manager, send_to_hr,
          priority, is_active,
          event_type:reminder_event_types(id, name, category, code)
        `)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter by performance category
      const filtered = (data as ReminderRule[])?.filter(r => r.event_type?.category === category) || [];
      return filtered;
    },
    enabled: !!companyId,
  });

  const handleNavigateToReminders = () => {
    navigate(`/hr-hub/reminders?tab=rules&category=${category}`);
  };

  const formatIntervals = (rule: ReminderRule) => {
    const intervals = rule.reminder_intervals || [rule.days_before];
    return intervals.map(d => `${d}d`).join(', ');
  };

  const getRecipients = (rule: ReminderRule) => {
    const recipients = [];
    if (rule.send_to_employee) recipients.push('Emp');
    if (rule.send_to_manager) recipients.push('Mgr');
    if (rule.send_to_hr) recipients.push('HR');
    return recipients;
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const displayedRules = rules?.slice(0, maxRules) || [];
  const remainingCount = (rules?.length || 0) - maxRules;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">
            Active Reminder Rules
            {rules && rules.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {rules.length}
              </Badge>
            )}
          </h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleNavigateToReminders}
          className="text-xs"
        >
          View All
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {displayedRules.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No automatic reminder rules configured yet.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Set up rules in the Reminders module to notify employees and managers about performance events.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={handleNavigateToReminders}
          >
            Configure Reminders
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Rule Name</TableHead>
                <TableHead className="text-xs">Event Type</TableHead>
                <TableHead className="text-xs">Intervals</TableHead>
                <TableHead className="text-xs">Recipients</TableHead>
                <TableHead className="text-xs">Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRules.map((rule) => {
                const priority = priorityConfig[rule.priority] || priorityConfig.medium;
                return (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium text-sm py-2">
                      {rule.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-2">
                      {rule.event_type?.name || '-'}
                    </TableCell>
                    <TableCell className="text-sm py-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {formatIntervals(rule)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex gap-1">
                        {getRecipients(rule).map((r) => (
                          <Badge key={r} variant="secondary" className="text-xs">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant={priority.variant} className="text-xs">
                        {priority.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {remainingCount > 0 && (
            <div className="px-4 py-2 border-t bg-muted/30">
              <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs"
                onClick={handleNavigateToReminders}
              >
                +{remainingCount} more rules
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
