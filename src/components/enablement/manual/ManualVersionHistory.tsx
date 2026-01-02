import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, User, Calendar } from 'lucide-react';

const VERSION_HISTORY = [
  {
    version: '1.2.0',
    date: '2026-01-02',
    author: 'HRplus Team',
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
    author: 'HRplus Team',
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
    author: 'HRplus Team',
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
