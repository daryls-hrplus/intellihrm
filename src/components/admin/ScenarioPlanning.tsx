import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { 
  Plus, 
  Play, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  Copy,
  Settings2,
  Download,
  FileText,
  FileSpreadsheet,
  Save,
  Share2,
  Link,
  FolderOpen,
  Loader2,
  Check
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface ScenarioParameters {
  id: string;
  name: string;
  description: string;
  growthRate: number; // % annual growth target
  attritionRate: number; // % expected attrition
  budgetConstraint: number; // max new hires per quarter
  timeHorizon: number; // months to forecast
  seasonalAdjustment: boolean;
  aggressiveHiring: boolean;
}

interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  projections: {
    month: string;
    headcount: number;
    hires: number;
    attrition: number;
    netChange: number;
  }[];
  totalHires: number;
  totalAttrition: number;
  finalHeadcount: number;
  budgetUtilization: number;
  feasibility: "high" | "medium" | "low";
}

interface ScenarioPlanningProps {
  currentHeadcount: number;
  sharedToken?: string;
}

interface SavedScenarioSet {
  id: string;
  name: string;
  description: string | null;
  parameters: ScenarioParameters[];
  results: ScenarioResult[] | null;
  current_headcount: number;
  is_shared: boolean;
  share_token: string | null;
  created_at: string;
}

const defaultScenario: Omit<ScenarioParameters, "id"> = {
  name: "",
  description: "",
  growthRate: 10,
  attritionRate: 12,
  budgetConstraint: 5,
  timeHorizon: 12,
  seasonalAdjustment: true,
  aggressiveHiring: false,
};

const presetScenarios: { name: string; params: Partial<ScenarioParameters> }[] = [
  { 
    name: "Conservative Growth", 
    params: { growthRate: 5, attritionRate: 10, budgetConstraint: 3, aggressiveHiring: false }
  },
  { 
    name: "Moderate Expansion", 
    params: { growthRate: 15, attritionRate: 12, budgetConstraint: 8, aggressiveHiring: false }
  },
  { 
    name: "Aggressive Growth", 
    params: { growthRate: 30, attritionRate: 15, budgetConstraint: 15, aggressiveHiring: true }
  },
  { 
    name: "Headcount Freeze", 
    params: { growthRate: 0, attritionRate: 10, budgetConstraint: 0, aggressiveHiring: false }
  },
];

