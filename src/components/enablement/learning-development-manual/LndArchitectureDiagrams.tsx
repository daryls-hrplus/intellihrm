import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LndArchitectureDiagrams() {
  return (
    <div className="space-y-6" id="diagrams" data-manual-anchor="diagrams">
      <h2 className="text-2xl font-bold">Appendix B: Architecture Diagrams</h2>
      <Card>
        <CardHeader><CardTitle>Course Hierarchy</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">{`
┌─────────────────────────────────────────────────────────────┐
│                      lms_categories                         │
│              (Compliance, Technical, Leadership)            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                       lms_courses                           │
│         (title, description, thumbnail, duration)           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                       lms_modules                           │
│              (title, description, order)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                       lms_lessons                           │
│       (title, content_type, content_url, duration)          │
└─────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
