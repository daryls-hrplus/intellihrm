import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Users, 
  TrendingUp,
  Calculator,
  PieChart,
  Building2,
  Heart,
  Briefcase,
  GraduationCap,
  Settings2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';

interface SalaryBand {
  id: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  headcountPercent: number;
  icon: React.ReactNode;
}

interface BenefitsConfig {
  healthInsurance: number;
  retirement401k: number;
  paidTimeOff: number;
  training: number;
  other: number;
}

interface ScenarioProjection {
  scenarioId: string;
  scenarioName: string;
  projections: {
    month: string;
    headcount: number;
  }[];
  finalHeadcount: number;
}

interface WorkforceCostProjectionsProps {
  currentHeadcount: number;
  scenarios: ScenarioProjection[];
}

const DEFAULT_SALARY_BANDS: SalaryBand[] = [
  { id: 'executive', name: 'Executive', minSalary: 200000, maxSalary: 400000, avgSalary: 280000, headcountPercent: 5, icon: <Building2 className="h-4 w-4" /> },
  { id: 'senior', name: 'Senior Management', minSalary: 120000, maxSalary: 200000, avgSalary: 150000, headcountPercent: 15, icon: <Briefcase className="h-4 w-4" /> },
  { id: 'mid', name: 'Mid-Level', minSalary: 70000, maxSalary: 120000, avgSalary: 90000, headcountPercent: 35, icon: <Users className="h-4 w-4" /> },
  { id: 'junior', name: 'Junior/Entry', minSalary: 45000, maxSalary: 70000, avgSalary: 55000, headcountPercent: 35, icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'intern', name: 'Intern/Trainee', minSalary: 30000, maxSalary: 45000, avgSalary: 38000, headcountPercent: 10, icon: <GraduationCap className="h-4 w-4" /> },
];

const DEFAULT_BENEFITS: BenefitsConfig = {
  healthInsurance: 12,
  retirement401k: 6,
  paidTimeOff: 8,
  training: 2,
  other: 4,
};

