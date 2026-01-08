import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, Target, Users, Layers, CheckCircle, Lightbulb, 
  Building, Clock, GraduationCap, FileText, HelpCircle
} from 'lucide-react';

export function OverviewIntroduction() {
  return (
    <Card id="sec-1-1">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.1</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl">Introduction to Appraisals in Intelli HRM</CardTitle>
        <CardDescription>
          Purpose, positioning, and key differentiators of the Appraisals module
        </CardDescription>
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
                The Intelli HRM Appraisals module is an enterprise-grade performance evaluation system designed 
                to support organizations in conducting fair, transparent, and developmentally-focused 
                performance reviews. Built with AI-first principles, it goes beyond traditional performance 
                management to provide predictive insights, automated workflows, and seamless integration 
                across the entire HR ecosystem.
              </p>
              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">40%</div>
                  <div className="text-xs text-muted-foreground">Reduction in evaluation cycle time</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">85%</div>
                  <div className="text-xs text-muted-foreground">Manager satisfaction with AI assistance</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-xs text-muted-foreground">Audit compliance rate</div>
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
              Performance management is a critical driver of organizational success, yet many enterprises 
              struggle with inconsistent evaluations, manager bias, and disconnected HR processes. The 
              Intelli HRM Appraisals module addresses these challenges by providing:
            </p>
            <ul className="space-y-2 list-none pl-0">
              {[
                'Standardized evaluation frameworks that ensure consistency across departments and regions',
                'AI-powered feedback generation that helps managers write better, more actionable reviews',
                'Automated integration with downstream systems (Compensation, Succession, Learning) to drive action',
                'Calibration tools that reduce rating inflation and ensure fair distribution',
                'Comprehensive audit trails for regulatory compliance and dispute resolution'
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
            This manual serves different audiences with varying needs. Use the matrix below to identify 
            the sections most relevant to your role:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Role</th>
                  <th className="border p-3 text-left font-medium">Primary Sections</th>
                  <th className="border p-3 text-left font-medium">Optional Sections</th>
                  <th className="border p-3 text-left font-medium">Time Investment</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'HR Administrator', primary: 'Sections 2, 3, 7', optional: 'Sections 4, 5, 6', time: '4-6 hours' },
                  { role: 'HRIS Specialist', primary: 'Sections 1.3, 2, 6', optional: 'Section 7', time: '3-4 hours' },
                  { role: 'HR Business Partner', primary: 'Sections 1, 3, 4', optional: 'Sections 5, 6', time: '2-3 hours' },
                  { role: 'Implementation Consultant', primary: 'All Sections', optional: 'N/A', time: '6-8 hours' },
                  { role: 'Executive Sponsor', primary: 'Sections 1.1, 1.2, 5', optional: 'Section 6', time: '1 hour' }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-3 font-medium">{row.role}</td>
                    <td className="border p-3 text-muted-foreground">{row.primary}</td>
                    <td className="border p-3 text-muted-foreground">{row.optional}</td>
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
                'Appraisal cycle configuration and management',
                'Rating scale and form template setup',
                'Participant enrollment and evaluation workflows',
                'Calibration sessions and forced distribution',
                'AI-assisted feedback and analytics',
                'Integration with Nine-Box, Succession, Compensation',
                'Reporting and compliance requirements'
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
                { topic: 'Goals module configuration', link: 'Goals Administrator Manual' },
                { topic: 'Competency framework design', link: 'Competency Management Guide' },
                { topic: 'Compensation planning', link: 'Compensation Administrator Manual' },
                { topic: 'Succession pool management', link: 'Succession Planning Guide' },
                { topic: 'Learning path creation', link: 'LMS Administrator Manual' }
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
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">AI-First Design</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Embedded intelligence for feedback generation, bias detection, and predictive analytics. 
                      AI assists at every step, from writing comments to identifying calibration anomalies.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Layers className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Cross-Module Orchestration</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automatic data flow to Succession, Compensation, Learning, and more. Appraisal outcomes 
                      trigger downstream actions without manual intervention.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Building className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium">Regional Compliance</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Built-in support for Caribbean, African, and global labor law requirements. Country-specific 
                      configurations for probation reviews and termination processes.
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
                After completing Section 1, you will be able to:
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  'Explain the purpose and business value of the Appraisals module',
                  'Describe the CRGV model and how component weights affect overall scores',
                  'Identify the core database tables and their relationships',
                  'Match user personas to their primary workflows and access levels',
                  'Outline the annual performance management calendar and key milestones'
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

        {/* Document Conventions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Document Conventions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-foreground">Tip/Best Practice</span>
                  <p className="text-xs text-muted-foreground mt-1">Recommendations and helpful hints</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-l-4 border-l-red-500 bg-muted/50 rounded-r-lg">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-foreground">Warning/Caution</span>
                  <p className="text-xs text-muted-foreground mt-1">Important considerations to avoid issues</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-foreground">Industry Standard</span>
                  <p className="text-xs text-muted-foreground mt-1">Alignment with enterprise best practices</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-l-4 border-l-gray-400 bg-muted/50 rounded-r-lg">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-foreground">System Path</span>
                  <p className="text-xs text-muted-foreground mt-1">Navigation breadcrumbs to find features</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
