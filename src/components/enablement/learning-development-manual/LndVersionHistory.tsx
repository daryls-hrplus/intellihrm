import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LndVersionHistory() {
  return (
    <div className="space-y-6" id="version-history" data-manual-anchor="version-history">
      <h2 className="text-2xl font-bold">Appendix E: Version History</h2>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <Badge>v1.0.0</Badge>
            <div>
              <p className="font-medium">Initial Release</p>
              <p className="text-sm text-muted-foreground">Complete L&D Administrator Manual with 9 chapters, 86 sections covering LMS, compliance, agencies, and AI features.</p>
              <p className="text-xs text-muted-foreground mt-1">January 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
