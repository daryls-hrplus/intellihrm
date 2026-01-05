import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Target, 
  Calendar, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { ConfiguredRulesPreview } from "./ConfiguredRulesPreview";

const NOTIFICATION_CATEGORIES = [
  {
    id: 'goals',
    title: 'Goal Reminders',
    description: 'Check-in deadlines, goal submission due dates, manager review reminders',
    icon: Target,
    category: 'performance',
    eventTypes: ['goal_check_in', 'goal_deadline', 'goal_approval']
  },
  {
    id: 'appraisals',
    title: 'Appraisal Notifications',
    description: 'Cycle start alerts, submission deadlines, calibration reminders, review completions',
    icon: Calendar,
    category: 'performance',
    eventTypes: ['appraisal_start', 'appraisal_due', 'appraisal_calibration']
  },
  {
    id: 'feedback',
    title: '360° Feedback Alerts',
    description: 'Nomination requests, feedback submission reminders, completion notifications',
    icon: MessageSquare,
    category: 'performance',
    eventTypes: ['feedback_request', 'feedback_due', 'feedback_complete']
  },
  {
    id: 'check-ins',
    title: 'Check-in Reminders',
    description: 'Regular 1:1 meeting reminders, progress update prompts',
    icon: Clock,
    category: 'performance',
    eventTypes: ['check_in_due', 'check_in_overdue']
  }
];

interface NotificationsLinkSectionProps {
  companyId?: string;
}

export function NotificationsLinkSection({ companyId }: NotificationsLinkSectionProps) {
  const navigate = useNavigate();

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
            <Button onClick={() => handleNavigateToReminders('performance')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Reminders Module
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              All notification templates and reminder rules are managed centrally in the <strong>Reminders module</strong>. 
              This ensures consistent notification behavior across all HR processes. Click on any category below to 
              configure its specific reminders.
            </p>
          </div>

          {companyId && (
            <ConfiguredRulesPreview 
              companyId={companyId} 
              category="performance"
              maxRules={5}
            />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {NOTIFICATION_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handleNavigateToReminders(category.category)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{category.title}</h3>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {category.eventTypes.slice(0, 2).map((type) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {category.eventTypes.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.eventTypes.length - 2} more
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
