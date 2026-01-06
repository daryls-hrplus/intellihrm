import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Calendar, CheckCircle, AlertTriangle, FileCheck,
  Shield, Users, Eye, RefreshCw, Star
} from 'lucide-react';
import { FeatureStatusBadge } from '../../components';

export function AdminOverviewSecurityCalendar() {
  return (
    <Card id="admin-sec-1-5" data-manual-anchor="admin-sec-1-5">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.5</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">Security Compliance Calendar</CardTitle>
        <CardDescription>
          Annual security review cycle, quarterly certifications, and monthly audit checks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Section Status Indicator */}
        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1 flex items-center gap-2">
                Operational Best Practices
                <FeatureStatusBadge status="recommended" size="sm" />
              </h4>
              <p className="text-sm text-muted-foreground">
                This section describes recommended security operational practices. HRplus provides the 
                tools (dashboards, audit logs, reporting) to support these activities, but the cadence 
                and processes should be adapted to your organization's needs and compliance requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Why a Security Calendar?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Enterprise security is not a one-time setup but an ongoing process. SOC 2 Type II, 
                ISO 27001, and GDPR all require continuous monitoring and periodic reviews. This 
                calendar ensures your organization maintains compliance and proactively addresses 
                security concerns.
              </p>
            </div>
          </div>
        </div>

        {/* Annual Cycle Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Annual Security Cycle
            <FeatureStatusBadge status="recommended" size="sm" />
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                quarter: 'Q1',
                title: 'Planning & Policy Review',
                color: 'border-blue-500 bg-blue-500/5',
                activities: [
                  'Annual security policy review',
                  'Risk assessment update',
                  'Training plan development',
                  'Budget allocation'
                ]
              },
              {
                quarter: 'Q2',
                title: 'Access Certification',
                color: 'border-green-500 bg-green-500/5',
                activities: [
                  'Full access certification',
                  'Privilege audit',
                  'Dormant account cleanup',
                  'Role optimization'
                ]
              },
              {
                quarter: 'Q3',
                title: 'Security Assessment',
                color: 'border-amber-500 bg-amber-500/5',
                activities: [
                  'Vulnerability assessment',
                  'Penetration testing',
                  'Incident response drill',
                  'Backup verification'
                ]
              },
              {
                quarter: 'Q4',
                title: 'Audit & Compliance',
                color: 'border-purple-500 bg-purple-500/5',
                activities: [
                  'External audit support',
                  'Compliance certification',
                  'Year-end reporting',
                  'Next year planning'
                ]
              }
            ].map((q, i) => (
              <Card key={i} className={`border-l-4 ${q.color}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{q.quarter}</Badge>
                    <span className="font-medium text-sm">{q.title}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {q.activities.map((activity, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Monthly Activities */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Monthly Security Activities
            <FeatureStatusBadge status="recommended" size="sm" />
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Activity</th>
                  <th className="border p-3 text-left font-medium">Owner</th>
                  <th className="border p-3 text-left font-medium">Description</th>
                  <th className="border p-3 text-left font-medium">Output</th>
                  <th className="border p-3 text-center font-medium">System Support</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { 
                    activity: 'Security Dashboard Review', 
                    owner: 'Security Admin',
                    description: 'Review failed logins, permission changes, suspicious activity',
                    output: 'Monthly security report',
                    systemSupport: 'implemented' as const
                  },
                  { 
                    activity: 'Access Request Audit', 
                    owner: 'Security Admin',
                    description: 'Verify all approved requests were appropriate',
                    output: 'Access audit log',
                    systemSupport: 'implemented' as const
                  },
                  { 
                    activity: 'New User Review', 
                    owner: 'HR Admin',
                    description: 'Confirm new accounts have correct permissions',
                    output: 'New user checklist',
                    systemSupport: 'implemented' as const
                  },
                  { 
                    activity: 'Termination Audit', 
                    owner: 'HR Admin',
                    description: 'Verify terminated users had access revoked',
                    output: 'Termination compliance report',
                    systemSupport: 'implemented' as const
                  },
                  { 
                    activity: 'Password Policy Check', 
                    owner: 'Security Admin',
                    description: 'Review password expiration and compliance',
                    output: 'Password health report',
                    systemSupport: 'implemented' as const
                  }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-3 font-medium">{row.activity}</td>
                    <td className="border p-3 text-muted-foreground">{row.owner}</td>
                    <td className="border p-3 text-muted-foreground">{row.description}</td>
                    <td className="border p-3 text-muted-foreground">{row.output}</td>
                    <td className="border p-3 text-center">
                      <FeatureStatusBadge status={row.systemSupport} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Weekly Activities */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Weekly Monitoring Checklist
            <FeatureStatusBadge status="recommended" size="sm" />
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { task: 'Review failed login attempts', icon: AlertTriangle, priority: 'High', systemSupport: 'implemented' as const },
              { task: 'Check pending access requests', icon: Users, priority: 'High', systemSupport: 'implemented' as const },
              { task: 'Review permission change logs', icon: Shield, priority: 'Medium', systemSupport: 'implemented' as const },
              { task: 'Monitor AI usage patterns', icon: Eye, priority: 'Medium', systemSupport: 'implemented' as const },
              { task: 'Verify backup completion', icon: CheckCircle, priority: 'High', systemSupport: 'recommended' as const },
              { task: 'Check security alerts', icon: AlertTriangle, priority: 'High', systemSupport: 'implemented' as const }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <item.icon className={`h-5 w-5 ${
                  item.priority === 'High' ? 'text-red-500' : 'text-amber-500'
                }`} />
                <span className="flex-1 text-sm">{item.task}</span>
                <FeatureStatusBadge status={item.systemSupport} size="sm" />
                <Badge variant={item.priority === 'High' ? 'destructive' : 'outline'} className="text-xs">
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Compliance Requirements */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Compliance Requirements by Framework
            <FeatureStatusBadge status="recommended" size="sm" />
          </h3>
          <div className="space-y-4">
            {[
              {
                framework: 'SOC 2 Type II',
                requirements: [
                  'Quarterly access reviews',
                  'Annual penetration testing',
                  'Continuous monitoring',
                  '90-day log retention minimum'
                ],
                frequency: 'Annual certification'
              },
              {
                framework: 'ISO 27001',
                requirements: [
                  'Risk assessment updates',
                  'Management review meetings',
                  'Internal audits',
                  'Corrective action tracking'
                ],
                frequency: 'Annual surveillance'
              },
              {
                framework: 'GDPR',
                requirements: [
                  'Data processing inventory',
                  'Privacy impact assessments',
                  'Data subject request handling',
                  '72-hour breach notification'
                ],
                frequency: 'Continuous compliance'
              },
              {
                framework: 'ISO 42001 (AI)',
                requirements: [
                  'AI risk assessments',
                  'Bias monitoring',
                  'Model governance',
                  'Human oversight verification'
                ],
                frequency: 'Continuous + Annual'
              }
            ].map((fw, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span className="font-medium">{fw.framework}</span>
                  </div>
                  <Badge variant="outline">{fw.frequency}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fw.requirements.map((req, j) => (
                    <Badge key={j} variant="secondary" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Standard Callout */}
        <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-2">
            <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-sm text-foreground">Industry Standard</span>
              <p className="text-sm text-muted-foreground mt-1">
                This security calendar aligns with enterprise best practices. The quarterly access 
                certification cycle is required by most financial services regulators and is a 
                SOC 2 Type II requirement.
              </p>
            </div>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="p-4 border-l-4 border-l-amber-500 bg-amber-500/5 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-sm text-foreground">Important</span>
              <p className="text-sm text-muted-foreground mt-1">
                Missed security activities can result in compliance gaps that may only be discovered 
                during audits. Set up automated reminders and assign clear ownership for each activity. 
                The system can generate alerts for overdue tasks.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
