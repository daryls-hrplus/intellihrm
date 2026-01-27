import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function CareerDevQuickReference() {
  return (
    <div className="space-y-8">
      <section id="quick-ref" data-manual-anchor="quick-ref" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <FileText className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold">A. Quick Reference Card</h2>
        </div>
      </section>
      <Card>
        <CardHeader><CardTitle>Key Navigation Paths</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Career Paths:</strong> /succession/career-paths</p>
          <p><strong>Mentorship:</strong> /succession/mentorship</p>
          <p><strong>IDP Admin:</strong> /succession/career-development</p>
          <p><strong>ESS Career:</strong> /ess/career-paths, /ess/career-plan</p>
        </CardContent>
      </Card>
    </div>
  );
}
