import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkles, Heart, FileText, Users, Calendar, DollarSign, Shield, CheckCircle2 } from "lucide-react";

export function BenefitsManualQuickReference() {
  return (
    <div className="space-y-8" id="quick-ref" data-manual-anchor="quick-ref">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <CardTitle>Quick Reference Cards</CardTitle>
          </div>
          <CardDescription>
            At-a-glance reference for common Benefits administration tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefit Plan Types */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Benefit Plan Types
            </h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                { type: "Medical", desc: "Health insurance coverage", icon: "🏥" },
                { type: "Dental", desc: "Dental care coverage", icon: "🦷" },
                { type: "Vision", desc: "Eye care and glasses", icon: "👁️" },
                { type: "Life Insurance", desc: "Term/whole life policies", icon: "🛡️" },
                { type: "401(k)", desc: "Retirement savings", icon: "💰" },
                { type: "HSA/FSA", desc: "Tax-advantaged accounts", icon: "💳" },
              ].map((plan) => (
                <Card key={plan.type} className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{plan.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{plan.type}</p>
                      <p className="text-xs text-muted-foreground">{plan.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Enrollment Statuses */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Enrollment Status Reference
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Next Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge variant="outline">Pending</Badge></TableCell>
                  <TableCell>Enrollment submitted, awaiting processing</TableCell>
                  <TableCell>Review and approve/reject</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge></TableCell>
                  <TableCell>Coverage is currently in effect</TableCell>
                  <TableCell>Monitor for life events</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Waived</Badge></TableCell>
                  <TableCell>Employee declined coverage</TableCell>
                  <TableCell>Document waiver reason</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-red-500/10 text-red-600 border-red-500/20">Terminated</Badge></TableCell>
                  <TableCell>Coverage ended</TableCell>
                  <TableCell>Process COBRA if applicable</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Coverage Levels */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Coverage Level Quick Reference
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { level: "Employee Only", code: "EE", covers: "Employee" },
                { level: "Employee + Spouse", code: "ES", covers: "Employee and spouse/partner" },
                { level: "Employee + Child(ren)", code: "EC", covers: "Employee and dependent children" },
                { level: "Family", code: "FAM", covers: "Employee, spouse, and children" },
              ].map((cov) => (
                <Card key={cov.code} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{cov.level}</p>
                      <p className="text-xs text-muted-foreground">{cov.covers}</p>
                    </div>
                    <Badge variant="secondary">{cov.code}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Key Dates */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              Annual Benefits Calendar
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Key Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Q3</TableCell>
                  <TableCell>Open Enrollment Preparation</TableCell>
                  <TableCell>Review plans, update rates, prepare communications</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Q4</TableCell>
                  <TableCell>Open Enrollment Period</TableCell>
                  <TableCell>Process enrollments, verify elections, send confirmations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Q1</TableCell>
                  <TableCell>New Plan Year Start</TableCell>
                  <TableCell>Activate new enrollments, process changes, audit data</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Ongoing</TableCell>
                  <TableCell>Life Event Processing</TableCell>
                  <TableCell>Process qualifying life events within 30 days</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Contribution Types */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Contribution Calculation Methods
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="p-4 space-y-2">
                <h4 className="font-medium">Fixed Amount</h4>
                <p className="text-sm text-muted-foreground">
                  Set dollar amount per pay period. Example: $150/month employee contribution.
                </p>
              </Card>
              <Card className="p-4 space-y-2">
                <h4 className="font-medium">Percentage of Premium</h4>
                <p className="text-sm text-muted-foreground">
                  Employer pays X% of premium. Example: 80% employer, 20% employee.
                </p>
              </Card>
              <Card className="p-4 space-y-2">
                <h4 className="font-medium">Salary-Based</h4>
                <p className="text-sm text-muted-foreground">
                  Contribution tied to salary bands. Higher earners may pay more.
                </p>
              </Card>
              <Card className="p-4 space-y-2">
                <h4 className="font-medium">Tiered by Coverage</h4>
                <p className="text-sm text-muted-foreground">
                  Different rates for EE only, EE+Spouse, Family, etc.
                </p>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
