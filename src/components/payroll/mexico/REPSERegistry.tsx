import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCheck, Plus, Building2, CheckCircle2, Clock, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface REPSERecord {
  id: string;
  company_name: string;
  rfc: string;
  repse_number: string;
  registration_date: string;
  renewal_date: string;
  status: "active" | "pending" | "expired" | "cancelled";
  services: string[];
  contractors_count: number;
  last_verification: string;
}

export function REPSERegistry() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const repseRecords: REPSERecord[] = [
    {
      id: "1",
      company_name: "Servicios Especializados SA de CV",
      rfc: "SES200101ABC",
      repse_number: "REPSE-2024-12345",
      registration_date: "2024-01-15",
      renewal_date: "2027-01-14",
      status: "active",
      services: ["Limpieza", "Vigilancia", "Mantenimiento"],
      contractors_count: 45,
      last_verification: "2024-12-15T10:30:00"
    },
    {
      id: "2",
      company_name: "Outsourcing Profesional MX",
      rfc: "OPM190601XYZ",
      repse_number: "REPSE-2023-67890",
      registration_date: "2023-06-01",
      renewal_date: "2026-05-31",
      status: "active",
      services: ["Contabilidad", "Recursos Humanos"],
      contractors_count: 28,
      last_verification: "2024-11-20T14:15:00"
    },
    {
      id: "3",
      company_name: "Tech Support Solutions",
      rfc: "TSS210315DEF",
      repse_number: "REPSE-2021-11111",
      registration_date: "2021-03-15",
      renewal_date: "2024-03-14",
      status: "expired",
      services: ["Soporte Técnico", "Desarrollo de Software"],
      contractors_count: 12,
      last_verification: "2024-02-28T09:00:00"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Vigente</Badge>;
      case "pending":
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />En Trámite</Badge>;
      case "expired":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Vencido</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            REPSE Registry
          </h2>
          <p className="text-muted-foreground">
            Registro de Prestadoras de Servicios Especializados u Obras Especializadas
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Proveedor REPSE</DialogTitle>
              <DialogDescription>
                Agregue un proveedor de servicios especializados con su registro REPSE
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Razón Social</Label>
                  <Input placeholder="Nombre del proveedor" />
                </div>
                <div className="space-y-2">
                  <Label>RFC</Label>
                  <Input placeholder="RFC del proveedor" className="uppercase" maxLength={13} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Número REPSE</Label>
                <Input placeholder="REPSE-YYYY-XXXXX" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Registro</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Vencimiento</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Servicios Especializados</Label>
                <Textarea placeholder="Describa los servicios que presta (uno por línea)" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setAddDialogOpen(false)}>
                Registrar Proveedor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Reforma de Subcontratación 2021</AlertTitle>
        <AlertDescription>
          Desde abril 2021, las empresas que contraten servicios especializados deben verificar 
          que sus proveedores cuenten con registro REPSE vigente ante la STPS.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {repseRecords.filter(r => r.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer (90 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Personal Contratado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repseRecords.filter(r => r.status === "active").reduce((sum, r) => sum + r.contractors_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers">
        <TabsList>
          <TabsTrigger value="providers">Proveedores REPSE</TabsTrigger>
          <TabsTrigger value="verification">Verificación</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proveedores Registrados</CardTitle>
              <CardDescription>
                Lista de proveedores de servicios especializados con registro REPSE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>RFC</TableHead>
                    <TableHead>No. REPSE</TableHead>
                    <TableHead>Servicios</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Personal</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repseRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{record.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{record.rfc}</TableCell>
                      <TableCell className="font-mono text-sm">{record.repse_number}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {record.services.slice(0, 2).map((service, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{service}</Badge>
                          ))}
                          {record.services.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{record.services.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(record.renewal_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{record.contractors_count}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" title="Verificar en REPSE">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Ver en portal STPS">
                            <ExternalLink className="h-4 w-4" />
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

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Verificación de Registros REPSE</CardTitle>
              <CardDescription>
                Verifique la vigencia de los registros REPSE directamente con la STPS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input placeholder="Ingrese RFC o número REPSE" className="max-w-md" />
                <Button>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                Ingrese un RFC o número REPSE para verificar su vigencia
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Contratos de Servicios Especializados</CardTitle>
              <CardDescription>
                Gestión de contratos con proveedores REPSE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Configure los contratos asociados a cada proveedor REPSE
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
