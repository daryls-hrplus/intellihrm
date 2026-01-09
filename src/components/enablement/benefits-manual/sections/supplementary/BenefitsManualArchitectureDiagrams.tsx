import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowRight, Database, Users, FileText, DollarSign, Heart, Shield, Calendar } from "lucide-react";

export function BenefitsManualArchitectureDiagrams() {
  return (
    <div className="space-y-8" id="diagrams" data-manual-anchor="diagrams">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500" />
            <CardTitle>Architecture Diagrams</CardTitle>
          </div>
          <CardDescription>
            Visual representations of the Benefits module data model and workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Data Model Overview */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Benefits Data Model</h3>
            <div className="bg-muted/50 rounded-lg p-6 overflow-x-auto">
              <div className="min-w-[600px] space-y-4">
                {/* Top Level */}
                <div className="flex justify-center">
                  <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4 text-center">
                    <Heart className="h-6 w-6 text-pink-500 mx-auto mb-2" />
                    <p className="font-medium">Benefit Categories</p>
                    <p className="text-xs text-muted-foreground">Medical, Dental, Vision, etc.</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                </div>

                {/* Plan Level */}
                <div className="flex justify-center gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                    <FileText className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                    <p className="font-medium text-sm">Benefit Plans</p>
                    <p className="text-xs text-muted-foreground">Plan details & options</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                    <Shield className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                    <p className="font-medium text-sm">Providers</p>
                    <p className="text-xs text-muted-foreground">Insurance carriers</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
                </div>

                {/* Enrollment Level */}
                <div className="flex justify-center gap-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <Users className="h-5 w-5 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-sm">Enrollments</p>
                    <p className="text-xs text-muted-foreground">Employee elections</p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                    <Calendar className="h-5 w-5 text-amber-500 mx-auto mb-2" />
                    <p className="font-medium text-sm">Life Events</p>
                    <p className="text-xs text-muted-foreground">Qualifying changes</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <DollarSign className="h-5 w-5 text-red-500 mx-auto mb-2" />
                    <p className="font-medium text-sm">Claims</p>
                    <p className="text-xs text-muted-foreground">Reimbursements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollment Workflow */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Enrollment Workflow</h3>
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { step: "1", label: "Eligibility Check", color: "bg-blue-500" },
                  { step: "2", label: "Plan Selection", color: "bg-purple-500" },
                  { step: "3", label: "Coverage Level", color: "bg-pink-500" },
                  { step: "4", label: "Dependent Add", color: "bg-amber-500" },
                  { step: "5", label: "Cost Review", color: "bg-green-500" },
                  { step: "6", label: "Submission", color: "bg-teal-500" },
                  { step: "7", label: "Approval", color: "bg-indigo-500" },
                  { step: "8", label: "Activation", color: "bg-emerald-500" },
                ].map((item, index, arr) => (
                  <div key={item.step} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <div className={`${item.color} text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold`}>
                        {item.step}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-center max-w-[80px]">{item.label}</p>
                    </div>
                    {index < arr.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Claims Processing Flow */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Claims Processing Flow</h3>
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-4 text-center border-2 border-blue-500/30">
                  <Badge className="mb-2 bg-blue-500">Step 1</Badge>
                  <p className="font-medium text-sm">Submit Claim</p>
                  <p className="text-xs text-muted-foreground mt-1">Employee submits with documentation</p>
                </Card>
                <Card className="p-4 text-center border-2 border-amber-500/30">
                  <Badge className="mb-2 bg-amber-500">Step 2</Badge>
                  <p className="font-medium text-sm">HR Review</p>
                  <p className="text-xs text-muted-foreground mt-1">Validate eligibility & documentation</p>
                </Card>
                <Card className="p-4 text-center border-2 border-purple-500/30">
                  <Badge className="mb-2 bg-purple-500">Step 3</Badge>
                  <p className="font-medium text-sm">Approval</p>
                  <p className="text-xs text-muted-foreground mt-1">Manager/HR approves or rejects</p>
                </Card>
                <Card className="p-4 text-center border-2 border-green-500/30">
                  <Badge className="mb-2 bg-green-500">Step 4</Badge>
                  <p className="font-medium text-sm">Payment</p>
                  <p className="text-xs text-muted-foreground mt-1">Reimbursement processed</p>
                </Card>
              </div>
            </div>
          </div>

          {/* Integration Points */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Module Integration Points</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Payroll</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Benefit deductions flow to payroll for each pay period based on enrollment elections.
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Workforce</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Employee data, hire dates, and employment status drive eligibility rules.
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                  <h4 className="font-medium">Compensation</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Total rewards statements include benefit values alongside salary data.
                </p>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
