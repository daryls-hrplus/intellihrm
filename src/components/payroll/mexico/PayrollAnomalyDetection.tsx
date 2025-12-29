import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Brain, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  Shield,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface Anomaly {
  id: string;
  employeeName: string;
  employeeId: string;
  anomalyType: string;
  severity: "high" | "medium" | "low";
  description: string;
  currentValue: number;
  expectedValue: number;
  variance: number;
  detectedAt: string;
  status: "new" | "reviewed" | "resolved" | "false_positive";
  aiConfidence: number;
}

const mockAnomalies: Anomaly[] = [
  {
    id: "1",
    employeeName: "Juan García López",
    employeeId: "EMP001",
    anomalyType: "Overtime Spike",
    severity: "high",
    description: "Overtime hours 180% above 6-month average",
    currentValue: 45,
    expectedValue: 16,
    variance: 181.25,
    detectedAt: "2024-01-15T10:30:00",
    status: "new",
    aiConfidence: 94
  },
  {
    id: "2",
    employeeName: "María Rodríguez Pérez",
    employeeId: "EMP002",
    anomalyType: "Bonus Deviation",
    severity: "medium",
    description: "Performance bonus 45% higher than peer average",
    currentValue: 15000,
    expectedValue: 10350,
    variance: 44.93,
    detectedAt: "2024-01-14T15:45:00",
    status: "reviewed",
    aiConfidence: 78
  },
  {
    id: "3",
    employeeName: "Carlos Hernández Vega",
    employeeId: "EMP003",
    anomalyType: "Deduction Missing",
    severity: "high",
    description: "INFONAVIT deduction not applied despite active credit",
    currentValue: 0,
    expectedValue: 2500,
    variance: -100,
    detectedAt: "2024-01-15T08:00:00",
    status: "new",
    aiConfidence: 98
  },
  {
    id: "4",
    employeeName: "Ana López Torres",
    employeeId: "EMP004",
    anomalyType: "SDI Change",
    severity: "low",
    description: "SDI increased without salary modification record",
    currentValue: 520.50,
    expectedValue: 485.75,
    variance: 7.15,
    detectedAt: "2024-01-13T11:20:00",
    status: "false_positive",
    aiConfidence: 65
  },
  {
    id: "5",
    employeeName: "Roberto Díaz Mendoza",
    employeeId: "EMP005",
    anomalyType: "ISR Calculation",
    severity: "medium",
    description: "ISR withholding 12% below expected based on income",
    currentValue: 4200,
    expectedValue: 4788,
    variance: -12.28,
    detectedAt: "2024-01-15T09:15:00",
    status: "new",
    aiConfidence: 86
  }
];

const anomalyStats = {
  totalDetected: 23,
  highSeverity: 5,
  mediumSeverity: 12,
  lowSeverity: 6,
  resolved: 18,
  falsePositives: 3,
  avgConfidence: 84.5
};

const SEVERITY_CONFIG = {
  high: { color: "bg-red-500", textColor: "text-red-500", bgColor: "bg-red-500/10" },
  medium: { color: "bg-yellow-500", textColor: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  low: { color: "bg-blue-500", textColor: "text-blue-500", bgColor: "bg-blue-500/10" }
};

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-500" },
  reviewed: { label: "Reviewed", color: "bg-yellow-500" },
  resolved: { label: "Resolved", color: "bg-green-500" },
  false_positive: { label: "False Positive", color: "bg-gray-500" }
};

export function PayrollAnomalyDetection() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(mockAnomalies);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success("AI scan completed. 2 new anomalies detected.");
    }, 3000);
  };

  const handleUpdateStatus = (id: string, status: Anomaly["status"]) => {
    setAnomalies(prev => 
      prev.map(a => a.id === id ? { ...a, status } : a)
    );
    toast.success(`Anomaly marked as ${STATUS_CONFIG[status].label}`);
  };

  const newAnomalies = anomalies.filter(a => a.status === "new");
  const highSeverityNew = newAnomalies.filter(a => a.severity === "high");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll Anomaly Detection</h2>
          <p className="text-muted-foreground">
            AI-powered detection of payroll variances and outliers
          </p>
        </div>
        <Button onClick={handleRunScan} disabled={isScanning}>
          {isScanning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Run AI Scan
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={highSeverityNew.length > 0 ? "border-red-500" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highSeverityNew.length}</p>
                <p className="text-sm text-muted-foreground">High Severity (New)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{newAnomalies.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{anomalyStats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{anomalyStats.avgConfidence}%</p>
                <p className="text-sm text-muted-foreground">Avg AI Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detected Anomalies</CardTitle>
            <CardDescription>
              AI-detected payroll variances requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {anomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnomaly?.id === anomaly.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedAnomaly(anomaly)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${SEVERITY_CONFIG[anomaly.severity].bgColor}`}>
                          <AlertTriangle className={`h-5 w-5 ${SEVERITY_CONFIG[anomaly.severity].textColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{anomaly.employeeName}</p>
                            <Badge variant="outline">{anomaly.employeeId}</Badge>
                          </div>
                          <p className="text-sm font-medium text-muted-foreground mt-1">
                            {anomaly.anomalyType}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {anomaly.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={STATUS_CONFIG[anomaly.status].color}>
                          {STATUS_CONFIG[anomaly.status].label}
                        </Badge>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                          <Brain className="h-3 w-3" />
                          <span>{anomaly.aiConfidence}% confident</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                      <div className="flex gap-4">
                        <span>
                          Current: <strong>${anomaly.currentValue.toLocaleString()}</strong>
                        </span>
                        <span>
                          Expected: <strong>${anomaly.expectedValue.toLocaleString()}</strong>
                        </span>
                        <span className={anomaly.variance > 0 ? "text-red-500" : "text-green-500"}>
                          {anomaly.variance > 0 ? (
                            <TrendingUp className="h-4 w-4 inline mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 inline mr-1" />
                          )}
                          {anomaly.variance > 0 ? "+" : ""}{anomaly.variance.toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(anomaly.detectedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anomaly Details</CardTitle>
            <CardDescription>
              {selectedAnomaly ? selectedAnomaly.anomalyType : "Select an anomaly"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedAnomaly ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-medium">{selectedAnomaly.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAnomaly.employeeId}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">AI Analysis</p>
                  <p className="text-sm mt-2">{selectedAnomaly.description}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>AI Confidence</span>
                      <span>{selectedAnomaly.aiConfidence}%</span>
                    </div>
                    <Progress value={selectedAnomaly.aiConfidence} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="text-lg font-bold">${selectedAnomaly.currentValue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Expected</p>
                    <p className="text-lg font-bold">${selectedAnomaly.expectedValue.toLocaleString()}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-lg text-center ${SEVERITY_CONFIG[selectedAnomaly.severity].bgColor}`}>
                  <p className={`font-medium ${SEVERITY_CONFIG[selectedAnomaly.severity].textColor}`}>
                    {selectedAnomaly.severity.toUpperCase()} SEVERITY
                  </p>
                  <p className={`text-2xl font-bold ${SEVERITY_CONFIG[selectedAnomaly.severity].textColor}`}>
                    {selectedAnomaly.variance > 0 ? "+" : ""}{selectedAnomaly.variance.toFixed(1)}%
                  </p>
                </div>

                {selectedAnomaly.status === "new" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedAnomaly.id, "reviewed")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Mark Reviewed
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedAnomaly.id, "false_positive")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        False Positive
                      </Button>
                      <Button 
                        className="col-span-2"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedAnomaly.id, "resolved")}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Select an anomaly to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
