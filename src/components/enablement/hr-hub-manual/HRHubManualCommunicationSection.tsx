import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ticket, 
  Megaphone, 
  Book, 
  Bell 
} from 'lucide-react';
import { 
  HelpDeskConfiguration,
  CompanyCommunications,
  KnowledgeBaseSetup,
  NotificationsReminders
} from './sections/communication';

export function HRHubManualCommunicationSection() {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Chapter 2: Communication & Support Setup</h2>
        <p className="text-muted-foreground">
          Configure Help Desk operations, company communications, knowledge base, and notification systems.
        </p>
      </div>

      <Tabs defaultValue="helpdesk" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="helpdesk" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Help Desk</span>
            <span className="sm:hidden">2.1</span>
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden sm:inline">Communications</span>
            <span className="sm:hidden">2.2</span>
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            <span className="hidden sm:inline">Knowledge Base</span>
            <span className="sm:hidden">2.3</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">2.4</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="helpdesk">
          <HelpDeskConfiguration />
        </TabsContent>

        <TabsContent value="communications">
          <CompanyCommunications />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBaseSetup />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsReminders />
        </TabsContent>
      </Tabs>
    </div>
  );
}
