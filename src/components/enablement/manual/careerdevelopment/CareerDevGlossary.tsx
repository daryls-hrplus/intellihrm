import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { CAREER_DEV_GLOSSARY } from '@/types/careerDevelopmentManual';

export function CareerDevGlossary() {
  return (
    <div className="space-y-8">
      <section id="glossary" data-manual-anchor="glossary" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold">C. Glossary</h2>
        </div>
      </section>
      <Card>
        <CardHeader><CardTitle>Career Development Terms</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {CAREER_DEV_GLOSSARY.slice(0, 10).map((term) => (
            <div key={term.term} className="border-b pb-2 last:border-0">
              <p className="font-medium">{term.term}</p>
              <p className="text-sm text-muted-foreground">{term.definition}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
