import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';
import { BarChart3, Target, CheckCircle2, Info, TrendingUp } from 'lucide-react';

const successionPlanFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique plan identifier', defaultValue: 'gen_random_uuid()' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company scope for plan' },
  { name: 'position_id', required: true, type: 'uuid', description: 'Target position for succession' },
  { name: 'plan_name', required: true, type: 'text', description: 'Display name for the plan', validation: 'Max 200 characters' },
  { name: 'plan_name_en', required: false, type: 'text', description: 'English translation of plan name' },
  { name: 'description', required: false, type: 'text', description: 'Plan purpose and context' },
  { name: 'risk_level', required: true, type: 'enum', description: 'Overall plan risk level', validation: 'low | medium | high', defaultValue: 'medium' },
  { name: 'priority', required: true, type: 'enum', description: 'Planning priority', validation: 'low | medium | high | critical', defaultValue: 'medium' },
  { name: 'status', required: true, type: 'enum', description: 'Plan lifecycle status', validation: 'draft | active | on_hold | completed', defaultValue: 'draft' },
  { name: 'target_date', required: false, type: 'date', description: 'Target succession readiness date' },
  { name: 'position_criticality', required: false, type: 'enum', description: 'Position criticality level', validation: 'important | critical | most_critical' },
  { name: 'replacement_difficulty', required: false, type: 'enum', description: 'Difficulty to replace incumbent', validation: 'easy | moderate | difficult' },
  { name: 'calculated_risk_level', required: false, type: 'enum', description: 'System-calculated risk based on matrix', validation: 'low | moderate | high' },
  { name: 'availability_reason_id', required: false, type: 'uuid', description: 'Expected vacancy reason reference' },
  { name: 'notes', required: false, type: 'text', description: 'Additional planning notes' },
  { name: 'created_by', required: false, type: 'uuid', description: 'User who created the plan' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Active status flag', defaultValue: 'true' },
  { name: 'start_date', required: false, type: 'date', description: 'Plan effective start date' },
  { name: 'end_date', required: false, type: 'date', description: 'Plan end date (if completed)' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()' },
];

export function SuccessionHealthScorecard() {
  return (
    <section id="sec-10-2" data-manual-anchor="sec-10-2" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            10.2 Succession Health Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Health Scorecard</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand industry-standard succession KPIs and their calculations</li>
                <li>Learn benchmark targets for healthy succession programs</li>
                <li>Configure dashboard metrics for executive visibility</li>
                <li>Interpret Pipeline Health Index components</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* KPI Definitions */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Industry-Standard KPIs</h4>
            <p className="text-muted-foreground">
              The Succession Health Scorecard provides executive-ready metrics following SAP SuccessFactors, 
              Workday, and SHRM best practices for succession program measurement.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Core KPI Definitions & Benchmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KPI Name</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Industry Benchmark</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary">Critical</Badge>
                        Succession Coverage Ratio
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      (Plans with Candidates) / (Key Positions) × 100
                    </TableCell>
                    <TableCell><Badge variant="outline">≥80%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Visier, SAP SF, SHRM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary">Critical</Badge>
                        Ready-Now Successor Rate
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      (Ready Now Candidates) / (Total Candidates) × 100
                    </TableCell>
                    <TableCell><Badge variant="outline">15-25%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Workday, Oracle HCM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bench Strength Ratio</TableCell>
                    <TableCell className="font-mono text-sm">
                      (Ready Successors) / (Critical Positions)
                    </TableCell>
                    <TableCell><Badge variant="outline">2-3+ per position</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Visier, SHRM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Average Successors per Position</TableCell>
                    <TableCell className="font-mono text-sm">
                      SUM(candidates) / COUNT(active_plans)
                    </TableCell>
                    <TableCell><Badge variant="outline">≥2.0</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Industry Standard</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pipeline Health Index</TableCell>
                    <TableCell className="font-mono text-sm">
                      (Coverage × 0.4) + (Readiness × 0.3) + (100 - Risk × 0.3)
                    </TableCell>
                    <TableCell><Badge variant="outline">≥70%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Composite Metric</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Single-Successor Risk</TableCell>
                    <TableCell className="font-mono text-sm">
                      (Plans with 1 candidate) / (Total Plans) × 100
                    </TableCell>
                    <TableCell><Badge variant="outline">&lt;10%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Risk Mitigation</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pipeline Health Index Deep Dive */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Pipeline Health Index Calculation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The Pipeline Health Index is a weighted composite score that provides a single 
                  executive-level metric for succession program health.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-background rounded border">
                    <div className="text-2xl font-bold text-primary">40%</div>
                    <div className="text-sm font-medium">Coverage Component</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Succession Coverage Ratio normalized to 0-100 scale
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded border">
                    <div className="text-2xl font-bold text-green-600">30%</div>
                    <div className="text-sm font-medium">Readiness Component</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Weighted readiness distribution (Ready Now weighted highest)
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded border">
                    <div className="text-2xl font-bold text-amber-600">30%</div>
                    <div className="text-sm font-medium">Risk Component</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Inverse of flight risk rate for key successors
                    </p>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded font-mono text-sm">
                  <span className="text-muted-foreground">// Pipeline Health Index Formula</span>
                  <br />
                  <span className="text-blue-600">PHI</span> = (coverage_ratio × <span className="text-green-600">0.40</span>) +
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(readiness_score × <span className="text-green-600">0.30</span>) +
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;((100 - risk_percentage) × <span className="text-green-600">0.30</span>)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Index Thresholds */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pipeline Health Index Thresholds</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Recommended Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">80-100</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Excellent</Badge></TableCell>
                    <TableCell><div className="w-4 h-4 rounded bg-green-500" /></TableCell>
                    <TableCell>Maintain current programs; focus on development acceleration</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">70-79</TableCell>
                    <TableCell><Badge className="bg-blue-500/20 text-blue-700">Good</Badge></TableCell>
                    <TableCell><div className="w-4 h-4 rounded bg-blue-500" /></TableCell>
                    <TableCell>Minor improvements; address specific gap areas</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">50-69</TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Moderate</Badge></TableCell>
                    <TableCell><div className="w-4 h-4 rounded bg-yellow-500" /></TableCell>
                    <TableCell>Increase pipeline focus; accelerate candidate development</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">30-49</TableCell>
                    <TableCell><Badge className="bg-orange-500/20 text-orange-700">Weak</Badge></TableCell>
                    <TableCell><div className="w-4 h-4 rounded bg-orange-500" /></TableCell>
                    <TableCell>Urgent intervention; expand candidate pool significantly</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">0-29</TableCell>
                    <TableCell><Badge className="bg-red-500/20 text-red-700">Critical</Badge></TableCell>
                    <TableCell><div className="w-4 h-4 rounded bg-red-500" /></TableCell>
                    <TableCell>Executive escalation; immediate action plan required</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="succession_plans Table Reference (21 fields)" 
            fields={successionPlanFields} 
          />

          {/* Industry Alignment */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Industry Alignment</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>SAP SuccessFactors:</strong> Succession Coverage Ratio as primary KPI</li>
                <li><strong>Workday:</strong> Ready-Now rate for immediate vacancy readiness</li>
                <li><strong>SHRM:</strong> Bench Strength Ratio for depth measurement</li>
                <li><strong>ISO 30414:</strong> Human Capital Reporting standard metrics</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
