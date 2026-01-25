import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, AlertCircle, MessageSquare, FileCheck } from 'lucide-react';

export function F360AISection() {
  return (
    <div className="space-y-8">
      <div data-manual-anchor="part-5" id="part-5">
        <h2 className="text-2xl font-bold mb-4">5. AI & Intelligence Features</h2>
        <p className="text-muted-foreground mb-6">
          AI-powered analysis, signal processing, development theme generation, and explainability.
        </p>
      </div>

      {[
        { id: 'sec-5-1', num: '5.1', title: 'Signal Processing Engine', icon: Brain, desc: 'How feedback responses are transformed into talent signals with confidence scoring' },
        { id: 'sec-5-2', num: '5.2', title: 'Development Theme Generation', icon: Sparkles, desc: 'AI-powered theme extraction and confirmation workflows' },
        { id: 'sec-5-3', num: '5.3', title: 'Writing Quality Analysis', icon: MessageSquare, desc: 'AI analysis of feedback clarity, specificity, and actionability' },
        { id: 'sec-5-4', num: '5.4', title: 'Bias Detection & Warnings', icon: AlertCircle, desc: 'AI-powered bias detection with inline warnings and mitigation' },
        { id: 'sec-5-5', num: '5.5', title: 'Coaching Prompts Generation', icon: MessageSquare, desc: 'AI-generated coaching conversation starters based on feedback themes' },
        { id: 'sec-5-6', num: '5.6', title: 'AI Explainability & Audit', icon: FileCheck, desc: 'Model tracking, human override documentation, and ISO compliance' },
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
