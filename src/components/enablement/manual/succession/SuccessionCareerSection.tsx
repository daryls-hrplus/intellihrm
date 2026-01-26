import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Clock } from 'lucide-react';

export function SuccessionCareerSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-8" data-manual-anchor="part-8" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Briefcase className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">8. Career Development & Mentorship</h2>
            <p className="text-muted-foreground">
              Career path design, progression steps, mentorship program setup, and pairing workflows
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
      {['sec-8-1', 'sec-8-2', 'sec-8-3', 'sec-8-4'].map((secId, index) => {
        const titles = [
          '8.1 Career Path Design',
          '8.2 Path Step Configuration',
          '8.3 Mentorship Program Setup',
          '8.4 Mentor-Mentee Pairing'
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
