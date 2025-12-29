import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  UserPlus, 
  UserMinus, 
  DollarSign, 
  RefreshCw,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface IDSEMovement {
  id: string;
  employeeName: string;
  nss: string;
  curp: string;
  movementType: "alta" | "baja" | "modificacion_salario" | "reingreso";
  effectiveDate: string;
  previousSdi?: number;
  newSdi?: number;
  causaBaja?: string;
  status: "pending" | "generated" | "submitted" | "confirmed";
  generatedAt?: string;
}

const mockMovements: IDSEMovement[] = [
  {
    id: "1",
    employeeName: "Juan García López",
    nss: "12345678901",
    curp: "GALJ850101HDFRPN09",
    movementType: "alta",
    effectiveDate: "2024-01-15",
    newSdi: 456.78,
    status: "pending"
  },
  {
    id: "2",
    employeeName: "María Rodríguez Pérez",
    nss: "98765432101",
    curp: "ROPM900215MDFDRT03",
    movementType: "modificacion_salario",
    effectiveDate: "2024-01-01",
    previousSdi: 380.50,
    newSdi: 420.75,
    status: "generated",
    generatedAt: "2024-01-10T14:30:00"
  },
  {
    id: "3",
    employeeName: "Carlos Hernández Vega",
    nss: "55667788901",
    curp: "HEVC880512HDFRRR05",
    movementType: "baja",
    effectiveDate: "2024-01-20",
    causaBaja: "renuncia",
    status: "submitted"
  }
];

const MOVEMENT_LABELS = {
  alta: { label: "Alta", icon: UserPlus, color: "bg-green-500" },
  baja: { label: "Baja", icon: UserMinus, color: "bg-red-500" },
  modificacion_salario: { label: "Modificación Salario", icon: DollarSign, color: "bg-blue-500" },
  reingreso: { label: "Reingreso", icon: RefreshCw, color: "bg-purple-500" }
};

const STATUS_LABELS = {
  pending: { label: "Pendiente", color: "bg-yellow-500" },
  generated: { label: "Generado", color: "bg-blue-500" },
  submitted: { label: "Enviado", color: "bg-purple-500" },
  confirmed: { label: "Confirmado", color: "bg-green-500" }
};

export function IDSEAutomation() {
  const [movements, setMovements] = useState<IDSEMovement[]>(mockMovements);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleGenerateIDSE = async () => {
    if (selectedMovements.length === 0) {
      toast.error("Select at least one movement");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('mx-generate-idse', {
        body: { 
          movementIds: selectedMovements,
          companyId: 'current-company-id'
        }
      });

      if (error) throw error;

      setMovements(prev => 
        prev.map(m => 
          selectedMovements.includes(m.id) 
            ? { ...m, status: "generated" as const, generatedAt: new Date().toISOString() }
            : m
        )
      );
      
      toast.success(`IDSE file generated for ${selectedMovements.length} movements`);
      setSelectedMovements([]);
    } catch (error) {
      console.error('IDSE generation error:', error);
      toast.error("Failed to generate IDSE file");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAll = () => {
    const pendingIds = movements
      .filter(m => m.status === "pending")
      .map(m => m.id);
    setSelectedMovements(pendingIds);
  };

  const toggleMovementSelection = (id: string) => {
    setSelectedMovements(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const filteredMovements = movements.filter(m => {
    if (filterType !== "all" && m.movementType !== filterType) return false;
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = movements.filter(m => m.status === "pending").length;
  const generatedCount = movements.filter(m => m.status === "generated").length;
  const submittedCount = movements.filter(m => m.status === "submitted").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IDSE Automation</h2>
          <p className="text-muted-foreground">
            Automated IDSE file generation for IMSS movements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Response
          </Button>
          <Button 
            onClick={handleGenerateIDSE} 
            disabled={selectedMovements.length === 0 || isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            Generate IDSE File
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{generatedCount}</p>
                <p className="text-sm text-muted-foreground">Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Upload className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{submittedCount}</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
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
                <p className="text-2xl font-bold">{movements.filter(m => m.status === "confirmed").length}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movements">
        <TabsList>
          <TabsTrigger value="movements">Movements Queue</TabsTrigger>
          <TabsTrigger value="history">Generation History</TabsTrigger>
          <TabsTrigger value="settings">IDSE Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Movement Queue</CardTitle>
                  <CardDescription>
                    Employee movements pending IDSE submission
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Movement Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="modificacion_salario">Mod. Salario</SelectItem>
                      <SelectItem value="reingreso">Reingreso</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All Pending
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredMovements.map((movement) => {
                    const MovementIcon = MOVEMENT_LABELS[movement.movementType].icon;
                    const isSelected = selectedMovements.includes(movement.id);
                    
                    return (
                      <div
                        key={movement.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                        } ${movement.status !== "pending" ? "opacity-60" : ""}`}
                        onClick={() => movement.status === "pending" && toggleMovementSelection(movement.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${MOVEMENT_LABELS[movement.movementType].color}/10`}>
                              <MovementIcon className={`h-5 w-5 ${MOVEMENT_LABELS[movement.movementType].color.replace('bg-', 'text-')}`} />
                            </div>
                            <div>
                              <p className="font-medium">{movement.employeeName}</p>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>NSS: {movement.nss}</span>
                                <span>CURP: {movement.curp}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge className={MOVEMENT_LABELS[movement.movementType].color}>
                                {MOVEMENT_LABELS[movement.movementType].label}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {new Date(movement.effectiveDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={STATUS_LABELS[movement.status].color}>
                              {STATUS_LABELS[movement.status].label}
                            </Badge>
                          </div>
                        </div>
                        
                        {movement.movementType === "modificacion_salario" && (
                          <div className="mt-2 pt-2 border-t flex gap-4 text-sm">
                            <span>SDI Anterior: ${movement.previousSdi?.toFixed(2)}</span>
                            <span>→</span>
                            <span>SDI Nuevo: ${movement.newSdi?.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {movement.movementType === "alta" && (
                          <div className="mt-2 pt-2 border-t text-sm">
                            <span>SDI: ${movement.newSdi?.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {movement.movementType === "baja" && movement.causaBaja && (
                          <div className="mt-2 pt-2 border-t text-sm">
                            <span>Causa: {movement.causaBaja}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Generation History</CardTitle>
              <CardDescription>
                Previously generated IDSE files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IDSE_20240115_001.txt</p>
                      <p className="text-sm text-muted-foreground">3 movements • Generated Jan 15, 2024</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IDSE_20240110_001.txt</p>
                      <p className="text-sm text-muted-foreground">5 movements • Generated Jan 10, 2024</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>IDSE Configuration</CardTitle>
              <CardDescription>
                Settings for IDSE file generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-2">Registro Patronal</p>
                  <p className="text-lg font-mono">E1234567890</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-2">Delegación IMSS</p>
                  <p className="text-lg">Delegación 1 - CDMX Norte</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-2">File Format</p>
                  <p className="text-lg">IDSE v2.0 (Current)</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-2">Auto-Generate</p>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
