import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Info, RefreshCw, FileText } from 'lucide-react';

interface VersionEntry {
  version: string;
  date: string;
  status: 'current' | 'previous' | 'deprecated';
  changes: string[];
}

const VERSION_HISTORY: VersionEntry[] = [
  {
    version: '1.0.0',
    date: '2026-01-27',
    status: 'current',
    changes: [
      'Initial release of 360 Feedback Administrator Manual',
      'Complete Chapter 1-8 documentation covering all module functionality',
      'System overview with multi-rater model deep dive (Chapter 1)',
      'Setup and configuration with 15-section implementation sequence (Chapter 2)',
      'Cycle management with 12-section workflow (Chapter 3)',
      'Governance and compliance expanded to 14 sections (Chapter 4)',
      'AI and Intelligence features with 12-section technical roadmap (Chapter 5)',
      'Reports and analytics with comprehensive templates (Chapter 6)',
      'Integration and cross-module features with 8 sections (Chapter 7)',
      'Troubleshooting and FAQs with 10 sections covering 50+ issues (Chapter 8)',
      'GDPR/ISO 42001 compliance documentation',
      'Regional calendar considerations (Caribbean, West Africa)',
      'Data Subject Rights and DPIA documentation',
      'Quick reference cards for all user personas',
      'Architecture diagrams for all major data flows',
      'Glossary with 86 terms across 8 categories',
      'Industry benchmarks (SHRM, CCL) integrated throughout',
    ]
  },
];

export function F360VersionHistory() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'text-blue-600 border-blue-600 bg-blue-500/10';
      case 'previous': return 'text-gray-600 border-gray-600';
      case 'deprecated': return 'text-red-600 border-red-600';
      default: return '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Version History
        </h2>
        <p className="text-muted-foreground mb-6">
          Changelog tracking manual updates, feature additions, and documentation improvements.
        </p>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg mb-6">
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

      {VERSION_HISTORY.map((version) => (
        <Card key={version.version} className={version.status === 'current' ? 'border-primary' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-base px-3 py-1">
                  v{version.version}
                </Badge>
                <span className="text-base font-normal text-muted-foreground">{version.date}</span>
                <Badge variant="outline" className={getStatusColor(version.status)}>
                  Pre-Release
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-blue-500" />
                Capabilities ({version.changes.length})
              </h4>
              <ul className="space-y-1.5 max-h-64 overflow-y-auto">
                {version.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}

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
