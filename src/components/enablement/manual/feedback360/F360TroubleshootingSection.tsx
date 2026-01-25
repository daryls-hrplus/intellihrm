import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Settings, Shield, FileText, Link2, Lightbulb } from 'lucide-react';

export function F360TroubleshootingSection() {
  return (
    <div className="space-y-8">
      <div data-manual-anchor="part-8" id="part-8">
        <h2 className="text-2xl font-bold mb-4">8. Troubleshooting & FAQs</h2>
        <p className="text-muted-foreground mb-6">
          Common issues, solutions, best practices, and frequently asked questions.
        </p>
      </div>

      {[
        { id: 'sec-8-1', num: '8.1', title: 'Common Configuration Issues', icon: Settings, desc: 'Resolving setup problems, validation errors, and configuration conflicts' },
        { id: 'sec-8-2', num: '8.2', title: 'Anonymity Threshold Problems', icon: Shield, desc: 'Handling insufficient raters, bypass scenarios, and threshold adjustments' },
        { id: 'sec-8-3', num: '8.3', title: 'Response Collection Issues', icon: AlertTriangle, desc: 'Addressing low completion rates, declined raters, and timeout problems' },
        { id: 'sec-8-4', num: '8.4', title: 'Report Generation Problems', icon: FileText, desc: 'Resolving template errors, missing data, and generation failures' },
        { id: 'sec-8-5', num: '8.5', title: 'Integration Failures', icon: Link2, desc: 'Diagnosing and resolving cross-module sync issues' },
        { id: 'sec-8-6', num: '8.6', title: 'Best Practices & Tips', icon: Lightbulb, desc: 'Industry benchmarks, optimization strategies, and success factors' },
      ].map((section) => (
        <Card key={section.id} data-manual-anchor={section.id} id={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <section.icon className="h-5 w-5" />
              {section.num} {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-muted-foreground">{section.desc}</p></CardContent>
        </Card>
      ))}
    </div>
  );
}
