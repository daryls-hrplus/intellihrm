import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock } from 'lucide-react';

export function CareerDevESSSection() {
  return (
    <div className="space-y-12">
      <section id="chapter-7" data-manual-anchor="chapter-7" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Users className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">7. Employee Self-Service</h2>
            <p className="text-muted-foreground">ESS pages for career paths, IDPs, mentorship, and skill gaps</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />~35 min read</span>
        </div>
      </section>
      {['sec-7-1', 'sec-7-2', 'sec-7-3', 'sec-7-4', 'sec-7-5', 'sec-7-6'].map((id, i) => (
        <section key={id} id={id} data-manual-anchor={id} className="scroll-mt-32">
          <Card><CardContent className="pt-6"><p className="text-muted-foreground">Section {7}.{i+1} content - Employee self-service features and workflows.</p></CardContent></Card>
        </section>
      ))}
    </div>
  );
}
