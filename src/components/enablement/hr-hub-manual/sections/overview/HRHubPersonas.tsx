import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, Users, UserCog, Shield, 
  MessageSquare, FileText, CheckCircle, Repeat, UserCheck, Activity
} from 'lucide-react';

interface PersonaCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  needs: string[];
  capabilities: string[];
  primaryModules: string[];
}

function PersonaCard({ 
  icon: Icon, 
  iconColor, 
  iconBg, 
  title, 
  subtitle, 
  needs, 
  capabilities, 
  primaryModules 
}: PersonaCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Key Needs</h4>
          <div className="space-y-1">
            {needs.map((need, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                {need}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">HR Hub Capabilities</h4>
          <div className="space-y-1">
            {capabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                {cap}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Primary Modules</h4>
          <div className="flex flex-wrap gap-1">
            {primaryModules.map((mod, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {mod}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HRHubPersonas() {
  const personas: PersonaCardProps[] = [
    {
      icon: User,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      title: 'Employee (ESS)',
      subtitle: 'Self-service access to HR information and requests',
      needs: [
        'Quick answers to HR questions',
        'Easy policy and document access',
        'Simple request submission',
        'Status visibility on pending items'
      ],
      capabilities: [
        'Search knowledge base articles',
        'Submit help desk tickets',
        'View and acknowledge policies',
        'Access personal documents',
        'Check request status',
        'Submit personal data change requests',
        'Search employee directory',
        'View company announcements',
        'Acknowledge policies and documents'
      ],
      primaryModules: ['Knowledge Base', 'Help Desk', 'Documents', 'Intranet', 'ESS Change Requests', 'Employee Directory', 'Company Communications']
    },
    {
      icon: Users,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/10',
      title: 'Manager (MSS)',
      subtitle: 'Team oversight and approval responsibilities',
      needs: [
        'Visibility into team requests',
        'Streamlined approval workflows',
        'Team milestone tracking',
        'Task progress visibility'
      ],
      capabilities: [
        'Approve team transactions',
        'View team compliance status',
        'Receive milestone notifications',
        'Delegate approvals when away',
        'Access team-specific SOPs',
        'View and complete assigned HR tasks',
        'Collaborate on tasks via comments',
        'Track task progress for team',
        'Approve ESS change requests for team',
        'View team sentiment indicators',
        'Access recognition analytics for team'
      ],
      primaryModules: ['Workflows', 'Milestones', 'Compliance', 'HR Tasks', 'ESS Approvals', 'Sentiment Analytics']
    },
    {
      icon: UserCog,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10',
      title: 'HR Administrator',
      subtitle: 'Full configuration and content management access',
      needs: [
        'Efficient content management',
        'Workflow configuration',
        'Compliance monitoring',
        'Task management and tracking'
      ],
      capabilities: [
        'Configure help desk categories and SLAs',
        'Manage knowledge base content',
        'Create and update SOPs',
        'Set up compliance requirements',
        'Design approval workflows',
        'Configure milestones and reminders',
        'View HR Hub analytics',
        'Create and manage recurring task schedules',
        'Assign tasks to team members',
        'Monitor task completion and overdue items',
        'Review task activity logs',
        'Process ESS change requests',
        'Configure ESS approval policies',
        'Manage integration connections',
        'Configure government ID types',
        'Run bulk data imports',
        'Schedule automated reports',
        'Monitor employee sentiment',
        'Manage company communications'
      ],
      primaryModules: ['All HR Hub Modules', 'Analytics', 'Configuration', 'HR Tasks', 'ESS Approval Policies', 'Integration Hub', 'Data Import', 'Scheduled Reports']
    },
    {
      icon: Shield,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-500/10',
      title: 'Compliance Officer',
      subtitle: 'Regulatory oversight and audit preparation',
      needs: [
        'Regulatory deadline tracking',
        'Audit-ready documentation',
        'Compliance gap identification',
        'Policy acknowledgment tracking'
      ],
      capabilities: [
        'Configure compliance requirements',
        'Monitor deadline dashboards',
        'Generate compliance reports',
        'Track policy acknowledgments',
        'Review audit trails',
        'Set up compliance alerts'
      ],
      primaryModules: ['Compliance Tracker', 'Documents', 'Audit Logs']
    }
  ];

  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-1-4">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 1.4</Badge>
            <Badge variant="secondary">6 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">User Personas & Journeys</h2>
          <p className="text-muted-foreground mt-1">
            HR Admin, Employee, Manager workflows within HR Hub
          </p>
        </div>
      </div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {personas.map((persona, index) => (
          <PersonaCard key={index} {...persona} />
        ))}
      </div>

      {/* User Journey Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Journey: Leave Policy Inquiry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Employee searches Knowledge Base</h4>
                  <p className="text-sm text-muted-foreground">
                    Types "maternity leave" in the search bar
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium">AI suggests relevant articles</h4>
                  <p className="text-sm text-muted-foreground">
                    Finds policy article with eligibility and process
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Employee needs clarification</h4>
                  <p className="text-sm text-muted-foreground">
                    Submits help desk ticket with context preserved
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500 text-white text-sm font-medium flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-medium">HR responds within SLA</h4>
                  <p className="text-sm text-muted-foreground">
                    Ticket routed to Benefits team, resolved
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-teal-500" />
              Journey: Recurring Compliance Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium">HR Admin creates recurring task</h4>
                  <p className="text-sm text-muted-foreground">
                    Quarterly compliance review with recurrence pattern
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium">System auto-creates task</h4>
                  <p className="text-sm text-muted-foreground">
                    Task assigned to Compliance Officer on schedule
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-500 text-white text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Team collaborates via comments</h4>
                  <p className="text-sm text-muted-foreground">
                    Assignee adds progress updates, manager reviews
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500 text-white text-sm font-medium flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Task completed with audit trail</h4>
                  <p className="text-sm text-muted-foreground">
                    Full history preserved for compliance review
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional User Journeys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-rose-500" />
              Journey: ESS Data Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-500 text-white text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Employee submits bank detail change</h4>
                  <p className="text-sm text-muted-foreground">
                    Via ESS self-service portal
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-500 text-white text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium">System checks approval policy</h4>
                  <p className="text-sm text-muted-foreground">
                    Bank changes require HR approval per policy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-500 text-white text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium">HR receives notification</h4>
                  <p className="text-sm text-muted-foreground">
                    Reviews change with verification note
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-500 text-white text-sm font-medium flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-medium">HR approves change</h4>
                  <p className="text-sm text-muted-foreground">
                    System updates employee record
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-500 text-white text-sm font-medium flex-shrink-0">
                  5
                </div>
                <div>
                  <h4 className="font-medium">Confirmation sent to employee</h4>
                  <p className="text-sm text-muted-foreground">
                    Full audit trail preserved for compliance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Journey: Sentiment Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white text-sm font-medium flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium">System analyzes feedback</h4>
                  <p className="text-sm text-muted-foreground">
                    Help desk tickets and employee feedback analyzed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white text-sm font-medium flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium">AI detects negative trend</h4>
                  <p className="text-sm text-muted-foreground">
                    Sentiment trend detected in department
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white text-sm font-medium flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium">HR Admin receives alert</h4>
                  <p className="text-sm text-muted-foreground">
                    Alert on sentiment dashboard with details
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 text-white text-sm font-medium flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Follow-up task created</h4>
                  <p className="text-sm text-muted-foreground">
                    HRBP schedules team pulse check
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500 text-white text-sm font-medium flex-shrink-0">
                  5
                </div>
                <div>
                  <h4 className="font-medium">Resolution documented</h4>
                  <p className="text-sm text-muted-foreground">
                    Sentiment tracked over time for improvement
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
