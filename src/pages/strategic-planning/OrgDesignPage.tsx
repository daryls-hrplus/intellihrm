import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Network,
  Users,
  Building2,
  GitBranch,
  Layers,
  ArrowRightLeft,
  Download,
  Plus,
} from "lucide-react";

const orgMetrics = [
  { label: "Departments", value: "24", icon: Building2 },
  { label: "Positions", value: "156", icon: Users },
  { label: "Org Layers", value: "5", icon: Layers },
  { label: "Active Restructures", value: "2", icon: ArrowRightLeft },
];

export default function OrgDesignPage() {
  const breadcrumbItems = [
    { label: "Strategic Planning", href: "/strategic-planning" },
    { label: "Organization Design" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Network className="h-8 w-8 text-primary" />
              Organization Design
            </h1>
            <p className="text-muted-foreground">
              Organizational structure, restructuring scenarios, and what-if analysis
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Org Chart
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          {orgMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <metric.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Organization Chart</CardTitle>
              <CardDescription>Interactive visualization of your organizational structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
                <div className="text-center">
                  <Network className="h-16 w-16 mx-auto text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">Interactive Org Chart Viewer</p>
                  <p className="text-sm text-muted-foreground">Click to expand and explore</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Scenarios</CardTitle>
                <CardDescription>Restructuring simulations in progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">IT Consolidation</span>
                    <Badge>Draft</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Merge 3 departments into 1</p>
                </div>
                <div className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Sales Expansion</span>
                    <Badge variant="secondary">Review</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Add 2 new regional teams</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Compare Scenarios
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Layers className="h-4 w-4 mr-2" />
                  Analyze Layers
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Simulate Move
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