export const WorkforceCostProjections: React.FC<WorkforceCostProjectionsProps> = ({
  currentHeadcount,
  scenarios
}) => {
  const [salaryBands, setSalaryBands] = useState<SalaryBand[]>(DEFAULT_SALARY_BANDS);
  const [benefits, setBenefits] = useState<BenefitsConfig>(DEFAULT_BENEFITS);
  const [currency, setCurrency] = useState<string>('USD');
  const [showConfig, setShowConfig] = useState(false);

  const totalBenefitsPercent = useMemo(() => {
    return Object.values(benefits).reduce((sum, val) => sum + val, 0);
  }, [benefits]);

  const calculateCosts = useMemo(() => {
    // Calculate weighted average salary
    const weightedAvgSalary = salaryBands.reduce((sum, band) => {
      return sum + (band.avgSalary * band.headcountPercent / 100);
    }, 0);

    // Calculate cost per employee (salary + benefits)
    const benefitsMultiplier = 1 + totalBenefitsPercent / 100;
    const costPerEmployee = weightedAvgSalary * benefitsMultiplier;

    // Calculate current costs
    const currentMonthlyCost = (currentHeadcount * costPerEmployee) / 12;
    const currentAnnualCost = currentHeadcount * costPerEmployee;

    // Calculate projections for each scenario
    const scenarioCosts = scenarios.map(scenario => {
      const projectedCosts = scenario.projections.map(proj => {
        const monthlySalaryCost = (proj.headcount * weightedAvgSalary) / 12;
        const monthlyBenefitsCost = monthlySalaryCost * (totalBenefitsPercent / 100);
        const totalMonthlyCost = monthlySalaryCost + monthlyBenefitsCost;
        
        return {
          month: proj.month,
          headcount: proj.headcount,
          salaryCost: monthlySalaryCost,
          benefitsCost: monthlyBenefitsCost,
          totalCost: totalMonthlyCost,
        };
      });

      const finalAnnualCost = scenario.finalHeadcount * costPerEmployee;
      const costChange = finalAnnualCost - currentAnnualCost;
      const costChangePercent = (costChange / currentAnnualCost) * 100;

      return {
        scenarioId: scenario.scenarioId,
        scenarioName: scenario.scenarioName,
        projectedCosts,
        finalAnnualCost,
        costChange,
        costChangePercent,
      };
    });

    return {
      weightedAvgSalary,
      costPerEmployee,
      currentMonthlyCost,
      currentAnnualCost,
      scenarioCosts,
    };
  }, [salaryBands, benefits, totalBenefitsPercent, currentHeadcount, scenarios]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompact = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const updateSalaryBand = (id: string, field: keyof SalaryBand, value: number) => {
    setSalaryBands(prev => prev.map(band => {
      if (band.id === id) {
        const updated = { ...band, [field]: value };
        if (field === 'minSalary' || field === 'maxSalary') {
          updated.avgSalary = Math.round((updated.minSalary + updated.maxSalary) / 2);
        }
        return updated;
      }
      return band;
    }));
  };

  // Prepare chart data
  const costTrendData = useMemo(() => {
    if (scenarios.length === 0 || calculateCosts.scenarioCosts.length === 0) return [];
    
    const firstScenarioCosts = calculateCosts.scenarioCosts[0].projectedCosts;
    return firstScenarioCosts.map((_, idx) => {
      const point: Record<string, any> = {
        month: calculateCosts.scenarioCosts[0].projectedCosts[idx].month,
      };
      calculateCosts.scenarioCosts.forEach(sc => {
        point[sc.scenarioName] = sc.projectedCosts[idx]?.totalCost || 0;
      });
      return point;
    });
  }, [calculateCosts, scenarios]);

  const costBreakdownData = useMemo(() => {
    return [
      { name: 'Health Insurance', value: benefits.healthInsurance, fill: 'hsl(var(--primary))' },
      { name: '401(k) Match', value: benefits.retirement401k, fill: 'hsl(var(--success))' },
      { name: 'PTO', value: benefits.paidTimeOff, fill: 'hsl(var(--warning))' },
      { name: 'Training', value: benefits.training, fill: 'hsl(var(--accent))' },
      { name: 'Other', value: benefits.other, fill: 'hsl(var(--muted-foreground))' },
    ];
  }, [benefits]);

  const scenarioColors = [
    "hsl(var(--primary))",
    "hsl(142.1 76.2% 36.3%)",
    "hsl(38 92% 50%)",
    "hsl(0 84.2% 60.2%)",
  ];

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Workforce Cost Projections
          </CardTitle>
          <CardDescription>
            Create scenarios to see cost projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Run scenario simulations to generate cost projections</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Workforce Cost Projections
            </CardTitle>
            <CardDescription>
              Salary bands and benefits estimation based on scenario headcount projections
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            {showConfig ? 'Hide' : 'Configure'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current State Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Headcount</span>
            </div>
            <div className="text-2xl font-bold">{currentHeadcount}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg Cost/Employee</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(calculateCosts.costPerEmployee)}</div>
            <p className="text-xs text-muted-foreground">Salary + {totalBenefitsPercent}% benefits</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Monthly Cost</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(calculateCosts.currentMonthlyCost)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Annual Cost</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(calculateCosts.currentAnnualCost)}</div>
          </Card>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
            <div>
              <Label className="text-base font-medium">Salary Bands</Label>
              <p className="text-sm text-muted-foreground mb-4">Configure salary ranges and workforce distribution</p>
              <div className="space-y-4">
                {salaryBands.map(band => (
                  <div key={band.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-3 bg-background rounded-lg border">
                    <div className="flex items-center gap-2">
                      {band.icon}
                      <span className="font-medium">{band.name}</span>
                    </div>
                    <div>
                      <Label className="text-xs">Min Salary</Label>
                      <Input
                        type="number"
                        value={band.minSalary}
                        onChange={(e) => updateSalaryBand(band.id, 'minSalary', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Salary</Label>
                      <Input
                        type="number"
                        value={band.maxSalary}
                        onChange={(e) => updateSalaryBand(band.id, 'maxSalary', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Avg: {formatCurrency(band.avgSalary)}</Label>
                      <div className="h-8 flex items-center">
                        <Badge variant="secondary">{formatCurrency(band.avgSalary)}</Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">% of Workforce</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[band.headcountPercent]}
                          onValueChange={([val]) => updateSalaryBand(band.id, 'headcountPercent', val)}
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm w-10">{band.headcountPercent}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Benefits (% of Salary)
              </Label>
              <p className="text-sm text-muted-foreground mb-4">Total benefits: {totalBenefitsPercent}% of base salary</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-xs">Health Insurance</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[benefits.healthInsurance]}
                      onValueChange={([val]) => setBenefits(prev => ({ ...prev, healthInsurance: val }))}
                      max={30}
                      step={1}
                    />
                    <span className="text-sm w-10">{benefits.healthInsurance}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">401(k) Match</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[benefits.retirement401k]}
                      onValueChange={([val]) => setBenefits(prev => ({ ...prev, retirement401k: val }))}
                      max={15}
                      step={0.5}
                    />
                    <span className="text-sm w-10">{benefits.retirement401k}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">PTO Cost</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[benefits.paidTimeOff]}
                      onValueChange={([val]) => setBenefits(prev => ({ ...prev, paidTimeOff: val }))}
                      max={15}
                      step={1}
                    />
                    <span className="text-sm w-10">{benefits.paidTimeOff}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Training</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[benefits.training]}
                      onValueChange={([val]) => setBenefits(prev => ({ ...prev, training: val }))}
                      max={10}
                      step={0.5}
                    />
                    <span className="text-sm w-10">{benefits.training}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Other Benefits</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[benefits.other]}
                      onValueChange={([val]) => setBenefits(prev => ({ ...prev, other: val }))}
                      max={15}
                      step={1}
                    />
                    <span className="text-sm w-10">{benefits.other}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scenario Cost Comparisons */}
        <div>
          <Label className="text-base font-medium mb-4 block">Projected Annual Costs by Scenario</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {calculateCosts.scenarioCosts.map((sc, idx) => (
              <Card key={sc.scenarioId} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: scenarioColors[idx % scenarioColors.length] }}
                  />
                  <span className="font-medium text-sm truncate">{sc.scenarioName}</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(sc.finalAnnualCost)}</div>
                <div className={`text-sm flex items-center gap-1 ${sc.costChange >= 0 ? 'text-destructive' : 'text-success'}`}>
                  <TrendingUp className={`h-3 w-3 ${sc.costChange < 0 ? 'rotate-180' : ''}`} />
                  {sc.costChange >= 0 ? '+' : ''}{formatCurrency(sc.costChange)}
                  <span className="text-muted-foreground">
                    ({sc.costChangePercent >= 0 ? '+' : ''}{sc.costChangePercent.toFixed(1)}%)
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Cost Trend Chart */}
        {costTrendData.length > 0 && (
          <div>
            <Label className="text-base font-medium mb-4 block">Monthly Cost Projections</Label>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    className="text-xs" 
                    tickFormatter={(val) => `$${formatCompact(val)}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  {calculateCosts.scenarioCosts.map((sc, idx) => (
                    <Area
                      key={sc.scenarioId}
                      type="monotone"
                      dataKey={sc.scenarioName}
                      stroke={scenarioColors[idx % scenarioColors.length]}
                      fill={scenarioColors[idx % scenarioColors.length]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Benefits Breakdown */}
        <div>
          <Label className="text-base font-medium mb-4 block">Benefits Cost Breakdown</Label>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdownData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickFormatter={(val) => `${val}%`} />
                <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                <Tooltip 
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {costBreakdownData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Summary Table */}
        <div>
          <Label className="text-base font-medium mb-4 block">Detailed Cost Summary</Label>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Scenario</th>
                  <th className="text-right py-2 px-3">Final HC</th>
                  <th className="text-right py-2 px-3">Annual Salary</th>
                  <th className="text-right py-2 px-3">Annual Benefits</th>
                  <th className="text-right py-2 px-3">Total Annual</th>
                  <th className="text-right py-2 px-3">Monthly</th>
                  <th className="text-right py-2 px-3">vs Current</th>
                </tr>
              </thead>
              <tbody>
                {calculateCosts.scenarioCosts.map(sc => {
                  const scenario = scenarios.find(s => s.scenarioId === sc.scenarioId);
                  const finalHC = scenario?.finalHeadcount || 0;
                  const annualSalary = finalHC * calculateCosts.weightedAvgSalary;
                  const annualBenefits = annualSalary * (totalBenefitsPercent / 100);
                  
                  return (
                    <tr key={sc.scenarioId} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-medium">{sc.scenarioName}</td>
                      <td className="text-right py-2 px-3">{finalHC}</td>
                      <td className="text-right py-2 px-3">{formatCurrency(annualSalary)}</td>
                      <td className="text-right py-2 px-3">{formatCurrency(annualBenefits)}</td>
                      <td className="text-right py-2 px-3 font-medium">{formatCurrency(sc.finalAnnualCost)}</td>
                      <td className="text-right py-2 px-3">{formatCurrency(sc.finalAnnualCost / 12)}</td>
                      <td className={`text-right py-2 px-3 ${sc.costChange >= 0 ? 'text-destructive' : 'text-success'}`}>
                        {sc.costChange >= 0 ? '+' : ''}{formatCurrency(sc.costChange)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
