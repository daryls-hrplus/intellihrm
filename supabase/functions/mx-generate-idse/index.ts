import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IDSEGenerationRequest {
  companyId: string;
  movementType: 'alta' | 'baja' | 'modificacion_salario' | 'reingreso';
  employeeIds?: string[];
  startDate?: string;
  endDate?: string;
}

// IDSE Movement type codes
const MOVEMENT_CODES = {
  alta: '08',           // Alta (initial registration)
  reingreso: '08',      // Reingreso (return after leave)
  baja: '02',           // Baja (termination)
  modificacion_salario: '07' // Salary modification
};

// IDSE Termination cause codes
const CAUSA_BAJA_CODES: Record<string, string> = {
  renuncia: '1',           // Voluntary resignation
  termino_contrato: '2',   // Contract termination
  abandono: '3',           // Job abandonment
  defuncion: '4',          // Death
  clausura: '5',           // Company closure
  ausentismo: '6',         // Absenteeism
  pension: '7',            // Retirement/pension
  otro: '8'                // Other
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      companyId, 
      movementType, 
      employeeIds,
      startDate,
      endDate 
    }: IDSEGenerationRequest = await req.json();

    console.log(`Generating IDSE ${movementType} file for company ${companyId}`);

    // Get company data
    const { data: company, error: companyError } = await supabaseClient
      .from('mx_company_data')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (companyError || !company) {
      throw new Error('Company not found or missing Mexican registration data');
    }

    // Build employee query
    let query = supabaseClient
      .from('mx_employee_data')
      .select(`
        *,
        employee:profiles!mx_employee_data_employee_id_fkey(
          id, first_name, last_name, national_id, date_of_birth, gender
        )
      `);

    // Filter by specific employees if provided
    if (employeeIds && employeeIds.length > 0) {
      query = query.in('employee_id', employeeIds);
    }

    // Filter by date range based on movement type
    if (startDate && endDate) {
      switch (movementType) {
        case 'alta':
        case 'reingreso':
          query = query.gte('fecha_alta', startDate).lte('fecha_alta', endDate);
          break;
        case 'baja':
          query = query.gte('fecha_baja', startDate).lte('fecha_baja', endDate);
          break;
        case 'modificacion_salario':
          query = query.gte('sdi_calculation_date', startDate).lte('sdi_calculation_date', endDate);
          break;
      }
    }

    const { data: employees, error: employeesError } = await query;

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
      throw new Error('Failed to fetch employee data');
    }

    if (!employees || employees.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No employees found for the specified criteria'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Generate IDSE file content
    const fileContent = generateIDSEFile(company, employees, movementType);
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `IDSE_${MOVEMENT_CODES[movementType]}_${company.imss_registro_patronal}_${timestamp}.txt`;

    console.log(`Generated IDSE ${movementType} file with ${employees.length} records`);

    return new Response(JSON.stringify({
      success: true,
      fileName,
      fileContent,
      recordCount: employees.length,
      movementType,
      movementCode: MOVEMENT_CODES[movementType]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('IDSE generation error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});

function generateIDSEFile(company: any, employees: any[], movementType: string): string {
  const lines: string[] = [];
  const movementCode = MOVEMENT_CODES[movementType as keyof typeof MOVEMENT_CODES];
  const generationDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  // IDSE Header Record
  const header = formatIDSEHeader(company, employees.length, generationDate);
  lines.push(header);

  // Employee Movement Records
  for (const emp of employees) {
    const record = formatIDSEMovement(emp, movementCode, movementType);
    lines.push(record);
  }

  // IDSE Trailer Record
  const trailer = formatIDSETrailer(employees.length);
  lines.push(trailer);

  return lines.join('\r\n');
}

function formatIDSEHeader(company: any, recordCount: number, date: string): string {
  // IDSE Header Format (positions are 1-indexed in spec)
  return [
    'H',                                              // Record type (1)
    padRight(company.imss_registro_patronal || '', 11), // Registro patronal (2-12)
    padRight(company.imss_digito_verificador || '', 1), // Dígito verificador (13)
    padRight(company.rfc || '', 13),                  // RFC (14-26)
    padRight(company.razon_social || '', 50),         // Razón social (27-76)
    date,                                             // Generation date YYYYMMDD (77-84)
    padLeft(String(recordCount), 5, '0'),             // Record count (85-89)
    '01'                                              // File version (90-91)
  ].join('');
}

function formatIDSEMovement(emp: any, movementCode: string, movementType: string): string {
  // Parse employee names
  const lastName = emp.employee?.last_name || '';
  const lastNameParts = lastName.split(' ');
  const apellidoPaterno = lastNameParts[0] || '';
  const apellidoMaterno = lastNameParts.slice(1).join(' ') || '';
  const nombre = emp.employee?.first_name || '';

  // Determine movement date
  let movementDate = '';
  switch (movementType) {
    case 'alta':
    case 'reingreso':
      movementDate = emp.fecha_alta?.replace(/-/g, '') || '';
      break;
    case 'baja':
      movementDate = emp.fecha_baja?.replace(/-/g, '') || '';
      break;
    case 'modificacion_salario':
      movementDate = emp.sdi_calculation_date?.replace(/-/g, '') || '';
      break;
  }

  // Get termination cause for baja movements
  const causaBaja = movementType === 'baja' 
    ? (CAUSA_BAJA_CODES[emp.causa_baja] || '1')
    : '0';

  // Format SDI (7 integers + 2 decimals)
  const sdi = formatAmount(emp.sdi || 0, 7, 2);

  // IDSE Movement Record Format
  return [
    'D',                                              // Record type (1)
    padRight(emp.nss || '', 11),                      // NSS (2-12)
    movementCode,                                     // Movement type (13-14)
    movementDate,                                     // Movement date YYYYMMDD (15-22)
    sdi,                                              // SDI (23-31)
    padRight(emp.curp || '', 18),                     // CURP (32-49)
    padRight(apellidoPaterno, 27),                    // Apellido paterno (50-76)
    padRight(apellidoMaterno, 27),                    // Apellido materno (77-103)
    padRight(nombre, 27),                             // Nombre (104-130)
    (emp.tipo_trabajador || '1').padStart(2, '0'),    // Worker type (131-132)
    (emp.tipo_salario || '0').padStart(1, '0'),       // Salary type (133)
    (emp.jornada_reducida || '0').padStart(1, '0'),   // Reduced workday (134)
    causaBaja,                                        // Termination cause (135)
    padRight(emp.umf || '', 3),                       // UMF (136-138)
    padRight('', 12)                                  // Reserved/padding (139-150)
  ].join('');
}

function formatIDSETrailer(recordCount: number): string {
  return [
    'T',                                              // Record type
    padLeft(String(recordCount), 5, '0'),             // Total detail records
    padLeft(String(recordCount + 2), 5, '0')          // Total lines in file
  ].join('');
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
