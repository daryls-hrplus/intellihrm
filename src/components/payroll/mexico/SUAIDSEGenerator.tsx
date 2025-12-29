import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileText, 
  Download, 
  Upload, 
  Users, 
  Building2, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GeneratedFile {
  fileName: string;
  fileContent: string;
  recordCount: number;
  generatedAt: Date;
  fileType: string;
}

export function SUAIDSEGenerator() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear());
  const [periodMonth, setPeriodMonth] = useState<number>(new Date().getMonth() + 1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  
  // IDSE specific state
  const [movementType, setMovementType] = useState<string>("alta");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const generateSUAFile = async (fileType: 'afiliacion' | 'movimientos' | 'determinacion') => {
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('mx-generate-sua', {
        body: {
          companyId: selectedCompany,
          periodYear,
          periodMonth,
          fileType
        }
      });

      if (error) throw error;

      if (data.success) {
        const newFile: GeneratedFile = {
          fileName: data.fileName,
          fileContent: data.fileContent,
          recordCount: data.recordCount,
          generatedAt: new Date(),
          fileType: `SUA ${fileType}`
        };
        setGeneratedFiles(prev => [newFile, ...prev]);
        toast.success(`SUA ${fileType} file generated with ${data.recordCount} records`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('SUA generation error:', error);
      toast.error(`Failed to generate SUA file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateIDSEFile = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('mx-generate-idse', {
        body: {
          companyId: selectedCompany,
          movementType,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        const newFile: GeneratedFile = {
          fileName: data.fileName,
          fileContent: data.fileContent,
          recordCount: data.recordCount,
          generatedAt: new Date(),
          fileType: `IDSE ${movementType}`
        };
        setGeneratedFiles(prev => [newFile, ...prev]);
        toast.success(`IDSE file generated with ${data.recordCount} movements`);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('IDSE generation error:', error);
      toast.error(`Failed to generate IDSE file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${file.fileName}`);
  };

  const months = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" }
  ];

  const movementTypes = [
    { value: "alta", label: "Alta (08)", description: "New employee registration" },
    { value: "baja", label: "Baja (02)", description: "Employee termination" },
    { value: "modificacion_salario", label: "Modificación Salario (07)", description: "Salary change" },
    { value: "reingreso", label: "Reingreso (08)", description: "Employee reinstatement" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SUA / IDSE File Generator</h2>
          <p className="text-muted-foreground">
            Generate IMSS social security files for Mexican compliance
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Building2 className="h-3 w-3" />
          Mexico
        </Badge>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          SUA (Sistema Único de Autodeterminación) files are used for IMSS contribution calculations.
          IDSE (IMSS Desde Su Empresa) files are used for employee movement notifications.
        </AlertDescription>
      </Alert>

      {/* Company and Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Company & Period</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="demo-company">Demo Company S.A. de C.V.</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Select value={String(periodYear)} onValueChange={v => setPeriodYear(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2023, 2024, 2025].map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Month</Label>
            <Select value={String(periodMonth)} onValueChange={v => setPeriodMonth(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sua" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sua" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            SUA Files
          </TabsTrigger>
          <TabsTrigger value="idse" className="gap-2">
            <Upload className="h-4 w-4" />
            IDSE Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sua" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Afiliación
                </CardTitle>
                <CardDescription>
                  Employee registration data for IMSS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => generateSUAFile('afiliacion')}
                  disabled={isGenerating || !selectedCompany}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Movimientos
                </CardTitle>
                <CardDescription>
                  Employee movements (altas, bajas, changes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => generateSUAFile('movimientos')}
                  disabled={isGenerating || !selectedCompany}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Determinación
                </CardTitle>
                <CardDescription>
                  IMSS contribution calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => generateSUAFile('determinacion')}
                  disabled={isGenerating || !selectedCompany}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="idse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">IDSE Movement File</CardTitle>
              <CardDescription>
                Generate employee movement notifications for IMSS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Movement Type</Label>
                  <Select value={movementType} onValueChange={setMovementType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {movementTypes.map(mt => (
                        <SelectItem key={mt.value} value={mt.value}>
                          {mt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {movementTypes.find(mt => mt.value === movementType)?.description}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Start Date (Optional)</Label>
                  <Input 
                    type="date" 
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input 
                    type="date" 
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={generateIDSEFile}
                disabled={isGenerating || !selectedCompany}
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Generate IDSE File
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Files List */}
      {generatedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Generated Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.fileType} • {file.recordCount} records • {file.generatedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadFile(file)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
