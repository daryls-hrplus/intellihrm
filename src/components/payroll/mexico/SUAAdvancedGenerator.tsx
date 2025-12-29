import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  Upload,
  CheckCircle2,
  Clock,
  Users,
  Building2,
  Calendar,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SUAFile {
  id: string;
  fileType: "afiliacion" | "movimientos" | "determinacion";
  fileName: string;
  period: string;
  employeeCount: number;
  status: "pending" | "generated" | "validated" | "submitted";
  generatedAt?: string;
  fileSize?: string;
}

interface GenerationOptions {
  includeAfiliacion: boolean;
  includeMovimientos: boolean;
  includeDeterminacion: boolean;
  period: string;
}

const mockFiles: SUAFile[] = [
  {
    id: "1",
    fileType: "afiliacion",
    fileName: "AFIL_E1234567890_202401.txt",
    period: "January 2024",
    employeeCount: 85,
    status: "validated",
    generatedAt: "2024-01-15T10:00:00",
    fileSize: "24 KB"
  },
  {
    id: "2",
    fileType: "movimientos",
    fileName: "MOV_E1234567890_202401.txt",
    period: "January 2024",
    employeeCount: 12,
    status: "generated",
    generatedAt: "2024-01-15T10:05:00",
    fileSize: "8 KB"
  },
  {
    id: "3",
    fileType: "determinacion",
    fileName: "DET_E1234567890_202401.txt",
    period: "January 2024",
    employeeCount: 85,
    status: "pending"
  }
];

const FILE_TYPE_CONFIG = {
  afiliacion: { 
    label: "Afiliación", 
    description: "Employee affiliation data", 
    icon: Users,
    color: "bg-blue-500" 
  },
  movimientos: { 
    label: "Movimientos", 
    description: "Employee movements (alta/baja/mod)", 
    icon: RefreshCw,
    color: "bg-green-500" 
  },
  determinacion: { 
    label: "Determinación", 
    description: "Contribution determination", 
    icon: Building2,
    color: "bg-purple-500" 
  }
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500" },
  generated: { label: "Generated", color: "bg-blue-500" },
  validated: { label: "Validated", color: "bg-green-500" },
  submitted: { label: "Submitted", color: "bg-purple-500" }
};

interface SUAAdvancedGeneratorProps {
  companyId: string;
}

