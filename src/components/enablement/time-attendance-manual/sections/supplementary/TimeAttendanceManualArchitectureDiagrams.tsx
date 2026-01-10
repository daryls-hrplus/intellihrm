import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

export function TimeAttendanceManualArchitectureDiagrams() {
  return (
    <Card id="diagrams" data-manual-anchor="diagrams" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-500" />
          <CardTitle>Architecture Diagrams</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-6 border rounded-lg bg-muted/30">
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
{`Time & Attendance Data Flow
═══════════════════════════

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Biometric  │    │   Mobile    │    │    Web      │
│   Device    │    │    App      │    │   Clock     │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                    ┌─────▼─────┐
                    │  Clock    │
                    │  Entries  │
                    └─────┬─────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │Attendance │   │ Timesheet │   │ Exception │
    │  Records  │   │ Processing│   │  Handling │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
                    ┌─────▼─────┐
                    │  Payroll  │
                    │Integration│
                    └───────────┘`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
