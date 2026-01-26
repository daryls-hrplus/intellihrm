import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, Clock } from 'lucide-react';

export function SuccessionPlansSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-6" data-manual-anchor="part-6" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <PlayCircle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">6. Succession Planning Workflow</h2>
            <p className="text-muted-foreground">
              End-to-end succession planning from key position identification to development plan execution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~90 min read
          </span>
          <span>Target: Admin, HR Partner</span>
        </div>
      </section>

      {/* Placeholder Sections */}
      {['sec-6-1', 'sec-6-2', 'sec-6-3', 'sec-6-4', 'sec-6-5', 'sec-6-6'].map((secId, index) => {
        const titles = [
          '6.1 Key Position Identification',
          '6.2 Succession Plan Creation',
          '6.3 Candidate Nomination & Ranking',
          '6.4 Readiness Assessment Execution',
          '6.5 Development Plan Linking',
          '6.6 Candidate Evidence Collection'
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
