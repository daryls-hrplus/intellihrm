import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Search, 
  Download, 
  Filter,
  CalendarIcon,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AuditTrailProps {
  companyId: string;
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  severity: "info" | "warning" | "critical";
}

const ACTION_TYPES = [
  { value: "all", label: "Todas las acciones" },
  { value: "create", label: "Creación" },
  { value: "update", label: "Modificación" },
  { value: "delete", label: "Eliminación" },
  { value: "approve", label: "Aprobación" },
  { value: "reject", label: "Rechazo" },
  { value: "export", label: "Exportación" },
  { value: "cfdi_stamp", label: "Timbrado CFDI" },
  { value: "cfdi_cancel", label: "Cancelación CFDI" },
  { value: "payroll_run", label: "Corrida de nómina" },
];

const ENTITY_TYPES = [
  { value: "all", label: "Todas las entidades" },
  { value: "payroll_run", label: "Corrida de Nómina" },
  { value: "payslip", label: "Recibo de Nómina" },
  { value: "cfdi", label: "CFDI" },
  { value: "employee", label: "Empleado" },
  { value: "adjustment", label: "Ajuste" },
  { value: "sua_file", label: "Archivo SUA" },
  { value: "idse_file", label: "Archivo IDSE" },
];

export function AuditTrail({ companyId }: AuditTrailProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  useEffect(() => {
    fetchAuditEntries();
  }, [companyId, actionFilter, entityFilter, dateFrom, dateTo]);

  const fetchAuditEntries = async () => {
    setLoading(true);
    try {
      // Mock audit data
      const mockEntries: AuditEntry[] = [
        {
          id: "1",
          timestamp: new Date(),
          user_id: "user1",
          user_name: "Admin Usuario",
          action: "payroll_run",
          entity_type: "payroll_run",
          entity_id: "pr-001",
          entity_name: "Nómina Enero 2024",
          old_values: null,
          new_values: { status: "completed", employees: 125, total: 2500000 },
          ip_address: "192.168.1.100",
          user_agent: "Chrome/Windows",
          severity: "info",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 3600000),
          user_id: "user1",
          user_name: "Admin Usuario",
          action: "cfdi_stamp",
          entity_type: "cfdi",
          entity_id: "cfdi-001",
          entity_name: "CFDI Juan Pérez",
          old_values: null,
          new_values: { uuid: "ABC123", status: "timbrado" },
          ip_address: "192.168.1.100",
          user_agent: "Chrome/Windows",
          severity: "info",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 7200000),
          user_id: "user2",
          user_name: "HR Manager",
          action: "update",
          entity_type: "employee",
          entity_id: "emp-001",
          entity_name: "María García",
          old_values: { salary: 25000 },
          new_values: { salary: 28000 },
          ip_address: "192.168.1.101",
          user_agent: "Firefox/Mac",
          severity: "warning",
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 86400000),
          user_id: "user1",
          user_name: "Admin Usuario",
          action: "cfdi_cancel",
          entity_type: "cfdi",
          entity_id: "cfdi-002",
          entity_name: "CFDI Pedro López",
          old_values: { status: "timbrado" },
          new_values: { status: "cancelado", reason: "Error en datos" },
          ip_address: "192.168.1.100",
          user_agent: "Chrome/Windows",
          severity: "critical",
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 172800000),
          user_id: "user3",
          user_name: "Payroll Operator",
          action: "export",
          entity_type: "sua_file",
          entity_id: "sua-001",
          entity_name: "SUA Enero 2024",
          old_values: null,
          new_values: { records: 125, file_size: "45KB" },
          ip_address: "192.168.1.102",
          user_agent: "Edge/Windows",
          severity: "info",
        },
      ];

      let filtered = mockEntries;

      if (actionFilter !== "all") {
        filtered = filtered.filter(e => e.action === actionFilter);
      }
      if (entityFilter !== "all") {
        filtered = filtered.filter(e => e.entity_type === entityFilter);
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(e => 
          e.user_name.toLowerCase().includes(term) ||
          e.entity_name.toLowerCase().includes(term) ||
          e.action.toLowerCase().includes(term)
        );
      }

      setEntries(filtered);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLog = () => {
    const headers = ["Fecha", "Usuario", "Acción", "Entidad", "Nombre", "IP", "Severidad"];
    const rows = entries.map(e => [
      format(e.timestamp, "yyyy-MM-dd HH:mm:ss"),
      e.user_name,
      e.action,
      e.entity_type,
      e.entity_name,
      e.ip_address,
      e.severity,
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_log_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado",
      description: "Registro de auditoría descargado",
    });
  };

  const getSeverityBadge = (severity: AuditEntry["severity"]) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Crítico</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-amber-500 text-white"><Clock className="h-3 w-3 mr-1" />Advertencia</Badge>;
      default:
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Info</Badge>;
    }
  };

  const getActionLabel = (action: string) => {
    const found = ACTION_TYPES.find(a => a.value === action);
    return found?.label || action;
  };

  const getEntityLabel = (entity: string) => {
    const found = ENTITY_TYPES.find(e => e.value === entity);
    return found?.label || entity;
  };

  const criticalCount = entries.filter(e => e.severity === "critical").length;
  const warningCount = entries.filter(e => e.severity === "warning").length;
  const todayCount = entries.filter(e => 
    format(e.timestamp, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Auditoría y Cumplimiento
        </CardTitle>
        <CardDescription>
          Registro completo de todas las acciones en el módulo de nómina mexicana
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Registros</div>
            <div className="text-2xl font-bold">{entries.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Hoy</div>
            <div className="text-2xl font-bold text-blue-600">{todayCount}</div>
          </Card>
          <Card className="p-4 border-amber-200">
            <div className="text-sm text-muted-foreground">Advertencias</div>
            <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
          </Card>
          <Card className="p-4 border-red-200">
            <div className="text-sm text-muted-foreground">Críticos</div>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2 flex-1 max-w-xs">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Usuario, entidad, acción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Acción</Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Entidad</Label>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((e) => (
                  <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Desde</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-32", !dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, "dd/MM/yy") : "Fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" onClick={fetchAuditEntries} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="outline" onClick={exportAuditLog}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Audit Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha/Hora</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Severidad</TableHead>
              <TableHead>Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className={entry.severity === "critical" ? "bg-red-50 dark:bg-red-950" : ""}>
                <TableCell className="font-mono text-sm">
                  {format(entry.timestamp, "dd/MM/yy HH:mm")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {entry.user_name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getActionLabel(entry.action)}</Badge>
                </TableCell>
                <TableCell>{getEntityLabel(entry.entity_type)}</TableCell>
                <TableCell className="font-medium">{entry.entity_name}</TableCell>
                <TableCell className="font-mono text-xs">{entry.ip_address}</TableCell>
                <TableCell>{getSeverityBadge(entry.severity)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <FileText className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Detail Panel */}
        {selectedEntry && (
          <Card className="p-4 bg-muted/30">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium">Detalles del Registro</h4>
              <Button size="sm" variant="ghost" onClick={() => setSelectedEntry(null)}>
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">ID</Label>
                <p className="font-mono">{selectedEntry.id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Timestamp</Label>
                <p>{format(selectedEntry.timestamp, "PPpp", { locale: es })}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">User Agent</Label>
                <p>{selectedEntry.user_agent}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Entity ID</Label>
                <p className="font-mono">{selectedEntry.entity_id}</p>
              </div>
              {selectedEntry.old_values && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Valores Anteriores</Label>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedEntry.old_values, null, 2)}
                  </pre>
                </div>
              )}
              {selectedEntry.new_values && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Valores Nuevos</Label>
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedEntry.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Compliance Info */}
        <div className="p-4 bg-muted rounded-lg text-sm">
          <div className="font-medium mb-2">Requisitos de Cumplimiento:</div>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Los registros de auditoría se conservan por 5 años conforme a la normativa fiscal</li>
            <li>Todas las acciones críticas requieren autenticación de dos factores</li>
            <li>Los exports de datos sensibles quedan registrados automáticamente</li>
            <li>Las cancelaciones de CFDI requieren justificación documentada</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
