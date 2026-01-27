import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle2, Info, Download, Calendar } from 'lucide-react';

export function ExecutiveSummaryReports() {
  return (
    <section id="sec-10-9" data-manual-anchor="sec-10-9" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            10.9 Executive Summary Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Executive Reports</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Configure standard executive report types and frequencies</li>
                <li>Understand board-level succession reporting requirements</li>
                <li>Set up emergency vacancy reporting protocols</li>
                <li>Export reports in multiple formats (PDF, Excel, PowerPoint)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Standard Report Types */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Standard Report Types (Oracle/Workday Pattern)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Primary Audience</TableHead>
                    <TableHead>Key Metrics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Succession Health Scorecard</TableCell>
                    <TableCell><Badge variant="outline">Monthly</Badge></TableCell>
                    <TableCell>HR Leadership</TableCell>
                    <TableCell className="text-muted-foreground">Coverage, readiness, risk distribution</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Quarterly Pipeline Review</TableCell>
                    <TableCell><Badge variant="outline">Quarterly</Badge></TableCell>
                    <TableCell>Executive Team</TableCell>
                    <TableCell className="text-muted-foreground">Pipeline health, movement, development progress</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Board-Level Summary</TableCell>
                    <TableCell><Badge variant="outline">Annual</Badge></TableCell>
                    <TableCell>Board of Directors</TableCell>
                    <TableCell className="text-muted-foreground">C-suite coverage, diversity, YoY progress</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Emergency Vacancy Report</TableCell>
                    <TableCell><Badge className="bg-red-500/20 text-red-700">On-demand</Badge></TableCell>
                    <TableCell>Crisis Response Team</TableCell>
                    <TableCell className="text-muted-foreground">Ready-now options, interim arrangements</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Talent Review Deck</TableCell>
                    <TableCell><Badge variant="outline">Semi-annual</Badge></TableCell>
                    <TableCell>Leadership Team</TableCell>
                    <TableCell className="text-muted-foreground">Nine-Box distribution, top talent profiles</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Board-Level Metrics */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Board-Level Metrics (Annual Report)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Coverage & Readiness</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• CEO succession coverage status</li>
                    <li>• C-suite succession coverage ratio</li>
                    <li>• Ready-now rate for critical positions</li>
                    <li>• Average successors per C-level role</li>
                    <li>• Emergency succession protocols</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Risk & Progress</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Flight risk for key successors</li>
                    <li>• Pipeline diversity vs. targets</li>
                    <li>• Year-over-year improvement</li>
                    <li>• External hire dependency</li>
                    <li>• Development investment ROI</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Formats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Format</TableHead>
                    <TableHead>Best For</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Library</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-red-500/20 text-red-700">PDF</Badge>
                    </TableCell>
                    <TableCell>Board presentations, archival</TableCell>
                    <TableCell>Executive summary, charts, branding</TableCell>
                    <TableCell className="font-mono text-sm">jspdf + html2canvas</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-green-500/20 text-green-700">Excel</Badge>
                    </TableCell>
                    <TableCell>Data analysis, drill-downs</TableCell>
                    <TableCell>Pivot-ready data, multiple sheets</TableCell>
                    <TableCell className="font-mono text-sm">file-saver + xlsx</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-orange-500/20 text-orange-700">PowerPoint</Badge>
                    </TableCell>
                    <TableCell>Executive presentations</TableCell>
                    <TableCell>Slide deck with charts, speaker notes</TableCell>
                    <TableCell className="font-mono text-sm">pptxgenjs</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-blue-500/20 text-blue-700">Word</Badge>
                    </TableCell>
                    <TableCell>Narrative reports, memos</TableCell>
                    <TableCell>Structured document with sections</TableCell>
                    <TableCell className="font-mono text-sm">docx</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Emergency Vacancy Protocol */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Emergency Vacancy Report Protocol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  When a critical position vacancy occurs unexpectedly (resignation, termination, death, incapacity), 
                  the emergency vacancy report provides immediate decision support.
                </p>
                <div className="bg-muted/50 p-4 rounded">
                  <h5 className="font-medium mb-2">Report Contents:</h5>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Affected position and current incumbent details</li>
                    <li>Ready-now successor list with contact information</li>
                    <li>Interim arrangement options (acting assignments)</li>
                    <li>External candidate pipeline (if available)</li>
                    <li>Business continuity risks and mitigations</li>
                    <li>Communication template for announcement</li>
                  </ol>
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
                <li><strong>Oracle HCM:</strong> Quarterly pipeline review cadence</li>
                <li><strong>Workday:</strong> Board-level succession dashboards</li>
                <li><strong>SEC/NYSE:</strong> CEO succession disclosure requirements</li>
                <li><strong>ISS/Glass Lewis:</strong> Proxy advisory board succession expectations</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
