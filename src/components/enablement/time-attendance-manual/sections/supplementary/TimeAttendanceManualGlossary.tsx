import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { TIME_ATTENDANCE_GLOSSARY } from '@/types/timeAttendanceManual';

export function TimeAttendanceManualGlossary() {
  const glossaryEntries = Object.values(TIME_ATTENDANCE_GLOSSARY);

  return (
    <Card id="glossary" data-manual-anchor="glossary" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-500" />
          <CardTitle>Glossary</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {glossaryEntries.map((entry, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">{entry.term}</h4>
              <p className="text-sm text-muted-foreground mt-1">{entry.definition}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
