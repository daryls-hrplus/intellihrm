import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Globe, Clock, Database } from 'lucide-react';
import { LearningObjectives, TipCallout, InfoCallout, ScreenshotPlaceholder } from '../../../manual/components';

export function SystemSettings() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Configure global system settings for your Intelli HRM instance",
          "Set regional defaults for date, time, and number formats",
          "Manage system-wide feature toggles and preferences",
          "Understand the impact of settings on all users"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            System Settings Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            System Settings control the fundamental behavior of your Intelli HRM instance. 
            These settings affect all users and should be configured during initial 
            implementation. Changes should follow change management procedures.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border bg-muted/30">
              <Globe className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm">Regional Settings</h4>
              <p className="text-xs text-muted-foreground">
                Date formats, number formats, default language
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <Clock className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm">Time Zone Settings</h4>
              <p className="text-xs text-muted-foreground">
                System timezone, user timezone preferences
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <Database className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm">Feature Toggles</h4>
              <p className="text-xs text-muted-foreground">
                Enable/disable optional system features
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 5.1.1: System Settings configuration page"
        alt="System settings page showing regional configuration, timezone options, and feature toggles"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle>Key Configuration Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Date & Time Formats</h4>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Date Format:</span>
                  <Badge variant="outline">DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Time Format:</span>
                  <Badge variant="outline">12-hour, 24-hour</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Week Start:</span>
                  <Badge variant="outline">Sunday, Monday</Badge>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Number Formats</h4>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Decimal Separator:</span>
                  <Badge variant="outline">. (period) or , (comma)</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Thousands Separator:</span>
                  <Badge variant="outline">, (comma) or . (period) or space</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout title="Regional Consistency">
        Choose formats that match your primary user base. Caribbean and UK users 
        typically prefer DD/MM/YYYY, while US users prefer MM/DD/YYYY. 
        Consistency reduces data entry errors.
      </TipCallout>

      <InfoCallout title="User Overrides">
        While system settings provide defaults, individual users can override 
        some preferences (like date format) in their personal settings.
      </InfoCallout>
    </div>
  );
}
