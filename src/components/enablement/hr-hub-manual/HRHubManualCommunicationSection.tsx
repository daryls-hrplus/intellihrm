import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { 
  EmployeeDirectorySetup,
  NotificationsReminders,
  CompanyCommunications,
  KnowledgeBaseSetup
} from './sections/communication';

export function HRHubManualCommunicationSection() {
  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="text-sm">Chapter 5</Badge>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="h-4 w-4" />
            <span>~45 min read</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Communication & Support Center</h2>
        <p className="text-muted-foreground">
          Configure the employee directory, notifications, company communications, and knowledge base 
          to enable self-service access to information and streamline internal communications.
        </p>
      </div>

      {/* Section 5.1: Employee Directory */}
      <section data-manual-anchor="hh-sec-5-1">
        <EmployeeDirectorySetup />
      </section>

      {/* Section 5.2: Notifications & Reminders */}
      <section data-manual-anchor="hh-sec-5-2">
        <NotificationsReminders />
      </section>

      {/* Section 5.3: Company Communications */}
      <section data-manual-anchor="hh-sec-5-3">
        <CompanyCommunications />
      </section>

      {/* Section 5.4: Knowledge Base */}
      <section data-manual-anchor="hh-sec-5-4">
        <KnowledgeBaseSetup />
      </section>
    </div>
  );
}
