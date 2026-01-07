import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, Target, Users, CheckCircle, Lightbulb, 
  Building2, Clock, GraduationCap, FileText, HelpCircle, 
  Briefcase, Network, UserCheck, TrendingUp, Shield, Brain
} from 'lucide-react';

export function WorkforceOverviewIntroduction() {
  return (
    <Card id="wf-sec-1-1" data-manual-anchor="wf-sec-1-1" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.1</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">Introduction to Workforce in HRplus</CardTitle>
        <CardDescription>Executive summary, business value, and key differentiators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Executive Summary */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
              <p className="text-muted-foreground leading-relaxed">
                The HRplus Workforce module is the foundational core of your HRMS, managing the complete 
                organizational structure from territories to individual employee records. It provides 
                position-based headcount control, comprehensive job architecture, and seamless employee 
                lifecycle management across the Caribbean, Africa, and global regions.
              </p>
              <div className="mt-4 grid md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">10</div>
                  <div className="text-xs text-muted-foreground">Org Hierarchy Levels</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-muted-foreground">Position Control</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">ESS/MSS</div>
                  <div className="text-xs text-muted-foreground">Self-Service</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">AI</div>
                  <div className="text-xs text-muted-foreground">Workforce Forecasting</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Value Statement */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Business Value Statement
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="mb-4">
              Effective workforce management is the cornerstone of HR operations. Without a solid foundation, 
              organizations struggle with data inconsistencies, compliance gaps, and operational inefficiencies. 
              The HRplus Workforce module delivers:
            </p>
            <ul className="space-y-3 list-none pl-0">
              {[
                'Multi-level organization hierarchy from territories to sections with inheritance',
                'Comprehensive job architecture with job families, jobs, competencies, and positions',
                'Position-based headcount control aligned with financial budgets',
                'Complete employee lifecycle from recruitment through offboarding',
                'AI-powered workforce forecasting and scenario planning',
                'ESS/MSS self-service for employees and managers'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Target Audience Matrix */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Target Audience Matrix
          </h3>
          <p className="text-muted-foreground mb-4">
            This manual serves different workforce roles with varying responsibilities. 
            Use the matrix below to identify the sections most relevant to your role:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Role</th>
                  <th className="border p-3 text-left font-medium">Primary Sections</th>
                  <th className="border p-3 text-left font-medium">Key Responsibilities</th>
                  <th className="border p-3 text-left font-medium">Time Investment</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'Super Admin', primary: 'All Sections', responsibilities: 'Full system configuration, territories, governance', time: '8-10 hours' },
                  { role: 'HR Admin', primary: 'Sections 2-7', responsibilities: 'Org structure, job architecture, positions', time: '6-8 hours' },
                  { role: 'HR Ops', primary: 'Sections 4-5', responsibilities: 'Employee records, lifecycle processes', time: '4-5 hours' },
                  { role: 'Workforce Planner', primary: 'Sections 6-7', responsibilities: 'Headcount planning, forecasting', time: '3-4 hours' },
                  { role: 'Manager (MSS)', primary: 'Section 8', responsibilities: 'Team management, approvals', time: '1-2 hours' },
                  { role: 'Employee (ESS)', primary: 'Section 8', responsibilities: 'Profile updates, self-service', time: '30 min' }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-3 font-medium">{row.role}</td>
                    <td className="border p-3 text-muted-foreground">{row.primary}</td>
                    <td className="border p-3 text-muted-foreground">{row.responsibilities}</td>
                    <td className="border p-3 text-muted-foreground">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Document Scope */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              What This Manual Covers
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                'Organization hierarchy (territories to sections)',
                'Job architecture (families, jobs, positions)',
                'Skills, competencies, and qualifications',
                'Employee records and assignments',
                'Onboarding and offboarding workflows',
                'Position control and headcount management',
                'Workforce analytics and forecasting',
                'ESS and MSS self-service features'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              What This Manual Does NOT Cover
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { topic: 'User accounts and authentication', link: 'Admin & Security Manual' },
                { topic: 'Role-based permissions (RBAC)', link: 'Admin & Security Manual' },
                { topic: 'Performance appraisals', link: 'Appraisals Administrator Manual' },
                { topic: 'Compensation planning', link: 'Compensation Manual' },
                { topic: 'Payroll processing', link: 'Payroll Manual' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{item.topic} → <span className="text-primary underline cursor-pointer">{item.link}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        {/* Key Differentiators */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Key Differentiators</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Network className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Multi-Level Hierarchy</h4>
                    <p className="text-sm text-muted-foreground">
                      10 organizational levels from territories to sections with full 
                      inheritance and compliance boundaries.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <UserCheck className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Position Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Budget-aligned position management with vacancy tracking, 
                      headcount requests, and approval workflows.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Brain className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">AI-Powered Forecasting</h4>
                    <p className="text-sm text-muted-foreground">
                      Predictive workforce modeling with scenario planning 
                      and attrition prediction.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Learning Objectives */}
        <div className="p-6 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-3">Learning Objectives</h3>
              <p className="text-sm text-muted-foreground mb-3">
                After completing Part 1, you will be able to:
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Explain the purpose and business value of the Workforce module',
                  'Describe the organization hierarchy model and data relationships',
                  'Differentiate between jobs, positions, and employee assignments',
                  'Identify the key user personas and their primary workflows',
                  'Outline the annual workforce management calendar'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 text-xs font-medium">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
