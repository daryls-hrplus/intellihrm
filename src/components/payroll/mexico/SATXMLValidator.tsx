import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Upload, 
  FileCheck, 
  RefreshCw,
  FileText,
  Download
} from "lucide-react";
import { toast } from "sonner";

interface ValidationResult {
  id: string;
  fileName: string;
  status: "valid" | "invalid" | "warning";
  errors: ValidationError[];
  warnings: ValidationWarning[];
  validatedAt: string;
  cfdiVersion: string;
  tipoNomina: string;
}

interface ValidationError {
  code: string;
  field: string;
  message: string;
  severity: "error" | "critical";
}

interface ValidationWarning {
  code: string;
  field: string;
  message: string;
}

const mockValidationResults: ValidationResult[] = [
  {
    id: "1",
    fileName: "NOMINA_2024_001.xml",
    status: "valid",
    errors: [],
    warnings: [],
    validatedAt: "2024-01-15T10:30:00",
    cfdiVersion: "4.0",
    tipoNomina: "O"
  },
  {
    id: "2",
    fileName: "NOMINA_2024_002.xml",
    status: "warning",
    errors: [],
    warnings: [
      { code: "W001", field: "NumEmpleado", message: "Employee number format differs from recommended pattern" }
    ],
    validatedAt: "2024-01-15T10:35:00",
    cfdiVersion: "4.0",
    tipoNomina: "O"
  },
  {
    id: "3",
    fileName: "NOMINA_2024_003.xml",
    status: "invalid",
    errors: [
      { code: "E001", field: "RFC", message: "Invalid RFC format for receptor", severity: "critical" },
      { code: "E002", field: "NumDiasPagados", message: "Days paid exceeds period range", severity: "error" }
    ],
    warnings: [],
    validatedAt: "2024-01-15T10:40:00",
    cfdiVersion: "4.0",
    tipoNomina: "O"
  }
];

const satCatalogs = [
  { name: "c_TipoNomina", version: "1.0", lastUpdate: "2024-01-01", records: 2 },
  { name: "c_PeriodicidadPago", version: "1.0", lastUpdate: "2024-01-01", records: 10 },
  { name: "c_TipoContrato", version: "1.0", lastUpdate: "2024-01-01", records: 10 },
  { name: "c_TipoRegimen", version: "1.0", lastUpdate: "2024-01-01", records: 14 },
  { name: "c_TipoDeduccion", version: "1.0", lastUpdate: "2024-01-01", records: 107 },
  { name: "c_TipoPercepcion", version: "1.0", lastUpdate: "2024-01-01", records: 87 },
  { name: "c_TipoOtroPago", version: "1.0", lastUpdate: "2024-01-01", records: 9 },
  { name: "c_TipoIncapacidad", version: "1.0", lastUpdate: "2024-01-01", records: 4 },
  { name: "c_TipoHoras", version: "1.0", lastUpdate: "2024-01-01", records: 3 },
  { name: "c_RiesgosPuesto", version: "1.0", lastUpdate: "2024-01-01", records: 5 }
];

export function SATXMLValidator() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [results, setResults] = useState<ValidationResult[]>(mockValidationResults);
  const [selectedResult, setSelectedResult] = useState<ValidationResult | null>(null);

  const handleFileUpload = () => {
    setIsValidating(true);
    setValidationProgress(0);
    
    const interval = setInterval(() => {
      setValidationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsValidating(false);
          toast.success("Validation complete");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSyncCatalogs = () => {
    toast.success("SAT catalogs synchronized successfully");
  };

  const getStatusBadge = (status: ValidationResult["status"]) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Valid</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" /> Warning</Badge>;
      case "invalid":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Invalid</Badge>;
    }
  };

  const validCount = results.filter(r => r.status === "valid").length;
  const warningCount = results.filter(r => r.status === "warning").length;
  const invalidCount = results.filter(r => r.status === "invalid").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SAT XML Validator</h2>
          <p className="text-muted-foreground">
            Validate CFDI payroll XMLs against SAT schemas and catalogs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSyncCatalogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Catalogs
          </Button>
          <Button onClick={handleFileUpload} disabled={isValidating}>
            <Upload className="h-4 w-4 mr-2" />
            Upload XMLs
          </Button>
        </div>
      </div>

      {isValidating && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Validating files...</span>
                <span>{validationProgress}%</span>
              </div>
              <Progress value={validationProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{results.length}</p>
                <p className="text-sm text-muted-foreground">Total Files</p>
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
                <p className="text-2xl font-bold">{validCount}</p>
                <p className="text-sm text-muted-foreground">Valid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warningCount}</p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{invalidCount}</p>
                <p className="text-sm text-muted-foreground">Invalid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="results">
        <TabsList>
          <TabsTrigger value="results">Validation Results</TabsTrigger>
          <TabsTrigger value="catalogs">SAT Catalogs</TabsTrigger>
          <TabsTrigger value="schemas">XSD Schemas</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Validated Files</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedResult?.id === result.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedResult(result)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{result.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                CFDI {result.cfdiVersion} • Tipo {result.tipoNomina}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(result.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validation Details</CardTitle>
                <CardDescription>
                  {selectedResult ? selectedResult.fileName : "Select a file to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(selectedResult.status)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(selectedResult.validatedAt).toLocaleString()}
                      </span>
                    </div>

                    {selectedResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-destructive">Errors ({selectedResult.errors.length})</h4>
                        {selectedResult.errors.map((error, idx) => (
                          <div key={idx} className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">{error.code}: {error.field}</p>
                                <p className="text-sm text-muted-foreground">{error.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedResult.warnings.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-yellow-600">Warnings ({selectedResult.warnings.length})</h4>
                        {selectedResult.warnings.map((warning, idx) => (
                          <div key={idx} className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">{warning.code}: {warning.field}</p>
                                <p className="text-sm text-muted-foreground">{warning.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedResult.status === "valid" && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="font-medium text-green-700">All validations passed</p>
                        <p className="text-sm text-muted-foreground">Ready for SAT submission</p>
                      </div>
                    )}

                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Validation Report
                    </Button>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Select a file to view validation details
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="catalogs">
          <Card>
            <CardHeader>
              <CardTitle>SAT Catalog Versions</CardTitle>
              <CardDescription>
                Current versions of SAT catalogs used for validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {satCatalogs.map((catalog) => (
                  <div key={catalog.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium">{catalog.name}</span>
                      <Badge variant="outline">v{catalog.version}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{catalog.records} records</p>
                      <p>Updated: {catalog.lastUpdate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemas">
          <Card>
            <CardHeader>
              <CardTitle>XSD Schema Versions</CardTitle>
              <CardDescription>
                XML schemas for CFDI validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">CFDI 4.0</p>
                      <p className="text-sm text-muted-foreground">cfdv40.xsd</p>
                    </div>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Complemento Nómina 1.2</p>
                      <p className="text-sm text-muted-foreground">nomina12.xsd</p>
                    </div>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">TimbreFiscalDigital 1.1</p>
                      <p className="text-sm text-muted-foreground">TimbreFiscalDigitalv11.xsd</p>
                    </div>
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
