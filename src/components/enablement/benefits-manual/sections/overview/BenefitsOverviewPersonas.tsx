import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Shield, 
  Heart,
  Building2,
  Clock,
  Target,
  CheckCircle2,
  ArrowRight,
  Calendar,
  FileText,
  Settings,
  Eye,
  Edit,
  AlertCircle,
  Coffee,
  Laptop,
  Phone,
  Mail
} from 'lucide-react';

export function BenefitsOverviewPersonas() {
  const personas = [
    {
      role: 'Benefits Administrator',
      tagline: 'The Benefits Architect',
      icon: Shield,
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50',
      profile: {
        accessLevel: 'Full administrative access to all benefits functions',
        loginFrequency: 'Daily, multiple sessions',
        technicalSkill: 'Advanced - comfortable with configuration, data analysis',
        timeInSystem: '4-6 hours daily during open enrollment; 1-2 hours otherwise',
      },
      goals: [
        'Configure benefit plans accurately and on schedule',
        'Ensure carrier data synchronization and accuracy',
        'Maintain compliance with regulations (ERISA, ACA, regional)',
        'Optimize benefit costs while maximizing employee value',
        'Streamline enrollment processes and reduce manual intervention',
      ],
      journey: [
        'Plan annual benefits renewal strategy',
        'Negotiate rates with carriers',
        'Configure new plan options in system',
        'Set up open enrollment period',
        'Monitor enrollment progress and resolve issues',
        'Generate carrier files and reconcile',
        'Produce compliance reports',
        'Analyze utilization and plan for next year',
      ],
    },
    {
      role: 'HR Administrator',
      tagline: 'The Policy Guardian',
      icon: Users,
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-50',
      profile: {
        accessLevel: 'Read access to all enrollments; approve life events',
        loginFrequency: 'Daily',
        technicalSkill: 'Intermediate - comfortable with standard workflows',
        timeInSystem: '1-2 hours daily',
      },
      goals: [
        'Ensure benefits policies align with organizational strategy',
        'Approve life event requests accurately and timely',
        'Maintain audit readiness for compliance reviews',
        'Support employees with complex benefits questions',
        'Coordinate with Benefits Admin on policy changes',
      ],
      journey: [
        'Review pending life event requests',
        'Validate documentation for qualifying changes',
        'Approve or escalate complex cases',
        'Monitor team enrollment completion rates',
        'Generate reports for leadership',
        'Coordinate COBRA notifications',
      ],
    },
    {
      role: 'Employee (ESS)',
      tagline: 'The Self-Service User',
      icon: Heart,
      color: 'bg-rose-500',
      borderColor: 'border-rose-500',
      bgColor: 'bg-rose-50',
      profile: {
        accessLevel: 'Own enrollments, claims, and life events only',
        loginFrequency: 'During OE, life events, or claims',
        technicalSkill: 'Basic - needs intuitive, guided experience',
        timeInSystem: '15-30 minutes per session',
      },
      goals: [
        'Understand available benefit options clearly',
        'Enroll in the best plans for personal/family needs',
        'Submit claims quickly and track status',
        'Report life events and understand coverage changes',
        'Access benefit information on-demand',
      ],
      journey: [
        'Receive open enrollment notification',
        'Compare available plans side-by-side',
        'Calculate cost impact of different options',
        'Select plans and coverage levels',
        'Add/verify dependents',
        'Submit enrollment elections',
        'Download confirmation documents',
      ],
    },
    {
      role: 'Manager (MSS)',
      tagline: 'The Team Supporter',
      icon: Building2,
      color: 'bg-amber-500',
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-50',
      profile: {
        accessLevel: 'View-only for direct reports\' enrollment status',
        loginFrequency: 'During OE or when supporting new hires',
        technicalSkill: 'Basic - needs dashboard-level visibility',
        timeInSystem: '15-30 minutes weekly during OE',
      },
      goals: [
        'Ensure team members complete enrollment on time',
        'Support new hires through benefits orientation',
        'Escalate complex benefits questions to HR',
        'Understand team benefits for planning purposes',
      ],
      journey: [
        'View team enrollment completion dashboard',
        'Identify team members who haven\'t enrolled',
        'Send reminders for enrollment deadlines',
        'Review new hire benefits onboarding status',
        'Escalate issues to HR when needed',
      ],
    },
  ];

  const accessMatrix = [
    { capability: 'View own benefits enrollment', employee: true, manager: true, hrAdmin: true, benefitsAdmin: true },
    { capability: 'Enroll in benefit plans', employee: true, manager: false, hrAdmin: false, benefitsAdmin: false },
    { capability: 'Submit claims', employee: true, manager: false, hrAdmin: false, benefitsAdmin: false },
    { capability: 'Report life events', employee: true, manager: false, hrAdmin: false, benefitsAdmin: false },
    { capability: 'View team enrollment status', employee: false, manager: true, hrAdmin: true, benefitsAdmin: true },
    { capability: 'Approve life events', employee: false, manager: false, hrAdmin: true, benefitsAdmin: true },
    { capability: 'Process enrollments on behalf', employee: false, manager: false, hrAdmin: true, benefitsAdmin: true },
    { capability: 'Configure benefit plans', employee: false, manager: false, hrAdmin: false, benefitsAdmin: true },
    { capability: 'Manage providers', employee: false, manager: false, hrAdmin: false, benefitsAdmin: true },
    { capability: 'Set up open enrollment', employee: false, manager: false, hrAdmin: false, benefitsAdmin: true },
    { capability: 'Run compliance reports', employee: false, manager: false, hrAdmin: true, benefitsAdmin: true },
    { capability: 'Access cost analytics', employee: false, manager: false, hrAdmin: true, benefitsAdmin: true },
  ];

  const dayInTheLife = {
    persona: 'Maria, Benefits Administrator',
    context: 'During Open Enrollment (November)',
    timeline: [
      { time: '8:00 AM', activity: 'Review overnight enrollment submissions and error logs', icon: Laptop },
      { time: '8:30 AM', activity: 'Process carrier file exceptions and contact carriers as needed', icon: Phone },
      { time: '9:30 AM', activity: 'Review AI-flagged enrollment anomalies and investigate', icon: AlertCircle },
      { time: '10:30 AM', activity: 'Join HR team standup to discuss enrollment progress', icon: Users },
      { time: '11:00 AM', activity: 'Handle escalated employee enrollment questions', icon: Mail },
      { time: '12:00 PM', activity: 'Lunch break', icon: Coffee },
      { time: '1:00 PM', activity: 'Configure rate corrections for a plan discovered this morning', icon: Settings },
      { time: '2:00 PM', activity: 'Generate daily enrollment progress report for leadership', icon: FileText },
      { time: '3:00 PM', activity: 'Process life events submitted during open enrollment', icon: Calendar },
      { time: '4:00 PM', activity: 'Review cost projection dashboard and update budget forecast', icon: Target },
      { time: '4:30 PM', activity: 'Prepare tomorrow\'s priority list and document any issues', icon: CheckCircle2 },
      { time: '5:00 PM', activity: 'End of day - automated reminder emails sent to non-enrollees', icon: Clock },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div id="ben-sec-1-4" className="border-b border-border pb-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="font-medium">Part 1</span>
          <span>•</span>
          <span>Section 1.4</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">User Personas & Journeys</h2>
        <p className="text-muted-foreground mt-1">
          Understanding who uses the Benefits module and how they interact with it
        </p>
      </div>

      {/* Persona Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {personas.map((persona, index) => (
          <Card key={index} className={`border-l-4 ${persona.borderColor}`}>
            <CardHeader className={`${persona.bgColor} rounded-t-lg`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${persona.color} flex items-center justify-center`}>
                  <persona.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{persona.role}</CardTitle>
                  <p className="text-sm text-muted-foreground italic">{persona.tagline}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Profile */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Profile
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="text-muted-foreground">Access Level</div>
                    <div className="font-medium text-foreground">{persona.profile.accessLevel}</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="text-muted-foreground">Login Frequency</div>
                    <div className="font-medium text-foreground">{persona.profile.loginFrequency}</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="text-muted-foreground">Technical Skill</div>
                    <div className="font-medium text-foreground">{persona.profile.technicalSkill}</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <div className="text-muted-foreground">Time in System</div>
                    <div className="font-medium text-foreground">{persona.profile.timeInSystem}</div>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goals & Motivations
                </h4>
                <ul className="space-y-1">
                  {persona.goals.map((goal, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 flex-shrink-0 mt-0.5 text-emerald-500" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Journey */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  User Journey
                </h4>
                <div className="flex flex-wrap gap-1">
                  {persona.journey.map((step, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {i + 1}. {step}
                      </Badge>
                      {i < persona.journey.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role-Based Access Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Role-Based Access Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Capability</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">
                    <div className="flex flex-col items-center gap-1">
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span className="text-xs">Employee</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">
                    <div className="flex flex-col items-center gap-1">
                      <Building2 className="h-4 w-4 text-amber-500" />
                      <span className="text-xs">Manager</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">
                    <div className="flex flex-col items-center gap-1">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-xs">HR Admin</span>
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">
                    <div className="flex flex-col items-center gap-1">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-xs">Benefits Admin</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {accessMatrix.map((row, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-4 text-foreground">{row.capability}</td>
                    <td className="py-2 px-4 text-center">
                      {row.employee ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {row.manager ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {row.hrAdmin ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-center">
                      {row.benefitsAdmin ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Day in the Life */}
      <Card className="border-2 border-dashed border-primary/30">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Day-in-the-Life: {dayInTheLife.persona}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">{dayInTheLife.context}</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative">
            {dayInTheLife.timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-4 mb-4 last:mb-0">
                {/* Time indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-10 text-xs font-mono text-muted-foreground text-right">
                    {item.time}
                  </div>
                </div>

                {/* Connector line */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  {index < dayInTheLife.timeline.length - 1 && (
                    <div className="w-0.5 h-8 bg-border" />
                  )}
                </div>

                {/* Activity */}
                <div className="flex-1 pt-1">
                  <p className="text-sm text-foreground">{item.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
