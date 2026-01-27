import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CheckCircle2, Info, BarChart3, Target } from 'lucide-react';

export function DiversityInclusionAnalytics() {
  return (
    <section id="sec-10-8" data-manual-anchor="sec-10-8" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            10.8 Diversity & Inclusion Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">DEI Analytics</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Track pipeline representation across demographic dimensions</li>
                <li>Monitor pool-to-promotion equity metrics</li>
                <li>Identify diversity gaps in leadership succession</li>
                <li>Align succession analytics with ESG reporting requirements</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* DEI Metrics */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                DEI Metrics for Succession (SHRM/Industry Standard)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Reporting Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Pipeline Representation</TableCell>
                    <TableCell>% of underrepresented groups in succession pools</TableCell>
                    <TableCell className="font-mono text-sm">(URG in pools) / (total pool members) × 100</TableCell>
                    <TableCell><Badge variant="outline">Board</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Leadership Pipeline Diversity</TableCell>
                    <TableCell>Diversity of ready-now successors vs. total workforce</TableCell>
                    <TableCell className="font-mono text-sm">(URG ready-now) / (ready-now total) vs. workforce %</TableCell>
                    <TableCell><Badge variant="outline">Executive</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Pool-to-Promotion Equity</TableCell>
                    <TableCell>Conversion rate by demographic group</TableCell>
                    <TableCell className="font-mono text-sm">(promotions by group) / (pool members by group)</TableCell>
                    <TableCell><Badge variant="outline">HR</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Diversity Gap Index</TableCell>
                    <TableCell>Difference between pipeline and target representation</TableCell>
                    <TableCell className="font-mono text-sm">target_% - actual_%</TableCell>
                    <TableCell><Badge variant="outline">Board</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Representation Tracking */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Representation Tracking Dimensions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimension</TableHead>
                    <TableHead>Data Source</TableHead>
                    <TableHead>Privacy Level</TableHead>
                    <TableHead>Aggregation Minimum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Gender</TableCell>
                    <TableCell className="text-muted-foreground">profiles.gender</TableCell>
                    <TableCell><Badge variant="outline">Standard</Badge></TableCell>
                    <TableCell>5 individuals</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ethnicity/Race</TableCell>
                    <TableCell className="text-muted-foreground">profiles.ethnicity (voluntary)</TableCell>
                    <TableCell><Badge className="bg-amber-500/20 text-amber-700">Sensitive</Badge></TableCell>
                    <TableCell>10 individuals</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Age Band</TableCell>
                    <TableCell className="text-muted-foreground">Calculated from date_of_birth</TableCell>
                    <TableCell><Badge variant="outline">Standard</Badge></TableCell>
                    <TableCell>5 individuals</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Disability Status</TableCell>
                    <TableCell className="text-muted-foreground">profiles.disability_status (voluntary)</TableCell>
                    <TableCell><Badge className="bg-red-500/20 text-red-700">Protected</Badge></TableCell>
                    <TableCell>15 individuals</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Veteran Status</TableCell>
                    <TableCell className="text-muted-foreground">profiles.veteran_status (voluntary)</TableCell>
                    <TableCell><Badge className="bg-amber-500/20 text-amber-700">Sensitive</Badge></TableCell>
                    <TableCell>10 individuals</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ESG Alignment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ESG & Regulatory Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">ESG Reporting Requirements</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Board diversity targets and progress</li>
                    <li>• C-suite succession diversity</li>
                    <li>• Pipeline diversity by level</li>
                    <li>• Year-over-year improvement metrics</li>
                    <li>• Third-party diversity rankings data</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Regulatory Compliance</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• EEO-1 reporting alignment (US)</li>
                    <li>• Gender Pay Gap reporting (UK)</li>
                    <li>• Employment Equity Act (South Africa)</li>
                    <li>• Caribbean labor law compliance</li>
                    <li>• GDPR data handling for EU employees</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Considerations */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Privacy & Data Handling</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Aggregation Minimums:</strong> Reports suppress data below threshold counts</li>
                <li><strong>Voluntary Disclosure:</strong> Ethnicity and disability data is self-reported</li>
                <li><strong>Access Control:</strong> DEI analytics restricted to Admin, HR Partner, Executive roles</li>
                <li><strong>Audit Trail:</strong> All DEI report access is logged for compliance</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Industry Alignment */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Industry Alignment</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Industry Standard:</strong> Talent Intelligence with DEI dashboards</li>
                <li><strong>Industry Standard:</strong> People Analytics with representation tracking</li>
                <li><strong>Industry Standard:</strong> Diversity metrics as core workforce analytics</li>
                <li><strong>SHRM:</strong> DEI in succession as organizational health indicator</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
