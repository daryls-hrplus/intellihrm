import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { 
  HelpDeskSetup,
  ESSChangeRequestsSetup,
  HRTasksSetup,
  HRCalendarSetup,
  MilestonesDashboardSetup
} from './sections/operations';

export function HRHubManualOperationsSection() {
  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="text-sm">Chapter 6</Badge>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="h-4 w-4" />
            <span>~55 min read</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Daily Operations</h2>
        <p className="text-muted-foreground">
          Manage day-to-day HR activities including help desk tickets, employee change requests, 
          task management, calendar events, and employee milestone tracking.
        </p>
      </div>

      {/* Section 6.1: Help Desk */}
      <section data-manual-anchor="hh-sec-6-1">
        <HelpDeskSetup />
      </section>

      {/* Section 6.2: ESS Change Requests */}
      <section data-manual-anchor="hh-sec-6-2">
        <ESSChangeRequestsSetup />
      </section>

      {/* Section 6.3: HR Tasks */}
      <section data-manual-anchor="hh-sec-6-3">
        <HRTasksSetup />
      </section>

      {/* Section 6.4: HR Calendar */}
      <section data-manual-anchor="hh-sec-6-4">
        <HRCalendarSetup />
      </section>

      {/* Section 6.5: Milestones Dashboard */}
      <section data-manual-anchor="hh-sec-6-5">
        <MilestonesDashboardSetup />
      </section>
    </div>
  );
}
