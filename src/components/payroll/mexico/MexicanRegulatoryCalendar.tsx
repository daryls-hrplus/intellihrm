import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Bell,
  FileText,
  Building2,
  DollarSign,
  Users,
  Download
} from "lucide-react";

interface RegulatoryEvent {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  category: string;
  authority: string;
  status: "completed" | "pending" | "upcoming" | "overdue";
  priority: "high" | "medium" | "low";
}

interface MexicanRegulatoryCalendarProps {
  companyId: string;
}

export function MexicanRegulatoryCalendar({ companyId }: MexicanRegulatoryCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState("2025-02");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const regulatoryEvents: RegulatoryEvent[] = [
    {
      id: "1",
      title: "Pago IMSS (SIPARE)",
      description: "Cuotas obrero-patronales del periodo",
      dueDate: "2025-02-17",
      category: "imss",
      authority: "IMSS",
      status: "pending",
      priority: "high"
    },
    {
      id: "2",
      title: "Declaración ISR Retenciones",
      description: "Retenciones de ISR enero 2025",
      dueDate: "2025-02-17",
      category: "sat",
      authority: "SAT",
      status: "pending",
      priority: "high"
    },
    {
      id: "3",
      title: "Pago ISN Mensual",
      description: "Impuesto Sobre Nóminas estatal",
      dueDate: "2025-02-17",
      category: "state",
      authority: "Gobierno Estatal",
      status: "pending",
      priority: "high"
    },
    {
      id: "4",
      title: "IDSE Movimientos",
      description: "Altas/bajas/modificaciones de enero",
      dueDate: "2025-02-05",
      category: "imss",
      authority: "IMSS",
      status: "completed",
      priority: "medium"
    },
    {
      id: "5",
      title: "Emisión CFDI Nómina",
      description: "Timbrado recibos segunda quincena febrero",
      dueDate: "2025-02-28",
      category: "sat",
      authority: "SAT",
      status: "upcoming",
      priority: "high"
    },
    {
      id: "6",
      title: "Actualización INFONAVIT",
      description: "Descarga de créditos vigentes",
      dueDate: "2025-02-01",
      category: "infonavit",
      authority: "INFONAVIT",
      status: "completed",
      priority: "medium"
    },
    {
      id: "7",
      title: "PTU - Cálculo Anual",
      description: "Preparación cálculo reparto utilidades 2024",
      dueDate: "2025-04-30",
      category: "labor",
      authority: "LFT",
      status: "upcoming",
      priority: "medium"
    },
    {
      id: "8",
      title: "PTU - Pago a Trabajadores",
      description: "Fecha límite pago PTU 2024",
      dueDate: "2025-05-30",
      category: "labor",
      authority: "LFT",
      status: "upcoming",
      priority: "high"
    },
  ];

  const categories = [
    { value: "all", label: "Todas las categorías" },
    { value: "imss", label: "IMSS" },
    { value: "sat", label: "SAT" },
    { value: "infonavit", label: "INFONAVIT" },
    { value: "state", label: "Estatal" },
    { value: "labor", label: "Laboral" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Completado</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200"><CalendarIcon className="h-3 w-3 mr-1" />Próximo</Badge>;
      case "overdue":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Vencido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-4 border-l-red-500";
      case "medium": return "border-l-4 border-l-amber-500";
      case "low": return "border-l-4 border-l-blue-500";
      default: return "";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "imss": return <Building2 className="h-4 w-4" />;
      case "sat": return <FileText className="h-4 w-4" />;
      case "infonavit": return <Users className="h-4 w-4" />;
      case "state": return <DollarSign className="h-4 w-4" />;
      case "labor": return <Users className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const filteredEvents = selectedCategory === "all" 
    ? regulatoryEvents 
    : regulatoryEvents.filter(e => e.category === selectedCategory);

  const upcomingDeadlines = regulatoryEvents.filter(e => e.status === "pending" || e.status === "upcoming").slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Mexican Regulatory Calendar</h2>
            <p className="text-sm text-muted-foreground">
              Complete calendar of Mexican payroll obligations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">Enero 2025</SelectItem>
              <SelectItem value="2025-02">Febrero 2025</SelectItem>
              <SelectItem value="2025-03">Marzo 2025</SelectItem>
              <SelectItem value="2025-04">Abril 2025</SelectItem>
              <SelectItem value="2025-05">Mayo 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Set Reminders
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Upcoming Deadlines Alert */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Próximas Obligaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {upcomingDeadlines.map((event) => (
              <div key={event.id} className="flex items-center gap-2 p-2 bg-background rounded-lg border">
                {getCategoryIcon(event.category)}
                <span className="text-sm font-medium">{event.title}</span>
                <Badge variant="outline" className="text-xs">{event.dueDate}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="by-authority">Por Autoridad</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className={getPriorityColor(event.priority)}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        {getCategoryIcon(event.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{event.title}</p>
                          {getStatusBadge(event.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Autoridad: {event.authority}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{event.dueDate}</p>
                      <p className="text-xs text-muted-foreground">Fecha límite</p>
                      {event.status === "pending" && (
                        <Button variant="outline" size="sm" className="mt-2">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Marcar Completo
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-authority" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {["IMSS", "SAT", "INFONAVIT", "Gobierno Estatal"].map((authority) => (
              <Card key={authority}>
                <CardHeader>
                  <CardTitle className="text-lg">{authority}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {regulatoryEvents
                      .filter(e => e.authority === authority || 
                        (authority === "Gobierno Estatal" && e.category === "state"))
                      .map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.dueDate}</p>
                          </div>
                          {getStatusBadge(event.status)}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
