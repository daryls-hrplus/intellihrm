import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock } from 'lucide-react';

export function SuccessionTalentPoolsSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-5" data-manual-anchor="part-5" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Users className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">5. Talent Pool Management</h2>
            <p className="text-muted-foreground">
              Create and manage talent pools for high potentials, leadership pipeline, and critical skills
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~45 min read
          </span>
          <span>Target: Admin, HR Partner</span>
        </div>
      </section>

      {/* Placeholder Sections */}
      {['sec-5-1', 'sec-5-2', 'sec-5-3', 'sec-5-4'].map((secId, index) => {
        const titles = [
          '5.1 Pool Types & Purposes',
          '5.2 Pool Creation & Configuration',
          '5.3 Member Management',
          '5.4 Review Packet Generation'
        ];
        return (
          <section key={secId} id={secId} data-manual-anchor={secId} className="scroll-mt-32 space-y-6">
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-xl font-semibold">{titles[index]}</h3>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Detailed content for this section will be populated in subsequent content iterations. 
                  This section will cover comprehensive procedures and configuration guidance.
                </p>
              </CardContent>
            </Card>
          </section>
        );
      })}
    </div>
  );
}
