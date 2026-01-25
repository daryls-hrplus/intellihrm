import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, FileCheck, AlertTriangle } from 'lucide-react';

export function F360GovernanceSection() {
  return (
    <div className="space-y-8">
      <div data-manual-anchor="part-4" id="part-4">
        <h2 className="text-2xl font-bold mb-4">4. Governance & Compliance</h2>
        <p className="text-muted-foreground mb-6">
          Data protection, consent management, investigation mode, and comprehensive audit trails.
        </p>
      </div>

      {[
        { id: 'sec-4-1', num: '4.1', title: 'Anonymity Architecture', icon: Lock, desc: 'Understanding anonymity thresholds, bypass conditions, and protection mechanisms' },
        { id: 'sec-4-2', num: '4.2', title: 'Consent Management', icon: FileCheck, desc: 'Managing rater consent, versioning, and withdrawal workflows (GDPR compliant)' },
        { id: 'sec-4-3', num: '4.3', title: 'Data Policies Configuration', icon: Shield, desc: 'Setting up data retention, access, and processing policies' },
        { id: 'sec-4-4', num: '4.4', title: 'Investigation Mode & Access', icon: AlertTriangle, desc: 'Managing investigation requests, approval workflows, and access logging' },
        { id: 'sec-4-5', num: '4.5', title: 'Exception Handling', icon: Shield, desc: 'Managing rater exceptions, anonymity overrides, and approval workflows' },
        { id: 'sec-4-6', num: '4.6', title: 'Audit Log & Compliance Reporting', icon: FileCheck, desc: 'AI action logs, data access logs, and compliance reports' },
        { id: 'sec-4-7', num: '4.7', title: 'Data Retention Policies', icon: Lock, desc: 'Configuring retention periods (3-7 years) and anonymization schedules' },
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
