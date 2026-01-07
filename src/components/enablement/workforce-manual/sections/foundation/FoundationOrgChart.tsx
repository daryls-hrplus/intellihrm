import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Eye, Calendar, Download, GitCompare } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type Step
} from '../../../manual/components';

const viewingSteps: Step[] = [
  {
    title: "Navigate to Org Chart",
    description: "Go to Workforce → Org Chart",
    expectedResult: "Org Chart page displays with company selector"
  },
  {
    title: "Select Company",
    description: "Choose a company from the dropdown to view its structure",
    expectedResult: "Org chart loads showing position hierarchy"
  },
  {
    title: "Filter by Department",
    description: "Optionally select a specific department to focus the view",
    expectedResult: "Chart filters to show only selected department hierarchy"
  },
  {
    title: "Expand/Collapse Nodes",
    description: "Click chevron icons to expand or collapse position branches",
    expectedResult: "Hierarchy reveals or hides subordinate positions"
  },
  {
    title: "View Employee Details",
    description: "Each position card shows assigned employees with avatars",
    expectedResult: "Employee names and primary position indicators visible"
  }
];

const asOfDateSteps: Step[] = [
  {
    title: "Access As-of Date",
    description: "Locate the date picker in the org chart toolbar",
    expectedResult: "Current date shown; can be changed"
  },
  {
    title: "Select Historical Date",
    description: "Pick a past date to see org structure at that point in time",
    expectedResult: "Chart refreshes to show positions/employees active on that date"
  },
  {
    title: "Select Future Date",
    description: "Pick a future date to preview planned changes",
    expectedResult: "Shows positions with start dates before/on selected date"
  }
];

const comparisonSteps: Step[] = [
  {
    title: "Enable Comparison Mode",
    description: "Toggle 'Comparison Mode' in the toolbar",
    expectedResult: "Second date picker appears; summary badges show"
  },
  {
    title: "Select Comparison Date",
    description: "Choose an earlier date to compare against current view",
    expectedResult: "Positions color-coded: green (added), red (removed)"
  },
  {
    title: "Review Changes Summary",
    description: "View the summary badges showing Added, Removed, Unchanged counts",
    expectedResult: "Quick visibility into organizational changes between dates"
  }
];

const exportSteps: Step[] = [
  {
    title: "Select Export Scope",
    description: "Right-click on a position or use the menu (⋮) → Export to PDF",
    expectedResult: "Export menu appears"
  },
  {
    title: "Export Subtree",
    description: "Exports the selected position and all subordinates",
    expectedResult: "PDF downloads with visual org chart representation"
  },
  {
    title: "Export Full Chart",
    description: "Use toolbar export for entire company org chart",
    expectedResult: "Complete hierarchy exported to PDF"
  }
];

const chartFeatures = [
  { feature: "As-of Date Navigation", description: "View org structure at any point in time", badge: "Implemented" },
  { feature: "Comparison Mode", description: "See changes between two dates with visual indicators", badge: "Implemented" },
  { feature: "PDF Export", description: "Export chart or subtree to PDF for sharing", badge: "Implemented" },
  { feature: "Department Filter", description: "Focus view on specific departments", badge: "Implemented" },
  { feature: "Expand/Collapse All", description: "Quick navigation controls for large charts", badge: "Implemented" },
  { feature: "Fullscreen Mode", description: "Maximize chart for presentations", badge: "Implemented" },
  { feature: "Employee Avatars", description: "Visual identification on position cards", badge: "Implemented" }
];

export function FoundationOrgChart() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Navigate the interactive org chart visualization",
          "Use as-of date to view historical and future structures",
          "Compare organization between two time periods",
          "Export org charts to PDF for reporting and sharing"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Org Chart Visualization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Org Chart provides an interactive visual representation of your 
            organization hierarchy. It shows positions, their reporting relationships, 
            and assigned employees with time-based navigation capabilities.
          </p>
          
          <div className="grid gap-3 md:grid-cols-2">
            {chartFeatures.map((item) => (
              <div key={item.feature} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{item.feature}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Badge variant="default" className="text-xs">{item.badge}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder
        caption="Figure 2.9.1: Interactive Org Chart with position hierarchy and employee assignments"
        alt="Org chart visualization showing positions, reporting lines, and employee avatars"
        aspectRatio="wide"
      />

      <StepByStep
        title="Viewing the Org Chart"
        steps={viewingSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.9.2: Org Chart with department filter applied"
        alt="Filtered org chart showing only HR department hierarchy"
        aspectRatio="wide"
      />

      <StepByStep
        title="As-of Date Navigation"
        steps={asOfDateSteps}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Comparison Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Compare your organization structure between two points in time to 
            visualize changes, additions, and removals.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border bg-green-500/10 border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500">Added</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Positions that exist on current date but not on comparison date
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="destructive">Removed</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Positions that existed on comparison date but not current date
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Unchanged</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Positions that exist on both dates (may have different employees)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Using Comparison Mode"
        steps={comparisonSteps}
      />

      <ScreenshotPlaceholder
        caption="Figure 2.9.3: Comparison Mode showing position changes between two dates"
        alt="Org chart with green and red highlights indicating added and removed positions"
        aspectRatio="wide"
      />

      <StepByStep
        title="Exporting Org Charts"
        steps={exportSteps}
      />

      <InfoCallout title="Position vs. Employee">
        The org chart displays positions, not employees. Positions are the boxes in 
        the chart; employees are assigned to positions. A vacant position still 
        appears in the chart but shows "No employees assigned."
      </InfoCallout>

      <TipCallout title="Reorganization Planning">
        Use As-of Date with a future date to preview planned reorganizations. 
        Create positions with future start dates, then view the chart at that 
        date to validate the new structure before it goes live.
      </TipCallout>
    </div>
  );
}
