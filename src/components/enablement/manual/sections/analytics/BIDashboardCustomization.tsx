import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, LayoutDashboard, BarChart3, PieChart, LineChart, Share2, Palette, Filter, Settings } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { TipCallout, InfoCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, type FieldReference } from '../../components/FieldReferenceTable';
import { RelatedTopics, StepByStep } from '../../components';

const DASHBOARD_FIELDS: FieldReference[] = [
  { fieldName: 'id', location: 'bi_dashboards', required: true, description: 'Unique dashboard identifier' },
  { fieldName: 'company_id', location: 'bi_dashboards', required: true, description: 'Company owning the dashboard' },
  { fieldName: 'dashboard_name', location: 'bi_dashboards', required: true, description: 'Display name for the dashboard' },
  { fieldName: 'dashboard_code', location: 'bi_dashboards', required: true, description: 'Unique code for programmatic reference' },
  { fieldName: 'description', location: 'bi_dashboards', required: false, description: 'Dashboard purpose and usage notes' },
  { fieldName: 'layout_config', location: 'bi_dashboards', required: true, description: 'JSON grid layout configuration' },
  { fieldName: 'theme', location: 'bi_dashboards', required: false, description: 'Visual theme (light, dark, custom)' },
  { fieldName: 'refresh_interval_seconds', location: 'bi_dashboards', required: false, description: 'Auto-refresh interval (0 = manual)' },
  { fieldName: 'is_public', location: 'bi_dashboards', required: true, description: 'Whether dashboard is visible to all users' },
  { fieldName: 'created_by', location: 'bi_dashboards', required: true, description: 'User who created the dashboard' },
  { fieldName: 'is_active', location: 'bi_dashboards', required: true, description: 'Whether dashboard is available' }
];

const WIDGET_FIELDS: FieldReference[] = [
  { fieldName: 'dashboard_id', location: 'bi_widgets', required: true, description: 'Parent dashboard reference' },
  { fieldName: 'widget_type', location: 'bi_widgets', required: true, description: 'bar, line, pie, table, kpi, gauge' },
  { fieldName: 'title', location: 'bi_widgets', required: true, description: 'Widget display title' },
  { fieldName: 'data_source_id', location: 'bi_widgets', required: true, description: 'Data source for widget' },
  { fieldName: 'query_config', location: 'bi_widgets', required: true, description: 'JSON query/aggregation configuration' },
  { fieldName: 'visualization_config', location: 'bi_widgets', required: false, description: 'Colors, labels, axes configuration' },
  { fieldName: 'position_x', location: 'bi_widgets', required: true, description: 'Grid column position' },
  { fieldName: 'position_y', location: 'bi_widgets', required: true, description: 'Grid row position' },
  { fieldName: 'width', location: 'bi_widgets', required: true, description: 'Widget width in grid units' },
  { fieldName: 'height', location: 'bi_widgets', required: true, description: 'Widget height in grid units' },
  { fieldName: 'filter_config', location: 'bi_widgets', required: false, description: 'Widget-level filters' }
];

const STEPS = [
  {
    title: 'Create New Dashboard',
    description: 'Initialize the dashboard',
    substeps: [
      'Navigate to Performance → BI → Dashboards',
      'Click "Create Dashboard"',
      'Enter dashboard name and description',
      'Select initial theme (light/dark)'
    ],
    expectedResult: 'Empty dashboard created'
  },
  {
    title: 'Add Widgets',
    description: 'Build the dashboard layout',
    substeps: [
      'Click "Add Widget"',
      'Select widget type (chart, KPI, table)',
      'Choose data source',
      'Configure query and aggregation'
    ],
    expectedResult: 'Widget added to dashboard'
  },
  {
    title: 'Arrange Layout',
    description: 'Position and size widgets',
    substeps: [
      'Drag widgets to desired positions',
      'Resize by dragging corners',
      'Use grid snap for alignment',
      'Preview different screen sizes'
    ],
    expectedResult: 'Layout arranged'
  },
  {
    title: 'Configure Filters',
    description: 'Add global and widget filters',
    substeps: [
      'Add dashboard-level filter controls',
      'Configure filter to data source mappings',
      'Set default filter values',
      'Enable user filter persistence'
    ],
    expectedResult: 'Filters configured'
  },
  {
    title: 'Share Dashboard',
    description: 'Configure access and visibility',
    substeps: [
      'Click "Share"',
      'Select share type (public, specific users, roles)',
      'Set permission level (view, edit)',
      'Optionally enable embedding'
    ],
    expectedResult: 'Dashboard shared'
  }
];

