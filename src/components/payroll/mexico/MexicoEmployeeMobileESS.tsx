import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Smartphone, 
  FileText, 
  Download,
  Bell,
  QrCode,
  Shield,
  Clock,
  CheckCircle2,
  DollarSign,
  Calendar,
  Eye,
  Settings
} from "lucide-react";

interface MexicoEmployeeMobileESSProps {
  employeeId: string;
}

export function MexicoEmployeeMobileESS({ employeeId }: MexicoEmployeeMobileESSProps) {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(true);

  const mobileFeatures = [
    {
      icon: FileText,
      title: "CFDI Payslips",
      description: "View and download timbrado receipts",
      status: "active"
    },
    {
      icon: Download,
      title: "XML Download",
      description: "Download SAT-compliant XML files",
      status: "active"
    },
    {
      icon: Calendar,
      title: "PTU Statement",
      description: "View profit sharing calculation",
      status: "active"
    },
    {
      icon: DollarSign,
      title: "Aguinaldo Tracker",
      description: "Track 13th month bonus accrual",
      status: "active"
    },
    {
      icon: Clock,
      title: "Vacation Balance",
      description: "View vacation days and premium",
      status: "active"
    },
    {
      icon: Shield,
      title: "IMSS History",
      description: "Social security contribution history",
      status: "active"
    },
  ];

  const recentNotifications = [
    { type: "payslip", message: "Tu recibo de nómina de Enero 2025 está disponible", time: "2h ago" },
    { type: "cfdi", message: "CFDI timbrado exitosamente - Folio fiscal: ABC123", time: "2h ago" },
    { type: "infonavit", message: "Actualización de saldo INFONAVIT disponible", time: "1d ago" },
    { type: "ptu", message: "Cálculo de PTU 2024 publicado", time: "3d ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Employee Mobile ESS (Mexico)</h2>
            <p className="text-sm text-muted-foreground">
              Mobile self-service for Mexican payroll documents
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-2" />
          Generate App QR
        </Button>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Mobile Features</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">App Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {mobileFeatures.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{feature.title}</p>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mobile App Preview</CardTitle>
              <CardDescription>How employees see their payroll information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="w-72 border-4 border-foreground/20 rounded-3xl p-2 bg-background">
                  <div className="bg-muted rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Mi Nómina</span>
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="bg-background rounded-lg p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Último recibo</p>
                      <p className="font-bold text-lg">$24,580.00 MXN</p>
                      <p className="text-xs text-muted-foreground">Enero 2025 - Quincena 2</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Ver CFDI
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        XML
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Push Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentNotifications.map((notif, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
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
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                App Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send payroll alerts to employees</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Biometric Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require Face ID / fingerprint</p>
                </div>
                <Switch checked={biometricAuth} onCheckedChange={setBiometricAuth} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
