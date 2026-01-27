import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';
import { Route, CheckCircle2, Info, ArrowRight, Users } from 'lucide-react';

const talentPoolFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique pool identifier', defaultValue: 'gen_random_uuid()' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company scope' },
  { name: 'name', required: true, type: 'text', description: 'Pool display name', validation: 'Max 100 characters' },
  { name: 'code', required: false, type: 'text', description: 'Pool code for reference' },
  { name: 'description', required: false, type: 'text', description: 'Pool purpose and criteria' },
  { name: 'pool_type', required: true, type: 'enum', description: 'Pool classification', validation: 'high_potential | leadership | technical | specialist | emerging' },
  { name: 'criteria', required: false, type: 'jsonb', description: 'Eligibility criteria configuration' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Pool active status', defaultValue: 'true' },
  { name: 'start_date', required: false, type: 'date', description: 'Pool effective start date' },
  { name: 'end_date', required: false, type: 'date', description: 'Pool end date' },
  { name: 'created_by', required: false, type: 'uuid', description: 'User who created pool' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()' },
];

const talentPoolMemberFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique membership identifier', defaultValue: 'gen_random_uuid()' },
  { name: 'pool_id', required: true, type: 'uuid', description: 'Reference to talent pool' },
  { name: 'employee_id', required: true, type: 'uuid', description: 'Member employee reference' },
  { name: 'added_by', required: false, type: 'uuid', description: 'User who added member' },
  { name: 'reason', required: false, type: 'text', description: 'Nomination reason' },
  { name: 'status', required: true, type: 'enum', description: 'Membership status', validation: 'nominated | approved | rejected | active | graduated | removed', defaultValue: 'nominated' },
  { name: 'start_date', required: false, type: 'date', description: 'Membership start date' },
  { name: 'end_date', required: false, type: 'date', description: 'Membership end date (if graduated/removed)' },
  { name: 'development_notes', required: false, type: 'text', description: 'Development progress notes' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()' },
];

export function TalentPipelineMetrics() {
  return (
    <section id="sec-10-6" data-manual-anchor="sec-10-6" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            10.6 Talent Pipeline Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Pipeline Metrics</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand pipeline velocity and conversion metrics</li>
                <li>Track pool-to-successor graduation rates</li>
                <li>Monitor stagnation and attrition indicators</li>
                <li>Analyze talent pool health across the organization</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Pipeline Lifecycle */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Talent Pool Member Status Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2 text-sm font-mono bg-background p-4 rounded">
                <Badge variant="outline">nominated</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge className="bg-blue-500/20 text-blue-700">approved</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge className="bg-green-500/20 text-green-700">active</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <Badge className="bg-purple-500/20 text-purple-700">graduated</Badge>
                  <span className="text-xs text-muted-foreground">or</span>
                  <Badge className="bg-gray-500/20 text-gray-700">removed</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Alternative path: nominated → rejected (with rejection reason)
              </p>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Industry-Standard Pipeline Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Benchmark</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Pool → Succession Conversion</TableCell>
                    <TableCell className="font-mono text-sm">(graduated_to_successor) / (ever_active) × 100</TableCell>
                    <TableCell><Badge variant="outline">20-30%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Workday</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ready-Now Rate</TableCell>
                    <TableCell className="font-mono text-sm">(ready_now_band) / (active_members) × 100</TableCell>
                    <TableCell><Badge variant="outline">15-25%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">SAP SF</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Stagnation Rate</TableCell>
                    <TableCell className="font-mono text-sm">(no_status_change_12mo) / (active) × 100</TableCell>
                    <TableCell><Badge variant="outline">&lt;15%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Visier</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Attrition from Pool</TableCell>
                    <TableCell className="font-mono text-sm">(departed_members) / (total_members) × 100</TableCell>
                    <TableCell><Badge variant="outline">&lt;8%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">SHRM</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pipeline Velocity</TableCell>
                    <TableCell className="font-mono text-sm">AVG(graduation_date - nomination_date)</TableCell>
                    <TableCell><Badge variant="outline">&lt;24 months</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Workday</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Graduation Rate</TableCell>
                    <TableCell className="font-mono text-sm">(graduated) / (graduated + removed) × 100</TableCell>
                    <TableCell><Badge variant="outline">≥70%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Industry</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pool Health Indicators */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pool Health Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicator</TableHead>
                    <TableHead>Healthy Range</TableHead>
                    <TableHead>Warning</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Pool Size vs. Key Positions</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">3:1 ratio</Badge></TableCell>
                    <TableCell>&lt;2:1</TableCell>
                    <TableCell>Expand nomination pipeline</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Average Time in Pool</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">12-24 months</Badge></TableCell>
                    <TableCell>&gt;36 months</TableCell>
                    <TableCell>Review stagnant members</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Rejection Rate</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">&lt;20%</Badge></TableCell>
                    <TableCell>&gt;30%</TableCell>
                    <TableCell>Improve nomination criteria</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Development Activity Rate</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">≥80%</Badge></TableCell>
                    <TableCell>&lt;60%</TableCell>
                    <TableCell>Assign development plans</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Field References */}
          <FieldReferenceTable 
            title="talent_pools Table Reference (13 fields)" 
            fields={talentPoolFields} 
          />

          <FieldReferenceTable 
            title="talent_pool_members Table Reference (11 fields)" 
            fields={talentPoolMemberFields} 
          />

          {/* Industry Alignment */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Industry Alignment</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Workday:</strong> Pipeline Velocity as key talent mobility metric</li>
                <li><strong>SAP SuccessFactors:</strong> Pool-to-Succession conversion tracking</li>
                <li><strong>Visier:</strong> Stagnation detection for pipeline health</li>
                <li><strong>SHRM:</strong> Talent pool attrition benchmarks</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