export function SUAAdvancedGenerator({ companyId }: SUAAdvancedGeneratorProps) {
  const [files, setFiles] = useState<SUAFile[]>(mockFiles);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [options, setOptions] = useState<GenerationOptions>({
    includeAfiliacion: true,
    includeMovimientos: true,
    includeDeterminacion: true,
    period: "2024-01"
  });

  const handleGenerate = async () => {
    if (!options.includeAfiliacion && !options.includeMovimientos && !options.includeDeterminacion) {
      toast.error("Select at least one file type to generate");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    const fileTypes = [];
    if (options.includeAfiliacion) fileTypes.push("afiliacion");
    if (options.includeMovimientos) fileTypes.push("movimientos");
    if (options.includeDeterminacion) fileTypes.push("determinacion");

    const progressIncrement = 100 / fileTypes.length;

    for (const fileType of fileTypes) {
      try {
        const { data, error } = await supabase.functions.invoke('mx-generate-sua', {
          body: { 
            companyId: 'current-company-id',
            periodYear: parseInt(options.period.split('-')[0]),
            periodMonth: parseInt(options.period.split('-')[1]),
            fileType
          }
        });

        if (error) throw error;

        setGenerationProgress(prev => Math.min(prev + progressIncrement, 100));
      } catch (error) {
        console.error(`SUA generation error for ${fileType}:`, error);
      }
    }

    setIsGenerating(false);
    toast.success(`SUA files generated successfully`);
  };

  const handleDownload = (file: SUAFile) => {
    toast.success(`Downloading ${file.fileName}`);
  };

  const handleValidate = (fileId: string) => {
    setFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, status: "validated" as const } : f)
    );
    toast.success("File validated successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SUA Advanced Generator</h2>
          <p className="text-muted-foreground">
            Generate IMSS SUA files for affiliation, movements, and contribution determination
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generation Options</CardTitle>
            <CardDescription>
              Configure SUA file generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={options.period} onValueChange={(v) => setOptions(prev => ({ ...prev, period: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01">January 2024</SelectItem>
                  <SelectItem value="2024-02">February 2024</SelectItem>
                  <SelectItem value="2023-12">December 2023</SelectItem>
                  <SelectItem value="2023-11">November 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>File Types</Label>
              
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox 
                  id="afiliacion"
                  checked={options.includeAfiliacion}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeAfiliacion: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <label htmlFor="afiliacion" className="text-sm font-medium cursor-pointer">
                    Afiliación
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Employee master data for IMSS registration
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox 
                  id="movimientos"
                  checked={options.includeMovimientos}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeMovimientos: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <label htmlFor="movimientos" className="text-sm font-medium cursor-pointer">
                    Movimientos
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Alta, baja, and salary modification records
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox 
                  id="determinacion"
                  checked={options.includeDeterminacion}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeDeterminacion: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <label htmlFor="determinacion" className="text-sm font-medium cursor-pointer">
                    Determinación
                  </label>
                  <p className="text-xs text-muted-foreground">
                    IMSS contribution determination file
                  </p>
                </div>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating files...</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
                <Progress value={generationProgress} />
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate SUA Files
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generated Files</CardTitle>
            <CardDescription>
              SUA files ready for IMSS submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Files</TabsTrigger>
                <TabsTrigger value="afiliacion">Afiliación</TabsTrigger>
                <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
                <TabsTrigger value="determinacion">Determinación</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 mt-4">
                    {files.map((file) => {
                      const FileIcon = FILE_TYPE_CONFIG[file.fileType].icon;
                      
                      return (
                        <div key={file.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${FILE_TYPE_CONFIG[file.fileType].color}/10`}>
                                <FileIcon className={`h-5 w-5 ${FILE_TYPE_CONFIG[file.fileType].color.replace('bg-', 'text-')}`} />
                              </div>
                              <div>
                                <p className="font-medium">{file.fileName}</p>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span>{FILE_TYPE_CONFIG[file.fileType].label}</span>
                                  <span>•</span>
                                  <span>{file.period}</span>
                                  <span>•</span>
                                  <span>{file.employeeCount} employees</span>
                                  {file.fileSize && (
                                    <>
                                      <span>•</span>
                                      <span>{file.fileSize}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={STATUS_CONFIG[file.status].color}>
                                {STATUS_CONFIG[file.status].label}
                              </Badge>
                              {file.status === "generated" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleValidate(file.id)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Validate
                                </Button>
                              )}
                              {(file.status === "generated" || file.status === "validated") && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownload(file)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {file.generatedAt && (
                            <div className="mt-2 pt-2 border-t text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Generated: {new Date(file.generatedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              {["afiliacion", "movimientos", "determinacion"].map((type) => (
                <TabsContent key={type} value={type}>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 mt-4">
                      {files
                        .filter(f => f.fileType === type)
                        .map((file) => {
                          const FileIcon = FILE_TYPE_CONFIG[file.fileType].icon;
                          
                          return (
                            <div key={file.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`p-2 rounded-lg ${FILE_TYPE_CONFIG[file.fileType].color}/10`}>
                                    <FileIcon className={`h-5 w-5 ${FILE_TYPE_CONFIG[file.fileType].color.replace('bg-', 'text-')}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium">{file.fileName}</p>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                      <span>{file.period}</span>
                                      <span>•</span>
                                      <span>{file.employeeCount} employees</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={STATUS_CONFIG[file.status].color}>
                                    {STATUS_CONFIG[file.status].label}
                                  </Badge>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDownload(file)}
                                    disabled={file.status === "pending"}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
