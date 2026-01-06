import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting scheduled device polling...');

    // Get all companies with polling enabled
    const { data: pollingConfigs } = await supabase
      .from('device_polling_config')
      .select('*')
      .eq('is_enabled', true);

    // Also get companies with active devices but no explicit config (default to enabled)
    const { data: activeDevices } = await supabase
      .from('timeclock_devices')
      .select('company_id, id, device_name, ip_address, port')
      .eq('is_active', true)
      .not('ip_address', 'is', null);

    // Group devices by company
    const devicesByCompany = new Map<string, typeof activeDevices>();
    for (const device of activeDevices || []) {
      if (!device.company_id) continue;
      const existing = devicesByCompany.get(device.company_id) || [];
      existing.push(device);
      devicesByCompany.set(device.company_id, existing);
    }

    const results: {
      companyId: string;
      devicesPolled: number;
      recordsSynced: number;
      errors: string[];
    }[] = [];

    for (const [companyId, devices] of devicesByCompany) {
      const deviceList = devices || [];
      console.log(`Polling ${deviceList.length} devices for company ${companyId}`);

      let totalSynced = 0;
      const errors: string[] = [];

      for (const device of deviceList) {
        try {
          // Call the zkteco-device-sync function for each device
          const { data, error } = await supabase.functions.invoke('zkteco-device-sync', {
            body: {
              action: 'sync_attendance',
              device_id: device.id,
              company_id: companyId
            }
          });

          if (error) {
            errors.push(`${device.device_name}: ${error.message}`);
            continue;
          }

          if (data.success) {
            totalSynced += data.synced || 0;
            console.log(`Synced ${data.synced} records from ${device.device_name}`);
          } else {
            errors.push(`${device.device_name}: ${data.error || 'Unknown error'}`);
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`${device.device_name}: ${errMsg}`);
        }
      }

      // Update polling config
      await supabase
        .from('device_polling_config')
        .upsert({
          company_id: companyId,
          last_poll_at: new Date().toISOString(),
          next_poll_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          poll_failures: errors.length > 0 ? 1 : 0
        }, {
          onConflict: 'company_id'
        });

      // Trigger schedule matching for this company
      if (totalSynced > 0) {
        try {
          await supabase.functions.invoke('match-attendance-schedules', {
            body: { companyId }
          });
          console.log(`Triggered schedule matching for company ${companyId}`);
        } catch (matchErr) {
          console.error('Schedule matching error:', matchErr);
        }
      }

      results.push({
        companyId,
        devicesPolled: deviceList.length,
        recordsSynced: totalSynced,
        errors
      });
    }

    const summary = {
      companiesProcessed: results.length,
      totalDevicesPolled: results.reduce((sum, r) => sum + r.devicesPolled, 0),
      totalRecordsSynced: results.reduce((sum, r) => sum + r.recordsSynced, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0)
    };

    console.log('Polling complete:', summary);

    return new Response(JSON.stringify({ summary, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in poll-timeclock-devices:', error);
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
