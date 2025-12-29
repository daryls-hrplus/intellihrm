import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2, Shield, FileText, Key, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;

const formSchema = z.object({
  rfc: z.string().regex(rfcRegex, 'Invalid RFC format'),
  razon_social: z.string().min(1, 'Business name is required'),
  registro_patronal_imss: z.string().optional(),
  isn_state_code: z.string().min(2, 'State is required'),
  imss_risk_class: z.coerce.number().min(1).max(5),
  fonacot_registration: z.string().optional(),
  pac_provider: z.string().optional(),
  csd_certificate_number: z.string().optional(),
  pac_username: z.string().optional(),
  pac_password: z.string().optional(),
  pac_sandbox_mode: z.boolean().optional(),
  domicilio_fiscal: z.object({
    calle: z.string().optional(),
    numero_exterior: z.string().optional(),
    numero_interior: z.string().optional(),
    colonia: z.string().optional(),
    codigo_postal: z.string().optional(),
    municipio: z.string().optional(),
    estado: z.string().optional()
  }).optional()
});

type FormData = z.infer<typeof formSchema>;

interface MexicanCompanySetupProps {
  companyId: string;
  onSave?: () => void;
}

const MEXICAN_STATES = [
  { code: 'AGU', name: 'Aguascalientes' },
  { code: 'BCN', name: 'Baja California' },
  { code: 'BCS', name: 'Baja California Sur' },
  { code: 'CAM', name: 'Campeche' },
  { code: 'CHP', name: 'Chiapas' },
  { code: 'CHH', name: 'Chihuahua' },
  { code: 'COA', name: 'Coahuila' },
  { code: 'COL', name: 'Colima' },
  { code: 'CMX', name: 'Ciudad de México' },
  { code: 'DUR', name: 'Durango' },
  { code: 'GUA', name: 'Guanajuato' },
  { code: 'GRO', name: 'Guerrero' },
  { code: 'HID', name: 'Hidalgo' },
  { code: 'JAL', name: 'Jalisco' },
  { code: 'MEX', name: 'Estado de México' },
  { code: 'MIC', name: 'Michoacán' },
  { code: 'MOR', name: 'Morelos' },
  { code: 'NAY', name: 'Nayarit' },
  { code: 'NLE', name: 'Nuevo León' },
  { code: 'OAX', name: 'Oaxaca' },
  { code: 'PUE', name: 'Puebla' },
  { code: 'QUE', name: 'Querétaro' },
  { code: 'ROO', name: 'Quintana Roo' },
  { code: 'SLP', name: 'San Luis Potosí' },
  { code: 'SIN', name: 'Sinaloa' },
  { code: 'SON', name: 'Sonora' },
  { code: 'TAB', name: 'Tabasco' },
  { code: 'TAM', name: 'Tamaulipas' },
  { code: 'TLA', name: 'Tlaxcala' },
  { code: 'VER', name: 'Veracruz' },
  { code: 'YUC', name: 'Yucatán' },
  { code: 'ZAC', name: 'Zacatecas' }
];

const IMSS_RISK_CLASSES = [
  { value: 1, label: 'Class I - Minimum Risk (0.54355%)' },
  { value: 2, label: 'Class II - Low Risk (1.13065%)' },
  { value: 3, label: 'Class III - Medium Risk (2.59840%)' },
  { value: 4, label: 'Class IV - High Risk (4.65325%)' },
  { value: 5, label: 'Class V - Maximum Risk (7.58875%)' }
];

const PAC_PROVIDERS = [
  { value: 'finkok', label: 'Finkok' },
  { value: 'facturama', label: 'Facturama' },
  { value: 'sat', label: 'SAT Direct' },
  { value: 'other', label: 'Other' }
];

