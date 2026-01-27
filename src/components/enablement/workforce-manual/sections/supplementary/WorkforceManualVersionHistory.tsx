import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, Calendar, FileText, Info, RefreshCw } from 'lucide-react';

const VERSION_HISTORY = [
  {
    version: '1.0.0',
    date: '2026-01-27',
    author: 'Intelli HRM Team',
    status: 'pre-release',
    changes: [
      'Initial release of Workforce Administrator Manual',
      'Complete documentation covering all Workforce module capabilities',
      'Organization structure setup (Territory, Company, Division, Department)',
      'Job architecture and position management',
      'Employee record management and lifecycle workflows',
      'Position control, budgeting, and vacancy tracking',
      'ESS/MSS portal configuration and permissions',
      'Onboarding, offboarding, and probation workflows',
      'Job families, grades, levels, and competency mapping',
      'Analytics dashboard and KPI configuration',
      'Cross-module integration with Payroll, Benefits, Performance',
      'Architecture diagrams for data models and workflows',
      'Searchable glossary with 50+ terms',
      'Quick reference cards for common tasks',
      'Troubleshooting guide with resolution steps',
    ],
  },
];

export const WorkforceManualVersionHistory = () => {
  return (
    <div className="space-y-6">
      <div data-manual-anchor="version-history" id="version-history">
        <h2 className="text-2xl font-bold mb-4">Version History</h2>
        <p className="text-muted-foreground mb-6">
          Track changes and updates to the Workforce Administrator Manual over time.
        </p>
      </div>

      {/* Version Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Document Version History</CardTitle>
          </div>
          <CardDescription>
            Track changes and updates to the Workforce Administrator Manual
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
              <div
                key={entry.version}
                className={`relative pl-6 ${
                  index !== VERSION_HISTORY.length - 1 ? 'pb-6 border-l-2 border-muted ml-2' : 'ml-2'
                }`}
              >
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary" />
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
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
                  <ul className="space-y-1">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Document Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Version</p>
              <p className="text-2xl font-bold text-primary">v1.0.0</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Badge variant="outline" className="text-blue-600 border-blue-500/30 bg-blue-500/10">
                Pre-Release
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Document Owner</p>
              <p className="text-lg text-muted-foreground">Intelli HRM Documentation Team</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Review Cycle</p>
              <p className="text-lg text-muted-foreground">Quarterly</p>
            </div>
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
};
