import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FEEDBACK_360_GLOSSARY } from '@/types/feedback360Manual';
import { Search, BookOpen } from 'lucide-react';

export function F360Glossary() {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [...new Set(FEEDBACK_360_GLOSSARY.map(item => item.category))];
  
  const filteredTerms = FEEDBACK_360_GLOSSARY.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedTerms = categories.reduce((acc, category) => {
    acc[category] = filteredTerms.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, typeof FEEDBACK_360_GLOSSARY>);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Glossary
        </h2>
        <p className="text-muted-foreground mb-6">
          {FEEDBACK_360_GLOSSARY.length} terms and definitions for 360 Feedback.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {categories.map(category => {
        const terms = groupedTerms[category];
        if (!terms || terms.length === 0) return null;
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category}
                <Badge variant="secondary">{terms.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {terms.map((item) => (
                  <div key={item.term} className="border-b pb-3 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-sm">{item.term}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.definition}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
