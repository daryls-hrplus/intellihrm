import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function LndQuickReference() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <FileText className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Appendix A: Quick Reference Cards</h2>
          <p className="text-muted-foreground">Role-based task checklists for common L&D operations</p>
        </div>
      </div>
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
