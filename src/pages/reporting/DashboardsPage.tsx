import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  Plus,
  Share2,
  Settings,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react";

const dashboards = [
  { name: "Executive Summary", module: "All", views: 1247, starred: true },
  { name: "Workforce Overview", module: "Workforce", views: 856, starred: true },
  { name: "Payroll Analytics", module: "Payroll", views: 642, starred: false },
  { name: "Leave Trends", module: "Leave", views: 423, starred: false },
  { name: "Recruitment Pipeline", module: "Recruitment", views: 389, starred: true },
  { name: "Training Progress", module: "Training", views: 312, starred: false },
];

export default function DashboardsPage() {
  const breadcrumbItems = [
    { label: "Reporting & Analytics", href: "/reporting" },
    { label: "Cross-Module Dashboards" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Cross-Module Dashboards
            </h1>
            <p className="text-muted-foreground">
              Unified dashboards spanning all HR modules
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Dashboards</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="shared">Shared with Me</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboards.map((dashboard, index) => (
                <Card key={index} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {dashboard.name}
                          {dashboard.starred && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                        </CardTitle>
                        <CardDescription>Module: {dashboard.module}</CardDescription>
                      </div>
                      <Badge variant="secondary">{dashboard.views} views</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center">
                      <LayoutDashboard className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="starred">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dashboards.filter(d => d.starred).map((dashboard, index) => (
                <Card key={index} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {dashboard.name}
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </CardTitle>
                    <CardDescription>Module: {dashboard.module}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shared">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Share2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No dashboards shared with you yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">Browse dashboard templates</p>
                  <Button className="mt-4">View Templates</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
