import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Building2, Globe, CheckCircle, AlertTriangle,
  ShieldCheck, FileText
} from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout, NoteCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';

const regionIdTypes = [
  {
    region: 'Jamaica',
    ids: [
      { code: 'TRN', name: 'Taxpayer Registration Number', purpose: 'Tax authority registration', mandatory: true },
      { code: 'NIS', name: 'National Insurance Scheme', purpose: 'Social security contributions', mandatory: true },
      { code: 'GCT', name: 'General Consumption Tax', purpose: 'Sales tax registration', mandatory: false }
    ]
  },
  {
    region: 'Trinidad & Tobago',
    ids: [
      { code: 'BIR', name: 'Board of Inland Revenue', purpose: 'Tax registration', mandatory: true },
      { code: 'NIS', name: 'National Insurance Scheme', purpose: 'Social security', mandatory: true }
    ]
  },
  {
    region: 'Barbados',
    ids: [
      { code: 'TIN', name: 'Tax Identification Number', purpose: 'Taxpayer identification', mandatory: true },
      { code: 'NIS', name: 'National Insurance', purpose: 'Social security registration', mandatory: true }
    ]
  },
  {
    region: 'Ghana',
    ids: [
      { code: 'GRA-TIN', name: 'Ghana Revenue Authority TIN', purpose: 'Tax identification', mandatory: true },
      { code: 'SSNIT', name: 'Social Security Number', purpose: 'Pension contributions', mandatory: true }
    ]
  },
  {
    region: 'Nigeria',
    ids: [
      { code: 'TIN', name: 'Tax Identification Number', purpose: 'Federal tax registration', mandatory: true },
      { code: 'CAC', name: 'Corporate Affairs Commission', purpose: 'Company registration', mandatory: true },
      { code: 'PAYE', name: 'Pay As You Earn', purpose: 'Employer tax code', mandatory: false }
    ]
  },
  {
    region: 'Dominican Republic',
    ids: [
      { code: 'RNC', name: 'Registro Nacional del Contribuyente', purpose: 'Tax registration', mandatory: true },
      { code: 'TSS', name: 'Tesorería de Seguridad Social', purpose: 'Social security', mandatory: true }
    ]
  }
];

const configurationSteps = [
  {
    title: 'Navigate to Companies',
    description: 'Access Admin → Companies from the main menu.',
    expectedResult: 'Company list page displays with all registered companies'
  },
  {
    title: 'Select Company',
    description: 'Click on the company row to view details, or use the actions menu.',
    expectedResult: 'Company details or action options appear'
  },
  {
    title: 'Open Government IDs Dialog',
    description: 'Click "Government IDs" from the company actions or detail view.',
    expectedResult: 'Government IDs dialog opens showing existing IDs and available types'
  },
  {
    title: 'Add New ID',
    description: 'Click "Add ID" to open the add form. Select the ID type from the dropdown (filtered by company country).',
    substeps: [
      'ID Type: Select from available types for this country',
      'ID Number: Enter the official registration number',
      'Issue Date: When the ID was issued (optional)',
      'Expiry Date: When the ID expires, if applicable',
      'Issuing Authority: Government body that issued the ID',
      'Notes: Any additional context'
    ],
    expectedResult: 'Form populated with required information'
  },
  {
    title: 'Save and Verify',
    description: 'Click Save. The ID is created with "Unverified" status. A separate verification workflow can mark it as verified after document review.',
    expectedResult: 'ID appears in the list with Unverified badge'
  }
];

