import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, Database, ArrowRight, FileText, Building2,
  CheckCircle, Clock, AlertCircle, DollarSign
} from 'lucide-react';
import { FeatureCard } from '@/components/enablement/manual/components/FeatureCard';
import { InfoCallout, TipCallout, CriticalCallout } from '@/components/enablement/manual/components/Callout';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const payrollFlowDiagram = `
graph LR
    subgraph WORKFORCE["Workforce Data"]
        EMP[Employee Master]
        POS[Position & Grade]
        DEPT[Department/Cost Center]
        TRANS[Transactions]
    end
    
    subgraph MAPPING["Payroll Mapping"]
        PG[Pay Group]
        PE[Pay Elements]
        GL[GL Codes]
        TAX[Tax Jurisdictions]
    end
    
    subgraph PAYROLL["Payroll Processing"]
        MASTER[Payroll Master]
        CALC[Pay Calculation]
        RUN[Payroll Run]
    end
    
    EMP --> PG
    POS --> PE
    DEPT --> GL
    EMP --> TAX
    
    PG --> MASTER
    PE --> MASTER
    GL --> CALC
    TAX --> CALC
    
    TRANS --> MASTER
    MASTER --> RUN
    
    style WORKFORCE fill:#e0f2fe,stroke:#0284c7
    style MAPPING fill:#fef3c7,stroke:#d97706
    style PAYROLL fill:#f0fdf4,stroke:#16a34a
`;

const transactionMappings = [
  {
    transaction: 'New Hire',
    payrollAction: 'Create payroll record',
    data: 'Employee ID, pay group, bank details, tax info',
    timing: 'Immediate on hire date'
  },
  {
    transaction: 'Salary Change',
    payrollAction: 'Update base pay',
    data: 'New salary amount, effective date, pay element',
    timing: 'Effective on change date'
  },
  {
    transaction: 'Transfer',
    payrollAction: 'Update cost center/GL',
    data: 'New department, cost center, GL codes',
    timing: 'Effective on transfer date'
  },
  {
    transaction: 'Termination',
    payrollAction: 'Final pay calculation',
    data: 'Term date, reason, final pay elements',
    timing: 'On termination effective date'
  },
  {
    transaction: 'Pay Group Change',
    payrollAction: 'Reassign pay schedule',
    data: 'New pay group, pay frequency',
    timing: 'Next pay period'
  }
];

const payElementMappings = [
  { element: 'Basic Salary', source: 'Position Grade', frequency: 'Per Period' },
  { element: 'Housing Allowance', source: 'Location/Grade', frequency: 'Per Period' },
  { element: 'Transport Allowance', source: 'Position Type', frequency: 'Per Period' },
  { element: 'Acting Allowance', source: 'Acting Assignment', frequency: 'Duration-Based' },
  { element: 'Overtime', source: 'Time & Attendance', frequency: 'Per Period' }
];

export function PayrollIntegration() {
  return (
    <div className="space-y-8" data-manual-anchor="wf-sec-9-3">
      {/* Section Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">9.3 Payroll Integration</h2>
            <p className="text-muted-foreground">
              Employee master data and transaction flow for payroll processing
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Workforce-Payroll Data Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Workforce module provides the <strong>employee master data</strong> that drives payroll 
            processing. Every workforce transaction—hires, terminations, salary changes, transfers—automatically 
            updates payroll records to ensure accurate pay calculation.
          </p>
          <p className="text-muted-foreground">
            This integration eliminates the need for duplicate data entry in payroll, reduces errors, 
            and ensures that organizational changes are immediately reflected in pay processing.
          </p>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          variant="primary"
          icon={ArrowRight}
          title="Real-Time Sync"
          description="Workforce transactions immediately update payroll master records"
        />
        <FeatureCard
          variant="info"
          icon={DollarSign}
          title="Pay Element Mapping"
          description="Position grades automatically determine applicable pay elements and amounts"
        />
        <FeatureCard
          variant="warning"
          icon={Clock}
          title="Effective Dating"
          description="Future-dated changes queue for payroll on the effective date"
        />
      </div>

      {/* Workflow Diagram */}
      <WorkflowDiagram
        title="Payroll Data Flow"
        description="How workforce data maps to payroll processing"
        diagram={payrollFlowDiagram}
      />

      {/* Transaction Mappings */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle>Transaction-to-Payroll Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Workforce Transaction</th>
                  <th className="text-left py-3 px-4 font-medium">Payroll Action</th>
                  <th className="text-left py-3 px-4 font-medium">Data Transferred</th>
                  <th className="text-left py-3 px-4 font-medium">Timing</th>
                </tr>
              </thead>
              <tbody>
                {transactionMappings.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.transaction}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{item.payrollAction}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.data}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pay Element Mappings */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Pay Element Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Pay elements are linked to position attributes. When an employee is assigned to a position, 
            the applicable pay elements are automatically determined.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Pay Element</th>
                  <th className="text-left py-3 px-4 font-medium">Derived From</th>
                  <th className="text-left py-3 px-4 font-medium">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {payElementMappings.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{item.element}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.source}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-xs">{item.frequency}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Screenshot */}
      <ScreenshotPlaceholder
        caption="Payroll Integration Settings - Configuration screen showing transaction-to-payroll mapping rules"
      />

      {/* GL Code Integration */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Cost Allocation & GL Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Department → Cost Center</h4>
              <p className="text-sm text-muted-foreground">
                Each department maps to one or more cost centers. When an employee is assigned to 
                a department, their labor costs are allocated to the corresponding cost center.
              </p>
            </div>
            <div className="p-4 border rounded-lg bg-background">
              <h4 className="font-semibold mb-2">Position → GL Account</h4>
              <p className="text-sm text-muted-foreground">
                Positions can have specific GL account overrides for specialized cost tracking 
                (e.g., project-based positions, grant-funded roles).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Callouts */}
      <CriticalCallout title="Payroll Cutoff Dates">
        Workforce transactions submitted after payroll cutoff may not be reflected in the current 
        pay period. Verify cutoff dates and ensure critical changes (terminations, salary adjustments) 
        are processed before the deadline.
      </CriticalCallout>

      <TipCallout title="Batch vs. Real-Time">
        While most data syncs in real-time, payroll can be configured for batch export for systems 
        that require file-based integration. Configure batch schedules in Payroll Settings.
      </TipCallout>

      <InfoCallout title="Multi-Country Payroll">
        For organizations with employees in multiple countries, each country's payroll configuration 
        can have different pay element mappings, tax rules, and GL structures.
      </InfoCallout>
    </div>
  );
}
