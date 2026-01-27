import { Card, CardContent } from '@/components/ui/card';
import { Network, Clock } from 'lucide-react';

export function CareerDevIntegrationSection() {
  return (
    <div className="space-y-12">
      <section id="chapter-6" data-manual-anchor="chapter-6" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Network className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">6. Cross-Module Integration</h2>
            <p className="text-muted-foreground">Integration with Succession, Performance, 360 Feedback, and Learning modules</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />~40 min read</span>
        </div>
      </section>
      {['sec-6-1', 'sec-6-2', 'sec-6-3', 'sec-6-4', 'sec-6-5', 'sec-6-6'].map((id, i) => (
        <section key={id} id={id} data-manual-anchor={id} className="scroll-mt-32">
          <Card><CardContent className="pt-6"><p className="text-muted-foreground">Section {6}.{i+1} content - Integration architecture and cross-module data flows.</p></CardContent></Card>
        </section>
      ))}
    </div>
  );
}
