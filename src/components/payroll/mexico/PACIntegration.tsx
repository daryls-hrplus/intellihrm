import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Save,
  TestTube,
  Shield,
  FileText,
  ExternalLink
} from "lucide-react";

interface PACIntegrationProps {
  companyId: string;
}

interface PACProvider {
  id: string;
  name: string;
  code: string;
  website: string;
  status: "active" | "inactive" | "pending";
  features: string[];
}

const PAC_PROVIDERS: PACProvider[] = [
  {
    id: "1",
    name: "Finkok",
    code: "FINKOK",
    website: "https://www.finkok.com",
    status: "active",
    features: ["Timbrado", "Cancelación", "Retenciones", "Nómina"],
  },
  {
    id: "2",
    name: "Digisat",
    code: "DIGISAT",
    website: "https://www.digisat.com.mx",
    status: "active",
    features: ["Timbrado", "Cancelación", "Nómina"],
  },
  {
    id: "3",
    name: "Edicom",
    code: "EDICOM",
    website: "https://www.edicom.mx",
    status: "active",
    features: ["Timbrado", "Cancelación", "Retenciones", "Nómina", "Comercio Exterior"],
  },
  {
    id: "4",
    name: "SW Sapien",
    code: "SWSAPIEN",
    website: "https://sw.com.mx",
    status: "active",
    features: ["Timbrado", "Cancelación", "Nómina"],
  },
  {
    id: "5",
    name: "Facturama",
    code: "FACTURAMA",
    website: "https://www.facturama.mx",
    status: "active",
    features: ["Timbrado", "Cancelación", "Nómina"],
  },
];

interface PACConfig {
  provider_id: string;
  provider_name: string;
  environment: "sandbox" | "production";
  username: string;
  password: string;
  certificate_file: string;
  certificate_password: string;
  rfc: string;
  is_active: boolean;
  last_test: Date | null;
  test_status: "success" | "failed" | null;
  timbrados_count: number;
}

