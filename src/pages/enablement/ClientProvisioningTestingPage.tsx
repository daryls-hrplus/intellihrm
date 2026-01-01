import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { NavLink } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  CheckCircle2,
  Circle,
  Key,
  Database,
  Globe,
  Users,
  Mail,
  Shield,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  steps: string;
  expected: string;
}

interface TestSection {
  title: string;
  icon: React.ElementType;
  tests: TestCase[];
}

const testSections: TestSection[] = [
  {
    title: "Pre-Testing Requirements",
    icon: Key,
    tests: [
      { id: "secret-1", name: "CLOUDFLARE_API_TOKEN configured", steps: "Check secrets", expected: "Token with DNS edit permissions" },
      { id: "secret-2", name: "CLOUDFLARE_ZONE_ID configured", steps: "Check secrets", expected: "Correct zone ID for domain" },
      { id: "secret-3", name: "RESEND_API_KEY configured", steps: "Check secrets", expected: "Valid API key with verified sender" },
      { id: "db-1", name: "demo_registrations table exists", steps: "Check database schema", expected: "Table with correct columns" },
      { id: "db-2", name: "client_provisioning_tasks table exists", steps: "Check database schema", expected: "Table with correct columns" },
    ],
  },
  {
    title: "Client Registry Page",
    icon: Users,
    tests: [
      { id: "reg-1", name: "Page loads", steps: "Navigate to /admin/client-registry", expected: "Page displays with table/cards" },
      { id: "reg-2", name: "Empty state", steps: "View with no registrations", expected: "Shows 'No registrations found'" },
      { id: "reg-3", name: "Create registration", steps: "Click 'New Registration', fill form", expected: "Registration created" },
      { id: "reg-4", name: "Filter by status", steps: "Use status filter dropdown", expected: "Only matching registrations" },
      { id: "reg-5", name: "Search", steps: "Enter company name in search", expected: "Filtered results" },
      { id: "reg-6", name: "Start provisioning", steps: "Click 'Start Provisioning'", expected: "Navigates to provision page" },
    ],
  },
  {
    title: "Client Detail Page",
    icon: FileText,
    tests: [
      { id: "det-1", name: "View details", steps: "Click on registration", expected: "Shows full details" },
      { id: "det-2", name: "Contact info displayed", steps: "Check contact section", expected: "Email, name, phone shown" },
      { id: "det-3", name: "Module selection visible", steps: "View selected modules", expected: "All modules listed" },
      { id: "det-4", name: "Status badge correct", steps: "Check status display", expected: "Correct colored badge" },
    ],
  },
  {
    title: "Provisioning Workflow",
    icon: ClipboardCheck,
    tests: [
      { id: "prov-1", name: "Task list loads", steps: "Open provisioning page", expected: "All tasks displayed in order" },
      { id: "prov-2", name: "Manual task complete", steps: "Mark manual task done", expected: "Task status updates" },
      { id: "prov-3", name: "DNS automation works", steps: "Trigger DNS setup", expected: "Cloudflare record created" },
      { id: "prov-4", name: "Company creation", steps: "Run provisioning", expected: "Company & group created" },
      { id: "prov-5", name: "User creation", steps: "Run provisioning", expected: "User created with credentials" },
      { id: "prov-6", name: "Email sent", steps: "Complete provisioning", expected: "Welcome email received" },
      { id: "prov-7", name: "Status updated", steps: "Complete all tasks", expected: "Status = provisioned" },
    ],
  },
  {
    title: "DNS Edge Function",
    icon: Globe,
    tests: [
      { id: "dns-1", name: "Create DNS record", steps: "Call with action='create'", expected: "CNAME created in Cloudflare" },
      { id: "dns-2", name: "Duplicate handling", steps: "Create same subdomain twice", expected: "Updates existing record" },
      { id: "dns-3", name: "Delete DNS record", steps: "Call with action='delete'", expected: "Record removed" },
      { id: "dns-4", name: "Invalid subdomain sanitized", steps: "Use special characters", expected: "Sanitized to valid format" },
      { id: "dns-5", name: "Missing credentials error", steps: "Remove API token", expected: "Returns clear error" },
    ],
  },
  {
    title: "Demo Login Flow",
    icon: Users,
    tests: [
      { id: "login-1", name: "Login by ID", steps: "/demo/login?id={id}", expected: "Shows login form" },
      { id: "login-2", name: "Login by subdomain", steps: "/demo/login?subdomain={sub}", expected: "Shows login form" },
      { id: "login-3", name: "Valid credentials work", steps: "Enter demo credentials", expected: "Logs in successfully" },
      { id: "login-4", name: "Invalid credentials rejected", steps: "Enter wrong password", expected: "Shows error message" },
      { id: "login-5", name: "Expired demo handled", steps: "Login to expired demo", expected: "Redirects to expired page" },
    ],
  },
  {
    title: "Demo Conversion",
    icon: ArrowRight,
    tests: [
      { id: "conv-1", name: "Conversion page loads", steps: "/demo/convert?id={id}", expected: "Shows conversion form" },
      { id: "conv-2", name: "Company details form", steps: "Fill legal name, billing", expected: "Form validates" },
      { id: "conv-3", name: "Module selection", steps: "Choose production modules", expected: "Selection saved" },
      { id: "conv-4", name: "Submit conversion", steps: "Click convert", expected: "Triggers edge function" },
      { id: "conv-5", name: "Company updated", steps: "Check company record", expected: "tenant_type = production" },
      { id: "conv-6", name: "Subscription created", steps: "Check subscriptions table", expected: "New subscription record" },
      { id: "conv-7", name: "Confirmation email", steps: "Complete conversion", expected: "Email received" },
    ],
  },
  {
    title: "Security Tests",
    icon: Shield,
    tests: [
      { id: "sec-1", name: "Non-admin blocked", steps: "Access /admin/client-registry as employee", expected: "Redirected/forbidden" },
      { id: "sec-2", name: "API auth required", steps: "Call edge function without auth", expected: "Returns 401" },
      { id: "sec-3", name: "SQL injection prevented", steps: "Inject SQL in subdomain", expected: "Sanitized, no injection" },
      { id: "sec-4", name: "XSS prevented", steps: "Script tag in company name", expected: "Properly escaped" },
      { id: "sec-5", name: "RLS enforced", steps: "Demo user accessing other company", expected: "Access blocked" },
    ],
  },
];

