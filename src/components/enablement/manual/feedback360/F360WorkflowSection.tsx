import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, ArrowRight } from 'lucide-react';

export function F360WorkflowSection() {
  return (
    <div className="space-y-8">
      <div data-manual-anchor="part-3" id="part-3">
        <h2 className="text-2xl font-bold mb-4">3. Operational Workflows</h2>
        <p className="text-muted-foreground mb-6">
          Day-to-day procedures for running 360 feedback cycles from enrollment through results release.
        </p>
      </div>

      {/* Cycle Lifecycle */}
      <Card data-manual-anchor="sec-3-1" id="sec-3-1">
        <CardHeader><CardTitle className="flex items-center gap-2"><PlayCircle className="h-5 w-5" />3.1 Cycle Lifecycle Management</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            {['Draft', 'Active', 'In Progress', 'Completed', 'Closed'].map((status, i) => (
              <div key={status} className="flex items-center gap-2">
                <Badge variant={i === 2 ? 'default' : 'outline'}>{status}</Badge>
                {i < 4 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remaining workflow sections */}
      {[
        { id: 'sec-3-2', num: '3.2', title: 'Participant Enrollment', desc: 'Adding employees with eligibility filtering and bulk operations' },
        { id: 'sec-3-3', num: '3.3', title: 'Peer Nomination Process', desc: 'Employee-driven peer selection with manager approval workflow' },
        { id: 'sec-3-4', num: '3.4', title: 'Rater Assignment & Requests', desc: 'Creating feedback requests and managing rater relationships' },
        { id: 'sec-3-5', num: '3.5', title: 'Response Collection & Monitoring', desc: 'Tracking completion rates and response quality' },
        { id: 'sec-3-6', num: '3.6', title: 'Reminder Management', desc: 'Automated and manual reminder scheduling' },
        { id: 'sec-3-7', num: '3.7', title: 'External Rater Invitations', desc: 'Managing external stakeholder invitations and access' },
        { id: 'sec-3-8', num: '3.8', title: 'Results Processing & Release', desc: 'Processing responses, HR approval, and results distribution' },
      ].map((section) => (
        <Card key={section.id} data-manual-anchor={section.id} id={section.id}>
          <CardHeader><CardTitle>{section.num} {section.title}</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">{section.desc}</p></CardContent>
        </Card>
      ))}
    </div>
  );
}
