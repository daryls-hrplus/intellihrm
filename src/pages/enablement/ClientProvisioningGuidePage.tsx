import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "react-router-dom";
import {
  ArrowLeft,
  Network,
  Database,
  Users,
  Mail,
  Globe,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Key,
  Server,
  FileText,
} from "lucide-react";

export default function ClientProvisioningGuidePage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Client Provisioning" },
          ]}
        />

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <NavLink to="/enablement">
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Network className="h-8 w-8 text-primary" />
              Demo Tenant Provisioning Guide
            </h1>
            <p className="text-muted-foreground mt-1">
              Complete implementation guide for demo tenant provisioning system
            </p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <NavLink to="/admin/client-registry" className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Client Registry</p>
                  <p className="text-sm text-muted-foreground">Manage registrations</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </NavLink>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <NavLink to="/enablement/client-provisioning/testing" className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Testing Checklist</p>
                  <p className="text-sm text-muted-foreground">Production readiness</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </NavLink>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-slate-500/10">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Raw Documentation</p>
                  <p className="text-sm text-muted-foreground">View markdown files</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              The Demo Tenant Provisioning System allows HRplus administrators to manage demo registrations, 
              provision new demo environments, and convert successful demos to production tenants.
            </p>
          </CardContent>
        </Card>

        {/* Access Points */}
        <Card>
          <CardHeader>
            <CardTitle>Access Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-medium mb-2">Admin Interface</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client Registry</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">/admin/client-registry</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client Detail</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">/admin/clients/{"{id}"}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provisioning</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">/admin/clients/{"{id}"}/provision</code>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-medium mb-2">Demo Experience</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Demo Login</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">/demo/login?subdomain=...</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expired Demo</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">/demo/expired?id=...</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversion</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">/demo/convert?id=...</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Database Tables</h4>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• demo_registrations</li>
                  <li>• client_provisioning_tasks</li>
                  <li>• companies (target)</li>
                  <li>• company_groups (target)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Edge Functions</h4>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• provision-demo-tenant</li>
                  <li>• create-subdomain-dns</li>
                  <li>• convert-demo-to-production</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <h4 className="font-medium">External Services</h4>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Cloudflare DNS</li>
                  <li>• Resend Email</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Secrets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Required Secrets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Secret Name</th>
                    <th className="text-left py-2 px-4 font-medium">Purpose</th>
                    <th className="text-left py-2 px-4 font-medium">Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4"><code className="text-xs bg-muted px-2 py-0.5 rounded">CLOUDFLARE_API_TOKEN</code></td>
                    <td className="py-2 px-4 text-muted-foreground">DNS record management</td>
                    <td className="py-2 px-4"><Badge variant="default">Yes</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4"><code className="text-xs bg-muted px-2 py-0.5 rounded">CLOUDFLARE_ZONE_ID</code></td>
                    <td className="py-2 px-4 text-muted-foreground">Target DNS zone</td>
                    <td className="py-2 px-4"><Badge variant="default">Yes</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4"><code className="text-xs bg-muted px-2 py-0.5 rounded">RESEND_API_KEY</code></td>
                    <td className="py-2 px-4 text-muted-foreground">Email delivery</td>
                    <td className="py-2 px-4"><Badge variant="default">Yes</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Provisioning Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: 1, title: "DNS Setup", type: "Automated", desc: "Creates subdomain via Cloudflare" },
                { step: 2, title: "Company Setup", type: "Automated", desc: "Creates company group and company" },
                { step: 3, title: "User Account", type: "Automated", desc: "Creates demo user with admin role" },
                { step: 4, title: "Seed Data", type: "Automated", desc: "Departments, leave types, salary grades" },
                { step: 5, title: "Module Configuration", type: "Manual", desc: "Review and adjust module settings" },
                { step: 6, title: "Branding Review", type: "Manual", desc: "Apply any company-specific branding" },
                { step: 7, title: "Welcome Email", type: "Automated", desc: "Sends credentials to prospect" },
                { step: 8, title: "Final Verification", type: "Manual", desc: "Admin confirms everything works" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      <Badge variant={item.type === "Automated" ? "default" : "secondary"}>
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seed Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Data Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">Departments</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Human Resources (HR)</li>
                  <li>• Information Technology (IT)</li>
                  <li>• Finance (FIN)</li>
                  <li>• Operations (OPS)</li>
                  <li>• Sales (SALES)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">Leave Types</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Annual Leave (15 days)</li>
                  <li>• Sick Leave (10 days)</li>
                  <li>• Personal Leave (3 days)</li>
                  <li>• Unpaid Leave</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">Salary Grades</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• E1-E4: Entry to Senior</li>
                  <li>• M1-M2: Manager levels</li>
                  <li>• D1: Director</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Flow */}
        <Card>
          <CardHeader>
            <CardTitle>Status Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-2 p-4">
              <Badge variant="outline" className="text-base px-4 py-2">pending</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-base px-4 py-2 bg-blue-500/10 border-blue-500">provisioning</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-base px-4 py-2 bg-green-500/10 border-green-500">provisioned</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-base px-4 py-2 bg-purple-500/10 border-purple-500">converted</Badge>
            </div>
            <div className="flex justify-center gap-8 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">failed</Badge>
                <span>on error</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">expired</Badge>
                <span>after demo period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge>POST</Badge>
                <code className="text-sm">/functions/v1/provision-demo-tenant</code>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "registrationId": "uuid",
  "taskId": "uuid" // optional
}`}
              </pre>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge>POST</Badge>
                <code className="text-sm">/functions/v1/create-subdomain-dns</code>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "subdomain": "acme-corp",
  "registrationId": "uuid",
  "action": "create" | "delete"
}`}
              </pre>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge>POST</Badge>
                <code className="text-sm">/functions/v1/convert-demo-to-production</code>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "demoId": "uuid",
  "companyDetails": {
    "companyName": "Acme Corp",
    "legalName": "Acme Corporation Ltd.",
    "billingEmail": "billing@acme.com",
    "billingAddress": "123 Main St..."
  },
  "selectedModules": ["core_hr", "leave", "payroll"]
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <h4 className="font-medium text-amber-600 dark:text-amber-400">DNS Not Propagating</h4>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Check Cloudflare dashboard for DNS record</li>
                  <li>• Verify CLOUDFLARE_API_TOKEN has DNS edit permissions</li>
                  <li>• DNS propagation can take up to 24 hours (usually minutes with Cloudflare)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <h4 className="font-medium text-amber-600 dark:text-amber-400">Email Not Sent</h4>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Verify RESEND_API_KEY is configured</li>
                  <li>• Check edge function logs for errors</li>
                  <li>• Verify sender domain is configured in Resend</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <h4 className="font-medium text-amber-600 dark:text-amber-400">Provisioning Failed</h4>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Check edge function logs</li>
                  <li>• Verify registration exists and is in correct status</li>
                  <li>• Check for unique constraint violations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <NavLink to="/enablement">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Enablement
            </NavLink>
          </Button>
          <Button asChild>
            <NavLink to="/enablement/client-provisioning/testing">
              Testing Checklist
              <ArrowRight className="h-4 w-4 ml-2" />
            </NavLink>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}