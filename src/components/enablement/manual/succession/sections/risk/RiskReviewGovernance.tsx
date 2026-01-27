import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Calendar, 
  Clock,
  CheckCircle,
  Info,
  Users,
  Shield,
  ClipboardList,
  Bell
} from 'lucide-react';

export function RiskReviewGovernance() {
  const objectives = [
    'Establish appropriate review cadence by risk level',
    'Define stakeholder roles in risk governance',
    'Track next_review_date compliance for governance SLAs',
    'Conduct effective risk review meetings'
  ];

  const reviewCadence = [
    { 
      riskLevel: 'Critical', 
      color: 'bg-red-600 text-white',
      frequency: 'Bi-weekly',
      participants: ['Executive Sponsor', 'HR Director', 'Manager'],
      agenda: ['Status of retention actions', 'Counteroffer considerations', 'Successor readiness update'],
      sla: '14 days between reviews'
    },
    { 
      riskLevel: 'High', 
      color: 'bg-orange-500 text-white',
      frequency: 'Monthly',
      participants: ['HR Director', 'HR Partner', 'Manager'],
      agenda: ['Retention action progress', 'Risk factor changes', 'Development interventions'],
      sla: '30 days between reviews'
    },
    { 
      riskLevel: 'Medium', 
      color: 'bg-yellow-500 text-black',
      frequency: 'Quarterly',
      participants: ['HR Partner', 'Manager'],
      agenda: ['Engagement check-in', 'Career conversation outcomes', 'Risk reassessment'],
      sla: '90 days between reviews'
    },
    { 
      riskLevel: 'Low', 
      color: 'bg-green-500 text-white',
      frequency: 'Semi-annually',
      participants: ['Manager'],
      agenda: ['Standard engagement review', 'Career development check', 'Confirmation of low risk'],
      sla: '180 days between reviews'
    },
  ];

  const stakeholderRoles = [
    { role: 'Executive Sponsor', responsibilities: ['Final authority on counteroffers', 'Resource allocation for retention', 'Strategic visibility on talent risk'], criticalCase: true },
    { role: 'HR Director', responsibilities: ['Oversight of risk governance program', 'Escalation point for High/Critical cases', 'Policy exceptions'], criticalCase: true },
    { role: 'HR Partner', responsibilities: ['Day-to-day risk monitoring', 'Retention action coordination', 'Manager coaching'], criticalCase: false },
    { role: 'Manager', responsibilities: ['First-line risk detection', 'Engagement conversations', 'Retention action execution'], criticalCase: false },
  ];

  return (
    <section id="sec-7-6" data-manual-anchor="sec-7-6" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.6 Risk Review Cadence & Governance</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review cycles, stakeholder roles, SLA compliance, and meeting templates
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* Review Cadence Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Review Cadence by Risk Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Higher risk levels require more frequent review cycles with senior stakeholder involvement.
            Set the <code>next_review_date</code> field to track compliance.
          </p>

          <div className="space-y-4">
            {reviewCadence.map((level) => (
              <div key={level.riskLevel} className="border rounded-lg overflow-hidden">
                <div className={`px-4 py-2 ${level.color} flex items-center justify-between`}>
                  <span className="font-semibold">{level.riskLevel} Risk</span>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="secondary">{level.frequency}</Badge>
                    <span className="text-xs opacity-80">SLA: {level.sla}</span>
                  </div>
                </div>
                <div className="p-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Participants
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {level.participants.map((p, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Standard Agenda Items
                    </h5>
                    <ul className="space-y-0.5">
                      {level.agenda.map((item, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Stakeholder Roles & Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Key Responsibilities</TableHead>
                <TableHead>Critical Cases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stakeholderRoles.map((sr) => (
                <TableRow key={sr.role}>
                  <TableCell className="font-medium">{sr.role}</TableCell>
                  <TableCell>
                    <ul className="space-y-0.5">
                      {sr.responsibilities.map((r, i) => (
                        <li key={i} className="text-sm">{r}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    {sr.criticalCase ? (
                      <Badge className="bg-red-500/20 text-red-700">Required</Badge>
                    ) : (
                      <Badge variant="outline">As Needed</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SLA Compliance Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            SLA Compliance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Track review SLA compliance using the <code>next_review_date</code> field:
          </p>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { status: 'On Track', color: 'bg-green-500', condition: 'next_review_date > today' },
              { status: 'Due Soon', color: 'bg-amber-500', condition: 'next_review_date within 7 days' },
              { status: 'Overdue', color: 'bg-red-500', condition: 'next_review_date < today' },
            ].map((s) => (
              <div key={s.status} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className="font-medium text-sm">{s.status}</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{s.condition}</p>
              </div>
            ))}
          </div>

          <Alert>
            <Bell className="h-4 w-4" />
            <AlertTitle>Automated Reminders</AlertTitle>
            <AlertDescription>
              Configure reminder notifications to alert HR Partners and Managers when reviews 
              are approaching (7 days prior) and overdue. Use the notification system with 
              event type <code>risk_review_reminder</code>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Meeting Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-primary" />
            Risk Review Meeting Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h5 className="font-semibold mb-3">Flight Risk Review Meeting Agenda</h5>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">1. Opening (5 min)</span>
                <p className="text-muted-foreground pl-4">Review purpose, confirm attendees, confidentiality reminder</p>
              </div>
              <div>
                <span className="font-medium">2. Risk Summary (10 min)</span>
                <p className="text-muted-foreground pl-4">Current risk distribution, changes since last review, new high-risk cases</p>
              </div>
              <div>
                <span className="font-medium">3. Critical/High Case Review (20 min)</span>
                <p className="text-muted-foreground pl-4">Individual case discussion, retention action status, decisions needed</p>
              </div>
              <div>
                <span className="font-medium">4. Action Items (10 min)</span>
                <p className="text-muted-foreground pl-4">Assign owners, set deadlines, escalation decisions</p>
              </div>
              <div>
                <span className="font-medium">5. Closing (5 min)</span>
                <p className="text-muted-foreground pl-4">Confirm next meeting date, summary of decisions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Audit & Compliance Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Risk governance activities are auditable for SOC 2 compliance:
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { requirement: 'Assessment History', description: 'All assessments retained with is_current flag lifecycle' },
              { requirement: 'Review Date Tracking', description: 'next_review_date compliance visible in reports' },
              { requirement: 'Action Documentation', description: 'retention_actions field with timestamped entries' },
              { requirement: 'User Attribution', description: 'assessed_by field tracks who performed assessment' },
            ].map((item) => (
              <div key={item.requirement} className="p-3 border rounded-lg">
                <h5 className="font-medium text-sm">{item.requirement}</h5>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle>Industry Benchmark (SHRM)</AlertTitle>
        <AlertDescription>
          SHRM recommends quarterly talent risk reviews at minimum. Organizations with formal 
          risk governance processes show 35% better retention outcomes for high-risk employees.
          Critical positions should never exceed 30 days between risk reviews.
        </AlertDescription>
      </Alert>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Governance Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Set next_review_date at time of assessment creation',
              'Send automated reminders 7 days before review due date',
              'Escalate overdue reviews to HR Director after 7 days',
              'Document meeting decisions in the assessment notes field',
              'Include retention action status in every review',
              'Track SLA compliance as a program health metric',
              'Conduct annual program review to optimize cadence'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
