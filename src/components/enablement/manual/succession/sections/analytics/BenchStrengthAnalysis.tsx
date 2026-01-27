import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';
import { Layers, CheckCircle2, Info, Code, Calculator } from 'lucide-react';

const successionCandidateFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique candidate identifier', defaultValue: 'gen_random_uuid()' },
  { name: 'plan_id', required: true, type: 'uuid', description: 'Reference to succession plan' },
  { name: 'employee_id', required: true, type: 'uuid', description: 'Reference to candidate employee' },
  { name: 'readiness_level', required: true, type: 'enum', description: 'Current readiness band', validation: 'ready_now | ready_1_2_years | ready_3_plus_years | developing | not_ready', defaultValue: 'developing' },
  { name: 'readiness_timeline', required: false, type: 'text', description: 'Detailed timeline description' },
  { name: 'strengths', required: false, type: 'text', description: 'Candidate strengths for role' },
  { name: 'development_areas', required: false, type: 'text', description: 'Areas requiring development' },
  { name: 'ranking', required: false, type: 'integer', description: 'Priority ranking within plan', validation: '1 = highest priority' },
  { name: 'status', required: true, type: 'enum', description: 'Candidate status', validation: 'active | on_hold | removed | promoted', defaultValue: 'active' },
  { name: 'notes', required: false, type: 'text', description: 'Additional notes' },
  { name: 'nominated_by', required: false, type: 'uuid', description: 'User who nominated candidate' },
  { name: 'performance_risk_id', required: false, type: 'uuid', description: 'Link to performance risk assessment' },
  { name: 'is_promotion_blocked', required: true, type: 'boolean', description: 'Whether promotion is blocked', defaultValue: 'false' },
  { name: 'block_reason', required: false, type: 'text', description: 'Reason for promotion block' },
  { name: 'last_risk_check_at', required: false, type: 'timestamptz', description: 'Last risk verification date' },
  { name: 'latest_readiness_score', required: false, type: 'numeric(5,2)', description: 'Most recent assessment score (0-100)' },
  { name: 'latest_readiness_band', required: false, type: 'text', description: 'Readiness band from latest assessment' },
  { name: 'readiness_assessed_at', required: false, type: 'timestamptz', description: 'Date of latest assessment' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()' },
];

