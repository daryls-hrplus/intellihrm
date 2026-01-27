import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';
import { TrendingDown, CheckCircle2, Info, Shield, AlertTriangle } from 'lucide-react';

const flightRiskFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique assessment identifier', defaultValue: 'gen_random_uuid()' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company scope' },
  { name: 'employee_id', required: true, type: 'uuid', description: 'Employee being assessed' },
  { name: 'risk_level', required: true, type: 'enum', description: 'Risk of Loss level', validation: 'low | medium | high | critical', defaultValue: 'medium' },
  { name: 'risk_factors', required: false, type: 'text[]', description: 'Array of identified risk factors' },
  { name: 'retention_actions', required: false, type: 'text', description: 'Planned or completed retention interventions' },
  { name: 'assessed_by', required: false, type: 'uuid', description: 'User who performed assessment' },
  { name: 'assessment_date', required: true, type: 'date', description: 'Date of assessment' },
  { name: 'next_review_date', required: false, type: 'date', description: 'Scheduled next review date' },
  { name: 'notes', required: false, type: 'text', description: 'Additional assessment notes' },
  { name: 'is_current', required: true, type: 'boolean', description: 'Current assessment flag (only one per employee)', defaultValue: 'true' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()' },
];

const standardRiskFactors = [
  { factor: 'Low engagement scores', category: 'Engagement', urgency: 'High' },
  { factor: 'Compensation below market', category: 'Compensation', urgency: 'High' },
  { factor: 'Limited growth opportunities', category: 'Career', urgency: 'Medium' },
  { factor: 'Passed over for promotion', category: 'Career', urgency: 'High' },
  { factor: 'Recent negative feedback', category: 'Performance', urgency: 'Medium' },
  { factor: 'Work-life balance issues', category: 'Wellbeing', urgency: 'Medium' },
  { factor: 'External offer received', category: 'External', urgency: 'Critical' },
  { factor: 'Manager relationship issues', category: 'Relationship', urgency: 'High' },
  { factor: 'Tenure milestone approaching', category: 'Timing', urgency: 'Medium' },
  { factor: 'Key project ending', category: 'Timing', urgency: 'Medium' },
];

