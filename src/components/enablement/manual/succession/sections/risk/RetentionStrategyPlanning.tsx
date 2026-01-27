import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Shield, 
  Target,
  CheckCircle,
  Info,
  Clock,
  DollarSign,
  GraduationCap,
  Heart,
  Users,
  Briefcase,
  ArrowUpRight
} from 'lucide-react';

export function RetentionStrategyPlanning() {
  const objectives = [
    'Develop targeted retention strategies based on risk level and factors',
    'Document retention actions with owners, timelines, and success criteria',
    'Apply the escalation matrix for appropriate intervention levels',
    'Track retention action effectiveness and outcomes'
  ];

  const retentionCategories = [
    { 
      category: 'Compensation', 
      icon: DollarSign, 
      color: 'bg-green-500',
      actions: [
        'Market adjustment review',
        'Equity grant acceleration',
        'Bonus or spot award',
        'Retention bonus agreement'
      ],
      riskFactors: ['Compensation below market', 'External offer received'],
      typicalTimeline: '2-4 weeks'
    },
    { 
      category: 'Career Development', 
      icon: GraduationCap, 
      color: 'bg-blue-500',
      actions: [
        'Stretch assignment or project',
        'Mentorship pairing',
        'Training or certification sponsorship',
        'Cross-functional rotation'
      ],
      riskFactors: ['Limited growth opportunities', 'Passed over for promotion'],
      typicalTimeline: '1-3 months'
    },
    { 
      category: 'Work-Life Balance', 
      icon: Heart, 
      color: 'bg-pink-500',
      actions: [
        'Flexible work arrangement',
        'Remote work options',
        'Reduced travel requirements',
        'Workload redistribution'
      ],
      riskFactors: ['Work-life balance issues', 'Key project ending'],
      typicalTimeline: '1-2 weeks'
    },
    { 
      category: 'Manager Relationship', 
      icon: Users, 
      color: 'bg-purple-500',
      actions: [
        'Manager coaching session',
        'Facilitated 1:1 conversation',
        'Team dynamic assessment',
        'Internal transfer consideration'
      ],
      riskFactors: ['Manager relationship issues', 'Recent negative feedback'],
      typicalTimeline: '2-4 weeks'
    },
    { 
      category: 'Role & Scope', 
      icon: Briefcase, 
      color: 'bg-amber-500',
      actions: [
        'Role enrichment or expansion',
        'Title adjustment',
        'Increased responsibility',
        'Leadership opportunity'
      ],
      riskFactors: ['Low engagement scores', 'Tenure milestone approaching'],
      typicalTimeline: '1-3 months'
    },
  ];

  const escalationMatrix = [
    { 
      riskLevel: 'Critical', 
      color: 'bg-red-600 text-white',
      owner: 'Executive Sponsor',
      sla: '24 hours',
      actions: ['Executive retention conversation', 'Counteroffer authority', 'Emergency intervention']
    },
    { 
      riskLevel: 'High', 
      color: 'bg-orange-500 text-white',
      owner: 'HR Director + Manager',
      sla: '48 hours',
      actions: ['HR-led retention planning', 'Compensation review expedited', 'Career path discussion']
    },
    { 
      riskLevel: 'Medium', 
      color: 'bg-yellow-500 text-black',
      owner: 'HR Partner + Manager',
      sla: '1 week',
      actions: ['Manager engagement conversation', 'Development plan review', 'Stay interview']
    },
    { 
      riskLevel: 'Low', 
      color: 'bg-green-500 text-white',
      owner: 'Manager',
      sla: 'Quarterly',
      actions: ['Regular check-ins', 'Career conversation', 'Standard engagement']
    },
  ];

  return (
    <section id="sec-7-4" data-manual-anchor="sec-7-4" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.4 Retention Strategy & Action Planning</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Intervention categories, escalation paths, and action tracking
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* Retention Action Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Retention Action Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Retention interventions are categorized by type. Select actions based on the specific 
            risk factors identified in the flight risk assessment.
          </p>

          <div className="space-y-4">
            {retentionCategories.map((cat) => (
              <div key={cat.category} className="border rounded-lg overflow-hidden">
                <div className={`px-4 py-2 ${cat.color} text-white flex items-center gap-2`}>
                  <cat.icon className="h-4 w-4" />
                  <span className="font-medium">{cat.category}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Timeline: {cat.typicalTimeline}
                  </Badge>
                </div>
                <div className="p-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Available Actions
                    </h5>
                    <ul className="space-y-1">
                      {cat.actions.map((action, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-muted-foreground" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Relevant Risk Factors
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {cat.riskFactors.map((factor, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{factor}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Escalation Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each risk level has defined ownership, SLA for initial response, and appropriate actions. 
            Higher risk levels require faster response and more senior intervention.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Risk Level</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="w-28">Response SLA</TableHead>
                <TableHead>Primary Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalationMatrix.map((level) => (
                <TableRow key={level.riskLevel}>
                  <TableCell>
                    <Badge className={level.color}>{level.riskLevel}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{level.owner}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {level.sla}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-0.5">
                      {level.actions.map((action, i) => (
                        <li key={i} className="text-sm">{action}</li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Action Documentation Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            All retention actions should be documented in the <code>retention_actions</code> field 
            of the flight risk assessment. Include the following elements:
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { element: 'Action Description', example: 'Salary adjustment to 95th percentile', required: true },
              { element: 'Action Owner', example: 'Sarah Johnson (HR Director)', required: true },
              { element: 'Target Completion', example: 'By March 15, 2026', required: true },
              { element: 'Success Criteria', example: 'Employee confirms satisfaction, risk reduced', required: false },
              { element: 'Status Updates', example: 'Approved by compensation committee', required: false },
              { element: 'Outcome', example: 'Completed, employee retained', required: false },
            ].map((item) => (
              <div key={item.element} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-sm">{item.element}</h5>
                  <Badge variant={item.required ? 'default' : 'secondary'} className="text-xs">
                    {item.required ? 'Required' : 'Recommended'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground italic">Example: {item.example}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Documentation Template */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Sample Retention Action Documentation</AlertTitle>
        <AlertDescription>
          <div className="mt-2 p-3 bg-muted rounded-lg text-sm font-mono whitespace-pre-line">
{`[2026-01-20] COMPENSATION ADJUSTMENT
• Action: Market adjustment to 92nd percentile (+8%)
• Owner: Jane Smith (Compensation Manager)
• Target: Complete by 2026-02-01
• Status: Approved, pending payroll implementation

[2026-01-22] CAREER DEVELOPMENT
• Action: Nominated for leadership development program
• Owner: Manager (John Doe)
• Target: Program starts 2026-03-01
• Status: Nomination submitted`}
          </div>
        </AlertDescription>
      </Alert>

      {/* Tracking Effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Tracking Action Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Track the effectiveness of retention interventions using these metrics:
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Calculation</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Retention Success Rate</TableCell>
                <TableCell className="font-mono text-xs">
                  retained_after_intervention / total_high_risk_with_actions × 100
                </TableCell>
                <TableCell><Badge variant="outline">≥ 75%</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Risk Reduction Rate</TableCell>
                <TableCell className="font-mono text-xs">
                  risk_level_reduced / total_interventions × 100
                </TableCell>
                <TableCell><Badge variant="outline">≥ 60%</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Action Completion Rate</TableCell>
                <TableCell className="font-mono text-xs">
                  actions_completed_on_time / total_planned_actions × 100
                </TableCell>
                <TableCell><Badge variant="outline">≥ 90%</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">SLA Compliance</TableCell>
                <TableCell className="font-mono text-xs">
                  responses_within_sla / total_high_risk_cases × 100
                </TableCell>
                <TableCell><Badge variant="outline">≥ 95%</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Retention Planning Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Match retention actions to specific risk factors, not just risk level',
              'Document actions with clear ownership and deadlines',
              'Escalate Critical/High cases to appropriate senior stakeholders immediately',
              'Follow up on completed actions to verify employee satisfaction',
              'Update risk level after successful intervention (don\'t just close)',
              'Track retention success rates to refine action strategies',
              'Conduct post-departure analysis when retention fails',
              'Share anonymized success patterns across HR team'
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
