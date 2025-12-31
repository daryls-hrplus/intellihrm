import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, HelpCircle, Shield } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function ManualTroubleshootingSection() {
  return (
    <div className="space-y-8">
      <Card id="sec-8-1">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 8.1</Badge>
          </div>
          <CardTitle className="text-2xl">Common Issues & Solutions</CardTitle>
          <CardDescription>Frequently encountered problems and fixes</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {[
              { 
                q: 'Employee missing from participant list', 
                a: 'Check eligibility criteria, employment status, and hire date. Ensure employee meets minimum tenure requirements.'
              },
              { 
                q: 'Weight validation error (not 100%)', 
                a: 'Verify that Goals + Competencies + Responsibilities + Values = 100%. Adjust weights in cycle configuration.'
              },
              { 
                q: 'Score calculation mismatch', 
                a: 'Review individual component scores and weights. Check if calibration adjustments were applied.'
              },
              { 
                q: 'Manager cannot see team members', 
                a: 'Verify manager-employee relationships in org hierarchy. Check cycle participant enrollment.'
              },
              { 
                q: 'Integration rule not firing', 
                a: 'Confirm appraisal is finalized, check rule conditions, and verify target module is enabled.'
              }
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    {item.q}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pl-6">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card id="sec-8-2">
        <CardHeader>
          <CardTitle className="text-2xl">Best Practices</CardTitle>
          <CardDescription>Recommendations for optimal appraisal management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              'Launch cycles 4-6 weeks before evaluation window',
              'Communicate timeline to all stakeholders in advance',
              'Provide manager training before each cycle',
              'Schedule calibration sessions within 2 weeks of rating deadline',
              'Complete downstream actions within 30 days of cycle close',
              'Review analytics weekly during active cycles'
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm text-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card id="sec-8-3">
        <CardHeader>
          <CardTitle className="text-2xl">Compliance Checklist</CardTitle>
          <CardDescription>Quarterly/Annual audit requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              'All calibration adjustments have documented justifications',
              'Employee response records are complete and archived',
              'Bias detection reports reviewed and addressed',
              'RLS policies verified for data access control',
              'Audit logs exported and retained per policy'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
