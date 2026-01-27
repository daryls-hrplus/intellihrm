import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, CheckCircle2, Info, Clock, BarChart3 } from 'lucide-react';

export function ReadinessTrendAnalysis() {
  return (
    <section id="sec-10-7" data-manual-anchor="sec-10-7" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            10.7 Readiness Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Readiness Trends</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Track readiness score progression over assessment cycles</li>
                <li>Understand Time-to-Readiness benchmarks by band</li>
                <li>Correlate development activities with readiness improvement</li>
                <li>Use AI trajectory forecasting for succession planning</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Time-to-Readiness */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time-to-Readiness Benchmarks (Visier/Workday)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Readiness Band</TableHead>
                    <TableHead>Expected Timeline</TableHead>
                    <TableHead>Development Focus</TableHead>
                    <TableHead>Monitoring Frequency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell><Badge className="bg-green-500/20 text-green-700">Ready Now</Badge></TableCell>
                    <TableCell>Immediate</TableCell>
                    <TableCell>Retain, executive exposure, stretch projects</TableCell>
                    <TableCell>Monthly check-in</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge className="bg-blue-500/20 text-blue-700">Ready 1-2 Years</Badge></TableCell>
                    <TableCell>12-24 months</TableCell>
                    <TableCell>Targeted skill gaps, leadership programs</TableCell>
                    <TableCell>Quarterly assessment</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge className="bg-amber-500/20 text-amber-700">Ready 3+ Years</Badge></TableCell>
                    <TableCell>24-36 months</TableCell>
                    <TableCell>Foundational development, rotations</TableCell>
                    <TableCell>Semi-annual assessment</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Badge className="bg-gray-500/20 text-gray-700">Developing</Badge></TableCell>
                    <TableCell>36+ months</TableCell>
                    <TableCell>Long-term pipeline building</TableCell>
                    <TableCell>Annual review</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Trend Analysis Metrics */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Trend Analysis Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Healthy Trend</TableHead>
                    <TableHead>Data Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Score Progression Rate</TableCell>
                    <TableCell className="font-mono text-sm">(current_score - previous_score) / months</TableCell>
                    <TableCell><Badge variant="outline">≥2 pts/quarter</Badge></TableCell>
                    <TableCell className="text-muted-foreground">readiness_assessment_responses</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Band Movement Rate</TableCell>
                    <TableCell className="font-mono text-sm">band_promotions / assessments_completed × 100</TableCell>
                    <TableCell><Badge variant="outline">15-25%</Badge></TableCell>
                    <TableCell className="text-muted-foreground">succession_candidates history</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Development Impact Score</TableCell>
                    <TableCell className="font-mono text-sm">Δscore (with activities) / Δscore (without)</TableCell>
                    <TableCell><Badge variant="outline">&gt;1.5x</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Correlated analysis</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Stagnation Alert</TableCell>
                    <TableCell className="font-mono text-sm">score_change &lt; 5 over 2 cycles</TableCell>
                    <TableCell><Badge variant="outline">Flag for review</Badge></TableCell>
                    <TableCell className="text-muted-foreground">Automated trigger</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Development Activity Correlation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Development Activity Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Expected Impact</TableHead>
                    <TableHead>Measurement Period</TableHead>
                    <TableHead>Data Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Training Completion</TableCell>
                    <TableCell>+3-5 points per relevant course</TableCell>
                    <TableCell>3-6 months post-completion</TableCell>
                    <TableCell className="text-muted-foreground">idp_activities.status = 'completed'</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Stretch Assignment</TableCell>
                    <TableCell>+5-10 points for successful completion</TableCell>
                    <TableCell>6-12 months</TableCell>
                    <TableCell className="text-muted-foreground">succession_development_plans</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Executive Mentorship</TableCell>
                    <TableCell>+8-15 points over program duration</TableCell>
                    <TableCell>12-18 months</TableCell>
                    <TableCell className="text-muted-foreground">mentorship_pairings</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Coaching Engagement</TableCell>
                    <TableCell>+3-8 points per engagement</TableCell>
                    <TableCell>6 months</TableCell>
                    <TableCell className="text-muted-foreground">coaching_sessions</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* AI Trajectory Forecasting */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI Trajectory Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Prediction Inputs</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Historical readiness score trajectory</li>
                    <li>• Development activity completion rate</li>
                    <li>• Performance rating trends</li>
                    <li>• 360 feedback signals</li>
                    <li>• Competency assessment progress</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Prediction Outputs</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Estimated time-to-ready date</li>
                    <li>• Confidence score (0-100%)</li>
                    <li>• Risk factors for delay</li>
                    <li>• Recommended interventions</li>
                    <li>• Comparison to peer cohort</li>
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
                <li><strong>Visier:</strong> Time-to-Readiness as key succession velocity metric</li>
                <li><strong>Workday:</strong> Development impact correlation analysis</li>
                <li><strong>SAP SuccessFactors:</strong> Readiness trajectory with AI prediction</li>
                <li><strong>Oracle HCM:</strong> Talent review integration for trend analysis</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* UI Component Reference */}
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <BarChart3 className="h-4 w-4" />
                UI Component Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Features</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-sm">ReadinessTrendChart.tsx</TableCell>
                    <TableCell className="text-muted-foreground">Succession → Analytics → Readiness Trends tab</TableCell>
                    <TableCell className="text-sm">
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Historical score progression (area chart)</li>
                        <li>Band threshold reference lines (85, 70)</li>
                        <li>Color-coded readiness band zones</li>
                        <li>Individual candidate or aggregate company view</li>
                        <li>Score change badge with trend indicator</li>
                      </ul>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-sm">useReadinessTrendHistory.ts</TableCell>
                    <TableCell className="text-muted-foreground">src/hooks/succession/</TableCell>
                    <TableCell className="text-sm">
                      Hook for fetching historical readiness_assessment_events by candidate or company
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  );
}
