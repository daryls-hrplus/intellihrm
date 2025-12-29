import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileText, Download, CheckCircle2, Clock, AlertTriangle, Calendar, Building2, Users } from "lucide-react";
import { format } from "date-fns";

interface STPSForm {
  id: string;
  form_code: string;
  form_name: string;
  description: string;
  due_date: string;
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected";
  company_name: string;
  period: string;
  submitted_at?: string;
  employees_count: number;
}

export function STPSCompliance() {
  const [selectedYear, setSelectedYear] = useState("2025");

  const stpsForms: STPSForm[] = [
    {
      id: "1",
      form_code: "DC-1",
      form_name: "Informe sobre la Constitución de la Comisión Mixta",
      description: "Registro de la comisión mixta de capacitación y adiestramiento",
      due_date: "2025-01-31",
      status: "approved",
      company_name: "Empresa Mexicana SA de CV",
      period: "2025",
      submitted_at: "2025-01-15T10:30:00",
      employees_count: 150
    },
    {
      id: "2",
      form_code: "DC-2",
      form_name: "Plan y Programas de Capacitación",
      description: "Registro del plan de capacitación anual",
      due_date: "2025-02-28",
      status: "in_progress",
      company_name: "Empresa Mexicana SA de CV",
      period: "2025",
      employees_count: 150
    },
    {
      id: "3",
      form_code: "DC-3",
      form_name: "Constancias de Habilidades Laborales",
      description: "Registro de constancias expedidas",
      due_date: "2025-03-31",
      status: "pending",
      company_name: "Empresa Mexicana SA de CV",
      period: "2025",
      employees_count: 150
    },
    {
      id: "4",
      form_code: "DC-4",
      form_name: "Lista de Constancias de Habilidades",
      description: "Listado consolidado de constancias",
      due_date: "2025-04-30",
      status: "pending",
      company_name: "Empresa Mexicana SA de CV",
      period: "2025",
      employees_count: 150
    },
    {
      id: "5",
      form_code: "DC-5",
      form_name: "Constancia de Habilidades Modalidad Escolarizada",
      description: "Para capacitación en instituciones educativas",
      due_date: "2025-12-31",
      status: "pending",
      company_name: "Empresa Mexicana SA de CV",
      period: "2025",
      employees_count: 25
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Enviado</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />En Proceso</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "rejected":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const completedForms = stpsForms.filter(f => f.status === "approved" || f.status === "submitted").length;
  const totalForms = stpsForms.length;
  const progressPercentage = Math.round((completedForms / totalForms) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            STPS Compliance
          </h2>
          <p className="text-muted-foreground">
            Secretaría del Trabajo y Previsión Social - Formatos DC y obligaciones laborales
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progreso Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedForms} de {totalForms} formatos completados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stpsForms.filter(f => f.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stpsForms.filter(f => f.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stpsForms.filter(f => f.status === "approved" || f.status === "submitted").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forms">
        <TabsList>
          <TabsTrigger value="forms">Formatos DC</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="sirce">Portal SIRCE</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Formatos STPS - Capacitación y Adiestramiento</CardTitle>
              <CardDescription>
                Formatos DC requeridos por la Secretaría del Trabajo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Empleados</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stpsForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{form.form_code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{form.form_name}</p>
                          <p className="text-xs text-muted-foreground">{form.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{form.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{form.employees_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(form.due_date), "dd/MM/yyyy")}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(form.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {form.status === "pending" || form.status === "in_progress" ? (
                            <Button size="sm">Completar</Button>
                          ) : (
                            <Button variant="outline" size="sm">Ver</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Obligaciones STPS</CardTitle>
              <CardDescription>
                Fechas límite para presentación de formatos y obligaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stpsForms.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map((form) => (
                  <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{format(new Date(form.due_date), "dd")}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(form.due_date), "MMM")}</p>
                      </div>
                      <div>
                        <p className="font-medium">{form.form_code} - {form.form_name}</p>
                        <p className="text-sm text-muted-foreground">{form.company_name}</p>
                      </div>
                    </div>
                    {getStatusBadge(form.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sirce">
          <Card>
            <CardHeader>
              <CardTitle>Portal SIRCE</CardTitle>
              <CardDescription>
                Sistema de Información de Registro de la Capacitación y el Entrenamiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">Integración con SIRCE</h3>
                <p className="text-muted-foreground mt-2">
                  Configure sus credenciales del portal SIRCE para enviar formatos directamente
                </p>
                <Button className="mt-4">Configurar Integración</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
