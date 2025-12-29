import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Webhook, 
  Plus, 
  Play, 
  Trash2, 
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Copy,
  ExternalLink,
  Bell,
  Settings,
  Key
} from "lucide-react";
import { toast } from "sonner";

interface IntegrationWebhooksProps {
  companyId: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastTriggered: string | null;
  successRate: number;
  totalCalls: number;
}

export function IntegrationWebhooks({ companyId }: IntegrationWebhooksProps) {
  const [activeTab, setActiveTab] = useState("webhooks");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: "1",
      name: "ERP Principal",
      url: "https://erp.empresa.com/api/payroll/webhook",
      events: ["payroll.completed", "payroll.approved"],
      isActive: true,
      secret: "whsec_abc123...",
      lastTriggered: "2025-01-15 14:30",
      successRate: 98.5,
      totalCalls: 156
    },
    {
      id: "2",
      name: "Sistema Contable",
      url: "https://contabilidad.empresa.com/hooks/nomina",
      events: ["cfdi.stamped", "cfdi.cancelled"],
      isActive: true,
      secret: "whsec_def456...",
      lastTriggered: "2025-01-15 14:30",
      successRate: 100,
      totalCalls: 89
    },
    {
      id: "3",
      name: "Notificaciones Slack",
      url: "https://hooks.slack.com/services/T00/B00/xxx",
      events: ["payroll.error", "compliance.alert"],
      isActive: false,
      secret: "whsec_ghi789...",
      lastTriggered: "2025-01-10 09:15",
      successRate: 95.2,
      totalCalls: 42
    }
  ]);

  const availableEvents = [
    { category: "Nómina", events: [
      { id: "payroll.created", label: "Nómina Creada" },
      { id: "payroll.approved", label: "Nómina Aprobada" },
      { id: "payroll.completed", label: "Nómina Completada" },
      { id: "payroll.error", label: "Error en Nómina" }
    ]},
    { category: "CFDI", events: [
      { id: "cfdi.stamped", label: "CFDI Timbrado" },
      { id: "cfdi.cancelled", label: "CFDI Cancelado" },
      { id: "cfdi.error", label: "Error en Timbrado" }
    ]},
    { category: "Empleados", events: [
      { id: "employee.hired", label: "Alta de Empleado" },
      { id: "employee.terminated", label: "Baja de Empleado" },
      { id: "employee.salary_changed", label: "Cambio Salarial" }
    ]},
    { category: "Cumplimiento", events: [
      { id: "compliance.alert", label: "Alerta de Cumplimiento" },
      { id: "compliance.deadline", label: "Fecha Límite Próxima" }
    ]}
  ];

  const webhookLogs = [
    { id: "1", webhook: "ERP Principal", event: "payroll.completed", status: "success", timestamp: "2025-01-15 14:30:22", duration: "245ms" },
    { id: "2", webhook: "Sistema Contable", event: "cfdi.stamped", status: "success", timestamp: "2025-01-15 14:30:18", duration: "180ms" },
    { id: "3", webhook: "ERP Principal", event: "payroll.approved", status: "success", timestamp: "2025-01-15 14:00:05", duration: "312ms" },
    { id: "4", webhook: "Notificaciones Slack", event: "payroll.error", status: "failed", timestamp: "2025-01-10 09:15:33", duration: "5002ms" },
    { id: "5", webhook: "Sistema Contable", event: "cfdi.stamped", status: "success", timestamp: "2025-01-14 16:45:11", duration: "156ms" },
  ];

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[]
  });

  const toggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    ));
    toast.success("Estado del webhook actualizado");
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success("Webhook eliminado");
  };

  const testWebhook = (webhook: WebhookConfig) => {
    toast.info(`Enviando evento de prueba a ${webhook.name}...`);
    setTimeout(() => {
      toast.success(`Webhook ${webhook.name} respondió correctamente`);
    }, 1500);
  };

  const createWebhook = () => {
    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      isActive: true,
      secret: `whsec_${Math.random().toString(36).substring(7)}`,
      lastTriggered: null,
      successRate: 0,
      totalCalls: 0
    };
    setWebhooks([...webhooks, webhook]);
    setIsCreateOpen(false);
    setNewWebhook({ name: "", url: "", events: [] });
    toast.success("Webhook creado correctamente");
  };

  const toggleEvent = (eventId: string) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Integraciones y Webhooks</h2>
          <p className="text-sm text-muted-foreground">
            Configure notificaciones automáticas a sistemas externos
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Webhook</DialogTitle>
              <DialogDescription>
                Configure un endpoint para recibir notificaciones de eventos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre del Webhook</Label>
                  <Input 
                    placeholder="Ej: Sistema ERP"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL del Endpoint</Label>
                  <Input 
                    placeholder="https://..."
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Eventos a Suscribir</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  {availableEvents.map((category) => (
                    <div key={category.category} className="mb-4 last:mb-0">
                      <p className="font-medium text-sm mb-2">{category.category}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {category.events.map((event) => (
                          <div 
                            key={event.id} 
                            className="flex items-center space-x-2"
                          >
                            <Checkbox 
                              id={event.id}
                              checked={newWebhook.events.includes(event.id)}
                              onCheckedChange={() => toggleEvent(event.id)}
                            />
                            <label 
                              htmlFor={event.id}
                              className="text-sm cursor-pointer"
                            >
                              {event.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={createWebhook} 
                disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
              >
                Crear Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="webhooks" className="gap-1">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1">
            <Bell className="h-4 w-4" />
            Eventos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{webhook.name}</CardTitle>
                      <Badge variant={webhook.isActive ? "default" : "secondary"}>
                        {webhook.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription className="font-mono text-xs">
                      {webhook.url}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={webhook.isActive}
                      onCheckedChange={() => toggleWebhook(webhook.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Eventos Suscritos</p>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((e, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Último Disparo</p>
                    <p className="text-sm">{webhook.lastTriggered || "Nunca"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tasa de Éxito</p>
                    <p className="text-sm font-medium">
                      <span className={webhook.successRate >= 95 ? "text-green-600" : "text-orange-500"}>
                        {webhook.successRate}%
                      </span>
                      <span className="text-muted-foreground ml-1">
                        ({webhook.totalCalls} llamadas)
                      </span>
                    </p>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testWebhook(webhook)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Probar
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Key className="h-4 w-4" />
                      <span>Secret: {webhook.secret.substring(0, 15)}...</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(webhook.secret);
                        toast.success("Secret copiado al portapapeles");
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar Secret
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Historial de Llamadas</CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead className="text-right">Duración</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.webhook}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.event}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.status === "success" ? (
                          <Badge variant="default" className="bg-green-500 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Éxito
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell className="text-right">{log.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Catálogo de Eventos Disponibles</CardTitle>
              <CardDescription>
                Eventos que puede suscribir en sus webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {availableEvents.map((category) => (
                  <div key={category.category} className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {category.category}
                    </h4>
                    <div className="space-y-2">
                      {category.events.map((event) => (
                        <div 
                          key={event.id}
                          className="p-3 border rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-sm">{event.label}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {event.id}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}