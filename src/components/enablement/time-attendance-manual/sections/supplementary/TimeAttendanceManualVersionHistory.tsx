import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, CheckCircle } from 'lucide-react';

export function TimeAttendanceManualVersionHistory() {
  const versions = [
    { version: '2.4', date: 'January 2026', changes: ['Added AI Scheduler documentation', 'Updated geofencing configuration', 'New wellness monitoring section'] },
    { version: '2.3', date: 'October 2025', changes: ['Added project time tracking', 'CBA extensions documentation', 'Enhanced analytics section'] },
    { version: '2.2', date: 'July 2025', changes: ['Mobile clock-in improvements', 'Face verification updates', 'New shift bidding features'] },
    { version: '2.1', date: 'April 2025', changes: ['Initial Time & Attendance manual release', 'Foundation setup guide', 'Daily operations documentation'] },
  ];

  return (
    <Card id="version-history" data-manual-anchor="version-history" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-orange-500" />
          <CardTitle>Version History</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.map((v, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Version {v.version}</span>
                <span className="text-sm text-muted-foreground">{v.date}</span>
              </div>
              <ul className="space-y-1">
                {v.changes.map((change, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
