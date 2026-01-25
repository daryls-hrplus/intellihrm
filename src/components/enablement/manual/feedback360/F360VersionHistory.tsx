import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2 } from 'lucide-react';

const VERSION_HISTORY = [
  {
    version: '2.4.0',
    date: '2026-01-25',
    status: 'current',
    changes: [
      'Initial 360 Feedback Administrator Manual release',
      '8 major sections covering complete module functionality',
      '55+ subsections with detailed procedures',
      '50+ glossary terms',
      'Quick reference cards for all user personas',
      'Database architecture documentation (25+ tables)'
    ]
  }
];

export function F360VersionHistory() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Version History
        </h2>
        <p className="text-muted-foreground mb-6">
          Changelog tracking manual updates and feature additions.
        </p>
      </div>

      {VERSION_HISTORY.map((version) => (
        <Card key={version.version}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Badge variant={version.status === 'current' ? 'default' : 'secondary'}>
                v{version.version}
              </Badge>
              <span className="text-base font-normal text-muted-foreground">{version.date}</span>
              {version.status === 'current' && (
                <Badge variant="outline" className="text-green-600 border-green-600">Current</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {version.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
