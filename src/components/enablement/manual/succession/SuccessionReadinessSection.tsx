import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Clock } from 'lucide-react';

export function SuccessionReadinessSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-4" data-manual-anchor="part-4" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Target className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">4. Readiness Assessment Framework</h2>
            <p className="text-muted-foreground">
              Design readiness indicators, build assessment forms, configure scoring, and set up multi-assessor workflows
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~75 min read
          </span>
          <span>Target: Admin, Consultant, HR Partner</span>
        </div>
      </section>

      {/* Placeholder Sections */}
      {['sec-4-1', 'sec-4-2', 'sec-4-3', 'sec-4-4', 'sec-4-5'].map((secId, index) => {
        const titles = [
          '4.1 Readiness Indicators Design',
          '4.2 Form Builder Configuration',
          '4.3 Category & Question Setup',
          '4.4 Scoring Guide Definitions',
          '4.5 Multi-Assessor Workflows'
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
