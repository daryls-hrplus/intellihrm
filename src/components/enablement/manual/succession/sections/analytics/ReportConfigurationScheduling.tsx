import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, CheckCircle2, Info, Clock, Shield } from 'lucide-react';

export function ReportConfigurationScheduling() {
  return (
    <section id="sec-10-11" data-manual-anchor="sec-10-11" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            10.11 Report Configuration & Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Configuration</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Configure custom report templates for succession analytics</li>
                <li>Set up automated report delivery schedules</li>
                <li>Manage access control for sensitive reports</li>
                <li>Maintain report versioning and audit trails</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Schedule Configuration */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Automated Delivery Schedules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Typical Reports</TableHead>
                    <TableHead>Delivery Time</TableHead>
                    <TableHead>Recipient Groups</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Badge variant="outline">Daily</Badge></TableCell>
                    <TableCell>Flight risk alerts, urgent vacancy notifications</TableCell>
                    <TableCell>6:00 AM local</TableCell>
                    <TableCell className="text-muted-foreground">HR Partners, Direct Managers</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="outline">Weekly</Badge></TableCell>
                    <TableCell>Pipeline status summary, development updates</TableCell>
                    <TableCell>Monday 8:00 AM</TableCell>
                    <TableCell className="text-muted-foreground">HR Leadership</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="outline">Monthly</Badge></TableCell>
                    <TableCell>Succession health scorecard, coverage analysis</TableCell>
                    <TableCell>1st business day</TableCell>
                    <TableCell className="text-muted-foreground">Executive Team</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="outline">Quarterly</Badge></TableCell>
                    <TableCell>Pipeline review deck, Nine-Box distribution</TableCell>
                    <TableCell>Week before QBR</TableCell>
                    <TableCell className="text-muted-foreground">Leadership Team</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge variant="outline">Annual</Badge></TableCell>
                    <TableCell>Board-level summary, ESG/DEI report</TableCell>
                    <TableCell>30 days before board meeting</TableCell>
                    <TableCell className="text-muted-foreground">Board, CHRO</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Report Access Control Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Category</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>HR Partner</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Executive</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Coverage & Bench Strength</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Team</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Flight Risk (Individual)</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Team</Badge></TableCell>
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
                    <TableCell className="font-medium">Compensation Data</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Masked</Badge></TableCell>
                    <TableCell><Badge className="bg-red-500/20 text-red-700">None</Badge></TableCell>
                    <TableCell><Badge className="bg-yellow-500/20 text-yellow-700">Summary</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">DEI Analytics</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                    <TableCell><Badge className="bg-red-500/20 text-red-700">None</Badge></TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Full</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Custom Report Builder */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Custom Report Builder Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Data Selection</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Table/field picker with preview</li>
                    <li>• Filter builder (date range, status, etc.)</li>
                    <li>• Aggregation options (sum, avg, count)</li>
                    <li>• Cross-table joins</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Visualization Options</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Chart type selection (bar, line, pie)</li>
                    <li>• Color scheme customization</li>
                    <li>• Benchmark overlay toggle</li>
                    <li>• Data label configuration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Versioning & Audit */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Report Versioning & Audit</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audit Element</TableHead>
                    <TableHead>Captured Data</TableHead>
                    <TableHead>Retention Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Report Generation</TableCell>
                    <TableCell>User, timestamp, parameters, row count</TableCell>
                    <TableCell>7 years</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Report Download</TableCell>
                    <TableCell>User, timestamp, format, file hash</TableCell>
                    <TableCell>7 years</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Template Changes</TableCell>
                    <TableCell>User, before/after config, reason</TableCell>
                    <TableCell>Indefinite</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Access Attempts</TableCell>
                    <TableCell>User, report, granted/denied, IP address</TableCell>
                    <TableCell>2 years</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Industry Alignment */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Industry Alignment</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>SOC 2:</strong> Audit trail requirements for report access</li>
                <li><strong>GDPR:</strong> Data access logging for EU employees</li>
                <li><strong>Industry Standard:</strong> Role-based report visibility</li>
                <li><strong>Industry Standard:</strong> Scheduled report delivery patterns</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
