import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Calculator, Download, TrendingUp, Building2 } from "lucide-react";

interface StateISNRate {
  state_code: string;
  state_name: string;
  rate: number;
  effective_date: string;
  notes: string;
}

interface ISNCalculation {
  id: string;
  company_name: string;
  state: string;
  period: string;
  taxable_wages: number;
  isn_rate: number;
  isn_amount: number;
  status: "pending" | "paid" | "declared";
}

export function ISNByState() {
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState("2025-01");

  const isnRates: StateISNRate[] = [
    { state_code: "AGS", state_name: "Aguascalientes", rate: 2.5, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "BC", state_name: "Baja California", rate: 1.8, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "BCS", state_name: "Baja California Sur", rate: 2.5, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "CAMP", state_name: "Campeche", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "CDMX", state_name: "Ciudad de México", rate: 3.0, effective_date: "2024-01-01", notes: "Tasa más alta del país" },
    { state_code: "COAH", state_name: "Coahuila", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "COL", state_name: "Colima", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "CHIS", state_name: "Chiapas", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "CHIH", state_name: "Chihuahua", rate: 3.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "DGO", state_name: "Durango", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "GTO", state_name: "Guanajuato", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "GRO", state_name: "Guerrero", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "HGO", state_name: "Hidalgo", rate: 2.5, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "JAL", state_name: "Jalisco", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "MEX", state_name: "Estado de México", rate: 3.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "MICH", state_name: "Michoacán", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "MOR", state_name: "Morelos", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "NAY", state_name: "Nayarit", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "NL", state_name: "Nuevo León", rate: 3.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "OAX", state_name: "Oaxaca", rate: 3.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "PUE", state_name: "Puebla", rate: 3.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "QRO", state_name: "Querétaro", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "QROO", state_name: "Quintana Roo", rate: 3.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "SLP", state_name: "San Luis Potosí", rate: 2.5, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "SIN", state_name: "Sinaloa", rate: 2.4, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "SON", state_name: "Sonora", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "TAB", state_name: "Tabasco", rate: 2.5, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "TAMPS", state_name: "Tamaulipas", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "TLAX", state_name: "Tlaxcala", rate: 3.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "VER", state_name: "Veracruz", rate: 3.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "YUC", state_name: "Yucatán", rate: 2.0, effective_date: "2024-01-01", notes: "Tasa general" },
    { state_code: "ZAC", state_name: "Zacatecas", rate: 2.5, effective_date: "2024-01-01", notes: "Tasa general" }
  ];

  const calculations: ISNCalculation[] = [
    {
      id: "1",
      company_name: "Empresa Mexicana SA de CV",
      state: "Ciudad de México",
      period: "2025-01",
      taxable_wages: 1500000,
      isn_rate: 3.0,
      isn_amount: 45000,
      status: "paid"
    },
    {
      id: "2",
      company_name: "Empresa Mexicana SA de CV",
      state: "Estado de México",
      period: "2025-01",
      taxable_wages: 800000,
      isn_rate: 3.0,
      isn_amount: 24000,
      status: "pending"
    },
    {
      id: "3",
      company_name: "Sucursal Guadalajara",
      state: "Jalisco",
      period: "2025-01",
      taxable_wages: 450000,
      isn_rate: 2.0,
      isn_amount: 9000,
      status: "pending"
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const filteredRates = selectedState === "all" 
    ? isnRates 
    : isnRates.filter(r => r.state_code === selectedState);

  const totalISN = calculations.reduce((sum, c) => sum + c.isn_amount, 0);
  const pendingISN = calculations.filter(c => c.status === "pending").reduce((sum, c) => sum + c.isn_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            ISN por Estado
          </h2>
          <p className="text-muted-foreground">
            Impuesto Sobre Nóminas - Cálculo y declaración por entidad federativa
          </p>
        </div>
        <Button>
          <Calculator className="h-4 w-4 mr-2" />
          Calcular ISN
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ISN Total del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalISN)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendiente de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(pendingISN)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estados con Operaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(calculations.map(c => c.state)).size}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(calculations.reduce((sum, c) => sum + c.isn_rate, 0) / calculations.length).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calculations">
        <TabsList>
          <TabsTrigger value="calculations">Cálculos del Período</TabsTrigger>
          <TabsTrigger value="rates">Tasas por Estado</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="calculations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cálculo de ISN por Estado</CardTitle>
                  <CardDescription>
                    Desglose del ISN por entidad federativa para el período seleccionado
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input type="month" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-40" />
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Salarios Gravables</TableHead>
                    <TableHead className="text-right">Tasa ISN</TableHead>
                    <TableHead className="text-right">Monto ISN</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{calc.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {calc.state}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(calc.taxable_wages)}</TableCell>
                      <TableCell className="text-right">{calc.isn_rate}%</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(calc.isn_amount)}</TableCell>
                      <TableCell>
                        <Badge variant={calc.status === "paid" ? "default" : "secondary"}>
                          {calc.status === "paid" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tasas de ISN por Estado</CardTitle>
                  <CardDescription>
                    Tasas vigentes del Impuesto Sobre Nóminas por entidad federativa
                  </CardDescription>
                </div>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {isnRates.map((rate) => (
                      <SelectItem key={rate.state_code} value={rate.state_code}>
                        {rate.state_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Tasa ISN</TableHead>
                    <TableHead>Vigente Desde</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRates.map((rate) => (
                    <TableRow key={rate.state_code}>
                      <TableCell className="font-medium">{rate.state_name}</TableCell>
                      <TableCell className="font-mono">{rate.state_code}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={rate.rate >= 3 ? "destructive" : rate.rate >= 2.5 ? "default" : "secondary"}>
                          {rate.rate}%
                        </Badge>
                      </TableCell>
                      <TableCell>{rate.effective_date}</TableCell>
                      <TableCell className="text-muted-foreground">{rate.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos de ISN</CardTitle>
              <CardDescription>
                Registro histórico de pagos de ISN por estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <p className="mt-4">El historial de pagos se mostrará aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
