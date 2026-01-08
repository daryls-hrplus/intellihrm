import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { 
  HelpDeskConfiguration,
  CompanyCommunications,
  KnowledgeBaseSetup,
  NotificationsReminders
} from './sections/communication';

export function HRHubManualCommunicationSection() {
  return (
    <div className="space-y-12">
      {/* Chapter Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="text-sm">Chapter 2</Badge>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="h-4 w-4" />
            <span>~50 min read</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Communication & Support Setup</h2>
        <p className="text-muted-foreground">
          Configure Help Desk operations, company communications, knowledge base, and notification systems 
          for proactive HR service delivery.
        </p>
      </div>

      {/* Section 2.1: Help Desk Configuration */}
      <section data-manual-anchor="hh-sec-2-1">
        <HelpDeskConfiguration />
      </section>

      {/* Section 2.2: Company Communications */}
      <section data-manual-anchor="hh-sec-2-2">
        <CompanyCommunications />
      </section>

      {/* Section 2.3: Knowledge Base Setup */}
      <section data-manual-anchor="hh-sec-2-3">
        <KnowledgeBaseSetup />
      </section>

      {/* Section 2.4: Notifications & Reminders */}
      <section data-manual-anchor="hh-sec-2-4">
        <NotificationsReminders />
      </section>
    </div>
  );
}
