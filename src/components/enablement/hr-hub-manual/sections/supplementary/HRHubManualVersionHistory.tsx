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
      'Created searchable Glossary with 45+ HR Hub terms',
      'Added Quick Reference Cards for common workflows',
      'Added Version History tracking for manual updates',
      'Expanded Cross-Module Integration documentation',
    ],
  },
  {
    version: '1.2.0',
    date: '2025-12-28',
    author: 'Intelli HRM Team',
    type: 'minor',
    changes: [
      'Added Part 7: Analytics & Reporting section',
      'Added Part 8: Troubleshooting & Support section',
      'Enhanced Workflow & Approval documentation',
      'Added ESS Change Request configuration guides',
      'Updated Help Desk SLA management procedures',
    ],
  },
  {
    version: '1.1.0',
    date: '2025-12-15',
    author: 'Intelli HRM Team',
    type: 'minor',
    changes: [
      'Added Knowledge Base management documentation',
      'Added SOP creation and AI-assisted generation guides',
      'Enhanced Compliance Tracker configuration',
      'Added Notification & Reminder system documentation',
      'Updated Communication Center features',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-11-20',
    author: 'Intelli HRM Team',
    type: 'major',
    changes: [
      'Initial release of HR Hub Administrator Manual',
      'Core Help Desk setup and configuration',
      'Document management documentation',
      'Organization structure integration guides',
      'Basic workflow configuration',
    ],
  },
];

const FEATURE_LOG = [
  {
    feature: 'Architecture Diagrams',
    category: 'Appendix',
    addedIn: '1.3.0',
    description: '6 interactive Mermaid diagrams showing HR Hub workflows and integrations',
  },
  {
    feature: 'Glossary',
    category: 'Appendix',
    addedIn: '1.3.0',
    description: 'Searchable glossary with 45+ terms across 8 categories',
  },
  {
    feature: 'Quick Reference Cards',
    category: 'Appendix',
    addedIn: '1.3.0',
    description: '30 step-by-step workflow cards for common HR Hub tasks',
  },
  {
    feature: 'Troubleshooting Guide',
    category: 'Support',
    addedIn: '1.2.0',
    description: 'Common issues, error codes, and resolution steps',
  },
  {
    feature: 'Analytics Dashboard Guide',
    category: 'Analytics',
    addedIn: '1.2.0',
    description: 'HR Hub metrics, KPIs, and reporting configuration',
  },
  {
    feature: 'SOP AI Generation',
    category: 'Knowledge',
    addedIn: '1.1.0',
    description: 'AI-assisted SOP creation and template management',
  },
  {
    feature: 'Compliance Tracker',
    category: 'Compliance',
    addedIn: '1.1.0',
    description: 'Regulatory compliance tracking and acknowledgment workflows',
  },
  {
    feature: 'Help Desk Configuration',
    category: 'Service Delivery',
    addedIn: '1.0.0',
    description: 'Initial Help Desk setup, categories, and SLA configuration',
  },
];

export function HRHubManualVersionHistory() {
  return (
    <div className="space-y-6">
      {/* Version Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Document Version History</CardTitle>
          </div>
          <CardDescription>
            Track changes and updates to the HR Hub Administrator Manual
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
}
