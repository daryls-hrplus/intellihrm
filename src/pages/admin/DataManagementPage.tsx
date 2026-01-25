import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useDataManagement } from '@/hooks/useDataManagement';
import { supabase } from '@/integrations/supabase/client';
import { 
  DataSet, 
  PurgeLevel, 
  DATA_SET_DESCRIPTIONS, 
  PURGE_LEVEL_DESCRIPTIONS,
  TableStatistics,
  PopulationResult,
  PurgeResult
} from '@/types/dataManagement';
import { 
  Database, 
  Trash2, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Shield,
  Users,
  Calendar,
  FileBarChart,
  RefreshCw,
  Building2,
  UserCheck,
  Clock,
  DollarSign,
  GraduationCap,
  Target,
  Briefcase,
  FileText,
  Heart
} from 'lucide-react';
import { useTabState } from '@/hooks/useTabState';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface ModuleDataCount {
  module: string;
  icon: React.ElementType;
  tables: { name: string; count: number; description: string }[];
  totalRecords: number;
}

const MODULE_TABLE_CONFIG: { module: string; icon: React.ElementType; tables: { table: string; description: string }[] }[] = [
  {
    module: 'Organization',
    icon: Building2,
    tables: [
      { table: 'companies', description: 'Companies' },
      { table: 'departments', description: 'Departments' },
      { table: 'positions', description: 'Positions' },
      { table: 'locations', description: 'Locations' },
      { table: 'cost_centers', description: 'Cost Centers' },
    ]
  },
  {
    module: 'Employees',
    icon: UserCheck,
    tables: [
      { table: 'profiles', description: 'Employee Profiles' },
      { table: 'employee_assignments', description: 'Assignments' },
      { table: 'employee_documents', description: 'Documents' },
      { table: 'employee_dependents', description: 'Dependents' },
      { table: 'employee_emergency_contacts', description: 'Emergency Contacts' },
    ]
  },
  {
    module: 'Time & Attendance',
    icon: Clock,
    tables: [
      { table: 'time_entries', description: 'Time Entries' },
      { table: 'leave_requests', description: 'Leave Requests' },
      { table: 'leave_balances', description: 'Leave Balances' },
      { table: 'shifts', description: 'Shifts' },
      { table: 'schedules', description: 'Schedules' },
    ]
  },
  {
    module: 'Payroll',
    icon: DollarSign,
    tables: [
      { table: 'payroll_runs', description: 'Payroll Runs' },
      { table: 'payslips', description: 'Payslips' },
      { table: 'salary_structures', description: 'Salary Structures' },
      { table: 'employee_salaries', description: 'Employee Salaries' },
      { table: 'payroll_deductions', description: 'Deductions' },
    ]
  },
  {
    module: 'Learning & Development',
    icon: GraduationCap,
    tables: [
      { table: 'lms_courses', description: 'Courses' },
      { table: 'lms_course_enrollments', description: 'Enrollments' },
      { table: 'lms_assessments', description: 'Assessments' },
      { table: 'training_sessions', description: 'Training Sessions' },
      { table: 'certifications', description: 'Certifications' },
    ]
  },
  {
    module: 'Performance',
    icon: Target,
    tables: [
      { table: 'appraisal_cycles', description: 'Appraisal Cycles' },
      { table: 'appraisal_participants', description: 'Participants' },
      { table: 'goals', description: 'Goals' },
      { table: 'performance_reviews', description: 'Reviews' },
      { table: 'competencies', description: 'Competencies' },
    ]
  },
  {
    module: 'Recruitment',
    icon: Briefcase,
    tables: [
      { table: 'job_requisitions', description: 'Job Requisitions' },
      { table: 'candidates', description: 'Candidates' },
      { table: 'applications', description: 'Applications' },
      { table: 'interviews', description: 'Interviews' },
      { table: 'offer_letters', description: 'Offer Letters' },
    ]
  },
  {
    module: 'Policies & Compliance',
    icon: FileText,
    tables: [
      { table: 'policies', description: 'Policies' },
      { table: 'policy_acknowledgements', description: 'Acknowledgements' },
      { table: 'grievances', description: 'Grievances' },
      { table: 'disciplinary_actions', description: 'Disciplinary Actions' },
      { table: 'compliance_records', description: 'Compliance Records' },
    ]
  },
  {
    module: 'Benefits & Wellness',
    icon: Heart,
    tables: [
      { table: 'benefit_plans', description: 'Benefit Plans' },
      { table: 'employee_benefits', description: 'Employee Benefits' },
      { table: 'wellness_programs', description: 'Wellness Programs' },
      { table: 'wellness_activities', description: 'Wellness Activities' },
    ]
  },
];

