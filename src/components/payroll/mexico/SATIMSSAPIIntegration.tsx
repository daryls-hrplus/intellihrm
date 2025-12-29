import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plug, 
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Settings,
  Shield,
  Clock,
  Activity,
  Zap,
  Lock,
  Database,
  FileText
} from "lucide-react";

interface SATIMSSAPIIntegrationProps {
  companyId: string;
}

export function SATIMSSAPIIntegration({ companyId }: SATIMSSAPIIntegrationProps) {
  const [satConnection, setSatConnection] = useState(true);
  const [imssConnection, setImssConnection] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  const apiConnections = [
    {
      name: "SAT Web Services",
      description: "Servicio de timbrado y validación CFDI",
      status: "connected",
      lastSync: "2025-01-28 14:32:00",
      endpoint: "https://www.sat.gob.mx/ws/",
      uptime: "99.8%"
    },
    {
      name: "IDSE (IMSS)",
      description: "Instituto Mexicano del Seguro Social",
      status: "connected",
      lastSync: "2025-01-28 08:00:00",
      endpoint: "https://idse.imss.gob.mx/",
      uptime: "99.5%"
    },
    {
      name: "SIPARE",
      description: "Sistema de Pago Referenciado",
      status: "connected",
      lastSync: "2025-01-28 12:00:00",
      endpoint: "https://sipare.imss.gob.mx/",
      uptime: "99.2%"
    },
    {
      name: "INFONAVIT",
      description: "Instituto del Fondo Nacional de la Vivienda",
      status: "warning",
      lastSync: "2025-01-27 18:00:00",
      endpoint: "https://servicios.infonavit.org.mx/",
      uptime: "98.5%"
    },
  ];

  const recentTransactions = [
    { type: "CFDI Timbrado", count: 156, status: "success", time: "14:32:00" },
    { type: "Validación RFC", count: 12, status: "success", time: "14:28:00" },
    { type: "Consulta NSS", count: 5, status: "success", time: "14:15:00" },
    { type: "IDSE Movimiento", count: 3, status: "success", time: "12:00:00" },
    { type: "SIPARE Línea Captura", count: 1, status: "success", time: "11:45:00" },
  ];

  const certStatus = [
    { type: "CSD (CFDI)", expiry: "2025-06-15", daysLeft: 138, status: "valid" },
    { type: "e.Firma (FIEL)", expiry: "2025-03-28", daysLeft: 59, status: "warning" },
    { type: "IDSE Certificate", expiry: "2025-08-20", daysLeft: 204, status: "valid" },
  ];

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => setIsTesting(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
      case "success":
      case "valid":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Conectado</Badge>;
      case "warning":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200"><AlertCircle className="h-3 w-3 mr-1" />Atención</Badge>;
      case "error":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Plug className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">SAT/IMSS API Integration</h2>
            <p className="text-sm text-muted-foreground">
              Direct API connections to Mexican government systems
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Test All Connections
              </>
            )}
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">4/4</p>
                <p className="text-xs text-muted-foreground">APIs Conectadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">177</p>
                <p className="text-xs text-muted-foreground">Transacciones Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.5%</p>
                <p className="text-xs text-muted-foreground">Uptime Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Certificados Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">API Connections</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <div className="grid gap-4">
            {apiConnections.map((api) => (
              <Card key={api.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Plug className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{api.name}</p>
                          {getStatusBadge(api.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{api.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Endpoint: <code className="bg-muted px-1 rounded">{api.endpoint}</code>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Uptime: {api.uptime}</p>
                      <p className="text-xs text-muted-foreground">Last sync: {api.lastSync}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent API Transactions</CardTitle>
              <CardDescription>Last 24 hours activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Type</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{tx.type}</TableCell>
                      <TableCell className="text-right">{tx.count}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-600 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Digital Certificates Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certStatus.map((cert) => (
                  <div key={cert.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className={`h-5 w-5 ${cert.status === 'valid' ? 'text-green-500' : 'text-amber-500'}`} />
                      <div>
                        <p className="font-medium">{cert.type}</p>
                        <p className="text-sm text-muted-foreground">Expires: {cert.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={cert.daysLeft > 90 ? "outline" : "destructive"}>
                        {cert.daysLeft} days remaining
                      </Badge>
                      <Button variant="outline" size="sm">
                        Renew
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>SAT Web Services</Label>
                  <p className="text-sm text-muted-foreground">Enable direct SAT API integration</p>
                </div>
                <Switch checked={satConnection} onCheckedChange={setSatConnection} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>IMSS/IDSE Integration</Label>
                  <p className="text-sm text-muted-foreground">Enable IMSS movement automation</p>
                </div>
                <Switch checked={imssConnection} onCheckedChange={setImssConnection} />
              </div>
              <div className="space-y-2">
                <Label>API Rate Limit</Label>
                <Input type="number" defaultValue="100" />
                <p className="text-xs text-muted-foreground">Maximum requests per minute</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
