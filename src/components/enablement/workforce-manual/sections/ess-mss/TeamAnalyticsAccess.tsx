import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, IntegrationCallout } from '@/components/enablement/manual/components';
import { BarChart3, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { SeeAlsoReference } from '@/components/enablement/shared/CrossModuleReference';

export const TeamAnalyticsAccess: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-none">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Overview</h3>
        <p className="text-foreground leading-relaxed">
          Team Analytics in MSS provides managers with role-appropriate access to workforce analytics 
          for their direct and indirect reports. This feature delivers key metrics from the Workforce 
          Analytics Dashboard (Part 7) filtered to the manager's span of control.
        </p>
      </div>

      <FeatureCardGrid columns={2}>
        <FeatureCard 
          variant="primary" 
          icon={BarChart3} 
          title="Team Metrics Dashboard"
          description="Headcount, turnover, tenure distribution, and diversity metrics for your team"
        />
        <FeatureCard 
          variant="success" 
          icon={Users} 
          title="Span of Control View"
          description="Analytics automatically scoped to direct reports and downstream hierarchy"
        />
        <FeatureCard 
          variant="warning" 
          icon={AlertTriangle} 
          title="Risk Indicators"
          description="Attrition risk, flight risk, and succession gap alerts for team members"
        />
        <FeatureCard 
          variant="purple" 
          icon={TrendingUp} 
          title="Trend Analysis"
          description="Historical trends in team composition, movement, and performance"
        />
      </FeatureCardGrid>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-foreground">Available Team Metrics</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-foreground">
          <div>
            <span className="font-medium">Headcount & Composition:</span>
            <ul className="list-disc list-inside mt-1 text-muted-foreground">
              <li>Active employees count</li>
              <li>FTE vs contractor mix</li>
              <li>Tenure distribution</li>
              <li>Age demographics</li>
            </ul>
          </div>
          <div>
            <span className="font-medium">Movement & Risk:</span>
            <ul className="list-disc list-inside mt-1 text-muted-foreground">
              <li>Turnover rate (voluntary/involuntary)</li>
              <li>Internal mobility</li>
              <li>Attrition risk scores</li>
              <li>Succession coverage</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="Team Analytics Dashboard - Manager view of team workforce metrics"
        alt="Screenshot of the MSS Team Analytics showing headcount, turnover, and risk indicators"
      />

      <SeeAlsoReference
        moduleCode="WF"
        moduleName="Workforce"
        sectionId="wf-sec-7-1"
        sectionTitle="Analytics Dashboard Configuration"
        description="Configure analytics widgets, data sources, and role-based visibility rules"
        manualPath="/enablement/manuals/workforce"
      />

      <IntegrationCallout title="Full MSS Manual">
        For comprehensive coverage of all Team Analytics features including drill-down 
        reports, export options, and executive summaries, see the dedicated MSS Manual.
      </IntegrationCallout>
    </div>
  );
};
