import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock } from 'lucide-react';
import { 
  SentimentMonitoringSetup, 
  RecognitionAnalyticsSetup, 
  DashboardConfigurationSetup 
} from './sections/analytics';

export const HRHubManualAnalyticsSection: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Part 7 Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Part 7: Analytics & Insights</CardTitle>
                <CardDescription className="mt-1">
                  Workforce analytics, sentiment monitoring, recognition tracking, and automated reporting
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">~25 minutes</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-semibold text-sm">7.1 Sentiment Monitoring</p>
              <p className="text-xs text-muted-foreground mt-1">
                AI-powered workforce sentiment and engagement analytics
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-semibold text-sm">7.2 Recognition Analytics</p>
              <p className="text-xs text-muted-foreground mt-1">
                Program effectiveness, participation, and values alignment
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-semibold text-sm">7.3 Dashboard & Reports</p>
              <p className="text-xs text-muted-foreground mt-1">
                Scheduled report delivery and dashboard configuration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 7.1: Sentiment Monitoring */}
      <SentimentMonitoringSetup />

      {/* Section 7.2: Recognition Analytics */}
      <RecognitionAnalyticsSetup />

      {/* Section 7.3: Dashboard Configuration */}
      <DashboardConfigurationSetup />
    </div>
  );
};
