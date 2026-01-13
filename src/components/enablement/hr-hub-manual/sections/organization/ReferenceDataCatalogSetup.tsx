import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Clock, 
  Globe, 
  Coins, 
  Languages, 
  Settings, 
  Lock,
  Unlock,
  Search,
  Layers,
  Info
} from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';

const referenceDataCategories = [
  { 
    name: 'Countries', 
    icon: Globe, 
    type: 'System',
    description: 'ISO 3166-1 country codes and names',
    editable: false,
    examples: ['Jamaica (JM)', 'Trinidad and Tobago (TT)', 'Ghana (GH)']
  },
  { 
    name: 'Currencies', 
    icon: Coins, 
    type: 'System',
    description: 'ISO 4217 currency codes and symbols',
    editable: false,
    examples: ['JMD ($)', 'TTD ($)', 'GHS (₵)', 'USD ($)']
  },
  { 
    name: 'Languages', 
    icon: Languages, 
    type: 'System',
    description: 'ISO 639-1 language codes',
    editable: false,
    examples: ['English (en)', 'Spanish (es)', 'French (fr)']
  },
  { 
    name: 'Lookup Values', 
    icon: Settings, 
    type: 'Configurable',
    description: 'Organization-specific dropdown options',
    editable: true,
    examples: ['Employment Types', 'Leave Types', 'Departments']
  },
];

const navigationSteps = [
  {
    title: 'Access Reference Data Catalog',
    description: 'Navigate to HR Hub → Reference Data Catalog from the main menu.',
    expectedResult: 'Reference Data Catalog page loads with category browser'
  },
  {
    title: 'Browse Categories',
    description: 'Use the left panel to browse available data categories. Categories are grouped by type (System vs Configurable).',
    expectedResult: 'Category list displays with item counts'
  },
  {
    title: 'View Category Contents',
    description: 'Click on a category to view its contents. System data displays as read-only; configurable data shows edit options.',
    expectedResult: 'Data table displays with search and filter options'
  },
  {
    title: 'Search Within Category',
    description: 'Use the search box to filter items within the selected category by name or code.',
    expectedResult: 'Results filter in real-time as you type'
  },
];

const lookupExamples = [
  { type: 'Employment Type', values: ['Full-Time', 'Part-Time', 'Contract', 'Temporary'] },
  { type: 'Leave Type', values: ['Annual Leave', 'Sick Leave', 'Maternity', 'Paternity'] },
  { type: 'Termination Reason', values: ['Resignation', 'Retirement', 'Redundancy', 'Dismissal'] },
  { type: 'Education Level', values: ['Secondary', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD'] },
];

export function ReferenceDataCatalogSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-2-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 2.4</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          8 min read
        </Badge>
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">New in v1.4.0</Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
              <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle>Reference Data Catalog</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Browse system reference data and configurable lookup values for your organization
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground">
            The Reference Data Catalog provides a centralized view of all standardized data used 
            across the HRMS. This includes system-defined reference data (countries, currencies, 
            languages) and organization-configurable lookup values that you can customize.
          </p>

          <InfoCallout title="Two Types of Reference Data">
            <strong>System Data</strong> follows international standards (ISO) and cannot be modified. 
            <strong>Configurable Data</strong> includes organization-specific lookups that you can add, 
            edit, or deactivate based on your needs.
          </InfoCallout>

          {/* Data Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Data Categories
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referenceDataCategories.map((category, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <category.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{category.name}</span>
                    <Badge variant={category.type === 'System' ? 'secondary' : 'default'} className="text-xs">
                      {category.type}
                    </Badge>
                    {category.editable ? (
                      <Unlock className="h-3 w-3 text-green-500" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {category.examples.slice(0, 3).map((example, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{example}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System vs Configurable */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">System vs Configurable Data</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <h5 className="font-medium text-slate-700 dark:text-slate-300">System Data (Read-Only)</h5>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Countries, currencies, languages</li>
                  <li>• Based on ISO international standards</li>
                  <li>• Cannot be modified by users</li>
                  <li>• Updated through system releases</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <Unlock className="h-4 w-4 text-green-500" />
                  <h5 className="font-medium text-green-700 dark:text-green-300">Configurable Data</h5>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Lookup values, custom types</li>
                  <li>• Organization-specific definitions</li>
                  <li>• Add, edit, or deactivate values</li>
                  <li>• Managed via Lookup Values page</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Navigation Steps */}
          <StepByStep
            title="Using the Reference Data Catalog"
            steps={navigationSteps}
          />

          {/* Lookup Values Examples */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configurable Lookup Examples
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Lookup Type</th>
                    <th className="border p-3 text-left font-medium">Example Values</th>
                  </tr>
                </thead>
                <tbody>
                  {lookupExamples.map((example, idx) => (
                    <tr key={idx}>
                      <td className="border p-3 font-medium">{example.type}</td>
                      <td className="border p-3">
                        <div className="flex flex-wrap gap-1">
                          {example.values.map((value, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{value}</Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <TipCallout title="Integration with Forms">
            Reference data automatically populates dropdown fields throughout the system. When you 
            add a new lookup value, it becomes available in all relevant forms without requiring 
            additional configuration.
          </TipCallout>

          {/* Search Capabilities */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Capabilities
            </h4>
            <div className="p-4 rounded-lg border bg-muted/30">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-primary" />
                  <span><strong>By Name:</strong> Search for items by their display name (e.g., "Jamaica")</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-primary" />
                  <span><strong>By Code:</strong> Search for items by their code (e.g., "JM", "USD")</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 text-primary" />
                  <span><strong>Cross-Category:</strong> Use the global search to find items across all categories</span>
                </li>
              </ul>
            </div>
          </div>

          <WarningCallout title="Deactivating Lookup Values">
            When you deactivate a lookup value, it will no longer appear in dropdown selections 
            for new records. However, existing records that reference the value will retain their 
            data. This ensures historical accuracy while preventing future use.
          </WarningCallout>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Best Practices</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <span>Review and configure lookup values during initial implementation</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <span>Use consistent naming conventions across lookup types</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <span>Deactivate rather than delete values to preserve audit history</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                <span>Document the purpose of custom lookup values for future administrators</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
