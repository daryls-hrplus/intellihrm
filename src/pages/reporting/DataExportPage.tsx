import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  Calendar,
  Clock,
  FileSpreadsheet,
  FileText,
  Database,
  Plus,
  Play,
  Settings,
} from "lucide-react";

const exportJobs = [
  { name: "Full Employee Export", format: "Excel", schedule: "Weekly", lastRun: "Dec 14, 2024", status: "completed" },
  { name: "Payroll Data", format: "CSV", schedule: "Monthly", lastRun: "Dec 1, 2024", status: "completed" },
  { name: "Benefits Enrollment", format: "Excel", schedule: "On-demand", lastRun: "Nov 28, 2024", status: "completed" },
  { name: "Training Records", format: "PDF", schedule: "Quarterly", lastRun: "Oct 1, 2024", status: "scheduled" },
];

const quickExports = [
  { name: "Employee Directory", description: "All active employees with contact info", icon: FileSpreadsheet },
  { name: "Leave Balances", description: "Current leave balances for all employees", icon: FileText },
  { name: "Payroll Summary", description: "Current period payroll totals", icon: Database },
  { name: "Org Chart Data", description: "Hierarchical organization data", icon: FileSpreadsheet },
];

export default function DataExportPage() {
  const breadcrumbItems = [
    { label: "Reporting & Analytics", href: "/reporting" },
    { label: "Data Export" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Download className="h-8 w-8 text-primary" />
              Data Export
            </h1>
            <p className="text-muted-foreground">
              Bulk export, scheduled exports, and API data access
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Export Job
          </Button>
        </div>

        {/* Quick Exports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Exports</CardTitle>
            <CardDescription>One-click exports for common data sets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {quickExports.map((exp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <exp.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm">{exp.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{exp.description}</p>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Exports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Scheduled Exports
            </CardTitle>
            <CardDescription>Automated export jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportJobs.map((job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Download className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{job.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{job.format}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.schedule}
                        </span>
                        <span className="text-xs text-muted-foreground">Last: {job.lastRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === "completed" ? "secondary" : "outline"}>
                      {job.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Run
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

        {/* API Access */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              API Access
            </CardTitle>
            <CardDescription>Programmatic access to export data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-4">
                Use our API to programmatically access and export data from any module.
              </p>
              <Button variant="outline">
                View API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
