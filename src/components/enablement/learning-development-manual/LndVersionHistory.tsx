import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';

export function LndVersionHistory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-500/10 rounded-lg">
          <History className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Appendix H: Version History</h2>
          <p className="text-muted-foreground">Document revision history and change log</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <Badge>v1.1.0</Badge>
            <div>
              <p className="font-medium">Appendix Enhancement Release</p>
              <p className="text-sm text-muted-foreground">Added Chapter 10 Appendix with 8 sections: Quick Reference, Architecture Diagrams, Acronyms, Glossary, Integration Points, Role Permissions, Error Codes, and Version History.</p>
              <p className="text-xs text-muted-foreground mt-1">January 2026</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Badge variant="outline">v1.0.1</Badge>
            <div>
              <p className="font-medium">Chapter 9 Enhancement</p>
              <p className="text-sm text-muted-foreground">Expanded troubleshooting to 144 documented issues across 14 sections with SQL diagnostic query reference.</p>
              <p className="text-xs text-muted-foreground mt-1">January 2026</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Badge variant="outline">v1.0.0</Badge>
            <div>
              <p className="font-medium">Initial Release</p>
              <p className="text-sm text-muted-foreground">Complete L&D Administrator Manual with 9 chapters covering LMS, compliance, vendors, AI, and integration.</p>
              <p className="text-xs text-muted-foreground mt-1">January 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
