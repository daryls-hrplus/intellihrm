import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Users, UserCheck, Briefcase, Building2, ArrowRight, 
  CheckCircle, Target, AlertCircle, Clock3
} from 'lucide-react';

export function OverviewPersonas() {
  return (
    <Card id="sec-1-4">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.4</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>15 min read</span>
        </div>
        <CardTitle className="text-2xl">User Personas & Journeys</CardTitle>
        <CardDescription>
          Detailed profiles, workflows, and day-in-the-life scenarios for each user role
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Persona Cards */}
        <div className="space-y-6">
          {/* Employee Persona */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-3 flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-lg">Employee (ESS)</h4>
              <Badge variant="outline">Self-Service User</Badge>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-2">Profile</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>Access Level:</strong> Own data only</li>
                  <li><strong>Login Frequency:</strong> 2-4 times per cycle</li>
                  <li><strong>Technical Skill:</strong> Basic to intermediate</li>
                  <li><strong>Time in System:</strong> 30-60 minutes per cycle</li>
                </ul>
                <h5 className="font-medium mt-4 mb-2">Goals & Motivations</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Understand performance expectations clearly</li>
                  <li>• Receive fair and constructive feedback</li>
                  <li>• Document achievements for career growth</li>
                  <li>• Complete required tasks efficiently</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">User Journey</h5>
                <div className="space-y-2">
                  {[
                    { step: 1, action: 'Receive cycle notification', time: 'Day 1' },
                    { step: 2, action: 'Complete self-assessment', time: 'Week 1-2' },
                    { step: 3, action: 'Review manager evaluation', time: 'After manager submits' },
                    { step: 4, action: 'Attend review meeting', time: 'Scheduled' },
                    { step: 5, action: 'Acknowledge & respond', time: 'Within 5 days' },
                    { step: 6, action: 'View final rating', time: 'After cycle closes' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3 text-sm">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 text-xs font-medium">
                        {item.step}
                      </span>
                      <span className="flex-1">{item.action}</span>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Manager Persona */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-green-100 dark:bg-green-900/30 px-4 py-3 flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h4 className="font-semibold text-lg">Manager (MSS)</h4>
              <Badge variant="outline">Evaluator</Badge>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-2">Profile</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>Access Level:</strong> Direct reports + dotted lines</li>
                  <li><strong>Login Frequency:</strong> Weekly during evaluation period</li>
                  <li><strong>Technical Skill:</strong> Intermediate</li>
                  <li><strong>Time in System:</strong> 2-4 hours per cycle</li>
                </ul>
                <h5 className="font-medium mt-4 mb-2">Goals & Motivations</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Provide meaningful feedback that develops talent</li>
                  <li>• Complete evaluations accurately and on time</li>
                  <li>• Differentiate performance fairly within team</li>
                  <li>• Use ratings to inform compensation/promotion</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">User Journey</h5>
                <div className="space-y-2">
                  {[
                    { step: 1, action: 'Review team enrollment', time: 'Cycle start' },
                    { step: 2, action: 'Review self-assessments', time: 'After employee submits' },
                    { step: 3, action: 'Rate each component (CRGV)', time: 'Week 2-3' },
                    { step: 4, action: 'Use AI to draft feedback', time: 'Per employee' },
                    { step: 5, action: 'Submit evaluations', time: 'Before deadline' },
                    { step: 6, action: 'Participate in calibration', time: 'Scheduled session' },
                    { step: 7, action: 'Conduct review meetings', time: 'After calibration' },
                    { step: 8, action: 'Address acknowledgments', time: 'Final week' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3 text-sm">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-200 dark:bg-green-800 text-xs font-medium">
                        {item.step}
                      </span>
                      <span className="flex-1">{item.action}</span>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HR Partner Persona */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-purple-100 dark:bg-purple-900/30 px-4 py-3 flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-lg">HR Partner / HR Ops</h4>
              <Badge variant="outline">Administrator</Badge>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-2">Profile</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>Access Level:</strong> Assigned business units</li>
                  <li><strong>Login Frequency:</strong> Daily during cycle</li>
                  <li><strong>Technical Skill:</strong> Advanced</li>
                  <li><strong>Time in System:</strong> 10-20 hours per cycle</li>
                </ul>
                <h5 className="font-medium mt-4 mb-2">Goals & Motivations</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ensure high completion rates and data quality</li>
                  <li>• Facilitate fair calibration outcomes</li>
                  <li>• Generate insights for leadership</li>
                  <li>• Maintain compliance and audit readiness</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">User Journey</h5>
                <div className="space-y-2">
                  {[
                    { step: 1, action: 'Configure cycle settings', time: 'Pre-cycle' },
                    { step: 2, action: 'Enroll participants', time: 'Cycle start' },
                    { step: 3, action: 'Monitor progress dashboards', time: 'Ongoing' },
                    { step: 4, action: 'Send reminder notifications', time: 'As needed' },
                    { step: 5, action: 'Facilitate calibration sessions', time: 'Mid-cycle' },
                    { step: 6, action: 'Review AI bias alerts', time: 'During calibration' },
                    { step: 7, action: 'Process action triggers', time: 'Post-calibration' },
                    { step: 8, action: 'Generate reports', time: 'Cycle end' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3 text-sm">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 text-xs font-medium">
                        {item.step}
                      </span>
                      <span className="flex-1">{item.action}</span>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Executive Persona */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-3 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h4 className="font-semibold text-lg">Executive / Leadership</h4>
              <Badge variant="outline">Strategic Consumer</Badge>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-2">Profile</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>Access Level:</strong> Organization-wide (read)</li>
                  <li><strong>Login Frequency:</strong> Monthly or quarterly</li>
                  <li><strong>Technical Skill:</strong> Basic</li>
                  <li><strong>Time in System:</strong> 1-2 hours per quarter</li>
                </ul>
                <h5 className="font-medium mt-4 mb-2">Goals & Motivations</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Understand workforce performance trends</li>
                  <li>• Identify high-potential talent for succession</li>
                  <li>• Approve calibration outcomes</li>
                  <li>• Inform strategic workforce decisions</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Key Metrics</h5>
                <div className="space-y-2 text-sm">
                  {[
                    { metric: 'Performance Distribution', icon: Target },
                    { metric: 'Nine-Box Summary', icon: Users },
                    { metric: 'High Performer Retention', icon: CheckCircle },
                    { metric: 'Succession Pipeline Health', icon: ArrowRight },
                    { metric: 'Calibration Adjustments', icon: AlertCircle },
                    { metric: 'Cycle Completion Rate', icon: Clock3 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-amber-500" />
                      <span>{item.metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Role-Based Access Matrix */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Role-Based Access Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left font-medium">Capability</th>
                  <th className="border p-2 text-center font-medium">Employee</th>
                  <th className="border p-2 text-center font-medium">Manager</th>
                  <th className="border p-2 text-center font-medium">HR Partner</th>
                  <th className="border p-2 text-center font-medium">Executive</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { capability: 'View own scores', emp: '✓', mgr: '✓', hr: '✓', exec: '✓' },
                  { capability: 'Complete self-assessment', emp: '✓', mgr: '✓', hr: '—', exec: '—' },
                  { capability: 'Rate direct reports', emp: '—', mgr: '✓', hr: '—', exec: '—' },
                  { capability: 'Use AI feedback assistant', emp: '—', mgr: '✓', hr: '✓', exec: '—' },
                  { capability: 'View team scores', emp: '—', mgr: '✓', hr: '✓', exec: '✓' },
                  { capability: 'Configure cycles', emp: '—', mgr: '—', hr: '✓', exec: '—' },
                  { capability: 'Run calibration session', emp: '—', mgr: '—', hr: '✓', exec: '—' },
                  { capability: 'Approve calibration', emp: '—', mgr: '—', hr: '✓', exec: '✓' },
                  { capability: 'View organization analytics', emp: '—', mgr: '—', hr: '✓', exec: '✓' },
                  { capability: 'Configure integrations', emp: '—', mgr: '—', hr: '✓', exec: '—' }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-2">{row.capability}</td>
                    <td className="border p-2 text-center">{row.emp}</td>
                    <td className="border p-2 text-center">{row.mgr}</td>
                    <td className="border p-2 text-center">{row.hr}</td>
                    <td className="border p-2 text-center">{row.exec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Day-in-the-Life Scenario */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Day-in-the-Life: Manager During Evaluation Period</h3>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-4">
                <strong>Sarah</strong>, a Sales Manager with 8 direct reports, logs in to complete her team's annual evaluations. 
                Here's how she uses the Appraisals module:
              </p>
              <ol className="space-y-3 list-none pl-0">
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">8:00</span>
                  <span>Opens dashboard, sees 3 employees have submitted self-assessments. Reviews their input to understand their perspective before rating.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">9:00</span>
                  <span>Starts rating the first employee. Pulls in goal achievement data (auto-populated from Goals module). Rates 4.2/5 on Goals component.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">9:30</span>
                  <span>Rates competencies using behavioral anchors. Uses the AI assistant to draft feedback narrative based on the scores and comments.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">10:00</span>
                  <span>Reviews AI-generated text, makes edits to personalize, and saves. AI confidence was 87% - she adjusts one paragraph.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">14:00</span>
                  <span>Completes 3 more evaluations. System shows overall team distribution: 1 Exceeds, 2 Meets, 1 Below. Notes this for calibration discussion.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex-shrink-0">16:00</span>
                  <span>Submits completed evaluations. Receives notification about upcoming calibration session scheduled for next Tuesday.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
