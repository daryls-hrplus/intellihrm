import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  Building2,
  Factory,
  Loader2,
  Check,
  Info,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RecommendedScenario {
  name: string;
  description: string;
  growthRate: number;
  attritionRate: number;
  budgetConstraint: number;
  timeHorizon: number;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

interface RecommendationResult {
  analysis: string;
  recommendations: RecommendedScenario[];
  industryInsights: string;
}

interface ScenarioRecommendationsProps {
  currentHeadcount: number;
  onApplyScenario?: (scenario: {
    name: string;
    description: string;
    growthRate: number;
    attritionRate: number;
    budgetConstraint: number;
    timeHorizon: number;
  }) => void;
}

const INDUSTRIES = [
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'finance', label: 'Finance & Banking', icon: '🏦' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'retail', label: 'Retail & E-commerce', icon: '🛒' },
  { value: 'professional_services', label: 'Professional Services', icon: '💼' },
  { value: 'energy', label: 'Energy & Utilities', icon: '⚡' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'hospitality', label: 'Hospitality & Tourism', icon: '🏨' },
  { value: 'construction', label: 'Construction', icon: '🏗️' },
];

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-50)', range: '1-50' },
  { value: 'small', label: 'Small (51-200)', range: '51-200' },
  { value: 'medium', label: 'Medium (201-1000)', range: '201-1000' },
  { value: 'large', label: 'Large (1001+)', range: '1001+' },
];

export const ScenarioRecommendations: React.FC<ScenarioRecommendationsProps> = ({
  currentHeadcount,
  onApplyScenario
}) => {
  const [industry, setIndustry] = useState<string>('');
  const [companySize, setCompanySize] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [appliedScenarios, setAppliedScenarios] = useState<Set<string>>(new Set());

  // Auto-detect company size based on headcount
  const detectCompanySize = () => {
    if (currentHeadcount <= 50) return 'startup';
    if (currentHeadcount <= 200) return 'small';
    if (currentHeadcount <= 1000) return 'medium';
    return 'large';
  };

  const getRecommendations = async () => {
    if (!industry) {
      toast.error('Please select an industry');
      return;
    }

    const size = companySize || detectCompanySize();
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('scenario-recommendations', {
        body: {
          companySize: size,
          industry,
          currentHeadcount,
          historicalGrowth: null
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success('Recommendations generated');
    } catch (err) {
      console.error('Error getting recommendations:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const applyScenario = (scenario: RecommendedScenario) => {
    if (onApplyScenario) {
      onApplyScenario({
        name: scenario.name,
        description: scenario.description,
        growthRate: scenario.growthRate,
        attritionRate: scenario.attritionRate,
        budgetConstraint: scenario.budgetConstraint,
        timeHorizon: scenario.timeHorizon,
      });
      setAppliedScenarios(prev => new Set([...prev, scenario.name]));
      toast.success(`Applied: ${scenario.name}`);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">High Confidence</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Medium Confidence</Badge>;
      default:
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Low Confidence</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Scenario Recommendations
        </CardTitle>
        <CardDescription>
          Get personalized scenario suggestions based on your company size and industry benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Industry</Label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map(ind => (
                <option key={ind.value} value={ind.value}>
                  {ind.icon} {ind.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Company Size (Optional)</Label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Auto-detect ({detectCompanySize()})</option>
              {COMPANY_SIZES.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Current Headcount: <span className="font-medium text-foreground">{currentHeadcount}</span>
          </div>
        </div>

        <Button 
          onClick={getRecommendations} 
          disabled={isLoading || !industry}
          className="w-full md:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-2" />
              Get AI Recommendations
            </>
          )}
        </Button>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 pt-4 border-t">
            {/* Analysis */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Analysis:</span> {result.analysis}
              </AlertDescription>
            </Alert>

            {/* Industry Insights */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">Industry Insights</span>
              </div>
              <p className="text-sm text-muted-foreground">{result.industryInsights}</p>
            </div>

            {/* Recommended Scenarios */}
            <div className="space-y-4">
              <Label className="text-base">Recommended Scenarios</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {result.recommendations.map((scenario, index) => (
                  <Card key={index} className="relative overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{scenario.name}</h4>
                          <p className="text-sm text-muted-foreground">{scenario.description}</p>
                        </div>
                        {getConfidenceBadge(scenario.confidence)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Growth:</span>
                          <span className="font-medium">{scenario.growthRate}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Attrition:</span>
                          <span className="font-medium ml-1">{scenario.attritionRate}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Budget:</span>
                          <span className="font-medium ml-1">{scenario.budgetConstraint}/qtr</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Horizon:</span>
                          <span className="font-medium ml-1">{scenario.timeHorizon} months</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground italic border-t pt-2">
                        {scenario.rationale}
                      </p>

                      {onApplyScenario && (
                        <Button
                          size="sm"
                          variant={appliedScenarios.has(scenario.name) ? "secondary" : "default"}
                          onClick={() => applyScenario(scenario)}
                          disabled={appliedScenarios.has(scenario.name)}
                          className="w-full"
                        >
                          {appliedScenarios.has(scenario.name) ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Applied
                            </>
                          ) : (
                            <>
                              <ChevronRight className="h-3 w-3 mr-1" />
                              Apply Scenario
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
