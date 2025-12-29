import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calculator, Sparkles, DollarSign, TrendingUp, AlertTriangle, 
  Lightbulb, Loader2, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  FileText, CheckCircle2, XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CBANegotiationCostingToolProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementId: string;
  companyId: string;
}

interface CostLineItem {
  category: string;
  item_name: string;
  description?: string;
  current_cost?: number;
  proposed_cost?: number;
  annual_increase: number;
  is_recurring: boolean;
  implementation_cost?: number;
  risk_level?: string;
  notes?: string;
}

interface CostAnalysis {
  summary: {
    total_annual_cost: number;
    total_contract_cost: number;
    per_employee_annual: number;
    percentage_increase: number;
    contract_term_years?: number;
  };
  line_items: CostLineItem[];
  scenarios?: {
    optimistic?: { total_annual_cost: number; assumptions: string };
    pessimistic?: { total_annual_cost: number; assumptions: string };
  };
  recommendations: string[];
  risks?: Array<{ risk: string; impact: string; mitigation: string }>;
  assumptions: string[];
}

export function CBANegotiationCostingTool({ open, onOpenChange, agreementId, companyId }: CBANegotiationCostingToolProps) {
  const { t } = useTranslation();
  const [proposalText, setProposalText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CostAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("summary");

  const analyzeProposal = async () => {
    if (!proposalText.trim()) {
      toast.error("Please enter proposal details");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("cba-negotiation-costing", {
        body: { 
          proposalDetails: proposalText, 
          agreementId, 
          companyId 
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      setAnalysis(data.data);
      setActiveTab("summary");
      toast.success("Cost analysis complete!");

    } catch (err) {
      console.error("Analysis error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to analyze proposal");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      wages: "bg-green-500/10 text-green-600",
      benefits: "bg-blue-500/10 text-blue-600",
      overtime: "bg-purple-500/10 text-purple-600",
      leave: "bg-teal-500/10 text-teal-600",
      pension: "bg-amber-500/10 text-amber-600",
      insurance: "bg-rose-500/10 text-rose-600",
      other: "bg-gray-500/10 text-gray-600"
    };
    return colors[category] || colors.other;
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-500/10 text-green-600",
      medium: "bg-amber-500/10 text-amber-600",
      high: "bg-red-500/10 text-red-600"
    };
    return colors[risk] || colors.medium;
  };

  const handleClose = () => {
    setProposalText("");
    setAnalysis(null);
    setActiveTab("summary");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            AI Negotiation Costing Tool
          </DialogTitle>
          <DialogDescription>
            Analyze the financial impact of negotiation proposals with AI-powered cost projections.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!analysis ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Proposal Details</label>
                <Textarea
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  placeholder={`Enter the negotiation proposal details. For example:

- 3.5% base wage increase in Year 1, 3% in Years 2 and 3
- Increase employer health insurance contribution from 80% to 85%
- Add 2 additional personal days per year
- Increase shift differential from $1.50 to $2.00 per hour
- New parental leave policy: 6 weeks paid leave
- Increase 401k match from 4% to 5%`}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">AI will analyze:</p>
                      <ul className="text-muted-foreground mt-1 space-y-1">
                        <li>• Annual and multi-year cost projections</li>
                        <li>• Per-employee cost impact</li>
                        <li>• Optimistic and pessimistic scenarios</li>
                        <li>• Risk assessment and mitigation strategies</li>
                        <li>• Strategic recommendations</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isAnalyzing && (
                <div className="flex flex-col items-center py-8 space-y-4">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Analyzing proposal costs...</p>
                </div>
              )}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                {/* Summary Tab */}
                <TabsContent value="summary" className="mt-0 space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs">Annual Impact</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(analysis.summary.total_annual_cost)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <BarChart3 className="h-4 w-4" />
                          <span className="text-xs">Contract Total</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(analysis.summary.total_contract_cost)}</p>
                        <p className="text-xs text-muted-foreground">{analysis.summary.contract_term_years || 3} year term</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs">Per Employee</span>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(analysis.summary.per_employee_annual)}</p>
                        <p className="text-xs text-muted-foreground">annually</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <PieChart className="h-4 w-4" />
                          <span className="text-xs">Cost Increase</span>
                        </div>
                        <p className={`text-2xl font-bold ${analysis.summary.percentage_increase >= 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatPercentage(analysis.summary.percentage_increase)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cost by Category */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Cost by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(
                          analysis.line_items.reduce((acc, item) => {
                            acc[item.category] = (acc[item.category] || 0) + item.annual_increase;
                            return acc;
                          }, {} as Record<string, number>)
                        ).sort((a, b) => b[1] - a[1]).map(([category, amount]) => {
                          const percentage = (amount / analysis.summary.total_annual_cost) * 100;
                          return (
                            <div key={category} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">{category}</span>
                                <span className="font-medium">{formatCurrency(amount)}</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Assumptions */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Key Assumptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {analysis.assumptions.map((assumption, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Cost Breakdown Tab */}
                <TabsContent value="breakdown" className="mt-0">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Current</TableHead>
                            <TableHead className="text-right">Proposed</TableHead>
                            <TableHead className="text-right">Annual Impact</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Risk</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysis.line_items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Badge className={getCategoryColor(item.category)}>
                                  {item.category}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.item_name}</p>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {item.current_cost ? formatCurrency(item.current_cost) : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.proposed_cost ? formatCurrency(item.proposed_cost) : "-"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                <span className={item.annual_increase >= 0 ? "text-red-600" : "text-green-600"}>
                                  {item.annual_increase >= 0 ? "+" : ""}{formatCurrency(item.annual_increase)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {item.is_recurring ? "Recurring" : "One-time"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {item.risk_level && (
                                  <Badge className={getRiskColor(item.risk_level)}>
                                    {item.risk_level}
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Scenarios Tab */}
                <TabsContent value="scenarios" className="mt-0 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {analysis.scenarios?.optimistic && (
                      <Card className="border-green-500/30">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <ArrowDownRight className="h-5 w-5 text-green-600" />
                            <CardTitle className="text-base">Optimistic</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(analysis.scenarios.optimistic.total_annual_cost)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {analysis.scenarios.optimistic.assumptions}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    <Card className="border-primary/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          <CardTitle className="text-base">Base Case</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatCurrency(analysis.summary.total_annual_cost)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Most likely scenario based on current assumptions
                        </p>
                      </CardContent>
                    </Card>
                    {analysis.scenarios?.pessimistic && (
                      <Card className="border-red-500/30">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-5 w-5 text-red-600" />
                            <CardTitle className="text-base">Pessimistic</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(analysis.scenarios.pessimistic.total_annual_cost)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {analysis.scenarios.pessimistic.assumptions}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Risks Tab */}
                <TabsContent value="risks" className="mt-0 space-y-4">
                  {analysis.risks && analysis.risks.length > 0 ? (
                    analysis.risks.map((risk, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${getRiskColor(risk.impact)}`}>
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{risk.risk}</p>
                                <Badge className={getRiskColor(risk.impact)}>{risk.impact} impact</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Mitigation:</span> {risk.mitigation}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No significant risks identified</p>
                    </div>
                  )}
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="mt-0 space-y-4">
                  {analysis.recommendations.map((rec, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-sm">{rec}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </div>

        <DialogFooter>
          {!analysis ? (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={analyzeProposal} disabled={isAnalyzing || !proposalText.trim()}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Costs
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setAnalysis(null)}>
                New Analysis
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
