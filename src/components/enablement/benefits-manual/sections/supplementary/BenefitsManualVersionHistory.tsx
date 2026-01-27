import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, User, Calendar, Info, RefreshCw } from "lucide-react";

const VERSION_HISTORY = [
  {
    version: "1.0.0",
    date: "2026-01-27",
    author: "Intelli HRM Team",
    status: "pre-release",
    changes: [
      "Initial release of Benefits Administrator Manual",
      "Complete documentation covering all Benefits module capabilities",
      "Benefit plan configuration and management",
      "Enrollment management and open enrollment periods",
      "Claims processing workflow documentation",
      "Life events and special enrollment guidance",
      "Auto-enrollment rules configuration",
      "Eligibility criteria and audit trail features",
      "Plan comparison tool documentation",
      "Waiting period calculations and examples",
      "Open enrollment tracker setup",
      "Benefit calculator usage guide",
      "Coverage level configuration",
      "Regional compliance documentation for Caribbean",
      "Provider management documentation",
      "Benefit categories setup guide",
      "Contribution configuration procedures",
      "Cost projection and analytics documentation",
      "Employee self-service benefits documentation",
    ],
  },
];

export function BenefitsManualVersionHistory() {
  return (
    <div className="space-y-8" id="version-history" data-manual-anchor="version-history">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Version History</CardTitle>
          </div>
          <CardDescription>
            Track changes and updates to the Benefits Administrator Manual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Pre-Release Documentation</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  This documentation is being prepared for initial release. All updates contribute to version 1.0 until product launch.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {VERSION_HISTORY.map((entry, index) => (
              <div key={entry.version} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0 ml-2">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <Badge variant={index === 0 ? 'default' : 'outline'}>
                    v{entry.version}
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-500/30 bg-blue-500/10">
                    Pre-Release
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {entry.date}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {entry.author}
                  </div>
                </div>

                <ul className="space-y-2">
                  {entry.changes.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span className="text-muted-foreground">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <RefreshCw className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Version Lifecycle</p>
                <p className="text-sm text-muted-foreground">
                  All documentation updates contribute to v1.0 until official product launch. 
                  Version numbering will begin incrementing after GA release.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