export default function DataManagementPage() {
  const { isPopulating, isPurging, isLoadingStats, populateData, purgeData, getPurgeStatistics } = useDataManagement();

  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "populate",
      selectedDataSet: "standard" as DataSet,
      selectedPurgeLevel: "transactions_only" as PurgeLevel,
    },
    syncToUrl: ["activeTab"],
  });
  const { activeTab, selectedDataSet, selectedPurgeLevel } = tabState;

  const [confirmationText, setConfirmationText] = useState('');
  const [purgeStats, setPurgeStats] = useState<TableStatistics[]>([]);
  const [populationResult, setPopulationResult] = useState<PopulationResult | null>(null);
  const [purgeResult, setPurgeResult] = useState<PurgeResult | null>(null);
  
  // Verification Report state
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [moduleDataCounts, setModuleDataCounts] = useState<ModuleDataCount[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchVerificationReport = async () => {
    setIsLoadingReport(true);
    try {
      const results: ModuleDataCount[] = [];
      
      for (const moduleConfig of MODULE_TABLE_CONFIG) {
        const tableCounts: { name: string; count: number; description: string }[] = [];
        
        for (const tableInfo of moduleConfig.tables) {
          try {
            const { count, error } = await supabase
              .from(tableInfo.table as any)
              .select('*', { count: 'exact', head: true });
            
            if (!error) {
              tableCounts.push({
                name: tableInfo.table,
                count: count || 0,
                description: tableInfo.description
              });
            }
          } catch {
            // Table might not exist, skip it
            tableCounts.push({
              name: tableInfo.table,
              count: 0,
              description: tableInfo.description
            });
          }
        }
        
        results.push({
          module: moduleConfig.module,
          icon: moduleConfig.icon,
          tables: tableCounts,
          totalRecords: tableCounts.reduce((sum, t) => sum + t.count, 0)
        });
      }
      
      setModuleDataCounts(results);
      setLastRefreshed(new Date());
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    // Auto-fetch on first load of verification tab
  }, []);

  const handlePopulate = async () => {
    const result = await populateData({ dataSet: selectedDataSet });
    setPopulationResult(result);
  };

  const handlePreviewPurge = async () => {
    const stats = await getPurgeStatistics(undefined, selectedPurgeLevel);
    setPurgeStats(stats);
  };

  const handlePurge = async () => {
    if (confirmationText !== 'PURGE') return;
    
    const result = await purgeData({
      purgeLevel: selectedPurgeLevel,
      dryRun: false,
      confirmationToken: crypto.randomUUID()
    });
    setPurgeResult(result);
    setConfirmationText('');
    setPurgeStats([]);
  };

  const totalDeletable = purgeStats.reduce((sum, s) => sum + s.deletable_records, 0);
  const totalProtected = purgeStats.reduce((sum, s) => sum + s.protected_records, 0);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[
          { label: "Admin", href: "/admin" },
          { label: "Data Management" },
        ]} />
        <div>
          <h1 className="text-2xl font-bold">Data Management</h1>
          <p className="text-muted-foreground">Populate demo data or purge transactional records</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setTabState({ activeTab: v })} className="space-y-4">
          <TabsList>
            <TabsTrigger value="populate" className="gap-2">
              <Database className="h-4 w-4" />
              Populate Data
            </TabsTrigger>
            <TabsTrigger value="purge" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Purge Data
            </TabsTrigger>
            <TabsTrigger value="verify" className="gap-2" onClick={() => !moduleDataCounts.length && fetchVerificationReport()}>
              <FileBarChart className="h-4 w-4" />
              Verification Report
            </TabsTrigger>
          </TabsList>

        <TabsContent value="populate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Populate Demo Data</CardTitle>
              <CardDescription>
                Create sample data in the correct FK-respecting order for testing and demonstration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup 
                value={selectedDataSet} 
                onValueChange={(v) => setTabState({ selectedDataSet: v as DataSet })}
                className="space-y-3"
              >
                {Object.entries(DATA_SET_DESCRIPTIONS).map(([key, desc]) => (
                  <div key={key} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <Label htmlFor={key} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{desc.label}</span>
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {desc.employees}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {desc.duration}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{desc.description}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button 
                onClick={handlePopulate} 
                disabled={isPopulating}
                className="w-full"
              >
                {isPopulating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Populating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Populate {DATA_SET_DESCRIPTIONS[selectedDataSet].label} Dataset
                  </>
                )}
              </Button>

              {populationResult && (
                <Alert variant={populationResult.success ? "default" : "destructive"}>
                  {populationResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {populationResult.success ? 'Population Complete' : 'Population Failed'}
                  </AlertTitle>
                  <AlertDescription>
                    Created {populationResult.recordsCreated} records across {populationResult.tablesPopulated} tables
                    {populationResult.errors.length > 0 && (
                      <ul className="mt-2 text-sm">
                        {populationResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purge" className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Danger Zone</AlertTitle>
            <AlertDescription>
              Purging data is irreversible. Protected records (system, seeded, default) will be preserved.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Purge Data</CardTitle>
              <CardDescription>
                Remove transactional or non-seed data while preserving system records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup 
                value={selectedPurgeLevel} 
                onValueChange={(v) => {
                  setTabState({ selectedPurgeLevel: v as PurgeLevel });
                  setPurgeStats([]);
                }}
                className="space-y-3"
              >
                {Object.entries(PURGE_LEVEL_DESCRIPTIONS).map(([key, desc]) => (
                  <div key={key} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value={key} id={`purge-${key}`} className="mt-1" />
                    <Label htmlFor={`purge-${key}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{desc.label}</span>
                        <Badge className={desc.color}>{key === 'complete_reset' ? 'High Risk' : key === 'all_non_seed' ? 'Medium Risk' : 'Low Risk'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{desc.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Shield className="h-3 w-3 inline mr-1" />
                        {desc.preserves}
                      </p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button 
                variant="outline" 
                onClick={handlePreviewPurge}
                disabled={isLoadingStats}
                className="w-full"
              >
                {isLoadingStats ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading Preview...
                  </>
                ) : (
                  'Preview What Will Be Deleted'
                )}
              </Button>

              {purgeStats.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Purge Preview</CardTitle>
                    <div className="flex gap-4 text-sm">
                      <span className="text-destructive font-medium">{totalDeletable.toLocaleString()} to delete</span>
                      <span className="text-green-600 font-medium">{totalProtected.toLocaleString()} protected</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-1">
                        {purgeStats.map((stat) => (
                          <div key={stat.table_name} className="flex justify-between text-sm py-1 border-b">
                            <span className="font-mono">{stat.table_name}</span>
                            <div className="flex gap-4">
                              <span className="text-destructive">{stat.deletable_records}</span>
                              <span className="text-green-600">{stat.protected_records}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {purgeStats.length > 0 && (
                <div className="space-y-3">
                  <Label htmlFor="confirm">Type PURGE to confirm deletion</Label>
                  <Input 
                    id="confirm"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Type PURGE to confirm"
                  />
                  <Button 
                    variant="destructive"
                    onClick={handlePurge}
                    disabled={isPurging || confirmationText !== 'PURGE'}
                    className="w-full"
                  >
                    {isPurging ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Purging...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Purge {totalDeletable.toLocaleString()} Records
                      </>
                    )}
                  </Button>
                </div>
              )}

              {purgeResult && (
                <Alert variant={purgeResult.success ? "default" : "destructive"}>
                  {purgeResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {purgeResult.success ? 'Purge Complete' : 'Purge Failed'}
                  </AlertTitle>
                  <AlertDescription>
                    Deleted {purgeResult.recordsDeleted} records, preserved {purgeResult.preservedRecords}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Verification Report</CardTitle>
                  <CardDescription>
                    View record counts across all modules to verify populated data
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {lastRefreshed && (
                    <span className="text-xs text-muted-foreground">
                      Last refreshed: {lastRefreshed.toLocaleTimeString()}
                    </span>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchVerificationReport}
                    disabled={isLoadingReport}
                  >
                    {isLoadingReport ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">Refresh</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingReport ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">Loading verification report...</p>
                </div>
              ) : moduleDataCounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <FileBarChart className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Click refresh to load the verification report</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {moduleDataCounts.reduce((sum, m) => sum + m.totalRecords, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Records</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {moduleDataCounts.filter(m => m.totalRecords > 0).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Modules with Data</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {moduleDataCounts.reduce((sum, m) => sum + m.tables.filter(t => t.count > 0).length, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Tables with Data</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">
                          {moduleDataCounts.reduce((sum, m) => sum + m.tables.length, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Tables</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Module Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {moduleDataCounts.map((moduleData) => {
                      const Icon = moduleData.icon;
                      const hasData = moduleData.totalRecords > 0;
                      const tablesWithData = moduleData.tables.filter(t => t.count > 0).length;
                      const percentage = (tablesWithData / moduleData.tables.length) * 100;
                      
                      return (
                        <Card key={moduleData.module} className={hasData ? 'border-green-500/30' : 'border-muted'}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${hasData ? 'bg-green-500/10' : 'bg-muted'}`}>
                                  <Icon className={`h-4 w-4 ${hasData ? 'text-green-600' : 'text-muted-foreground'}`} />
                                </div>
                                <CardTitle className="text-sm font-medium">{moduleData.module}</CardTitle>
                              </div>
                              {hasData ? (
                                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                                  {moduleData.totalRecords.toLocaleString()}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Empty
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{tablesWithData} of {moduleData.tables.length} tables populated</span>
                                <span>{Math.round(percentage)}%</span>
                              </div>
                              <Progress value={percentage} className="h-1.5" />
                            </div>
                            <ScrollArea className="h-32">
                              <div className="space-y-1">
                                {moduleData.tables.map((table) => (
                                  <div 
                                    key={table.name} 
                                    className="flex justify-between items-center text-xs py-1 border-b border-muted last:border-0"
                                  >
                                    <span className="text-muted-foreground">{table.description}</span>
                                    <span className={table.count > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                                      {table.count.toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}
