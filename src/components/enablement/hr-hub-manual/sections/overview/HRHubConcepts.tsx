import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, FileText, MessageSquare, Shield, 
  Workflow, Database, Bell, Search
} from 'lucide-react';
import { NoteCallout } from '@/components/enablement/manual/components/Callout';

export function HRHubConcepts() {
  const concepts = [
    {
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      term: 'Help Desk',
      definition: 'A ticketing system for employee HR inquiries with SLA tracking, category routing, and escalation paths.',
      example: 'An employee submits a leave balance inquiry, which routes to HR Ops with a 24-hour SLA.'
    },
    {
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      term: 'Knowledge Base',
      definition: 'A searchable repository of HR articles, FAQs, and how-to guides for employee self-service.',
      example: '"How do I update my bank details?" article with step-by-step instructions and screenshots.'
    },
    {
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      term: 'SOP (Standard Operating Procedure)',
      definition: 'Documented processes with versioning, role-based access, and acknowledgment tracking.',
      example: 'Offboarding SOP v3.2 with checklist for IT equipment return, exit interview, and final pay.'
    },
    {
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      term: 'Compliance Tracker',
      definition: 'System for monitoring regulatory requirements, deadlines, and audit-ready documentation.',
      example: 'Annual OSHA safety training renewal tracked per employee with 30-day advance alerts.'
    },
    {
      icon: Workflow,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      term: 'Transaction Workflow',
      definition: 'Configurable approval chains for HR transactions with parallel/sequential routing.',
      example: 'Salary increase requests flow: Manager → HR → Finance → CEO for amounts over $10K.'
    },
    {
      icon: Bell,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      term: 'Milestone',
      definition: 'Automated employee lifecycle events that trigger actions, notifications, or workflows.',
      example: '90-day probation review automatically creates appraisal task for the manager.'
    },
    {
      icon: Database,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      term: 'Lookup Values',
      definition: 'Configurable dropdown lists used across the system without code changes.',
      example: 'Ticket categories, document types, leave reasons are all managed as lookup values.'
    },
    {
      icon: Search,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      term: 'Intranet',
      definition: 'Internal company portal with pages, navigation, and role-based content visibility.',
      example: 'Company news, HR policies landing page, benefits enrollment portal.'
    }
  ];

  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-1-2">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 1.2</Badge>
            <Badge variant="secondary">8 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Core Concepts & Terminology</h2>
          <p className="text-muted-foreground mt-1">
            Knowledge base, SOPs, workflows, compliance tracking fundamentals
          </p>
        </div>
      </div>

      <NoteCallout title="Why This Matters">
        Understanding these concepts is essential before configuring HR Hub. Each concept 
        represents a building block that connects to create a cohesive employee experience.
      </NoteCallout>

      {/* Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {concepts.map((concept, index) => {
          const Icon = concept.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${concept.bgColor}`}>
                    <Icon className={`h-4 w-4 ${concept.color}`} />
                  </div>
                  {concept.term}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {concept.definition}
                </p>
                <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary">
                  <p className="text-xs">
                    <span className="font-medium">Example:</span> {concept.example}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Concept Relationships */}
      <Card>
        <CardHeader>
          <CardTitle>How Concepts Connect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Help Desk Ticket</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Knowledge Base Link</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Self-Service Resolution</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              When an employee submits a help desk ticket, AI suggests relevant knowledge base 
              articles. Many inquiries resolve without HR intervention.
            </p>

            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Hire Date Milestone</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Probation SOP</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Review Workflow</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Employee milestones trigger SOP execution which creates workflow tasks for 
              managers and HR to complete probation reviews.
            </p>

            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Compliance Deadline</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Reminder Notification</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Audit Trail</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Compliance tracker monitors deadlines, sends proactive reminders, and logs 
              all actions for audit purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
