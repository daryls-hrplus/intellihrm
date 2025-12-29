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
import { Loader2, User, CreditCard, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
const rfcRegex = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;
const nssRegex = /^\d{11}$/;

const formSchema = z.object({
  curp: z.string().regex(curpRegex, 'Invalid CURP format (18 characters)'),
  rfc_personal: z.string().regex(rfcRegex, 'Invalid RFC format (13 characters)'),
  nss: z.string().regex(nssRegex, 'Invalid NSS format (11 digits)').optional().or(z.literal('')),
  ine_number: z.string().optional(),
  imss_registration_date: z.string().optional(),
  contract_type: z.string().min(1, 'Contract type is required'),
  work_shift: z.string().min(1, 'Work shift is required'),
  work_permit_number: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface MexicanEmployeeDataProps {
  employeeId: string;
  onSave?: () => void;
}

const CONTRACT_TYPES = [
  { value: '01', label: 'Permanent (Contrato por tiempo indeterminado)' },
  { value: '02', label: 'Fixed-term (Contrato por tiempo determinado)' },
  { value: '03', label: 'Project-based (Contrato por obra determinada)' },
  { value: '04', label: 'Seasonal (Contrato por temporada)' },
  { value: '05', label: 'Initial Training (Capacitación inicial)' },
  { value: '06', label: 'Trial Period (Periodo de prueba)' },
  { value: '07', label: 'Outsourcing (Outsourcing)' },
  { value: '08', label: 'Commission-based (Comisionista)' },
  { value: '09', label: 'Modality 10 (Modalidad 10)' },
  { value: '10', label: 'Retirement (Jubilación)' },
  { value: '11', label: 'Pension (Pensión)' },
  { value: '12', label: 'Other (Otro)' },
  { value: '99', label: 'Other Regime (Otro régimen)' }
];

const WORK_SHIFTS = [
  { value: '01', label: 'Day Shift (Diurna - 8 hours)' },
  { value: '02', label: 'Night Shift (Nocturna - 7 hours)' },
  { value: '03', label: 'Mixed Shift (Mixta - 7.5 hours)' },
  { value: '04', label: 'Per Hour (Por hora)' },
  { value: '05', label: 'Reduced Day (Reducida)' },
  { value: '06', label: 'Continuous Day (Continua)' },
  { value: '07', label: 'Split Shift (Partida)' },
  { value: '08', label: 'By Results (Por resultados)' },
  { value: '99', label: 'Other (Otra)' }
];

export function MexicanEmployeeData({ employeeId, onSave }: MexicanEmployeeDataProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingRecord, setExistingRecord] = useState<string | null>(null);
  const [sdiInfo, setSdiInfo] = useState<{ sdi: number; calculationDate: string } | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      curp: '',
      rfc_personal: '',
      nss: '',
      ine_number: '',
      imss_registration_date: '',
      contract_type: '',
      work_shift: '',
      work_permit_number: ''
    }
  });

  useEffect(() => {
    const loadExistingData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('mx_employee_data')
          .select('*')
          .eq('employee_id', employeeId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setExistingRecord(data.id);
          form.reset({
            curp: data.curp,
            rfc_personal: data.rfc_personal,
            nss: data.nss || '',
            ine_number: data.ine_number || '',
            imss_registration_date: data.imss_registration_date || '',
            contract_type: data.contract_type || '',
            work_shift: data.work_shift || '',
            work_permit_number: data.work_permit_number || ''
          });
          if (data.sdi && data.sdi_calculation_date) {
            setSdiInfo({
              sdi: Number(data.sdi),
              calculationDate: data.sdi_calculation_date
            });
          }
        }
      } catch (error) {
        console.error('Error loading Mexican employee data:', error);
        toast({
          title: 'Error loading data',
          description: 'Could not load existing Mexican employee data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [employeeId, form, toast]);

  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const payload = {
        employee_id: employeeId,
        curp: data.curp.toUpperCase(),
        rfc_personal: data.rfc_personal.toUpperCase(),
        nss: data.nss || null,
        ine_number: data.ine_number || null,
        imss_registration_date: data.imss_registration_date || null,
        contract_type: data.contract_type,
        work_shift: data.work_shift,
        work_permit_number: data.work_permit_number || null
      };

      if (existingRecord) {
        const { error } = await supabase
          .from('mx_employee_data')
          .update(payload)
          .eq('id', existingRecord);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mx_employee_data')
          .insert(payload);
        if (error) throw error;
      }

      toast({
        title: 'Saved successfully',
        description: 'Mexican employee data has been saved'
      });
      onSave?.();
    } catch (error) {
      console.error('Error saving Mexican employee data:', error);
      toast({
        title: 'Error saving',
        description: error instanceof Error ? error.message : 'Could not save data',
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
              <User className="h-5 w-5" />
              Personal Identification
            </CardTitle>
            <CardDescription>
              Official Mexican identification numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="curp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CURP</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="ABCD123456HDFXYZ01"
                      className="uppercase"
                      maxLength={18}
                    />
                  </FormControl>
                  <FormDescription>
                    18-character unique population registry code
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rfc_personal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFC Personal</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="ABCD123456XYZ"
                      className="uppercase"
                      maxLength={13}
                    />
                  </FormControl>
                  <FormDescription>
                    13-character personal tax ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ine_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>INE Number (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Voter ID number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="work_permit_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Permit (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="For foreign workers" />
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
              <CreditCard className="h-5 w-5" />
              Social Security
            </CardTitle>
            <CardDescription>
              IMSS registration information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="nss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NSS (Social Security Number)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="12345678901"
                      maxLength={11}
                    />
                  </FormControl>
                  <FormDescription>
                    11-digit IMSS social security number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imss_registration_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IMSS Registration Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Date registered with IMSS
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {sdiInfo && (
              <div className="md:col-span-2 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Current SDI (Salario Diario Integrado)</p>
                <p className="text-2xl font-bold text-primary">
                  ${sdiInfo.sdi.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </p>
                <p className="text-xs text-muted-foreground">
                  Calculated on {format(new Date(sdiInfo.calculationDate), 'PPP')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Employment Details
            </CardTitle>
            <CardDescription>
              Contract and work schedule information for CFDI
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contract_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONTRACT_TYPES.map((ct) => (
                        <SelectItem key={ct.value} value={ct.value}>
                          {ct.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    SAT catalog code for contract type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="work_shift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Shift</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work shift" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WORK_SHIFTS.map((ws) => (
                        <SelectItem key={ws.value} value={ws.value}>
                          {ws.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    SAT catalog code for work schedule
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingRecord ? 'Update Data' : 'Save Data'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