export function PACIntegration({ companyId }: PACIntegrationProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const [config, setConfig] = useState<PACConfig>({
    provider_id: "",
    provider_name: "",
    environment: "sandbox",
    username: "",
    password: "",
    certificate_file: "",
    certificate_password: "",
    rfc: "",
    is_active: false,
    last_test: null,
    test_status: null,
    timbrados_count: 0,
  });

  useEffect(() => {
    // Load saved config
    loadConfig();
  }, [companyId]);

  const loadConfig = async () => {
    // Mock loading saved config
    setConfig(prev => ({
      ...prev,
      provider_id: "1",
      provider_name: "Finkok",
      environment: "sandbox",
      username: "demo_user",
      rfc: "XAXX010101000",
      is_active: true,
      last_test: new Date(),
      test_status: "success",
      timbrados_count: 1250,
    }));
  };

  const handleProviderChange = (providerId: string) => {
    const provider = PAC_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setConfig(prev => ({
        ...prev,
        provider_id: providerId,
        provider_name: provider.name,
      }));
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConfig(prev => ({
        ...prev,
        last_test: new Date(),
        test_status: "success",
      }));

      toast({
        title: "Conexión Exitosa",
        description: `La conexión con ${config.provider_name} ha sido verificada`,
      });
    } catch (error) {
      setConfig(prev => ({
        ...prev,
        last_test: new Date(),
        test_status: "failed",
      }));
      toast({
        title: "Error de Conexión",
        description: "No se pudo conectar con el PAC",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuración Guardada",
        description: "Los cambios han sido guardados correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = PAC_PROVIDERS.find(p => p.id === config.provider_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración PAC (Proveedor Autorizado de Certificación)
        </CardTitle>
        <CardDescription>
          Configure su proveedor de timbrado de CFDI para nómina
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Proveedor</div>
            <div className="text-lg font-bold">{config.provider_name || "No configurado"}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Ambiente</div>
            <div className="text-lg font-bold">
              <Badge variant={config.environment === "production" ? "default" : "secondary"}>
                {config.environment === "production" ? "Producción" : "Sandbox"}
              </Badge>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Estado</div>
            <div className="flex items-center gap-2">
              {config.test_status === "success" ? (
                <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Conectado</Badge>
              ) : config.test_status === "failed" ? (
                <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Error</Badge>
              ) : (
                <Badge variant="outline">Sin probar</Badge>
              )}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">CFDIs Timbrados</div>
            <div className="text-lg font-bold text-primary">{config.timbrados_count.toLocaleString()}</div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="config">Configuración</TabsTrigger>
            <TabsTrigger value="providers">Proveedores</TabsTrigger>
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
            <TabsTrigger value="logs">Historial</TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Proveedor PAC</Label>
                  <Select value={config.provider_id} onValueChange={handleProviderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAC_PROVIDERS.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ambiente</Label>
                  <Select
                    value={config.environment}
                    onValueChange={(v: "sandbox" | "production") =>
                      setConfig(prev => ({ ...prev, environment: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                      <SelectItem value="production">Producción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>RFC de la Empresa</Label>
                  <Input
                    value={config.rfc}
                    onChange={(e) => setConfig(prev => ({ ...prev, rfc: e.target.value.toUpperCase() }))}
                    placeholder="XAXX010101000"
                    maxLength={13}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Usuario PAC</Label>
                  <Input
                    value={config.username}
                    onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Usuario del PAC"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contraseña PAC</Label>
                  <Input
                    type="password"
                    value={config.password}
                    onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Integración Activa</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar timbrado automático de CFDIs
                    </p>
                  </div>
                  <Switch
                    checked={config.is_active}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({ ...prev, is_active: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={testing} variant="outline">
                {testing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Probar Conexión
              </Button>
              <Button onClick={saveConfig} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Configuración
              </Button>
            </div>

            {config.environment === "production" && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Modo Producción
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  Los CFDIs generados en producción son documentos fiscales oficiales.
                  Asegúrese de tener configurados correctamente todos los certificados.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Características</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PAC_PROVIDERS.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell className="font-mono">{provider.code}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {provider.features.map((f) => (
                          <Badge key={f} variant="outline" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.status === "active" ? "default" : "secondary"}>
                        {provider.status === "active" ? "Disponible" : "No disponible"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={provider.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Certificado CSD (.cer)</h4>
                </div>
                <div className="space-y-2">
                  <Input type="file" accept=".cer" />
                  <p className="text-xs text-muted-foreground">
                    Certificado de Sello Digital emitido por el SAT
                  </p>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">Llave Privada (.key)</h4>
                </div>
                <div className="space-y-2">
                  <Input type="file" accept=".key" />
                  <p className="text-xs text-muted-foreground">
                    Llave privada del Certificado de Sello Digital
                  </p>
                </div>
              </Card>
            </div>

            <div className="space-y-2">
              <Label>Contraseña del Certificado</Label>
              <Input
                type="password"
                value={config.certificate_password}
                onChange={(e) =>
                  setConfig(prev => ({ ...prev, certificate_password: e.target.value }))
                }
                placeholder="Contraseña de la llave privada"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg text-sm">
              <div className="font-medium mb-2">Requisitos del Certificado:</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Debe ser un CSD (Certificado de Sello Digital), no FIEL</li>
                <li>El RFC del certificado debe coincidir con el RFC de la empresa</li>
                <li>El certificado debe estar vigente</li>
                <li>Se recomienda renovar antes de su vencimiento</li>
              </ul>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>UUID</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Tiempo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">2024-01-15 10:30:00</TableCell>
                  <TableCell><Badge variant="outline">Timbrado</Badge></TableCell>
                  <TableCell className="font-mono text-xs">ABC123-DEF456-GHI789</TableCell>
                  <TableCell><Badge className="bg-green-500">Éxito</Badge></TableCell>
                  <TableCell>1.2s</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">2024-01-15 10:29:30</TableCell>
                  <TableCell><Badge variant="outline">Timbrado</Badge></TableCell>
                  <TableCell className="font-mono text-xs">XYZ789-ABC123-DEF456</TableCell>
                  <TableCell><Badge className="bg-green-500">Éxito</Badge></TableCell>
                  <TableCell>0.9s</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">2024-01-15 10:28:00</TableCell>
                  <TableCell><Badge variant="outline">Cancelación</Badge></TableCell>
                  <TableCell className="font-mono text-xs">OLD123-OLD456-OLD789</TableCell>
                  <TableCell><Badge className="bg-green-500">Éxito</Badge></TableCell>
                  <TableCell>2.1s</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
