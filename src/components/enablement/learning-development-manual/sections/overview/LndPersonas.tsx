import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  User,
  UserCog,
  UserCheck,
  Briefcase,
  GraduationCap,
  Settings,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  ClipboardCheck,
  Shield,
  Target,
  Award,
  MessageSquare,
  Calendar,
  BarChart3,
  Building,
  Zap
} from 'lucide-react';
import { InfoCallout } from '@/components/enablement/manual/components/Callout';

export function LndPersonas() {
  const personas = [
    {
      title: 'Employee (ESS)',
      icon: User,
      color: 'emerald',
      badge: 'Self-Service',
      needs: [
        'Quick course discovery and catalog search',
        'Clear progress tracking and due dates',
        'Easy access to certificates and transcripts',
        'Mobile-friendly learning experience',
      ],
      capabilities: [
        'Browse course catalog and enroll',
        'Complete lessons, modules, and quizzes',
        'Track personal learning progress',
        'Earn badges and certificates',
        'Submit training requests',
        'View training history',
      ],
      primaryModules: ['Course Catalog', 'My Learning', 'Certifications', 'Training History'],
    },
    {
      title: 'Manager (MSS)',
      icon: UserCheck,
      color: 'blue',
      badge: 'Team Oversight',
      needs: [
        'Team training progress visibility',
        'Compliance status monitoring',
        'Easy course assignment workflow',
        'Training effectiveness insights',
      ],
      capabilities: [
        'View team training dashboard',
        'Assign courses with due dates',
        'Approve/reject training requests',
        'Monitor compliance status',
        'Identify skill gaps in team',
        'Review evaluation scores',
      ],
      primaryModules: ['Team Training', 'Compliance Dashboard', 'Training Requests', 'Gap Analysis'],
    },
    {
      title: 'L&D Administrator',
      icon: Settings,
      color: 'purple',
      badge: 'Full Access',
      needs: [
        'Efficient course creation tools',
        'Content management flexibility',
        'Comprehensive analytics',
        'Compliance configuration control',
      ],
      capabilities: [
        'Create and manage courses/modules/lessons',
        'Configure quizzes and assessments',
        'Design learning paths',
        'Set compliance rules and recertification',
        'Manage SCORM/xAPI packages',
        'Configure gamification rewards',
        'Generate training reports',
        'Manage instructors and agencies',
      ],
      primaryModules: ['LMS Management', 'Course Authoring', 'Analytics', 'Compliance Setup', 'Gamification'],
    },
    {
      title: 'HR Partner',
      icon: Briefcase,
      color: 'amber',
      badge: 'Operations',
      needs: [
        'Training coordination efficiency',
        'Budget visibility and control',
        'External training management',
        'Reporting for audits',
      ],
      capabilities: [
        'Process training requests',
        'Manage training budgets',
        'Coordinate with external agencies',
        'Record external training history',
        'Generate compliance reports',
        'Review training evaluations',
      ],
      primaryModules: ['Training Requests', 'Budgets', 'External Training', 'Evaluations', 'Reports'],
    },
    {
      title: 'Training Instructor',
      icon: GraduationCap,
      color: 'cyan',
      badge: 'Delivery',
      needs: [
        'Session management tools',
        'Learner engagement tracking',
        'Evaluation review access',
        'Feedback collection',
      ],
      capabilities: [
        'Deliver live and virtual sessions',
        'Track session attendance',
        'Review learner evaluations',
        'Provide feedback and grades',
        'Manage course materials',
        'View assigned courses',
      ],
      primaryModules: ['Live Sessions', 'Virtual Classroom', 'Evaluations', 'Attendance'],
    },
    {
      title: 'Implementation Consultant',
      icon: UserCog,
      color: 'red',
      badge: 'Configuration',
      needs: [
        'Clear configuration guidance',
        'Integration setup support',
        'Migration tools and documentation',
        'Best practices reference',
      ],
      capabilities: [
        'Full system configuration access',
        'Legacy data migration',
        'Cross-module integration setup',
        'Custom workflow configuration',
        'Compliance rule design',
        'Analytics customization',
      ],
      primaryModules: ['All Modules', 'Admin LMS', 'Setup Guides', 'Migration Tools', 'Integrations'],
    },
  ];

  const journeys = [
    {
      title: 'Employee Course Completion',
      icon: GraduationCap,
      color: 'emerald',
      steps: [
        { step: 1, action: 'Browse Course Catalog', actor: 'Employee', detail: 'Search by category, skill, or keyword' },
        { step: 2, action: 'Enroll in Course', actor: 'Employee', detail: 'Self-enroll or request manager approval' },
        { step: 3, action: 'Complete Modules', actor: 'Employee', detail: 'Work through lessons sequentially' },
        { step: 4, action: 'Take Quiz', actor: 'Employee', detail: 'Pass required assessments' },
        { step: 5, action: 'Receive Certificate', actor: 'System', detail: 'Auto-generated upon completion' },
      ],
    },
    {
      title: 'Manager Assigns Training',
      icon: UserCheck,
      color: 'blue',
      steps: [
        { step: 1, action: 'Identify Skill Gap', actor: 'Manager', detail: 'Via performance review or competency analysis' },
        { step: 2, action: 'Search Course Catalog', actor: 'Manager', detail: 'Find appropriate training' },
        { step: 3, action: 'Assign with Due Date', actor: 'Manager', detail: 'Set expectations and timeline' },
        { step: 4, action: 'Monitor Progress', actor: 'Manager', detail: 'Track via Team Training dashboard' },
        { step: 5, action: 'Review Completion', actor: 'Manager', detail: 'Verify scores and provide feedback' },
      ],
    },
    {
      title: 'Compliance Training Cycle',
      icon: Shield,
      color: 'red',
      steps: [
        { step: 1, action: 'Configure Rule', actor: 'HR/Admin', detail: 'Set course, audience, recertification period' },
        { step: 2, action: 'Assign Training', actor: 'System', detail: 'Auto-assign to target audience' },
        { step: 3, action: 'Send Notifications', actor: 'System', detail: 'Email reminders with due dates' },
        { step: 4, action: 'Complete Training', actor: 'Employee', detail: 'Finish before deadline' },
        { step: 5, action: 'Trigger Recertification', actor: 'System', detail: 'Schedule next cycle automatically' },
      ],
    },
    {
      title: 'Training Request Approval',
      icon: ClipboardCheck,
      color: 'amber',
      steps: [
        { step: 1, action: 'Submit Request', actor: 'Employee', detail: 'For external or paid training' },
        { step: 2, action: 'Manager Review', actor: 'Manager', detail: 'Evaluate relevance and budget' },
        { step: 3, action: 'Approve/Reject', actor: 'Manager', detail: 'With comments' },
        { step: 4, action: 'HR Processing', actor: 'HR Partner', detail: 'Schedule and coordinate logistics' },
        { step: 5, action: 'Record Completion', actor: 'HR/Employee', detail: 'Add to training history' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-1-3" data-manual-anchor="sec-1-3">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Users className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">1.3 User Personas & Journeys</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                15 min read
              </Badge>
              <Badge variant="secondary" className="text-xs">Foundation</Badge>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          The L&D module serves six primary personas, each with distinct needs and workflows. Understanding 
          these personas ensures proper configuration, permissions, and user experience optimization.
        </p>

        {/* Persona Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Primary Personas
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map((persona, idx) => (
              <Card key={idx} className={`border-${persona.color}-200 dark:border-${persona.color}-800`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <persona.icon className={`h-5 w-5 text-${persona.color}-600`} />
                      {persona.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">{persona.badge}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">KEY NEEDS</p>
                    <ul className="space-y-1">
                      {persona.needs.map((need, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Target className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                          <span>{need}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">CAPABILITIES</p>
                    <ul className="space-y-1">
                      {persona.capabilities.slice(0, 4).map((cap, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className={`h-3 w-3 text-${persona.color}-600 mt-1 flex-shrink-0`} />
                          <span>{cap}</span>
                        </li>
                      ))}
                      {persona.capabilities.length > 4 && (
                        <li className="text-xs text-muted-foreground">
                          +{persona.capabilities.length - 4} more capabilities
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">PRIMARY MODULES</p>
                    <div className="flex flex-wrap gap-1">
                      {persona.primaryModules.map((mod, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {mod}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Journeys */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            Key User Journeys
          </h3>
          
          <div className="space-y-6">
            {journeys.map((journey, idx) => (
              <Card key={idx} className={`border-${journey.color}-200 dark:border-${journey.color}-800`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <journey.icon className={`h-5 w-5 text-${journey.color}-600`} />
                    {journey.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 overflow-x-auto pb-2">
                    {journey.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 p-3 bg-${journey.color}-50 dark:bg-${journey.color}-950/30 rounded-lg min-w-[140px]`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-5 h-5 rounded-full bg-${journey.color}-600 text-white text-xs flex items-center justify-center font-bold`}>
                              {step.step}
                            </span>
                            <Badge variant="outline" className="text-xs">{step.actor}</Badge>
                          </div>
                          <p className="font-medium text-sm">{step.action}</p>
                          <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>
                        </div>
                        {i < journey.steps.length - 1 && (
                          <ArrowRight className={`h-4 w-4 text-${journey.color}-400 flex-shrink-0 hidden md:block`} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RACI Matrix */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Responsibility Matrix (RACI)
          </h3>
          
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Activity</th>
                    <th className="text-center p-2 font-semibold">Employee</th>
                    <th className="text-center p-2 font-semibold">Manager</th>
                    <th className="text-center p-2 font-semibold">L&D Admin</th>
                    <th className="text-center p-2 font-semibold">HR Partner</th>
                    <th className="text-center p-2 font-semibold">Instructor</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { activity: 'Self-Enroll in Courses', emp: 'R', mgr: 'I', admin: 'A', hr: '-', inst: '-' },
                    { activity: 'Complete Training', emp: 'R', mgr: 'I', admin: 'A', hr: '-', inst: 'C' },
                    { activity: 'Assign Team Training', emp: 'I', mgr: 'R', admin: 'A', hr: 'C', inst: '-' },
                    { activity: 'Approve Training Requests', emp: 'I', mgr: 'R', admin: 'I', hr: 'A', inst: '-' },
                    { activity: 'Create Courses', emp: '-', mgr: 'C', admin: 'R', hr: 'I', inst: 'C' },
                    { activity: 'Configure Compliance Rules', emp: '-', mgr: 'I', admin: 'R', hr: 'A', inst: '-' },
                    { activity: 'Deliver Training Sessions', emp: 'I', mgr: 'I', admin: 'A', hr: 'C', inst: 'R' },
                    { activity: 'Manage Training Budget', emp: '-', mgr: 'C', admin: 'I', hr: 'R', inst: '-' },
                    { activity: 'Generate Reports', emp: '-', mgr: 'C', admin: 'R', hr: 'R', inst: 'I' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="p-2">{row.activity}</td>
                      <td className="text-center p-2">
                        <Badge variant={row.emp === 'R' ? 'default' : row.emp === 'A' ? 'secondary' : 'outline'} className="w-6">
                          {row.emp}
                        </Badge>
                      </td>
                      <td className="text-center p-2">
                        <Badge variant={row.mgr === 'R' ? 'default' : row.mgr === 'A' ? 'secondary' : 'outline'} className="w-6">
                          {row.mgr}
                        </Badge>
                      </td>
                      <td className="text-center p-2">
                        <Badge variant={row.admin === 'R' ? 'default' : row.admin === 'A' ? 'secondary' : 'outline'} className="w-6">
                          {row.admin}
                        </Badge>
                      </td>
                      <td className="text-center p-2">
                        <Badge variant={row.hr === 'R' ? 'default' : row.hr === 'A' ? 'secondary' : 'outline'} className="w-6">
                          {row.hr}
                        </Badge>
                      </td>
                      <td className="text-center p-2">
                        <Badge variant={row.inst === 'R' ? 'default' : row.inst === 'A' ? 'secondary' : 'outline'} className="w-6">
                          {row.inst}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span><Badge variant="default" className="w-6 mr-1">R</Badge> Responsible</span>
                <span><Badge variant="secondary" className="w-6 mr-1">A</Badge> Accountable</span>
                <span><Badge variant="outline" className="w-6 mr-1">C</Badge> Consulted</span>
                <span><Badge variant="outline" className="w-6 mr-1">I</Badge> Informed</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <InfoCallout title="Permission Configuration">
          Persona-based access is configured through <strong>Role Permissions</strong> in the Admin & Security module. 
          L&D-specific permissions include: <code>lms.course.create</code>, <code>lms.enrollment.manage</code>, 
          <code>training.request.approve</code>, and <code>compliance.rule.configure</code>.
        </InfoCallout>
      </section>
    </div>
  );
}
