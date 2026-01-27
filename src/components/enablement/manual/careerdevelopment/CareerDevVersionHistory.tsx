import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function CareerDevVersionHistory() {
  return (
    <div className="space-y-8">
      <section id="version-history" data-manual-anchor="version-history" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-500/10 rounded-lg">
            <FileText className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold">D. Version History</h2>
        </div>
      </section>
      <Card>
        <CardHeader><CardTitle>Change Log</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border-b pb-2">
              <p className="font-medium">v1.0.0 - 2026-01-27</p>
              <p className="text-sm text-muted-foreground">Initial Career Development Administrator Manual release following industry-standard Career Hub architecture separation from Succession module.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
