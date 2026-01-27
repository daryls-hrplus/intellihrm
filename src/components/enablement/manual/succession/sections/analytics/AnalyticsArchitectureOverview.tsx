import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, RefreshCw, Shield, Workflow, CheckCircle2, Info } from 'lucide-react';

export function AnalyticsArchitectureOverview() {
  return (
    <section id="sec-10-1" data-manual-anchor="sec-10-1" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            10.1 Analytics Architecture Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Architecture</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand the data flow architecture from source modules to analytics dashboards</li>
                <li>Learn refresh cycles and caching strategies for optimal performance</li>
                <li>Identify integration points with Performance, 360, and Talent modules</li>
                <li>Understand permission requirements for analytics access by role</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Data Flow Architecture */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Data Flow Architecture</h4>
            <p className="text-muted-foreground">
              Succession analytics aggregates data from multiple source modules following an enterprise Analytics Hub pattern. 
              Data flows through a unified signal processing layer before reaching visualization components.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Source Data Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2 text-primary">Source Modules</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Performance Appraisals</li>
                    <li>• 360 Feedback Cycles</li>
                    <li>• Competency Assessments</li>
                    <li>• Goal Achievement</li>
                    <li>• Learning Completions</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2 text-primary">Signal Layer</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• talent_signal_snapshots</li>
                    <li>• nine_box_assessments</li>
                    <li>• readiness_assessment_responses</li>
                    <li>• flight_risk_assessments</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2 text-primary">Analytics Tables</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• succession_plans</li>
                    <li>• succession_candidates</li>
                    <li>• key_position_risks</li>
                    <li>• talent_pool_members</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2 text-primary">Visualization</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• SuccessionAnalytics.tsx</li>
                    <li>• BenchStrengthTab.tsx</li>
                    <li>• FlightRiskTab.tsx</li>
                    <li>• AIModuleReportBuilder</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refresh Cycles */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Cycles & Caching Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Type</TableHead>
                    <TableHead>Refresh Frequency</TableHead>
                    <TableHead>Cache Duration</TableHead>
                    <TableHead>Trigger Events</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Nine-Box Placements</TableCell>
                    <TableCell>Real-time on assessment</TableCell>
                    <TableCell>None (live query)</TableCell>
                    <TableCell>Assessment completion, override</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Succession Coverage</TableCell>
                    <TableCell>On candidate change</TableCell>
                    <TableCell>5 minutes</TableCell>
                    <TableCell>Candidate add/remove, readiness update</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Flight Risk Distribution</TableCell>
                    <TableCell>On assessment</TableCell>
                    <TableCell>None (live query)</TableCell>
                    <TableCell>New assessment, status change</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Talent Pool Metrics</TableCell>
                    <TableCell>Hourly aggregation</TableCell>
                    <TableCell>1 hour</TableCell>
                    <TableCell>Member add/graduation/removal</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Readiness Trends</TableCell>
                    <TableCell>Daily rollup</TableCell>
                    <TableCell>24 hours</TableCell>
                    <TableCell>Assessment cycle completion</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Analytics Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>HR Partner</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Executive</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Succession Health Scorecard</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Summary</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bench Strength Analysis</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Team Only</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Flight Risk Reports</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Team Only</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Summary</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Nine-Box Distribution</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-red-500/20 text-red-700">None</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Diversity Analytics</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-red-500/20 text-red-700">None</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* UI Components Reference */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">UI Component Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm font-mono bg-muted/50 p-4 rounded">
                <div>
                  <span className="text-muted-foreground">// Primary Analytics Page</span>
                  <br />
                  <span className="text-blue-600">SuccessionAnalyticsPage.tsx</span>
                  <span className="text-muted-foreground"> → Tabs: charts | ai-banded | ai-bi</span>
                </div>
                <div>
                  <span className="text-muted-foreground">// Charts Tab Components</span>
                  <br />
                  <span className="text-green-600">SuccessionAnalytics.tsx</span>
                  <span className="text-muted-foreground"> → 5 sub-tabs</span>
                  <br />
                  <span className="text-muted-foreground pl-4">├── Overview (coverage, Nine-Box, risk)</span>
                  <br />
                  <span className="text-muted-foreground pl-4">├── Mentorship (pairing status, completion)</span>
                  <br />
                  <span className="text-muted-foreground pl-4">├── Flight Risk (risk distribution, retention)</span>
                  <br />
                  <span className="text-muted-foreground pl-4">├── Career Development (IDP status, goals)</span>
                  <br />
                  <span className="text-muted-foreground pl-4">└── Bench Strength (position coverage)</span>
                </div>
                <div>
                  <span className="text-muted-foreground">// AI Report Builders</span>
                  <br />
                  <span className="text-purple-600">AIModuleReportBuilder</span>
                  <span className="text-muted-foreground"> moduleName="succession"</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Alignment */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Industry Alignment</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Industry Standard:</strong> Analytics Hub pattern with role-based data access</li>
                <li><strong>Industry Standard:</strong> Real-time succession metrics dashboard</li>
                <li><strong>Industry Standard:</strong> Talent Review integration with workforce analytics</li>
                <li><strong>Industry Standard:</strong> Predictive analytics and trend visualization</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
