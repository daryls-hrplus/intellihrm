import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Clock } from 'lucide-react';

export function CareerDevAnalyticsSection() {
  return (
    <div className="space-y-12">
      <section id="chapter-8" data-manual-anchor="chapter-8" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">8. Reporting & Analytics</h2>
            <p className="text-muted-foreground">Career path coverage, IDP completion, and mentorship effectiveness</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />~30 min read</span>
        </div>
      </section>
      {['sec-8-1', 'sec-8-2', 'sec-8-3', 'sec-8-4'].map((id, i) => (
        <section key={id} id={id} data-manual-anchor={id} className="scroll-mt-32">
          <Card><CardContent className="pt-6"><p className="text-muted-foreground">Section {8}.{i+1} content - Analytics metrics and reporting dashboards.</p></CardContent></Card>
        </section>
      ))}
    </div>
  );
}
