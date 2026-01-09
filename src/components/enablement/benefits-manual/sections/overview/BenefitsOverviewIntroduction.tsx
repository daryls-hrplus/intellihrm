import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Shield, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  Brain,
  FileText,
  ArrowRight,
  Building2,
  Calculator,
  ClipboardCheck
} from 'lucide-react';
import { LearningObjectives } from '../../../manual/components/LearningObjectives';

export function BenefitsOverviewIntroduction() {
  const businessMetrics = [
    { label: 'Enrollment Processing Time', value: '35%', suffix: 'reduction', color: 'text-emerald-600' },
    { label: 'Open Enrollment Completion', value: '98%', suffix: 'rate', color: 'text-blue-600' },
    { label: 'Compliance Audit Pass', value: '100%', suffix: 'rate', color: 'text-purple-600' },
    { label: 'Employee Self-Service Adoption', value: '89%', suffix: 'rate', color: 'text-amber-600' },
  ];

  const valueDrivers = [
    'Multi-plan architecture supporting Medical, Dental, Vision, Life, Retirement, HSA, and FSA benefit types',
    'Flexible contribution models with configurable employer/employee premium splits by coverage level',
    'Automated open enrollment periods with integrated life event management and qualifying changes',
    'Claims processing workflows with configurable approval hierarchies and audit trails',
    'Cost projections and utilization analytics powered by AI-driven forecasting engines',
    'Seamless payroll integration for automated deduction calculations and carrier feeds',
    'COBRA administration with automated notifications and payment tracking',
    'Regional compliance support for Caribbean, Africa, and North American regulations',
  ];

  const audienceMatrix = [
    { 
      role: 'Benefits Administrator', 
      sections: 'All Sections (1-8)', 
      responsibilities: 'Plan configuration, provider management, enrollment oversight, claims processing, compliance reporting',
      timeInvestment: '6-8 hours',
      icon: Shield,
      color: 'bg-blue-100 text-blue-700'
    },
    { 
      role: 'HR Administrator', 
      sections: 'Sections 1-4, 7', 
      responsibilities: 'Policy oversight, eligibility rules, life event approvals, audit coordination',
      timeInvestment: '4-5 hours',
      icon: Users,
      color: 'bg-purple-100 text-purple-700'
    },
    { 
      role: 'HR Operations', 
      sections: 'Sections 4-6', 
      responsibilities: 'Day-to-day enrollment processing, employee inquiries, data validation',
      timeInvestment: '3-4 hours',
      icon: ClipboardCheck,
      color: 'bg-emerald-100 text-emerald-700'
    },
    { 
      role: 'Payroll Administrator', 
      sections: 'Sections 3, 7', 
      responsibilities: 'Deduction integration, carrier file generation, reconciliation',
      timeInvestment: '2-3 hours',
      icon: Calculator,
      color: 'bg-amber-100 text-amber-700'
    },
    { 
      role: 'Manager (MSS)', 
      sections: 'Section 8', 
      responsibilities: 'Team benefits overview, new hire orientation support',
      timeInvestment: '1 hour',
      icon: Building2,
      color: 'bg-rose-100 text-rose-700'
    },
    { 
      role: 'Employee (ESS)', 
      sections: 'Section 8', 
      responsibilities: 'Self-enrollment, plan comparison, claims submission, life events',
      timeInvestment: '30 minutes',
      icon: Heart,
      color: 'bg-cyan-100 text-cyan-700'
    },
  ];

  const scopeCovers = [
    'Benefit category and plan configuration',
    'Provider and carrier management',
    'Enrollment workflows and life event processing',
    'Open enrollment period management',
    'Claims submission and approval workflows',
    'Cost analytics and utilization reporting',
    'COBRA and continuation coverage administration',
    'Employee and manager self-service interfaces',
    'Compliance reporting and audit trails',
  ];

  const scopeDoesNotCover = [
    { topic: 'Payroll Processing', link: 'Payroll Administrator Manual', description: 'Deduction calculations, pay period processing' },
    { topic: 'Compensation Planning', link: 'Compensation Administrator Manual', description: 'Salary structures, merit increases, bonus programs' },
    { topic: 'Workforce Data', link: 'Workforce Administrator Manual', description: 'Employee records, job assignments, organizational hierarchy' },
    { topic: 'Performance Management', link: 'Performance & Appraisals Manual', description: 'Goal setting, reviews, calibration' },
  ];

  const differentiators = [
    {
      title: 'Multi-Plan Architecture',
      description: 'Support for 10+ benefit types with tiered contributions, multiple coverage levels, and flexible eligibility rules per plan.',
      icon: Heart,
      color: 'bg-gradient-to-br from-rose-500 to-pink-600',
      stats: '10+ benefit types',
    },
    {
      title: 'Compliance-First Design',
      description: 'Built-in support for ERISA, ACA, HIPAA, and regional requirements across Caribbean, African, and North American jurisdictions.',
      icon: Shield,
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      stats: '15+ regions',
    },
    {
      title: 'AI-Powered Analytics',
      description: 'Cost projections, utilization forecasting, anomaly detection, and intelligent enrollment recommendations.',
      icon: Brain,
      color: 'bg-gradient-to-br from-purple-500 to-violet-600',
      stats: '4 AI agents',
    },
  ];

  const learningObjectives = [
    'Explain the strategic purpose and quantified business value of the Benefits Administration module',
    'Describe the plan-provider-enrollment-claim data hierarchy and relationships',
    'Differentiate between benefit categories, plans, coverage levels, and contribution models',
    'Identify the six key user personas and their primary workflows within the module',
    'Outline the annual benefits management calendar with regional variations',
  ];

  const documentConventions = [
    { icon: Lightbulb, label: 'Tip / Best Practice', color: 'bg-amber-100 border-amber-400 text-amber-800', description: 'Recommendations for optimal use' },
    { icon: AlertTriangle, label: 'Warning / Caution', color: 'bg-red-100 border-red-400 text-red-800', description: 'Critical considerations or risks' },
    { icon: BookOpen, label: 'Industry Standard', color: 'bg-blue-100 border-blue-400 text-blue-800', description: 'Compliance or regulatory reference' },
    { icon: ArrowRight, label: 'System Path', color: 'bg-slate-100 border-slate-400 text-slate-800', description: 'Navigation: Module → Feature → Action' },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div id="ben-sec-1-1" className="border-b border-border pb-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="font-medium">Part 1</span>
          <span>•</span>
          <span>Section 1.1</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Introduction & Business Context</h2>
        <p className="text-muted-foreground mt-1">
          Understanding the strategic value and scope of HRplus Benefits Administration
        </p>
      </div>

      {/* Executive Summary */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Executive Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground leading-relaxed">
            The <strong>HRplus Benefits Administration Module</strong> is an enterprise-grade, AI-first platform 
            designed to transform how organizations manage employee benefits across the Caribbean, Africa, and 
            global operations. By unifying plan configuration, enrollment management, claims processing, and 
            analytics into a single intelligent system, organizations can dramatically reduce administrative 
            burden while improving employee experience and compliance outcomes.
          </p>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {businessMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-background border">
                <div className={`text-3xl font-bold ${metric.color}`}>{metric.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{metric.suffix}</div>
                <div className="text-sm font-medium text-foreground mt-2">{metric.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Value */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">Business Value & Capabilities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Benefits module addresses critical challenges facing modern HR organizations: fragmented 
            benefits administration, compliance complexity, manual enrollment processes, and limited 
            visibility into benefits utilization and costs.
          </p>
          
          <div className="grid gap-2 mt-4">
            {valueDrivers.map((driver, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{driver}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Target Audience Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Target Audience & Time Investment</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This manual serves multiple audiences with varying depths of engagement. Use this matrix to 
            identify which sections are most relevant to your role.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Primary Sections</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground hidden md:table-cell">Key Responsibilities</th>
                  <th className="text-center py-3 px-4 font-semibold text-foreground">Time</th>
                </tr>
              </thead>
              <tbody>
                {audienceMatrix.map((row, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${row.color}`}>
                          <row.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">{row.role}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{row.sections}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{row.responsibilities}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary" className="font-mono">
                        {row.timeInvestment}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Document Scope */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg text-emerald-900">What This Manual Covers</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scopeCovers.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-lg text-slate-900">Related Documentation</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {scopeDoesNotCover.map((item, index) => (
                <li key={index} className="text-sm">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                    {item.topic}
                  </div>
                  <div className="text-slate-600 ml-6 text-xs">
                    {item.description} → <span className="text-blue-600 underline cursor-pointer">{item.link}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Key Differentiators */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Key Differentiators</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {differentiators.map((diff, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl border bg-card p-6">
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full ${diff.color} opacity-10`} />
                <div className={`w-12 h-12 rounded-lg ${diff.color} flex items-center justify-center mb-4`}>
                  <diff.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{diff.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{diff.description}</p>
                <Badge variant="outline" className="font-mono text-xs">{diff.stats}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <LearningObjectives objectives={learningObjectives} />

      {/* Document Conventions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg">Document Conventions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Throughout this manual, you will encounter the following visual indicators:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {documentConventions.map((convention, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${convention.color}`}>
                <convention.icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">{convention.label}</div>
                  <div className="text-xs opacity-80">{convention.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
