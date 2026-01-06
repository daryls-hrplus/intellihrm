import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, Target, Users, Shield, CheckCircle, Lightbulb, 
  Building, Clock, GraduationCap, FileText, HelpCircle, Lock, Star
} from 'lucide-react';
import { FeatureStatusBadge } from '../../components';

export function AdminOverviewIntroduction() {
  return (
    <Card id="admin-sec-1-1" data-manual-anchor="admin-sec-1-1">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.1</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">Introduction to Admin & Security in HRplus</CardTitle>
        <CardDescription>
          Executive summary, business value, and key differentiators
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
                The HRplus Admin & Security module is the foundational layer of your HRMS, 
                providing comprehensive organization structure management, role-based access control, 
                and security governance. It ensures your HR data is protected while enabling efficient operations 
                across the Caribbean, Africa, and global regions.
              </p>
              <div className="mt-4 grid md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-background rounded-lg relative">
                  <div className="absolute -top-2 -right-2">
                    <FeatureStatusBadge status="implemented" size="sm" />
                  </div>
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-muted-foreground">Audit trail coverage</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg relative">
                  <div className="absolute -top-2 -right-2">
                    <FeatureStatusBadge status="recommended" size="sm" />
                  </div>
                  <div className="text-2xl font-bold text-primary">99.9%</div>
                  <div className="text-xs text-muted-foreground">Uptime SLA Target</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg relative">
                  <div className="absolute -top-2 -right-2">
                    <FeatureStatusBadge status="recommended" size="sm" />
                  </div>
                  <div className="text-2xl font-bold text-primary">SOC 2</div>
                  <div className="text-xs text-muted-foreground">Alignment Goal</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg relative">
                  <div className="absolute -top-2 -right-2">
                    <FeatureStatusBadge status="recommended" size="sm" />
                  </div>
                  <div className="text-2xl font-bold text-primary">ISO 42001</div>
                  <div className="text-xs text-muted-foreground">AI Governance Goal</div>
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
              Enterprise HR systems require robust administration and security foundations. Without 
              proper governance, organizations face data breaches, compliance violations, and 
              operational inefficiencies. The HRplus Admin & Security module addresses these challenges:
            </p>
            <ul className="space-y-3 list-none pl-0">
              {[
                { text: 'Role-Based Permissions (RBP) ensuring least-privilege access across all modules', status: 'implemented' as const },
                { text: 'Multi-level organization hierarchy supporting global, regional, and local operations', status: 'implemented' as const },
                { text: 'Comprehensive audit trails meeting SOC 2, GDPR, and regional compliance requirements', status: 'implemented' as const },
                { text: 'AI governance framework with ISO 42001 alignment for responsible AI deployment', status: 'implemented' as const },
                { text: 'Single sign-on (SSO) and multi-factor authentication (MFA) for enterprise security', status: 'implemented' as const }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">{item.text}</span>
                  <FeatureStatusBadge status={item.status} size="sm" />
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
            This manual serves different administrator roles with varying responsibilities. 
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
                  { role: 'Super Admin', primary: 'All Sections', responsibilities: 'Full system governance, compliance oversight', time: '6-8 hours' },
                  { role: 'Security Admin', primary: 'Sections 3, 4, 6, 7', responsibilities: 'Access control, security monitoring', time: '4-5 hours' },
                  { role: 'HR Admin', primary: 'Sections 2, 3, 5', responsibilities: 'User management, org structure', time: '3-4 hours' },
                  { role: 'Implementation Consultant', primary: 'All Sections', responsibilities: 'Full deployment, configuration', time: '8-10 hours' },
                  { role: 'Module Admin', primary: 'Sections 1, 3, 8', responsibilities: 'Module-specific operations', time: '2-3 hours' }
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
                'Organization hierarchy from territories to sections',
                'Role-based permissions and access control',
                'Security policies (SSO, MFA, password management)',
                'User account management and provisioning',
                'Audit logging and compliance reporting',
                'AI governance and ISO 42001 alignment',
                'System configuration and customization'
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
                { topic: 'Job architecture configuration', link: 'Workforce Administrator Manual' },
                { topic: 'Position management', link: 'Workforce Administrator Manual' },
                { topic: 'Performance appraisals', link: 'Appraisals Administrator Manual' },
                { topic: 'Compensation planning', link: 'Compensation Administrator Manual' },
                { topic: 'Payroll processing', link: 'Payroll Administrator Manual' }
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
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">Enterprise-Grade Security</h4>
                      <FeatureStatusBadge status="implemented" size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comprehensive audit trails, MFA enforcement, and SSO integration 
                      for enterprise identity providers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">Granular Access Control</h4>
                      <FeatureStatusBadge status="implemented" size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Role-Based Permissions (RBP) at module, tab, action, and field levels. 
                      PII masking and data classification for sensitive information.
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
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">Regional Compliance</h4>
                      <FeatureStatusBadge status="recommended" size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Built-in support for Caribbean, African, and global compliance. 
                      GDPR, local data protection laws, and industry-specific requirements.
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
                  'Explain the purpose and business value of Admin & Security',
                  'Describe the administrator hierarchy and permission model',
                  'Identify the core security domains and their risk levels',
                  'Match administrator personas to their primary workflows',
                  'Outline the annual security compliance calendar'
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
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border-l-4 border-l-green-500 bg-muted/50 rounded-r-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-foreground">Implemented</span>
                  <p className="text-xs text-muted-foreground mt-1">Feature exists in the HRplus system</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
              <div className="flex items-start gap-2">
                <Star className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-foreground">Recommended</span>
                  <p className="text-xs text-muted-foreground mt-1">Industry best practice or operational guidance</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-foreground">Tip/Best Practice</span>
                  <p className="text-xs text-muted-foreground mt-1">Recommendations and helpful hints</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 border-l-4 border-l-red-500 bg-muted/50 rounded-r-lg">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-foreground">Warning/Caution</span>
                  <p className="text-xs text-muted-foreground mt-1">Important considerations to avoid issues</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-l-4 border-l-purple-500 bg-muted/50 rounded-r-lg">
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <span className="font-semibold text-sm text-foreground">Industry Standard</span>
                  <p className="text-xs text-muted-foreground mt-1">Alignment with industry best practices</p>
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
