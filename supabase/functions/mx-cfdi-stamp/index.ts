import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CFDIStampRequest {
  cfdiRecordId: string;
  companyId: string;
}

interface CFDIData {
  serie: string;
  folio: string;
  fecha: string;
  forma_pago: string;
  metodo_pago: string;
  tipo_comprobante: string;
  moneda: string;
  tipo_cambio: number;
  lugar_expedicion: string;
  subtotal: number;
  total: number;
  descuento: number;
  emisor: {
    rfc: string;
    nombre: string;
    regimen_fiscal: string;
  };
  receptor: {
    rfc: string;
    nombre: string;
    uso_cfdi: string;
    domicilio_fiscal: string;
    regimen_fiscal: string;
  };
  conceptos: Array<{
    clave_prod_serv: string;
    cantidad: number;
    clave_unidad: string;
    descripcion: string;
    valor_unitario: number;
    importe: number;
    descuento?: number;
    impuestos?: {
      traslados?: Array<{
        base: number;
        impuesto: string;
        tipo_factor: string;
        tasa_o_cuota: number;
        importe: number;
      }>;
      retenciones?: Array<{
        base: number;
        impuesto: string;
        tipo_factor: string;
        tasa_o_cuota: number;
        importe: number;
      }>;
    };
  }>;
  impuestos?: {
    total_impuestos_trasladados?: number;
    total_impuestos_retenidos?: number;
  };
  nomina?: {
    version: string;
    tipo_nomina: string;
    fecha_pago: string;
    fecha_inicial_pago: string;
    fecha_final_pago: string;
    num_dias_pagados: number;
    total_percepciones?: number;
    total_deducciones?: number;
    total_otros_pagos?: number;
    emisor: {
      registro_patronal: string;
    };
    receptor: {
      curp: string;
      num_seguridad_social: string;
      fecha_inicio_rel_laboral: string;
      tipo_contrato: string;
      tipo_jornada: string;
      tipo_regimen: string;
      num_empleado: string;
      departamento?: string;
      puesto?: string;
      riesgo_puesto: string;
      periodicidad_pago: string;
      banco?: string;
      cuenta_bancaria?: string;
      salario_base_cot_apor: number;
      salario_diario_integrado: number;
      clabe?: string;
    };
    percepciones?: {
      total_sueldos?: number;
      total_gravado?: number;
      total_exento?: number;
      percepcion: Array<{
        tipo_percepcion: string;
        clave: string;
        concepto: string;
        importe_gravado: number;
        importe_exento: number;
      }>;
    };
    deducciones?: {
      total_otras_deducciones?: number;
      total_impuestos_retenidos?: number;
      deduccion: Array<{
        tipo_deduccion: string;
        clave: string;
        concepto: string;
        importe: number;
      }>;
    };
    otros_pagos?: Array<{
      tipo_otro_pago: string;
      clave: string;
      concepto: string;
      importe: number;
      subsidio_al_empleo?: {
        subsidio_causado: number;
      };
    }>;
  };
}

async function stampWithFinkok(
  cfdiXml: string, 
  username: string, 
  password: string, 
  sandboxMode: boolean
): Promise<{ success: boolean; uuid?: string; xml?: string; error?: string }> {
  const endpoint = sandboxMode 
    ? 'https://demo-facturacion.finkok.com/servicios/soap/stamp.wsdl'
    : 'https://facturacion.finkok.com/servicios/soap/stamp.wsdl';

  const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                      xmlns:apps="apps.services.soap.core.views">
      <soapenv:Header/>
      <soapenv:Body>
        <apps:stamp>
          <apps:xml><![CDATA[${cfdiXml}]]></apps:xml>
          <apps:username>${username}</apps:username>
          <apps:password>${password}</apps:password>
        </apps:stamp>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await fetch(endpoint.replace('.wsdl', ''), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': 'stamp'
      },
      body: soapEnvelope
    });

    const responseText = await response.text();
    
    // Parse SOAP response for UUID and stamped XML
    const uuidMatch = responseText.match(/<UUID>([^<]+)<\/UUID>/);
    const xmlMatch = responseText.match(/<xml><!\[CDATA\[([\s\S]*?)\]\]><\/xml>/);
    
    if (uuidMatch && uuidMatch[1]) {
      return {
        success: true,
        uuid: uuidMatch[1],
        xml: xmlMatch ? xmlMatch[1] : cfdiXml
      };
    }

    // Check for errors
    const errorMatch = responseText.match(/<faultstring>([^<]+)<\/faultstring>/);
    return {
      success: false,
      error: errorMatch ? errorMatch[1] : 'Unknown stamping error'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Stamping request failed'
    };
  }
}

