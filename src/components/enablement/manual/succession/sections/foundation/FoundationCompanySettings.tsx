import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  Building,
  Globe,
  Settings,
  ArrowDown,
  Info
} from 'lucide-react';

export function FoundationCompanySettings() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.7 Company-Specific Settings</h3>
        <p className="text-muted-foreground">
          Configure multi-company succession settings, inheritance rules, and regional customizations
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Configure multi-company succession settings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Understand configuration inheritance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Apply regional customizations</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Path */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-700 dark:text-blue-300">System Path:</span>
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span>Succession</span>
              <ArrowRight className="h-3 w-3" />
              <span>Setup</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium">Company Settings</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600/80 dark:text-blue-400/80 font-mono">
            Direct URL: /succession/setup?tab=company-settings
          </div>
        </CardContent>
      </Card>

      {/* Configuration Inheritance Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Configuration Inheritance Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre">{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION INHERITANCE MODEL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LEVEL 1: System Defaults (Global)                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Baseline configuration for all new companies                             │
│  • 5 default readiness bands                                                │
│  • 4 default assessor types                                                 │
│  • 32 default indicators in 8 categories                                    │
│  • 8 default availability reasons                                           │
│                                                                             │
│             ▼ Inherits (can override)                                       │
│                                                                             │
│  LEVEL 2: Company Group Overrides (Optional)                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • For multi-company organizations                                          │
│  • Shared standards across subsidiaries                                     │
│  • Example: ACME Group standards for ACME US, ACME UK, ACME APAC           │
│                                                                             │
│             ▼ Inherits (can override)                                       │
│                                                                             │
│  LEVEL 3: Individual Company Settings                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Company-specific customization                                           │
│  • Local regulatory requirements                                            │
│  • Cultural adaptations                                                     │
│  • Language/terminology                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Inheritance Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Inheritance Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 text-sm">
            <div className="p-4 border-2 border-primary rounded-lg font-medium w-full max-w-md text-center bg-primary/5">
              <Badge className="mb-2">Level 1</Badge>
              <div>System Defaults (Global)</div>
              <div className="text-xs text-muted-foreground mt-1">All companies inherit these settings</div>
            </div>
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
            <div className="p-4 border rounded-lg w-full max-w-md text-center">
              <Badge variant="secondary" className="mb-2">Level 2</Badge>
              <div>Company Group Overrides</div>
              <div className="text-xs text-muted-foreground mt-1">Optional: Shared across subsidiaries</div>
            </div>
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
            <div className="p-4 border rounded-lg w-full max-w-md text-center">
              <Badge variant="outline" className="mb-2">Level 3</Badge>
              <div>Individual Company Settings</div>
              <div className="text-xs text-muted-foreground mt-1">Local customization and compliance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Considerations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Regional Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Region</th>
                  <th className="text-left py-3 px-4 font-medium">Consideration</th>
                  <th className="text-left py-3 px-4 font-medium">Configuration Impact</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Caribbean</td>
                  <td className="py-3 px-4 text-muted-foreground">Fiscal year often April-March</td>
                  <td className="py-3 px-4 text-muted-foreground">Align succession calendar to fiscal year</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Caribbean</td>
                  <td className="py-3 px-4 text-muted-foreground">Small talent pools</td>
                  <td className="py-3 px-4 text-muted-foreground">Enable cross-company succession pools</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Africa</td>
                  <td className="py-3 px-4 text-muted-foreground">Multi-country operations</td>
                  <td className="py-3 px-4 text-muted-foreground">Per-country availability reasons (labor law)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Africa</td>
                  <td className="py-3 px-4 text-muted-foreground">Emerging market growth</td>
                  <td className="py-3 px-4 text-muted-foreground">Higher emphasis on developing pipeline</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Europe</td>
                  <td className="py-3 px-4 text-muted-foreground">GDPR compliance</td>
                  <td className="py-3 px-4 text-muted-foreground">Consent tracking for readiness data</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Europe</td>
                  <td className="py-3 px-4 text-muted-foreground">Works council requirements</td>
                  <td className="py-3 px-4 text-muted-foreground">Notification triggers for succession plans</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Global</td>
                  <td className="py-3 px-4 text-muted-foreground">Time zones</td>
                  <td className="py-3 px-4 text-muted-foreground">Calibration session scheduling flexibility</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Global</td>
                  <td className="py-3 px-4 text-muted-foreground">Language</td>
                  <td className="py-3 px-4 text-muted-foreground">Localized band labels and indicator text</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Company Settings Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Company Settings Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Per-Company Configuration</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Assessor types enabled/disabled per local practice
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Readiness bands aligned with corporate standard or localized
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Availability reasons include local employment termination types
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Language/localization settings confirmed
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Approval workflows assigned to local HR roles
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Notification templates customized with local branding
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Data retention policies configured per local regulation
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Cross-Company Settings</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Shared talent pools enabled for regional collaboration
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Cross-company succession paths defined
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Consolidated reporting hierarchy established
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">☐</span>
                Executive visibility across entities configured
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Multi-Company Best Practice</AlertTitle>
        <AlertDescription className="text-sm">
          For global organizations, maintain consistent readiness band definitions and indicator categories 
          at the group level to enable cross-company talent benchmarking. Allow individual companies to 
          customize labels and availability reasons to meet local requirements while preserving data 
          comparability for executive reporting.
        </AlertDescription>
      </Alert>
    </div>
  );
}
