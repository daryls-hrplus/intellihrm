import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, HelpCircle, Gauge, Shield } from 'lucide-react';
import { 
  TroubleshootingCommonIssues, 
  TroubleshootingPerformance, 
  TroubleshootingSecurity 
} from './sections/troubleshooting';

export const HRHubManualTroubleshootingSection: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Part 8 Header */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <div>
                <CardTitle className="text-2xl">Part 8: Troubleshooting & Best Practices</CardTitle>
                <CardDescription className="mt-1">
                  Common issues, performance optimization, and security considerations for HR Hub administrators
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">~30 minutes</Badge>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">HR Admin</Badge>
            <Badge variant="outline">IT Support</Badge>
            <Badge variant="outline">Compliance</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-5 w-5 text-amber-500" />
                <p className="font-semibold text-sm">8.1 Common Issues</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Help Desk, Knowledge Base, SOP, and Workflow troubleshooting
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-5 w-5 text-blue-500" />
                <p className="font-semibold text-sm">8.2 Performance</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Optimization strategies, maintenance schedules, health metrics
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-destructive" />
                <p className="font-semibold text-sm">8.3 Security</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Access control, data protection, incident response procedures
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 8.1: Common Issues & Solutions */}
      <TroubleshootingCommonIssues />

      {/* Section 8.2: Performance Optimization */}
      <TroubleshootingPerformance />

      {/* Section 8.3: Security Considerations */}
      <TroubleshootingSecurity />
    </div>
  );
};