export function BenchStrengthAnalysis() {
  return (
    <section id="sec-10-3" data-manual-anchor="sec-10-3" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            10.3 Bench Strength Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Bench Strength</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand the coverage score calculation algorithm</li>
                <li>Learn position-level bench depth analysis</li>
                <li>Interpret coverage thresholds and action triggers</li>
                <li>Navigate the BenchStrengthTab UI component</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Coverage Score Algorithm */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Coverage Score Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The coverage score algorithm weighs successor readiness levels to calculate a 0-100 position coverage score.
                Ready-now successors receive highest weight as they provide immediate vacancy coverage.
              </p>
              <Card className="bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    BenchStrengthTab.tsx Implementation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`function calculateCoverageScore(position: PositionCoverage): number {
  // Ready now = 40 points per candidate (max 80)
  // Ready 1-2 years = 20 points per candidate (max 40)
  // Ready 3+ years = 10 points per candidate (max 20)
  
  return Math.min(100, 
    Math.min(80, ready_now * 40) + 
    Math.min(40, ready_1_2 * 20) + 
    Math.min(20, ready_3_plus * 10)
  );
}`}
                  </pre>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Score Weighting Table */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Readiness Level Score Weights</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Readiness Level</TableHead>
                    <TableHead>Points per Candidate</TableHead>
                    <TableHead>Maximum Points</TableHead>
                    <TableHead>Rationale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-700">Ready Now</Badge>
                    </TableCell>
                    <TableCell className="font-mono">40</TableCell>
                    <TableCell className="font-mono">80 (2 candidates)</TableCell>
                    <TableCell className="text-muted-foreground">Immediate vacancy coverage</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge className="bg-blue-500/20 text-blue-700">Ready 1-2 Years</Badge>
                    </TableCell>
                    <TableCell className="font-mono">20</TableCell>
                    <TableCell className="font-mono">40 (2 candidates)</TableCell>
                    <TableCell className="text-muted-foreground">Near-term pipeline depth</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Badge className="bg-amber-500/20 text-amber-700">Ready 3+ Years</Badge>
                    </TableCell>
                    <TableCell className="font-mono">10</TableCell>
                    <TableCell className="font-mono">20 (2 candidates)</TableCell>
                    <TableCell className="text-muted-foreground">Long-term pipeline sustainability</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-2">
                Maximum total score: 100 points (caps prevent over-reliance on any single readiness tier)
              </p>
            </CardContent>
          </Card>

          {/* Coverage Thresholds */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Coverage Score Thresholds (Industry Standard)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Score Range</TableHead>
                    <TableHead>Coverage Level</TableHead>
                    <TableHead>Visual Indicator</TableHead>
                    <TableHead>Required Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">80-100</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Strong</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-green-600">Green</span></div></TableCell>
                    <TableCell>Maintain; focus on development acceleration</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">50-79</TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Moderate</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span className="text-yellow-600">Yellow</span></div></TableCell>
                    <TableCell>Develop pipeline; accelerate readiness programs</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">20-49</TableCell>
                    <TableCell><Badge className="bg-orange-500/20 text-orange-700">Weak</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-orange-600">Orange</span></div></TableCell>
                    <TableCell>Urgent development; expand candidate pool</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">0-19</TableCell>
                    <TableCell><Badge className="bg-red-500/20 text-red-700">Critical</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-red-600">Red</span></div></TableCell>
                    <TableCell>Immediate action; emergency succession planning</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bench Depth Metrics */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bench Depth Risk Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Target Benchmark</TableHead>
                    <TableHead>Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">No-Successor Positions</TableCell>
                    <TableCell>Key positions with zero identified successors</TableCell>
                    <TableCell><Badge variant="outline">0%</Badge></TableCell>
                    <TableCell><Badge className="bg-red-500/20 text-red-700">Critical</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Single-Successor Risk</TableCell>
                    <TableCell>Positions with only one active successor</TableCell>
                    <TableCell><Badge variant="outline">&lt;10%</Badge></TableCell>
                    <TableCell><Badge className="bg-orange-500/20 text-orange-700">High</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Strong Bench</TableCell>
                    <TableCell>Positions with 2+ ready-now or ready-soon successors</TableCell>
                    <TableCell><Badge variant="outline">≥80%</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Target</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Development Gap</TableCell>
                    <TableCell>Positions where all successors are 3+ years away</TableCell>
                    <TableCell><Badge variant="outline">&lt;15%</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Monitor</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* UI Component Reference */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">BenchStrengthTab.tsx UI Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Summary Cards</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Total Positions count</li>
                    <li>• Critical Positions (most_critical + critical)</li>
                    <li>• High Risk positions (from retention matrix)</li>
                    <li>• No Successors count</li>
                    <li>• Well Covered (80%+) count</li>
                    <li>• Average Coverage percentage</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Position Table Columns</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Position title with department</li>
                    <li>• Criticality badge (position_criticality)</li>
                    <li>• Retention Risk badge (calculated matrix)</li>
                    <li>• Ready Now / 1-2 Years / 3+ Years counts</li>
                    <li>• Coverage score with progress bar</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="succession_candidates Table Reference (20 fields)" 
            fields={successionCandidateFields} 
          />

          {/* Industry Alignment */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Industry Alignment</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>SHRM:</strong> Bench Strength Ratio of 2-3 ready successors per critical position</li>
                <li><strong>Industry Standard:</strong> Tiered readiness weighting for accurate pipeline health</li>
                <li><strong>Industry Standard:</strong> Position-level coverage tracking with risk indicators</li>
                <li><strong>Industry Standard:</strong> Real-time bench depth visualization</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
