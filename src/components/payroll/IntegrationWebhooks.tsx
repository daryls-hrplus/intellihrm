import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Bell,
  Settings,
  Key
} from "lucide-react";
import { toast } from "sonner";

interface IntegrationWebhooksProps {
  companyId?: string;
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
      name: "ERP System",
      url: "https://erp.company.com/api/payroll/webhook",
      events: ["payroll.completed", "payroll.approved"],
      isActive: true,
      secret: "whsec_abc123...",
      lastTriggered: "2025-01-15 14:30",
      successRate: 98.5,
      totalCalls: 156
    },
    {
      id: "2",
      name: "Accounting System",
      url: "https://accounting.company.com/hooks/payroll",
      events: ["payroll.finalized", "journal.created"],
      isActive: true,
      secret: "whsec_def456...",
      lastTriggered: "2025-01-15 14:30",
      successRate: 100,
      totalCalls: 89
    },
    {
      id: "3",
      name: "Slack Notifications",
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
    { category: "Payroll", events: [
      { id: "payroll.created", label: "Payroll Created" },
      { id: "payroll.approved", label: "Payroll Approved" },
      { id: "payroll.completed", label: "Payroll Completed" },
      { id: "payroll.error", label: "Payroll Error" }
    ]},
    { category: "Payments", events: [
      { id: "payment.processed", label: "Payment Processed" },
      { id: "payment.failed", label: "Payment Failed" },
      { id: "journal.created", label: "Journal Entry Created" }
    ]},
    { category: "Employees", events: [
      { id: "employee.hired", label: "Employee Hired" },
      { id: "employee.terminated", label: "Employee Terminated" },
      { id: "employee.salary_changed", label: "Salary Changed" }
    ]},
    { category: "Compliance", events: [
      { id: "compliance.alert", label: "Compliance Alert" },
      { id: "compliance.deadline", label: "Deadline Approaching" }
    ]}
  ];

  const webhookLogs = [
    { id: "1", webhook: "ERP System", event: "payroll.completed", status: "success", timestamp: "2025-01-15 14:30:22", duration: "245ms" },
    { id: "2", webhook: "Accounting System", event: "journal.created", status: "success", timestamp: "2025-01-15 14:30:18", duration: "180ms" },
    { id: "3", webhook: "ERP System", event: "payroll.approved", status: "success", timestamp: "2025-01-15 14:00:05", duration: "312ms" },
    { id: "4", webhook: "Slack Notifications", event: "payroll.error", status: "failed", timestamp: "2025-01-10 09:15:33", duration: "5002ms" },
    { id: "5", webhook: "Accounting System", event: "journal.created", status: "success", timestamp: "2025-01-14 16:45:11", duration: "156ms" },
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
    toast.success("Webhook status updated");
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast.success("Webhook deleted");
  };

  const testWebhook = (webhook: WebhookConfig) => {
    toast.info(`Sending test event to ${webhook.name}...`);
    setTimeout(() => {
      toast.success(`Webhook ${webhook.name} responded successfully`);
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
    toast.success("Webhook created successfully");
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
          <h2 className="text-xl font-semibold">Integrations & Webhooks</h2>
          <p className="text-sm text-muted-foreground">
            Configure automatic notifications to external systems
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Configure an endpoint to receive event notifications
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Webhook Name</Label>
                  <Input 
                    placeholder="E.g., ERP System"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endpoint URL</Label>
                  <Input 
                    placeholder="https://..."
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subscribe to Events</Label>
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
                Cancel
              </Button>
              <Button 
                onClick={createWebhook} 
                disabled={!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0}
              >
                Create Webhook
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
            History
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1">
            <Bell className="h-4 w-4" />
            Events
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
                        {webhook.isActive ? "Active" : "Inactive"}
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
                    <p className="text-xs text-muted-foreground mb-1">Subscribed Events</p>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((e, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Last Triggered</p>
                    <p className="text-sm">{webhook.lastTriggered || "Never"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                    <p className="text-sm font-medium">
                      <span className={webhook.successRate >= 95 ? "text-green-600" : "text-orange-500"}>
                        {webhook.successRate}%
                      </span>
                      <span className="text-muted-foreground ml-1">
                        ({webhook.totalCalls} calls)
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
                      Test
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
                        toast.success("Secret copied to clipboard");
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Secret
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
                <CardTitle className="text-lg">Call History</CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
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
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Failed
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
              <CardTitle className="text-lg">Available Events Catalog</CardTitle>
              <CardDescription>
                Events you can subscribe to in your webhooks
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
                            <Copy className="h-4 w-4" />
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
