import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting store (in-memory, per instance)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface ApiKeyData {
  id: string;
  company_id: string;
  scopes: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  expires_at: string | null;
}

interface JWTPayload {
  api_key_id: string;
  company_id: string;
  scopes: string[];
  exp: number;
  iat: number;
}

// Helper: Create error response
function errorResponse(code: string, message: string, status: number) {
  return new Response(
    JSON.stringify({ error: { code, message, status } }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// Helper: Create success response
function successResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(
    JSON.stringify(data),
    { status, headers: { ...corsHeaders, ...extraHeaders, "Content-Type": "application/json" } }
  );
}

// Helper: Hash API key
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper: Create JWT
async function createJWT(payload: JWTPayload, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encode = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const data = `${headerB64}.${payloadB64}`;
  
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  return `${data}.${signatureB64}`;
}

// Helper: Verify JWT
async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [headerB64, payloadB64, signatureB64] = parts;
    const data = `${headerB64}.${payloadB64}`;
    
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const signatureArr = Uint8Array.from(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );
    
    const valid = await crypto.subtle.verify("HMAC", key, signatureArr, new TextEncoder().encode(data));
    if (!valid) return null;
    
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))) as JWTPayload;
    
    // Check expiry
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    
    return payload;
  } catch {
    return null;
  }
}

// Helper: Check rate limit
function checkRateLimit(keyId: string, limit: number): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(keyId);
  
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(keyId, { count: 1, resetAt: now + 60000 });
    return { allowed: true, remaining: limit - 1, resetIn: 60 };
  }
  
  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: Math.ceil((entry.resetAt - now) / 1000) };
  }
  
  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetIn: Math.ceil((entry.resetAt - now) / 1000) };
}

// Helper: Log request
async function logRequest(
  supabase: any,
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  startTime: number,
  ipAddress: string | null,
  userAgent: string | null,
  errorMessage: string | null = null
) {
  try {
    // Use any to bypass type checking for dynamic table
    await (supabase as any).from("api_request_logs").insert({
      api_key_id: apiKeyId,
      endpoint,
      method,
      status_code: statusCode,
      ip_address: ipAddress,
      user_agent: userAgent,
      response_time_ms: Date.now() - startTime,
      error_message: errorMessage,
    });
  } catch (e) {
    console.error("Failed to log request:", e);
  }
}

// Helper: Parse query params
function getQueryParams(url: URL): Record<string, string> {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// Helper: Parse pagination
function parsePagination(params: Record<string, string>): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || "50", 10)));
  return { page, limit, offset: (page - 1) * limit };
}

