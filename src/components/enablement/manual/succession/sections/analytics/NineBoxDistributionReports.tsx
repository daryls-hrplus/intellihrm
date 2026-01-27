import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';
import { Grid3X3, CheckCircle2, Info, TrendingUp, Users } from 'lucide-react';

const nineBoxAssessmentFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique assessment identifier', defaultValue: 'gen_random_uuid()' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company scope' },
  { name: 'employee_id', required: true, type: 'uuid', description: 'Employee being assessed' },
  { name: 'assessed_by', required: false, type: 'uuid', description: 'User who performed assessment' },
  { name: 'assessment_date', required: true, type: 'date', description: 'Date of assessment' },
  { name: 'performance_rating', required: true, type: 'integer', description: 'Performance axis rating (1-3)', validation: '1=Low, 2=Medium, 3=High' },
  { name: 'potential_rating', required: true, type: 'integer', description: 'Potential axis rating (1-3)', validation: '1=Low, 2=Medium, 3=High' },
  { name: 'performance_notes', required: false, type: 'text', description: 'Justification for performance rating' },
  { name: 'potential_notes', required: false, type: 'text', description: 'Justification for potential rating' },
  { name: 'overall_notes', required: false, type: 'text', description: 'General assessment notes' },
  { name: 'assessment_period', required: false, type: 'text', description: 'Assessment cycle identifier (e.g., "2024-Q4")' },
  { name: 'is_current', required: true, type: 'boolean', description: 'Current assessment flag', defaultValue: 'true' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()' },
];

const nineBoxLabels = [
  { position: '3,3', label: 'Future Stars', action: 'Accelerate development, stretch assignments', color: 'bg-emerald-500' },
  { position: '2,3', label: 'Growth Employees', action: 'Invest in development programs', color: 'bg-green-500' },
  { position: '1,3', label: 'Enigmas', action: 'Investigate performance blockers', color: 'bg-teal-500' },
  { position: '3,2', label: 'High Performers', action: 'Recognize, retain, consider lateral moves', color: 'bg-blue-500' },
  { position: '2,2', label: 'Core Players', action: 'Maintain engagement, skill development', color: 'bg-slate-500' },
  { position: '1,2', label: 'Dilemmas', action: 'Performance coaching, clear expectations', color: 'bg-amber-500' },
  { position: '3,1', label: 'Solid Contributors', action: 'Role optimization, knowledge transfer', color: 'bg-cyan-500' },
  { position: '2,1', label: 'Average Performers', action: 'Targeted skill development', color: 'bg-gray-500' },
  { position: '1,1', label: 'At Risk', action: 'PIP or managed exit', color: 'bg-red-500' },
];

