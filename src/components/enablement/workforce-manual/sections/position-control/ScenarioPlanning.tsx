import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings2, 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  Copy,
  Download,
  Save,
  Share2,
  Play,
  Trash2,
  LayoutTemplate,
  GitCompare,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import { LearningObjectives } from "../lifecycle-workflows/LearningObjectives";

export function ScenarioPlanningSection() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-primary pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">Section 6.6</Badge>
          <Badge variant="secondary">Estimated: 12 min</Badge>
          <Badge>Advanced</Badge>
        </div>
        <h2 className="text-2xl font-bold">Scenario Planning</h2>
        <p className="text-muted-foreground mt-2">
          What-if analysis for restructuring, growth planning, and cost impact simulation
        </p>
      </div>

      <LearningObjectives
        objectives={[
          "Create and configure workforce scenarios",
          "Run simulations and analyze results",
          "Compare multiple scenarios side-by-side",
          "Export and share scenario plans"
        ]}
      />

      {/* Scenario Planning Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Scenario Planning Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Scenario Planning allows you to model different workforce trajectories based 
            on varying assumptions about growth, attrition, budget, and hiring capacity. 
            Run multiple scenarios simultaneously to compare outcomes.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-3">Navigation</h4>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              Workforce → Headcount Forecast → Scenarios Tab
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Scenario Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Each scenario is defined by a set of parameters that drive the simulation:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Parameter</th>
                  <th className="text-left py-2 font-medium">Description</th>
                  <th className="text-center py-2 font-medium">Range</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">Growth Rate</td>
                  <td className="text-muted-foreground">Annual headcount growth target (%)</td>
                  <td className="text-center">-20% to +50%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Attrition Rate</td>
                  <td className="text-muted-foreground">Expected annual voluntary turnover (%)</td>
                  <td className="text-center">0% to 40%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Budget Constraint</td>
                  <td className="text-muted-foreground">Maximum new hires per quarter</td>
                  <td className="text-center">0 to 100</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Time Horizon</td>
                  <td className="text-muted-foreground">Forecast period in months</td>
                  <td className="text-center">3 to 36 months</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Seasonal Adjustment</td>
                  <td className="text-muted-foreground">Apply Q4 freeze / Q1-Q3 surge patterns</td>
                  <td className="text-center">On/Off</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Aggressive Hiring</td>
                  <td className="text-muted-foreground">Increase hiring capacity by 50%</td>
                  <td className="text-center">On/Off</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Using Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            Scenario Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Start quickly with pre-built templates for common planning scenarios:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📈</span>
                <h4 className="font-semibold">Growth Templates</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Conservative Growth (10% annual)</li>
                <li>• Moderate Expansion (20% annual)</li>
                <li>• Aggressive Scale-up (40% annual)</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">❄️</span>
                <h4 className="font-semibold">Freeze Templates</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Soft Freeze (backfills only)</li>
                <li>• Hard Freeze (no hiring)</li>
                <li>• Strategic Freeze (critical roles only)</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔄</span>
                <h4 className="font-semibold">Restructuring Templates</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Workforce Reduction (5-15%)</li>
                <li>• Department Consolidation</li>
                <li>• Skill Mix Shift</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                <h4 className="font-semibold">Seasonal Templates</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Holiday Peak Staffing</li>
                <li>• Summer Slowdown</li>
                <li>• Back-to-School Surge</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Running Simulations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Running Simulations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <div className="flex-1">
                <h4 className="font-semibold">Create Scenarios</h4>
                <p className="text-sm text-muted-foreground">
                  Add 1-5 scenarios with different parameter configurations. Give each 
                  a descriptive name like "Aggressive Growth" or "Budget Constrained."
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <div className="flex-1">
                <h4 className="font-semibold">Configure Parameters</h4>
                <p className="text-sm text-muted-foreground">
                  Use sliders and toggles to set growth rate, attrition, budget limits, 
                  and other parameters for each scenario.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
              <div className="flex-1">
                <h4 className="font-semibold">Run All Scenarios</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Run All Scenarios" to execute simulations. System calculates 
                  monthly projections for each scenario based on parameters.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
              <div className="flex-1">
                <h4 className="font-semibold">Analyze Results</h4>
                <p className="text-sm text-muted-foreground">
                  Review projected headcount trajectories, total hires, attrition, and 
                  feasibility ratings for each scenario.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Understanding Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each scenario generates detailed projections:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-lg font-semibold">Final Headcount</div>
              <p className="text-xs text-muted-foreground">
                Projected headcount at end of time horizon
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-semibold">Total Hires</div>
              <p className="text-xs text-muted-foreground">
                Cumulative new hires required
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-lg font-semibold">Total Attrition</div>
              <p className="text-xs text-muted-foreground">
                Expected voluntary departures
              </p>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-2">Feasibility Rating</h4>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-green-500">High Feasibility</Badge>
              <span className="text-sm text-muted-foreground">
                Budget and capacity support the plan
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <Badge className="bg-amber-500">Medium Feasibility</Badge>
              <span className="text-sm text-muted-foreground">
                Some constraints may limit execution
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <Badge variant="destructive">Low Feasibility</Badge>
              <span className="text-sm text-muted-foreground">
                Significant challenges to achieve
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparing Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Comparing Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            View all scenarios on a single chart to compare trajectories. The 
            comparison view shows:
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <BarChart3 className="h-4 w-4 text-primary mt-0.5" />
              <span>Multi-line chart with each scenario as a separate line</span>
            </li>
            <li className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-primary mt-0.5" />
              <span>Cost projections per scenario (if workforce cost data available)</span>
            </li>
            <li className="flex items-start gap-2">
              <Users className="h-4 w-4 text-primary mt-0.5" />
              <span>Side-by-side KPI comparison table</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Export & Share */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Export & Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <Save className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Save Scenario Set</h4>
              <p className="text-sm text-muted-foreground">
                Save all scenarios together for future reference
              </p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <Share2 className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Share Link</h4>
              <p className="text-sm text-muted-foreground">
                Generate shareable link for stakeholder review
              </p>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <Download className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">Export</h4>
              <p className="text-sm text-muted-foreground">
                Download as PDF, CSV, or PowerPoint presentation
              </p>
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
              <span className="font-medium">Frequency:</span>
              <p className="text-muted-foreground">Strategic planning, M&A, annual budget</p>
            </div>
            <div>
              <span className="font-medium">Benchmark:</span>
              <p className="text-muted-foreground">Workday Adaptive Planning, Anaplan</p>
            </div>
            <div>
              <span className="font-medium">Stakeholders:</span>
              <p className="text-muted-foreground">HR, Finance, Executive Leadership</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
