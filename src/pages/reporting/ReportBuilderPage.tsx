import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileBarChart,
  Plus,
  Search,
  Calendar,
  Download,
  Play,
  Copy,
  Settings,
} from "lucide-react";

const reports = [
  { name: "Monthly Headcount Summary", category: "Workforce", schedule: "Monthly", lastRun: "Dec 1, 2024" },
  { name: "Payroll Cost Analysis", category: "Payroll", schedule: "Weekly", lastRun: "Dec 14, 2024" },
  { name: "Leave Balance Report", category: "Leave", schedule: "On-demand", lastRun: "Dec 10, 2024" },
  { name: "Training Compliance", category: "Training", schedule: "Quarterly", lastRun: "Oct 1, 2024" },
  { name: "Benefits Enrollment", category: "Benefits", schedule: "Annual", lastRun: "Nov 15, 2024" },
  { name: "Turnover Analysis", category: "Workforce", schedule: "Monthly", lastRun: "Dec 1, 2024" },
];

const templates = [
  { name: "Executive Summary", description: "High-level overview for leadership" },
  { name: "Department Breakdown", description: "Detailed analysis by department" },
  { name: "YTD Comparison", description: "Year-to-date trends and comparisons" },
  { name: "Compliance Checklist", description: "Regulatory compliance status" },
];

export default function ReportBuilderPage() {
  const breadcrumbItems = [
    { label: "Reporting & Analytics", href: "/reporting" },
    { label: "Report Builder" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileBarChart className="h-8 w-8 text-primary" />
              Report Builder
            </h1>
            <p className="text-muted-foreground">
              Custom report creation with templates and scheduling
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." className="pl-10" />
          </div>
          <Button variant="outline">All Categories</Button>
          <Button variant="outline">All Schedules</Button>
        </div>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Start Templates</CardTitle>
            <CardDescription>Pre-built report templates to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Reports</CardTitle>
            <CardDescription>Manage and run your custom reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileBarChart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{report.category}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {report.schedule}
                        </span>
                        <span className="text-xs text-muted-foreground">Last run: {report.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