export function NineBoxDistributionReports() {
  return (
    <section id="sec-10-5" data-manual-anchor="sec-10-5" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            10.5 Nine-Box Distribution & Movement Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Nine-Box Distribution</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand the McKinsey 9-Box grid labels and recommended actions</li>
                <li>Learn healthy distribution benchmarks from SAP/Workday</li>
                <li>Analyze movement patterns between assessment cycles</li>
                <li>Identify calibration variance indicators</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Nine-Box Grid Labels */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Nine-Box Grid Labels (McKinsey Model)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="p-2 border bg-muted/50"></th>
                      <th className="p-2 border bg-muted/50 text-center font-medium" colSpan={3}>
                        Performance →
                      </th>
                    </tr>
                    <tr>
                      <th className="p-2 border bg-muted/50 text-center font-medium">
                        Potential ↓
                      </th>
                      <th className="p-2 border bg-muted/50 text-center font-medium">Low (1)</th>
                      <th className="p-2 border bg-muted/50 text-center font-medium">Medium (2)</th>
                      <th className="p-2 border bg-muted/50 text-center font-medium">High (3)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border bg-muted/30 font-medium text-center">High (3)</td>
                      <td className="p-2 border bg-teal-500/20 text-center">
                        <div className="font-medium">Enigmas</div>
                        <div className="text-xs text-muted-foreground">Investigate blockers</div>
                      </td>
                      <td className="p-2 border bg-green-500/20 text-center">
                        <div className="font-medium">Growth Employees</div>
                        <div className="text-xs text-muted-foreground">Invest in development</div>
                      </td>
                      <td className="p-2 border bg-emerald-500/20 text-center">
                        <div className="font-medium text-emerald-700">Future Stars</div>
                        <div className="text-xs text-muted-foreground">Accelerate, stretch</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border bg-muted/30 font-medium text-center">Medium (2)</td>
                      <td className="p-2 border bg-amber-500/20 text-center">
                        <div className="font-medium">Dilemmas</div>
                        <div className="text-xs text-muted-foreground">Performance coaching</div>
                      </td>
                      <td className="p-2 border bg-slate-500/20 text-center">
                        <div className="font-medium">Core Players</div>
                        <div className="text-xs text-muted-foreground">Maintain engagement</div>
                      </td>
                      <td className="p-2 border bg-blue-500/20 text-center">
                        <div className="font-medium text-blue-700">High Performers</div>
                        <div className="text-xs text-muted-foreground">Recognize, retain</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 border bg-muted/30 font-medium text-center">Low (1)</td>
                      <td className="p-2 border bg-red-500/20 text-center">
                        <div className="font-medium text-red-700">At Risk</div>
                        <div className="text-xs text-muted-foreground">PIP or exit</div>
                      </td>
                      <td className="p-2 border bg-gray-500/20 text-center">
                        <div className="font-medium">Average Performers</div>
                        <div className="text-xs text-muted-foreground">Skill development</div>
                      </td>
                      <td className="p-2 border bg-cyan-500/20 text-center">
                        <div className="font-medium">Solid Contributors</div>
                        <div className="text-xs text-muted-foreground">Role optimization</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Benchmarks */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Healthy Distribution Benchmarks (SAP/Workday)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quadrant/Position</TableHead>
                    <TableHead>Target Distribution</TableHead>
                    <TableHead>Warning Threshold</TableHead>
                    <TableHead>Interpretation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-emerald-500/20 text-emerald-700">Future Stars (3,3)</Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">10-15%</Badge></TableCell>
                    <TableCell>&gt;20% or &lt;5%</TableCell>
                    <TableCell className="text-muted-foreground">Too high may indicate rating inflation</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-slate-500/20 text-slate-700">Core Players (2,2)</Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">40-50%</Badge></TableCell>
                    <TableCell>&lt;30% or &gt;60%</TableCell>
                    <TableCell className="text-muted-foreground">Majority should be solid contributors</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-red-500/20 text-red-700">At Risk (1,1)</Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">&lt;5%</Badge></TableCell>
                    <TableCell>&gt;10%</TableCell>
                    <TableCell className="text-muted-foreground">High % indicates systemic issues</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-blue-500/20 text-blue-700">High Performers (3,2)</Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">15-20%</Badge></TableCell>
                    <TableCell>&lt;10%</TableCell>
                    <TableCell className="text-muted-foreground">Strong performers without advancement path</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-teal-500/20 text-teal-700">Enigmas (1,3)</Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">&lt;5%</Badge></TableCell>
                    <TableCell>&gt;8%</TableCell>
                    <TableCell className="text-muted-foreground">Requires investigation of blockers</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Movement Analysis */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Movement Analysis Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Benchmark</TableHead>
                    <TableHead>Insight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Upward Movement Rate</TableCell>
                    <TableCell className="font-mono text-sm">employees_moved_up / total_assessed × 100</TableCell>
                    <TableCell><Badge variant="outline">15-25%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Development program effectiveness</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Downward Movement Rate</TableCell>
                    <TableCell className="font-mono text-sm">employees_moved_down / total_assessed × 100</TableCell>
                    <TableCell><Badge variant="outline">&lt;10%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Performance issues or recalibration</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Stability Rate</TableCell>
                    <TableCell className="font-mono text-sm">employees_same_box / total_assessed × 100</TableCell>
                    <TableCell><Badge variant="outline">60-75%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Consistent assessment standards</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Calibration Variance</TableCell>
                    <TableCell className="font-mono text-sm">std_dev(ratings_by_assessor)</TableCell>
                    <TableCell><Badge variant="outline">&lt;0.5</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Inter-rater reliability</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Assessment Currency</TableCell>
                    <TableCell className="font-mono text-sm">current_assessments / total_employees × 100</TableCell>
                    <TableCell><Badge variant="outline">≥90%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Data freshness indicator</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Visualization Components */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">UI Visualization Components</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">SuccessionAnalytics.tsx → Overview Tab</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Horizontal bar chart by Nine-Box label</li>
                    <li>• Filter by is_current = true</li>
                    <li>• Distribution calculation with labels array</li>
                    <li>• Index mapping: (3 - perf) × 3 + (pot - 1)</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Trend Analysis Features</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Period-over-period comparison</li>
                    <li>• Movement direction indicators</li>
                    <li>• Assessor variance detection</li>
                    <li>• Stagnation alerts (no change 2+ cycles)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="nine_box_assessments Table Reference (14 fields)" 
            fields={nineBoxAssessmentFields} 
          />

          {/* Industry Alignment */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Industry Alignment</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>McKinsey:</strong> Original 9-Box matrix framework with action-oriented labels</li>
                <li><strong>SAP SuccessFactors:</strong> Calibration session integration for rating consistency</li>
                <li><strong>Workday:</strong> Talent review with movement tracking over cycles</li>
                <li><strong>Visier:</strong> Distribution benchmarking and variance detection</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
