import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, Target, Users, BookOpen, GraduationCap, MessageSquare } from 'lucide-react';

export function F360IntegrationSection() {
  return (
    <div className="space-y-8">
      <div data-manual-anchor="part-7" id="part-7">
        <h2 className="text-2xl font-bold mb-4">7. Integration & Cross-Module Features</h2>
        <p className="text-muted-foreground mb-6">
          Integration with Appraisals, Talent Profile, Succession, IDP, and Learning modules.
        </p>
      </div>

      {[
        { id: 'sec-7-1', num: '7.1', title: 'Appraisal Integration', icon: Target, desc: 'Feeding 360 feedback into CRGV+360 performance appraisal cycles' },
        { id: 'sec-7-2', num: '7.2', title: 'Talent Profile Integration', icon: Users, desc: 'Updating talent profiles with 360 signal snapshots' },
        { id: 'sec-7-3', num: '7.3', title: 'Nine-Box & Succession Feed', icon: Users, desc: 'Mapping 360 signals to Nine-Box placement and succession pools' },
        { id: 'sec-7-4', num: '7.4', title: 'IDP & Development Planning', icon: BookOpen, desc: 'Linking 360 development themes to Individual Development Plans' },
        { id: 'sec-7-5', num: '7.5', title: 'Training Recommendations', icon: GraduationCap, desc: 'AI-powered skill gap to training course matching' },
        { id: 'sec-7-6', num: '7.6', title: 'Continuous Feedback Connection', icon: MessageSquare, desc: 'Linking formal 360 cycles with ongoing continuous feedback' },
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
