import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LndLegacyMapping() {
  return (
    <div className="space-y-6" id="legacy-mapping" data-manual-anchor="legacy-mapping">
      <h2 className="text-2xl font-bold">Appendix C: Legacy Migration Mapping</h2>
      <p className="text-muted-foreground">Field mappings from HRplus Training to Intelli HRM L&D module.</p>
      <Card>
        <CardHeader><CardTitle>Table Mappings</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left p-2">HRplus (Legacy)</th><th className="text-left p-2">Intelli HRM</th></tr></thead>
            <tbody>
              {[
                ['Training Types', 'lms_categories'],
                ['Training Courses', 'lms_courses'],
                ['Training Staff', 'training_instructors'],
                ['Training Requests', 'training_requests'],
                ['Training History', 'lms_enrollments + external_training_records'],
                ['Course Evaluation', 'training_evaluations'],
                ['Training Agencies', 'training_agencies (NEW)'],
              ].map(([legacy, modern]) => (
                <tr key={legacy} className="border-b"><td className="p-2">{legacy}</td><td className="p-2 font-mono text-xs">{modern}</td></tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
