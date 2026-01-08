import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Clock, MapPin, Users, ArrowRight,
  CheckCircle, AlertCircle, Timer
} from 'lucide-react';
import { FeatureCardGrid, PrimaryFeatureCard, SecondaryFeatureCard, InfoFeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { SeeAlsoReference } from '@/components/enablement/shared/CrossModuleReference';

const leaveTimeFlowDiagram = `
graph LR
    subgraph WORKFORCE["Workforce Data"]
        EMP[Employee Record]
        POS[Position]
        LOC[Work Location]
        SHIFT[Shift Assignment]
    end
    
    subgraph POLICIES["Policy Assignment"]
        LPOL[Leave Policies]
        TPOL[Time Policies]
        SCHED[Work Schedule]
    end
    
    subgraph LEAVE_TIME["Leave & Time Module"]
        BAL[Leave Balances]
        REQ[Leave Requests]
        ATTEND[Attendance Records]
        GEO[Geofencing]
    end
    
    EMP --> LPOL
    POS --> LPOL
    POS --> TPOL
    LOC --> SCHED
    SHIFT --> SCHED
    
    LPOL --> BAL
    BAL --> REQ
    TPOL --> ATTEND
    LOC --> GEO
    SCHED --> ATTEND
    
    style WORKFORCE fill:#e0f2fe,stroke:#0284c7
    style POLICIES fill:#fef3c7,stroke:#d97706
    style LEAVE_TIME fill:#f0fdf4,stroke:#16a34a
`;

const policyAssignments = [
  {
    attribute: 'Employment Type',
    example: 'Permanent vs Contract',
    policyImpact: 'Different leave accrual rates, policy exclusions'
  },
  {
    attribute: 'Position Grade',
    example: 'Executive, Management, Staff',
    policyImpact: 'Enhanced leave entitlements for senior grades'
  },
  {
    attribute: 'Work Location',
    example: 'Country, State/Region',
    policyImpact: 'Jurisdiction-specific leave laws and holidays'
  },
  {
    attribute: 'Tenure',
    example: 'Years of service',
    policyImpact: 'Progressive leave accrual based on seniority'
  },
  {
    attribute: 'Shift Type',
    example: 'Day, Night, Rotating',
    policyImpact: 'Shift differentials, overtime rules'
  }
];

const dataFlowItems = [
  { source: 'Position Assignment', target: 'Shift Schedule', timing: 'On position change' },
  { source: 'Branch Location', target: 'Geofence Boundary', timing: 'On location assignment' },
  { source: 'Employment Type', target: 'Leave Policy', timing: 'On hire/change' },
  { source: 'Manager Hierarchy', target: 'Approval Routing', timing: 'On reporting change' },
  { source: 'Work Schedule', target: 'Attendance Expectation', timing: 'On schedule assignment' }
];

export function LeaveTimeIntegration() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-5">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.5 Leave & Time Integration</h2>
            <p className="text-muted-foreground">
              Position-based leave policies and shift assignments from workforce data
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Workforce-Driven Leave & Time Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Leave policies and time tracking rules are assigned based on workforce attributes. 
            An employee's position, location, employment type, and tenure determine which leave 
            policies apply, how leave accrues, and what time tracking rules govern their attendance.
          </p>
          <p className="text-muted-foreground">
            Work location data enables geofencing for clock-in/out, ensuring employees are at 
            their designated work site when recording attendance.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <FeatureCardGrid columns={3}>
        <PrimaryFeatureCard
          icon={ArrowRight}
          title="Auto Policy Assignment"
          description="Leave and time policies auto-assigned based on position and location"
        />
        <SecondaryFeatureCard
          icon={MapPin}
          title="Location-Based Geofencing"
          description="Work location defines geofence boundaries for attendance validation"
        />
        <InfoFeatureCard
          icon={Timer}
          title="Shift Inheritance"
          description="Position-based shift patterns determine work schedules"
        />
      </FeatureCardGrid>

      {/* Workflow Diagram */}
      <WorkflowDiagram
        title="Leave & Time Data Flow"
        description="How workforce attributes determine leave and time policies"
        diagram={leaveTimeFlowDiagram}
      />

      {/* Policy Assignment Matrix */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Policy Assignment Based on Workforce Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Workforce Attribute</th>
                  <th className="text-left py-3 px-4 font-medium">Example Values</th>
                  <th className="text-left py-3 px-4 font-medium">Policy Impact</th>
                </tr>
              </thead>
              <tbody>
                {policyAssignments.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.attribute}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.example}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.policyImpact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow Table */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Data Synchronization Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Source (Workforce)</th>
                  <th className="text-left py-3 px-4 font-medium">Target (Leave/Time)</th>
                  <th className="text-left py-3 px-4 font-medium">Sync Timing</th>
                </tr>
              </thead>
              <tbody>
                {dataFlowItems.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.source}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{item.target}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        title="ESS Leave Dashboard"
        description="Employee view showing leave balances based on assigned leave policy"
        height="h-64"
      />

      {/* Geofencing Details */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Geofencing & Location Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Branch Location Mapping
              </h4>
              <p className="text-sm text-muted-foreground">
                Each branch/location in the organizational structure has GPS coordinates and 
                geofence radius. Employees assigned to that location inherit the geofence rules.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Multi-Location Employees
              </h4>
              <p className="text-sm text-muted-foreground">
                Employees with multi-position assignments or travel-based roles can have 
                multiple valid geofence locations for attendance recording.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <TipCallout title="Leave Accrual on Hire">
        When a new employee is hired, their leave balance is initialized based on their assigned 
        leave policy, with proration based on hire date if the policy is configured for mid-year starts.
      </TipCallout>

      <WarningCallout title="Transfer Impact">
        When an employee transfers to a new location or position with a different leave policy, 
        existing leave balances may carry over or require adjustment. Review the Leave Policy 
        Transfer Rules in Leave Administration.
      </WarningCallout>

      <InfoCallout title="Overtime Calculation">
        Overtime rules are derived from position type and applicable labor laws for the work location. 
        Time & Attendance uses this to automatically calculate overtime based on hours worked.
      </InfoCallout>

      {/* Cross-References */}
      <SeeAlsoReference
        module="Workforce"
        section="Position Control"
        description="Configure positions with shift patterns and work schedules"
        manualPath="/enablement/manuals/workforce"
        anchor="wf-sec-6-1"
      />
    </div>
  );
}
