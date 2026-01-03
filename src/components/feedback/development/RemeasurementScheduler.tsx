import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  RefreshCw, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useRemeasurementPlans, useScheduleRemeasurement } from '@/hooks/feedback/useDevelopmentThemes';
import { format, addMonths, isBefore, isAfter } from 'date-fns';
import type { MeasurementType } from '@/types/developmentThemes';
import { cn } from '@/lib/utils';

interface RemeasurementSchedulerProps {
  employeeId: string;
  companyId: string;
  sourceCycleId?: string;
  focusAreas?: {
    themes: string[];
    signals: string[];
    competencies: string[];
  };
}

const measurementTypes: { value: MeasurementType; label: string; description: string }[] = [
  { 
    value: 'pulse', 
    label: 'Pulse Check', 
    description: 'Quick 5-10 question survey focused on development areas' 
  },
  { 
    value: 'manager_check', 
    label: 'Manager Check-in', 
    description: 'Manager-only assessment of progress' 
  },
  { 
    value: 'full_360', 
    label: 'Full 360°', 
    description: 'Complete multi-rater feedback cycle' 
  },
];

const statusConfig = {
  scheduled: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  in_progress: { icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-100' },
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  cancelled: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
};

export function RemeasurementScheduler({
  employeeId,
  companyId,
  sourceCycleId,
  focusAreas,
}: RemeasurementSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    addMonths(new Date(), 3) // Default to 3 months from now
  );
  const [measurementType, setMeasurementType] = useState<MeasurementType>('pulse');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const { data: existingPlans, isLoading } = useRemeasurementPlans(employeeId);
  const scheduleRemeasurement = useScheduleRemeasurement();

  const handleSchedule = () => {
    if (!selectedDate) return;

    scheduleRemeasurement.mutate({
      employee_id: employeeId,
      company_id: companyId,
      source_cycle_id: sourceCycleId,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      measurement_type: measurementType,
      focus_areas: focusAreas,
      status: 'scheduled',
    });
  };

  const upcomingPlans = existingPlans?.filter(p => 
    p.status === 'scheduled' && isAfter(new Date(p.scheduled_date), new Date())
  ) || [];

  const pastPlans = existingPlans?.filter(p => 
    p.status !== 'scheduled' || isBefore(new Date(p.scheduled_date), new Date())
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Progress Remeasurement
        </CardTitle>
        <CardDescription>
          Schedule follow-up measurements to track development progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Schedule new remeasurement */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium text-sm">Schedule New Measurement</h4>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Date</label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => isBefore(date, new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Type</label>
              <Select value={measurementType} onValueChange={(v) => setMeasurementType(v as MeasurementType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {measurementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleSchedule} 
            disabled={!selectedDate || scheduleRemeasurement.isPending}
            className="w-full sm:w-auto"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Schedule Remeasurement
          </Button>
        </div>

        {/* Upcoming measurements */}
        {upcomingPlans.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Upcoming</h4>
            {upcomingPlans.map((plan) => {
              const config = statusConfig[plan.status];
              const Icon = config.icon;
              const type = measurementTypes.find(t => t.value === plan.measurement_type);

              return (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", config.bg)}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{type?.label || plan.measurement_type}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(plan.scheduled_date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {plan.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* Past measurements */}
        {pastPlans.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">History</h4>
            {pastPlans.slice(0, 3).map((plan) => {
              const config = statusConfig[plan.status];
              const Icon = config.icon;
              const type = measurementTypes.find(t => t.value === plan.measurement_type);

              return (
                <div
                  key={plan.id}
                  className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-4 w-4", config.color)} />
                    <div>
                      <div className="font-medium text-sm">{type?.label || plan.measurement_type}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(plan.scheduled_date), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {plan.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
