import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, FileText, MessageSquare, Shield, 
  Workflow, Database, Bell, Search, CheckSquare, Repeat, Activity,
  UserCog, Users, GitBranch, Settings, IdCard, Upload, BarChart3, Megaphone,
  Calendar, Mail
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
    },
    {
      icon: CheckSquare,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      term: 'HR Task Management',
      definition: 'Centralized task system with recurring schedules, team assignment, priority levels, collaborative comments, and full activity audit trails.',
      example: 'Quarterly compliance review auto-creates, assigns to team, tracks discussion, and logs completion history.'
    },
    {
      icon: UserCog,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      term: 'ESS Change Requests',
      definition: 'Employee-initiated updates to personal data with configurable approval workflows based on change type.',
      example: 'Employee updates bank details, routed to HR for verification before system update.'
    },
    {
      icon: Users,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      term: 'Employee Directory',
      definition: 'Searchable org-wide employee lookup with contact info, reporting lines, and quick actions.',
      example: 'Manager searches for IT support contact in another department.'
    },
    {
      icon: GitBranch,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      term: 'Integration Hub',
      definition: 'Centralized management of external system connections and data synchronization.',
      example: 'Payroll system sync, ATS integration, benefits provider API.'
    },
    {
      icon: Settings,
      color: 'text-slate-500',
      bgColor: 'bg-slate-500/10',
      term: 'ESS Approval Policies',
      definition: 'Configurable rules determining approval requirements for ESS data changes.',
      example: 'Address changes auto-approve, bank detail changes require HR approval.'
    },
    {
      icon: IdCard,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
      term: 'Government ID Types',
      definition: 'Country-specific configuration of employee and employer identification requirements.',
      example: 'Trinidad: NIS and BIR; Jamaica: TRN and NIS numbers.'
    },
    {
      icon: Upload,
      color: 'text-lime-500',
      bgColor: 'bg-lime-500/10',
      term: 'Data Import',
      definition: 'Bulk data loading with validation, mapping, and error handling.',
      example: 'Import 500 employees from Excel with field mapping and duplicate detection.'
    },
    {
      icon: BarChart3,
      color: 'text-fuchsia-500',
      bgColor: 'bg-fuchsia-500/10',
      term: 'Scheduled Reports',
      definition: 'Automated report generation and distribution on defined schedules.',
      example: 'Weekly headcount report emailed to executives every Monday.'
    },
    {
      icon: Megaphone,
      color: 'text-rose-400',
      bgColor: 'bg-rose-400/10',
      term: 'Company Communications',
      definition: 'Announcements, news, and company-wide messaging with targeting and acknowledgment.',
      example: 'CEO quarterly update targeted to all employees with read tracking.'
    },
    {
      icon: Calendar,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
      term: 'HR Calendar',
      definition: 'Company-wide event management with holiday calendars, location-aware scheduling, and multi-timezone support.',
      example: 'Public holidays configured per country/branch; training events auto-populate employee calendars.'
    },
    {
      icon: Mail,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      term: 'Notifications & Reminders',
      definition: 'AI-powered communication system with email templates, automation rules, delivery tracking, and in-app alerts.',
      example: 'Probation reminder emails auto-send 14 days before review; managers receive in-app alerts for pending approvals.'
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

            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge variant="outline">Recurring Pattern</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">HR Task Created</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Team Assignment</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Comments</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Completion</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Recurring task patterns auto-create tasks on schedule. Team members collaborate 
              via comments, track progress, and complete with full audit trail.
            </p>

            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge variant="outline">ESS Change Request</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Approval Policy Check</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Auto/Manual Approval</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">System Update</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Audit Log</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              ESS data changes route through configurable approval policies. Some changes 
              auto-approve while sensitive changes require HR verification before system update.
            </p>

            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <Badge variant="outline">Sentiment Analysis</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Risk Flags</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Manager Alert</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Intervention Task</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="outline">Follow-up</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered sentiment monitoring detects employee concerns from help desk tickets 
              and feedback, triggering proactive HR intervention before issues escalate.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
