import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calendar, 
  ArrowRight, 
  CheckCircle,
  Info,
  Lightbulb,
  Globe,
  Building2
} from 'lucide-react';

export function SuccessionCalendar() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">1.5 Module Dependencies & Calendar</h3>
        <p className="text-muted-foreground mt-1">
          Prerequisites, integration data flows, and succession planning calendar
        </p>
      </div>

      {/* Data Flow Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-indigo-600" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SUCCESSION PLANNING DATA FLOW                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   UPSTREAM SOURCES                    CORE PROCESSING                           │
│   ────────────────                    ───────────────                           │
│                                                                                 │
│   ┌─────────────────┐                 ┌─────────────────┐                      │
│   │   Performance   │─────────────────│                 │                      │
│   │   Appraisals    │ Overall Rating  │                 │                      │
│   └─────────────────┘                 │   NINE-BOX      │                      │
│                                       │   CALCULATION   │                      │
│   ┌─────────────────┐                 │   ENGINE        │                      │
│   │   Goal Cycles   │─────────────────│                 │                      │
│   │                 │ Achievement %   │                 │                      │
│   └─────────────────┘                 └────────┬────────┘                      │
│                                                │                                │
│   ┌─────────────────┐                          │                                │
│   │  360 Feedback   │─────────────────         │                                │
│   │   Cycles        │ Category Scores ─────────┤                                │
│   └─────────────────┘                          │                                │
│                                                ▼                                │
│   ┌─────────────────┐                 ┌─────────────────┐                      │
│   │    Workforce    │─────────────────│   READINESS     │                      │
│   │   Positions     │ Position Data   │   ASSESSMENT    │                      │
│   └─────────────────┘                 │   FRAMEWORK     │                      │
│                                       └────────┬────────┘                      │
│   ┌─────────────────┐                          │                                │
│   │  Competencies   │──────────────────────────┤                                │
│   │   Framework     │ Skill Gaps               │                                │
│   └─────────────────┘                          │                                │
│                                                ▼                                │
│                                       ┌─────────────────┐                      │
│   DOWNSTREAM TARGETS                  │   SUCCESSION    │                      │
│   ──────────────────                  │   INSIGHTS      │                      │
│                                       └────────┬────────┘                      │
│   ┌─────────────────┐                          │                                │
│   │    Learning     │◄─────────────────────────┤                                │
│   │      & IDP      │ Development Gaps         │                                │
│   └─────────────────┘                          │                                │
│                                                │                                │
│   ┌─────────────────┐                          │                                │
│   │  Compensation   │◄─────────────────────────┤                                │
│   │                 │ Retention Priority       │                                │
│   └─────────────────┘                          │                                │
│                                                │                                │
│   ┌─────────────────┐                          │                                │
│   │   Workforce     │◄─────────────────────────┘                                │
│   │   Planning      │ Talent Forecasts                                          │
│   └─────────────────┘                                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Prerequisites Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Module</th>
                  <th className="text-left p-3 font-semibold">Required Configuration</th>
                  <th className="text-left p-3 font-semibold">Why Needed</th>
                  <th className="text-center p-3 font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/30">
                      Workforce
                    </Badge>
                  </td>
                  <td className="p-3">Job architecture, positions, org structure</td>
                  <td className="p-3">Position identification for succession plans; reporting hierarchy</td>
                  <td className="p-3 text-center">
                    <Badge className="bg-red-600">Required</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">
                      Competencies
                    </Badge>
                  </td>
                  <td className="p-3">Competency framework, skill definitions</td>
                  <td className="p-3">Gap analysis in readiness assessments; development planning</td>
                  <td className="p-3 text-center">
                    <Badge className="bg-amber-600">Recommended</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                      Performance
                    </Badge>
                  </td>
                  <td className="p-3">Appraisal cycles with overall ratings</td>
                  <td className="p-3">Nine-Box performance axis input; historical data</td>
                  <td className="p-3 text-center">
                    <Badge className="bg-amber-600">Recommended</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                      Goals
                    </Badge>
                  </td>
                  <td className="p-3">Goal cycles with achievement tracking</td>
                  <td className="p-3">Alternative/supplemental performance data for Nine-Box</td>
                  <td className="p-3 text-center">
                    <Badge variant="secondary">Optional</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
                      360 Feedback
                    </Badge>
                  </td>
                  <td className="p-3">Completed 360 cycles with released results</td>
                  <td className="p-3">Multi-rater signals for potential axis and development themes</td>
                  <td className="p-3 text-center">
                    <Badge variant="secondary">Optional</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Alert className="mt-4 border-amber-500/30 bg-amber-500/5">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700">Implementation Tip</AlertTitle>
            <AlertDescription className="text-amber-600/80">
              Succession Planning can be implemented with only Workforce data using manual Nine-Box 
              ratings. However, automated calculations require at least one rating source (Performance 
              or Goals) to be active.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Integration Data Flow Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-600" />
            Integration Data Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Source Module</th>
                  <th className="text-left p-3 font-semibold">Data Element</th>
                  <th className="text-left p-3 font-semibold">Succession Usage</th>
                  <th className="text-left p-3 font-semibold">Timing</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3"><Badge variant="outline">Performance</Badge></td>
                  <td className="p-3">Appraisal overall rating</td>
                  <td className="p-3">Performance axis in Nine-Box calculation</td>
                  <td className="p-3">After cycle close</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3"><Badge variant="outline">Performance</Badge></td>
                  <td className="p-3">Historical ratings (3 years)</td>
                  <td className="p-3">Performance trend analysis</td>
                  <td className="p-3">On demand</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3"><Badge variant="outline">Goals</Badge></td>
                  <td className="p-3">Goal achievement percentage</td>
                  <td className="p-3">Performance axis modifier/alternative</td>
                  <td className="p-3">Real-time</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3"><Badge variant="outline">360 Feedback</Badge></td>
                  <td className="p-3">Category scores</td>
                  <td className="p-3">Potential axis input (leadership behaviors)</td>
                  <td className="p-3">After release</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3"><Badge variant="outline">360 Feedback</Badge></td>
                  <td className="p-3">Development themes</td>
                  <td className="p-3">Readiness gap identification</td>
                  <td className="p-3">After release</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3"><Badge variant="outline">Workforce</Badge></td>
                  <td className="p-3">Position changes</td>
                  <td className="p-3">Succession plan updates, vacancy triggers</td>
                  <td className="p-3">Real-time</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3"><Badge variant="outline">Workforce</Badge></td>
                  <td className="p-3">Reporting hierarchy</td>
                  <td className="p-3">Manager access to team succession data</td>
                  <td className="p-3">Real-time</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3"><Badge variant="outline">Competencies</Badge></td>
                  <td className="p-3">Skill gap analysis</td>
                  <td className="p-3">Readiness assessment input</td>
                  <td className="p-3">On assessment</td>
                </tr>
                <tr>
                  <td className="p-3"><Badge variant="outline">Learning</Badge></td>
                  <td className="p-3">Course completions</td>
                  <td className="p-3">Development plan progress tracking</td>
                  <td className="p-3">Real-time</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Succession Planning Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Succession Planning Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A typical annual succession planning cycle aligned with fiscal year (January start). 
            Adjust timing based on your organization's appraisal cycle and regional considerations.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Quarter</th>
                  <th className="text-left p-3 font-semibold">Activity</th>
                  <th className="text-left p-3 font-semibold">Stakeholders</th>
                  <th className="text-left p-3 font-semibold">System Path</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-blue-500/5">
                  <td className="p-3 font-semibold text-blue-700" rowSpan={3}>Q1</td>
                  <td className="p-3">Review and update key position designations</td>
                  <td className="p-3">HR, Executives</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Key Positions → Review</code></td>
                </tr>
                <tr className="border-b bg-blue-500/5">
                  <td className="p-3">Assess key position risks and criticality</td>
                  <td className="p-3">HR, Executives</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Key Positions → Risk Assessment</code></td>
                </tr>
                <tr className="border-b bg-blue-500/5">
                  <td className="p-3">Import prior year appraisal data for Nine-Box</td>
                  <td className="p-3">HR Admin</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Nine-Box → Calculate</code></td>
                </tr>

                <tr className="border-b bg-green-500/5">
                  <td className="p-3 font-semibold text-green-700" rowSpan={3}>Q2</td>
                  <td className="p-3">Conduct Nine-Box calibration sessions</td>
                  <td className="p-3">HR, Managers</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Nine-Box → Calibration</code></td>
                </tr>
                <tr className="border-b bg-green-500/5">
                  <td className="p-3">Update talent pool memberships</td>
                  <td className="p-3">HR, Executives</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Talent Pools → Review</code></td>
                </tr>
                <tr className="border-b bg-green-500/5">
                  <td className="p-3">Generate review packets for executive sessions</td>
                  <td className="p-3">HR Admin</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Talent Pools → Generate Packet</code></td>
                </tr>

                <tr className="border-b bg-amber-500/5">
                  <td className="p-3 font-semibold text-amber-700" rowSpan={3}>Q3</td>
                  <td className="p-3">Update succession plans with new candidates</td>
                  <td className="p-3">HR, Managers</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Plans → Update Candidates</code></td>
                </tr>
                <tr className="border-b bg-amber-500/5">
                  <td className="p-3">Initiate readiness assessments for nominees</td>
                  <td className="p-3">HR, Assessors</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Plans → Assess Readiness</code></td>
                </tr>
                <tr className="border-b bg-amber-500/5">
                  <td className="p-3">Link development plans to identified gaps</td>
                  <td className="p-3">HR, Managers</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Plans → Development</code></td>
                </tr>

                <tr className="border-b bg-purple-500/5">
                  <td className="p-3 font-semibold text-purple-700" rowSpan={2}>Q4</td>
                  <td className="p-3">Year-end succession review and reporting</td>
                  <td className="p-3">HR, Executives</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Analytics → Annual Report</code></td>
                </tr>
                <tr className="border-b bg-purple-500/5">
                  <td className="p-3">Archive completed plans, prepare for new cycle</td>
                  <td className="p-3">HR Admin</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Plans → Archive</code></td>
                </tr>

                <tr className="bg-muted/30">
                  <td className="p-3 font-semibold">Ongoing</td>
                  <td className="p-3">Monitor flight risk indicators</td>
                  <td className="p-3">HR, Managers</td>
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">Flight Risk → Dashboard</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Regional Considerations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-teal-600" />
            Regional Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Caribbean</h4>
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li>• Fiscal year often April-March; align succession cycle accordingly</li>
                <li>• Consider hurricane season (June-November) for calibration timing</li>
                <li>• Multi-island operations may require staggered calibration sessions</li>
                <li>• Smaller talent pools may require cross-island succession planning</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-sm">Africa</h4>
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li>• Consider election cycles for key position reviews (political risk)</li>
                <li>• Rainy seasons may affect in-person calibration scheduling</li>
                <li>• Cross-border talent mobility for regional positions</li>
                <li>• Skills scarcity may require external pipeline development</li>
              </ul>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-sm">Global Operations</h4>
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li>• Time zone considerations for virtual calibration sessions</li>
                <li>• Local labor law requirements for internal promotions</li>
                <li>• Currency conversion for compensation benchmarking</li>
                <li>• Cultural differences in performance feedback norms</li>
              </ul>
            </div>
          </div>

          <Alert className="mt-4 border-blue-500/30 bg-blue-500/5">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Multi-Region Implementation</AlertTitle>
            <AlertDescription className="text-blue-600/80">
              For organizations operating across multiple regions, consider creating region-specific 
              readiness forms and Nine-Box labels while maintaining a unified global talent pool 
              for leadership positions. Company-level configuration allows each entity to customize 
              while rolling up to consolidated reporting.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
