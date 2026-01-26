import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Clock } from 'lucide-react';

export function SuccessionRiskSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-7" data-manual-anchor="part-7" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">7. Risk Management</h2>
            <p className="text-muted-foreground">
              Flight risk assessment, retention strategies, vacancy risk analysis, and bench strength monitoring
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~60 min read
          </span>
          <span>Target: Admin, HR Partner</span>
        </div>
      </section>

      {/* Placeholder Sections */}
      {['sec-7-1', 'sec-7-2', 'sec-7-3', 'sec-7-4'].map((secId, index) => {
        const titles = [
          '7.1 Flight Risk Assessment',
          '7.2 Retention Risk Matrix',
          '7.3 Key Position Vacancy Risk',
          '7.4 Bench Strength Analysis'
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
