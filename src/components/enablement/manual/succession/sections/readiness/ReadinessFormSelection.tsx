// Section 4.3: Form Selection & Assignment
// Staff type matching algorithm, form selection priority

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  IndustryCallout,
  FeatureCardGrid,
  PrimaryFeatureCard,
  SuccessFeatureCard,
  InfoFeatureCard,
} from '../../../components';
import { 
  FileSearch, 
  Users,
  CheckCircle2,
  ArrowDown,
  Settings,
  AlertTriangle
} from 'lucide-react';

export function ReadinessFormSelection() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand the three-tier form selection priority hierarchy",
          "Master the staff type → form matching algorithm logic",
          "Configure applies_to_staff_types for role-appropriate assessments",
          "Handle edge cases when no matching form exists"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Assessment Event Creation → Form Selection Dropdown
        </code>
      </InfoCallout>

      {/* Form Selection Priority */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            Form Selection Priority Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When initiating an assessment event, the system determines which form to use based on 
            a three-tier priority hierarchy:
          </p>

          {/* Priority Diagram */}
          <div className="space-y-3">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">1</div>
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">Explicit Form Selection (Highest Priority)</p>
                <p className="text-sm text-muted-foreground">
                  User manually selects a specific form from the dropdown, overriding auto-detection.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">2</div>
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">Staff Type Match (Auto-Detect)</p>
                <p className="text-sm text-muted-foreground">
                  System matches candidate's staff type against <code className="text-xs bg-muted px-1 py-0.5 rounded">applies_to_staff_types</code> 
                  array on active forms.
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">3</div>
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">Generic Fallback (Lowest Priority)</p>
                <p className="text-sm text-muted-foreground">
                  If no staff type match found, system selects the first active form with empty <code className="text-xs bg-muted px-1 py-0.5 rounded">applies_to_staff_types</code> 
                  (universal form).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Detect Algorithm */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Staff Type Matching Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The auto-detect logic in <code className="text-xs bg-muted px-1.5 py-0.5 rounded">useReadinessAssessment.createEvent</code> 
            follows this algorithm:
          </p>

          {/* Algorithm Pseudocode */}
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap text-foreground">
{`function detectFormForCandidate(candidate, activeForms) {
  // Step 1: Get candidate's staff type from profiles/jobs
  const candidateStaffType = candidate.job?.staff_type_id;
  
  // Step 2: Find forms matching this staff type
  const matchingForms = activeForms.filter(form => 
    form.applies_to_staff_types?.includes(candidateStaffType)
  );
  
  // Step 3: Return first match if found
  if (matchingForms.length > 0) {
    return matchingForms[0]; // Ordered by created_at
  }
  
  // Step 4: Fallback to generic form (null/empty applies_to)
  const genericForms = activeForms.filter(form => 
    !form.applies_to_staff_types || 
    form.applies_to_staff_types.length === 0
  );
  
  return genericForms[0] || null; // May be null if no forms exist
}`}
            </pre>
          </div>

          <WarningCallout>
            <strong>Important:</strong> If the algorithm returns <code className="text-xs bg-muted px-1 py-0.5 rounded">null</code>, 
            the user must manually select a form. The system logs a warning in the console and 
            displays a message prompting manual selection.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Staff Type Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Staff Type → Form Assignment Table
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The recommended configuration for staff-type-specific forms follows industry patterns:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Staff Type</th>
                  <th className="text-left py-3 px-4 font-medium">Recommended Form</th>
                  <th className="text-left py-3 px-4 font-medium">Key Differences</th>
                  <th className="text-left py-3 px-4 font-medium">Indicator Count</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-purple-600">Executive</Badge>
                  </td>
                  <td className="py-3 px-4">Executive Readiness Form</td>
                  <td className="py-3 px-4">Strategic vision, board exposure, enterprise leadership</td>
                  <td className="py-3 px-4">40-50 indicators</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">Manager</Badge>
                  </td>
                  <td className="py-3 px-4">Manager Readiness Form</td>
                  <td className="py-3 px-4">Team leadership, operational execution, talent development</td>
                  <td className="py-3 px-4">32-40 indicators</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">Professional</Badge>
                  </td>
                  <td className="py-3 px-4">Professional Readiness Form</td>
                  <td className="py-3 px-4">Technical expertise, project leadership, collaboration</td>
                  <td className="py-3 px-4">24-32 indicators</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-slate-600">Support</Badge>
                  </td>
                  <td className="py-3 px-4">General Readiness Form</td>
                  <td className="py-3 px-4">Core competencies, reliability, growth mindset</td>
                  <td className="py-3 px-4">16-24 indicators</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge variant="outline">Any (Fallback)</Badge>
                  </td>
                  <td className="py-3 px-4">Universal Readiness Form</td>
                  <td className="py-3 px-4">Role-agnostic indicators for all staff types</td>
                  <td className="py-3 px-4">20-28 indicators</td>
                </tr>
              </tbody>
            </table>
          </div>

          <IndustryCallout>
            <strong>Enterprise Pattern:</strong> Enterprise implementations typically maintain 
            3-5 form variants: Executive, Senior Manager, Manager, Professional, and Universal Fallback. 
            This balances assessment depth with administrative overhead.
          </IndustryCallout>
        </CardContent>
      </Card>

      {/* Form Versioning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Form Versioning Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When modifying forms that are already in use for active assessments:
          </p>

          <FeatureCardGrid columns={2}>
            <PrimaryFeatureCard
              icon={CheckCircle2}
              title="Safe Changes"
              description="Adding new indicators, updating help text, modifying category labels. These apply to future assessments only."
            />
            <InfoFeatureCard
              icon={AlertTriangle}
              title="Breaking Changes"
              description="Removing indicators, changing weights, deactivating categories. May invalidate in-progress assessments."
            />
          </FeatureCardGrid>

          <WarningCallout>
            <strong>Best Practice:</strong> When making significant changes to an active form, create 
            a new version (e.g., "Manager Readiness Form v2") and set the old version to inactive 
            after existing assessments complete. This preserves historical data integrity.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices for Form Assignment">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Always create at least one universal fallback form with empty applies_to_staff_types</li>
          <li>Name forms clearly with staff type in the title (e.g., "Executive Readiness Assessment v1")</li>
          <li>Document indicator differences between forms in the form description field</li>
          <li>Review staff type assignments annually as organization structure evolves</li>
          <li>Test auto-detection with a sample candidate before bulk assessment initiation</li>
        </ul>
      </TipCallout>
    </div>
  );
}
