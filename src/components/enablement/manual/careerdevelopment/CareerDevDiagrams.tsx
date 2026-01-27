import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

export function CareerDevDiagrams() {
  return (
    <div className="space-y-8">
      <section id="diagrams" data-manual-anchor="diagrams" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <GitBranch className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold">B. Architecture Diagrams</h2>
        </div>
      </section>
      <Card>
        <CardHeader><CardTitle>Career Development Data Model</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Visual diagrams of the 10-table Career Development architecture.</p></CardContent>
      </Card>
    </div>
  );
}
