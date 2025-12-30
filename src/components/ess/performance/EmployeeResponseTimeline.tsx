import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertTriangle,
  User,
  Users,
  Send,
  Shield,
} from "lucide-react";
import type { EmployeeReviewResponse } from "@/hooks/useEmployeeReviewResponse";

interface EmployeeResponseTimelineProps {
  response: EmployeeReviewResponse;
  managerSubmittedAt?: string;
  className?: string;
}

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'pending';
}

export function EmployeeResponseTimeline({
  response,
  managerSubmittedAt,
  className,
}: EmployeeResponseTimelineProps) {
  const events: TimelineEvent[] = [];

  // Manager submitted review
  if (managerSubmittedAt) {
    events.push({
      date: managerSubmittedAt,
      title: 'Manager Submitted Review',
      description: 'Your manager completed your performance review',
      icon: <User className="h-4 w-4" />,
      status: 'completed',
    });
  }

  // Employee response
  if (response.submitted_at) {
    const responseLabels: Record<string, string> = {
      agree: 'Agreed with evaluation',
      agree_with_comments: 'Agreed with comments',
      partial_disagree: 'Partially disagreed',
      disagree: 'Disagreed with evaluation',
    };

    events.push({
      date: response.submitted_at,
      title: 'You Responded',
      description: responseLabels[response.response_type] || response.response_type,
      icon: <Send className="h-4 w-4" />,
      status: 'completed',
    });
  }

  // HR Escalation
  if (response.is_escalated_to_hr && response.escalated_at) {
    events.push({
      date: response.escalated_at,
      title: 'Escalated to HR',
      description: response.escalation_category?.replace(/_/g, ' '),
      icon: <AlertTriangle className="h-4 w-4" />,
      status: 'completed',
    });
  }

  // Manager Rebuttal
  if (response.manager_rebuttal_at) {
    events.push({
      date: response.manager_rebuttal_at,
      title: 'Manager Responded',
      description: 'Your manager provided a rebuttal',
      icon: <MessageSquare className="h-4 w-4" />,
      status: 'completed',
    });
  }

  // HR Review
  if (response.hr_reviewed_at) {
    const actionLabels: Record<string, string> = {
      no_action: 'No action required',
      manager_discussion: 'Manager discussion requested',
      rating_adjusted: 'Rating adjusted',
      escalated_to_dispute: 'Escalated to formal dispute',
      closed: 'Case closed',
    };

    events.push({
      date: response.hr_reviewed_at,
      title: 'HR Reviewed',
      description: response.hr_action_taken ? actionLabels[response.hr_action_taken] : undefined,
      icon: <Shield className="h-4 w-4" />,
      status: 'completed',
    });
  }

  // Current/Pending status
  if (response.status === 'hr_review' && !response.hr_reviewed_at) {
    events.push({
      date: new Date().toISOString(),
      title: 'Awaiting HR Review',
      description: 'Your escalation is being reviewed by HR',
      icon: <Clock className="h-4 w-4" />,
      status: 'current',
    });
  } else if (response.status === 'submitted' && !response.manager_rebuttal_at && !response.hr_reviewed_at) {
    events.push({
      date: new Date().toISOString(),
      title: 'Awaiting Manager Response',
      description: 'Your manager may provide additional feedback',
      icon: <Clock className="h-4 w-4" />,
      status: 'current',
    });
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-blue-500 animate-pulse';
      case 'pending':
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Response Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {events.map((event, index) => (
            <div key={index} className="flex gap-3 pb-4 last:pb-0">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStatusColor(event.status)}`}
                >
                  {event.icon}
                </div>
                {index < events.length - 1 && (
                  <div className="w-0.5 h-full bg-border mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{event.title}</p>
                  {event.status === 'current' && (
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {event.status === 'current' 
                    ? 'In progress' 
                    : format(new Date(event.date), 'MMM d, yyyy h:mm a')
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
