import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SUAGenerationRequest {
  companyId: string;
  periodYear: number;
  periodMonth: number;
  fileType: 'afiliacion' | 'movimientos' | 'determinacion';
}

interface EmployeeSUAData {
  nss: string;
  curp: string;
  rfc: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  sdi: number;
  fecha_ingreso: string;
  tipo_trabajador: string;
  tipo_salario: string;
  jornada: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { companyId, periodYear, periodMonth, fileType }: SUAGenerationRequest = await req.json();

    console.log(`Generating SUA ${fileType} file for company ${companyId}, period ${periodYear}-${periodMonth}`);

    // Get company data
    const { data: company, error: companyError } = await supabaseClient
      .from('mx_company_data')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('Company not found or missing Mexican tax data');
    }

    // Get employees with Mexican data
    const { data: employees, error: employeesError } = await supabaseClient
      .from('mx_employee_data')
      .select(`
        *,
        employee:profiles!mx_employee_data_employee_id_fkey(
          id, first_name, last_name, national_id
        )
      `)
      .eq('imss_active', true);

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
      throw new Error('Failed to fetch employee data');
    }

    let fileContent = '';
    let fileName = '';

    switch (fileType) {
      case 'afiliacion':
        fileContent = generateAfiliacionFile(company, employees || []);
        fileName = `SUA_AFIL_${company.imss_registro_patronal}_${periodYear}${String(periodMonth).padStart(2, '0')}.txt`;
        break;
      case 'movimientos':
        fileContent = generateMovimientosFile(company, employees || [], periodYear, periodMonth);
        fileName = `SUA_MOV_${company.imss_registro_patronal}_${periodYear}${String(periodMonth).padStart(2, '0')}.txt`;
        break;
      case 'determinacion':
        fileContent = generateDeterminacionFile(company, employees || [], periodYear, periodMonth);
        fileName = `SUA_DET_${company.imss_registro_patronal}_${periodYear}${String(periodMonth).padStart(2, '0')}.txt`;
        break;
      default:
        throw new Error(`Unknown file type: ${fileType}`);
    }

    console.log(`Generated ${fileType} file with ${fileContent.split('\n').length} lines`);

    return new Response(JSON.stringify({
      success: true,
      fileName,
      fileContent,
      recordCount: employees?.length || 0,
      fileType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('SUA generation error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});

function generateAfiliacionFile(company: any, employees: any[]): string {
  const lines: string[] = [];
  
  // Header record (Type 1)
  const header = [
    '1',                                          // Record type
    padRight(company.imss_registro_patronal, 11), // Registro patronal
    padRight(company.rfc || '', 13),              // RFC
    padRight(company.razon_social || '', 50),     // Razón social
    new Date().toISOString().slice(0, 10).replace(/-/g, ''), // Generation date
    padLeft(String(employees.length), 6, '0')     // Employee count
  ].join('');
  lines.push(header);

  // Detail records (Type 2)
  for (const emp of employees) {
    const detail = [
      '2',                                        // Record type
      padRight(emp.nss || '', 11),                // NSS
      padRight(emp.curp || '', 18),               // CURP
      padRight(emp.rfc || '', 13),                // RFC
      padRight(emp.employee?.last_name?.split(' ')[0] || '', 27), // Apellido paterno
      padRight(emp.employee?.last_name?.split(' ')[1] || '', 27), // Apellido materno
      padRight(emp.employee?.first_name || '', 27), // Nombre
      formatAmount(emp.sdi || 0, 7, 2),           // SDI
      (emp.tipo_trabajador || '1').padStart(2, '0'), // Tipo trabajador
      (emp.tipo_salario || '0').padStart(2, '0'),    // Tipo salario
      (emp.jornada_reducida || '0').padStart(1, '0'), // Jornada
      emp.fecha_alta?.replace(/-/g, '') || '',    // Fecha alta
      padRight(emp.umf || '', 3)                  // UMF
    ].join('');
    lines.push(detail);
  }

  // Trailer record (Type 9)
  const trailer = [
    '9',
    padLeft(String(employees.length), 6, '0'),
    padLeft(String(lines.length + 1), 6, '0')
  ].join('');
  lines.push(trailer);

  return lines.join('\r\n');
}

function generateMovimientosFile(company: any, employees: any[], year: number, month: number): string {
  const lines: string[] = [];
  
  // Header
  const header = [
    'HDR',
    padRight(company.imss_registro_patronal, 11),
    padRight(company.rfc || '', 13),
    `${year}${String(month).padStart(2, '0')}`,
    new Date().toISOString().slice(0, 10).replace(/-/g, '')
  ].join('|');
  lines.push(header);

  // Movement records - filter for employees with movements in the period
  const movementEmployees = employees.filter(emp => {
    const altaDate = emp.fecha_alta ? new Date(emp.fecha_alta) : null;
    const bajaDate = emp.fecha_baja ? new Date(emp.fecha_baja) : null;
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);
    
    return (altaDate && altaDate >= periodStart && altaDate <= periodEnd) ||
           (bajaDate && bajaDate >= periodStart && bajaDate <= periodEnd) ||
           emp.sdi_modification_date;
  });

  for (const emp of movementEmployees) {
    // Determine movement type
    let tipoMovimiento = '07'; // Default: SDI modification
    const altaDate = emp.fecha_alta ? new Date(emp.fecha_alta) : null;
    const bajaDate = emp.fecha_baja ? new Date(emp.fecha_baja) : null;
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    if (altaDate && altaDate >= periodStart && altaDate <= periodEnd) {
      tipoMovimiento = '08'; // Alta (reingreso)
    } else if (bajaDate && bajaDate >= periodStart && bajaDate <= periodEnd) {
      tipoMovimiento = '02'; // Baja
    }

    const detail = [
      'MOV',
      padRight(emp.nss || '', 11),
      tipoMovimiento,
      emp.fecha_alta?.replace(/-/g, '') || '',
      formatAmount(emp.sdi || 0, 7, 2),
      emp.causa_baja || ''
    ].join('|');
    lines.push(detail);
  }

  // Trailer
  const trailer = [
    'TRL',
    padLeft(String(movementEmployees.length), 6, '0')
  ].join('|');
  lines.push(trailer);

  return lines.join('\r\n');
}

function generateDeterminacionFile(company: any, employees: any[], year: number, month: number): string {
  const lines: string[] = [];
  
  // Get days in month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Header
  const header = [
    '01',                                         // Record type
    padRight(company.imss_registro_patronal, 11), // Registro patronal
    padRight(company.rfc || '', 13),              // RFC
    `${year}${String(month).padStart(2, '0')}`,   // Period
    padLeft(String(daysInMonth), 2, '0'),         // Days in period
    company.imss_clase_riesgo || '1',             // Risk class
    formatAmount(company.imss_prima_riesgo || 0.54355, 1, 5) // Risk premium
  ].join('');
  lines.push(header);

  let totalCuotasPatron = 0;
  let totalCuotasTrabajador = 0;

  // Employee contribution records
  for (const emp of employees) {
    const sbc = emp.sbc || emp.sdi || 0;
    const diasCotizados = emp.dias_cotizados || daysInMonth;
    
    // Calculate IMSS contributions (simplified - real calculation is more complex)
    const sbcMensual = sbc * diasCotizados;
    const cuotaPatron = sbcMensual * 0.20400; // Approximate employer rate
    const cuotaTrabajador = sbcMensual * 0.02375; // Approximate employee rate

    totalCuotasPatron += cuotaPatron;
    totalCuotasTrabajador += cuotaTrabajador;

    const detail = [
      '02',                                       // Record type
      padRight(emp.nss || '', 11),                // NSS
      formatAmount(sbc, 7, 2),                    // SBC
      padLeft(String(diasCotizados), 2, '0'),     // Days worked
      formatAmount(cuotaPatron, 9, 2),            // Employer contribution
      formatAmount(cuotaTrabajador, 9, 2),        // Employee contribution
      emp.incapacidad_dias || '00',               // Disability days
      emp.ausentismo_dias || '00'                 // Absence days
    ].join('');
    lines.push(detail);
  }

  // Summary record
  const summary = [
    '03',                                         // Record type
    padLeft(String(employees.length), 6, '0'),    // Total employees
    formatAmount(totalCuotasPatron, 12, 2),       // Total employer contributions
    formatAmount(totalCuotasTrabajador, 12, 2),   // Total employee contributions
    formatAmount(totalCuotasPatron + totalCuotasTrabajador, 12, 2) // Grand total
  ].join('');
  lines.push(summary);

  // Trailer
  const trailer = [
    '99',
    padLeft(String(lines.length + 1), 6, '0')
  ].join('');
  lines.push(trailer);

  return lines.join('\r\n');
}

// Helper functions
function padRight(str: string, length: number, char: string = ' '): string {
  return str.substring(0, length).padEnd(length, char);
}

function padLeft(str: string, length: number, char: string = '0'): string {
  return str.substring(0, length).padStart(length, char);
}

function formatAmount(amount: number, intDigits: number, decDigits: number): string {
  const fixed = amount.toFixed(decDigits);
  const [intPart, decPart] = fixed.split('.');
  return intPart.padStart(intDigits, '0') + decPart;
}
