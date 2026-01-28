import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LND_GLOSSARY, getLndGlossaryByCategory } from '@/types/learningDevelopmentManual';

export function LndGlossary() {
  const categories = ['Core', 'LMS', 'Compliance', 'Agency', 'Workflow', 'Analytics', 'Integration', 'AI'] as const;
  
  return (
    <div className="space-y-6" id="glossary" data-manual-anchor="glossary">
      <h2 className="text-2xl font-bold">Appendix D: Glossary</h2>
      <p className="text-muted-foreground">80+ Learning & Development terms and definitions.</p>
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