export function ScenarioPlanning({ currentHeadcount, sharedToken }: ScenarioPlanningProps) {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<ScenarioParameters[]>([]);
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ScenarioParameters | null>(null);
  const [newScenario, setNewScenario] = useState<Omit<ScenarioParameters, "id">>(defaultScenario);
  const [isRunning, setIsRunning] = useState(false);
  
  // Save/Load state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedSets, setSavedSets] = useState<SavedScenarioSet[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    if (sharedToken) {
      loadSharedScenario(sharedToken);
    }
  }, [sharedToken]);

  const loadSharedScenario = async (token: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("saved_scenarios")
      .select("*")
      .eq("share_token", token)
      .eq("is_shared", true)
      .maybeSingle();

    if (error || !data) {
      toast.error("Shared scenario not found or no longer available");
      setIsLoading(false);
      return;
    }

    const params = data.parameters as unknown as ScenarioParameters[];
    const res = data.results as unknown as ScenarioResult[] | null;
    
    setScenarios(params);
    if (res) setResults(res);
    toast.success(`Loaded shared scenario: ${data.name}`);
    setIsLoading(false);
  };

  const fetchSavedSets = async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("saved_scenarios")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching saved scenarios:", error);
    } else if (data) {
      setSavedSets(data.map(d => ({
        ...d,
        parameters: d.parameters as unknown as ScenarioParameters[],
        results: d.results as unknown as ScenarioResult[] | null,
      })));
    }
    setIsLoading(false);
  };

  const saveScenarioSet = async () => {
    if (!user || scenarios.length === 0) {
      toast.error("No scenarios to save");
      return;
    }
    if (!saveName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setIsSaving(true);
    const { data, error } = await supabase
      .from("saved_scenarios")
      .insert({
        name: saveName,
        description: saveDescription || null,
        parameters: scenarios as unknown as Json,
        results: results.length > 0 ? (results as unknown as Json) : null,
        current_headcount: currentHeadcount,
        created_by: user.id,
        is_shared: false,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to save scenarios");
      console.error(error);
    } else {
      toast.success("Scenarios saved successfully");
      setCurrentSavedId(data.id);
      setShowSaveDialog(false);
      setSaveName("");
      setSaveDescription("");
    }
    setIsSaving(false);
  };

  const loadScenarioSet = (set: SavedScenarioSet) => {
    setScenarios(set.parameters);
    if (set.results) setResults(set.results);
    setCurrentSavedId(set.id);
    setShowLoadDialog(false);
    toast.success(`Loaded: ${set.name}`);
  };

  const deleteScenarioSet = async (id: string) => {
    const { error } = await supabase
      .from("saved_scenarios")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      setSavedSets(prev => prev.filter(s => s.id !== id));
      if (currentSavedId === id) setCurrentSavedId(null);
      toast.success("Deleted");
    }
  };

  const generateShareLink = async () => {
    if (!user || scenarios.length === 0) {
      toast.error("No scenarios to share");
      return;
    }

    // Generate a unique share token
    const shareToken = Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
    
    setIsSaving(true);
    const { data, error } = await supabase
      .from("saved_scenarios")
      .insert({
        name: `Shared ${new Date().toLocaleDateString()}`,
        parameters: scenarios as unknown as Json,
        results: results.length > 0 ? (results as unknown as Json) : null,
        current_headcount: currentHeadcount,
        created_by: user.id,
        is_shared: true,
        share_token: shareToken,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create share link");
      console.error(error);
    } else {
      const url = `${window.location.origin}/admin/org-structure?scenario=${shareToken}`;
      setShareUrl(url);
      setCurrentSavedId(data.id);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied to clipboard!");
    }
    setIsSaving(false);
  };

  const copyShareLink = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createScenario = () => {
    if (!newScenario.name.trim()) {
      toast.error("Please enter a scenario name");
      return;
    }

    const scenario: ScenarioParameters = {
      ...newScenario,
      id: generateId(),
    };

    setScenarios(prev => [...prev, scenario]);
    setShowCreateDialog(false);
    setNewScenario(defaultScenario);
    toast.success("Scenario created");
  };

  const updateScenario = () => {
    if (!editingScenario) return;
    
    setScenarios(prev => prev.map(s => 
      s.id === editingScenario.id ? editingScenario : s
    ));
    setEditingScenario(null);
    toast.success("Scenario updated");
  };

  const deleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
    setResults(prev => prev.filter(r => r.scenarioId !== id));
    toast.success("Scenario deleted");
  };

  const duplicateScenario = (scenario: ScenarioParameters) => {
    const newScen: ScenarioParameters = {
      ...scenario,
      id: generateId(),
      name: `${scenario.name} (Copy)`,
    };
    setScenarios(prev => [...prev, newScen]);
    toast.success("Scenario duplicated");
  };

  const applyPreset = (preset: typeof presetScenarios[0]) => {
    setNewScenario(prev => ({
      ...prev,
      name: preset.name,
      ...preset.params,
    }));
  };

  const runScenarios = async () => {
    if (scenarios.length === 0) {
      toast.error("Please create at least one scenario");
      return;
    }

    setIsRunning(true);
    
    // Simulate scenario calculations
    await new Promise(resolve => setTimeout(resolve, 500));

    const newResults: ScenarioResult[] = scenarios.map(scenario => {
      const projections = [];
      let headcount = currentHeadcount;
      let totalHires = 0;
      let totalAttrition = 0;

      const monthlyGrowthRate = scenario.growthRate / 100 / 12;
      const monthlyAttritionRate = scenario.attritionRate / 100 / 12;
      const maxHiresPerMonth = Math.ceil(scenario.budgetConstraint / 3);

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const currentMonth = new Date().getMonth();

      for (let i = 0; i < scenario.timeHorizon; i++) {
        const monthIndex = (currentMonth + i + 1) % 12;
        const monthName = months[monthIndex];
        
        // Calculate attrition
        let attrition = Math.round(headcount * monthlyAttritionRate);
        
        // Seasonal adjustment for attrition (higher in Q1 and after summer)
        if (scenario.seasonalAdjustment) {
          if (monthIndex >= 0 && monthIndex <= 2) attrition = Math.round(attrition * 1.3);
          if (monthIndex === 8 || monthIndex === 9) attrition = Math.round(attrition * 1.2);
        }

        // Calculate target hires
        let targetHires = Math.round(headcount * monthlyGrowthRate) + attrition;
        
        // Aggressive hiring adjustment
        if (scenario.aggressiveHiring) {
          targetHires = Math.round(targetHires * 1.3);
        }

        // Apply budget constraint
        const hires = Math.min(targetHires, maxHiresPerMonth);
        
        headcount = headcount - attrition + hires;
        totalHires += hires;
        totalAttrition += attrition;

        projections.push({
          month: `${monthName} ${i < 12 ? "" : "+"}`,
          headcount,
          hires,
          attrition,
          netChange: hires - attrition,
        });
      }

      // Calculate feasibility based on budget utilization and growth achievement
      const targetHeadcount = currentHeadcount * (1 + scenario.growthRate / 100);
      const achievedGrowth = (headcount - currentHeadcount) / currentHeadcount * 100;
      const budgetUtilization = (totalHires / (scenario.budgetConstraint * (scenario.timeHorizon / 3))) * 100;

      let feasibility: "high" | "medium" | "low" = "high";
      if (budgetUtilization > 100 || achievedGrowth < scenario.growthRate * 0.5) {
        feasibility = "low";
      } else if (budgetUtilization > 80 || achievedGrowth < scenario.growthRate * 0.8) {
        feasibility = "medium";
      }

      return {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        projections,
        totalHires,
        totalAttrition,
        finalHeadcount: headcount,
        budgetUtilization: Math.min(budgetUtilization, 100),
        feasibility,
      };
    });

    setResults(newResults);
    setIsRunning(false);
    toast.success("Scenarios calculated");
  };

  // Prepare comparison chart data
  const comparisonData = results.length > 0 ? 
    results[0].projections.map((_, i) => {
      const point: Record<string, any> = { month: results[0].projections[i].month };
      results.forEach(r => {
        point[r.scenarioName] = r.projections[i].headcount;
      });
      return point;
    }) : [];

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case "high": return "text-success";
      case "medium": return "text-warning";
      default: return "text-destructive";
    }
  };

  const getFeasibilityBadge = (feasibility: string) => {
    switch (feasibility) {
      case "high": return "default";
      case "medium": return "secondary";
      default: return "destructive";
    }
  };

  const scenarioColors = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
    "hsl(var(--accent))",
  ];

  const exportToCSV = () => {
    if (results.length === 0) {
      toast.error("No results to export. Run scenarios first.");
      return;
    }

    // Build CSV content
    const lines: string[] = [];
    
    // Summary section
    lines.push("SCENARIO PLANNING REPORT");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Current Headcount: ${currentHeadcount}`);
    lines.push("");
    
    // Summary table
    lines.push("SCENARIO SUMMARY");
    lines.push("Scenario,Final Headcount,Total Hires,Total Attrition,Net Change,Growth %,Feasibility");
    results.forEach(r => {
      const netChange = r.totalHires - r.totalAttrition;
      const growthPercent = ((r.finalHeadcount - currentHeadcount) / currentHeadcount * 100).toFixed(1);
      lines.push(`"${r.scenarioName}",${r.finalHeadcount},${r.totalHires},${r.totalAttrition},${netChange},${growthPercent}%,${r.feasibility}`);
    });
    lines.push("");

    // Scenario parameters
    lines.push("SCENARIO PARAMETERS");
    lines.push("Scenario,Growth Rate,Attrition Rate,Budget/Quarter,Time Horizon,Seasonal Adj,Aggressive");
    scenarios.forEach(s => {
      lines.push(`"${s.name}",${s.growthRate}%,${s.attritionRate}%,${s.budgetConstraint},${s.timeHorizon} months,${s.seasonalAdjustment},${s.aggressiveHiring}`);
    });
    lines.push("");

    // Detailed projections for each scenario
    results.forEach(r => {
      lines.push(`PROJECTIONS: ${r.scenarioName}`);
      lines.push("Month,Headcount,Hires,Attrition,Net Change");
      r.projections.forEach(p => {
        lines.push(`${p.month},${p.headcount},${p.hires},${p.attrition},${p.netChange}`);
      });
      lines.push("");
    });

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scenario-planning-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const exportToPDF = () => {
    if (results.length === 0) {
      toast.error("No results to export. Run scenarios first.");
      return;
    }

    // Create printable HTML content
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to export PDF");
      return;
    }

    const summaryRows = results.map(r => {
      const netChange = r.totalHires - r.totalAttrition;
      const growthPercent = ((r.finalHeadcount - currentHeadcount) / currentHeadcount * 100).toFixed(1);
      return `
        <tr>
          <td>${r.scenarioName}</td>
          <td>${r.finalHeadcount}</td>
          <td style="color: green;">+${r.totalHires}</td>
          <td style="color: red;">-${r.totalAttrition}</td>
          <td style="color: ${netChange >= 0 ? 'green' : 'red'};">${netChange >= 0 ? '+' : ''}${netChange}</td>
          <td>${growthPercent}%</td>
          <td><span style="padding: 2px 8px; border-radius: 4px; background: ${r.feasibility === 'high' ? '#22c55e' : r.feasibility === 'medium' ? '#eab308' : '#ef4444'}; color: white;">${r.feasibility}</span></td>
        </tr>
      `;
    }).join("");

    const paramRows = scenarios.map(s => `
      <tr>
        <td>${s.name}</td>
        <td>${s.growthRate}%</td>
        <td>${s.attritionRate}%</td>
        <td>${s.budgetConstraint}</td>
        <td>${s.timeHorizon} mo</td>
        <td>${s.seasonalAdjustment ? "Yes" : "No"}</td>
        <td>${s.aggressiveHiring ? "Yes" : "No"}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Scenario Planning Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: 600; }
          .meta { color: #6b7280; margin-bottom: 20px; }
          .print-btn { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
          .print-btn:hover { background: #2563eb; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <h1>Scenario Planning Report</h1>
        <p class="meta">Generated: ${new Date().toLocaleString()} | Current Headcount: ${currentHeadcount}</p>
        
        <h2>Scenario Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Final HC</th>
              <th>Hires</th>
              <th>Attrition</th>
              <th>Net Change</th>
              <th>Growth %</th>
              <th>Feasibility</th>
            </tr>
          </thead>
          <tbody>${summaryRows}</tbody>
        </table>

        <h2>Scenario Parameters</h2>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Growth</th>
              <th>Attrition</th>
              <th>Budget/Qtr</th>
              <th>Horizon</th>
              <th>Seasonal</th>
              <th>Aggressive</th>
            </tr>
          </thead>
          <tbody>${paramRows}</tbody>
        </table>

        ${results.map(r => `
          <h2>Projections: ${r.scenarioName}</h2>
          <table>
            <thead>
              <tr><th>Month</th><th>Headcount</th><th>Hires</th><th>Attrition</th><th>Net Change</th></tr>
            </thead>
            <tbody>
              ${r.projections.map(p => `
                <tr>
                  <td>${p.month}</td>
                  <td>${p.headcount}</td>
                  <td style="color: green;">+${p.hires}</td>
                  <td style="color: red;">-${p.attrition}</td>
                  <td style="color: ${p.netChange >= 0 ? 'green' : 'red'};">${p.netChange >= 0 ? '+' : ''}${p.netChange}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `).join("")}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success("PDF report opened in new tab");
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Scenario Planning
          </CardTitle>
          <CardDescription>
            Model different growth strategies with customizable parameters to forecast headcount needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Current Headcount: <span className="font-semibold text-foreground">{currentHeadcount}</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Scenario
            </Button>
            {scenarios.length > 0 && (
              <Button onClick={runScenarios} disabled={isRunning} variant="secondary">
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? "Running..." : "Run All Scenarios"}
              </Button>
            )}
            {results.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {scenarios.length > 0 && user && (
              <>
                <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={generateShareLink} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Share2 className="h-4 w-4 mr-2" />}
                  Share
                </Button>
              </>
            )}
            {user && (
              <Button variant="ghost" onClick={() => { fetchSavedSets(); setShowLoadDialog(true); }}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Load
              </Button>
            )}
            {shareUrl && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm">
                <Link className="h-3 w-3 text-muted-foreground" />
                <span className="max-w-[150px] truncate text-muted-foreground">{shareUrl}</span>
                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={copyShareLink}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scenarios List */}
      {scenarios.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map(scenario => {
            const result = results.find(r => r.scenarioId === scenario.id);
            
            return (
              <Card key={scenario.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{scenario.name}</CardTitle>
                      {scenario.description && (
                        <CardDescription className="text-xs mt-1">{scenario.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => duplicateScenario(scenario)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingScenario(scenario)}
                      >
                        <Settings2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => deleteScenario(scenario.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-muted-foreground">Growth:</span>
                      <span className="font-medium">{scenario.growthRate}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="h-3 w-3 text-destructive" />
                      <span className="text-muted-foreground">Attrition:</span>
                      <span className="font-medium">{scenario.attritionRate}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3 text-primary" />
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">{scenario.budgetConstraint}/qtr</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Horizon:</span>
                      <span className="font-medium">{scenario.timeHorizon}mo</span>
                    </div>
                  </div>

                  {result && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Final Headcount</span>
                          <span className="font-semibold">{result.finalHeadcount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Net Change</span>
                          <span className={`font-semibold flex items-center gap-1 ${result.totalHires - result.totalAttrition >= 0 ? "text-success" : "text-destructive"}`}>
                            {result.totalHires - result.totalAttrition >= 0 ? "+" : ""}
                            {result.totalHires - result.totalAttrition}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Feasibility</span>
                          <Badge variant={getFeasibilityBadge(result.feasibility) as any}>
                            {result.feasibility.charAt(0).toUpperCase() + result.feasibility.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results Visualization */}
      {results.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Headcount Projections Comparison
              </CardTitle>
              <CardDescription>Compare how headcount evolves under different scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    {results.map((r, i) => (
                      <Line
                        key={r.scenarioId}
                        type="monotone"
                        dataKey={r.scenarioName}
                        stroke={scenarioColors[i % scenarioColors.length]}
                        strokeWidth={2}
                        dot={{ fill: scenarioColors[i % scenarioColors.length], r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scenario Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Scenario</th>
                      <th className="text-right py-2 font-medium">Final HC</th>
                      <th className="text-right py-2 font-medium">Total Hires</th>
                      <th className="text-right py-2 font-medium">Attrition</th>
                      <th className="text-right py-2 font-medium">Net Change</th>
                      <th className="text-right py-2 font-medium">Growth %</th>
                      <th className="text-center py-2 font-medium">Feasibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => {
                      const netChange = r.totalHires - r.totalAttrition;
                      const growthPercent = ((r.finalHeadcount - currentHeadcount) / currentHeadcount * 100).toFixed(1);
                      
                      return (
                        <tr key={r.scenarioId} className="border-b">
                          <td className="py-2 font-medium">{r.scenarioName}</td>
                          <td className="py-2 text-right">{r.finalHeadcount}</td>
                          <td className="py-2 text-right text-success">+{r.totalHires}</td>
                          <td className="py-2 text-right text-destructive">-{r.totalAttrition}</td>
                          <td className={`py-2 text-right font-medium ${netChange >= 0 ? "text-success" : "text-destructive"}`}>
                            {netChange >= 0 ? "+" : ""}{netChange}
                          </td>
                          <td className={`py-2 text-right ${parseFloat(growthPercent) >= 0 ? "text-success" : "text-destructive"}`}>
                            {growthPercent}%
                          </td>
                          <td className="py-2 text-center">
                            <Badge variant={getFeasibilityBadge(r.feasibility) as any} className="text-xs">
                              {r.feasibility}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {scenarios.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No scenarios created</h3>
            <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
              Create scenarios to model different growth strategies and compare their impact on headcount
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Scenario
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingScenario} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingScenario(null);
          setNewScenario(defaultScenario);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingScenario ? "Edit Scenario" : "Create Scenario"}</DialogTitle>
            <DialogDescription>
              Configure growth parameters to model workforce planning scenarios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Presets */}
            {!editingScenario && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {presetScenarios.map(preset => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Name & Description */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Scenario Name *</Label>
                <Input
                  id="name"
                  value={editingScenario?.name ?? newScenario.name}
                  onChange={(e) => editingScenario 
                    ? setEditingScenario({ ...editingScenario, name: e.target.value })
                    : setNewScenario({ ...newScenario, name: e.target.value })
                  }
                  placeholder="e.g., Q1 Expansion Plan"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={editingScenario?.description ?? newScenario.description}
                  onChange={(e) => editingScenario
                    ? setEditingScenario({ ...editingScenario, description: e.target.value })
                    : setNewScenario({ ...newScenario, description: e.target.value })
                  }
                  placeholder="Brief description of this scenario"
                />
              </div>
            </div>

            <Separator />

            {/* Growth Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Annual Growth Target
                </Label>
                <span className="text-sm font-medium">
                  {editingScenario?.growthRate ?? newScenario.growthRate}%
                </span>
              </div>
              <Slider
                value={[editingScenario?.growthRate ?? newScenario.growthRate]}
                onValueChange={([v]) => editingScenario
                  ? setEditingScenario({ ...editingScenario, growthRate: v })
                  : setNewScenario({ ...newScenario, growthRate: v })
                }
                min={-20}
                max={50}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Target percentage growth in headcount over the year</p>
            </div>

            {/* Attrition Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  Expected Attrition Rate
                </Label>
                <span className="text-sm font-medium">
                  {editingScenario?.attritionRate ?? newScenario.attritionRate}%
                </span>
              </div>
              <Slider
                value={[editingScenario?.attritionRate ?? newScenario.attritionRate]}
                onValueChange={([v]) => editingScenario
                  ? setEditingScenario({ ...editingScenario, attritionRate: v })
                  : setNewScenario({ ...newScenario, attritionRate: v })
                }
                min={0}
                max={30}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Annual voluntary and involuntary turnover rate</p>
            </div>

            {/* Budget Constraint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Hiring Budget (per quarter)
                </Label>
                <span className="text-sm font-medium">
                  {editingScenario?.budgetConstraint ?? newScenario.budgetConstraint} hires
                </span>
              </div>
              <Slider
                value={[editingScenario?.budgetConstraint ?? newScenario.budgetConstraint]}
                onValueChange={([v]) => editingScenario
                  ? setEditingScenario({ ...editingScenario, budgetConstraint: v })
                  : setNewScenario({ ...newScenario, budgetConstraint: v })
                }
                min={0}
                max={50}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Maximum number of new hires allowed per quarter</p>
            </div>

            {/* Time Horizon */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Forecast Horizon
                </Label>
                <span className="text-sm font-medium">
                  {editingScenario?.timeHorizon ?? newScenario.timeHorizon} months
                </span>
              </div>
              <Slider
                value={[editingScenario?.timeHorizon ?? newScenario.timeHorizon]}
                onValueChange={([v]) => editingScenario
                  ? setEditingScenario({ ...editingScenario, timeHorizon: v })
                  : setNewScenario({ ...newScenario, timeHorizon: v })
                }
                min={3}
                max={24}
                step={3}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingScenario?.seasonalAdjustment ?? newScenario.seasonalAdjustment}
                  onChange={(e) => editingScenario
                    ? setEditingScenario({ ...editingScenario, seasonalAdjustment: e.target.checked })
                    : setNewScenario({ ...newScenario, seasonalAdjustment: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm">Seasonal adjustments</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingScenario?.aggressiveHiring ?? newScenario.aggressiveHiring}
                  onChange={(e) => editingScenario
                    ? setEditingScenario({ ...editingScenario, aggressiveHiring: e.target.checked })
                    : setNewScenario({ ...newScenario, aggressiveHiring: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm">Aggressive hiring</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingScenario(null);
              setNewScenario(defaultScenario);
            }}>
              Cancel
            </Button>
            <Button onClick={editingScenario ? updateScenario : createScenario}>
              {editingScenario ? "Update" : "Create"} Scenario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Scenarios</DialogTitle>
            <DialogDescription>
              Save your current scenario set for future reference
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="save-name">Name *</Label>
              <Input
                id="save-name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Q1 2025 Planning"
              />
            </div>
            <div>
              <Label htmlFor="save-desc">Description (optional)</Label>
              <Input
                id="save-desc"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {scenarios.length} scenario(s) will be saved
              {results.length > 0 && " with their results"}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={saveScenarioSet} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Load Saved Scenarios</DialogTitle>
            <DialogDescription>
              Select a previously saved scenario set to load
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : savedSets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No saved scenarios yet
              </div>
            ) : (
              <div className="space-y-2">
                {savedSets.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => loadScenarioSet(set)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{set.name}</div>
                      {set.description && (
                        <div className="text-xs text-muted-foreground">{set.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {set.parameters.length} scenarios • {new Date(set.created_at).toLocaleDateString()}
                        {set.is_shared && (
                          <Badge variant="outline" className="ml-2 text-xs">Shared</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScenarioSet(set.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
