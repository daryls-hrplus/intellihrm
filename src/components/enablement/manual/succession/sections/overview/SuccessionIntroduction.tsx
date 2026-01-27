import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Shield, 
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Info,
  Clock,
  Building2,
  Globe,
  BarChart3,
  Zap
} from 'lucide-react';

export function SuccessionIntroduction() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">1.1 Introduction & Business Value</h3>
        <p className="text-muted-foreground mt-1">
          Executive summary, strategic value proposition, and document scope
        </p>
      </div>

      {/* Executive Summary */}
      <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg leading-relaxed">
            The <strong>Succession Planning Module</strong> is Intelli HRM's enterprise-grade solution for 
            identifying, developing, and retaining future leaders. Built on industry standards from 
            SAP SuccessFactors and Workday, it provides configurable Nine-Box assessments, multi-assessor 
            readiness frameworks, and AI-powered talent analytics—all integrated with your existing 
            HR ecosystem.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-background/80 rounded-lg p-4 text-center border">
              <div className="text-3xl font-bold text-orange-600">29</div>
              <div className="text-sm text-muted-foreground">Database Tables</div>
            </div>
            <div className="bg-background/80 rounded-lg p-4 text-center border">
              <div className="text-3xl font-bold text-orange-600">13</div>
              <div className="text-sm text-muted-foreground">UI Pages</div>
            </div>
            <div className="bg-background/80 rounded-lg p-4 text-center border">
              <div className="text-3xl font-bold text-orange-600">7</div>
              <div className="text-sm text-muted-foreground">Setup Tabs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Value Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Business Value & ROI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Challenge Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                The Challenge
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>86% of organizations lack a formal succession plan for critical roles (SHRM 2024)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Average cost of executive turnover: 200-400% of annual salary</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>35% of high-potentials leave within 2 years due to lack of development visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>Manual succession tracking leads to outdated plans and missed talent signals</span>
                </li>
              </ul>
            </div>

            {/* Solution Column */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                The Intelli HRM Solution
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Configurable Nine-Box with multi-source data (appraisals, goals, 360 feedback)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Multi-assessor readiness framework with weighted indicators</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Real-time flight risk detection with retention action tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Automated bench strength analysis with development gap linking</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ROI Metrics */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Industry Benchmarks & Expected Outcomes
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">+23%</div>
                <div className="text-xs text-muted-foreground">Internal Fill Rate</div>
                <div className="text-xs text-muted-foreground/70">vs. 12% industry avg</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">-40%</div>
                <div className="text-xs text-muted-foreground">Time-to-Productivity</div>
                <div className="text-xs text-muted-foreground/70">for internal promotions</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">+31%</div>
                <div className="text-xs text-muted-foreground">HiPo Retention</div>
                <div className="text-xs text-muted-foreground/70">3-year retention rate</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">-55%</div>
                <div className="text-xs text-muted-foreground">Critical Vacancy Time</div>
                <div className="text-xs text-muted-foreground/70">with ready successors</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Source: SHRM Talent Management Study 2024, Center for Creative Leadership, Bersin by Deloitte
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Target Audience Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Target Audience Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Role</th>
                  <th className="text-left p-3 font-semibold">Primary Sections</th>
                  <th className="text-center p-3 font-semibold">Time Investment</th>
                  <th className="text-left p-3 font-semibold">Key Outcomes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/30">
                      HR Administrator
                    </Badge>
                  </td>
                  <td className="p-3">Parts 1-10 (All)</td>
                  <td className="p-3 text-center">8-10 hours</td>
                  <td className="p-3">End-to-end succession management, configuration mastery</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                      Manager (MSS)
                    </Badge>
                  </td>
                  <td className="p-3">Parts 1, 5-6, 8</td>
                  <td className="p-3 text-center">3-4 hours</td>
                  <td className="p-3">Team succession planning, candidate nomination</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30">
                      Executive
                    </Badge>
                  </td>
                  <td className="p-3">Parts 1, 7, 10</td>
                  <td className="p-3 text-center">1-2 hours</td>
                  <td className="p-3">Strategic oversight, calibration participation</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                      Implementation Consultant
                    </Badge>
                  </td>
                  <td className="p-3">All Parts + Appendices</td>
                  <td className="p-3 text-center">10+ hours</td>
                  <td className="p-3">Full module deployment, client enablement</td>
                </tr>
                <tr>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-700 border-teal-500/30">
                      Employee (ESS)
                    </Badge>
                  </td>
                  <td className="p-3">Part 8 (Career Paths)</td>
                  <td className="p-3 text-center">30 min</td>
                  <td className="p-3">Career path awareness, development visibility</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Document Scope */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-green-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              This Manual Covers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Nine-Box assessment configuration (5 tables, rating sources, signal mappings)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Readiness assessment framework (forms, indicators, scoring bands)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Talent pool management and review packet generation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Succession plan creation, candidate ranking, and development linking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Flight risk assessment and retention action tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Career path design and mentorship program configuration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Cross-module integration (Performance, 360, Learning, Workforce)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Bench strength analytics and succession reporting</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              Out of Scope (See Related Manuals)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Performance Appraisal cycle configuration (see Appraisals Manual)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>360 Feedback cycle setup (see 360 Feedback Manual)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Goal management and OKR configuration (see Goals Manual)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Learning course creation and IDP templates (see L&D Manual)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Compensation planning and merit cycles (see Compensation Manual)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Job architecture and position management (see Workforce Manual)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">→</span>
                <span>Competency framework setup (see Competencies section)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Enterprise Differentiators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Intelli HRM Enterprise Differentiators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Configurable Nine-Box Engine</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Multi-source rating with customizable weights. Pull from appraisals, goals, 360 feedback, 
                  or manual assessments with company-specific signal mappings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Multi-Assessor Readiness</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Manager, HR, and Executive assessors provide independent readiness ratings. 
                  Configurable indicator weights and automated score-to-band calculations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Cross-Module Talent Signals</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Automatic data flow from Performance, 360, Goals, and Competencies. 
                  Real-time updates when source data changes—no manual sync required.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Regional Compliance Support</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Caribbean, Africa, and global configurations. Company-specific readiness bands, 
                  labels, and assessment forms with multi-language support.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Upon completing this manual, administrators will be able to:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Configure Nine-Box rating sources and signal mappings for accurate talent placement',
              'Design and deploy multi-assessor readiness assessment frameworks',
              'Create and manage talent pools with automated member management',
              'Build succession plans with candidate ranking and development linking',
              'Implement flight risk monitoring with configurable risk factors',
              'Set up career paths and mentorship programs for talent development',
              'Integrate succession data with Performance, 360, and Learning modules',
              'Generate bench strength reports and succession analytics dashboards',
            ].map((objective, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                <Badge variant="outline" className="shrink-0 mt-0.5">
                  {index + 1}
                </Badge>
                <span className="text-sm">{objective}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Conventions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            Document Conventions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Throughout this manual, the following callout types are used:
          </p>
          
          <div className="space-y-3">
            <Alert className="border-blue-500/30 bg-blue-500/5">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-700">Info</AlertTitle>
              <AlertDescription className="text-blue-600/80">
                Additional context or background information to enhance understanding.
              </AlertDescription>
            </Alert>

            <Alert className="border-amber-500/30 bg-amber-500/5">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-700">Tip</AlertTitle>
              <AlertDescription className="text-amber-600/80">
                Best practices and recommendations from implementation experience.
              </AlertDescription>
            </Alert>

            <Alert className="border-orange-500/30 bg-orange-500/5">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-700">Warning</AlertTitle>
              <AlertDescription className="text-orange-600/80">
                Important considerations that may affect configuration outcomes.
              </AlertDescription>
            </Alert>

            <Alert className="border-destructive/30 bg-destructive/5">
              <Shield className="h-4 w-4 text-destructive" />
              <AlertTitle className="text-destructive">Critical</AlertTitle>
              <AlertDescription className="text-destructive/80">
                Security or data integrity considerations requiring immediate attention.
              </AlertDescription>
            </Alert>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Navigation Path Format</h4>
            <p className="text-xs text-muted-foreground">
              System paths are shown as: <code className="bg-background px-1.5 py-0.5 rounded text-xs">
              Module → Section → Action</code>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Example: <code className="bg-background px-1.5 py-0.5 rounded text-xs">
              Succession → Setup → Assessor Types</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
