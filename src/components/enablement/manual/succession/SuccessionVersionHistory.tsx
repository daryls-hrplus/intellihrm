import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Lightbulb, Clock, Info, RefreshCw } from 'lucide-react';

const VERSION_HISTORY = [
  {
    version: '1.0.0',
    date: '2026-01-27',
    status: 'current',
    changes: [
      'Initial release of Succession Planning Administrator Manual',
      '11 comprehensive parts covering all succession planning capabilities',
      'Nine-Box assessment configuration (Part 3)',
      'Readiness assessment framework (Part 4)',
      'Talent pool management (Part 5)',
      'Succession planning workflow (Part 6)',
      'Risk management including flight risk (Part 7)',
      'Career development and mentorship (Part 8)',
      'Cross-module integration patterns (Part 9)',
      'Troubleshooting guide with 100+ documented issues (Part 11)',
      'Quick reference cards for 9 personas and workflows',
      'Architecture diagrams (9 comprehensive visualizations)',
      'Glossary with 71+ terms across 8 categories',
      'Planned features roadmap and deprecation notices',
    ]
  }
];

const PLANNED_FEATURES = [
  { feature: 'AI-Powered Succession Recommendations', timeline: 'Q2 2026', priority: 'High' },
  { feature: 'External Candidate Pool Integration', timeline: 'Q3 2026', priority: 'Medium' },
  { feature: 'Succession Scenario Modeling (What-If)', timeline: 'Q3 2026', priority: 'Medium' },
  { feature: 'Board-Level Succession Dashboard', timeline: 'Q2 2026', priority: 'High' },
  { feature: 'Mobile Readiness Assessment App', timeline: 'Q4 2026', priority: 'Low' },
  { feature: 'Predictive Vacancy Forecasting', timeline: 'Q3 2026', priority: 'High' },
];

export function SuccessionVersionHistory() {
  return (
    <div className="space-y-8" id="version-history" data-manual-anchor="version-history">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Appendix D: Version History
        </h2>
        <p className="text-muted-foreground mb-6">
          Document revision history, planned features, and deprecation notices
        </p>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
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

      {/* Version History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Release History</h3>
        {VERSION_HISTORY.map((version) => (
          <Card key={version.version}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Version {version.version}
                  <Badge className="bg-blue-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pre-Release
                  </Badge>
                </CardTitle>
                <span className="text-sm text-muted-foreground">{version.date}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {version.changes.map((change, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Planned Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Planned Features (Roadmap)
        </h3>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {PLANNED_FEATURES.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.feature}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.timeline}</Badge>
                    <Badge 
                      variant={item.priority === 'High' ? 'destructive' : item.priority === 'Medium' ? 'default' : 'secondary'}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
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
    </div>
  );
}
