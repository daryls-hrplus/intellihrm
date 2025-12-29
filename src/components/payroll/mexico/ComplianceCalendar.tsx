import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  CalendarDays, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building2,
  FileText,
  DollarSign,
  Users
} from "lucide-react";
import { format, addDays, isBefore, isAfter, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface ComplianceCalendarProps {
  companyId: string;
}

interface ComplianceDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  entity: "SAT" | "IMSS" | "INFONAVIT" | "FONACOT" | "Internal";
  type: "declaration" | "payment" | "report" | "filing";
  frequency: "monthly" | "bimonthly" | "quarterly" | "annual";
  status: "pending" | "completed" | "overdue" | "upcoming";
  reminder: boolean;
  daysBeforeReminder: number;
}

const COMPLIANCE_DEADLINES: ComplianceDeadline[] = [
  {
    id: "1",
    title: "Declaración Provisional ISR",
    description: "Pago provisional de ISR por sueldos y salarios",
    dueDate: new Date(2024, 0, 17),
    entity: "SAT",
    type: "payment",
    frequency: "monthly",
    status: "pending",
    reminder: true,
    daysBeforeReminder: 5,
  },
  {
    id: "2",
    title: "Pago de Cuotas IMSS",
    description: "Pago de cuotas obrero-patronales al IMSS",
    dueDate: new Date(2024, 0, 17),
    entity: "IMSS",
    type: "payment",
    frequency: "monthly",
    status: "pending",
    reminder: true,
    daysBeforeReminder: 5,
  },
  {
    id: "3",
    title: "Pago INFONAVIT",
    description: "Pago de aportaciones al INFONAVIT",
    dueDate: new Date(2024, 0, 17),
    entity: "INFONAVIT",
    type: "payment",
    frequency: "bimonthly",
    status: "pending",
    reminder: true,
    daysBeforeReminder: 5,
  },
  {
    id: "4",
    title: "Presentación SUA",
    description: "Presentar archivo SUA con movimientos del mes",
    dueDate: new Date(2024, 0, 20),
    entity: "IMSS",
    type: "filing",
    frequency: "monthly",
    status: "pending",
    reminder: true,
    daysBeforeReminder: 3,
  },
  {
    id: "5",
    title: "Declaración Informativa Múltiple (DIM)",
    description: "Declaración anual de retenciones",
    dueDate: new Date(2024, 1, 15),
    entity: "SAT",
    type: "declaration",
    frequency: "annual",
    status: "pending",
    reminder: true,
    daysBeforeReminder: 30,
  },
  {
    id: "6",
    title: "Entrega de Constancias de Retenciones",
    description: "Entregar constancias a empleados",
    dueDate: new Date(2024, 1, 28),
    entity: "Internal",
    type: "report",
    frequency: "annual",
    status: "pending",
    reminder: true,
    daysBeforeReminder: 15,
  },
  {
    id: "7",
    title: "Pago de PTU",
    description: "Reparto de utilidades a trabajadores",
    dueDate: new Date(2024, 4, 30),
    entity: "Internal",
    type: "payment",
    frequency: "annual",
    status: "pending",
    reminder: true,
    daysBeforeReminder: 30,
  },
  {
    id: "8",
    title: "Pago de Aguinaldo",
    description: "Pago de aguinaldo antes del 20 de diciembre",
    dueDate: new Date(2024, 11, 20),
    entity: "Internal",
    type: "payment",
    frequency: "annual",
    status: "pending",
    reminder: true,
    daysBeforeReminder: 30,
  },
];

