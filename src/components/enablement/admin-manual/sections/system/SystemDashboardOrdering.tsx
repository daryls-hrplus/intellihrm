import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, GripVertical, Eye, EyeOff } from 'lucide-react';
import { LearningObjectives, TipCallout, InfoCallout, ScreenshotPlaceholder } from '../../../manual/components';

export function SystemDashboardOrdering() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Configure default dashboard layouts for user roles",
          "Arrange widget ordering and visibility",
          "Set up role-specific dashboard views",
          "Manage widget permissions and data scope"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Dashboard Configuration Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Dashboard Ordering allows you to configure the default widget layout 
            for each user role. Users see relevant information first, improving 
            productivity and user experience.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <GripVertical className="h-5 w-5 text-primary mb-2" />
              <h4 className="font-medium text-sm">Drag & Drop Ordering</h4>
              <p className="text-xs text-muted-foreground">
                Reorder widgets by priority for each role
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <Eye className="h-5 w-5 text-green-500 mb-2" />
              <h4 className="font-medium text-sm">Visibility Control</h4>
              <p className="text-xs text-muted-foreground">
                Show or hide widgets based on role permissions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 5.6.1: Dashboard ordering and widget configuration"
        alt="Dashboard configuration interface with draggable widget list and role selector"
        aspectRatio="wide"
      />

      <Card>
        <CardHeader>
          <CardTitle>Available Widgets by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">Employee (ESS)</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {["My Leave Balance", "Upcoming Holidays", "My Tasks", "Team Calendar", "Announcements"].map((widget) => (
                  <Badge key={widget} variant="outline">{widget}</Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">Manager (MSS)</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Team Overview", "Pending Approvals", "Team Leave Calendar", "Headcount Summary", "Performance Due", "Team Birthdays"].map((widget) => (
                  <Badge key={widget} variant="outline">{widget}</Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">HR Admin</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {["HR Metrics", "Open Requisitions", "Onboarding Pipeline", "Compliance Alerts", "Turnover Chart", "Upcoming Reviews"].map((widget) => (
                  <Badge key={widget} variant="outline">{widget}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <InfoCallout title="User Customization">
        While admins set the default layout, users can personalize their own 
        dashboard by adding, removing, or reordering widgets within their 
        permission scope.
      </InfoCallout>

      <TipCallout title="Performance Widgets First">
        Place the most actionable widgets (Pending Approvals, Tasks Due) at the 
        top. Informational widgets (Announcements, Metrics) work well lower in 
        the layout.
      </TipCallout>
    </div>
  );
}
