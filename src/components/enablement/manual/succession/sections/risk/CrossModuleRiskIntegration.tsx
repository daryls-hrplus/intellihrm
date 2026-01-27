import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Link2, 
  CheckCircle,
  Info,
  ArrowRight,
  DollarSign,
  TrendingUp,
  GraduationCap,
  Users,
  Briefcase
} from 'lucide-react';

export function CrossModuleRiskIntegration() {
  const objectives = [
    'Understand data flow between Risk Management and other modules',
    'Configure event-driven notifications for risk-related triggers',
    'Leverage compensation, performance, and learning data for risk assessment',
    'Integrate risk insights into workforce planning decisions'
  ];

  const integrationPoints = [
    {
      module: 'Compensation',
      icon: DollarSign,
      color: 'bg-green-500',
      direction: 'inbound',
      dataFlow: [
        { data: 'Compa-ratio', usage: 'Below-market salary triggers flight risk factor' },
        { data: 'Equity vesting schedule', usage: 'Vesting cliff timing informs risk timeline' },
        { data: 'Last salary increase', usage: 'Stagnant compensation signals engagement risk' },
      ],
      triggerEvent: 'Compa-ratio drops below 0.85'
    },
    {
      module: 'Performance',
      icon: TrendingUp,
      color: 'bg-blue-500',
      direction: 'inbound',
      dataFlow: [
        { data: 'Performance rating', usage: 'Declining ratings correlate with disengagement' },
        { data: 'Goal achievement', usage: 'Low achievement may indicate role misfit' },
        { data: 'Feedback sentiment', usage: 'Negative feedback patterns signal relationship issues' },
      ],
      triggerEvent: 'Performance rating drops 2+ levels'
    },
    {
      module: 'Learning & Development',
      icon: GraduationCap,
      color: 'bg-purple-500',
      direction: 'bidirectional',
      dataFlow: [
        { data: 'Development plan progress', usage: 'Stalled development indicates growth concerns' },
        { data: 'Training completion', usage: 'Declining participation signals disengagement' },
        { data: 'Skill gap analysis', usage: 'Unfilled gaps may drive departure for growth' },
      ],
      triggerEvent: 'IDP inactive for 6+ months'
    },
    {
      module: 'Workforce Planning',
      icon: Users,
      color: 'bg-amber-500',
      direction: 'outbound',
      dataFlow: [
        { data: 'Flight risk aggregates', usage: 'Informs headcount forecasting' },
        { data: 'Retirement risk', usage: 'Drives succession pipeline priorities' },
        { data: 'Vacancy predictions', usage: 'Supports proactive recruiting plans' },
      ],
      triggerEvent: 'High-risk count exceeds threshold'
    },
    {
      module: 'Succession Planning',
      icon: Briefcase,
      color: 'bg-indigo-500',
      direction: 'bidirectional',
      dataFlow: [
        { data: 'Incumbent flight risk', usage: 'Prioritizes succession plan urgency' },
        { data: 'Successor readiness', usage: 'Mitigates vacancy risk impact' },
        { data: 'Position criticality', usage: 'Drives retention intervention priority' },
      ],
      triggerEvent: 'Critical position incumbent marked High risk'
    },
  ];

  return (
    <section id="sec-7-9" data-manual-anchor="sec-7-9" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.9 Cross-Module Risk Integration</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Data flow, event triggers, and integration touchpoints
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* Integration Overview */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Integration Architecture</AlertTitle>
        <AlertDescription>
          Risk management integrates with other HRplus modules through shared data and event-driven 
          notifications. This creates a comprehensive risk intelligence layer that draws insights 
          from across the employee lifecycle.
        </AlertDescription>
      </Alert>

      {/* Module Integration Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-primary" />
            Module Integration Points
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {integrationPoints.map((point) => (
            <div key={point.module} className="border rounded-lg overflow-hidden">
              <div className={`px-4 py-2 ${point.color} text-white flex items-center gap-2`}>
                <point.icon className="h-4 w-4" />
                <span className="font-medium">{point.module}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {point.direction === 'inbound' ? '← Inbound' : 
                   point.direction === 'outbound' ? 'Outbound →' : 
                   '↔ Bidirectional'}
                </Badge>
              </div>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data Element</TableHead>
                      <TableHead>Risk Management Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {point.dataFlow.map((flow, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{flow.data}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{flow.usage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-3 p-2 bg-muted rounded flex items-center gap-2 text-sm">
                  <Badge variant="outline">Event Trigger</Badge>
                  <span>{point.triggerEvent}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRight className="h-5 w-5 text-primary" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Risk data flows between modules through the central talent signal and event systems:
          </p>

          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="p-3 border rounded-lg bg-background text-center">
                <span className="text-sm font-medium">Source Modules</span>
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  <Badge variant="outline">Performance</Badge>
                  <Badge variant="outline">Compensation</Badge>
                  <Badge variant="outline">Learning</Badge>
                </div>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              
              <div className="p-3 border rounded-lg bg-primary/10 text-center">
                <span className="text-sm font-medium">talent_signal_snapshots</span>
                <p className="text-xs text-muted-foreground mt-1">Central signal repository</p>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              
              <div className="p-3 border rounded-lg bg-background text-center">
                <span className="text-sm font-medium">Risk Management</span>
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  <Badge variant="outline">flight_risk_assessments</Badge>
                  <Badge variant="outline">key_position_risks</Badge>
                </div>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              
              <div className="p-3 border rounded-lg bg-background text-center">
                <span className="text-sm font-medium">Consumer Modules</span>
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  <Badge variant="outline">Succession</Badge>
                  <Badge variant="outline">Workforce Planning</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event-Driven Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-primary" />
            Event-Driven Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Configure notifications for cross-module risk events:
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Notification</TableHead>
                <TableHead>Recipients</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { event: 'COMP_BELOW_MARKET', trigger: 'Compa-ratio < 0.85', notification: 'Compensation risk alert', recipients: 'HR Partner, Manager' },
                { event: 'PERF_DECLINE', trigger: 'Rating drops 2+ levels', notification: 'Performance decline warning', recipients: 'HR Partner' },
                { event: 'FLIGHT_RISK_CRITICAL', trigger: 'Risk set to Critical', notification: 'Critical flight risk escalation', recipients: 'Executive, HR Director' },
                { event: 'SUCCESSOR_AT_RISK', trigger: 'Successor has High flight risk', notification: 'Succession pipeline warning', recipients: 'HR Partner' },
                { event: 'REVIEW_OVERDUE', trigger: 'next_review_date passed', notification: 'Risk review reminder', recipients: 'Assessor' },
              ].map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{e.event}</TableCell>
                  <TableCell className="text-sm">{e.trigger}</TableCell>
                  <TableCell className="text-sm">{e.notification}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{e.recipients}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Integration Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Ensure data freshness — stale signals reduce risk prediction accuracy',
              'Configure notification thresholds to balance signal vs. noise',
              'Review integration health monthly (missing data, failed events)',
              'Document custom integration points for audit purposes',
              'Align risk factor definitions across consuming modules',
              'Test event triggers in non-production before enabling',
              'Monitor notification delivery rates for critical events'
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
