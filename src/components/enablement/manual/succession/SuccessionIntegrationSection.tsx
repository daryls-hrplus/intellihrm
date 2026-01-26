import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Network, Clock } from 'lucide-react';

export function SuccessionIntegrationSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-9" data-manual-anchor="part-9" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Network className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9. Integration & Cross-Module Features</h2>
            <p className="text-muted-foreground">
              Performance, 360 Feedback, Learning, Workforce, and Compensation integration patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~60 min read
          </span>
          <span>Target: Admin, Consultant</span>
        </div>
      </section>

      {/* Placeholder Sections */}
      {['sec-9-1', 'sec-9-2', 'sec-9-3', 'sec-9-4', 'sec-9-5', 'sec-9-6'].map((secId, index) => {
        const titles = [
          '9.1 Integration Architecture',
          '9.2 Performance Appraisal Integration',
          '9.3 360 Feedback Integration',
          '9.4 Learning & IDP Integration',
          '9.5 Workforce & Position Integration',
          '9.6 Compensation Integration'
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
