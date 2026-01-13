import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, Calendar } from 'lucide-react';

const VERSION_HISTORY = [
  {
    version: '1.4.0',
    date: '2026-01-13',
    author: 'Intelli HRM Team',
    changes: [
      'Added Values Assessment Configuration (Section 2.15) and Goals Integration Settings (Section 2.16)',
      'Added Rating Dispute & Acknowledgment Workflow (Section 3.11) with dispute categories and resolution process',
      'Added Values Assessment Process (Section 3.12) for employee and manager workflows',
      'Added AI Coaching Nudges (Section 5.7) with nudge types and configuration',
      'Added Performance Risk Detection (Section 5.8) with 7 risk types and intervention recommendations',
      'Added Performance Intelligence Hub (Section 6.5) with 6-tab analytics overview',
      'Added Talent Unified Dashboard (Section 6.6) for cross-module talent visibility',
      'Added Compliance Document Generation (Section 7.7) for jurisdiction-specific documents',
      'Expanded Glossary with 6 new terms (Dispute Window, Performance Risk, Toxic High Performer, etc.)',
      'Clarified Goals module as separate with integration reference',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-01-02',
    author: 'Intelli HRM Team',
    changes: [
      'Comprehensive Part 8 Troubleshooting expansion (8 subsections)',
      'Updated RLS policies documentation to reflect actual implementation (14 policies)',
      'Added Integration Troubleshooting Guide with actual error patterns',
      'Added Escalation Procedures framework (organization-defined SLAs)',
      'Added Performance Optimization and Data Quality sections',
      'Expanded Quick Reference Cards (10 total covering all workflows)',
      'Complete Architecture Diagrams (8 diagrams, all 14 tables documented)',
      'Expanded Glossary (33 terms across 7 categories)',
    ],
  },
  {
    version: '1.2.0',
    date: '2025-12-20',
    author: 'Intelli HRM Team',
    changes: [
      'Added navigation paths to all sections',
      'Added version history tracking',
      'Added glossary of terms',
      'Enhanced troubleshooting section',
    ],
  },
  {
    version: '1.1.0',
    date: '2025-12-15',
    author: 'Intelli HRM Team',
    changes: [
      'Added AI Feedback Assistant documentation',
      'Added bias detection guidelines',
      'Updated calibration workflows',
      'Added nine-box integration details',
    ],
  },
  {
    version: '1.0.0',
    date: '2025-11-01',
    author: 'Intelli HRM Team',
    changes: [
      'Initial release of Appraisals Administrator Manual',
      'Core setup and configuration documentation',
      'Workflow guides for managers and employees',
      'Integration documentation',
    ],
  },
];

export function ManualVersionHistory() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Document Version History</CardTitle>
          </div>
          <CardDescription>
            Track changes and updates to this manual
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
    </div>
  );
}