async function stampWithFacturama(
  cfdiData: CFDIData,
  username: string,
  password: string,
  sandboxMode: boolean
): Promise<{ success: boolean; uuid?: string; xml?: string; error?: string }> {
  const baseUrl = sandboxMode 
    ? 'https://apisandbox.facturama.mx/api'
    : 'https://api.facturama.mx/api';

  const credentials = btoa(`${username}:${password}`);

  try {
    // Transform CFDI data to Facturama format
    const facturamaPayload = {
      Serie: cfdiData.serie,
      Folio: cfdiData.folio,
      Date: cfdiData.fecha,
      PaymentForm: cfdiData.forma_pago,
      PaymentMethod: cfdiData.metodo_pago,
      CfdiType: cfdiData.tipo_comprobante,
      Currency: cfdiData.moneda,
      ExpeditionPlace: cfdiData.lugar_expedicion,
      Issuer: {
        FiscalRegime: cfdiData.emisor.regimen_fiscal,
        Rfc: cfdiData.emisor.rfc,
        Name: cfdiData.emisor.nombre
      },
      Receiver: {
        Rfc: cfdiData.receptor.rfc,
        Name: cfdiData.receptor.nombre,
        CfdiUse: cfdiData.receptor.uso_cfdi,
        FiscalRegime: cfdiData.receptor.regimen_fiscal,
        TaxZipCode: cfdiData.receptor.domicilio_fiscal
      },
      Items: cfdiData.conceptos.map(c => ({
        ProductCode: c.clave_prod_serv,
        Quantity: c.cantidad,
        UnitCode: c.clave_unidad,
        Description: c.descripcion,
        UnitPrice: c.valor_unitario,
        Subtotal: c.importe,
        Discount: c.descuento || 0,
        Taxes: c.impuestos?.traslados?.map(t => ({
          Base: t.base,
          Name: t.impuesto === '002' ? 'IVA' : 'ISR',
          Rate: t.tasa_o_cuota,
          Total: t.importe,
          IsRetention: false
        })) || []
      }))
    };

    const response = await fetch(`${baseUrl}/3/cfdis`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(facturamaPayload)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        uuid: data.Complement?.TaxStamp?.Uuid,
        xml: data.OriginalString
      };
    }

    const errorData = await response.json();
    return {
      success: false,
      error: errorData.Message || `HTTP ${response.status}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Stamping request failed'
    };
  }
}

function generateCFDIXml(cfdiData: CFDIData): string {
  // Generate CFDI 4.0 compliant XML
  const conceptosXml = cfdiData.conceptos.map(c => {
    let impuestosXml = '';
    if (c.impuestos) {
      const trasladosXml = c.impuestos.traslados?.map(t => 
        `<cfdi:Traslado Base="${t.base}" Impuesto="${t.impuesto}" TipoFactor="${t.tipo_factor}" TasaOCuota="${t.tasa_o_cuota}" Importe="${t.importe}"/>`
      ).join('') || '';
      
      const retencionesXml = c.impuestos.retenciones?.map(r =>
        `<cfdi:Retencion Base="${r.base}" Impuesto="${r.impuesto}" TipoFactor="${r.tipo_factor}" TasaOCuota="${r.tasa_o_cuota}" Importe="${r.importe}"/>`
      ).join('') || '';

      if (trasladosXml || retencionesXml) {
        impuestosXml = `<cfdi:Impuestos>
          ${trasladosXml ? `<cfdi:Traslados>${trasladosXml}</cfdi:Traslados>` : ''}
          ${retencionesXml ? `<cfdi:Retenciones>${retencionesXml}</cfdi:Retenciones>` : ''}
        </cfdi:Impuestos>`;
      }
    }

    return `<cfdi:Concepto ClaveProdServ="${c.clave_prod_serv}" Cantidad="${c.cantidad}" ClaveUnidad="${c.clave_unidad}" Descripcion="${c.descripcion}" ValorUnitario="${c.valor_unitario}" Importe="${c.importe}"${c.descuento ? ` Descuento="${c.descuento}"` : ''} ObjetoImp="02">
      ${impuestosXml}
    </cfdi:Concepto>`;
  }).join('\n');

  // Generate Nomina complement if present
  let nominaXml = '';
  if (cfdiData.nomina) {
    const n = cfdiData.nomina;
    
    const percepcionesXml = n.percepciones ? `<nomina12:Percepciones TotalSueldos="${n.percepciones.total_sueldos || 0}" TotalGravado="${n.percepciones.total_gravado || 0}" TotalExento="${n.percepciones.total_exento || 0}">
      ${n.percepciones.percepcion.map(p => 
        `<nomina12:Percepcion TipoPercepcion="${p.tipo_percepcion}" Clave="${p.clave}" Concepto="${p.concepto}" ImporteGravado="${p.importe_gravado}" ImporteExento="${p.importe_exento}"/>`
      ).join('\n')}
    </nomina12:Percepciones>` : '';

    const deduccionesXml = n.deducciones ? `<nomina12:Deducciones TotalOtrasDeducciones="${n.deducciones.total_otras_deducciones || 0}" TotalImpuestosRetenidos="${n.deducciones.total_impuestos_retenidos || 0}">
      ${n.deducciones.deduccion.map(d =>
        `<nomina12:Deduccion TipoDeduccion="${d.tipo_deduccion}" Clave="${d.clave}" Concepto="${d.concepto}" Importe="${d.importe}"/>`
      ).join('\n')}
    </nomina12:Deducciones>` : '';

    const otrosPagosXml = n.otros_pagos ? `<nomina12:OtrosPagos>
      ${n.otros_pagos.map(o => {
        let subsidioXml = '';
        if (o.subsidio_al_empleo) {
          subsidioXml = `<nomina12:SubsidioAlEmpleo SubsidioCausado="${o.subsidio_al_empleo.subsidio_causado}"/>`;
        }
        return `<nomina12:OtroPago TipoOtroPago="${o.tipo_otro_pago}" Clave="${o.clave}" Concepto="${o.concepto}" Importe="${o.importe}">${subsidioXml}</nomina12:OtroPago>`;
      }).join('\n')}
    </nomina12:OtrosPagos>` : '';

    nominaXml = `<cfdi:Complemento>
      <nomina12:Nomina xmlns:nomina12="http://www.sat.gob.mx/nomina12" Version="${n.version}" TipoNomina="${n.tipo_nomina}" FechaPago="${n.fecha_pago}" FechaInicialPago="${n.fecha_inicial_pago}" FechaFinalPago="${n.fecha_final_pago}" NumDiasPagados="${n.num_dias_pagados}"${n.total_percepciones ? ` TotalPercepciones="${n.total_percepciones}"` : ''}${n.total_deducciones ? ` TotalDeducciones="${n.total_deducciones}"` : ''}${n.total_otros_pagos ? ` TotalOtrosPagos="${n.total_otros_pagos}"` : ''}>
        <nomina12:Emisor RegistroPatronal="${n.emisor.registro_patronal}"/>
        <nomina12:Receptor Curp="${n.receptor.curp}" NumSeguridadSocial="${n.receptor.num_seguridad_social}" FechaInicioRelLaboral="${n.receptor.fecha_inicio_rel_laboral}" TipoContrato="${n.receptor.tipo_contrato}" TipoJornada="${n.receptor.tipo_jornada}" TipoRegimen="${n.receptor.tipo_regimen}" NumEmpleado="${n.receptor.num_empleado}"${n.receptor.departamento ? ` Departamento="${n.receptor.departamento}"` : ''}${n.receptor.puesto ? ` Puesto="${n.receptor.puesto}"` : ''} RiesgoTrabajo="${n.receptor.riesgo_puesto}" PeriodicidadPago="${n.receptor.periodicidad_pago}"${n.receptor.banco ? ` Banco="${n.receptor.banco}"` : ''}${n.receptor.cuenta_bancaria ? ` CuentaBancaria="${n.receptor.cuenta_bancaria}"` : ''} SalarioBaseCotApor="${n.receptor.salario_base_cot_apor}" SalarioDiarioIntegrado="${n.receptor.salario_diario_integrado}"${n.receptor.clabe ? ` Clabe="${n.receptor.clabe}"` : ''}/>
        ${percepcionesXml}
        ${deduccionesXml}
        ${otrosPagosXml}
      </nomina12:Nomina>
    </cfdi:Complemento>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Version="4.0" Serie="${cfdiData.serie}" Folio="${cfdiData.folio}" Fecha="${cfdiData.fecha}" FormaPago="${cfdiData.forma_pago}" MetodoPago="${cfdiData.metodo_pago}" TipoDeComprobante="${cfdiData.tipo_comprobante}" Moneda="${cfdiData.moneda}"${cfdiData.tipo_cambio !== 1 ? ` TipoCambio="${cfdiData.tipo_cambio}"` : ''} LugarExpedicion="${cfdiData.lugar_expedicion}" SubTotal="${cfdiData.subtotal}"${cfdiData.descuento ? ` Descuento="${cfdiData.descuento}"` : ''} Total="${cfdiData.total}">
  <cfdi:Emisor Rfc="${cfdiData.emisor.rfc}" Nombre="${cfdiData.emisor.nombre}" RegimenFiscal="${cfdiData.emisor.regimen_fiscal}"/>
  <cfdi:Receptor Rfc="${cfdiData.receptor.rfc}" Nombre="${cfdiData.receptor.nombre}" UsoCFDI="${cfdiData.receptor.uso_cfdi}" DomicilioFiscalReceptor="${cfdiData.receptor.domicilio_fiscal}" RegimenFiscalReceptor="${cfdiData.receptor.regimen_fiscal}"/>
  <cfdi:Conceptos>
    ${conceptosXml}
  </cfdi:Conceptos>
  ${cfdiData.impuestos ? `<cfdi:Impuestos${cfdiData.impuestos.total_impuestos_trasladados ? ` TotalImpuestosTrasladados="${cfdiData.impuestos.total_impuestos_trasladados}"` : ''}${cfdiData.impuestos.total_impuestos_retenidos ? ` TotalImpuestosRetenidos="${cfdiData.impuestos.total_impuestos_retenidos}"` : ''}/>` : ''}
  ${nominaXml}
</cfdi:Comprobante>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cfdiRecordId, companyId }: CFDIStampRequest = await req.json();

    if (!cfdiRecordId || !companyId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing cfdiRecordId or companyId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get company PAC configuration
    const { data: companyConfig, error: configError } = await supabase
      .from('mx_company_registrations')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (configError || !companyConfig) {
      return new Response(
        JSON.stringify({ success: false, error: 'Company configuration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pacCredentials = companyConfig.pac_credentials as { username?: string; password?: string; sandbox_mode?: boolean } | null;
    
    if (!companyConfig.pac_provider || !pacCredentials?.username || !pacCredentials?.password) {
      return new Response(
        JSON.stringify({ success: false, error: 'PAC credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get CFDI record
    const { data: cfdiRecord, error: cfdiError } = await supabase
      .from('mx_payroll_cfdi')
      .select('*')
      .eq('id', cfdiRecordId)
      .single();

    if (cfdiError || !cfdiRecord) {
      return new Response(
        JSON.stringify({ success: false, error: 'CFDI record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (cfdiRecord.status === 'stamped') {
      return new Response(
        JSON.stringify({ success: false, error: 'CFDI already stamped' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cfdiData = cfdiRecord.cfdi_data as unknown as CFDIData;
    let stampResult: { success: boolean; uuid?: string; xml?: string; error?: string };

    switch (companyConfig.pac_provider.toLowerCase()) {
      case 'finkok':
        const cfdiXml = generateCFDIXml(cfdiData);
        stampResult = await stampWithFinkok(cfdiXml, pacCredentials.username, pacCredentials.password, pacCredentials.sandbox_mode ?? true);
        break;
      case 'facturama':
        stampResult = await stampWithFacturama(cfdiData, pacCredentials.username, pacCredentials.password, pacCredentials.sandbox_mode ?? true);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unsupported PAC provider: ${companyConfig.pac_provider}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (stampResult.success && stampResult.uuid) {
      // Update CFDI record with stamp info
      const { error: updateError } = await supabase
        .from('mx_payroll_cfdi')
        .update({
          uuid: stampResult.uuid,
          status: 'stamped',
          stamped_xml: stampResult.xml,
          stamped_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', cfdiRecordId);

      if (updateError) {
        console.error('Failed to update CFDI record:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          uuid: stampResult.uuid,
          message: 'CFDI stamped successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update CFDI record with error
    await supabase
      .from('mx_payroll_cfdi')
      .update({
        status: 'error',
        error_message: stampResult.error,
        updated_at: new Date().toISOString()
      })
      .eq('id', cfdiRecordId);

    return new Response(
      JSON.stringify({ success: false, error: stampResult.error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('CFDI stamping error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
