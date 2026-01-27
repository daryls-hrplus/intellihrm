import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  BookOpen, 
  AlertTriangle, 
  Shield, 
  TrendingDown,
  Info,
  CheckCircle
} from 'lucide-react';

export function RiskTerminologyStandards() {
  const objectives = [
    'Apply industry-standard risk terminology (Oracle HCM, SAP SuccessFactors)',
    'Distinguish between Risk of Loss, Impact of Loss, and Retention Risk',
    'Use the four-level risk classification system consistently',
    'Understand standard risk factors and their urgency categories'
  ];

  const riskLevels = [
    { 
      level: 'Critical', 
      color: 'bg-red-600 text-white',
      probability: '> 75%',
      timeline: 'Within 30 days',
      signals: 'External offer received, resignation drafted, exit interview scheduled',
      intervention: 'Immediate executive intervention, counteroffer protocol'
    },
    { 
      level: 'High', 
      color: 'bg-orange-500 text-white',
      probability: '50-75%',
      timeline: '3-6 months',
      signals: 'Actively interviewing, disengaged, compensation grievance',
      intervention: 'Priority retention plan, HR escalation'
    },
    { 
      level: 'Medium', 
      color: 'bg-yellow-500 text-black',
      probability: '25-50%',
      timeline: '6-12 months',
      signals: 'Passive job searching, declining engagement, career stagnation',
      intervention: 'Development focus, career conversation'
    },
    { 
      level: 'Low', 
      color: 'bg-green-500 text-white',
      probability: '< 25%',
      timeline: '12+ months',
      signals: 'Engaged, satisfied, growth opportunities available',
      intervention: 'Quarterly monitoring, standard engagement'
    },
  ];

  const standardRiskFactors = [
    { factor: 'External offer received', category: 'External', urgency: 'Critical', source: 'Direct disclosure' },
    { factor: 'Compensation below market', category: 'Compensation', urgency: 'High', source: 'Comp analysis' },
    { factor: 'Passed over for promotion', category: 'Career', urgency: 'High', source: 'Career history' },
    { factor: 'Low engagement scores', category: 'Engagement', urgency: 'High', source: 'Survey data' },
    { factor: 'Manager relationship issues', category: 'Relationship', urgency: 'High', source: 'HR observation' },
    { factor: 'Limited growth opportunities', category: 'Career', urgency: 'Medium', source: 'Career mapping' },
    { factor: 'Work-life balance issues', category: 'Wellbeing', urgency: 'Medium', source: 'Manager feedback' },
    { factor: 'Recent negative feedback', category: 'Performance', urgency: 'Medium', source: 'Performance data' },
    { factor: 'Tenure milestone approaching', category: 'Timing', urgency: 'Medium', source: 'HR analytics' },
    { factor: 'Key project ending', category: 'Timing', urgency: 'Medium', source: 'Resource planning' },
  ];

  return (
    <section id="sec-7-2" data-manual-anchor="sec-7-2" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.2 Risk Terminology & Standards</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Industry definitions, risk levels, and standard factor classifications
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={objectives} />

      {/* Core Terminology */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            Core Risk Terminology (Oracle HCM / SAP SuccessFactors Pattern)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Term</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead className="w-60">Data Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge className="bg-red-500/20 text-red-700 dark:text-red-400">Risk of Loss</Badge>
                </TableCell>
                <TableCell>
                  <strong>Probability</strong> that an employee will voluntarily leave the organization. 
                  Assessed at the individual employee level based on behavioral signals and market conditions.
                  This is the industry-standard term (Oracle HCM, SAP SF) for what is commonly called "flight risk."
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  flight_risk_assessments.risk_level<br />
                  <span className="text-primary">(enum: low | medium | high | critical)</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400">Impact of Loss</Badge>
                </TableCell>
                <TableCell>
                  <strong>Business consequence</strong> if the employee departs. Assessed at the <em>position</em> level 
                  based on role criticality, replacement difficulty, and successor readiness. 
                  <span className="block mt-1 text-sm text-muted-foreground italic">
                    Note: Current implementation derives impact from position criticality. Employee-level impact assessment 
                    is a planned enhancement for Oracle HCM parity.
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  succession_plans.position_criticality<br />
                  key_position_risks.criticality_level<br />
                  <span className="text-primary">(enum: most_critical | critical | important)</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-400">Retention Risk</Badge>
                </TableCell>
                <TableCell>
                  <strong>Combined assessment</strong> of Risk of Loss × Impact of Loss (via replacement difficulty). 
                  Used to prioritize retention interventions and succession planning urgency.
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  Calculated via RetentionRiskMatrix.tsx<br />
                  <span className="text-primary">(result: high | moderate | low)</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">Vacancy Risk</Badge>
                </TableCell>
                <TableCell>
                  <strong>Position-level</strong> assessment of how likely a role will become vacant, 
                  considering retirement, flight risk, and external factors.
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  key_position_risks.vacancy_risk<br />
                  <span className="text-primary">(enum: low | medium | high)</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-slate-500/20 text-slate-700 dark:text-slate-400">Replacement Difficulty</Badge>
                </TableCell>
                <TableCell>
                  Assessment of how challenging it would be to fill a position externally, based on 
                  market availability, specialized skills, and time-to-hire expectations.
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  succession_plans.replacement_difficulty<br />
                  <span className="text-primary">(enum: difficult | moderate | easy)</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Risk Level Definitions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Risk Level Classification System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The four-level classification system provides consistent risk categorization across all 
            assessment types. Each level has specific probability ranges, timelines, and intervention requirements.
          </p>

          <div className="space-y-4">
            {riskLevels.map((level) => (
              <div key={level.level} className="border rounded-lg overflow-hidden">
                <div className={`px-4 py-2 ${level.color} flex items-center justify-between`}>
                  <span className="font-semibold">{level.level}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Probability: {level.probability}</span>
                    <span>Timeline: {level.timeline}</span>
                  </div>
                </div>
                <div className="p-4 grid gap-3 md:grid-cols-2">
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Signals
                    </h5>
                    <p className="text-sm">{level.signals}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Required Intervention
                    </h5>
                    <p className="text-sm">{level.intervention}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Standard Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-primary" />
            Standard Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The system provides 10 predefined risk factors used in flight risk assessments. 
            These factors are selectable via the FlightRiskTab.tsx interface.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Factor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Primary Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standardRiskFactors.map((rf, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{rf.factor}</TableCell>
                  <TableCell><Badge variant="outline">{rf.category}</Badge></TableCell>
                  <TableCell>
                    <Badge className={
                      rf.urgency === 'Critical' ? 'bg-red-500/20 text-red-700 dark:text-red-400' :
                      rf.urgency === 'High' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                      'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                    }>
                      {rf.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{rf.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Retention Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Retention Risk Matrix Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Retention Risk Matrix combines Position Criticality (Impact of Loss) with Replacement 
            Difficulty to calculate the overall retention risk level. This dual-axis approach follows 
            the Oracle HCM and SAP SuccessFactors patterns.
          </p>

          {/* Matrix Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-3 bg-muted text-left font-medium border-b">
                    Criticality ↓ | Replacement →
                  </th>
                  <th className="p-3 bg-muted text-center font-medium border-b border-l">Difficult</th>
                  <th className="p-3 bg-muted text-center font-medium border-b border-l">Moderate</th>
                  <th className="p-3 bg-muted text-center font-medium border-b border-l">Easy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 bg-muted/50 font-medium border-b">Most Critical</td>
                  <td className="p-3 bg-red-500/20 text-center border-b border-l">
                    <Badge className="bg-red-600 text-white">High (3)</Badge>
                  </td>
                  <td className="p-3 bg-red-500/20 text-center border-b border-l">
                    <Badge className="bg-red-600 text-white">High (2)</Badge>
                  </td>
                  <td className="p-3 bg-amber-500/20 text-center border-b border-l">
                    <Badge className="bg-amber-500 text-black">Moderate (3)</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 bg-muted/50 font-medium border-b">Critical</td>
                  <td className="p-3 bg-red-500/20 text-center border-b border-l">
                    <Badge className="bg-red-600 text-white">High (1)</Badge>
                  </td>
                  <td className="p-3 bg-amber-500/20 text-center border-b border-l">
                    <Badge className="bg-amber-500 text-black">Moderate (2)</Badge>
                  </td>
                  <td className="p-3 bg-green-500/20 text-center border-b border-l">
                    <Badge className="bg-green-500 text-white">Low (3)</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 bg-muted/50 font-medium">Important</td>
                  <td className="p-3 bg-amber-500/20 text-center border-l">
                    <Badge className="bg-amber-500 text-black">Moderate (1)</Badge>
                  </td>
                  <td className="p-3 bg-green-500/20 text-center border-l">
                    <Badge className="bg-green-500 text-white">Low (2)</Badge>
                  </td>
                  <td className="p-3 bg-green-500/20 text-center border-l">
                    <Badge className="bg-green-500 text-white">Low (1)</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Numbers in parentheses indicate priority score within each risk level for triage ordering. 
            Higher scores = higher priority within the same risk level.
          </p>
        </CardContent>
      </Card>

      {/* Industry Alignment */}
      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle>Industry Standards Reference</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Oracle HCM Cloud:</strong> Risk of Loss + Impact of Loss dual-axis model</li>
            <li><strong>SAP SuccessFactors:</strong> Retention Risk Matrix for triage prioritization</li>
            <li><strong>Workday:</strong> Four-level risk classification (Critical, High, Medium, Low)</li>
            <li><strong>Visier:</strong> Turnover probability scoring with confidence intervals</li>
            <li><strong>SHRM:</strong> Standard flight risk indicators and intervention frameworks</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Terminology Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Use consistent terminology across all stakeholder communications',
              'Document specific risk factors, not just overall risk levels',
              'Reference the data source when communicating risk assessments',
              'Distinguish between employee-level and position-level risk clearly',
              'Update terminology glossary when industry standards evolve',
              'Train all assessors on the four-level classification system'
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
