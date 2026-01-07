import { Badge } from '@/components/ui/badge';
import { Layers, Filter, BarChart3, Table, PieChart, LineChart, Download } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout } from '@/components/enablement/manual/components';

export function CustomReportBuilder() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          The Custom Report Builder enables self-service reporting for HR teams. 
          Create ad-hoc workforce reports by selecting data fields, applying filters, 
          and choosing visualization types without technical assistance.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Report Builder Components</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="primary" icon={Layers} title="Data Fields">
            <p className="mb-2">Drag-and-drop available fields from data catalog:</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">Employee</Badge>
              <Badge variant="secondary" className="text-xs">Position</Badge>
              <Badge variant="secondary" className="text-xs">Department</Badge>
              <Badge variant="secondary" className="text-xs">Compensation</Badge>
              <Badge variant="secondary" className="text-xs">Performance</Badge>
            </div>
          </FeatureCard>

          <FeatureCard variant="info" icon={Filter} title="Filters & Conditions">
            <p className="mb-2">Apply business logic:</p>
            <ul className="space-y-1">
              <li>• Equals, contains, between</li>
              <li>• AND/OR logic</li>
              <li>• Date ranges</li>
              <li>• Null handling</li>
            </ul>
          </FeatureCard>

          <FeatureCard variant="success" icon={BarChart3} title="Aggregations">
            <p className="mb-2">Calculate metrics:</p>
            <ul className="space-y-1">
              <li>• Count, Sum, Average</li>
              <li>• Min, Max, Median</li>
              <li>• Percentages</li>
              <li>• Running totals</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.5.1: Custom Report Builder with drag-and-drop field selection"
        alt="Report builder interface showing field catalog, filter panel, and preview area"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Visualization Types</h3>
        <FeatureCardGrid columns={4}>
          <FeatureCard variant="primary" icon={Table} title="Data Table" description="Sortable, exportable rows" centered />
          <FeatureCard variant="info" icon={BarChart3} title="Bar Chart" description="Comparisons, rankings" centered />
          <FeatureCard variant="success" icon={LineChart} title="Line Chart" description="Trends over time" centered />
          <FeatureCard variant="warning" icon={PieChart} title="Pie Chart" description="Composition, distribution" centered />
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Building a Custom Report</h3>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <p className="font-medium">Select Data Source</p>
              <p className="text-sm text-muted-foreground">Choose primary entity (Employees, Positions, Departments, etc.)</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <p className="font-medium">Add Columns</p>
              <p className="text-sm text-muted-foreground">Drag fields to columns area, configure grouping and sorting</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <p className="font-medium">Apply Filters</p>
              <p className="text-sm text-muted-foreground">Set filter conditions to narrow data set</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
            <div>
              <p className="font-medium">Choose Visualization</p>
              <p className="text-sm text-muted-foreground">Select chart type and configure display options</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">5</div>
            <div>
              <p className="font-medium">Save & Share</p>
              <p className="text-sm text-muted-foreground">Save report, set permissions, or schedule delivery</p>
            </div>
          </li>
        </ol>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.5.2: Completed custom report with visualization and export options"
        alt="Finished report showing bar chart visualization with data table and export buttons"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Export Options</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Download className="h-3 w-3" /> PDF
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Download className="h-3 w-3" /> Excel
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Download className="h-3 w-3" /> CSV
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Download className="h-3 w-3" /> PowerPoint
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Download className="h-3 w-3" /> Image (PNG)
          </Badge>
        </div>
      </section>

      <InfoCallout title="Saved Reports">
        Custom reports can be saved to personal or shared folders. Shared reports 
        inherit the creator's data access permissions unless explicitly configured.
      </InfoCallout>
    </div>
  );
}
