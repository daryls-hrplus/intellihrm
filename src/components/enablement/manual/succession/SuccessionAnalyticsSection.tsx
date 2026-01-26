import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock } from 'lucide-react';

export function SuccessionAnalyticsSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-10" data-manual-anchor="part-10" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">10. Reporting & Analytics</h2>
            <p className="text-muted-foreground">
              Dashboard metrics, bench strength reports, flight risk analysis, and Nine-Box distribution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~30 min read
          </span>
          <span>Target: Admin, HR Partner, Executive</span>
        </div>
      </section>

      {/* Placeholder Sections */}
      {['sec-10-1', 'sec-10-2', 'sec-10-3', 'sec-10-4'].map((secId, index) => {
        const titles = [
          '10.1 Succession Dashboard Metrics',
          '10.2 Bench Strength Reports',
          '10.3 Flight Risk Reports',
          '10.4 Nine-Box Distribution Reports'
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
