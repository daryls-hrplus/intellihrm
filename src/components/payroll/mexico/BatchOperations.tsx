import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Download, 
  Users, 
  FileSpreadsheet,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Percent,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

interface BatchOperationsProps {
  companyId: string;
}

export function BatchOperations({ companyId }: BatchOperationsProps) {
  const [operationType, setOperationType] = useState("salary");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Mock employees for selection
  const employees = [
    { id: "1", name: "María García López", department: "Ventas", currentSalary: 25000, position: "Ejecutiva de Ventas" },
    { id: "2", name: "Juan Hernández Pérez", department: "Tecnología", currentSalary: 35000, position: "Desarrollador Sr" },
    { id: "3", name: "Ana Martínez Ruiz", department: "RRHH", currentSalary: 28000, position: "Analista RRHH" },
    { id: "4", name: "Carlos López Sánchez", department: "Finanzas", currentSalary: 32000, position: "Contador" },
    { id: "5", name: "Laura Rodríguez Díaz", department: "Ventas", currentSalary: 24000, position: "Ejecutiva de Ventas" },
    { id: "6", name: "Pedro Jiménez Torres", department: "Tecnología", currentSalary: 40000, position: "Tech Lead" },
  ];

  const [adjustmentType, setAdjustmentType] = useState<"percent" | "fixed">("percent");
  const [adjustmentValue, setAdjustmentValue] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };

  const runBatchOperation = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Seleccione al menos un empleado");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    setIsProcessing(false);
    toast.success(`Operación completada para ${selectedEmployees.length} empleados`);
  };

  const calculateNewSalary = (currentSalary: number) => {
    const value = parseFloat(adjustmentValue) || 0;
    if (adjustmentType === "percent") {
      return currentSalary * (1 + value / 100);
    }
    return currentSalary + value;
  };

  const batchHistory = [
    { 
      id: "B001", 
      date: "2025-01-15", 
      type: "Ajuste Salarial", 
      affected: 45, 
      status: "completed",
      executedBy: "Admin HR"
    },
    { 
      id: "B002", 
      date: "2025-01-10", 
      type: "Actualización Datos", 
      affected: 120, 
      status: "completed",
      executedBy: "Admin HR"
    },
    { 
      id: "B003", 
      date: "2025-01-05", 
      type: "Cambio de Turno", 
      affected: 30, 
      status: "failed",
      executedBy: "Manager"
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Operaciones Masivas</h2>
          <p className="text-sm text-muted-foreground">
            Actualizaciones y cambios para múltiples empleados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar Excel
          </Button>
        </div>
      </div>

      <Tabs value={operationType} onValueChange={setOperationType}>
        <TabsList>
          <TabsTrigger value="salary">Ajuste Salarial</TabsTrigger>
          <TabsTrigger value="data">Actualizar Datos</TabsTrigger>
          <TabsTrigger value="benefits">Cambiar Beneficios</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="salary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Ajuste Salarial Masivo
              </CardTitle>
              <CardDescription>
                Aplique incrementos porcentuales o montos fijos a múltiples empleados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuration */}
              <div className="grid gap-4 md:grid-cols-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label>Tipo de Ajuste</Label>
                  <Select 
                    value={adjustmentType} 
                    onValueChange={(v: "percent" | "fixed") => setAdjustmentType(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Porcentaje (%)</SelectItem>
                      <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {adjustmentType === "percent" ? "Porcentaje" : "Monto (MXN)"}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(e.target.value)}
                      placeholder={adjustmentType === "percent" ? "5" : "1000"}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {adjustmentType === "percent" ? <Percent className="h-4 w-4" /> : "$"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fecha Efectiva</Label>
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Filtrar por Depto.</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sales">Ventas</SelectItem>
                      <SelectItem value="tech">Tecnología</SelectItem>
                      <SelectItem value="hr">RRHH</SelectItem>
                      <SelectItem value="finance">Finanzas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Employee Selection */}
              <div className="border rounded-lg">
                <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedEmployees.length === employees.length}
                      onCheckedChange={selectAll}
                    />
                    <span className="text-sm font-medium">
                      Seleccionar Todos ({selectedEmployees.length} de {employees.length})
                    </span>
                  </div>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedEmployees.length} seleccionados
                  </Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Posición</TableHead>
                      <TableHead className="text-right">Salario Actual</TableHead>
                      <TableHead className="text-right">Nuevo Salario</TableHead>
                      <TableHead className="text-right">Diferencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => {
                      const newSalary = calculateNewSalary(emp.currentSalary);
                      const diff = newSalary - emp.currentSalary;
                      return (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedEmployees.includes(emp.id)}
                              onCheckedChange={() => toggleEmployee(emp.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>{emp.position}</TableCell>
                          <TableCell className="text-right">
                            ${emp.currentSalary.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {adjustmentValue ? (
                              `$${newSalary.toLocaleString()}`
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {adjustmentValue && diff > 0 ? (
                              <span className="text-green-600">
                                +${diff.toLocaleString()}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Summary & Execute */}
              {selectedEmployees.length > 0 && adjustmentValue && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>
                        Se aplicará un ajuste de{" "}
                        <strong>
                          {adjustmentType === "percent" 
                            ? `${adjustmentValue}%` 
                            : `$${parseFloat(adjustmentValue).toLocaleString()}`}
                        </strong>{" "}
                        a <strong>{selectedEmployees.length}</strong> empleados.
                        Impacto mensual estimado:{" "}
                        <strong>
                          ${selectedEmployees.reduce((acc, id) => {
                            const emp = employees.find(e => e.id === id);
                            if (!emp) return acc;
                            return acc + (calculateNewSalary(emp.currentSalary) - emp.currentSalary);
                          }, 0).toLocaleString()}
                        </strong>
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Procesando...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">Vista Previa</Button>
                <Button onClick={runBatchOperation} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Ejecutar Operación
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Actualización Masiva de Datos
              </CardTitle>
              <CardDescription>
                Importe un archivo Excel para actualizar datos de empleados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastre un archivo Excel aquí o haga clic para seleccionar
                </p>
                <Button variant="outline">
                  Seleccionar Archivo
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium">Campos Actualizables</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• RFC, CURP, NSS</li>
                    <li>• Dirección, Teléfono</li>
                    <li>• Cuenta Bancaria</li>
                    <li>• Datos INFONAVIT/FONACOT</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium">Formato Requerido</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Excel (.xlsx) o CSV</li>
                    <li>• Primera fila: encabezados</li>
                    <li>• Columna ID obligatoria</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium">Validaciones</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• RFC formato válido</li>
                    <li>• CURP 18 caracteres</li>
                    <li>• NSS 11 dígitos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cambio Masivo de Beneficios</CardTitle>
              <CardDescription>
                Aplique cambios de beneficios a grupos de empleados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de Beneficio</Label>
                  <Select defaultValue="vacation">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Días de Vacaciones</SelectItem>
                      <SelectItem value="bonus">Prima Vacacional</SelectItem>
                      <SelectItem value="savings">Fondo de Ahorro</SelectItem>
                      <SelectItem value="vouchers">Vales de Despensa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nuevo Valor</Label>
                  <Input type="number" placeholder="Ingrese el nuevo valor" />
                </div>
              </div>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Aplicar Cambio
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Operaciones Masivas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Afectados</TableHead>
                    <TableHead>Ejecutado Por</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchHistory.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono">{batch.id}</TableCell>
                      <TableCell>{batch.date}</TableCell>
                      <TableCell>{batch.type}</TableCell>
                      <TableCell>{batch.affected} empleados</TableCell>
                      <TableCell>{batch.executedBy}</TableCell>
                      <TableCell>
                        {batch.status === "completed" ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Fallido
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
      </Tabs>
    </div>
  );
}