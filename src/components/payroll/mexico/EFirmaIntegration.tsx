import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Key, Upload, Shield, CheckCircle2, AlertTriangle, Clock, FileSignature, Building2 } from "lucide-react";
import { format } from "date-fns";

interface Certificate {
  id: string;
  company_name: string;
  rfc: string;
  certificate_type: "e.firma" | "CSD";
  serial_number: string;
  valid_from: string;
  valid_to: string;
  status: "active" | "expired" | "revoked" | "pending";
  uploaded_at: string;
  uploaded_by: string;
}

export function EFirmaIntegration() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [certificateType, setCertificateType] = useState<"e.firma" | "CSD">("e.firma");

  // Mock data
  const certificates: Certificate[] = [
    {
      id: "1",
      company_name: "Empresa Mexicana SA de CV",
      rfc: "EMP920101ABC",
      certificate_type: "e.firma",
      serial_number: "00001000000123456789",
      valid_from: "2024-01-15",
      valid_to: "2028-01-14",
      status: "active",
      uploaded_at: "2024-01-20T10:30:00",
      uploaded_by: "admin@empresa.mx"
    },
    {
      id: "2",
      company_name: "Empresa Mexicana SA de CV",
      rfc: "EMP920101ABC",
      certificate_type: "CSD",
      serial_number: "00001000000987654321",
      valid_from: "2024-02-01",
      valid_to: "2028-01-31",
      status: "active",
      uploaded_at: "2024-02-05T14:20:00",
      uploaded_by: "admin@empresa.mx"
    },
    {
      id: "3",
      company_name: "Sucursal Norte SA de CV",
      rfc: "SNO950315XYZ",
      certificate_type: "e.firma",
      serial_number: "00001000000111222333",
      valid_from: "2023-06-01",
      valid_to: "2024-05-31",
      status: "expired",
      uploaded_at: "2023-06-10T09:15:00",
      uploaded_by: "rh@sucursal.mx"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Activo</Badge>;
      case "expired":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Expirado</Badge>;
      case "revoked":
        return <Badge variant="destructive">Revocado</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            e.firma / FIEL Integration
          </h2>
          <p className="text-muted-foreground">
            Gestión de certificados digitales para firma electrónica y timbrado de CFDIs
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Cargar Certificado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cargar Certificado Digital</DialogTitle>
              <DialogDescription>
                Suba los archivos de su certificado digital (.cer y .key)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Certificado</Label>
                <div className="flex gap-4">
                  <Button
                    variant={certificateType === "e.firma" ? "default" : "outline"}
                    onClick={() => setCertificateType("e.firma")}
                    className="flex-1"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    e.firma (FIEL)
                  </Button>
                  <Button
                    variant={certificateType === "CSD" ? "default" : "outline"}
                    onClick={() => setCertificateType("CSD")}
                    className="flex-1"
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    CSD (Timbrado)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cer-file">Archivo .cer (Certificado)</Label>
                <Input id="cer-file" type="file" accept=".cer" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key-file">Archivo .key (Llave Privada)</Label>
                <Input id="key-file" type="file" accept=".key" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña de la Llave Privada</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Los certificados se almacenan de forma encriptada y segura. 
                  La llave privada nunca se transmite sin cifrar.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setUploadDialogOpen(false)}>
                Cargar y Validar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="certificates">
        <TabsList>
          <TabsTrigger value="certificates">Certificados Instalados</TabsTrigger>
          <TabsTrigger value="usage">Historial de Uso</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Certificados Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {certificates.filter(c => c.status === "active").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Por Expirar (30 días)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Expirados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {certificates.filter(c => c.status === "expired").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Certificados Registrados</CardTitle>
              <CardDescription>
                Lista de todos los certificados digitales cargados en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>RFC</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>No. Serie</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {cert.company_name}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{cert.rfc}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {cert.certificate_type === "e.firma" ? (
                            <><Shield className="h-3 w-3 mr-1" />e.firma</>
                          ) : (
                            <><FileSignature className="h-3 w-3 mr-1" />CSD</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{cert.serial_number}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(cert.valid_from), "dd/MM/yyyy")} - {format(new Date(cert.valid_to), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Ver Detalles</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Uso de Certificados</CardTitle>
              <CardDescription>
                Registro de todas las operaciones realizadas con los certificados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                El historial de uso se mostrará aquí una vez que se realicen operaciones de firma
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Certificados</CardTitle>
              <CardDescription>
                Ajustes generales para la gestión de certificados digitales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Alertas de Expiración</p>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones cuando un certificado esté próximo a expirar
                  </p>
                </div>
                <Badge className="bg-green-500">Activado</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Días de Anticipación</p>
                  <p className="text-sm text-muted-foreground">
                    Días antes de la expiración para enviar alertas
                  </p>
                </div>
                <Badge variant="outline">30 días</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Validación Automática</p>
                  <p className="text-sm text-muted-foreground">
                    Verificar certificados contra el SAT periódicamente
                  </p>
                </div>
                <Badge className="bg-green-500">Activado</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