export function GovernmentIdTypesSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-2-2">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 2.2</Badge>
            <Badge variant="secondary">8 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Government ID Types</h2>
          <p className="text-muted-foreground mt-1">
            Configure country-specific statutory ID requirements for employer registration
          </p>
        </div>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Statutory ID Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Every country requires employers to register with various government agencies—tax 
            authorities, social security bodies, and regulatory commissions. HR Hub tracks these 
            registrations at the company level, supporting multi-country operations where each 
            legal entity has different requirements.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Building2 className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Employer Registration</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Track TRN, NIS, TIN and other employer-specific IDs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Globe className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Country-Specific</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  ID types automatically filter based on company country
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <ShieldCheck className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Verification Tracking</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Track verified vs unverified status with audit trail
                </p>
              </div>
            </div>
          </div>

          <NoteCallout title="Country Must Be Set First">
            Government ID types are filtered by the company's country setting. If the country 
            is not configured, you won't be able to add government IDs. Set the country in 
            company settings before proceeding.
          </NoteCallout>
        </CardContent>
      </Card>

      {/* Supported Regions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Supported Regions & ID Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            HR Hub ships with pre-configured government ID types for Caribbean and African markets. 
            The following table shows common ID requirements by country:
          </p>

          {regionIdTypes.map((region, idx) => (
            <div key={idx} className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {region.region}
              </h4>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Code</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Purpose</th>
                      <th className="text-left p-3 font-medium">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {region.ids.map((id, iidx) => (
                      <tr key={iidx} className="border-t">
                        <td className="p-3 font-mono text-xs">{id.code}</td>
                        <td className="p-3 font-medium">{id.name}</td>
                        <td className="p-3 text-muted-foreground">{id.purpose}</td>
                        <td className="p-3">
                          {id.mandatory ? (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Optional</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Configuration Procedure */}
      <Card>
        <CardHeader>
          <CardTitle>Adding Company Government IDs</CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={configurationSteps} />
        </CardContent>
      </Card>

      {/* Validation Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Validation Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Some ID types have format validation patterns configured. When you enter an ID number, 
            the system validates it against the expected format:
          </p>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">ID Type</th>
                  <th className="text-left p-3 font-medium">Format</th>
                  <th className="text-left p-3 font-medium">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 font-medium">Jamaica TRN</td>
                  <td className="p-3 font-mono text-xs">9 digits</td>
                  <td className="p-3 font-mono text-xs">123-456-789</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Trinidad BIR</td>
                  <td className="p-3 font-mono text-xs">Alphanumeric</td>
                  <td className="p-3 font-mono text-xs">T12345678</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Ghana GRA-TIN</td>
                  <td className="p-3 font-mono text-xs">Letter + digits</td>
                  <td className="p-3 font-mono text-xs">C0012345678</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Nigeria TIN</td>
                  <td className="p-3 font-mono text-xs">Hyphenated digits</td>
                  <td className="p-3 font-mono text-xs">12345678-0001</td>
                </tr>
              </tbody>
            </table>
          </div>

          <InfoCallout title="Validation Flexibility">
            Validation patterns are suggestions, not hard blocks. If a valid ID doesn't match 
            the expected pattern, you'll see a warning but can still save. Some countries 
            have multiple formats for the same ID type.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Verification Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            Verification Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Government IDs have two status levels to support document verification processes:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Badge variant="secondary" className="gap-1 shrink-0">
                <Shield className="h-3 w-3" />
                Unverified
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">
                  ID has been entered but not yet confirmed against official documents. 
                  This is the default status when a new ID is added.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Badge className="gap-1 shrink-0 bg-green-500">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">
                  ID has been confirmed by reviewing official registration documents. 
                  Requires appropriate permissions to mark as verified.
                </p>
              </div>
            </div>
          </div>

          <TipCallout title="Expiry Date Reminders">
            For IDs with expiry dates (like annual registrations), configure notification 
            reminders in the Notifications module to alert administrators before renewal 
            deadlines. This prevents compliance lapses.
          </TipCallout>

          <WarningCallout title="Audit Trail">
            All changes to government IDs are logged in the audit trail, including who made 
            changes and when. This is critical for compliance audits and regulatory inspections.
          </WarningCallout>
        </CardContent>
      </Card>
    </div>
  );
}
