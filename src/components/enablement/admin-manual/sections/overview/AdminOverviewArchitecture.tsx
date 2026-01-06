import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Database, Server, Shield, Globe, Layers, 
  Lock, RefreshCw, FileCheck
} from 'lucide-react';

export function AdminOverviewArchitecture() {
  return (
    <Card id="admin-sec-1-3" data-manual-anchor="admin-sec-1-3">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.3</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>20 min read</span>
        </div>
        <CardTitle className="text-2xl">System Architecture</CardTitle>
        <CardDescription>
          Data model, multi-tenancy design, security boundaries, and integration points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Architecture Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Architecture Overview
          </h3>
          <p className="text-muted-foreground mb-4">
            HRplus Admin & Security is built on a modern, cloud-native architecture designed for 
            enterprise scalability, security, and compliance.
          </p>
          
          {/* Architecture Diagram Placeholder */}
          <div className="border-2 border-dashed rounded-lg p-8 bg-muted/30">
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                    <Globe className="h-8 w-8 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium">Client Layer</span>
                  <p className="text-xs text-muted-foreground">Web, Mobile</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                    <Server className="h-8 w-8 text-green-500" />
                  </div>
                  <span className="text-sm font-medium">API Layer</span>
                  <p className="text-xs text-muted-foreground">REST, GraphQL</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-8 w-8 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium">Security Layer</span>
                  <p className="text-xs text-muted-foreground">Auth, RBP</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                    <Database className="h-8 w-8 text-amber-500" />
                  </div>
                  <span className="text-sm font-medium">Data Layer</span>
                  <p className="text-xs text-muted-foreground">PostgreSQL</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Architecture Diagram: Four-tier enterprise architecture with security at every layer
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Multi-Tenancy Design */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Multi-Tenancy Design
          </h3>
          <p className="text-muted-foreground mb-4">
            HRplus uses a shared database, separate schema approach to multi-tenancy. This provides 
            strong data isolation while maintaining operational efficiency:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Data Isolation',
                icon: Lock,
                points: [
                  'Company-level data segregation',
                  'Row-Level Security (RLS) policies',
                  'Encrypted data at rest and in transit',
                  'Tenant-specific encryption keys'
                ]
              },
              {
                title: 'Shared Infrastructure',
                icon: Server,
                points: [
                  'Common application codebase',
                  'Shared compute resources',
                  'Centralized security updates',
                  'Unified compliance controls'
                ]
              }
            ].map((section, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <section.icon className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-medium mb-2">{section.title}</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {section.points.map((point, j) => (
                          <li key={j} className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            {point}
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

        <Separator />

        {/* Core Data Entities */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Core Data Entities
          </h3>
          <p className="text-muted-foreground mb-4">
            The Admin & Security module manages several core entities that are referenced 
            throughout the HRplus ecosystem:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Entity</th>
                  <th className="border p-3 text-left font-medium">Table</th>
                  <th className="border p-3 text-left font-medium">Purpose</th>
                  <th className="border p-3 text-left font-medium">Key Relationships</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { entity: 'Company', table: 'companies', purpose: 'Legal entity definition', relations: 'company_groups, departments' },
                  { entity: 'Department', table: 'departments', purpose: 'Business unit grouping', relations: 'companies, sections, positions' },
                  { entity: 'Role', table: 'roles', purpose: 'Permission template', relations: 'role_pii_access, role_container_access' },
                  { entity: 'User Profile', table: 'profiles', purpose: 'User account data', relations: 'user_roles, auth.users' },
                  { entity: 'Audit Log', table: 'audit_logs', purpose: 'Activity tracking', relations: 'profiles, companies' },
                  { entity: 'Permission', table: 'module_permissions', purpose: 'Granular access rules', relations: 'roles, role_permissions' }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-3 font-medium">{row.entity}</td>
                    <td className="border p-3 font-mono text-xs text-muted-foreground">{row.table}</td>
                    <td className="border p-3 text-muted-foreground">{row.purpose}</td>
                    <td className="border p-3 font-mono text-xs text-muted-foreground">{row.relations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Security Boundaries */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Boundaries
          </h3>
          <p className="text-muted-foreground mb-4">
            Multiple security boundaries protect data at different layers:
          </p>
          <div className="space-y-4">
            {[
              {
                boundary: 'Network Perimeter',
                description: 'WAF, DDoS protection, IP allowlisting',
                level: 'Infrastructure',
                controls: ['TLS 1.3 encryption', 'Rate limiting', 'Geo-blocking']
              },
              {
                boundary: 'Authentication Gateway',
                description: 'Identity verification before system access',
                level: 'Identity',
                controls: ['SSO/SAML', 'MFA', 'Session management']
              },
              {
                boundary: 'Authorization Layer',
                description: 'Permission checks on every request',
                level: 'Access',
                controls: ['RBP enforcement', 'API security', 'Resource scoping']
              },
              {
                boundary: 'Data Layer',
                description: 'Protection of stored data',
                level: 'Data',
                controls: ['RLS policies', 'Encryption at rest', 'Field masking']
              }
            ].map((boundary, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <span className="text-sm font-bold text-primary">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{boundary.boundary}</h4>
                    <Badge variant="outline">{boundary.level}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{boundary.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {boundary.controls.map((control, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">
                        {control}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Integration Points */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Integration Points
          </h3>
          <p className="text-muted-foreground mb-4">
            Admin & Security integrates with other HRplus modules and external systems:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Internal Module Integration</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    'Workforce → Employee data, position assignments',
                    'Payroll → Secure compensation data access',
                    'Performance → Manager hierarchy for evaluations',
                    'Talent → Succession and development permissions',
                    'All Modules → Audit logging, permission enforcement'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">External System Integration</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    'Identity Providers → SSO via SAML 2.0, OAuth',
                    'Active Directory → User provisioning sync',
                    'SIEM Systems → Security event forwarding',
                    'Audit Platforms → Compliance log export',
                    'HR Systems → Organization data sync'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Industry Standard Callout */}
        <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-2">
            <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-sm text-foreground">Industry Standard</span>
              <p className="text-sm text-muted-foreground mt-1">
                This architecture follows enterprise HRMS patterns. The multi-tenant design with 
                strong isolation is required for SOC 2 Type II compliance and meets GDPR data 
                protection requirements.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
