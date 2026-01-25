import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

export function F360Diagrams() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Architecture Diagrams</h2>
        <p className="text-muted-foreground mb-6">
          Visual representations of the 360 Feedback system architecture and workflows.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            360 Feedback Cycle Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-muted/30 rounded-lg text-center">
            <p className="text-muted-foreground">
              Draft → Active → Nominations → Collection → Processing → Release → Closed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Architecture Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Cycle Management</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• review_cycles</li>
                <li>• feedback_360_cycles</li>
                <li>• review_participants</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Feedback Collection</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• feedback_360_requests</li>
                <li>• feedback_360_responses</li>
                <li>• feedback_submissions</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Governance & AI</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• feedback_consent_records</li>
                <li>• talent_signal_snapshots</li>
                <li>• development_themes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
