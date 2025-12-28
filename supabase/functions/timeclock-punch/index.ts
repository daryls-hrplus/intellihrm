import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PunchPayload {
  device_code: string;
  employee_badge?: string;
  employee_id?: string;
  punch_type: "clock_in" | "clock_out" | "break_start" | "break_end";
  punch_time?: string;
  verification_method?: string;
  biometric_data?: string;
  photo_url?: string;
  latitude?: number;
  longitude?: number;
  break_type?: "standard" | "meal" | "rest" | "other";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get device API key from header
    const deviceApiKey = req.headers.get("x-device-api-key");
    if (!deviceApiKey) {
      return new Response(JSON.stringify({ error: "Missing device API key" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const payload: PunchPayload = await req.json();

    // Validate device
    const { data: device, error: deviceError } = await supabase
      .from("timeclock_devices")
      .select("*")
      .eq("device_code", payload.device_code)
      .eq("api_key", deviceApiKey)
      .eq("is_active", true)
      .single();

    if (deviceError || !device) {
      return new Response(JSON.stringify({ error: "Invalid or inactive device" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Update device heartbeat
    await supabase.from("timeclock_devices").update({
      last_heartbeat_at: new Date().toISOString(),
      sync_status: "online",
    }).eq("id", device.id);

    // Find employee
    let employeeId = payload.employee_id;
    if (!employeeId && payload.employee_badge) {
      const { data: employee } = await supabase
        .from("profiles")
        .select("id")
        .eq("employee_id", payload.employee_badge)
        .eq("company_id", device.company_id)
        .single();
      
      if (employee) employeeId = employee.id;
    }

    const punchTime = payload.punch_time || new Date().toISOString();

    // If biometric verification required, validate
    if (device.device_type === "biometric" || device.device_type === "facial") {
      if (payload.biometric_data && employeeId) {
        const { data: template } = await supabase
          .from("employee_biometric_templates")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("is_active", true)
          .single();

        // In production, would compare biometric data here
        if (!template) {
          // Queue punch for manual review
          await supabase.from("timeclock_punch_queue").insert({
            device_id: device.id,
            employee_id: employeeId,
            employee_badge: payload.employee_badge,
            punch_time: punchTime,
            punch_type: payload.punch_type,
            verification_method: "biometric_failed",
            processed: false,
            error_message: "Biometric template not found",
          });

          return new Response(JSON.stringify({ success: false, error: "Biometric verification failed", queued: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    if (!employeeId) {
      // Queue for manual resolution
      await supabase.from("timeclock_punch_queue").insert({
        device_id: device.id,
        employee_badge: payload.employee_badge,
        punch_time: punchTime,
        punch_type: payload.punch_type,
        verification_method: payload.verification_method,
        processed: false,
        error_message: "Employee not found",
      });

      return new Response(JSON.stringify({ success: false, error: "Employee not found", queued: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Process punch based on type
    if (payload.punch_type === "clock_in") {
      // Check for existing open entry
      const { data: openEntry } = await supabase
        .from("time_clock_entries")
        .select("id")
        .eq("employee_id", employeeId)
        .is("clock_out", null)
        .single();

      if (openEntry) {
        return new Response(JSON.stringify({ success: false, error: "Already clocked in" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Create new entry
      const { data: entry, error } = await supabase.from("time_clock_entries").insert({
        company_id: device.company_id,
        employee_id: employeeId,
        clock_in: punchTime,
        status: "in_progress",
        clock_in_latitude: payload.latitude,
        clock_in_longitude: payload.longitude,
        clock_in_photo_url: payload.photo_url,
      }).select().single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, entry_id: entry.id, message: "Clocked in successfully" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else if (payload.punch_type === "clock_out") {
      // Find open entry
      const { data: openEntry } = await supabase
        .from("time_clock_entries")
        .select("*")
        .eq("employee_id", employeeId)
        .is("clock_out", null)
        .order("clock_in", { ascending: false })
        .limit(1)
        .single();

      if (!openEntry) {
        return new Response(JSON.stringify({ success: false, error: "No active clock-in found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Get total break duration from time_clock_breaks
      const { data: breaks } = await supabase
        .from("time_clock_breaks")
        .select("duration_minutes, is_paid")
        .eq("time_clock_entry_id", openEntry.id);

      const unpaidBreakMinutes = (breaks || [])
        .filter(b => !b.is_paid)
        .reduce((sum, b) => sum + (b.duration_minutes || 0), 0);

      // Calculate hours
      const clockIn = new Date(openEntry.clock_in);
      const clockOut = new Date(punchTime);
      const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
      const workMinutes = totalMinutes - unpaidBreakMinutes;
      const totalHours = Math.round((workMinutes / 60) * 100) / 100;

      // Update entry
      const { error } = await supabase.from("time_clock_entries").update({
        clock_out: punchTime,
        status: "completed",
        total_hours: totalHours,
        break_duration_minutes: unpaidBreakMinutes,
        clock_out_latitude: payload.latitude,
        clock_out_longitude: payload.longitude,
        clock_out_photo_url: payload.photo_url,
      }).eq("id", openEntry.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, entry_id: openEntry.id, total_hours: totalHours.toFixed(2), message: "Clocked out successfully" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    
    } else if (payload.punch_type === "break_start") {
      // Find open entry
      const { data: openEntry } = await supabase
        .from("time_clock_entries")
        .select("id")
        .eq("employee_id", employeeId)
        .is("clock_out", null)
        .order("clock_in", { ascending: false })
        .limit(1)
        .single();

      if (!openEntry) {
        return new Response(JSON.stringify({ success: false, error: "No active clock-in found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Check for open breaks
      const { data: openBreak } = await supabase
        .from("time_clock_breaks")
        .select("id")
        .eq("time_clock_entry_id", openEntry.id)
        .is("break_end", null)
        .single();

      if (openBreak) {
        return new Response(JSON.stringify({ success: false, error: "Already on break" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Create new break record
      const { data: breakRecord, error } = await supabase.from("time_clock_breaks").insert({
        time_clock_entry_id: openEntry.id,
        break_start: punchTime,
        break_type: payload.break_type || "standard",
      }).select().single();

      if (error) throw error;

      // Also update legacy field for backwards compatibility
      await supabase.from("time_clock_entries").update({
        break_start: punchTime,
      }).eq("id", openEntry.id);

      return new Response(JSON.stringify({ success: true, break_id: breakRecord.id, message: "Break started" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    } else if (payload.punch_type === "break_end") {
      // Find open entry
      const { data: openEntry } = await supabase
        .from("time_clock_entries")
        .select("id")
        .eq("employee_id", employeeId)
        .is("clock_out", null)
        .order("clock_in", { ascending: false })
        .limit(1)
        .single();

      if (!openEntry) {
        return new Response(JSON.stringify({ success: false, error: "No active clock-in found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Find open break
      const { data: openBreak } = await supabase
        .from("time_clock_breaks")
        .select("*")
        .eq("time_clock_entry_id", openEntry.id)
        .is("break_end", null)
        .order("break_start", { ascending: false })
        .limit(1)
        .single();

      if (!openBreak) {
        return new Response(JSON.stringify({ success: false, error: "No active break found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Calculate break duration
      const breakStart = new Date(openBreak.break_start);
      const breakEnd = new Date(punchTime);
      const durationMinutes = Math.round((breakEnd.getTime() - breakStart.getTime()) / (1000 * 60));

      // Update break record
      const { error } = await supabase.from("time_clock_breaks").update({
        break_end: punchTime,
        duration_minutes: durationMinutes,
      }).eq("id", openBreak.id);

      if (error) throw error;

      // Calculate total break duration for this entry
      const { data: allBreaks } = await supabase
        .from("time_clock_breaks")
        .select("duration_minutes")
        .eq("time_clock_entry_id", openEntry.id);

      const totalBreakMinutes = (allBreaks || []).reduce((sum, b) => sum + (b.duration_minutes || 0), 0);

      // Update legacy fields for backwards compatibility
      await supabase.from("time_clock_entries").update({
        break_end: punchTime,
        break_duration_minutes: totalBreakMinutes,
      }).eq("id", openEntry.id);

      return new Response(JSON.stringify({ success: true, break_id: openBreak.id, duration_minutes: durationMinutes, message: "Break ended" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid punch type" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    console.error("Error processing punch:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
