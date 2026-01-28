import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock, 
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Database,
  Layout,
  Layers,
  Award,
  BarChart3,
  Shield,
  Zap,
  Building,
  UserCheck
} from 'lucide-react';
import { InfoCallout, TipCallout } from '@/components/enablement/manual/components/Callout';

export function LndIntroduction() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-1-1" data-manual-anchor="sec-1-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">1.1 Introduction to Learning & Development</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                15 min read
              </Badge>
              <Badge variant="secondary" className="text-xs">Foundation</Badge>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="mb-6 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              The <strong>Learning & Development (L&D) module</strong> in Intelli HRM provides a comprehensive 
              Learning Management System (LMS) for delivering, tracking, and managing employee training across 
              the entire organization. This enterprise-grade solution supports the complete training lifecycle 
              from course creation through certification, with integrated compliance tracking and AI-powered 
              learning recommendations.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Administrator Manual covers configuration, daily operations, compliance management, 
              reporting, and cross-module integration. It serves as the definitive reference for L&D 
              administrators, HR partners, and implementation consultants working with the training ecosystem.
            </p>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
              <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
                <Database className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                <p className="text-2xl font-bold text-emerald-700">63</p>
                <p className="text-xs text-muted-foreground">Database Tables</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <Layout className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-2xl font-bold text-blue-700">28</p>
                <p className="text-xs text-muted-foreground">UI Pages</p>
              </div>
              <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                <Layers className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <p className="text-2xl font-bold text-purple-700">9</p>
                <p className="text-xs text-muted-foreground">Data Domains</p>
              </div>
              <div className="text-center p-3 bg-amber-500/10 rounded-lg">
                <BookOpen className="h-5 w-5 mx-auto mb-1 text-amber-600" />
                <p className="text-2xl font-bold text-amber-700">9</p>
                <p className="text-xs text-muted-foreground">Manual Chapters</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Value & ROI */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Business Value & ROI
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Challenges Column */}
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Industry Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { stat: '70%', desc: 'of learning content goes unused', source: 'Brandon Hall Group' },
                  { stat: '$10K+', desc: 'average cost of poor onboarding per employee', source: 'SHRM' },
                  { stat: '40%', desc: 'of employees leave within first year due to lack of development', source: 'Work Institute' },
                  { stat: '68%', desc: 'of organizations struggle with compliance training tracking', source: 'Training Industry' },
                  { stat: '52%', desc: 'of L&D teams lack visibility into skill gaps', source: 'LinkedIn Learning' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded">
                    <span className="font-bold text-red-700 dark:text-red-400 min-w-[50px]">{item.stat}</span>
                    <div>
                      <p className="text-sm">{item.desc}</p>
                      <p className="text-xs text-muted-foreground italic">{item.source}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Solutions Column */}
            <Card className="border-emerald-200 dark:border-emerald-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Intelli HRM Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { feature: 'AI-Powered Recommendations', desc: 'Competency gap analysis drives personalized course suggestions' },
                  { feature: 'SCORM/xAPI Tracking', desc: 'Industry-standard eLearning compliance with detailed progress metrics' },
                  { feature: 'Integrated Learning Paths', desc: 'Structured journeys linked to career progression and succession' },
                  { feature: 'Real-Time Compliance Monitoring', desc: 'Automated recertification alerts and audit trails' },
                  { feature: 'Multi-Source Gap Detection', desc: 'Appraisals, competencies, and career goals feed training needs' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.feature}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ROI Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '+35%', label: 'Training Completion Rate', icon: TrendingUp, color: 'emerald' },
              { value: '-50%', label: 'Compliance Gap Incidents', icon: Shield, color: 'blue' },
              { value: '+28%', label: 'Employee Skill Acquisition', icon: Award, color: 'purple' },
              { value: '-40%', label: 'Training Admin Time', icon: Zap, color: 'amber' },
            ].map((metric, idx) => (
              <Card key={idx} className={`text-center border-${metric.color}-200 dark:border-${metric.color}-800`}>
                <CardContent className="pt-4">
                  <metric.icon className={`h-6 w-6 mx-auto mb-2 text-${metric.color}-600`} />
                  <p className={`text-2xl font-bold text-${metric.color}-700 dark:text-${metric.color}-400`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Target Audience Matrix */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Target Audience Matrix
          </h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Role</th>
                      <th className="text-left p-3 font-semibold">Primary Chapters</th>
                      <th className="text-left p-3 font-semibold">Time Investment</th>
                      <th className="text-left p-3 font-semibold">Key Outcomes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { 
                        role: 'L&D Administrator', 
                        badge: 'primary',
                        chapters: 'All Chapters (1-9)', 
                        time: '10+ hours', 
                        outcomes: 'Full LMS configuration mastery, course authoring, compliance setup' 
                      },
                      { 
                        role: 'HR Partner', 
                        badge: 'secondary',
                        chapters: 'Ch 1, 4-5, 7-8', 
                        time: '4-5 hours', 
                        outcomes: 'Training requests, compliance monitoring, budget oversight' 
                      },
                      { 
                        role: 'Manager (MSS)', 
                        badge: 'outline',
                        chapters: 'Ch 1, 4, 7', 
                        time: '2-3 hours', 
                        outcomes: 'Team training assignment, progress monitoring, gap analysis' 
                      },
                      { 
                        role: 'Employee (ESS)', 
                        badge: 'outline',
                        chapters: 'Ch 4 (ESS sections)', 
                        time: '30-45 min', 
                        outcomes: 'Self-enrollment, course completion, certificate access' 
                      },
                      { 
                        role: 'Training Instructor', 
                        badge: 'secondary',
                        chapters: 'Ch 2, 4, 7', 
                        time: '2-3 hours', 
                        outcomes: 'Session management, learner engagement, evaluation review' 
                      },
                      { 
                        role: 'Implementation Consultant', 
                        badge: 'primary',
                        chapters: 'All + Appendices', 
                        time: '12+ hours', 
                        outcomes: 'Full configuration, migration support, integration setup' 
                      },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="p-3">
                          <Badge variant={row.badge as 'default' | 'secondary' | 'outline'}>{row.role}</Badge>
                        </td>
                        <td className="p-3 font-mono text-xs">{row.chapters}</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {row.time}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{row.outcomes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Scope */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-600" />
            Document Scope
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  In Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'LMS configuration (categories, courses, modules, lessons)',
                    'Course hierarchy and content management',
                    'Quiz and assessment configuration',
                    'Learning path design and enrollment',
                    'Compliance training and recertification',
                    'SCORM/xAPI package management',
                    'Gamification (badges, points, leaderboards)',
                    'Training request workflows',
                    'External training agency management',
                    'Budget and cost tracking',
                    'Analytics and reporting',
                    'Cross-module integration triggers',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  Out of Scope (See Related Manuals)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    { item: 'Competency framework definition', ref: 'See Performance Manual' },
                    { item: 'Job architecture and position management', ref: 'See Workforce Manual' },
                    { item: 'Career path configuration', ref: 'See Career Development Manual' },
                    { item: 'Succession planning integration', ref: 'See Succession Manual' },
                    { item: 'Performance appraisal triggers', ref: 'See Appraisals Manual' },
                    { item: 'Onboarding task configuration', ref: 'See HR Hub Manual' },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <div>
                        <span>{item.item}</span>
                        <span className="text-xs text-muted-foreground ml-2">({item.ref})</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enterprise Differentiators */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            Enterprise Differentiators
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Industry-Standard 3-Tier Hierarchy',
                icon: Layers,
                color: 'emerald',
                desc: 'Course → Module → Lesson structure aligns with enterprise LMS patterns (Workday, SAP SuccessFactors)',
                features: ['Flexible content organization', 'Reusable module library', 'Granular progress tracking'],
              },
              {
                title: 'Multi-Source Gap Detection',
                icon: BarChart3,
                color: 'blue',
                desc: 'AI analyzes competency gaps from appraisals, self-assessments, and career goals',
                features: ['Automated training suggestions', 'Competency-course mapping', 'Personalized learning paths'],
              },
              {
                title: 'Gamification Engine',
                icon: Award,
                color: 'purple',
                desc: 'Badges, points, and leaderboards drive learner engagement and completion',
                features: ['Achievement tracking', 'Point transactions', 'Configurable rewards'],
              },
              {
                title: 'External Agency Management',
                icon: Building,
                color: 'amber',
                desc: 'Legacy-parity feature for managing external training providers and sessions',
                features: ['Agency profiles', 'Course scheduling', 'Cost tracking'],
              },
            ].map((diff, idx) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 bg-${diff.color}-500/10 rounded-lg`}>
                      <diff.icon className={`h-5 w-5 text-${diff.color}-600`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{diff.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{diff.desc}</p>
                      <ul className="mt-2 space-y-1">
                        {diff.features.map((f, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <TipCallout title="Quick Navigation">
          <p className="mb-2">Jump to key sections based on your role:</p>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li><strong>New to L&D?</strong> → Start with Section 1.2 (Core Concepts)</li>
            <li><strong>Setting up LMS?</strong> → Jump to Chapter 2 (Setup Guide)</li>
            <li><strong>Managing compliance?</strong> → See Chapter 5 (Compliance)</li>
            <li><strong>Running reports?</strong> → Check Chapter 7 (Analytics)</li>
          </ul>
        </TipCallout>

        <InfoCallout title="Version Information">
          This manual documents <strong>Intelli HRM L&D Module v1.0</strong> (Pre-Release). 
          Feature availability may vary based on your organization's license tier and regional configuration.
        </InfoCallout>
      </section>
    </div>
  );
}
