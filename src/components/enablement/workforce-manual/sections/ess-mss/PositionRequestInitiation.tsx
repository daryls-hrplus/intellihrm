import React from 'react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, IntegrationCallout, TipCallout } from '@/components/enablement/manual/components';
import { FilePlus, UserPlus, GitBranch, CheckCircle } from 'lucide-react';
import { SeeAlsoReference } from '@/components/enablement/shared/CrossModuleReference';

export const PositionRequestInitiation: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="max-w-none">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Overview</h3>
        <p className="text-foreground leading-relaxed">
          Position Request Initiation enables managers to request new positions or backfills directly 
          from MSS. These requests feed into the Workforce Module's Position Control and Headcount 
          Request workflows (Part 6), ensuring proper budget approval and workforce planning alignment.
        </p>
      </div>

      <FeatureCardGrid columns={2}>
        <FeatureCard 
          variant="primary" 
          icon={FilePlus} 
          title="New Position Request"
          description="Initiate requests for new headcount with justification and budget impact"
        />
        <FeatureCard 
          variant="success" 
          icon={UserPlus} 
          title="Backfill Request"
          description="Request replacement for vacated positions with optional modifications"
        />
        <FeatureCard 
          variant="purple" 
          icon={GitBranch} 
          title="Workflow Routing"
          description="Requests route through configured approval chains based on position type and cost"
        />
        <FeatureCard 
          variant="warning" 
          icon={CheckCircle} 
          title="Status Tracking"
          description="Monitor request progress through approval stages to final decision"
        />
      </FeatureCardGrid>

      <div className="bg-muted/30 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 text-foreground">Request Types & Workflow</h4>
        <div className="space-y-3 text-sm text-foreground">
          <div className="flex items-start gap-3">
            <span className="font-medium min-w-28">New Position:</span>
            <span>Creates a new position in the org structure → Budget review → HR approval → Position creation</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium min-w-28">Backfill:</span>
            <span>Links to vacated position → Manager approval → Fast-track to recruitment</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="font-medium min-w-28">Reorg Position:</span>
            <span>Modify existing position's department/level → Change impact review → HR approval</span>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder 
        caption="Position Request Form - Manager initiating a new headcount request"
        alt="Screenshot of the MSS Position Request form with justification and budget fields"
      />

      <TipCallout>
        Position requests include AI-powered suggestions for job titles, salary bands, and 
        competency requirements based on similar positions in the organization.
      </TipCallout>

      <SeeAlsoReference
        moduleCode="WF"
        moduleName="Workforce"
        sectionId="wf-sec-6-2"
        sectionTitle="Headcount Request Workflow"
        description="Configure approval workflows, budget thresholds, and routing rules for position requests"
        manualPath="/enablement/manuals/workforce"
      />

      <IntegrationCallout title="Full MSS Manual">
        For comprehensive coverage of all position management features including bulk requests, 
        scenario planning, and workforce forecasting, see the dedicated MSS Manual.
      </IntegrationCallout>
    </div>
  );
};