export function ComplianceCalendar({ companyId }: ComplianceCalendarProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [showReminders, setShowReminders] = useState(true);

  useEffect(() => {
    // Generate deadlines for the current year
    generateYearlyDeadlines();
  }, []);

  const generateYearlyDeadlines = () => {
    const year = new Date().getFullYear();
    const generatedDeadlines: ComplianceDeadline[] = [];

    // Monthly deadlines (ISR, IMSS payments on the 17th)
    for (let month = 0; month < 12; month++) {
      generatedDeadlines.push({
        id: `isr-${month}`,
        title: "Declaración Provisional ISR",
        description: `Pago provisional de ISR - ${format(new Date(year, month), "MMMM yyyy", { locale: es })}`,
        dueDate: new Date(year, month, 17),
        entity: "SAT",
        type: "payment",
        frequency: "monthly",
        status: getDeadlineStatus(new Date(year, month, 17)),
        reminder: true,
        daysBeforeReminder: 5,
      });

      generatedDeadlines.push({
        id: `imss-${month}`,
        title: "Pago de Cuotas IMSS",
        description: `Cuotas obrero-patronales - ${format(new Date(year, month), "MMMM yyyy", { locale: es })}`,
        dueDate: new Date(year, month, 17),
        entity: "IMSS",
        type: "payment",
        frequency: "monthly",
        status: getDeadlineStatus(new Date(year, month, 17)),
        reminder: true,
        daysBeforeReminder: 5,
      });

      generatedDeadlines.push({
        id: `sua-${month}`,
        title: "Presentación SUA",
        description: `Archivo SUA - ${format(new Date(year, month), "MMMM yyyy", { locale: es })}`,
        dueDate: new Date(year, month, 20),
        entity: "IMSS",
        type: "filing",
        frequency: "monthly",
        status: getDeadlineStatus(new Date(year, month, 20)),
        reminder: true,
        daysBeforeReminder: 3,
      });
    }

    // Bimonthly INFONAVIT (odd months)
    [0, 2, 4, 6, 8, 10].forEach((month) => {
      generatedDeadlines.push({
        id: `infonavit-${month}`,
        title: "Pago INFONAVIT",
        description: `Aportaciones bimestrales - Bimestre ${Math.floor(month / 2) + 1}`,
        dueDate: new Date(year, month + 1, 17),
        entity: "INFONAVIT",
        type: "payment",
        frequency: "bimonthly",
        status: getDeadlineStatus(new Date(year, month + 1, 17)),
        reminder: true,
        daysBeforeReminder: 5,
      });
    });

    // Annual deadlines
    generatedDeadlines.push(
      {
        id: "dim",
        title: "Declaración Informativa Múltiple",
        description: "DIM - Declaración anual de retenciones",
        dueDate: new Date(year, 1, 15),
        entity: "SAT",
        type: "declaration",
        frequency: "annual",
        status: getDeadlineStatus(new Date(year, 1, 15)),
        reminder: true,
        daysBeforeReminder: 30,
      },
      {
        id: "constancias",
        title: "Constancias de Retenciones",
        description: "Entrega de constancias a empleados",
        dueDate: new Date(year, 1, 28),
        entity: "Internal",
        type: "report",
        frequency: "annual",
        status: getDeadlineStatus(new Date(year, 1, 28)),
        reminder: true,
        daysBeforeReminder: 15,
      },
      {
        id: "ptu",
        title: "Pago de PTU",
        description: "Reparto de utilidades a trabajadores",
        dueDate: new Date(year, 4, 30),
        entity: "Internal",
        type: "payment",
        frequency: "annual",
        status: getDeadlineStatus(new Date(year, 4, 30)),
        reminder: true,
        daysBeforeReminder: 30,
      },
      {
        id: "aguinaldo",
        title: "Pago de Aguinaldo",
        description: "Aguinaldo antes del 20 de diciembre",
        dueDate: new Date(year, 11, 20),
        entity: "Internal",
        type: "payment",
        frequency: "annual",
        status: getDeadlineStatus(new Date(year, 11, 20)),
        reminder: true,
        daysBeforeReminder: 30,
      }
    );

    setDeadlines(generatedDeadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
  };

  const getDeadlineStatus = (date: Date): ComplianceDeadline["status"] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isBefore(date, today)) return "overdue";
    if (isBefore(date, addDays(today, 7))) return "upcoming";
    return "pending";
  };

  const getStatusBadge = (status: ComplianceDeadline["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completado</Badge>;
      case "overdue":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Vencido</Badge>;
      case "upcoming":
        return <Badge variant="secondary" className="bg-amber-500 text-white"><Clock className="h-3 w-3 mr-1" />Próximo</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  const getEntityIcon = (entity: ComplianceDeadline["entity"]) => {
    switch (entity) {
      case "SAT":
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case "IMSS":
        return <Users className="h-4 w-4 text-green-600" />;
      case "INFONAVIT":
        return <Building2 className="h-4 w-4 text-orange-600" />;
      case "FONACOT":
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-600" />;
    }
  };

  const markAsCompleted = (id: string) => {
    setDeadlines(deadlines.map(d => 
      d.id === id ? { ...d, status: "completed" as const } : d
    ));
    toast({
      title: "Marcado como completado",
      description: "La obligación ha sido registrada como cumplida",
    });
  };

  const filteredDeadlines = deadlines.filter(d => {
    if (filterEntity !== "all" && d.entity !== filterEntity) return false;
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    return d.dueDate >= monthStart && d.dueDate <= monthEnd;
  });

  const upcomingDeadlines = deadlines
    .filter(d => d.status === "upcoming" || d.status === "overdue")
    .slice(0, 5);

  const overdueCount = deadlines.filter(d => d.status === "overdue").length;
  const upcomingCount = deadlines.filter(d => d.status === "upcoming").length;
  const completedCount = deadlines.filter(d => d.status === "completed").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Calendario de Cumplimiento Fiscal
        </CardTitle>
        <CardDescription>
          Gestione sus obligaciones fiscales y laborales con el SAT, IMSS e INFONAVIT
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Vencidos</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </Card>
          <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-950">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Próximos 7 días</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">{upcomingCount}</div>
          </Card>
          <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Completados</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="font-medium">Recordatorios</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Switch checked={showReminders} onCheckedChange={setShowReminders} />
              <Label className="text-sm">{showReminders ? "Activos" : "Inactivos"}</Label>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4 items-center">
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="SAT">SAT</SelectItem>
                  <SelectItem value="IMSS">IMSS</SelectItem>
                  <SelectItem value="INFONAVIT">INFONAVIT</SelectItem>
                  <SelectItem value="Internal">Interno</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth(addDays(selectedMonth, -30))}
                >
                  ← Anterior
                </Button>
                <Button variant="outline" size="sm" disabled>
                  {format(selectedMonth, "MMMM yyyy", { locale: es })}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth(addDays(selectedMonth, 30))}
                >
                  Siguiente →
                </Button>
              </div>
            </div>

            {/* Deadlines Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Obligación</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeadlines.map((deadline) => (
                  <TableRow key={deadline.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEntityIcon(deadline.entity)}
                        <span className="font-medium">{deadline.entity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deadline.title}</div>
                        <div className="text-xs text-muted-foreground">{deadline.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono">
                        {format(deadline.dueDate, "dd/MM/yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {deadline.frequency === "monthly" ? "Mensual" :
                         deadline.frequency === "bimonthly" ? "Bimestral" :
                         deadline.frequency === "quarterly" ? "Trimestral" : "Anual"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(deadline.status)}</TableCell>
                    <TableCell>
                      {deadline.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsCompleted(deadline.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                locale={es}
              />
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <h3 className="font-medium">Próximas Obligaciones</h3>
            {upcomingDeadlines.map((deadline) => (
              <Card key={deadline.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getEntityIcon(deadline.entity)}
                    <div>
                      <div className="font-medium">{deadline.title}</div>
                      <div className="text-sm text-muted-foreground">{deadline.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{format(deadline.dueDate, "dd/MM/yyyy")}</div>
                    {getStatusBadge(deadline.status)}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
