import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, CheckCircle2, AlertTriangle, Clock, Users, Building2, FileText, Scale } from "lucide-react";

interface ComplianceItem {
  id: string;
  requirement: string;
  description: string;
  status: "compliant" | "non_compliant" | "in_progress" | "not_applicable";
  due_date?: string;
  evidence?: string;
}

interface SubcontractedService {
  id: string;
  provider_name: string;
  rfc: string;
  service_type: string;
  workers_count: number;
  repse_status: "valid" | "invalid" | "pending";
  contract_status: "active" | "expired" | "pending";
}

export function OutsourcingReformCompliance() {
  const complianceItems: ComplianceItem[] = [
    {
      id: "1",
      requirement: "Prohibición de Subcontratación de Personal",
      description: "No se permite la subcontratación de personal propio para actividades sustantivas",
      status: "compliant",
      evidence: "Política interna actualizada"
    },
    {
      id: "2",
      requirement: "Registro REPSE de Proveedores",
      description: "Todos los proveedores de servicios especializados deben contar con registro REPSE vigente",
      status: "compliant",
      evidence: "3 proveedores con REPSE vigente"
    },
    {
      id: "3",
      requirement: "PTU para Trabajadores Subcontratados",
      description: "Los trabajadores de servicios especializados tienen derecho a PTU de su empleador directo",
      status: "compliant",
      evidence: "Contratos actualizados con cláusula PTU"
    },
    {
      id: "4",
      requirement: "Responsabilidad Solidaria",
      description: "Verificación trimestral del cumplimiento de obligaciones de proveedores",
      status: "in_progress",
      due_date: "2025-03-31",
      evidence: "Pendiente verificación Q1 2025"
    },
    {
      id: "5",
      requirement: "Contratos de Servicios Especializados",
      description: "Contratos que especifiquen el objeto del servicio y número de trabajadores",
      status: "compliant",
      evidence: "Contratos revisados y actualizados"
    },
    {
      id: "6",
      requirement: "Retención de IVA",
      description: "Retención del 6% de IVA en pagos a proveedores de servicios especializados",
      status: "compliant",
      evidence: "Configuración de retención activa"
    }
  ];

  const subcontractedServices: SubcontractedService[] = [
    {
      id: "1",
      provider_name: "Servicios de Limpieza MX",
      rfc: "SLM200101ABC",
      service_type: "Limpieza y Mantenimiento",
      workers_count: 25,
      repse_status: "valid",
      contract_status: "active"
    },
    {
      id: "2",
      provider_name: "Vigilancia Profesional SA",
      rfc: "VPS190601XYZ",
      service_type: "Seguridad y Vigilancia",
      workers_count: 15,
      repse_status: "valid",
      contract_status: "active"
    },
    {
      id: "3",
      provider_name: "Tech Support Solutions",
      rfc: "TSS210315DEF",
      service_type: "Soporte Técnico IT",
      workers_count: 8,
      repse_status: "pending",
      contract_status: "pending"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
      case "valid":
      case "active":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Cumple</Badge>;
      case "non_compliant":
      case "invalid":
      case "expired":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />No Cumple</Badge>;
      case "in_progress":
      case "pending":
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />En Proceso</Badge>;
      case "not_applicable":
        return <Badge variant="secondary">No Aplica</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const compliantCount = complianceItems.filter(i => i.status === "compliant").length;
  const totalCount = complianceItems.filter(i => i.status !== "not_applicable").length;
  const compliancePercentage = Math.round((compliantCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Reforma de Subcontratación
          </h2>
          <p className="text-muted-foreground">
            Cumplimiento de la Reforma de Subcontratación Laboral 2021 (Outsourcing)
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generar Reporte
        </Button>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Reforma Vigente desde Abril 2021</AlertTitle>
        <AlertDescription>
          La reforma laboral prohíbe la subcontratación de personal, permitiendo únicamente 
          la subcontratación de servicios especializados que no formen parte del objeto social 
          ni de la actividad económica preponderante de la empresa.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nivel de Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{compliancePercentage}%</div>
            <Progress value={compliancePercentage} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Requisitos Cumplidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{compliantCount} / {totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Proveedores REPSE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subcontractedServices.filter(s => s.repse_status === "valid").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Personal Tercerizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subcontractedServices.reduce((sum, s) => sum + s.workers_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance">
        <TabsList>
          <TabsTrigger value="compliance">Checklist de Cumplimiento</TabsTrigger>
          <TabsTrigger value="providers">Proveedores</TabsTrigger>
          <TabsTrigger value="guide">Guía de Reforma</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisitos de Cumplimiento</CardTitle>
              <CardDescription>
                Estado de cumplimiento con los requisitos de la reforma de subcontratación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requisito</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Evidencia</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.requirement}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-sm">{item.evidence || "-"}</TableCell>
                      <TableCell>{item.due_date || "-"}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proveedores de Servicios Especializados</CardTitle>
              <CardDescription>
                Estatus de cumplimiento de proveedores de servicios subcontratados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>RFC</TableHead>
                    <TableHead>Servicio</TableHead>
                    <TableHead>Personal</TableHead>
                    <TableHead>REPSE</TableHead>
                    <TableHead>Contrato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcontractedServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{service.provider_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">{service.rfc}</TableCell>
                      <TableCell>{service.service_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {service.workers_count}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(service.repse_status)}</TableCell>
                      <TableCell>{getStatusBadge(service.contract_status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide">
          <Card>
            <CardHeader>
              <CardTitle>Guía de la Reforma de Subcontratación</CardTitle>
              <CardDescription>
                Información clave sobre la reforma y sus implicaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Qué prohíbe la reforma?</AccordionTrigger>
                  <AccordionContent>
                    La reforma prohíbe la subcontratación de personal, es decir, cuando una 
                    persona física o moral proporciona o pone a disposición trabajadores 
                    propios en beneficio de otra persona. Solo se permite la subcontratación 
                    de servicios especializados o de ejecución de obras especializadas.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Qué son los servicios especializados?</AccordionTrigger>
                  <AccordionContent>
                    Son aquellos servicios que no forman parte del objeto social ni de la 
                    actividad económica preponderante del beneficiario de estos. Por ejemplo: 
                    limpieza, seguridad, mantenimiento de instalaciones, vigilancia, etc.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Qué es el REPSE?</AccordionTrigger>
                  <AccordionContent>
                    El Registro de Prestadoras de Servicios Especializados u Obras Especializadas 
                    (REPSE) es un padrón administrado por la STPS donde deben registrarse las 
                    empresas que prestan servicios especializados. Sin este registro, no pueden 
                    celebrar contratos de servicios especializados.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Qué obligaciones tiene el contratante?</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Verificar que el proveedor cuente con registro REPSE vigente</li>
                      <li>Retener el 6% de IVA en los pagos por servicios especializados</li>
                      <li>Verificar trimestralmente el cumplimiento de obligaciones del proveedor</li>
                      <li>Conservar documentación que acredite el cumplimiento</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>¿Cuáles son las sanciones por incumplimiento?</AccordionTrigger>
                  <AccordionContent>
                    Las multas van de 179,240 a 4,481,000 pesos mexicanos. Además, la 
                    subcontratación de personal en términos prohibidos puede configurar 
                    el delito de defraudación fiscal, con penas de prisión de 3 meses 
                    a 9 años dependiendo del monto defraudado.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
