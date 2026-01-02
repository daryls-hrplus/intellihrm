import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle, AlertTriangle, XCircle, Search, Users, Target, Calculator, FileCheck, Shield } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ValidationCheck {
  id: string;
  check: string;
  query: string;
  expectedResult: string;
  impact: 'critical' | 'high' | 'medium';
}

const PRE_CYCLE_VALIDATION: ValidationCheck[] = [
  {
    id: 'DV-01',
    check: 'All employees have active employment status',
    query: 'Verify no terminated employees in eligible population',
    expectedResult: '0 terminated employees in eligibility list',
    impact: 'critical'
  },
  {
    id: 'DV-02',
    check: 'Manager relationships are current',
    query: 'Check for employees without managers or with inactive managers',
    expectedResult: '0 orphaned employees',
    impact: 'critical'
  },
  {
    id: 'DV-03',
    check: 'Goal weights sum to 100% for all participants',
    query: 'Calculate goal weight totals per participant',
    expectedResult: 'All participants = 100%',
    impact: 'high'
  },
  {
    id: 'DV-04',
    check: 'Competencies assigned to all job roles',
    query: 'List jobs without competency assignments',
    expectedResult: '0 jobs without competencies',
    impact: 'high'
  },
  {
    id: 'DV-05',
    check: 'Form template correctly linked to cycle',
    query: 'Verify template ID is valid and active',
    expectedResult: 'Template status = active',
    impact: 'critical'
  },
  {
    id: 'DV-06',
    check: 'Cycle dates do not overlap with existing active cycles',
    query: 'Check for date range conflicts',
    expectedResult: 'No overlapping cycles for same population',
    impact: 'medium'
  }
];

const DATA_INTEGRITY_ISSUES = [
  {
    issue: 'Duplicate participant entries',
    cause: 'Multiple enrollments or position changes during cycle',
    detection: 'Query for employee_id appearing more than once per cycle',
    resolution: 'Review multi-position mode, consolidate or remove duplicates',
    prevention: 'Set multi-position mode before enrollment'
  },
  {
    issue: 'Orphaned ratings (no parent participant)',
    cause: 'Participant deleted after ratings entered',
    detection: 'Join ratings to participants, find nulls',
    resolution: 'Restore participant or archive orphaned data',
    prevention: 'Prevent participant deletion with child records'
  },
  {
    issue: 'Score calculation mismatch',
    cause: 'Weight changes after ratings submitted',
    detection: 'Recalculate scores and compare to stored values',
    resolution: 'Lock weights after ratings begin, recalculate if needed',
    prevention: 'Lock weights when cycle moves to active'
  },
  {
    issue: 'Missing competency ratings',
    cause: 'Competencies added to job after enrollment',
    detection: 'Count expected vs actual competency ratings',
    resolution: 'Add missing competencies to participant form',
    prevention: 'Freeze competency assignments at enrollment'
  },
  {
    issue: 'Invalid score values (out of range)',
    cause: 'API bypass or data migration error',
    detection: 'Check scores against min/max rating scale',
    resolution: 'Correct invalid values, investigate source',
    prevention: 'Database constraints on score columns'
  },
  {
    issue: 'Calibration without justification',
    cause: 'Justification field not enforced in older versions',
    detection: 'Query calibration adjustments with null/empty justification',
    resolution: 'Add justification retroactively for audit compliance',
    prevention: 'Make justification field required'
  }
];

const ORG_HIERARCHY_CHECKS = [
  { check: 'No circular reporting relationships', type: 'Critical', frequency: 'Before each cycle' },
  { check: 'All employees have exactly one primary manager', type: 'Critical', frequency: 'Before each cycle' },
  { check: 'Manager tenure sufficient for evaluation', type: 'Warning', frequency: 'At enrollment' },
  { check: 'Department assignments are current', type: 'High', frequency: 'Before each cycle' },
  { check: 'Cost center mappings are valid', type: 'Medium', frequency: 'Quarterly' },
  { check: 'Location data is complete', type: 'Low', frequency: 'As needed' }
];

const SCORE_VALIDATION_RULES = [
  {
    rule: 'Component scores within scale range',
    formula: 'min_rating ≤ score ≤ max_rating',
    example: '1 ≤ 3.5 ≤ 5 ✓'
  },
  {
    rule: 'Section weights sum to 100%',
    formula: 'goals_weight + competencies_weight + responsibilities_weight + values_weight = 100',
    example: '50 + 25 + 15 + 10 = 100 ✓'
  },
  {
    rule: 'Goal weights within section sum to 100%',
    formula: 'Σ(individual_goal_weight) = 100',
    example: '40 + 35 + 25 = 100 ✓'
  },
  {
    rule: 'Overall score matches calculation',
    formula: 'Σ(section_score × section_weight) / 100',
    example: '(4.2×50 + 3.8×25 + 4.0×15 + 4.5×10) / 100 = 4.1 ✓'
  },
  {
    rule: 'Calibration adjustment documented',
    formula: 'IF score_adjusted THEN justification NOT NULL',
    example: 'Adjusted 3.8 → 4.0, Justification: "Market comparison" ✓'
  }
];

