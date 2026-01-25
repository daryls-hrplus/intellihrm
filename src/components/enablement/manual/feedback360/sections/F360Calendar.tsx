import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Callout, TipCallout, WarningCallout, InfoCallout } from '@/components/enablement/manual/components/Callout';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle,
  Settings,
  Globe,
  CalendarDays,
  CalendarRange,
  Workflow,
  Users,
  Mail,
  BarChart3
} from 'lucide-react';

export function F360Calendar() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        1.5 360 Feedback Cycle Calendar
      </h3>
      
      <p className="text-muted-foreground">
        Effective 360 feedback requires careful timing coordination with other HR processes. 
        This section provides quarterly planning guidance, activity dependencies, and regional considerations.
      </p>

      {/* Annual Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarRange className="h-5 w-5" />
            Recommended Annual Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Q1 */}
            <div className="p-4 rounded-lg border bg-blue-500/5">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">Q1</Badge>
                <span className="text-xs text-muted-foreground">Jan - Mar</span>
              </div>
              <h4 className="font-semibold text-sm mb-2">Planning & Setup</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Review prior year results</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Update question bank</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Configure rater categories</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Define report templates</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>Train managers on coaching</span>
                </li>
              </ul>
            </div>

            {/* Q2 */}
            <div className="p-4 rounded-lg border bg-emerald-500/5">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">Q2</Badge>
                <span className="text-xs text-muted-foreground">Apr - Jun</span>
              </div>
              <h4 className="font-semibold text-sm mb-2">Mid-Year Pulse (Optional)</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-600 flex-shrink-0" />
                  <span>Abbreviated 360 for leadership</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-600 flex-shrink-0" />
                  <span>Focus on 3-5 key competencies</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-600 flex-shrink-0" />
                  <span>Rapid feedback (2-week window)</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-emerald-600 flex-shrink-0" />
                  <span>Course-correct before annual</span>
                </li>
              </ul>
            </div>

            {/* Q3 */}
            <div className="p-4 rounded-lg border bg-amber-500/5">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">Q3</Badge>
                <span className="text-xs text-muted-foreground">Jul - Sep</span>
              </div>
              <h4 className="font-semibold text-sm mb-2">Annual 360 Preparation</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>Finalize participant list</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>Validate org hierarchy</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>Create 360 cycle (Sep)</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-amber-600 flex-shrink-0" />
                  <span>Launch nominations (late Sep)</span>
                </li>
              </ul>
            </div>

            {/* Q4 */}
            <div className="p-4 rounded-lg border bg-violet-500/5">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-violet-500/10 text-violet-700 border-violet-500/30">Q4</Badge>
                <span className="text-xs text-muted-foreground">Oct - Dec</span>
              </div>
              <h4 className="font-semibold text-sm mb-2">Execution & Results</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-violet-600 flex-shrink-0" />
                  <span>Feedback collection (Oct)</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-violet-600 flex-shrink-0" />
                  <span>AI processing & calibration</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-violet-600 flex-shrink-0" />
                  <span>Release results (Nov)</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-violet-600 flex-shrink-0" />
                  <span>Feed into appraisals (Dec)</span>
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-violet-600 flex-shrink-0" />
                  <span>IDP updates from themes</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Activity Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Monthly Activity Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-2">Activity</th>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                    <th key={m} className="text-center py-2 px-1 w-10">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { activity: 'Question Bank Review', months: [1, 2] },
                  { activity: 'Rater Category Config', months: [2, 3] },
                  { activity: 'Report Template Design', months: [3] },
                  { activity: 'Mid-Year Pulse (Optional)', months: [5, 6] },
                  { activity: 'Participant Enrollment', months: [8, 9] },
                  { activity: 'Peer Nominations', months: [9] },
                  { activity: 'Feedback Collection', months: [10] },
                  { activity: 'AI Processing', months: [10, 11] },
                  { activity: 'Results Release', months: [11] },
                  { activity: 'Appraisal Integration', months: [11, 12] },
                  { activity: 'IDP Updates', months: [12] },
                ].map((row) => (
                  <tr key={row.activity} className="hover:bg-muted/30">
                    <td className="py-2 px-2 font-medium">{row.activity}</td>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <td key={m} className="text-center py-2 px-1">
                        {row.months.includes(m) ? (
                          <div className="w-4 h-4 mx-auto rounded-full bg-primary/60"></div>
                        ) : (
                          <span className="text-muted-foreground/30">·</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Activity Dependencies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Activity Dependencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 border font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Question Bank  │────►│  Rater Category │────►│  Report Template│
│  Configuration  │     │  Setup          │     │  Design         │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
         ┌───────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Create Cycle   │────►│  Enroll         │────►│  Launch         │
│  (Draft)        │     │  Participants   │     │  Nominations    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
         ┌───────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Manager        │────►│  Send Feedback  │────►│  Collection     │
│  Approval       │     │  Requests       │     │  Period         │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
         ┌───────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  AI Signal      │────►│  HR Review /    │────►│  Release        │
│  Processing     │     │  Calibration    │     │  Results        │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │  Appraisal      │
                                               │  Integration    │
                                               └─────────────────┘
            `}</pre>
          </div>

          <WarningCallout title="Critical Path">
            The nomination → approval → request sequence is the critical path. Allow at least 
            2 weeks between nominations opening and feedback requests being sent.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Regional Variations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Timing Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3">Region</th>
                  <th className="text-left py-2 px-3">Avoid Periods</th>
                  <th className="text-left py-2 px-3">Recommended Window</th>
                  <th className="text-left py-2 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-medium">Caribbean</td>
                  <td className="py-2 px-3 text-muted-foreground">Aug - Oct (Hurricane season)</td>
                  <td className="py-2 px-3 text-muted-foreground">Sep - Nov</td>
                  <td className="py-2 px-3 text-muted-foreground">Plan for potential office closures</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">West Africa</td>
                  <td className="py-2 px-3 text-muted-foreground">Ramadan period (variable)</td>
                  <td className="py-2 px-3 text-muted-foreground">Post-Ramadan + 2 weeks</td>
                  <td className="py-2 px-3 text-muted-foreground">Respect fasting schedule impact</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">East Africa</td>
                  <td className="py-2 px-3 text-muted-foreground">Jun - Jul (Fiscal year end)</td>
                  <td className="py-2 px-3 text-muted-foreground">Aug - Oct</td>
                  <td className="py-2 px-3 text-muted-foreground">Jul-Jun fiscal year common</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Global / Multi-region</td>
                  <td className="py-2 px-3 text-muted-foreground">Dec 15 - Jan 5 (Holiday)</td>
                  <td className="py-2 px-3 text-muted-foreground">Oct - mid Nov</td>
                  <td className="py-2 px-3 text-muted-foreground">Complete before holiday blackout</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Timing Configuration Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3">Setting</th>
                  <th className="text-center py-2 px-3">Configurable</th>
                  <th className="text-center py-2 px-3">Default</th>
                  <th className="text-center py-2 px-3">Range</th>
                  <th className="text-left py-2 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-medium">Nomination Window</td>
                  <td className="py-2 px-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-2 px-3 text-center">14 days</td>
                  <td className="py-2 px-3 text-center">7-30 days</td>
                  <td className="py-2 px-3 text-muted-foreground">Time for peer nomination</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Response Window</td>
                  <td className="py-2 px-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-2 px-3 text-center">21 days</td>
                  <td className="py-2 px-3 text-center">14-45 days</td>
                  <td className="py-2 px-3 text-muted-foreground">Time for feedback collection</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Anonymity Threshold</td>
                  <td className="py-2 px-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-2 px-3 text-center">3 raters</td>
                  <td className="py-2 px-3 text-center">2-5 raters</td>
                  <td className="py-2 px-3 text-muted-foreground">Min per category for anonymity</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Reminder Schedule</td>
                  <td className="py-2 px-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-2 px-3 text-center">7, 3, 1 days</td>
                  <td className="py-2 px-3 text-center">Array of days</td>
                  <td className="py-2 px-3 text-muted-foreground">Days before deadline</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Min Peers</td>
                  <td className="py-2 px-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-2 px-3 text-center">3</td>
                  <td className="py-2 px-3 text-center">2-10</td>
                  <td className="py-2 px-3 text-muted-foreground">Minimum peer nominations required</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Max Peers</td>
                  <td className="py-2 px-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-2 px-3 text-center">8</td>
                  <td className="py-2 px-3 text-center">5-15</td>
                  <td className="py-2 px-3 text-muted-foreground">Maximum peer nominations allowed</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Acknowledgement Window</td>
                  <td className="py-2 px-3 text-center"><CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-2 px-3 text-center">7 days</td>
                  <td className="py-2 px-3 text-center">3-14 days</td>
                  <td className="py-2 px-3 text-muted-foreground">Time to acknowledge results</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Timing Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TipCallout title="Appraisal Alignment">
            Schedule 360 cycles to complete <strong>4-6 weeks before</strong> appraisal deadline. 
            This allows time for results review, calibration, and manager coaching conversations.
          </TipCallout>

          <TipCallout title="Collection Window">
            Allow <strong>3-4 weeks</strong> for feedback collection. Shorter windows increase response 
            quality but may reduce participation rates.
          </TipCallout>

          <TipCallout title="HR Review Buffer">
            Reserve at least <strong>1 week</strong> for HR review and optional calibration before 
            releasing results to participants.
          </TipCallout>

          <InfoCallout title="Reminder Strategy">
            Configure reminders at <strong>7, 3, and 1 days</strong> before deadline. The day-before 
            reminder typically drives 30%+ of remaining responses.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Integration with Other Cycles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Coordination with Other HR Cycles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Appraisal Cycle</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 360 results feed into CRGV "Values" component</li>
                <li>• Complete 360 before appraisal opens</li>
                <li>• Allow time for manager coaching</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Goal Setting Cycle</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Development themes inform goal creation</li>
                <li>• Align 360 completion with goal refresh</li>
                <li>• Use signals for stretch assignment planning</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Succession Planning</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 360 signals feed Nine-Box assessments</li>
                <li>• Complete before talent review meetings</li>
                <li>• Leadership potential scores inform pools</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Compensation Review</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 360 informs performance ratings</li>
                <li>• Ratings drive merit increase eligibility</li>
                <li>• Complete before compensation planning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Footer */}
      <div className="flex items-center justify-end text-sm text-muted-foreground border-t pt-4">
        <Badge variant="outline">Section 1.5 of 1.5</Badge>
      </div>
    </div>
  );
}
