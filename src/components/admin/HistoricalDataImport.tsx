import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface HistoricalDataPoint {
  date: string;
  headcount: number;
  hires: number;
  terminations: number;
}

interface CalibratedParameters {
  growthRate: number;
  attritionRate: number;
  hiringEfficiency: number;
  seasonalityFactor: number;
  volatility: number;
}

interface HistoricalDataImportProps {
  onParametersCalibrated?: (params: CalibratedParameters) => void;
}

export const HistoricalDataImport: React.FC<HistoricalDataImportProps> = ({
  onParametersCalibrated
}) => {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [calibratedParams, setCalibratedParams] = useState<CalibratedParameters | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = `date,headcount,hires,terminations
2024-01,100,5,3
2024-02,102,4,2
2024-03,104,6,4
2024-04,106,5,3
2024-05,108,7,4
2024-06,111,6,3
2024-07,114,8,5
2024-08,117,6,3
2024-09,120,7,4
2024-10,123,5,2
2024-11,126,6,3
2024-12,129,4,1`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historical_workforce_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): HistoricalDataPoint[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const dateIdx = headers.findIndex(h => h.includes('date'));
    const headcountIdx = headers.findIndex(h => h.includes('headcount') || h.includes('employees') || h.includes('count'));
    const hiresIdx = headers.findIndex(h => h.includes('hire') || h.includes('new'));
    const terminationsIdx = headers.findIndex(h => h.includes('termination') || h.includes('exit') || h.includes('leave'));

    if (dateIdx === -1 || headcountIdx === -1) {
      throw new Error('CSV must contain "date" and "headcount" columns');
    }

    const data: HistoricalDataPoint[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 2) {
        data.push({
          date: values[dateIdx],
          headcount: parseInt(values[headcountIdx]) || 0,
          hires: hiresIdx !== -1 ? parseInt(values[hiresIdx]) || 0 : 0,
          terminations: terminationsIdx !== -1 ? parseInt(values[terminationsIdx]) || 0 : 0
        });
      }
    }

    return data.sort((a, b) => a.date.localeCompare(b.date));
  };

  const analyzeData = (data: HistoricalDataPoint[]): CalibratedParameters => {
    if (data.length < 2) {
      throw new Error('Need at least 2 data points for analysis');
    }

    // Calculate growth rate
    const firstHeadcount = data[0].headcount;
    const lastHeadcount = data[data.length - 1].headcount;
    const periods = data.length - 1;
    const annualizedGrowth = Math.pow(lastHeadcount / firstHeadcount, 12 / periods) - 1;
    const growthRate = Math.round(annualizedGrowth * 1000) / 10;

    // Calculate attrition rate
    const totalTerminations = data.reduce((sum, d) => sum + d.terminations, 0);
    const avgHeadcount = data.reduce((sum, d) => sum + d.headcount, 0) / data.length;
    const monthlyAttrition = totalTerminations / periods / avgHeadcount;
    const annualizedAttrition = monthlyAttrition * 12;
    const attritionRate = Math.round(annualizedAttrition * 1000) / 10;

    // Calculate hiring efficiency (hires that stick vs total hires)
    const totalHires = data.reduce((sum, d) => sum + d.hires, 0);
    const netChange = lastHeadcount - firstHeadcount + totalTerminations;
    const hiringEfficiency = totalHires > 0 ? Math.round((netChange / totalHires) * 100) : 80;

    // Calculate seasonality (variance in monthly changes)
    const monthlyChanges = data.slice(1).map((d, i) => d.headcount - data[i].headcount);
    const avgChange = monthlyChanges.reduce((a, b) => a + b, 0) / monthlyChanges.length;
    const variance = monthlyChanges.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / monthlyChanges.length;
    const stdDev = Math.sqrt(variance);
    const seasonalityFactor = avgChange !== 0 ? Math.min(Math.round((stdDev / Math.abs(avgChange)) * 100) / 100, 2) : 1;

    // Calculate volatility (coefficient of variation)
    const headcountStdDev = Math.sqrt(
      data.reduce((sum, d) => sum + Math.pow(d.headcount - avgHeadcount, 2), 0) / data.length
    );
    const volatility = Math.round((headcountStdDev / avgHeadcount) * 1000) / 10;

    return {
      growthRate: Math.max(-50, Math.min(50, growthRate)),
      attritionRate: Math.max(0, Math.min(50, attritionRate)),
      hiringEfficiency: Math.max(50, Math.min(100, hiringEfficiency)),
      seasonalityFactor: Math.max(0.5, Math.min(2, seasonalityFactor)),
      volatility: Math.max(0, Math.min(30, volatility))
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsAnalyzing(true);
    setFileName(file.name);

    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length < 2) {
        throw new Error('Need at least 2 data points');
      }

      setHistoricalData(data);
      const params = analyzeData(data);
      setCalibratedParams(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setHistoricalData([]);
      setCalibratedParams(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyParameters = () => {
    if (calibratedParams && onParametersCalibrated) {
      onParametersCalibrated(calibratedParams);
    }
  };

  const getGrowthTrend = () => {
    if (!calibratedParams) return null;
    return calibratedParams.growthRate >= 0 ? 'positive' : 'negative';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Historical Data Calibration
        </CardTitle>
        <CardDescription>
          Import historical workforce data to calibrate scenario parameters based on actual trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {fileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileSpreadsheet className="h-4 w-4" />
              {fileName}
              {historicalData.length > 0 && (
                <Badge variant="secondary">{historicalData.length} records</Badge>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Historical Data Chart */}
        {historicalData.length > 0 && (
          <div className="space-y-4">
            <Label>Historical Headcount Trend</Label>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="headcount" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    name="Headcount"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Hires vs Terminations */}
            {(historicalData[0].hires > 0 || historicalData[0].terminations > 0) && (
              <>
                <Label>Workforce Movement</Label>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="hires" 
                        stroke="hsl(142.1 76.2% 36.3%)" 
                        strokeWidth={2}
                        name="Hires"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="terminations" 
                        stroke="hsl(0 84.2% 60.2%)" 
                        strokeWidth={2}
                        name="Terminations"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {/* Calibrated Parameters */}
        {calibratedParams && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <Label className="text-base font-medium">Calibrated Parameters</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Growth Rate</span>
                  {getGrowthTrend() === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {calibratedParams.growthRate > 0 ? '+' : ''}{calibratedParams.growthRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Annualized</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Attrition Rate</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{calibratedParams.attritionRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">Annual turnover</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Hiring Efficiency</span>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{calibratedParams.hiringEfficiency}%</div>
                <p className="text-xs text-muted-foreground mt-1">Net retention</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Seasonality Factor</span>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{calibratedParams.seasonalityFactor}x</div>
                <p className="text-xs text-muted-foreground mt-1">Variance multiplier</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Volatility</span>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{calibratedParams.volatility}%</div>
                <p className="text-xs text-muted-foreground mt-1">Historical CV</p>
              </Card>
            </div>

            <Alert>
              <AlertDescription className="text-sm">
                These parameters were calculated from {historicalData.length} data points spanning from {historicalData[0]?.date} to {historicalData[historicalData.length - 1]?.date}. 
                Apply these to use data-driven scenario planning.
              </AlertDescription>
            </Alert>

            {onParametersCalibrated && (
              <Button onClick={applyParameters} className="w-full">
                Apply Calibrated Parameters to Scenarios
              </Button>
            )}
          </div>
        )}

        {/* CSV Format Info */}
        {!historicalData.length && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <p className="font-medium mb-2">Expected CSV Format:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code>date</code> - Period identifier (e.g., 2024-01, Jan 2024)</li>
              <li><code>headcount</code> - Total employee count at period end</li>
              <li><code>hires</code> - New hires during period (optional)</li>
              <li><code>terminations</code> - Exits during period (optional)</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
