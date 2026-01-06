import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Layers, Shield, Users, Key, Lock, Eye, 
  Building, FileCheck, AlertTriangle
} from 'lucide-react';

export function AdminOverviewCoreConcepts() {
  return (
    <Card id="admin-sec-1-2" data-manual-anchor="admin-sec-1-2">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.2</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>15 min read</span>
        </div>
        <CardTitle className="text-2xl">Core Concepts & Terminology</CardTitle>
        <CardDescription>
          Administrator hierarchy, permission model, security domains, and key definitions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Administrator Hierarchy */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Administrator Hierarchy
          </h3>
          <p className="text-muted-foreground mb-4">
            HRplus implements a tiered administrator model following the principle of least privilege. 
            Each level has specific capabilities and restrictions:
          </p>
          <div className="grid gap-4">
            {[
              {
                level: 'Level 1',
                title: 'Super Admin',
                color: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400',
                icon: Shield,
                capabilities: ['Full system access', 'Emergency break-glass', 'SSO configuration', 'AI governance', 'Compliance oversight'],
                restrictions: ['Actions fully audited', 'MFA required', 'Limited to 1-2 per organization']
              },
              {
                level: 'Level 2',
                title: 'Security Admin',
                color: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400',
                icon: Lock,
                capabilities: ['Role management', 'Permission configuration', 'Access certification', 'Security monitoring', 'Audit log review'],
                restrictions: ['Cannot modify own permissions', 'Cannot access AI governance', 'Requires Super Admin approval for sensitive changes']
              },
              {
                level: 'Level 3',
                title: 'HR Admin',
                color: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400',
                icon: Users,
                capabilities: ['User account management', 'Module configuration', 'Reporting & analytics', 'Workflow management', 'Notification settings'],
                restrictions: ['Cannot modify security policies', 'Limited PII access', 'Cannot create admin roles']
              },
              {
                level: 'Level 4',
                title: 'Module Admin',
                color: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400',
                icon: Layers,
                capabilities: ['Module-specific configuration', 'Module reporting', 'User support within module'],
                restrictions: ['Access limited to assigned modules', 'Cannot modify org structure', 'Reports to HR Admin or Security Admin']
              }
            ].map((admin, i) => (
              <div key={i} className={`p-4 rounded-lg border ${admin.color}`}>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant="outline" className="text-xs">{admin.level}</Badge>
                    <admin.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{admin.title}</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Capabilities:</span>
                        <ul className="mt-1 space-y-1 text-muted-foreground">
                          {admin.capabilities.map((cap, j) => (
                            <li key={j} className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-green-500" />
                              {cap}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Restrictions:</span>
                        <ul className="mt-1 space-y-1 text-muted-foreground">
                          {admin.restrictions.map((res, j) => (
                            <li key={j} className="flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-500" />
                              {res}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Permission Model */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Permission Model (Role-Based Permissions)
          </h3>
          <p className="text-muted-foreground mb-4">
            HRplus uses a Role-Based Permission (RBP) model aligned with enterprise security 
            best practices. Permissions are granted at multiple levels:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Permission Level</th>
                  <th className="border p-3 text-left font-medium">Description</th>
                  <th className="border p-3 text-left font-medium">Example</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { level: 'Module', description: 'Access to entire functional modules', example: 'Access to Workforce, Payroll, or Performance' },
                  { level: 'Tab', description: 'Access to specific tabs within a module', example: 'Can view Employees tab but not Transactions tab' },
                  { level: 'Action (CRUD)', description: 'Create, Read, Update, Delete operations', example: 'Can view employees but cannot edit' },
                  { level: 'Field', description: 'Access to specific data fields', example: 'Cannot see salary or banking fields' },
                  { level: 'Record', description: 'Access to specific records based on criteria', example: 'Can only see employees in own department' }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-3 font-medium">{row.level}</td>
                    <td className="border p-3 text-muted-foreground">{row.description}</td>
                    <td className="border p-3 text-muted-foreground">{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Industry Standard Callout */}
          <div className="mt-4 p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
            <div className="flex items-start gap-2">
              <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-sm text-foreground">Industry Standard</span>
                <p className="text-sm text-muted-foreground mt-1">
                  This RBP model follows enterprise-grade permission patterns. Permissions are 
                  additive—users receive the union of all permissions from their assigned roles.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Security Domains */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Domains
          </h3>
          <p className="text-muted-foreground mb-4">
            Admin & Security is organized into five core security domains, each with its own 
            risk level and governance requirements:
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                domain: 'Authentication', 
                icon: Key, 
                risk: 'Critical',
                riskColor: 'bg-red-500',
                description: 'How users prove their identity (login, SSO, MFA)',
                controls: ['SSO with SAML 2.0', 'MFA enforcement', 'Password policies']
              },
              { 
                domain: 'Authorization', 
                icon: Lock, 
                risk: 'Critical',
                riskColor: 'bg-red-500',
                description: 'What users can access and do in the system',
                controls: ['Role-based permissions', 'Granular access', 'Least privilege']
              },
              { 
                domain: 'Audit', 
                icon: Eye, 
                risk: 'High',
                riskColor: 'bg-amber-500',
                description: 'Tracking who did what, when, and where',
                controls: ['Audit logging', 'Retention policies', 'Alert thresholds']
              },
              { 
                domain: 'Data Protection', 
                icon: Shield, 
                risk: 'Critical',
                riskColor: 'bg-red-500',
                description: 'Safeguarding sensitive employee information',
                controls: ['PII classification', 'Data masking', 'Export controls']
              },
              { 
                domain: 'Session Management', 
                icon: Clock, 
                risk: 'Medium',
                riskColor: 'bg-yellow-500',
                description: 'Managing active user sessions and timeouts',
                controls: ['Idle timeout', 'Concurrent limits', 'Forced logout']
              }
            ].map((domain, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${domain.riskColor}`} />
                <CardContent className="pt-4 pl-5">
                  <div className="flex items-start gap-3">
                    <domain.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{domain.domain}</h4>
                        <Badge variant="outline" className="text-xs">{domain.risk}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{domain.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {domain.controls.map((control, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            {control}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Organization Hierarchy */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Organization Hierarchy
          </h3>
          <p className="text-muted-foreground mb-4">
            HRplus supports a flexible multi-level organization structure that can accommodate 
            global enterprises with complex reporting relationships:
          </p>
          <div className="space-y-2">
            {[
              { level: 'Territory', description: 'Geographic regions (e.g., Caribbean, West Africa)', example: 'Caribbean Islands, East Africa', required: 'Optional' },
              { level: 'Company Group', description: 'Holding company or conglomerate', example: 'ACME Holdings Ltd.', required: 'Optional' },
              { level: 'Company', description: 'Individual legal entity', example: 'ACME Jamaica Ltd.', required: 'Required' },
              { level: 'Division', description: 'Major business unit within company', example: 'Manufacturing Division', required: 'Optional' },
              { level: 'Department', description: 'Functional business unit', example: 'Human Resources', required: 'Required' },
              { level: 'Section', description: 'Sub-unit within department', example: 'Talent Acquisition Team', required: 'Optional' }
            ].map((level, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {i + 1}
                </div>
                <div className="flex-1 grid md:grid-cols-4 gap-2 text-sm">
                  <div className="font-medium">{level.level}</div>
                  <div className="text-muted-foreground">{level.description}</div>
                  <div className="text-muted-foreground italic">{level.example}</div>
                  <div>
                    <Badge variant={level.required === 'Required' ? 'default' : 'outline'} className="text-xs">
                      {level.required}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Key Terminology */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Key Terminology</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { term: 'RBP', definition: 'Role-Based Permissions - Access control based on assigned roles' },
              { term: 'SSO', definition: 'Single Sign-On - One login for multiple applications' },
              { term: 'MFA', definition: 'Multi-Factor Authentication - Additional verification beyond password' },
              { term: 'PII', definition: 'Personally Identifiable Information - Sensitive employee data' },
              { term: 'Audit Trail', definition: 'Chronological record of system activities' },
              { term: 'Least Privilege', definition: 'Granting minimum permissions needed for job function' },
              { term: 'Break-Glass', definition: 'Emergency access procedure bypassing normal controls' },
              { term: 'Access Certification', definition: 'Periodic review and validation of user permissions' }
            ].map((item, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="font-mono text-xs">{item.term}</Badge>
                  <p className="text-sm text-muted-foreground">{item.definition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning Callout */}
        <div className="p-4 border-l-4 border-l-amber-500 bg-amber-500/5 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-sm text-foreground">Important</span>
              <p className="text-sm text-muted-foreground mt-1">
                Understanding these core concepts is essential before proceeding to configuration. 
                Incorrect permission settings can result in data exposure or operational disruption. 
                Always follow the principle of least privilege when assigning access.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
