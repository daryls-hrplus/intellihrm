import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, Calendar, Plus, RefreshCw, FileText } from 'lucide-react';

const VERSION_HISTORY = [
  {
    version: '1.3.0',
    date: '2026-01-08',
    author: 'Intelli HRM Team',
    type: 'major',
    changes: [
      'Added comprehensive Appendix section with Architecture Diagrams',
      'Created searchable Glossary with 50+ Workforce terms',
      'Added Quick Reference Cards for common workflows',
      'Added Version History tracking for manual updates',
      'Enhanced Cross-Module Integration documentation in Part 9',
      'Added detailed Troubleshooting & FAQ section in Part 10',
    ],
  },
  {
    version: '1.2.0',
    date: '2025-12-28',
    author: 'Intelli HRM Team',
    type: 'minor',
    changes: [
      'Added Part 7: Analytics & Reporting section',
      'Added Part 8: ESS/MSS Configuration section',
      'Enhanced Position Control documentation',
      'Added Lifecycle Workflow configuration guides',
      'Updated Employee Transaction procedures',
    ],
  },
  {
    version: '1.1.0',
    date: '2025-12-15',
    author: 'Intelli HRM Team',
    type: 'minor',
    changes: [
      'Added Job Architecture documentation',
      'Added Employee Management detailed guides',
      'Enhanced Organization Structure configuration',
      'Added Position-Based workflows',
      'Updated Onboarding/Offboarding templates',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-11-20',
    author: 'Intelli HRM Team',
    type: 'major',
    changes: [
      'Initial release of Workforce Administrator Manual',
      'Core Organization Structure setup (Territory, Company, Department)',
      'Basic Job & Position configuration',
      'Employee record management foundation',
      'Initial ESS/MSS configuration',
    ],
  },
];

const FEATURE_LOG = [
  {
    feature: 'Architecture Diagrams',
    category: 'Appendix',
    addedIn: '1.3.0',
    description: '6 interactive Mermaid diagrams showing Workforce data models and workflows',
  },
  {
    feature: 'Glossary',
    category: 'Appendix',
    addedIn: '1.3.0',
    description: 'Searchable glossary with 50+ terms across 8 categories',
  },
  {
    feature: 'Quick Reference Cards',
    category: 'Appendix',
    addedIn: '1.3.0',
    description: '30 step-by-step workflow cards for common Workforce tasks',
  },
  {
    feature: 'Troubleshooting Guide',
    category: 'Support',
    addedIn: '1.3.0',
    description: 'Common issues, error codes, and resolution steps for Workforce module',
  },
  {
    feature: 'Integration Documentation',
    category: 'Integration',
    addedIn: '1.3.0',
    description: 'Cross-module data flows to Payroll, Benefits, Performance, and Succession',
  },
  {
    feature: 'Analytics Dashboard Guide',
    category: 'Analytics',
    addedIn: '1.2.0',
    description: 'Workforce metrics, KPIs, and custom reporting configuration',
  },
  {
    feature: 'ESS/MSS Configuration',
    category: 'Self-Service',
    addedIn: '1.2.0',
    description: 'Employee and Manager Self-Service portal setup and permissions',
  },
  {
    feature: 'Position Control',
    category: 'Core',
    addedIn: '1.2.0',
    description: 'Position budgeting, headcount management, and vacancy tracking',
  },
  {
    feature: 'Lifecycle Workflows',
    category: 'Automation',
    addedIn: '1.1.0',
    description: 'Onboarding, offboarding, and probation workflow templates',
  },
  {
    feature: 'Job Architecture',
    category: 'Core',
    addedIn: '1.1.0',
    description: 'Job families, grades, levels, and competency mapping',
  },
  {
    feature: 'Organization Structure',
    category: 'Foundation',
    addedIn: '1.0.0',
    description: 'Territory, Company, Division, Department hierarchy configuration',
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
                    <Badge variant={entry.type === 'major' ? 'default' : 'secondary'} className="text-xs">
                      {entry.type === 'major' ? 'Major Release' : 'Minor Update'}
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

      {/* Feature Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <CardTitle>Feature Documentation Log</CardTitle>
          </div>
          <CardDescription>
            New features and sections added to this manual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">Feature</th>
                  <th className="text-left py-2 px-2 font-medium">Category</th>
                  <th className="text-left py-2 px-2 font-medium">Added In</th>
                  <th className="text-left py-2 px-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_LOG.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium">{item.feature}</td>
                    <td className="py-2 px-2">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant="secondary" className="text-xs">v{item.addedIn}</Badge>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <p className="text-2xl font-bold text-primary">v1.3.0</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-lg text-muted-foreground">January 8, 2026</p>
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
                <p className="text-sm font-medium">Next Scheduled Review</p>
                <p className="text-sm text-muted-foreground">
                  April 2026 - Will include updates for Q1 feature releases and user feedback incorporation
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
