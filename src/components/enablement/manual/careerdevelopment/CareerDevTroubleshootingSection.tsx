import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';

export function CareerDevTroubleshootingSection() {
  return (
    <div className="space-y-12">
      <section id="chapter-9" data-manual-anchor="chapter-9" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9. Troubleshooting & FAQs</h2>
            <p className="text-muted-foreground">Common issues with career paths, IDPs, mentorship, and AI themes</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />~25 min read</span>
        </div>
      </section>
      {['sec-9-1', 'sec-9-2', 'sec-9-3', 'sec-9-4', 'sec-9-5'].map((id, i) => (
        <section key={id} id={id} data-manual-anchor={id} className="scroll-mt-32">
          <Card><CardContent className="pt-6"><p className="text-muted-foreground">Section {9}.{i+1} content - Troubleshooting guides and common issue resolution.</p></CardContent></Card>
        </section>
      ))}
    </div>
  );
}