export function DataQualitySection() {
  return (
    <div className="space-y-8">
      <Card id="sec-8-7">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 8.7</Badge>
            <Badge variant="secondary">Reference</Badge>
          </div>
          <CardTitle className="text-2xl">Data Quality & Validation</CardTitle>
          <CardDescription>
            Pre-cycle validation checklists, data integrity checks, and score calculation verification procedures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-8-7']} />

          {/* Quality Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <FileCheck className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold">100%</div>
              <div className="text-xs text-muted-foreground">Data Completeness Target</div>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
              <Calculator className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold">0</div>
              <div className="text-xs text-muted-foreground">Calculation Errors Target</div>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-lg font-bold">100%</div>
              <div className="text-xs text-muted-foreground">Valid Manager Mappings</div>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
              <Target className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <div className="text-lg font-bold">100%</div>
              <div className="text-xs text-muted-foreground">Goal Weight Compliance</div>
            </div>
          </div>

          <Tabs defaultValue="pre-cycle" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pre-cycle">Pre-Cycle Validation</TabsTrigger>
              <TabsTrigger value="integrity">Data Integrity</TabsTrigger>
              <TabsTrigger value="hierarchy">Org Hierarchy</TabsTrigger>
              <TabsTrigger value="scores">Score Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="pre-cycle" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Pre-Cycle Data Validation Checklist</h3>
              </div>

              <div className="space-y-3">
                {PRE_CYCLE_VALIDATION.map((check) => (
                  <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox id={check.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <label htmlFor={check.id} className="font-medium text-sm cursor-pointer">
                          {check.check}
                        </label>
                        <Badge variant={
                          check.impact === 'critical' ? 'destructive' :
                          check.impact === 'high' ? 'outline' : 'secondary'
                        }>
                          {check.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{check.query}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-green-700 dark:text-green-400">Expected: {check.expectedResult}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Validation Timing</h4>
                <p className="text-sm text-muted-foreground">
                  Run all validation checks at least 1 week before cycle launch to allow time for data corrections.
                  Critical checks should be re-run immediately before activating the cycle.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="integrity" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Common Data Integrity Issues</h3>
              </div>

              <div className="space-y-4">
                {DATA_INTEGRITY_ISSUES.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="font-medium">{item.issue}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cause: </span>
                        <span>{item.cause}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Detection: </span>
                        <span>{item.detection}</span>
                      </div>
                      <div className="p-2 bg-green-500/10 rounded">
                        <span className="text-green-700 dark:text-green-400 font-medium">Resolution: </span>
                        <span className="text-muted-foreground">{item.resolution}</span>
                      </div>
                      <div className="p-2 bg-blue-500/10 rounded">
                        <span className="text-blue-700 dark:text-blue-400 font-medium">Prevention: </span>
                        <span className="text-muted-foreground">{item.prevention}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hierarchy" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Organizational Hierarchy Validation</h3>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Validation Check</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Frequency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ORG_HIERARCHY_CHECKS.map((check, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-sm">{check.check}</TableCell>
                        <TableCell>
                          <Badge variant={
                            check.type === 'Critical' ? 'destructive' :
                            check.type === 'High' ? 'outline' :
                            check.type === 'Warning' ? 'secondary' : 'secondary'
                          }>
                            {check.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{check.frequency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">Common Hierarchy Issues</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Manager terminated but not replaced - blocks team evaluations</li>
                  <li>• Recent org changes not reflected - evaluations go to wrong manager</li>
                  <li>• Circular relationships - system cannot determine evaluation chain</li>
                  <li>• Skip-level reporting - may require special handling</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="scores" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Score Calculation Validation</h3>
              </div>

              <div className="space-y-4">
                {SCORE_VALIDATION_RULES.map((rule, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{rule.rule}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-2 bg-muted rounded">
                        <span className="text-xs text-muted-foreground">Formula: </span>
                        <code className="text-xs">{rule.formula}</code>
                      </div>
                      <div className="p-2 bg-green-500/10 rounded">
                        <span className="text-xs text-muted-foreground">Example: </span>
                        <code className="text-xs text-green-700 dark:text-green-400">{rule.example}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Score Audit Trail
                </h4>
                <p className="text-sm text-muted-foreground">
                  All score changes are logged with timestamp, user, and before/after values. 
                  Use the audit log to investigate any calculation discrepancies and verify 
                  that calibration adjustments are properly documented.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