export default function ClientProvisioningTestingPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalTests = testSections.reduce((acc, section) => acc + section.tests.length, 0);
  const completedTests = checkedItems.size;
  const progressPercentage = Math.round((completedTests / totalTests) * 100);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Client Provisioning", href: "/enablement/client-provisioning" },
            { label: "Testing Checklist" },
          ]}
        />

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <NavLink to="/enablement/client-provisioning">
              <ArrowLeft className="h-4 w-4" />
            </NavLink>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <ClipboardCheck className="h-8 w-8 text-primary" />
              Production Readiness Testing
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive testing checklist for demo tenant provisioning
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Testing Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {completedTests} of {totalTests} tests completed
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold">{progressPercentage}%</span>
                {progressPercentage === 100 && (
                  <Badge className="ml-2 bg-green-500">Ready</Badge>
                )}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Test Sections */}
        {testSections.map((section) => {
          const Icon = section.icon;
          const sectionCompleted = section.tests.filter((t) => checkedItems.has(t.id)).length;
          const sectionTotal = section.tests.length;

          return (
            <Card key={section.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {section.title}
                  </CardTitle>
                  <Badge variant={sectionCompleted === sectionTotal ? "default" : "secondary"}>
                    {sectionCompleted}/{sectionTotal}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.tests.map((test) => {
                    const isChecked = checkedItems.has(test.id);
                    return (
                      <div
                        key={test.id}
                        className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
                          isChecked ? "bg-green-500/5 border-green-500/30" : "hover:bg-muted/50"
                        }`}
                      >
                        <Checkbox
                          id={test.id}
                          checked={isChecked}
                          onCheckedChange={() => toggleItem(test.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={test.id}
                            className={`font-medium cursor-pointer ${isChecked ? "line-through text-muted-foreground" : ""}`}
                          >
                            {test.name}
                          </label>
                          <div className="grid grid-cols-2 gap-4 mt-1 text-sm">
                            <div>
                              <span className="text-muted-foreground">Steps: </span>
                              <span>{test.steps}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expected: </span>
                              <span>{test.expected}</span>
                            </div>
                          </div>
                        </div>
                        {isChecked ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Metric</th>
                    <th className="text-left py-2 px-4 font-medium">Target</th>
                    <th className="text-left py-2 px-4 font-medium">Actual</th>
                    <th className="text-left py-2 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4">Page load (Client Registry)</td>
                    <td className="py-2 px-4 text-muted-foreground">&lt; 2s</td>
                    <td className="py-2 px-4">—</td>
                    <td className="py-2 px-4"><Badge variant="outline">Pending</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">Provisioning completion</td>
                    <td className="py-2 px-4 text-muted-foreground">&lt; 30s</td>
                    <td className="py-2 px-4">—</td>
                    <td className="py-2 px-4"><Badge variant="outline">Pending</Badge></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4">DNS propagation</td>
                    <td className="py-2 px-4 text-muted-foreground">&lt; 5 min</td>
                    <td className="py-2 px-4">—</td>
                    <td className="py-2 px-4"><Badge variant="outline">Pending</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Email delivery</td>
                    <td className="py-2 px-4 text-muted-foreground">&lt; 1 min</td>
                    <td className="py-2 px-4">—</td>
                    <td className="py-2 px-4"><Badge variant="outline">Pending</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Sign-Off Section */}
        <Card>
          <CardHeader>
            <CardTitle>Production Sign-Off</CardTitle>
            <CardDescription>
              All roles must sign off before going to production
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Role</th>
                    <th className="text-left py-2 px-4 font-medium">Name</th>
                    <th className="text-left py-2 px-4 font-medium">Date</th>
                    <th className="text-left py-2 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {["Developer", "QA", "Product Owner", "Operations"].map((role) => (
                    <tr key={role} className="border-b last:border-0">
                      <td className="py-2 px-4 font-medium">{role}</td>
                      <td className="py-2 px-4 text-muted-foreground">—</td>
                      <td className="py-2 px-4 text-muted-foreground">—</td>
                      <td className="py-2 px-4"><Badge variant="outline">Pending</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <NavLink to="/enablement/client-provisioning">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Guide
            </NavLink>
          </Button>
          <Button asChild>
            <NavLink to="/admin/client-registry">
              Open Client Registry
              <ArrowRight className="h-4 w-4 ml-2" />
            </NavLink>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}