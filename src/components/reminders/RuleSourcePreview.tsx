import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import type { ReminderEventType } from '@/types/reminders';
import { useReminderSourcePreview, type SourcePreviewData } from '@/hooks/useReminderSourcePreview';

interface RuleSourcePreviewProps {
  eventType: ReminderEventType | null;
  companyId: string;
  daysBeforeArray: number[];
}

// Map source tables to employee profile tabs
const SOURCE_TABLE_TO_TAB: Record<string, string> = {
  employee_certificates: 'certificates',
  employee_licenses: 'licenses',
  employee_documents: 'documents',
  employee_visas: 'immigration',
  employee_work_permits: 'immigration',
  employee_memberships: 'memberships',
  employee_certifications: 'certifications',
  employee_trainings: 'training',
  safety_training_records: 'safety',
  profiles: 'employment',
  employee_medical_profiles: 'medical',
};

export function RuleSourcePreview({ eventType, companyId, daysBeforeArray }: RuleSourcePreviewProps) {
  const navigate = useNavigate();
  const { loading, previewData, fetchPreview } = useReminderSourcePreview();

  useEffect(() => {
    if (eventType && companyId) {
      fetchPreview(eventType, companyId, daysBeforeArray);
    }
  }, [eventType?.id, companyId, JSON.stringify(daysBeforeArray)]);

  if (!eventType) {
    return (
      <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Database className="h-5 w-5" />
          <p className="text-sm">Select an event type to see affected records</p>
        </div>
      </div>
    );
  }

  if (!eventType.source_table) {
    return (
      <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
        <div className="flex items-center gap-3 text-muted-foreground">
          <FileText className="h-5 w-5" />
          <p className="text-sm">This is a custom event type - manual reminders only</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        <Skeleton className="h-24 rounded-lg" />
      </Card>
    );
  }

  if (!previewData || previewData.totalCount === 0) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-600">No records found</p>
            <p className="text-xs text-muted-foreground mt-1">
              No {eventType.name.toLowerCase()} events are scheduled within the next {Math.max(...daysBeforeArray)} days.
              This rule will activate when matching records are added.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleNavigateToEmployee = (employeeId: string) => {
    const tab = SOURCE_TABLE_TO_TAB[eventType.source_table || ''] || 'overview';
    navigate(`/workforce/employees/${employeeId}?tab=${tab}`);
  };

  const minDays = Math.min(...daysBeforeArray);

  return (
    <Card className="p-4 space-y-4 bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium">Affected Records Preview</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {eventType.source_table?.replace('employee_', '').replace(/_/g, ' ')}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Total Records</span>
          </div>
          <p className="text-xl font-semibold">{previewData.totalCount}</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs">Employees</span>
          </div>
          <p className="text-xl font-semibold">{previewData.employeeCount}</p>
        </div>
        <div className="bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Next Trigger</span>
          </div>
          <p className="text-sm font-medium">
            {previewData.nextTriggerDate 
              ? format(new Date(previewData.nextTriggerDate), 'MMM d, yyyy')
              : '-'
            }
          </p>
        </div>
      </div>

      {/* Sample Items */}
      {previewData.items.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            Sample records (showing {previewData.items.length} of {previewData.totalCount}):
          </p>
          <div className="bg-background rounded-lg border divide-y">
            {previewData.items.map((item) => {
              const daysUntil = item.event_date 
                ? differenceInDays(new Date(item.event_date), new Date())
                : null;
              const isUrgent = daysUntil !== null && daysUntil <= minDays;

              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2.5 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.employee_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {item.event_date && (
                      <Badge 
                        variant={isUrgent ? 'destructive' : 'outline'} 
                        className="text-xs whitespace-nowrap"
                      >
                        {daysUntil !== null && daysUntil >= 0 
                          ? `${daysUntil}d left`
                          : format(new Date(item.event_date), 'MMM d')
                        }
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleNavigateToEmployee(item.employee_id)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {previewData.totalCount > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              ...and {previewData.totalCount - 5} more records
            </p>
          )}
        </div>
      )}

      {/* Upcoming Triggers Info */}
      {previewData.upcomingCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm">
              <span className="font-medium text-amber-600">{previewData.upcomingCount}</span>
              <span className="text-muted-foreground"> {previewData.upcomingCount === 1 ? 'record' : 'records'} will trigger within </span>
              <span className="font-medium">{minDays} days</span>
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
