import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDataManagement } from '@/hooks/useDataManagement';
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
  Calendar
} from 'lucide-react';

export default function DataManagementPage() {
  const { isPopulating, isPurging, isLoadingStats, populateData, purgeData, getPurgeStatistics } = useDataManagement();
  
  const [selectedDataSet, setSelectedDataSet] = useState<DataSet>('standard');
  const [selectedPurgeLevel, setSelectedPurgeLevel] = useState<PurgeLevel>('transactions_only');
  const [confirmationText, setConfirmationText] = useState('');
  const [purgeStats, setPurgeStats] = useState<TableStatistics[]>([]);
  const [populationResult, setPopulationResult] = useState<PopulationResult | null>(null);
  const [purgeResult, setPurgeResult] = useState<PurgeResult | null>(null);

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
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Management</h1>
        <p className="text-muted-foreground">Populate demo data or purge transactional records</p>
      </div>

      <Tabs defaultValue="populate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="populate" className="gap-2">
            <Database className="h-4 w-4" />
            Populate Data
          </TabsTrigger>
          <TabsTrigger value="purge" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Purge Data
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
                onValueChange={(v) => setSelectedDataSet(v as DataSet)}
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
                  setSelectedPurgeLevel(v as PurgeLevel);
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
      </Tabs>
    </div>
  );
}
