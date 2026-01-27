import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, CheckCircle2, Info, Brain, MessageSquare } from 'lucide-react';

export function AIPoweredInsights() {
  return (
    <section id="sec-10-10" data-manual-anchor="sec-10-10" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            10.10 AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">AI Insights</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use the AI Report Builder for succession analytics</li>
                <li>Understand predictive analytics capabilities</li>
                <li>Execute natural language queries on succession data</li>
                <li>Interpret AI-generated recommendations</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* AI Report Builder */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Report Builder Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The <code className="bg-muted px-1 rounded">AIModuleReportBuilder</code> component provides 
                two AI-powered report generation modes for succession analytics.
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Tab</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Use Case</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-purple-500/20 text-purple-700">Banded Reports</Badge>
                    </TableCell>
                    <TableCell><code className="text-sm">ai-banded</code></TableCell>
                    <TableCell>Qualitative analysis with narrative insights</TableCell>
                    <TableCell>Executive summaries, trend explanations</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <Badge className="bg-blue-500/20 text-blue-700">BI Reports</Badge>
                    </TableCell>
                    <TableCell><code className="text-sm">ai-bi</code></TableCell>
                    <TableCell>Quantitative dashboards with data visualizations</TableCell>
                    <TableCell>Data exploration, metric deep-dives</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 bg-muted p-4 rounded font-mono text-sm">
                <span className="text-muted-foreground">// SuccessionAnalyticsPage.tsx integration</span>
                <br />
                <span className="text-purple-600">&lt;AIModuleReportBuilder</span>
                <br />
                <span className="pl-4">moduleName=<span className="text-green-600">"succession"</span></span>
                <br />
                <span className="pl-4">reportType=<span className="text-green-600">"banded"</span> <span className="text-muted-foreground">| "bi"</span></span>
                <br />
                <span className="pl-4">companyId=<span className="text-blue-600">{'{selectedCompanyId}'}</span></span>
                <br />
                <span className="text-purple-600">/&gt;</span>
              </div>
            </CardContent>
          </Card>

          {/* Predictive Analytics */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Predictive Analytics Capabilities (Visier Pattern)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prediction Type</TableHead>
                    <TableHead>Input Signals</TableHead>
                    <TableHead>Output</TableHead>
                    <TableHead>Confidence Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Succession Risk Prediction</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Flight risk, coverage, readiness</TableCell>
                    <TableCell>Risk score (0-100) with contributing factors</TableCell>
                    <TableCell><Badge variant="outline">High (85%+)</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Readiness Trajectory</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Historical scores, development activities</TableCell>
                    <TableCell>Estimated time-to-ready date</TableCell>
                    <TableCell><Badge variant="outline">Medium (70-85%)</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hidden High-Potential</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Performance, 360, competency signals</TableCell>
                    <TableCell>Candidates potentially overlooked</TableCell>
                    <TableCell><Badge variant="outline">Medium (70-85%)</Badge></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Successor Attrition Risk</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Engagement, tenure, compensation</TableCell>
                    <TableCell>Probability of departure within 12 months</TableCell>
                    <TableCell><Badge variant="outline">High (85%+)</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Natural Language Queries */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Natural Language Query Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-background rounded border">
                  <p className="text-sm font-medium">"Which critical positions have no ready-now successors?"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Returns list of key positions where coverage score &lt; 40 or ready_now = 0
                  </p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <p className="text-sm font-medium">"What is our succession coverage trend over the last 3 years?"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Generates time-series chart with coverage ratio by quarter
                  </p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <p className="text-sm font-medium">"Show me successors with high flight risk"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cross-references succession_candidates with flight_risk_assessments
                  </p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <p className="text-sm font-medium">"Compare our Nine-Box distribution to industry benchmarks"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shows distribution vs. SAP/Workday benchmarks with variance analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Governance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI Governance & Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Explainability</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Confidence scores on all predictions</li>
                    <li>• Contributing factors breakdown</li>
                    <li>• Data freshness indicators</li>
                    <li>• Model version tracking</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Human Oversight</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• AI suggestions require human approval</li>
                    <li>• Override capability with reason capture</li>
                    <li>• Bias detection alerts</li>
                    <li>• Audit trail for all AI outputs</li>
                  </ul>
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
                <li><strong>Visier:</strong> Predictive analytics and natural language queries</li>
                <li><strong>Workday:</strong> AI-powered succession recommendations</li>
                <li><strong>SAP SuccessFactors:</strong> Talent Intelligence with machine learning</li>
                <li><strong>ISO 42001:</strong> AI management system compliance</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}