export function MexicanCompanySetup({ companyId, onSave }: MexicanCompanySetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [existingRecord, setExistingRecord] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pacConnectionStatus, setPacConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rfc: '',
      razon_social: '',
      registro_patronal_imss: '',
      isn_state_code: '',
      imss_risk_class: 1,
      fonacot_registration: '',
      pac_provider: '',
      csd_certificate_number: '',
      pac_username: '',
      pac_password: '',
      pac_sandbox_mode: true,
      domicilio_fiscal: {
        calle: '',
        numero_exterior: '',
        numero_interior: '',
        colonia: '',
        codigo_postal: '',
        municipio: '',
        estado: ''
      }
    }
  });

  useEffect(() => {
    const loadExistingData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('mx_company_registrations')
          .select('*')
          .eq('company_id', companyId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setExistingRecord(data.id);
          const pacCreds = data.pac_credentials as { username?: string; password?: string; sandbox_mode?: boolean } | null;
          form.reset({
            rfc: data.rfc,
            razon_social: data.razon_social,
            registro_patronal_imss: data.registro_patronal_imss || '',
            isn_state_code: data.isn_state_code || '',
            imss_risk_class: data.imss_risk_class || 1,
            fonacot_registration: data.fonacot_registration || '',
            pac_provider: data.pac_provider || '',
            csd_certificate_number: data.csd_certificate_number || '',
            pac_username: pacCreds?.username || '',
            pac_password: pacCreds?.password || '',
            pac_sandbox_mode: pacCreds?.sandbox_mode ?? true,
            domicilio_fiscal: (data.domicilio_fiscal as FormData['domicilio_fiscal']) || {}
          });
          if (pacCreds?.username && pacCreds?.password) {
            setPacConnectionStatus('success');
          }
        }
      } catch (error) {
        console.error('Error loading Mexican company data:', error);
        toast({
          title: 'Error loading data',
          description: 'Could not load existing Mexican registration data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [companyId, form, toast]);

  const testPacConnection = async () => {
    const provider = form.getValues('pac_provider');
    const username = form.getValues('pac_username');
    const password = form.getValues('pac_password');
    const sandboxMode = form.getValues('pac_sandbox_mode');

    if (!provider || !username || !password) {
      toast({
        title: 'Missing credentials',
        description: 'Please fill in PAC provider, username, and password',
        variant: 'destructive'
      });
      return;
    }

    setIsTesting(true);
    setPacConnectionStatus('untested');

    try {
      const { data, error } = await supabase.functions.invoke('mx-pac-test-connection', {
        body: { provider, username, password, sandboxMode }
      });

      if (error) throw error;

      if (data?.success) {
        setPacConnectionStatus('success');
        toast({
          title: 'Connection successful',
          description: `Successfully connected to ${provider.toUpperCase()} PAC service`
        });
      } else {
        setPacConnectionStatus('error');
        toast({
          title: 'Connection failed',
          description: data?.error || 'Could not connect to PAC service',
          variant: 'destructive'
        });
      }
    } catch (error) {
      setPacConnectionStatus('error');
      toast({
        title: 'Connection test failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const pacCredentials = data.pac_username && data.pac_password ? {
        username: data.pac_username,
        password: data.pac_password,
        sandbox_mode: data.pac_sandbox_mode ?? true
      } : null;

      const payload = {
        company_id: companyId,
        rfc: data.rfc.toUpperCase(),
        razon_social: data.razon_social,
        registro_patronal_imss: data.registro_patronal_imss || null,
        isn_state_code: data.isn_state_code,
        imss_risk_class: data.imss_risk_class,
        fonacot_registration: data.fonacot_registration || null,
        pac_provider: data.pac_provider || null,
        csd_certificate_number: data.csd_certificate_number || null,
        pac_credentials: pacCredentials,
        domicilio_fiscal: data.domicilio_fiscal
      };

      if (existingRecord) {
        const { error } = await supabase
          .from('mx_company_registrations')
          .update(payload)
          .eq('id', existingRecord);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mx_company_registrations')
          .insert(payload);
        if (error) throw error;
      }

      toast({
        title: 'Saved successfully',
        description: 'Mexican payroll configuration has been saved'
      });
      onSave?.();
    } catch (error) {
      console.error('Error saving Mexican company data:', error);
      toast({
        title: 'Error saving',
        description: error instanceof Error ? error.message : 'Could not save configuration',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Tax Information
            </CardTitle>
            <CardDescription>
              RFC and business registration details for SAT compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="rfc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFC (Tax ID)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="ABC123456XYZ"
                      className="uppercase"
                      maxLength={13}
                    />
                  </FormControl>
                  <FormDescription>
                    12-13 character tax identification number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="razon_social"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón Social (Legal Name)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Company Legal Name S.A. de C.V." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              IMSS Configuration
            </CardTitle>
            <CardDescription>
              Social security registration and risk classification
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="registro_patronal_imss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registro Patronal IMSS</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Y12-34567-89-0" />
                  </FormControl>
                  <FormDescription>
                    Employer registration number with IMSS
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imss_risk_class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IMSS Risk Class</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {IMSS_RISK_CLASSES.map((rc) => (
                        <SelectItem key={rc.value} value={rc.value.toString()}>
                          {rc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Work risk premium classification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isn_state_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State (for ISN)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEXICAN_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    State payroll tax (ISN) jurisdiction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fonacot_registration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>FONACOT Registration (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="FONACOT number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              CFDI Configuration
            </CardTitle>
            <CardDescription>
              Electronic invoicing (timbrado) provider settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="csd_certificate_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CSD Certificate Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="20001000000300022779" />
                  </FormControl>
                  <FormDescription>
                    Digital seal certificate number (Certificado de Sello Digital)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pac_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAC Provider</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select PAC provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAC_PROVIDERS.map((pac) => (
                        <SelectItem key={pac.value} value={pac.value}>
                          {pac.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Authorized certification provider for CFDI stamping
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              PAC Credentials
              {pacConnectionStatus === 'success' && (
                <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              {pacConnectionStatus === 'error' && (
                <Badge variant="outline" className="ml-2 text-destructive border-destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Connection Failed
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              API credentials for your PAC provider to stamp CFDIs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Your PAC credentials are encrypted and stored securely. They are used only for CFDI stamping operations.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="pac_username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAC Username / API Key</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="your-pac-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pac_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAC Password / API Secret</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          {...field} 
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pac_sandbox_mode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Sandbox Mode</FormLabel>
                    <FormDescription>
                      Use test environment for CFDI stamping (no real charges)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Button
                      type="button"
                      variant={field.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => field.onChange(!field.value)}
                    >
                      {field.value ? 'Enabled' : 'Disabled'}
                    </Button>
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline"
                onClick={testPacConnection}
                disabled={isTesting}
              >
                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test PAC Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingRecord ? 'Update Configuration' : 'Save Configuration'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
