import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Users, Shield, Lock, Settings, Wrench,
  ArrowRight, CheckCircle
} from 'lucide-react';
import { FeatureStatusBadge } from '../../components';

export function AdminOverviewPersonas() {
  return (
    <Card id="admin-sec-1-4" data-manual-anchor="admin-sec-1-4">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.4</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>10 min read</span>
        </div>
        <CardTitle className="text-2xl">User Personas & Journeys</CardTitle>
        <CardDescription>
          Super Admin, Security Admin, HR Admin, and Implementation Consultant workflows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Introduction */}
        <p className="text-muted-foreground">
          Understanding the different administrator personas and their typical workflows helps 
          ensure proper role assignment and efficient system operations. Each persona has distinct 
          responsibilities, access levels, and day-to-day activities.
        </p>

        {/* Persona Cards */}
        <div className="space-y-6">
          {/* Super Admin */}
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Super Admin</CardTitle>
                  <CardDescription>Highest authority with full system governance</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline">1-2 per organization</Badge>
                  <FeatureStatusBadge status="recommended" size="sm" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Profile</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• CIO, CHRO, or IT Director</li>
                    <li>• Ultimate system owner</li>
                    <li>• Compliance accountable</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Key Responsibilities
                    <FeatureStatusBadge status="implemented" size="sm" />
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• SSO & authentication setup</li>
                    <li>• AI governance oversight</li>
                    <li>• Emergency break-glass access</li>
                    <li>• Compliance certification</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Typical Workflow
                    <FeatureStatusBadge status="recommended" size="sm" />
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Weekly security dashboard review</li>
                    <li>• Monthly compliance checks</li>
                    <li>• Quarterly access certification</li>
                    <li>• Annual security audit</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <h4 className="text-sm font-medium mb-2">Primary Journey</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
                  <Badge variant="secondary">Login</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Security Dashboard</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Review Alerts</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Approve Changes</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Audit Reports</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Admin */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Lock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Security Admin</CardTitle>
                  <CardDescription>Manages access control and security policies</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline">2-5 per organization</Badge>
                  <FeatureStatusBadge status="recommended" size="sm" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Profile</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• IT Security Manager</li>
                    <li>• HRIS Security Lead</li>
                    <li>• Compliance Officer</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Key Responsibilities
                    <FeatureStatusBadge status="implemented" size="sm" />
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Role creation & management</li>
                    <li>• Permission configuration</li>
                    <li>• Access request approvals</li>
                    <li>• Security incident response</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Typical Workflow
                    <FeatureStatusBadge status="recommended" size="sm" />
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Daily access request queue</li>
                    <li>• Weekly failed login review</li>
                    <li>• Monthly role audits</li>
                    <li>• Quarterly certifications</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <h4 className="text-sm font-medium mb-2">Primary Journey</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
                  <Badge variant="secondary">Login</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Access Requests</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Review & Approve</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Role Management</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Audit Logs</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HR Admin */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">HR Admin</CardTitle>
                  <CardDescription>Manages HR operations and user accounts</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline">5-20 per organization</Badge>
                  <FeatureStatusBadge status="recommended" size="sm" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Profile</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• HR Manager</li>
                    <li>• HR Business Partner</li>
                    <li>• HRIS Specialist</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Key Responsibilities
                    <FeatureStatusBadge status="implemented" size="sm" />
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• User account provisioning</li>
                    <li>• Organization updates</li>
                    <li>• Module configuration</li>
                    <li>• Report generation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Typical Workflow
                    <FeatureStatusBadge status="recommended" size="sm" />
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Daily new hire setup</li>
                    <li>• Weekly org changes</li>
                    <li>• Monthly compliance reports</li>
                    <li>• Quarterly data cleanup</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <h4 className="text-sm font-medium mb-2">Primary Journey</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
                  <Badge variant="secondary">Login</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Dashboard</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">User Management</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Org Updates</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Reports</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Consultant */}
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Wrench className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Implementation Consultant</CardTitle>
                  <CardDescription>Deploys and configures the system</CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto">External / Project-based</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Profile</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• HRplus Partner</li>
                    <li>• Technical Consultant</li>
                    <li>• Solution Architect</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Key Responsibilities
                    <FeatureStatusBadge status="implemented" size="sm" />
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Full system configuration</li>
                    <li>• Data migration</li>
                    <li>• Integration setup</li>
                    <li>• Knowledge transfer</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    Typical Workflow
                    <FeatureStatusBadge status="recommended" size="sm" />
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Phase 1: Foundation setup</li>
                    <li>• Phase 2: Module config</li>
                    <li>• Phase 3: Testing</li>
                    <li>• Phase 4: Go-live support</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <h4 className="text-sm font-medium mb-2">Primary Journey</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
                  <Badge variant="secondary">Prerequisites</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Org Setup</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Roles & Security</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Testing</Badge>
                  <ArrowRight className="h-3 w-3" />
                  <Badge variant="secondary">Go-Live</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Access Level Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Access Level Summary
            <FeatureStatusBadge status="implemented" size="sm" />
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Capability</th>
                  <th className="border p-3 text-center font-medium">Super Admin</th>
                  <th className="border p-3 text-center font-medium">Security Admin</th>
                  <th className="border p-3 text-center font-medium">HR Admin</th>
                  <th className="border p-3 text-center font-medium">Module Admin</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { capability: 'SSO Configuration', super: true, security: false, hr: false, module: false },
                  { capability: 'AI Governance', super: true, security: false, hr: false, module: false },
                  { capability: 'Role Management', super: true, security: true, hr: false, module: false },
                  { capability: 'User Provisioning', super: true, security: true, hr: true, module: false },
                  { capability: 'Org Structure', super: true, security: false, hr: true, module: false },
                  { capability: 'Audit Log Access', super: true, security: true, hr: false, module: false },
                  { capability: 'Module Config', super: true, security: false, hr: true, module: true },
                  { capability: 'Reporting', super: true, security: true, hr: true, module: true }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-3 font-medium">{row.capability}</td>
                    <td className="border p-3 text-center">
                      {row.super && <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />}
                    </td>
                    <td className="border p-3 text-center">
                      {row.security && <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />}
                    </td>
                    <td className="border p-3 text-center">
                      {row.hr && <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />}
                    </td>
                    <td className="border p-3 text-center">
                      {row.module && <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
