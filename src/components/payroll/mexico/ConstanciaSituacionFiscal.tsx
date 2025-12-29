import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  Eye,
  AlertTriangle,
  Calendar
} from "lucide-react";

export function ConstanciaSituacionFiscal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const employeeCSF = [
    {
      id: "1",
      employeeNumber: "EMP-001",
      name: "Juan García López",
      rfc: "GALJ850215ABC",
      curp: "GALJ850215HDFRPN09",
      regimenFiscal: "605 - Sueldos y Salarios",
      codigoPostal: "06600",
      status: "valid",
      validUntil: "2025-12-31",
      lastUpdate: "2025-01-15"
    },
    {
      id: "2",
      employeeNumber: "EMP-002",
      name: "María Fernández Ruiz",
      rfc: "FERM900310XYZ",
      curp: "FERM900310MDFRSR05",
      regimenFiscal: "605 - Sueldos y Salarios",
      codigoPostal: "03100",
      status: "expiring",
      validUntil: "2025-02-28",
      lastUpdate: "2024-12-01"
    },
    {
      id: "3",
      employeeNumber: "EMP-003",
      name: "Carlos Mendoza Sánchez",
      rfc: "MESC880520DEF",
      curp: "MESC880520HDFRLN08",
      regimenFiscal: "605 - Sueldos y Salarios",
      codigoPostal: "44100",
      status: "expired",
      validUntil: "2024-12-31",
      lastUpdate: "2024-06-15"
    },
    {
      id: "4",
      employeeNumber: "EMP-004",
      name: "Ana Torres Vargas",
      rfc: "TOVA920815GHI",
      curp: "TOVA920815MDFRLN02",
      regimenFiscal: "605 - Sueldos y Salarios",
      codigoPostal: "64000",
      status: "valid",
      validUntil: "2025-11-30",
      lastUpdate: "2025-01-10"
    },
  ];

  const validationSummary = {
    total: 156,
    valid: 142,
    expiring: 8,
    expired: 6
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Vigente</Badge>;
      case "expiring":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200"><Clock className="h-3 w-3 mr-1" />Por Vencer</Badge>;
      case "expired":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Vencida</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleValidateAll = () => {
    setIsValidating(true);
    setTimeout(() => setIsValidating(false), 3000);
  };

  const filteredEmployees = employeeCSF.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.rfc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Constancia de Situación Fiscal</h2>
            <p className="text-sm text-muted-foreground">
              Gestión y validación de CSF de empleados
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleValidateAll} disabled={isValidating}>
            {isValidating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Validar Todas
              </>
            )}
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Cargar CSF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{validationSummary.total}</p>
                <p className="text-xs text-muted-foreground">Total Empleados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{validationSummary.valid}</p>
                <p className="text-xs text-muted-foreground">CSF Vigentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{validationSummary.expiring}</p>
                <p className="text-xs text-muted-foreground">Por Vencer (30 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{validationSummary.expired}</p>
                <p className="text-xs text-muted-foreground">CSF Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {validationSummary.expired > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <div>
            <p className="font-medium text-red-600">Acción Requerida</p>
            <p className="text-sm text-muted-foreground">
              {validationSummary.expired} empleados tienen CSF vencida. No se puede timbrar nómina sin CSF vigente.
            </p>
          </div>
          <Button variant="destructive" size="sm" className="ml-auto">
            Ver Vencidas
          </Button>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Empleados</TabsTrigger>
          <TabsTrigger value="expired">Vencidas</TabsTrigger>
          <TabsTrigger value="upload">Carga Masiva</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Constancias de Situación Fiscal</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, RFC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Empleado</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>RFC</TableHead>
                    <TableHead>Régimen Fiscal</TableHead>
                    <TableHead>C.P.</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.employeeNumber}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{emp.rfc}</code>
                      </TableCell>
                      <TableCell className="text-sm">{emp.regimenFiscal}</TableCell>
                      <TableCell>{emp.codigoPostal}</TableCell>
                      <TableCell>{emp.validUntil}</TableCell>
                      <TableCell>{getStatusBadge(emp.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Constancias Vencidas</CardTitle>
              <CardDescription>Empleados que requieren actualizar su CSF</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Empleado</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>RFC</TableHead>
                    <TableHead>Fecha Vencimiento</TableHead>
                    <TableHead>Días Vencido</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeCSF.filter(e => e.status === 'expired').map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.employeeNumber}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{emp.rfc}</code>
                      </TableCell>
                      <TableCell>{emp.validUntil}</TableCell>
                      <TableCell className="text-red-600 font-medium">28 días</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Actualizar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Carga Masiva de CSF</CardTitle>
              <CardDescription>Sube múltiples constancias en formato PDF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arrastra archivos PDF aquí o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  El sistema extraerá automáticamente RFC, régimen fiscal y código postal
                </p>
                <Button variant="outline" className="mt-4">
                  Seleccionar Archivos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
