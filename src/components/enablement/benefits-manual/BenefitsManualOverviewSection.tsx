import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BookOpen, 
  Heart, 
  Users, 
  Shield, 
  Calendar,
  Target,
  Lightbulb,
  Building,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText
} from "lucide-react";
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

export function BenefitsManualOverviewSection() {
  return (
    <div className="space-y-8">
      {/* Section 1.1: Introduction */}
      <Card id="ben-sec-1-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 1.1</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Heart className="h-5 w-5 text-primary" />
            Introduction to Benefits in HRplus
          </CardTitle>
          <CardDescription>
            Executive summary, business value, and key differentiators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The HRplus Benefits module provides a comprehensive, enterprise-grade solution for managing 
              employee benefits across your organization. Designed to support multi-country operations 
              with regional compliance built-in, the module handles the complete benefits lifecycle from 
              plan configuration through enrollment, claims processing, and analytics.
            </p>
          </div>

          <Alert className="border-primary/20 bg-primary/5">
            <Target className="h-4 w-4" />
            <AlertTitle>Business Value</AlertTitle>
            <AlertDescription>
              Organizations using HRplus Benefits typically see 40% reduction in benefits administration time,
              25% improvement in enrollment completion rates, and near-elimination of compliance gaps.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Key Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Multi-plan support (Medical, Dental, Vision, Life, Retirement)</li>
                  <li>• Flexible contribution models (fixed, percentage, tiered)</li>
                  <li>• Open enrollment & life event management</li>
                  <li>• Claims submission and processing</li>
                  <li>• Cost projections and analytics</li>
                  <li>• Employee self-service portal</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Compliance & Standards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• ERISA documentation support</li>
                  <li>• ACA reporting readiness</li>
                  <li>• HIPAA privacy controls</li>
                  <li>• Caribbean regional compliance</li>
                  <li>• Africa market requirements</li>
                  <li>• Full audit trail</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <ScreenshotPlaceholder 
            title="Benefits Dashboard"
            description="Main Benefits module dashboard showing enrollment summary, active plans, and key metrics"
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Section 1.2: Core Concepts */}
      <Card id="ben-sec-1-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 1.2</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Core Concepts & Terminology
          </CardTitle>
          <CardDescription>
            Plans, enrollments, coverage levels, contributions, and claims workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Term</TableHead>
                <TableHead>Definition</TableHead>
                <TableHead className="w-1/4">Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Benefit Category</TableCell>
                <TableCell>Top-level grouping of benefit types (Medical, Dental, Vision, etc.)</TableCell>
                <TableCell className="text-muted-foreground">Medical Insurance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Benefit Plan</TableCell>
                <TableCell>A specific benefits offering within a category with defined terms</TableCell>
                <TableCell className="text-muted-foreground">Gold PPO Medical Plan</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Benefit Provider</TableCell>
                <TableCell>Insurance carrier or vendor administering the benefit</TableCell>
                <TableCell className="text-muted-foreground">Guardian Life, Aetna</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Enrollment</TableCell>
                <TableCell>An employee's election to participate in a benefit plan</TableCell>
                <TableCell className="text-muted-foreground">John enrolled in Gold PPO</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Coverage Level</TableCell>
                <TableCell>Who is covered under the enrollment (employee, dependents)</TableCell>
                <TableCell className="text-muted-foreground">Employee + Family</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Contribution</TableCell>
                <TableCell>Amount paid toward premium (by employee and/or employer)</TableCell>
                <TableCell className="text-muted-foreground">$200/month employee, $800/month employer</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Waiting Period</TableCell>
                <TableCell>Time before new hire becomes eligible for benefits</TableCell>
                <TableCell className="text-muted-foreground">30 days, 60 days, 90 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Life Event</TableCell>
                <TableCell>Qualifying event that allows mid-year enrollment changes</TableCell>
                <TableCell className="text-muted-foreground">Marriage, birth, loss of coverage</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Claim</TableCell>
                <TableCell>Request for reimbursement or payment for covered expenses</TableCell>
                <TableCell className="text-muted-foreground">Medical expense reimbursement</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Key Concept: Plan vs. Enrollment</AlertTitle>
            <AlertDescription>
              A <strong>Benefit Plan</strong> is a template defining what coverage is available and at what cost. 
              An <strong>Enrollment</strong> is an employee's actual participation in that plan. One plan can have 
              many enrollments across different employees.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Section 1.3: System Architecture */}
      <Card id="ben-sec-1-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 1.3</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Building className="h-5 w-5 text-primary" />
            System Architecture
          </CardTitle>
          <CardDescription>
            Data model from categories to enrollments, integration points with Payroll
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The Benefits module is built on a hierarchical data model that connects benefit definitions 
              to employee enrollments and integrates seamlessly with Payroll for deduction processing.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Data Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-32 font-medium">Category</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">Medical, Dental, Vision, Life, Retirement, HSA, FSA, Wellness</div>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <div className="w-28 font-medium">Provider</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">Insurance carriers, administrators linked to categories</div>
                </div>
                <div className="flex items-center gap-2 pl-8">
                  <div className="w-24 font-medium">Plan</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">Specific plan offerings with costs and coverage</div>
                </div>
                <div className="flex items-center gap-2 pl-12">
                  <div className="w-20 font-medium">Enrollment</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">Employee elections with coverage levels</div>
                </div>
                <div className="flex items-center gap-2 pl-16">
                  <div className="w-16 font-medium">Claim</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">Reimbursement requests against enrollments</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Payroll Integration</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Enrollment changes automatically create payroll deductions. Employee and employer 
                contributions flow to pay period calculations. Changes effective mid-period are 
                prorated accordingly.
              </CardContent>
            </Card>
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Workforce Integration</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Employee eligibility determined by employment type, hire date, and job classification. 
                Terminations automatically trigger COBRA or coverage end workflows.
              </CardContent>
            </Card>
          </div>

          <ScreenshotPlaceholder 
            title="Benefits Data Model"
            description="Entity relationship diagram showing Categories, Providers, Plans, Enrollments, and Claims"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 1.4: User Personas */}
      <Card id="ben-sec-1-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 1.4</Badge>
            <Badge variant="secondary" className="text-xs">6 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Users className="h-5 w-5 text-primary" />
            User Personas & Journeys
          </CardTitle>
          <CardDescription>
            Benefits Admin, HR Admin, Manager (MSS), Employee (ESS) workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-600">Benefits Administrator</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground mb-2">Primary module owner responsible for:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Plan configuration and maintenance</li>
                  <li>• Open enrollment management</li>
                  <li>• Life event processing</li>
                  <li>• Claims oversight</li>
                  <li>• Provider relationship management</li>
                  <li>• Compliance monitoring</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-600">HR Administrator</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground mb-2">Oversees benefits as part of HR operations:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• New hire benefits enrollment</li>
                  <li>• Termination benefits processing</li>
                  <li>• Benefits policy decisions</li>
                  <li>• Cross-functional coordination</li>
                  <li>• Audit support</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-600">Employee (ESS)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground mb-2">Self-service capabilities include:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• View current benefits</li>
                  <li>• Enroll during open enrollment</li>
                  <li>• Report life events</li>
                  <li>• Submit claims</li>
                  <li>• Compare plans</li>
                  <li>• Calculate costs</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600">Manager (MSS)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground mb-2">Team-level visibility for:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Team enrollment status</li>
                  <li>• Enrollment completion tracking</li>
                  <li>• Benefits cost overview</li>
                  <li>• New hire benefits reminders</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Section 1.5: Benefits Calendar */}
      <Card id="ben-sec-1-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 1.5</Badge>
            <Badge variant="secondary" className="text-xs">6 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Calendar className="h-5 w-5 text-primary" />
            Benefits Management Calendar
          </CardTitle>
          <CardDescription>
            Open enrollment cycles, renewal periods, life event windows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Effective benefits administration requires careful planning around annual cycles and key events. 
              This calendar provides a reference for timing benefits activities throughout the year.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timing</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Q3 (Jul-Sep)</TableCell>
                <TableCell>Plan renewal analysis, vendor negotiations, cost projections</TableCell>
                <TableCell>Benefits Admin, Finance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Q4 (Oct-Nov)</TableCell>
                <TableCell>Open enrollment preparation, plan updates, communications</TableCell>
                <TableCell>Benefits Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Nov-Dec</TableCell>
                <TableCell>Open enrollment period (typically 2-4 weeks)</TableCell>
                <TableCell>All Employees</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jan 1</TableCell>
                <TableCell>New plan year effective date, enrollments activate</TableCell>
                <TableCell>Benefits Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Ongoing</TableCell>
                <TableCell>New hire enrollments (30/60/90 day windows)</TableCell>
                <TableCell>HR Ops, Benefits Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">As Occur</TableCell>
                <TableCell>Life event processing (30-60 day windows)</TableCell>
                <TableCell>Benefits Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Monthly</TableCell>
                <TableCell>Claims processing, eligibility audits</TableCell>
                <TableCell>Benefits Admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Quarterly</TableCell>
                <TableCell>Benefits analytics review, cost tracking</TableCell>
                <TableCell>Benefits Admin, HR Admin</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert className="border-orange-500/20 bg-orange-500/5">
            <Clock className="h-4 w-4 text-orange-500" />
            <AlertTitle>Planning Tip</AlertTitle>
            <AlertDescription>
              Begin open enrollment preparation at least 8-10 weeks before the enrollment window opens. 
              This allows time for plan updates, communications development, employee training, and system testing.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Open Enrollment Tracker"
            description="Dashboard showing enrollment period timeline, completion rates, and pending actions"
            height="h-40"
          />
        </CardContent>
      </Card>
    </div>
  );
}
