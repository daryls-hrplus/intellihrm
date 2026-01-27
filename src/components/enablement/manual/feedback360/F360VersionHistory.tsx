import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Sparkles, AlertTriangle, FileText } from 'lucide-react';

interface VersionEntry {
  version: string;
  date: string;
  status: 'current' | 'previous' | 'deprecated';
  type: 'major' | 'minor' | 'patch';
  highlights?: string[];
  changes: string[];
  breakingChanges?: string[];
  knownIssues?: string[];
}

const VERSION_HISTORY: VersionEntry[] = [
  {
    version: '2.6.0',
    date: '2026-01-27',
    status: 'current',
    type: 'minor',
    highlights: [
      'Removed all vendor-specific brand references',
      'Standardized industry terminology throughout'
    ],
    changes: [
      'Replaced SAP SuccessFactors, Workday, Oracle HCM, Visier references with industry-neutral terms',
      'Updated benchmark sources to use "Industry Standard" where appropriate',
      'Retained SHRM, CCL, and other professional association references',
      'Aligned all cross-module integration documentation with neutral terminology'
    ]
  },
  {
    version: '2.5.0',
    date: '2026-01-26',
    status: 'previous',
    type: 'major',
    highlights: [
      'Comprehensive Chapter 7 (Integration) with 8 sections',
      'Complete Chapter 8 (Troubleshooting) with 10 sections and 50+ issues',
      'Enhanced Quick Reference Cards with detailed persona journeys',
      'Expanded Architecture Diagrams to 9+ visualizations'
    ],
    changes: [
      'Chapter 7 (Integration & Cross-Module Features) expanded from 3 to 8 comprehensive sections',
      'Chapter 8 (Troubleshooting & FAQs) expanded from 3 to 10 sections covering 50+ issues',
      'Integration Architecture Overview with data flow diagrams',
      'Appraisal Integration documentation with CRGV+360 scoring model',
      'Talent Profile Integration with signal snapshots and k-anonymity',
      'Nine-Box & Succession Integration with score-to-rating mapping',
      'IDP & Development Planning with theme-to-goal link types',
      'Learning Recommendations with skill gap matching',
      'Continuous Feedback Connection documentation',
      'Integration Rules Configuration with trigger events and conditions',
      'Common Configuration Issues section with 15+ issues and decision tree',
      'Cycle Management Issues with lifecycle troubleshooting',
      'Anonymity & Privacy Problems with SHRM benchmark thresholds',
      'Response Collection Issues with completion rate diagnostics',
      'Report Generation Problems with template and PDF troubleshooting',
      'Integration Failures with cross-module sync diagnostics',
      'AI Feature Troubleshooting aligned with ISO 42001 compliance',
      'Security & Access Control with RLS policy troubleshooting',
      'Escalation Procedures with 4-tier support model and SLAs',
      'Best Practices & Success Factors with SHRM/CCL benchmarks',
      'Quick Reference Cards enhanced with 8-12 steps per persona',
      'Checkboxes and time estimates added to journey cards',
      'Key actions and success criteria for each step',
      'Architecture Diagrams expanded to 9 comprehensive ASCII diagrams',
      'Complete Data Architecture showing 25+ tables',
      'Cycle Lifecycle State Machine with transition requirements',
      'Anonymity Protection Architecture with decision tree',
      'AI Signal Processing Pipeline with integration outputs',
      'Cross-Module Integration Architecture',
      'Report Generation Pipeline with template components',
      'External Rater Workflow with security controls',
      'Notification Workflow with event triggers',
      'Consent & Governance Architecture with GDPR compliance',
      'Glossary expanded from 20 to 86 terms across 8 categories',
      'New glossary categories: AI & Signals, Integration, Compliance',
      'Industry benchmarks (SHRM, CCL) integrated throughout'
    ]
  },
  {
    version: '2.4.0',
    date: '2026-01-25',
    status: 'previous',
    type: 'major',
    highlights: [
      'Initial 360 Feedback Administrator Manual release',
      'Complete Chapter 1-6 documentation',
      'AI & Intelligence Features documentation'
    ],
    changes: [
      'Initial 360 Feedback Administrator Manual release',
      '8 major sections covering complete module functionality',
      '55+ subsections with detailed procedures',
      '50+ glossary terms with definitions',
      'Quick reference cards for all user personas',
      'Database architecture documentation (25+ tables)',
      'Chapter 1: System Overview with multi-rater model deep dive',
      'Chapter 2: Setup & Configuration with 15-section implementation sequence',
      'Chapter 3: Cycle Management with 12-section workflow',
      'Chapter 4: Governance & Compliance expanded to 14 sections',
      'Chapter 5: AI & Intelligence Features with 12-section technical roadmap',
      'Chapter 6: Reports & Analytics with comprehensive templates',
      'GDPR/ISO 42001 compliance documentation',
      'Regional calendar considerations (Caribbean, West Africa)',
      'Data Subject Rights and DPIA documentation'
    ]
  }
];

export function F360VersionHistory() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'text-green-600 border-green-600';
      case 'previous': return 'text-blue-600 border-blue-600';
      case 'deprecated': return 'text-red-600 border-red-600';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patch': return 'bg-gray-100 text-gray-800 border-gray-200';
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
          Each version includes highlights, detailed changes, and known issues.
        </p>
      </div>

      {VERSION_HISTORY.map((version) => (
        <Card key={version.version} className={version.status === 'current' ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-base px-3 py-1">
                  v{version.version}
                </Badge>
                <span className="text-base font-normal text-muted-foreground">{version.date}</span>
                <Badge variant="outline" className={getStatusColor(version.status)}>
                  {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
                </Badge>
                <Badge variant="outline" className={getTypeColor(version.type)}>
                  {version.type.charAt(0).toUpperCase() + version.type.slice(1)}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {version.highlights && version.highlights.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Highlights
                </h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {version.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950 rounded-lg text-sm">
                      <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-blue-500" />
                Changes ({version.changes.length})
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

            {version.breakingChanges && version.breakingChanges.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Breaking Changes
                </h4>
                <ul className="space-y-1.5">
                  {version.breakingChanges.map((change, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {version.knownIssues && version.knownIssues.length > 0 && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  Known Issues
                </h4>
                <ul className="space-y-1.5">
                  {version.knownIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
