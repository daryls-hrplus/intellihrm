import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Key, 
  Clock,
  CheckCircle,
  Info,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  Settings,
  ChevronRight,
  Plane
} from 'lucide-react';

export function VacancyRiskMonitoring() {
  const objectives = [
    'Monitor vacancy risk triggers at the position level',
    'Integrate retirement risk analysis with succession planning',
    'Track market demand signals for critical skill positions',
    'Navigate the KeyPositionsTab.tsx for position-level risk monitoring'
  ];

  const vacancyTriggers = [
    { 
      trigger: 'Retirement Proximity', 
      icon: Calendar, 
      color: 'bg-blue-500',
      description: 'Incumbent is approaching retirement eligibility or has announced retirement plans',
      indicators: ['Age + tenure analysis', 'Pension eligibility date', 'Retirement conversation history'],
      urgency: 'High'
    },
    { 
      trigger: 'Flight Risk (Incumbent)', 
      icon: Plane, 
      color: 'bg-purple-500',
      description: 'Current position holder has elevated flight risk based on assessment',
      indicators: ['Flight risk assessment', 'Engagement scores', 'Market competitiveness'],
      urgency: 'High'
    },
    { 
      trigger: 'Market Demand', 
      icon: TrendingUp, 
      color: 'bg-amber-500',
      description: 'External market has high demand for this role or skillset',
      indicators: ['Recruiter activity', 'Industry trends', 'Competitor hiring'],
      urgency: 'Medium'
    },
    { 
      trigger: 'Contract/Assignment End', 
      icon: Clock, 
      color: 'bg-green-500',
      description: 'Fixed-term assignment or project is ending',
      indicators: ['Contract end date', 'Project completion', 'Assignment duration'],
      urgency: 'Medium'
    },
    { 
      trigger: 'Internal Movement', 
      icon: Users, 
      color: 'bg-indigo-500',
      description: 'Incumbent may move to another role within the organization',
      indicators: ['Career aspirations', 'Internal applications', 'Promotion candidacy'],
      urgency: 'Low'
    },
  ];

  const retirementRiskMatrix = [
    { years: '0-2 years', level: 'High', color: 'bg-red-500', action: 'Immediate successor identification required' },
    { years: '2-5 years', level: 'Medium', color: 'bg-amber-500', action: 'Active development of succession pipeline' },
    { years: '5+ years', level: 'Low', color: 'bg-green-500', action: 'Standard succession planning cadence' },
  ];

  return (
    <section id="sec-7-5" data-manual-anchor="sec-7-5" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.5 Position Vacancy Risk Monitoring</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Position-level vacancy risk factors, retirement risk, and early warning systems
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Performance</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Key Positions</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Reference */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Cross-Reference: Chapter 6.3</AlertTitle>
        <AlertDescription>
          For detailed field reference of the <code>key_position_risks</code> table (17 fields including i18n fields: 
          <code>impact_if_vacant_en</code>, <code>risk_notes_en</code>) 
          and configuration procedures, see <strong>Section 6.3: Position Risk Assessment</strong>.
          This section focuses on operational monitoring workflows.
        </AlertDescription>
      </Alert>

      {/* Vacancy Risk Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Vacancy Risk Triggers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Multiple factors contribute to position vacancy risk. Monitor these triggers to 
            proactively plan for potential vacancies.
          </p>

          <div className="space-y-3">
            {vacancyTriggers.map((trigger) => (
              <div key={trigger.trigger} className="border rounded-lg overflow-hidden">
                <div className={`px-4 py-2 ${trigger.color} text-white flex items-center gap-2`}>
                  <trigger.icon className="h-4 w-4" />
                  <span className="font-medium">{trigger.trigger}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Urgency: {trigger.urgency}
                  </Badge>
                </div>
                <div className="p-4">
                  <p className="text-sm mb-3">{trigger.description}</p>
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Key Indicators
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {trigger.indicators.map((indicator, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{indicator}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Retirement Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Retirement Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Retirement risk is tracked via the <code>retirement_risk</code> boolean flag in 
            <code>key_position_risks</code>. Use the following timeline-based analysis for prioritization:
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time to Retirement</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Required Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retirementRiskMatrix.map((row) => (
                <TableRow key={row.years}>
                  <TableCell className="font-medium">{row.years}</TableCell>
                  <TableCell>
                    <Badge className={`${row.color} text-white`}>{row.level}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{row.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm">
              <strong>Data Integration:</strong> When available, retirement risk analysis should 
              integrate with Workforce Planning data including age demographics, pension eligibility 
              dates, and retirement conversation history from manager notes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Positions Dashboard Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5 text-primary" />
            KeyPositionsTab.tsx Dashboard Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Key Positions interface displays summary statistics for quick monitoring:
          </p>

          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            {[
              { metric: 'Key Positions', icon: Key, desc: 'Total key positions from jobs' },
              { metric: 'Risk Assessed', icon: CheckCircle, desc: 'Positions with risk assessment' },
              { metric: 'Critical', icon: AlertTriangle, desc: 'Critical criticality level' },
              { metric: 'High Vacancy Risk', icon: TrendingUp, desc: 'High vacancy risk level' },
              { metric: 'Retirement Risk', icon: Clock, desc: 'Retirement risk flagged' },
              { metric: 'Flight Risk', icon: Plane, desc: 'Flight risk flagged' },
            ].map((item) => (
              <div key={item.metric} className="p-3 border rounded-lg text-center">
                <item.icon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <h5 className="font-medium text-sm">{item.metric}</h5>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Early Warning System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Early Warning System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure proactive alerts for vacancy risk monitoring:
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert Type</TableHead>
                <TableHead>Trigger Condition</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { type: 'Retirement Warning', trigger: 'Incumbent within 2 years of retirement', recipients: 'HR Director, Manager', frequency: 'Monthly' },
                { type: 'High Flight Risk', trigger: 'Incumbent flight_risk = true', recipients: 'HR Partner, Manager', frequency: 'Weekly' },
                { type: 'Vacancy Risk Escalation', trigger: 'vacancy_risk = high', recipients: 'HR Director, Executive', frequency: 'Weekly' },
                { type: 'No Successor Ready', trigger: 'Critical position without Ready Now successor', recipients: 'HR Partner', frequency: 'Monthly' },
                { type: 'Assessment Overdue', trigger: 'Risk assessment older than 90 days', recipients: 'HR Partner', frequency: 'Weekly' },
              ].map((alert, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{alert.type}</TableCell>
                  <TableCell className="text-sm">{alert.trigger}</TableCell>
                  <TableCell className="text-sm">{alert.recipients}</TableCell>
                  <TableCell><Badge variant="outline">{alert.frequency}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monitoring Cadence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Monitoring Cadence Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position Criticality</TableHead>
                <TableHead>Review Frequency</TableHead>
                <TableHead>Focus Areas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-red-600 text-white">Critical</Badge></TableCell>
                <TableCell className="font-medium">Monthly</TableCell>
                <TableCell className="text-sm">Incumbent status, successor readiness, development progress</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-500 text-white">High</Badge></TableCell>
                <TableCell className="font-medium">Quarterly</TableCell>
                <TableCell className="text-sm">Risk factor changes, pipeline health, intervention effectiveness</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500 text-black">Medium</Badge></TableCell>
                <TableCell className="font-medium">Semi-annually</TableCell>
                <TableCell className="text-sm">General status review, succession coverage verification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-500 text-white">Low</Badge></TableCell>
                <TableCell className="font-medium">Annually</TableCell>
                <TableCell className="text-sm">Standard succession planning review</TableCell>
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
            Vacancy Monitoring Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Track retirement eligibility dates proactively (2+ years ahead)',
              'Link flight risk assessments to position vacancy risk automatically',
              'Monitor industry trends for high-demand skills in critical positions',
              'Update vacancy risk when incumbents announce life changes (retirement, relocation)',
              'Ensure critical positions always have at least one Ready Now successor',
              'Review key positions list quarterly for relevance and completeness',
              'Integrate with workforce planning for demographic trend analysis'
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
