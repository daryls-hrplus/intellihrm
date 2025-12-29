import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Sun, 
  DollarSign,
  Calculator,
  FileDown,
  Users,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VacationPTUManagerProps {
  companyId: string;
}

export function VacationPTUManager({ companyId }: VacationPTUManagerProps) {
  const [activeTab, setActiveTab] = useState("vacation");
  const [selectedYear, setSelectedYear] = useState("2025");

  // Vacation data based on Mexican labor law (Ley Federal del Trabajo 2023 reform)
  const vacationTable = [
    { years: 1, days: 12, primaPercent: 25 },
    { years: 2, days: 14, primaPercent: 25 },
    { years: 3, days: 16, primaPercent: 25 },
    { years: 4, days: 18, primaPercent: 25 },
    { years: 5, days: 20, primaPercent: 25 },
    { years: "6-10", days: 22, primaPercent: 25 },
    { years: "11-15", days: 24, primaPercent: 25 },
    { years: "16-20", days: 26, primaPercent: 25 },
    { years: "21-25", days: 28, primaPercent: 25 },
    { years: "26-30", days: 30, primaPercent: 25 },
    { years: "31+", days: 32, primaPercent: 25 },
  ];

  const employeeVacations = [
    { 
      id: "1", 
      name: "María García López", 
      hireDate: "2020-03-15", 
      yearsWorked: 5, 
      daysEntitled: 20, 
      daysTaken: 8, 
      daysRemaining: 12,
      primaAmount: 3125
    },
    { 
      id: "2", 
      name: "Juan Hernández Pérez", 
      hireDate: "2022-06-01", 
      yearsWorked: 3, 
      daysEntitled: 16, 
      daysTaken: 16, 
      daysRemaining: 0,
      primaAmount: 2800
    },
    { 
      id: "3", 
      name: "Ana Martínez Ruiz", 
      hireDate: "2019-01-10", 
      yearsWorked: 6, 
      daysEntitled: 22, 
      daysTaken: 5, 
      daysRemaining: 17,
      primaAmount: 3850
    },
  ];

  // PTU (Profit Sharing) calculations
  const [ptuConfig, setPtuConfig] = useState({
    fiscalYear: "2024",
    netProfit: 5000000,
    ptuPercentage: 10,
    daysWorkedWeight: 50,
    salaryWeight: 50
  });

  const ptuEmployees = [
    { 
      id: "1", 
      name: "María García López", 
      daysWorked: 365, 
      annualSalary: 300000,
      ptuDays: 8500,
      ptuSalary: 7800,
      totalPTU: 16300
    },
    { 
      id: "2", 
      name: "Juan Hernández Pérez", 
      daysWorked: 220, 
      annualSalary: 420000,
      ptuDays: 5100,
      ptuSalary: 10920,
      totalPTU: 16020
    },
    { 
      id: "3", 
      name: "Ana Martínez Ruiz", 
      daysWorked: 365, 
      annualSalary: 336000,
      ptuDays: 8500,
      ptuSalary: 8736,
      totalPTU: 17236
    },
  ];

  const ptuAmount = ptuConfig.netProfit * (ptuConfig.ptuPercentage / 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Vacaciones y PTU</h2>
          <p className="text-sm text-muted-foreground">
            Gestión de vacaciones y reparto de utilidades conforme a la LFT
          </p>
        </div>
        <Button variant="outline" size="sm">
          <FileDown className="h-4 w-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vacation" className="gap-1">
            <Sun className="h-4 w-4" />
            Vacaciones
          </TabsTrigger>
          <TabsTrigger value="accrual" className="gap-1">
            <Calendar className="h-4 w-4" />
            Acumulación
          </TabsTrigger>
          <TabsTrigger value="ptu" className="gap-1">
            <DollarSign className="h-4 w-4" />
            PTU
          </TabsTrigger>
          <TabsTrigger value="reference" className="gap-1">
            <Calculator className="h-4 w-4" />
            Tabla Referencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vacation" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs text-muted-foreground">Empleados Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Sun className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">2,840</p>
                    <p className="text-xs text-muted-foreground">Días Disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1,120</p>
                    <p className="text-xs text-muted-foreground">Días Tomados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">$485K</p>
                    <p className="text-xs text-muted-foreground">Prima Vacacional</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saldos de Vacaciones por Empleado</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead className="text-center">Años</TableHead>
                    <TableHead className="text-center">Días Derecho</TableHead>
                    <TableHead className="text-center">Tomados</TableHead>
                    <TableHead className="text-center">Restantes</TableHead>
                    <TableHead className="text-right">Prima Vac.</TableHead>
                    <TableHead>Progreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeVacations.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell>{emp.hireDate}</TableCell>
                      <TableCell className="text-center">{emp.yearsWorked}</TableCell>
                      <TableCell className="text-center">{emp.daysEntitled}</TableCell>
                      <TableCell className="text-center">{emp.daysTaken}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={emp.daysRemaining > 0 ? "default" : "secondary"}>
                          {emp.daysRemaining}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${emp.primaAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="w-32">
                        <Progress 
                          value={(emp.daysTaken / emp.daysEntitled) * 100} 
                          className="h-2"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accrual" className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Las vacaciones se acumulan proporcionalmente cada día trabajado. 
              La prima vacacional del 25% se paga al momento de tomar las vacaciones.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de Acumulación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Método de Acumulación</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="anniversary">Por Aniversario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prima Vacacional (%)</Label>
                  <Input type="number" defaultValue="25" />
                </div>
                <div className="space-y-2">
                  <Label>Máximo Acumulable (años)</Label>
                  <Input type="number" defaultValue="2" />
                </div>
              </div>
              <Button>Guardar Configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ptu" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configuración PTU {ptuConfig.fiscalYear}
              </CardTitle>
              <CardDescription>
                Reparto de utilidades conforme al Art. 117-131 de la LFT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Año Fiscal</Label>
                  <Select 
                    value={ptuConfig.fiscalYear} 
                    onValueChange={(v) => setPtuConfig({...ptuConfig, fiscalYear: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Utilidad Neta Fiscal</Label>
                  <Input 
                    type="number" 
                    value={ptuConfig.netProfit}
                    onChange={(e) => setPtuConfig({...ptuConfig, netProfit: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>% a Repartir</Label>
                  <Input 
                    type="number" 
                    value={ptuConfig.ptuPercentage}
                    onChange={(e) => setPtuConfig({...ptuConfig, ptuPercentage: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monto a Repartir</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                    <span className="font-bold text-primary">
                      ${ptuAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">50% por Días Trabajados</p>
                  <p className="text-2xl font-bold text-primary">
                    ${(ptuAmount * 0.5).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Se divide proporcionalmente entre los días trabajados de cada empleado
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm font-medium mb-2">50% por Salarios Devengados</p>
                  <p className="text-2xl font-bold text-primary">
                    ${(ptuAmount * 0.5).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Se divide proporcionalmente entre los salarios devengados en el año
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cálculo PTU por Empleado</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead className="text-center">Días Trabajados</TableHead>
                    <TableHead className="text-right">Salario Anual</TableHead>
                    <TableHead className="text-right">PTU (Días)</TableHead>
                    <TableHead className="text-right">PTU (Salario)</TableHead>
                    <TableHead className="text-right">Total PTU</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptuEmployees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell className="text-center">{emp.daysWorked}</TableCell>
                      <TableCell className="text-right">${emp.annualSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${emp.ptuDays.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${emp.ptuSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        ${emp.totalPTU.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Fecha límite de pago:</strong> El PTU debe pagarse a más tardar el 30 de mayo de cada año.
              Los trabajadores de confianza tienen un tope de PTU equivalente al del trabajador sindicalizado o de base de mayor salario + 20%.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="reference" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tabla de Vacaciones LFT 2023</CardTitle>
              <CardDescription>
                Reforma a la Ley Federal del Trabajo vigente desde enero 2023
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Años de Servicio</TableHead>
                    <TableHead className="text-center">Días de Vacaciones</TableHead>
                    <TableHead className="text-center">Prima Vacacional</TableHead>
                    <TableHead className="text-right">Ejemplo (Salario $20,000)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vacationTable.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.years} año(s)</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{row.days} días</Badge>
                      </TableCell>
                      <TableCell className="text-center">{row.primaPercent}%</TableCell>
                      <TableCell className="text-right">
                        ${((20000 / 30) * row.days * (row.primaPercent / 100)).toLocaleString()}
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