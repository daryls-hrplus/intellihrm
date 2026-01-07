import {
  Callout,
  InfoCallout,
  WarningCallout,
  TipCallout,
  NoteCallout,
  SuccessCallout,
  CriticalCallout,
  ComplianceCallout,
  IndustryCallout,
  IntegrationCallout,
  SecurityCallout,
  FutureCallout
} from './Callout';

/**
 * CalloutGuide - Reference component showing all available callout types
 * 
 * Use this component as a reference when building manual sections.
 * Import individual callout components as needed.
 * 
 * ## Usage Guide
 * 
 * | When to Use | Component | Visual |
 * |-------------|-----------|--------|
 * | General information | `InfoCallout` | Blue border |
 * | Best practices, tips | `TipCallout` | Emerald border |
 * | Cautions, warnings | `WarningCallout` | Amber border |
 * | Prerequisites | `Callout variant="prerequisite"` | Amber border |
 * | Critical compliance | `CriticalCallout` | Red border |
 * | Cross-module links | `IntegrationCallout` | Violet border |
 * | Security notices | `SecurityCallout` | Red border |
 * | Regulatory requirements | `ComplianceCallout` | Red border |
 * | Industry context | `IndustryCallout` | Blue border |
 * | Future features | `FutureCallout` | Indigo border |
 * | Additional notes | `NoteCallout` | Purple border |
 * | Success confirmations | `SuccessCallout` | Green border |
 */
export function CalloutGuide() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Callout Component Reference</h2>
      <p className="text-muted-foreground">
        All available callout variants for use across implementation manuals.
      </p>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Information & Context</h3>
        
        <InfoCallout title="Info Callout">
          Use for general information, explanations, or context that helps users understand a concept.
        </InfoCallout>

        <IndustryCallout title="Industry Callout">
          Use for industry best practices, benchmarks, or contextual information from the field.
        </IndustryCallout>

        <NoteCallout title="Note Callout">
          Use for additional notes, references, or supplementary information.
        </NoteCallout>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Guidance & Tips</h3>
        
        <TipCallout title="Tip Callout">
          Use for best practices, helpful tips, or recommended approaches.
        </TipCallout>

        <SuccessCallout title="Success Callout">
          Use for success confirmations, positive outcomes, or completed actions.
        </SuccessCallout>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Warnings & Prerequisites</h3>
        
        <WarningCallout title="Warning Callout">
          Use for cautions, potential issues, or things to be aware of.
        </WarningCallout>

        <Callout variant="prerequisite" title="Prerequisite Callout">
          Use for required steps, dependencies, or things that must be done first.
        </Callout>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Critical & Compliance</h3>
        
        <CriticalCallout title="Critical Callout">
          Use for critical warnings, breaking changes, or urgent issues that require immediate attention.
        </CriticalCallout>

        <ComplianceCallout title="Compliance Callout">
          Use for regulatory requirements, legal obligations, or compliance mandates.
        </ComplianceCallout>

        <SecurityCallout title="Security Callout">
          Use for security-related notices, access controls, or data protection requirements.
        </SecurityCallout>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Integration & Future</h3>
        
        <IntegrationCallout title="Integration Callout">
          Use for cross-module connections, data flow between systems, or integration points.
        </IntegrationCallout>

        <FutureCallout title="Future Callout">
          Use for roadmap items, planned features, or upcoming enhancements.
        </FutureCallout>
      </div>
    </div>
  );
}
