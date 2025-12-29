import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Building2, FileText, Calculator, Calendar, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface Union {
  id: string;
  name: string;
  abbreviation: string;
  registration_number: string;
  federation: string;
  secretary_general: string;
  address: string;
  members_count: number;
  status: "active" | "inactive";
  cct_expiration?: string;
}

interface UnionDue {
  id: string;
  union_name: string;
  due_type: string;
  percentage: number;
  fixed_amount?: number;
  frequency: string;
  employees_count: number;
  total_collected: number;
  period: string;
}

interface CCT {
  id: string;
  union_name: string;
  cct_number: string;
  effective_date: string;
  expiration_date: string;
  status: "active" | "expired" | "negotiating";
  salary_increase_percent?: number;
  benefits_summary: string;
}

export function MexicanUnionManagement() {
  const [addUnionDialogOpen, setAddUnionDialogOpen] = useState(false);

  const unions: Union[] = [
    {
      id: "1",
      name: "Sindicato de Trabajadores de la Industria Metal-Mecánica",
      abbreviation: "STIMM",
      registration_number: "RS-001234",
      federation: "CTM",
      secretary_general: "Juan Pérez García",
      address: "Av. Insurgentes Sur 1234, CDMX",
      members_count: 85,
      status: "active",
      cct_expiration: "2026-04-30"
    },
    {
      id: "2",
      name: "Sindicato Nacional de Trabajadores Administrativos",
      abbreviation: "SNTA",
      registration_number: "RS-005678",
      federation: "CROC",
      secretary_general: "María López Hernández",
      address: "Calle Reforma 567, Guadalajara",
      members_count: 42,
      status: "active",
      cct_expiration: "2025-12-31"
    }
  ];

  const unionDues: UnionDue[] = [
    {
      id: "1",
      union_name: "STIMM (CTM)",
      due_type: "Cuota Ordinaria",
      percentage: 2.0,
      frequency: "Quincenal",
      employees_count: 85,
      total_collected: 45000,
      period: "2025-01"
    },
    {
      id: "2",
      union_name: "SNTA (CROC)",
      due_type: "Cuota Ordinaria",
      percentage: 1.5,
      frequency: "Quincenal",
      employees_count: 42,
      total_collected: 18500,
      period: "2025-01"
    }
  ];

  const ccts: CCT[] = [
    {
      id: "1",
      union_name: "STIMM",
      cct_number: "CCT-STIMM-2024-2026",
      effective_date: "2024-05-01",
      expiration_date: "2026-04-30",
      status: "active",
      salary_increase_percent: 8.5,
      benefits_summary: "Aguinaldo 30 días, Vacaciones 15 días, Prima vacacional 50%"
    },
    {
      id: "2",
      union_name: "SNTA",
      cct_number: "CCT-SNTA-2023-2025",
      effective_date: "2023-01-01",
      expiration_date: "2025-12-31",
      status: "active",
      salary_increase_percent: 7.0,
      benefits_summary: "Aguinaldo 25 días, Vacaciones 12 días, Prima vacacional 40%"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Activo</Badge>;
      case "expired":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Vencido</Badge>;
      case "negotiating":
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />En Negociación</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactivo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gestión Sindical / CTM
          </h2>
          <p className="text-muted-foreground">
            Administración de sindicatos, cuotas sindicales y contratos colectivos de trabajo
          </p>
        </div>
        <Dialog open={addUnionDialogOpen} onOpenChange={setAddUnionDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Sindicato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Sindicato</DialogTitle>
              <DialogDescription>
                Agregue un sindicato con el que la empresa tenga relación laboral
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Nombre del Sindicato</Label>
                  <Input placeholder="Nombre completo del sindicato" />
                </div>
                <div className="space-y-2">
                  <Label>Siglas</Label>
                  <Input placeholder="Ej: STIMM" />
                </div>
                <div className="space-y-2">
                  <Label>No. de Registro</Label>
                  <Input placeholder="RS-XXXXXX" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Federación / Central Obrera</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione federación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ctm">CTM - Confederación de Trabajadores de México</SelectItem>
                    <SelectItem value="croc">CROC - Confederación Revolucionaria de Obreros y Campesinos</SelectItem>
                    <SelectItem value="crom">CROM - Confederación Regional Obrera Mexicana</SelectItem>
                    <SelectItem value="independiente">Sindicato Independiente</SelectItem>
                    <SelectItem value="otro">Otra Federación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Secretario General</Label>
                <Input placeholder="Nombre del secretario general" />
              </div>

              <div className="space-y-2">
                <Label>Domicilio</Label>
                <Textarea placeholder="Dirección del sindicato" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUnionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setAddUnionDialogOpen(false)}>
                Registrar Sindicato
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sindicatos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unions.filter(u => u.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trabajadores Sindicalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unions.reduce((sum, u) => sum + u.members_count, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cuotas del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(unionDues.reduce((sum, d) => sum + d.total_collected, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CCTs Vigentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ccts.filter(c => c.status === "active").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="unions">
        <TabsList>
          <TabsTrigger value="unions">Sindicatos</TabsTrigger>
          <TabsTrigger value="dues">Cuotas Sindicales</TabsTrigger>
          <TabsTrigger value="ccts">Contratos Colectivos</TabsTrigger>
          <TabsTrigger value="members">Afiliados</TabsTrigger>
        </TabsList>

        <TabsContent value="unions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sindicatos Registrados</CardTitle>
              <CardDescription>
                Lista de sindicatos con los que la empresa mantiene relación laboral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sindicato</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Federación</TableHead>
                    <TableHead>Secretario General</TableHead>
                    <TableHead>Afiliados</TableHead>
                    <TableHead>Venc. CCT</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unions.map((union) => (
                    <TableRow key={union.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{union.abbreviation}</p>
                          <p className="text-xs text-muted-foreground">{union.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{union.registration_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{union.federation}</Badge>
                      </TableCell>
                      <TableCell>{union.secretary_general}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {union.members_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        {union.cct_expiration && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(union.cct_expiration), "dd/MM/yyyy")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(union.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cuotas Sindicales</CardTitle>
              <CardDescription>
                Retención y entero de cuotas sindicales por período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sindicato</TableHead>
                    <TableHead>Tipo de Cuota</TableHead>
                    <TableHead className="text-right">Porcentaje</TableHead>
                    <TableHead>Frecuencia</TableHead>
                    <TableHead>Afiliados</TableHead>
                    <TableHead className="text-right">Total Recaudado</TableHead>
                    <TableHead>Período</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unionDues.map((due) => (
                    <TableRow key={due.id}>
                      <TableCell className="font-medium">{due.union_name}</TableCell>
                      <TableCell>{due.due_type}</TableCell>
                      <TableCell className="text-right">{due.percentage}%</TableCell>
                      <TableCell>{due.frequency}</TableCell>
                      <TableCell>{due.employees_count}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(due.total_collected)}
                      </TableCell>
                      <TableCell>{due.period}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ccts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contratos Colectivos de Trabajo</CardTitle>
              <CardDescription>
                CCTs vigentes y sus condiciones principales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sindicato</TableHead>
                    <TableHead>No. CCT</TableHead>
                    <TableHead>Vigencia</TableHead>
                    <TableHead>Incremento Salarial</TableHead>
                    <TableHead>Prestaciones</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ccts.map((cct) => (
                    <TableRow key={cct.id}>
                      <TableCell className="font-medium">{cct.union_name}</TableCell>
                      <TableCell className="font-mono text-sm">{cct.cct_number}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(cct.effective_date), "dd/MM/yyyy")} - {format(new Date(cct.expiration_date), "dd/MM/yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {cct.salary_increase_percent && (
                          <Badge variant="outline" className="text-green-600">
                            +{cct.salary_increase_percent}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-muted-foreground">
                        {cct.benefits_summary}
                      </TableCell>
                      <TableCell>{getStatusBadge(cct.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Trabajadores Afiliados</CardTitle>
              <CardDescription>
                Lista de empleados afiliados a cada sindicato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <p className="mt-4">Seleccione un sindicato para ver sus afiliados</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
