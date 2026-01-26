import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle } from 'lucide-react';

const VERSION_HISTORY = [
  {
    version: '1.0.0',
    date: '2026-01-26',
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
      '55+ glossary terms across 8 categories',
      'Quick reference cards for 4 personas',
      'Architecture diagrams for data model and workflows'
    ]
  }
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
          Document revision history and change log
        </p>
      </div>

      <div className="space-y-4">
        {VERSION_HISTORY.map((version) => (
          <Card key={version.version}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Version {version.version}
                  {version.status === 'current' && (
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  )}
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
    </div>
  );
}
