import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LndQuickReference() {
  return (
    <div className="space-y-6" id="quick-ref" data-manual-anchor="quick-ref">
      <h2 className="text-2xl font-bold">Appendix A: Quick Reference Cards</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { role: 'Employee', tasks: ['Browse course catalog', 'Enroll in courses', 'Track my progress', 'Complete quizzes', 'Download certificates'] },
          { role: 'Manager', tasks: ['View team training status', 'Assign training', 'Approve requests', 'Monitor compliance', 'Review team analytics'] },
          { role: 'L&D Admin', tasks: ['Create courses & modules', 'Configure quizzes', 'Manage compliance rules', 'Track analytics', 'Generate reports'] },
          { role: 'HR Partner', tasks: ['Bulk enrollments', 'Training requests', 'Budget management', 'Compliance oversight', 'External training records'] },
        ].map(card => (
          <Card key={card.role}>
            <CardHeader><CardTitle>{card.role}</CardTitle></CardHeader>
            <CardContent><ul className="space-y-1">{card.tasks.map(t => <li key={t} className="text-sm">• {t}</li>)}</ul></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