serve(async (req) => {
  const startTime = Date.now();
  const url = new URL(req.url);
  const path = url.pathname.replace("/external-api", "");
  const method = req.method;
  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip");
  const userAgent = req.headers.get("user-agent");
  
  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const jwtSecret = Deno.env.get("SUPABASE_JWT_SECRET") || Deno.env.get("JWT_SECRET") || "your-secret-key";
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Route: POST /auth/token - Exchange API key for JWT
    if (path === "/auth/token" && method === "POST") {
      const body = await req.json();
      const apiKey = body.api_key;
      
      if (!apiKey || typeof apiKey !== "string") {
        return errorResponse("VALIDATION_ERROR", "api_key is required", 400);
      }
      
      const keyHash = await hashApiKey(apiKey);
      
      const { data: keyData, error } = await supabase
        .from("api_keys")
        .select("id, company_id, scopes, rate_limit_per_minute, is_active, expires_at")
        .eq("key_hash", keyHash)
        .single();
      
      if (error || !keyData) {
        return errorResponse("INVALID_API_KEY", "API key not found or invalid", 401);
      }
      
      const key = keyData as ApiKeyData;
      
      if (!key.is_active) {
        return errorResponse("INVALID_API_KEY", "API key is inactive", 401);
      }
      
      if (key.expires_at && new Date(key.expires_at) < new Date()) {
        return errorResponse("INVALID_API_KEY", "API key has expired", 401);
      }
      
      // Update last_used_at
      await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", key.id);
      
      // Create JWT (15 min expiry)
      const payload: JWTPayload = {
        api_key_id: key.id,
        company_id: key.company_id,
        scopes: key.scopes,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
      };
      
      const token = await createJWT(payload, jwtSecret);
      
      await logRequest(supabase, key.id, path, method, 200, startTime, ipAddress, userAgent);
      
      return successResponse({
        access_token: token,
        token_type: "Bearer",
        expires_in: 900,
        scopes: key.scopes,
      });
    }
    
    // All other routes require Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse("INVALID_TOKEN", "Authorization header with Bearer token required", 401);
    }
    
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyJWT(token, jwtSecret);
    
    if (!payload) {
      return errorResponse("INVALID_TOKEN", "Invalid or expired token", 401);
    }
    
    // Check rate limit
    const rateLimit = checkRateLimit(payload.api_key_id, 60);
    const rateLimitHeaders = {
      "X-RateLimit-Limit": "60",
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": rateLimit.resetIn.toString(),
    };
    
    if (!rateLimit.allowed) {
      await logRequest(supabase, payload.api_key_id, path, method, 429, startTime, ipAddress, userAgent, "Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests", status: 429 } }),
        { status: 429, headers: { ...corsHeaders, ...rateLimitHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const params = getQueryParams(url);
    const companyId = payload.company_id;
    const scopes = payload.scopes;
    
    // Route: GET /employees
    if (path === "/employees" && method === "GET") {
      if (!scopes.includes("employees:read")) {
        return errorResponse("INSUFFICIENT_SCOPE", "Scope 'employees:read' required", 403);
      }
      
      const { page, limit, offset } = parsePagination(params);
      
      let query = supabase
        .from("profiles")
        .select("id, employee_id, full_name, email, department_id, employment_status, start_date, updated_at, departments(name)", { count: "exact" })
        .eq("company_id", companyId);
      
      if (params.status && params.status !== "all") {
        query = query.eq("employment_status", params.status);
      }
      if (params.department_id) {
        query = query.eq("department_id", params.department_id);
      }
      if (params.updated_since) {
        query = query.gte("updated_at", params.updated_since);
      }
      
      const { data, count, error } = await query.range(offset, offset + limit - 1).order("full_name");
      
      if (error) {
        await logRequest(supabase, payload.api_key_id, path, method, 500, startTime, ipAddress, userAgent, error.message);
        return errorResponse("INTERNAL_ERROR", error.message, 500);
      }
      
      const employees = (data || []).map((e: any) => ({
        id: e.id,
        employee_id: e.employee_id,
        full_name: e.full_name,
        email: e.email,
        department_id: e.department_id,
        department_name: e.departments?.name || null,
        employment_status: e.employment_status,
        start_date: e.start_date,
        updated_at: e.updated_at,
      }));
      
      await logRequest(supabase, payload.api_key_id, path, method, 200, startTime, ipAddress, userAgent);
      
      return successResponse(
        {
          data: employees,
          pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
        },
        200,
        rateLimitHeaders
      );
    }
    
    // Route: GET /employees/:id
    const employeeMatch = path.match(/^\/employees\/([a-f0-9-]+)$/);
    if (employeeMatch && method === "GET") {
      if (!scopes.includes("employees:read")) {
        return errorResponse("INSUFFICIENT_SCOPE", "Scope 'employees:read' required", 403);
      }
      
      const employeeId = employeeMatch[1];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*, departments(id, name), positions(id, title)")
        .eq("id", employeeId)
        .eq("company_id", companyId)
        .single();
      
      if (error || !data) {
        await logRequest(supabase, payload.api_key_id, path, method, 404, startTime, ipAddress, userAgent, "Employee not found");
        return errorResponse("RESOURCE_NOT_FOUND", "Employee not found", 404);
      }
      
      const employee = {
        id: data.id,
        employee_id: data.employee_id,
        full_name: data.full_name,
        first_name: data.first_name,
        first_last_name: data.first_last_name,
        email: data.email,
        department: data.departments,
        position: data.positions,
        employment_status: data.employment_status,
        start_date: data.start_date,
        hire_date: data.hire_date,
        manager_id: data.reports_to,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      await logRequest(supabase, payload.api_key_id, path, method, 200, startTime, ipAddress, userAgent);
      
      return successResponse(employee, 200, rateLimitHeaders);
    }
    
    // Route: GET /leave/requests
    if (path === "/leave/requests" && method === "GET") {
      if (!scopes.includes("leave:read")) {
        return errorResponse("INSUFFICIENT_SCOPE", "Scope 'leave:read' required", 403);
      }
      
      const { page, limit, offset } = parsePagination(params);
      
      let query = supabase
        .from("leave_requests")
        .select("id, request_number, employee_id, start_date, end_date, duration, status, created_at, reviewed_by, reviewed_at, profiles!leave_requests_employee_id_fkey(full_name), leave_types(id, code, name)", { count: "exact" })
        .eq("company_id", companyId);
      
      if (params.employee_id) {
        query = query.eq("employee_id", params.employee_id);
      }
      if (params.status) {
        query = query.eq("status", params.status);
      }
      if (params.start_date) {
        query = query.gte("start_date", params.start_date);
      }
      if (params.end_date) {
        query = query.lte("end_date", params.end_date);
      }
      
      const { data, count, error } = await query.range(offset, offset + limit - 1).order("created_at", { ascending: false });
      
      if (error) {
        await logRequest(supabase, payload.api_key_id, path, method, 500, startTime, ipAddress, userAgent, error.message);
        return errorResponse("INTERNAL_ERROR", error.message, 500);
      }
      
      const requests = (data || []).map((r: any) => ({
        id: r.id,
        request_number: r.request_number,
        employee_id: r.employee_id,
        employee_name: r.profiles?.full_name || null,
        leave_type: r.leave_types,
        start_date: r.start_date,
        end_date: r.end_date,
        duration: r.duration,
        status: r.status,
        submitted_at: r.created_at,
        reviewed_by: r.reviewed_by,
        reviewed_at: r.reviewed_at,
      }));
      
      await logRequest(supabase, payload.api_key_id, path, method, 200, startTime, ipAddress, userAgent);
      
      return successResponse(
        {
          data: requests,
          pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
        },
        200,
        rateLimitHeaders
      );
    }
    
    // Route: GET /leave/balances
    if (path === "/leave/balances" && method === "GET") {
      if (!scopes.includes("leave:read")) {
        return errorResponse("INSUFFICIENT_SCOPE", "Scope 'leave:read' required", 403);
      }
      
      const year = parseInt(params.year || new Date().getFullYear().toString(), 10);
      
      let query = supabase
        .from("leave_balances")
        .select("employee_id, leave_year, opening_balance, accrued, used, carried_forward, current_balance, profiles!leave_balances_employee_id_fkey(full_name), leave_types(id, code, name)")
        .eq("company_id", companyId)
        .eq("leave_year", year);
      
      if (params.employee_id) {
        query = query.eq("employee_id", params.employee_id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        await logRequest(supabase, payload.api_key_id, path, method, 500, startTime, ipAddress, userAgent, error.message);
        return errorResponse("INTERNAL_ERROR", error.message, 500);
      }
      
      const balances = (data || []).map((b: any) => ({
        employee_id: b.employee_id,
        employee_name: b.profiles?.full_name || null,
        leave_type: b.leave_types,
        year: b.leave_year,
        opening_balance: b.opening_balance,
        accrued: b.accrued,
        used: b.used,
        carried_forward: b.carried_forward,
        current_balance: b.current_balance,
      }));
      
      await logRequest(supabase, payload.api_key_id, path, method, 200, startTime, ipAddress, userAgent);
      
      return successResponse({ data: balances }, 200, rateLimitHeaders);
    }
    
    // Route: GET /payroll/records
    if (path === "/payroll/records" && method === "GET") {
      if (!scopes.includes("payroll:read")) {
        return errorResponse("INSUFFICIENT_SCOPE", "Scope 'payroll:read' required", 403);
      }
      
      const { page, limit, offset } = parsePagination(params);
      
      let query = supabase
        .from("payroll_records")
        .select("id, employee_id, gross_pay, total_deductions, net_pay, currency, regular_hours, overtime_hours, created_at, profiles!payroll_records_employee_id_fkey(full_name), payroll_runs(id, run_number, status, pay_date, period_start, period_end)", { count: "exact" })
        .eq("company_id", companyId);
      
      if (params.employee_id) {
        query = query.eq("employee_id", params.employee_id);
      }
      
      const { data, count, error } = await query.range(offset, offset + limit - 1).order("created_at", { ascending: false });
      
      if (error) {
        await logRequest(supabase, payload.api_key_id, path, method, 500, startTime, ipAddress, userAgent, error.message);
        return errorResponse("INTERNAL_ERROR", error.message, 500);
      }
      
      const records = (data || []).map((r: any) => {
        const run = r.payroll_runs;
        return {
          id: r.id,
          employee_id: r.employee_id,
          employee_name: r.profiles?.full_name || null,
          payroll_run: run ? {
            id: run.id,
            run_number: run.run_number,
            status: run.status,
            pay_date: run.pay_date,
          } : null,
          pay_period: run ? {
            start: run.period_start,
            end: run.period_end,
          } : null,
          gross_pay: r.gross_pay,
          total_deductions: r.total_deductions,
          net_pay: r.net_pay,
          currency: r.currency,
          hours: {
            regular: r.regular_hours,
            overtime: r.overtime_hours,
          },
        };
      });
      
      await logRequest(supabase, payload.api_key_id, path, method, 200, startTime, ipAddress, userAgent);
      
      return successResponse(
        {
          data: records,
          pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
        },
        200,
        rateLimitHeaders
      );
    }
    
    // Route: GET /competencies
    if (path === "/competencies" && method === "GET") {
      if (!scopes.includes("competencies:read")) {
        return errorResponse("INSUFFICIENT_SCOPE", "Scope 'competencies:read' required", 403);
      }
      
      // Get employee competencies
      let compQuery = supabase
        .from("employee_competencies")
        .select("employee_id, assessed_level, required_level, assessed_at, profiles!employee_competencies_employee_id_fkey(full_name), competencies(id, name, category)")
        .eq("company_id", companyId);
      
      if (params.employee_id) {
        compQuery = compQuery.eq("employee_id", params.employee_id);
      }
      
      const { data: compData, error: compError } = await compQuery;
      
      // Get employee certificates
      let certQuery = supabase
        .from("employee_certificates")
        .select("id, employee_id, certificate_name, issuing_organization, issue_date, expiry_date, status, profiles!employee_certificates_employee_id_fkey(full_name)")
        .eq("company_id", companyId);
      
      if (params.employee_id) {
        certQuery = certQuery.eq("employee_id", params.employee_id);
      }
      
      const { data: certData, error: certError } = await certQuery;
      
      if (compError || certError) {
        const errMsg = compError?.message || certError?.message || "Unknown error";
        await logRequest(supabase, payload.api_key_id, path, method, 500, startTime, ipAddress, userAgent, errMsg);
        return errorResponse("INTERNAL_ERROR", errMsg, 500);
      }
      
      // Group by employee
      const employeeMap = new Map<string, { employee_id: string; employee_name: string; competencies: any[]; certificates: any[] }>();
      
      for (const c of (compData || []) as any[]) {
        const empId = c.employee_id as string;
        if (!employeeMap.has(empId)) {
          employeeMap.set(empId, {
            employee_id: empId,
            employee_name: c.profiles?.full_name || "",
            competencies: [],
            certificates: [],
          });
        }
        const comp = c.competencies;
        employeeMap.get(empId)!.competencies.push({
          id: comp?.id,
          name: comp?.name,
          category: comp?.category,
          assessed_level: c.assessed_level,
          required_level: c.required_level,
          assessed_date: c.assessed_at,
        });
      }
      
      for (const cert of (certData || []) as any[]) {
        const empId = cert.employee_id as string;
        if (!employeeMap.has(empId)) {
          employeeMap.set(empId, {
            employee_id: empId,
            employee_name: cert.profiles?.full_name || "",
            competencies: [],
            certificates: [],
          });
        }
        employeeMap.get(empId)!.certificates.push({
          id: cert.id,
          name: cert.certificate_name,
          issuing_organization: cert.issuing_organization,
          issue_date: cert.issue_date,
          expiry_date: cert.expiry_date,
          status: cert.status,
        });
      }
      
      await logRequest(supabase, payload.api_key_id, path, method, 200, startTime, ipAddress, userAgent);
      
      return successResponse({ data: Array.from(employeeMap.values()) }, 200, rateLimitHeaders);
    }
    
    // Route not found
    await logRequest(supabase, payload.api_key_id, path, method, 404, startTime, ipAddress, userAgent, "Endpoint not found");
    return errorResponse("RESOURCE_NOT_FOUND", `Endpoint ${method} ${path} not found`, 404);
    
  } catch (error) {
    console.error("External API error:", error);
    return errorResponse("INTERNAL_ERROR", error instanceof Error ? error.message : "Unknown error", 500);
  }
});