const WIDGET_TYPES = [
  { type: 'Bar Chart', icon: BarChart3, color: 'text-blue-500', use: 'Compare categories (e.g., ratings by department)' },
  { type: 'Line Chart', icon: LineChart, color: 'text-green-500', use: 'Show trends over time (e.g., completion rate by month)' },
  { type: 'Pie Chart', icon: PieChart, color: 'text-amber-500', use: 'Show proportions (e.g., rating distribution)' },
  { type: 'KPI Card', icon: LayoutDashboard, color: 'text-purple-500', use: 'Single metric with trend (e.g., completion %)' },
  { type: 'Data Table', icon: LayoutDashboard, color: 'text-cyan-500', use: 'Detailed data with sorting/filtering' },
  { type: 'Gauge', icon: LayoutDashboard, color: 'text-pink-500', use: 'Progress toward target (e.g., goal achievement)' }
];

const BUSINESS_RULES = [
  { rule: 'Dashboard codes must be unique per company', enforcement: 'System' as const, description: 'Code uniqueness enforced at database level.' },
  { rule: 'Public dashboards visible to all company users', enforcement: 'System' as const, description: 'is_public=true makes dashboard visible to all.' },
  { rule: 'Shared dashboards respect data RLS', enforcement: 'System' as const, description: 'Data displayed respects user access permissions.' },
  { rule: 'Refresh interval minimum 30 seconds', enforcement: 'System' as const, description: 'Auto-refresh cannot be more frequent than 30 seconds.' }
];

export function BIDashboardCustomization() {
  return (
    <Card id="sec-6-11">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.11</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~14 min read</Badge>
          <Badge className="gap-1 bg-amber-600 text-white"><Users className="h-3 w-3" />Admin / HR User</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-indigo-500" />
          BI Dashboard Customization
        </CardTitle>
        <CardDescription>
          Create custom analytics dashboards with widgets, filters, and sharing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'BI', 'Dashboards']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Create custom BI dashboards for performance analytics</li>
            <li>Configure widgets with various chart types and data sources</li>
            <li>Arrange layouts for optimal information display</li>
            <li>Share dashboards with teams and stakeholders</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Custom Dashboard Builder
          </h3>
          <p className="text-muted-foreground">
            The BI Dashboard Builder enables creation of custom analytics views tailored 
            to specific roles or use cases. Build dashboards with drag-and-drop widgets, 
            connect to any available data source, and share with your team.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Beyond Standard Analytics</p>
            <p className="text-sm text-muted-foreground mt-1">
              While the Intelligence Hub provides pre-built analytics, custom dashboards 
              let you focus on your specific KPIs, combine data from multiple modules, 
              and create role-specific views.
            </p>
          </div>
        </div>

        {/* Widget Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Widget Types</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {WIDGET_TYPES.map((item) => (
              <Card key={item.type}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                    <h4 className="font-semibold text-sm">{item.type}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.use}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <StepByStep steps={STEPS} title="Creating a Custom Dashboard" />

        {/* Theme & Styling */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Theme & Styling
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { theme: 'Light', desc: 'Clean white background for print/projection' },
              { theme: 'Dark', desc: 'Dark mode for reduced eye strain' },
              { theme: 'Custom', desc: 'Match your brand colors' }
            ].map((item) => (
              <div key={item.theme} className="p-3 border rounded-lg text-center">
                <p className="font-medium">{item.theme}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sharing Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Sharing & Access
          </h3>
          <div className="space-y-3">
            {[
              { level: 'Private', desc: 'Only visible to creator' },
              { level: 'Specific Users', desc: 'Shared with selected individuals' },
              { level: 'Role-Based', desc: 'Shared with users in specific roles' },
              { level: 'Public', desc: 'Visible to all company users' }
            ].map((item) => (
              <div key={item.level} className="p-3 border rounded-lg">
                <Badge variant="outline" className="mb-1">{item.level}</Badge>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Start Simple">
          Begin with 3-4 key widgets and expand over time. Overcrowded dashboards 
          reduce clarity. Focus on the metrics that drive action.
        </TipCallout>

        <InfoCallout title="Mobile Responsiveness">
          Dashboards automatically adapt to smaller screens. Preview on mobile view 
          during design to ensure widgets remain readable.
        </InfoCallout>

        <FieldReferenceTable 
          fields={DASHBOARD_FIELDS}
          title="Database Fields: bi_dashboards"
        />

        <FieldReferenceTable 
          fields={WIDGET_FIELDS}
          title="Database Fields: bi_widgets"
        />

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-6-1', title: 'Appraisal Analytics Dashboard' },
            { sectionId: 'sec-6-9', title: 'Report Builder Configuration' },
            { sectionId: 'sec-6-2', title: 'Performance Intelligence Hub' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
