import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Settings, Link } from 'lucide-react';
import { 
  LearningObjectives,
  StepByStep,
  FieldReferenceTable,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  InfoCallout,
  type Step,
  type FieldDefinition,
  type ExampleConfig,
  type BusinessRule
} from '../../../manual/components';
import { FeatureStatusBadge } from '../../components';

const companyGroupFields: FieldDefinition[] = [
  {
    name: "Group Name",
    type: "Text",
    required: true,
    description: "Display name for the company group (e.g., 'ABC Holdings')",
    validation: "2-150 characters, must be unique"
  },
  {
    name: "Group Code",
    type: "Text",
    required: true,
    description: "Short code for system reference and integration",
    validation: "2-20 characters, uppercase, alphanumeric",
    defaultValue: "Auto-generated from name"
  },
  {
    name: "Territory",
    type: "Select",
    required: false,
    description: "Parent territory (if using territories)"
  },
  {
    name: "Description",
    type: "Text Area",
    required: false,
    description: "Purpose and scope of the company group"
  },
  {
    name: "Holding Company",
    type: "Toggle",
    required: true,
    description: "Whether this is a holding/parent company structure",
    defaultValue: "False"
  },
  {
    name: "Consolidated Reporting",
    type: "Toggle",
    required: true,
    description: "Enable cross-company consolidated reports",
    defaultValue: "True"
  },
  {
    name: "Shared Settings",
    type: "Multi-Select",
    required: false,
    description: "Settings inherited by all companies in the group"
  },
  {
    name: "Is Active",
    type: "Toggle",
    required: true,
    description: "Whether the company group is active",
    defaultValue: "True"
  }
];

const creationSteps: Step[] = [
  {
    title: "Navigate to Company Groups",
    description: "Go to Admin → Organization → Company Groups",
    expectedResult: "Company Groups list page displays"
  },
  {
    title: "Click Create Company Group",
    description: "Click the 'Add Company Group' button",
    expectedResult: "Company group creation form opens"
  },
  {
    title: "Enter Group Details",
    description: "Fill in the group name and configuration",
    substeps: [
      "Enter a descriptive name (e.g., 'XYZ Holdings Limited')",
      "Review or modify the auto-generated code",
      "Select parent territory if applicable",
      "Add description explaining the group purpose"
    ]
  },
  {
    title: "Configure Group Settings",
    description: "Set holding company and reporting options",
    substeps: [
      "Enable 'Holding Company' if this represents a parent entity",
      "Enable 'Consolidated Reporting' for cross-company analytics",
      "Select shared settings to cascade to child companies"
    ]
  },
  {
    title: "Save Company Group",
    description: "Click 'Create' to save the new company group",
    expectedResult: "Company group appears in the list"
  }
];

const configExamples: ExampleConfig[] = [
  {
    title: "Multi-Company Holding Structure",
    context: "A holding company with multiple operating subsidiaries",
    values: [
      { field: "Group Name", value: "Caribbean Holdings Ltd" },
      { field: "Group Code", value: "CARIBHOLD" },
      { field: "Territory", value: "Caribbean Region" },
      { field: "Holding Company", value: "Yes" },
      { field: "Consolidated Reporting", value: "Yes" },
      { field: "Shared Settings", value: "Leave Policies, Security Settings, AI Governance" }
    ],
    outcome: "Subsidiaries inherit core policies while maintaining operational independence"
  },
  {
    title: "Single Operating Entity",
    context: "A standalone company without holding structure",
    values: [
      { field: "Group Name", value: "ABC Manufacturing" },
      { field: "Group Code", value: "ABCMFG" },
      { field: "Territory", value: "None (single country)" },
      { field: "Holding Company", value: "No" },
      { field: "Consolidated Reporting", value: "No" }
    ],
    outcome: "Simplified structure for single-entity operations"
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: "Company groups must have unique codes across the system",
    enforcement: "System",
    description: "Prevents duplicate identifiers for integration reliability"
  },
  {
    rule: "Shared settings cascade to all child companies",
    enforcement: "Policy",
    description: "Child companies can override inherited settings with approval"
  },
  {
    rule: "Holding company flag affects financial consolidation",
    enforcement: "Advisory",
    description: "Enables specific consolidation reports when set"
  },
  {
    rule: "Deletion requires no active child companies",
    enforcement: "System",
    description: "Must reassign or archive child companies first"
  }
];

const sharedSettingsOptions = [
  { setting: "Leave Policies", description: "Standardize leave types and accrual rules", status: 'implemented' as const },
  { setting: "Security Settings", description: "Unified password and MFA policies", status: 'implemented' as const },
  { setting: "AI Governance", description: "Common AI usage limits and guardrails", status: 'implemented' as const },
  { setting: "Notification Templates", description: "Consistent communication branding", status: 'implemented' as const },
  { setting: "Approval Workflows", description: "Standardized approval routing", status: 'implemented' as const }
];

export function FoundationCompanyGroups() {
  return (
    <div className="space-y-8">
      <LearningObjectives
        objectives={[
          "Understand the role of company groups in organizational structure",
          "Configure company groups for holding and operating entities",
          "Enable settings inheritance for policy consistency",
          "Set up consolidated reporting across entities"
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Understanding Company Groups
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Company Groups organize related legal entities under a common umbrella, 
            enabling shared configurations, consolidated reporting, and governance 
            alignment. They are essential for holding company structures and multi-entity 
            organizations.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Link className="h-4 w-4 text-blue-500" />
                Holding Company Mode
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <p className="text-sm text-muted-foreground">
                For parent companies with subsidiaries. Enables consolidated financial 
                views, cross-company transfers, and group-level governance.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-green-500" />
                Settings Inheritance
                <FeatureStatusBadge status="implemented" size="sm" />
              </h4>
              <p className="text-sm text-muted-foreground">
                Shared settings cascade to child companies, ensuring consistency 
                while allowing local overrides where needed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable
        title="Company Group Field Reference"
        fields={companyGroupFields}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Shared Settings Options
            <FeatureStatusBadge status="implemented" size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {sharedSettingsOptions.map((opt) => (
              <div key={opt.setting} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <h4 className="font-medium text-sm">{opt.setting}</h4>
                  <p className="text-sm text-muted-foreground">{opt.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <FeatureStatusBadge status={opt.status} size="sm" />
                  <Badge variant="secondary">Inheritable</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep
        title="Creating a Company Group"
        steps={creationSteps}
      />

      <ConfigurationExample
        title="Company Group Configuration Examples"
        examples={configExamples}
      />

      <BusinessRules
        title="Company Group Business Rules"
        rules={businessRules}
      />

      <InfoCallout title="When to Use Company Groups">
        Use company groups when you have: (1) Multiple legal entities, (2) Need for 
        consolidated reporting, (3) Shared policy requirements, or (4) Cross-company 
        employee movements. Single-entity organizations can skip directly to Company setup.
      </InfoCallout>

      <TipCallout title="Best Practice: Settings Strategy">
        Define shared settings at the group level for consistency, but document which 
        settings can be overridden at company level. This balances governance with 
        operational flexibility.
      </TipCallout>
    </div>
  );
}
