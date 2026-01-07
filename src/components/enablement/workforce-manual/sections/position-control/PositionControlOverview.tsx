import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  Users, 
  Building2, 
  GitCompare, 
  CheckCircle,
  ArrowRight,
  BarChart3,
  Lightbulb,
  Shield,
  Brain
} from "lucide-react";
import { LearningObjectives } from "../lifecycle-workflows/LearningObjectives";

export function PositionControlOverview() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-primary pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">Section 6.1</Badge>
          <Badge variant="secondary">Estimated: 10 min</Badge>
          <Badge>Conceptual</Badge>
        </div>
        <h2 className="text-2xl font-bold">Position Control Overview</h2>
        <p className="text-muted-foreground mt-2">
          Position-based vs headcount-based planning for enterprise workforce management
        </p>
      </div>

      <LearningObjectives
        items={[
          "Understand position control methodology",
          "Compare position-based vs headcount-based approaches",
          "Learn authorized headcount management",
          "Master vacancy tracking fundamentals"
        ]}
      />

      {/* What is Position Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            What is Position Control?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Position Control is an enterprise workforce planning methodology that tracks 
            approved positions rather than just employee headcounts. Each position is 
            budgeted, authorized, and linked to the organizational structure before any 
            hire can be made.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Key Principle</h4>
                <p className="text-sm text-muted-foreground">
                  "You cannot hire someone unless a position exists for them." Position 
                  control ensures every employee occupies a pre-approved, budgeted position 
                  in the organizational hierarchy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position-Based vs Headcount-Based */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Planning Methodologies Compared
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary">Position-Based</Badge>
                <span className="text-sm text-muted-foreground">(HRplus Default)</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span className="text-sm">Each position defined with specific attributes</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span className="text-sm">Positions tied to jobs, departments, cost centers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span className="text-sm">Vacancy = Position without active assignment</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span className="text-sm">Supports multi-position employees</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                  <span className="text-sm">Reporting line via position hierarchy</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Headcount-Based</Badge>
                <span className="text-sm text-muted-foreground">(Legacy Approach)</span>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 mt-1" />
                  <span className="text-sm">Departments have numeric headcount quotas</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 mt-1" />
                  <span className="text-sm">Employees counted against quota</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 mt-1" />
                  <span className="text-sm">Less granular control and tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 mt-1" />
                  <span className="text-sm">Simpler but less flexible</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 mt-1" />
                  <span className="text-sm">Common in smaller organizations</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Position Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Position Lifecycle States
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="font-semibold text-sm">Budgeted</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Approved in annual plan, not yet created
              </p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-amber-500" />
              </div>
              <h4 className="font-semibold text-sm">Vacant</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Position exists, no active assignment
              </p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <h4 className="font-semibold text-sm">Filled</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Employee actively assigned
              </p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-gray-500" />
              </div>
              <h4 className="font-semibold text-sm">Frozen</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Hiring freeze or pending deletion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authorized Headcount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Authorized Headcount Explained
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each position has an <strong>Authorized Headcount</strong> field that specifies 
            how many employees can occupy that position simultaneously. This is different 
            from the common 1:1 position-to-employee model.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Position</th>
                  <th className="text-center py-2 font-medium">Authorized</th>
                  <th className="text-center py-2 font-medium">Filled</th>
                  <th className="text-center py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Senior Developer</td>
                  <td className="text-center">5</td>
                  <td className="text-center">3</td>
                  <td className="text-center">
                    <Badge variant="outline" className="text-amber-600">2 Vacant</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">HR Manager</td>
                  <td className="text-center">1</td>
                  <td className="text-center">1</td>
                  <td className="text-center">
                    <Badge variant="outline" className="text-green-600">Filled</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Customer Support Rep</td>
                  <td className="text-center">10</td>
                  <td className="text-center">12</td>
                  <td className="text-center">
                    <Badge variant="outline" className="text-red-600">+2 Over</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Overstaffed Positions
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              When filled count exceeds authorized headcount, the position is flagged as 
              "overstaffed." This may occur during transitions or when temporary assignments 
              are made. The system tracks this for compliance and budget review.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* HRplus Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Position Control in HRplus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">Navigation Path</h4>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                Workforce → Position Control & Vacancies
              </code>
              <p className="text-sm text-muted-foreground">
                View all positions with fill rates, vacancy counts, and department breakdown
              </p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-semibold">Key Metrics Displayed</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Total Authorized Headcount</li>
                <li>• Filled Positions / Fill Rate %</li>
                <li>• Open Vacancies by Department</li>
                <li>• Overstaffed Position Alerts</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Industry Context */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Industry Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Standard:</span>
              <p className="text-muted-foreground">Enterprise position control methodology</p>
            </div>
            <div>
              <span className="font-medium">Benchmark:</span>
              <p className="text-muted-foreground">Workday, SAP SuccessFactors, Oracle HCM</p>
            </div>
            <div>
              <span className="font-medium">Usage:</span>
              <p className="text-muted-foreground">Companies 200+ employees, budget-driven orgs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
