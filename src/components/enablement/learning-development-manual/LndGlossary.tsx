import { Card } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { LND_GLOSSARY, getLndGlossaryByCategory } from '@/types/learningDevelopmentManual';

export function LndGlossary() {
  const categories = ['Core', 'LMS', 'Compliance', 'Agency', 'Workflow', 'Analytics', 'Integration', 'AI'] as const;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <BookOpen className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Appendix D: Glossary</h2>
          <p className="text-muted-foreground">80+ Learning & Development terms and definitions</p>
        </div>
      </div>
      {categories.map(cat => (
        <div key={cat}>
          <h3 className="text-lg font-semibold mb-3">{cat}</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {getLndGlossaryByCategory(cat).slice(0, 6).map(term => (
              <Card key={term.term} className="p-3">
                <p className="font-medium text-sm">{term.term}</p>
                <p className="text-xs text-muted-foreground">{term.definition}</p>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
