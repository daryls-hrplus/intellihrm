import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, CheckCircle } from 'lucide-react';

export function LndSetupSection() {
  return (
    <div className="space-y-8">
      <section id="sec-2-1" data-manual-anchor="sec-2-1">
        <h2 className="text-2xl font-bold mb-4">2.1 Prerequisites Checklist</h2>
        <Card><CardContent className="p-4 space-y-2">
          {['Competency framework populated', 'Job profiles configured', 'Employee records created', 'Manager hierarchy established'].map(item => (
            <div key={item} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>{item}</span></div>
          ))}
        </CardContent></Card>
      </section>
      
      <section id="sec-2-2" data-manual-anchor="sec-2-2">
        <h2 className="text-2xl font-bold mb-4">2.2 Course Categories Setup</h2>
        <p className="text-muted-foreground mb-4">Navigate to Admin → LMS Management → Categories. Create logical groupings: Compliance, Technical Skills, Leadership, Soft Skills.</p>
      </section>

      <section id="sec-2-3" data-manual-anchor="sec-2-3">
        <h2 className="text-2xl font-bold mb-4">2.3 Course Creation & Structure</h2>
        <p className="text-muted-foreground">Courses contain Modules, which contain Lessons. Configure thumbnails, descriptions, duration estimates, and prerequisites.</p>
      </section>

      {['2.4 Delivery Methods', '2.5 Rating Codes', '2.6 Cost Types', '2.7 Reject/Cancel Reasons', '2.8 Training Staff', '2.9 Quiz Configuration', '2.10 Learning Paths', '2.11 Competency Mapping', '2.12 Compliance Rules', '2.13 Budget Config', '2.14 Instructors', '2.15 Certificates', '2.16 SCORM/xAPI'].map((title, i) => (
        <section key={title} id={`sec-2-${i+4}`} data-manual-anchor={`sec-2-${i+4}`}>
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground">Configuration details available in the full documentation. See Admin → LMS Management for setup options.</p>
        </section>
      ))}
    </div>
  );
}
