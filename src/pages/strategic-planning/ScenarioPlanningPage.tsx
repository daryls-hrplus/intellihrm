import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  Plus,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Play,
  Copy,
  Trash2,
} from "lucide-react";

const scenarios = [
  {
    name: "Baseline 2025",
    description: "Current headcount projections with 5% growth",
    status: "active",
    impact: "+$2.4M",
    headcount: "+62",
    lastModified: "2 days ago",
  },
  {
    name: "Aggressive Growth",
    description: "Expansion into 3 new markets",
    status: "draft",
    impact: "+$5.1M",
    headcount: "+124",
    lastModified: "1 week ago",
  },
  {
    name: "Cost Optimization",
    description: "Reduction in contractor spend",
    status: "draft",
    impact: "-$1.2M",
    headcount: "-15",
    lastModified: "3 days ago",
  },
];

export default function ScenarioPlanningPage() {
  const breadcrumbItems = [
    { label: "Strategic Planning", href: "/strategic-planning" },
    { label: "Scenario Planning" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GitBranch className="h-8 w-8 text-primary" />
              Scenario Planning
            </h1>
            <p className="text-muted-foreground">
              What-if analysis, budget impact modeling, and timeline projections
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Scenario
          </Button>
        </div>

        {/* Scenarios */}
        <div className="space-y-4">
          {scenarios.map((scenario, index) => (
            <Card key={index} className="hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{scenario.name}</h3>
                      <Badge variant={scenario.status === "active" ? "default" : "secondary"}>
                        {scenario.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                    
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className={`text-sm font-medium ${scenario.impact.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                          {scenario.impact} budget
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className={`text-sm font-medium ${scenario.headcount.startsWith('+') ? 'text-blue-600' : 'text-orange-600'}`}>
                          {scenario.headcount} headcount
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{scenario.lastModified}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Scenario Comparison
            </CardTitle>
            <CardDescription>Compare budget and headcount impact across scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/20">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">Comparison Chart</p>
                <p className="text-sm text-muted-foreground">Select scenarios to compare</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
