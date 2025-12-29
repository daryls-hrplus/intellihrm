import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { FileSearch, Download, FileText, AlertTriangle, CheckCircle2, Clock, Archive, Shield, Building2 } from "lucide-react";
import { format } from "date-fns";

interface AuditReport {
  id: string;
  report_name: string;
  description: string;
  category: string;
  last_generated?: string;
  status: "ready" | "generating" | "not_available";
}

interface DocumentSet {
  id: string;
  document_type: string;
  period: string;
  company_name: string;
  documents_count: number;
  status: "complete" | "incomplete" | "missing";
  last_updated: string;
}

export function SATAuditSupport() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const auditReports: AuditReport[] = [
    {
      id: "1",
      report_name: "Nóminas Timbradas (CFDIs)",
      description: "Listado completo de recibos de nómina timbrados con UUID y XML",
      category: "nomina",
      last_generated: "2025-01-15T10:30:00",
      status: "ready"
    },
    {
      id: "2",
      report_name: "Retenciones ISR",
      description: "Desglose de retenciones de ISR por empleado y período",
      category: "isr",
      last_generated: "2025-01-15T10:30:00",
      status: "ready"
    },
    {
      id: "3",
      report_name: "Cuotas IMSS Patronales",
      description: "Detalle de cuotas patronales pagadas al IMSS",
      category: "imss",
      last_generated: "2025-01-10T14:20:00",
      status: "ready"
    },
    {
      id: "4",
      report_name: "Aportaciones INFONAVIT",
      description: "Registro de aportaciones patronales al INFONAVIT",
      category: "infonavit",
      last_generated: "2025-01-10T14:20:00",
      status: "ready"
    },
    {
      id: "5",
      report_name: "ISN por Estado",
      description: "Cálculo y pago de ISN por entidad federativa",
      category: "isn",
      last_generated: "2025-01-05T09:00:00",
      status: "ready"
    },
    {
      id: "6",
      report_name: "Subsidio al Empleo",
      description: "Aplicación del subsidio al empleo por empleado",
      category: "subsidio",
      status: "ready"
    },
    {
      id: "7",
      report_name: "PTU (Reparto de Utilidades)",
      description: "Cálculo y pago de participación de utilidades",
      category: "ptu",
      status: "not_available"
    },
    {
      id: "8",
      report_name: "Constancias de Percepciones y Retenciones",
      description: "Formato 37-A anual por empleado",
      category: "constancias",
      last_generated: "2024-02-28T16:00:00",
      status: "ready"
    }
  ];

  const documentSets: DocumentSet[] = [
    {
      id: "1",
      document_type: "XMLs de Nómina",
      period: "2025",
      company_name: "Empresa Mexicana SA de CV",
      documents_count: 1825,
      status: "complete",
      last_updated: "2025-01-15T23:59:00"
    },
    {
      id: "2",
      document_type: "Acuses de Recibo IMSS",
      period: "2025",
      company_name: "Empresa Mexicana SA de CV",
      documents_count: 12,
      status: "complete",
      last_updated: "2025-01-10T12:00:00"
    },
    {
      id: "3",
      document_type: "Declaraciones ISN",
      period: "2025",
      company_name: "Empresa Mexicana SA de CV",
      documents_count: 1,
      status: "incomplete",
      last_updated: "2025-01-17T10:00:00"
    },
    {
      id: "4",
      document_type: "Contratos de Trabajo",
      period: "Vigentes",
      company_name: "Empresa Mexicana SA de CV",
      documents_count: 150,
      status: "complete",
      last_updated: "2025-01-01T00:00:00"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
      case "complete":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Disponible</Badge>;
      case "generating":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Generando</Badge>;
      case "incomplete":
        return <Badge className="bg-amber-500"><AlertTriangle className="h-3 w-3 mr-1" />Incompleto</Badge>;
      case "not_available":
      case "missing":
        return <Badge variant="secondary">No Disponible</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReports = selectedCategory === "all" 
    ? auditReports 
    : auditReports.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileSearch className="h-6 w-6" />
            SAT Audit Support
          </h2>
          <p className="text-muted-foreground">
            Reportes y documentación para auditorías del Servicio de Administración Tributaria
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Preparación para Auditorías</AlertTitle>
        <AlertDescription>
          Mantenga su documentación organizada y actualizada. El SAT puede solicitar 
          información de los últimos 5 años fiscales. Esta herramienta le ayuda a 
          generar los reportes necesarios para cualquier requerimiento.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reportes Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {auditReports.filter(r => r.status === "ready").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">XMLs Archivados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documentSets.find(d => d.document_type === "XMLs de Nómina")?.documents_count.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cobertura Documental</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((documentSets.filter(d => d.status === "complete").length / documentSets.length) * 100)}%
            </div>
            <Progress value={Math.round((documentSets.filter(d => d.status === "complete").length / documentSets.length) * 100)} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {format(new Date(), "dd/MM/yyyy")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Reportes para Auditoría</TabsTrigger>
          <TabsTrigger value="documents">Documentos Archivados</TabsTrigger>
          <TabsTrigger value="packages">Paquetes de Auditoría</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reportes Fiscales</CardTitle>
                  <CardDescription>
                    Reportes predefinidos para responder a requerimientos del SAT
                  </CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    <SelectItem value="nomina">Nómina</SelectItem>
                    <SelectItem value="isr">ISR</SelectItem>
                    <SelectItem value="imss">IMSS</SelectItem>
                    <SelectItem value="infonavit">INFONAVIT</SelectItem>
                    <SelectItem value="isn">ISN</SelectItem>
                    <SelectItem value="subsidio">Subsidio</SelectItem>
                    <SelectItem value="ptu">PTU</SelectItem>
                    <SelectItem value="constancias">Constancias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporte</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Última Generación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{report.report_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {report.description}
                      </TableCell>
                      <TableCell>
                        {report.last_generated 
                          ? format(new Date(report.last_generated), "dd/MM/yyyy HH:mm")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" disabled={report.status === "not_available"}>
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
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

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Archivados</CardTitle>
              <CardDescription>
                Repositorio de documentos fiscales y laborales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Documento</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Documentos</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentSets.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.document_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{doc.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.period}</TableCell>
                      <TableCell>{doc.documents_count.toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(doc.last_updated), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <CardTitle>Paquetes de Auditoría</CardTitle>
              <CardDescription>
                Genere paquetes completos de documentación para responder a auditorías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Archive className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Crear Paquete de Auditoría</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Genere un paquete completo con todos los documentos necesarios 
                  para responder a un requerimiento del SAT
                </p>
                <Button className="mt-4">Crear Paquete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
