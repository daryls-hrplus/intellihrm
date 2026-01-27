import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  FileText, 
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Users,
  Target
} from 'lucide-react';

export function RiskMitigationPlaybooks() {
  const objectives = [
    'Apply standardized response templates based on risk level',
    'Navigate the escalation matrix with appropriate timing',
    'Measure mitigation success using defined metrics',
    'Document and share successful intervention patterns'
  ];

  const playbooks = [
    {
      riskLevel: 'Critical',
      color: 'bg-red-600 text-white',
      responseTime: '24 hours',
      template: {
        name: 'Executive Retention Protocol',
        steps: [
          'Immediate notification to Executive Sponsor and HR Director',
          'Emergency 1:1 meeting with employee (within 24 hours)',
          'Counteroffer preparation if applicable (compensation, role, reporting)',
          'Clear decision timeline communicated to employee',
          'Daily status updates until resolution'
        ],
        successCriteria: 'Employee commits to stay or departure is managed gracefully',
        escalationPath: 'CEO/CHRO for executive-level counteroffers'
      }
    },
    {
      riskLevel: 'High',
      color: 'bg-orange-500 text-white',
      responseTime: '48 hours',
      template: {
        name: 'Priority Retention Plan',
        steps: [
          'HR Partner initiates retention planning meeting',
          'Manager conducts stay interview within 48 hours',
          'Identify top 3 risk factors driving departure consideration',
          'Develop targeted retention actions (compensation, development, role)',
          'Weekly check-ins until risk level reduced'
        ],
        successCriteria: 'Risk level reduced to Medium or Low within 90 days',
        escalationPath: 'HR Director if no improvement after 30 days'
      }
    },
    {
      riskLevel: 'Medium',
      color: 'bg-yellow-500 text-black',
      responseTime: '1 week',
      template: {
        name: 'Engagement & Development Focus',
        steps: [
          'Manager schedules career conversation',
          'Review development opportunities and career path',
          'Address specific risk factors identified',
          'Create or update Individual Development Plan',
          'Monthly check-ins for 3 months'
        ],
        successCriteria: 'Engagement improved, clear development path established',
        escalationPath: 'HR Partner if risk factors persist'
      }
    },
    {
      riskLevel: 'Low',
      color: 'bg-green-500 text-white',
      responseTime: 'Quarterly',
      template: {
        name: 'Standard Engagement Maintenance',
        steps: [
          'Regular 1:1 meetings maintained',
          'Career development check-in at performance review',
          'Recognition for contributions',
          'Confirm continued engagement and satisfaction'
        ],
        successCriteria: 'Risk level remains Low, employee engaged',
        escalationPath: 'Manager notifies HR if warning signs appear'
      }
    },
  ];

  const successMetrics = [
    { metric: 'Retention Rate (Critical/High)', target: '≥ 75%', calculation: 'Retained at 6 months / Total Critical+High cases' },
    { metric: 'Risk Reduction Rate', target: '≥ 60%', calculation: 'Cases reduced to lower level / Cases with interventions' },
    { metric: 'Response Time Compliance', target: '≥ 95%', calculation: 'Responses within SLA / Total cases' },
    { metric: 'Action Completion Rate', target: '≥ 90%', calculation: 'Actions completed on time / Planned actions' },
  ];

  return (
    <section id="sec-7-7" data-manual-anchor="sec-7-7" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.7 Risk Mitigation Playbooks</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Standard response templates, escalation matrix, and success metrics
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* Playbooks by Risk Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Response Playbooks by Risk Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {playbooks.map((playbook) => (
            <div key={playbook.riskLevel} className="border rounded-lg overflow-hidden">
              <div className={`px-4 py-3 ${playbook.color} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-semibold">{playbook.riskLevel} Risk: {playbook.template.name}</span>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Response: {playbook.responseTime}
                </Badge>
              </div>
              <div className="p-4 space-y-4">
                {/* Steps */}
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Response Steps
                  </h5>
                  <ol className="space-y-2">
                    {playbook.template.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Success Criteria & Escalation */}
                <div className="grid gap-4 md:grid-cols-2 pt-3 border-t">
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Success Criteria
                    </h5>
                    <p className="text-sm">{playbook.template.successCriteria}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      Escalation Path
                    </h5>
                    <p className="text-sm">{playbook.template.escalationPath}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Escalation Matrix Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Escalation Matrix Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trigger</TableHead>
                <TableHead>Escalate To</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Required Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { trigger: 'External offer confirmed', escalateTo: 'Executive Sponsor', timeline: 'Immediate', action: 'Counteroffer decision' },
                { trigger: 'No improvement after 30 days (High)', escalateTo: 'HR Director', timeline: 'Day 30', action: 'Enhanced intervention' },
                { trigger: 'Multiple risk factors identified', escalateTo: 'HR Partner', timeline: '48 hours', action: 'Retention planning' },
                { trigger: 'Manager unable to resolve', escalateTo: 'HR Partner', timeline: '1 week', action: 'HR-led intervention' },
                { trigger: 'Critical position with no successor', escalateTo: 'HR Director', timeline: 'Immediate', action: 'Emergency succession planning' },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{row.trigger}</TableCell>
                  <TableCell><Badge variant="outline">{row.escalateTo}</Badge></TableCell>
                  <TableCell className="text-sm">{row.timeline}</TableCell>
                  <TableCell className="text-sm">{row.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Success Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Calculation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {successMetrics.map((m) => (
                <TableRow key={m.metric}>
                  <TableCell className="font-medium">{m.metric}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/20 text-green-700">{m.target}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.calculation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Post-Departure Analysis */}
      <Alert>
        <Users className="h-4 w-4" />
        <AlertTitle>Post-Departure Analysis</AlertTitle>
        <AlertDescription>
          When retention fails, conduct post-departure analysis to improve future interventions:
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>Review timing of risk identification (was it too late?)</li>
            <li>Assess effectiveness of retention actions taken</li>
            <li>Identify gaps in risk detection signals</li>
            <li>Update playbooks based on lessons learned</li>
            <li>Share anonymized patterns with HR team</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Playbook Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Follow the playbook consistently — don\'t skip steps for expediency',
              'Document all actions taken with timestamps in retention_actions field',
              'Escalate early rather than late — err on the side of caution',
              'Measure success metrics monthly and adjust playbooks quarterly',
              'Share successful intervention patterns across the HR team',
              'Train managers on their role in the response process',
              'Conduct post-departure analysis for all Critical/High cases'
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