export function FlightRiskRetentionReporting() {
  return (
    <section id="sec-10-4" data-manual-anchor="sec-10-4" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            10.4 Flight Risk & Retention Reporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Flight Risk</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand Risk of Loss vs. Impact of Loss terminology (Oracle HCM pattern)</li>
                <li>Learn the Retention Risk Matrix calculation</li>
                <li>Configure standard risk factors and retention actions</li>
                <li>Interpret flight risk distribution reports</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Industry Terminology */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Industry Terminology (Oracle HCM Pattern)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Term</TableHead>
                    <TableHead>Definition</TableHead>
                    <TableHead>Data Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-red-500/20 text-red-700">Risk of Loss</Badge>
                    </TableCell>
                    <TableCell>Probability that an employee will voluntarily leave the organization</TableCell>
                    <TableCell className="text-muted-foreground">flight_risk_assessments.risk_level</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-amber-500/20 text-amber-700">Impact of Loss</Badge>
                    </TableCell>
                    <TableCell>Business consequence if the employee departs (role criticality)</TableCell>
                    <TableCell className="text-muted-foreground">succession_plans.position_criticality</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-purple-500/20 text-purple-700">Retention Risk</Badge>
                    </TableCell>
                    <TableCell>Combined assessment of Risk of Loss × Impact of Loss</TableCell>
                    <TableCell className="text-muted-foreground">Calculated via RetentionRiskMatrix</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Risk Level Distribution */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk of Loss Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Intervention Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Badge className="bg-red-600 text-white">Critical</Badge></TableCell>
                    <TableCell>Likely to leave; may have external offer</TableCell>
                    <TableCell>Within 30 days</TableCell>
                    <TableCell>Immediate executive intervention</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge className="bg-orange-500 text-white">High</Badge></TableCell>
                    <TableCell>Actively looking or seriously disengaged</TableCell>
                    <TableCell>3-6 months</TableCell>
                    <TableCell>Priority retention plan</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge className="bg-yellow-500 text-black">Medium</Badge></TableCell>
                    <TableCell>Shows warning signs; disengagement indicators</TableCell>
                    <TableCell>6-12 months</TableCell>
                    <TableCell>Development and engagement focus</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge className="bg-green-500 text-white">Low</Badge></TableCell>
                    <TableCell>Stable; no immediate concern</TableCell>
                    <TableCell>12+ months</TableCell>
                    <TableCell>Monitor quarterly</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Retention Risk Matrix */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Retention Risk Matrix (RetentionRiskMatrix.tsx)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The Retention Risk Matrix combines Position Criticality and Replacement Difficulty to calculate 
                an overall retention risk level. This follows the Oracle HCM dual-axis model.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 border bg-muted/50 text-left font-medium">
                        Criticality \ Replacement
                      </th>
                      <th className="p-2 border bg-muted/50 text-center font-medium">Difficult</th>
                      <th className="p-2 border bg-muted/50 text-center font-medium">Moderate</th>
                      <th className="p-2 border bg-muted/50 text-center font-medium">Easy</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border bg-muted/30 font-medium">Most Critical</td>
                      <td className="p-2 border bg-red-500/20 text-center"><Badge className="bg-red-500 text-white">High (3)</Badge></td>
                      <td className="p-2 border bg-red-500/20 text-center"><Badge className="bg-red-500 text-white">High (2)</Badge></td>
                      <td className="p-2 border bg-amber-500/20 text-center"><Badge className="bg-amber-500 text-black">Moderate (3)</Badge></td>
                    </tr>
                    <tr>
                      <td className="p-2 border bg-muted/30 font-medium">Critical</td>
                      <td className="p-2 border bg-red-500/20 text-center"><Badge className="bg-red-500 text-white">High (1)</Badge></td>
                      <td className="p-2 border bg-amber-500/20 text-center"><Badge className="bg-amber-500 text-black">Moderate (2)</Badge></td>
                      <td className="p-2 border bg-green-500/20 text-center"><Badge className="bg-green-500 text-white">Low (3)</Badge></td>
                    </tr>
                    <tr>
                      <td className="p-2 border bg-muted/30 font-medium">Important</td>
                      <td className="p-2 border bg-amber-500/20 text-center"><Badge className="bg-amber-500 text-black">Moderate (1)</Badge></td>
                      <td className="p-2 border bg-green-500/20 text-center"><Badge className="bg-green-500 text-white">Low (2)</Badge></td>
                      <td className="p-2 border bg-green-500/20 text-center"><Badge className="bg-green-500 text-white">Low (1)</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Numbers in parentheses indicate priority score within each risk level for triage ordering.
              </p>
            </CardContent>
          </Card>

          {/* Standard Risk Factors */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Standard Risk Factors (FlightRiskTab.tsx)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk Factor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Urgency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standardRiskFactors.map((rf, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rf.factor}</TableCell>
                      <TableCell><Badge variant="outline">{rf.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={
                          rf.urgency === 'Critical' ? 'bg-red-500/20 text-red-700' :
                          rf.urgency === 'High' ? 'bg-orange-500/20 text-orange-700' :
                          'bg-yellow-500/20 text-yellow-700'
                        }>
                          {rf.urgency}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Analytics Metrics */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Flight Risk Analytics Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Benchmark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">High/Critical Risk Rate</TableCell>
                    <TableCell className="font-mono text-sm">(high + critical) / total_assessed × 100</TableCell>
                    <TableCell><Badge variant="outline">&lt;15%</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Retention Action Coverage</TableCell>
                    <TableCell className="font-mono text-sm">assessments_with_actions / high_risk_count × 100</TableCell>
                    <TableCell><Badge variant="outline">≥90%</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Successor Flight Risk</TableCell>
                    <TableCell className="font-mono text-sm">high_risk_successors / total_successors × 100</TableCell>
                    <TableCell><Badge variant="outline">&lt;10%</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Assessment Currency</TableCell>
                    <TableCell className="font-mono text-sm">assessed_within_90_days / key_employees × 100</TableCell>
                    <TableCell><Badge variant="outline">≥80%</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="flight_risk_assessments Table Reference (13 fields)" 
            fields={flightRiskFields} 
          />

          {/* Industry Alignment */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Industry Alignment</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Oracle HCM:</strong> Risk of Loss × Impact of Loss dual-axis model</li>
                <li><strong>SAP SuccessFactors:</strong> Retention risk matrix for prioritization</li>
                <li><strong>Visier:</strong> Successor Turnover Risk as critical pipeline metric</li>
                <li><strong>Workday:</strong> Proactive retention action tracking</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
