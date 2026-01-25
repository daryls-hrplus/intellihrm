import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Callout, TipCallout, InfoCallout } from '@/components/enablement/manual/components/Callout';
import { 
  Users, 
  User, 
  UserCheck, 
  Shield, 
  Briefcase,
  Clock,
  CheckCircle2,
  ArrowRight,
  Eye,
  Edit,
  Settings,
  FileText,
  MessageSquare,
  BarChart3,
  Target,
  AlertTriangle,
  Lock,
  Unlock,
  Mail
} from 'lucide-react';

interface PersonaCardProps {
  title: string;
  badge: { label: string; color: string };
  profile: { metric: string; value: string }[];
  goals: string[];
  color: string;
}

function PersonaCard({ title, badge, profile, goals, color }: PersonaCardProps) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline" className={badge.color}>{badge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          {profile.map((p) => (
            <div key={p.metric} className="p-2 rounded bg-muted/50">
              <p className="text-xs text-muted-foreground">{p.metric}</p>
              <p className="font-semibold text-sm">{p.value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Primary Goals</p>
          <ul className="text-sm space-y-1">
            {goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-1">
                <Target className="h-3 w-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface JourneyStep {
  step: number;
  action: string;
  timing: string;
  system: string;
}

function JourneyTable({ steps }: { steps: JourneyStep[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-center py-2 px-2 w-12">#</th>
            <th className="text-left py-2 px-3">Action</th>
            <th className="text-left py-2 px-3">Timing</th>
            <th className="text-left py-2 px-3">System Path</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {steps.map((s) => (
            <tr key={s.step} className="hover:bg-muted/30">
              <td className="py-2 px-2 text-center">
                <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                  {s.step}
                </Badge>
              </td>
              <td className="py-2 px-3 font-medium">{s.action}</td>
              <td className="py-2 px-3 text-muted-foreground">{s.timing}</td>
              <td className="py-2 px-3">
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{s.system}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function F360Personas() {
  const employeeJourney: JourneyStep[] = [
    { step: 1, action: 'Receive cycle notification email', timing: 'Day 1', system: 'Email / Notifications' },
    { step: 2, action: 'Review cycle timeline and expectations', timing: 'Day 1-2', system: 'My 360 → Active Cycles' },
    { step: 3, action: 'Complete self-assessment questionnaire', timing: 'Week 1', system: 'My 360 → Self Rating' },
    { step: 4, action: 'Nominate peer raters (if enabled)', timing: 'Week 1-2', system: 'My 360 → Nominations' },
    { step: 5, action: 'Track feedback collection progress', timing: 'Weeks 2-4', system: 'My 360 → Status Dashboard' },
    { step: 6, action: 'View aggregated feedback results', timing: 'After release', system: 'My 360 → Results' },
    { step: 7, action: 'Review AI-generated development themes', timing: 'After release', system: 'My 360 → Development' },
    { step: 8, action: 'Acknowledge receipt of results', timing: 'Within 7 days', system: 'My 360 → Acknowledgement' },
  ];

  const raterJourney: JourneyStep[] = [
    { step: 1, action: 'Receive feedback request notification', timing: 'Day 1', system: 'Email / Notifications' },
    { step: 2, action: 'Accept or decline the request', timing: 'Within 3 days', system: 'My Tasks → 360 Requests' },
    { step: 3, action: 'Complete feedback questionnaire', timing: 'Within window', system: 'Provide Feedback → Form' },
    { step: 4, action: 'Review AI writing suggestions (optional)', timing: 'Before submit', system: 'Form → AI Assist' },
    { step: 5, action: 'Submit feedback', timing: 'Before deadline', system: 'Form → Submit' },
  ];

  const managerJourney: JourneyStep[] = [
    { step: 1, action: 'Review direct reports in cycle', timing: 'Day 1', system: 'MSS → 360 Overview' },
    { step: 2, action: 'Complete manager feedback for each report', timing: 'Week 1-2', system: 'MSS → Provide Feedback' },
    { step: 3, action: 'Review and approve peer nominations', timing: 'Week 1-2', system: 'MSS → Nominations' },
    { step: 4, action: 'Monitor team feedback completion', timing: 'Ongoing', system: 'MSS → Team Status' },
    { step: 5, action: 'Send reminder nudges to pending raters', timing: 'As needed', system: 'MSS → Send Reminders' },
    { step: 6, action: 'Review team results after release', timing: 'Post-release', system: 'MSS → Team Results' },
    { step: 7, action: 'Conduct feedback coaching conversations', timing: 'Post-release', system: 'Offline / 1:1s' },
    { step: 8, action: 'Contribute to calibration sessions', timing: 'If scheduled', system: 'MSS → Calibration' },
  ];

  const hrAdminJourney: JourneyStep[] = [
    { step: 1, action: 'Configure rater categories and weights', timing: 'Setup', system: 'Setup → Rater Categories' },
    { step: 2, action: 'Create question bank from competencies', timing: 'Setup', system: 'Setup → Question Bank' },
    { step: 3, action: 'Define report templates by audience', timing: 'Setup', system: 'Setup → Report Templates' },
    { step: 4, action: 'Create and configure 360 cycle', timing: 'Pre-launch', system: 'Cycles → Create New' },
    { step: 5, action: 'Enroll participants and validate eligibility', timing: 'Pre-launch', system: 'Cycle → Participants' },
    { step: 6, action: 'Launch cycle and trigger notifications', timing: 'Day 1', system: 'Cycle → Launch' },
    { step: 7, action: 'Monitor collection progress dashboard', timing: 'Ongoing', system: 'Cycle → Analytics' },
    { step: 8, action: 'Process and review AI-generated signals', timing: 'Post-collection', system: 'Cycle → Signals' },
    { step: 9, action: 'Facilitate calibration sessions (optional)', timing: 'Pre-release', system: 'Cycle → Calibration' },
    { step: 10, action: 'Release results to participants', timing: 'Target date', system: 'Cycle → Release Results' },
    { step: 11, action: 'Monitor acknowledgement compliance', timing: 'Post-release', system: 'Cycle → Compliance' },
    { step: 12, action: 'Generate executive summary reports', timing: 'Final', system: 'Reports → Executive' },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        1.3 User Personas & Journeys
      </h3>
      
      <p className="text-muted-foreground">
        Understanding the distinct personas and their journeys through the 360 Feedback process enables 
        effective system configuration and change management.
      </p>

      {/* Persona Cards Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <PersonaCard
          title="Employee (Subject)"
          badge={{ label: 'ESS', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' }}
          profile={[
            { metric: 'Access Level', value: 'Self Only' },
            { metric: 'Login Frequency', value: '2-3× / cycle' },
            { metric: 'Time in System', value: '30-60 min' },
          ]}
          goals={[
            'Receive fair, comprehensive feedback',
            'Understand strengths and development areas',
            'Contribute to own development planning',
          ]}
          color="border-l-blue-500"
        />
        
        <PersonaCard
          title="Rater (Peer/DR)"
          badge={{ label: 'ESS', color: 'bg-green-500/10 text-green-700 border-green-500/30' }}
          profile={[
            { metric: 'Access Level', value: 'Assigned Only' },
            { metric: 'Login Frequency', value: '1-2× / cycle' },
            { metric: 'Time in System', value: '15-30 min' },
          ]}
          goals={[
            'Provide honest, constructive feedback',
            'Complete requests within deadline',
            'Maintain anonymity confidence',
          ]}
          color="border-l-green-500"
        />
        
        <PersonaCard
          title="Manager"
          badge={{ label: 'MSS', color: 'bg-purple-500/10 text-purple-700 border-purple-500/30' }}
          profile={[
            { metric: 'Access Level', value: 'Team Scope' },
            { metric: 'Login Frequency', value: '4-6× / cycle' },
            { metric: 'Time in System', value: '2-4 hours' },
          ]}
          goals={[
            'Evaluate direct reports comprehensively',
            'Ensure team participation compliance',
            'Facilitate development conversations',
          ]}
          color="border-l-purple-500"
        />
        
        <PersonaCard
          title="HR Administrator"
          badge={{ label: 'HR Ops', color: 'bg-orange-500/10 text-orange-700 border-orange-500/30' }}
          profile={[
            { metric: 'Access Level', value: 'Full Module' },
            { metric: 'Login Frequency', value: 'Daily' },
            { metric: 'Time in System', value: '6-10 hours' },
          ]}
          goals={[
            'Ensure cycle execution and compliance',
            'Maintain data quality and governance',
            'Generate actionable talent insights',
          ]}
          color="border-l-orange-500"
        />
      </div>

      {/* Employee Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Employee (Subject) Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JourneyTable steps={employeeJourney} />
        </CardContent>
      </Card>

      {/* Rater Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Rater Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JourneyTable steps={raterJourney} />
          <TipCallout title="Response Quality">
            The AI Writing Assistant provides real-time suggestions to improve feedback quality, 
            specificity, and constructiveness without changing the rater's core message.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Manager Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
            Manager Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JourneyTable steps={managerJourney} />
        </CardContent>
      </Card>

      {/* HR Admin Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            HR Administrator Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JourneyTable steps={hrAdminJourney} />
        </CardContent>
      </Card>

      {/* Role-Based Access Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Role-Based Access Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3">Capability</th>
                  <th className="text-center py-2 px-2">Employee</th>
                  <th className="text-center py-2 px-2">Rater</th>
                  <th className="text-center py-2 px-2">Manager</th>
                  <th className="text-center py-2 px-2">HR Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { cap: 'View own 360 results', emp: true, rater: false, mgr: true, hr: true },
                  { cap: 'Provide feedback on others', emp: false, rater: true, mgr: true, hr: false },
                  { cap: 'Complete self-assessment', emp: true, rater: false, mgr: true, hr: false },
                  { cap: 'Nominate peer raters', emp: true, rater: false, mgr: true, hr: true },
                  { cap: 'Approve peer nominations', emp: false, rater: false, mgr: true, hr: true },
                  { cap: 'View team 360 results', emp: false, rater: false, mgr: true, hr: true },
                  { cap: 'Configure 360 cycles', emp: false, rater: false, mgr: false, hr: true },
                  { cap: 'Manage question bank', emp: false, rater: false, mgr: false, hr: true },
                  { cap: 'Access investigation mode', emp: false, rater: false, mgr: false, hr: true },
                  { cap: 'Release results to subjects', emp: false, rater: false, mgr: false, hr: true },
                  { cap: 'View AI-generated signals', emp: false, rater: false, mgr: true, hr: true },
                  { cap: 'Export analytics reports', emp: false, rater: false, mgr: true, hr: true },
                ].map((row) => (
                  <tr key={row.cap} className="hover:bg-muted/30">
                    <td className="py-2 px-3">{row.cap}</td>
                    <td className="py-2 px-2 text-center">
                      {row.emp ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {row.rater ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {row.mgr ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {row.hr ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Day-in-the-Life Scenario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Day-in-the-Life: HR Administrator During Active Cycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" /> 9:00 AM - Morning Review
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check cycle dashboard for overnight completions</li>
                <li>• Review response rate by department</li>
                <li>• Identify departments below 60% completion</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" /> 10:00 AM - Reminders
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Send targeted reminder to pending raters</li>
                <li>• Escalate to managers for chronic non-responders</li>
                <li>• Review declined requests for patterns</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> 2:00 PM - Exception Handling
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Process nomination override requests</li>
                <li>• Review anonymity threshold exceptions</li>
                <li>• Document investigation mode requests</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> 4:00 PM - Analytics
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Review AI-generated quality flags</li>
                <li>• Prepare weekly status report for leadership</li>
                <li>• Update timeline if adjustments needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Footer */}
      <div className="flex items-center justify-end text-sm text-muted-foreground border-t pt-4">
        <Badge variant="outline">Section 1.3 of 1.5</Badge>
      </div>
    </div>
  );
}
