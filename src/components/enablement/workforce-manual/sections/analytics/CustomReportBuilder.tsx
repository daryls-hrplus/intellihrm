import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Layers, Filter, BarChart3, Table, PieChart, LineChart, Download } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

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
        <div className="grid md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Data Fields
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Drag-and-drop available fields from data catalog:
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">Employee</Badge>
              <Badge variant="secondary" className="text-xs">Position</Badge>
              <Badge variant="secondary" className="text-xs">Department</Badge>
              <Badge variant="secondary" className="text-xs">Compensation</Badge>
              <Badge variant="secondary" className="text-xs">Performance</Badge>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-500" />
              Filters & Conditions
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Apply business logic:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Equals, contains, between</li>
              <li>• AND/OR logic</li>
              <li>• Date ranges</li>
              <li>• Null handling</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              Aggregations
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Calculate metrics:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Count, Sum, Average</li>
              <li>• Min, Max, Median</li>
              <li>• Percentages</li>
              <li>• Running totals</li>
            </ul>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.5.1: Custom Report Builder with drag-and-drop field selection"
        alt="Report builder interface showing field catalog, filter panel, and preview area"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Visualization Types</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 text-center">
            <Table className="h-8 w-8 mx-auto text-primary mb-2" />
            <h4 className="font-medium text-sm">Data Table</h4>
            <p className="text-xs text-muted-foreground">Sortable, exportable rows</p>
          </div>

          <div className="border rounded-lg p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <h4 className="font-medium text-sm">Bar Chart</h4>
            <p className="text-xs text-muted-foreground">Comparisons, rankings</p>
          </div>

          <div className="border rounded-lg p-4 text-center">
            <LineChart className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <h4 className="font-medium text-sm">Line Chart</h4>
            <p className="text-xs text-muted-foreground">Trends over time</p>
          </div>

          <div className="border rounded-lg p-4 text-center">
            <PieChart className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <h4 className="font-medium text-sm">Pie Chart</h4>
            <p className="text-xs text-muted-foreground">Composition, distribution</p>
          </div>
        </div>
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

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Saved Reports</AlertTitle>
        <AlertDescription>
          Custom reports can be saved to personal or shared folders. Shared reports 
          inherit the creator's data access permissions unless explicitly configured.
        </AlertDescription>
      </Alert>
    </div>
  );
}
