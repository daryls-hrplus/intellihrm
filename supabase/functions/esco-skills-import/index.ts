import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ESCO_API_BASE = "https://ec.europa.eu/esco/api";

interface EscoSkill {
  uri: string;
  title: string;
  description?: string;
  skillType?: string;
  conceptType?: string;
  altLabels?: string[];
  broaderConcepts?: { uri: string; title: string }[];
}

interface EscoOccupation {
  uri: string;
  title: string;
  description?: string;
  altLabels?: string[];
}

interface SearchResult {
  total: number;
  count: number;
  offset: number;
  skills?: EscoSkill[];
  occupations?: EscoOccupation[];
}

// Rate limiting - track requests
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 200ms between requests

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
  
  console.log(`[ESCO API] Fetching: ${url}`);
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  
  if (!response.ok) {
    console.error(`[ESCO API] Error: ${response.status} ${response.statusText}`);
    throw new Error(`ESCO API error: ${response.status} ${response.statusText}`);
  }
  
  return response;
}

async function searchSkills(
  query: string,
  language: string = "en",
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult> {
  const url = `${ESCO_API_BASE}/search?text=${encodeURIComponent(query)}&language=${language}&type=skill&limit=${limit}&offset=${offset}`;
  const response = await rateLimitedFetch(url);
  const data = await response.json();
  
  console.log(`[ESCO API] Search skills result: ${data._embedded?.results?.length || 0} items`);
  
  const skills: EscoSkill[] = (data._embedded?.results || []).map((item: any) => ({
    uri: item.uri,
    title: item.title,
    description: item.description,
    skillType: item.skillType,
    conceptType: item.className,
    altLabels: item.alternativeLabels || [],
  }));
  
  return {
    total: data.total || 0,
    count: skills.length,
    offset: offset,
    skills,
  };
}

async function searchOccupations(
  query: string,
  language: string = "en",
  limit: number = 20,
  offset: number = 0
): Promise<SearchResult> {
  const url = `${ESCO_API_BASE}/search?text=${encodeURIComponent(query)}&language=${language}&type=occupation&limit=${limit}&offset=${offset}`;
  const response = await rateLimitedFetch(url);
  const data = await response.json();
  
  console.log(`[ESCO API] Search occupations result: ${data._embedded?.results?.length || 0} items`);
  
  const occupations: EscoOccupation[] = (data._embedded?.results || []).map((item: any) => ({
    uri: item.uri,
    title: item.title,
    description: item.description,
    altLabels: item.alternativeLabels || [],
  }));
  
  return {
    total: data.total || 0,
    count: occupations.length,
    offset: offset,
    occupations,
  };
}

async function getSkillDetails(uri: string, language: string = "en"): Promise<EscoSkill | null> {
  const url = `${ESCO_API_BASE}/resource/skill?uri=${encodeURIComponent(uri)}&language=${language}`;
  const response = await rateLimitedFetch(url);
  const data = await response.json();
  
  if (!data.uri) return null;
  
  return {
    uri: data.uri,
    title: data.title,
    description: data.description?.en?.literal || data.description,
    skillType: data.skillType,
    conceptType: data.className,
    altLabels: Object.values(data.alternativeLabel || {}).flat() as string[],
    broaderConcepts: (data._links?.broaderSkill || []).map((s: any) => ({
      uri: s.uri,
      title: s.title,
    })),
  };
}

async function getOccupationSkills(
  occupationUri: string,
  language: string = "en"
): Promise<EscoSkill[]> {
  const url = `${ESCO_API_BASE}/resource/occupation?uri=${encodeURIComponent(occupationUri)}&language=${language}`;
  const response = await rateLimitedFetch(url);
  const data = await response.json();
  
  const skills: EscoSkill[] = [];
  
  // Essential skills
  const essentialSkills = data._links?.hasEssentialSkill || [];
  for (const skill of essentialSkills) {
    skills.push({
      uri: skill.uri,
      title: skill.title,
      skillType: "essential",
      conceptType: "skill",
    });
  }
  
  // Optional skills
  const optionalSkills = data._links?.hasOptionalSkill || [];
  for (const skill of optionalSkills) {
    skills.push({
      uri: skill.uri,
      title: skill.title,
      skillType: "optional",
      conceptType: "skill",
    });
  }
  
  console.log(`[ESCO API] Occupation skills: ${skills.length} (${essentialSkills.length} essential, ${optionalSkills.length} optional)`);
  
  return skills;
}

async function checkDuplicates(
  supabase: any,
  skills: EscoSkill[],
  companyId?: string
): Promise<{ skill: EscoSkill; duplicateId?: string; duplicateName?: string }[]> {
  const results: { skill: EscoSkill; duplicateId?: string; duplicateName?: string }[] = [];
  
  for (const skill of skills) {
    // Check by ESCO URI first
    let query = supabase
      .from("skills_competencies")
      .select("id, name, esco_uri")
      .eq("esco_uri", skill.uri);
    
    if (companyId) {
      query = query.or(`company_id.eq.${companyId},company_id.is.null`);
    }
    
    const { data: uriMatch } = await query.limit(1);
    
    if (uriMatch && uriMatch.length > 0) {
      results.push({
        skill,
        duplicateId: uriMatch[0].id,
        duplicateName: uriMatch[0].name,
      });
      continue;
    }
    
    // Check by name similarity
    let nameQuery = supabase
      .from("skills_competencies")
      .select("id, name")
      .ilike("name", skill.title);
    
    if (companyId) {
      nameQuery = nameQuery.or(`company_id.eq.${companyId},company_id.is.null`);
    }
    
    const { data: nameMatch } = await nameQuery.limit(1);
    
    if (nameMatch && nameMatch.length > 0) {
      results.push({
        skill,
        duplicateId: nameMatch[0].id,
        duplicateName: nameMatch[0].name,
      });
    } else {
      results.push({ skill });
    }
  }
  
  return results;
}

async function importSkills(
  supabase: any,
  skills: EscoSkill[],
  companyId: string,
  userId: string,
  language: string,
  sourceOccupation?: { uri: string; label: string }
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  
  for (const skill of skills) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from("skills_competencies")
        .select("id")
        .eq("esco_uri", skill.uri)
        .or(`company_id.eq.${companyId},company_id.is.null`)
        .limit(1);
      
      if (existing && existing.length > 0) {
        skipped++;
        console.log(`[Import] Skipped existing: ${skill.title}`);
        
        // Log the skip
        await supabase.from("esco_import_log").insert({
          company_id: companyId,
          imported_by: userId,
          skill_competency_id: existing[0].id,
          esco_uri: skill.uri,
          esco_skill_type: skill.skillType,
          esco_concept_type: skill.conceptType,
          esco_preferred_label: skill.title,
          source_occupation_uri: sourceOccupation?.uri,
          source_occupation_label: sourceOccupation?.label,
          import_language: language,
          import_status: "skipped",
          duplicate_detected: true,
          duplicate_of_id: existing[0].id,
        });
        continue;
      }
      
      // Generate code from title
      const code = skill.title
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .substring(0, 20);
      
      // Insert the skill
      const { data: inserted, error: insertError } = await supabase
        .from("skills_competencies")
        .insert({
          company_id: companyId,
          name: skill.title,
          code: `ESCO_${code}_${Date.now().toString(36).slice(-4)}`,
          description: skill.description || null,
          type: "skill",
          category: "technical",
          status: "active",
          esco_uri: skill.uri,
          esco_skill_type: skill.skillType,
          esco_concept_type: skill.conceptType,
          external_source: "esco",
          external_sync_status: "synced",
          last_external_sync_at: new Date().toISOString(),
          created_by: userId,
        })
        .select()
        .single();
      
      if (insertError) {
        errors.push(`Failed to import "${skill.title}": ${insertError.message}`);
        console.error(`[Import] Error: ${insertError.message}`);
        continue;
      }
      
      // Log successful import
      await supabase.from("esco_import_log").insert({
        company_id: companyId,
        imported_by: userId,
        skill_competency_id: inserted.id,
        esco_uri: skill.uri,
        esco_skill_type: skill.skillType,
        esco_concept_type: skill.conceptType,
        esco_preferred_label: skill.title,
        source_occupation_uri: sourceOccupation?.uri,
        source_occupation_label: sourceOccupation?.label,
        import_language: language,
        import_status: "completed",
        duplicate_detected: false,
      });
      
      imported++;
      console.log(`[Import] Imported: ${skill.title}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`Exception importing "${skill.title}": ${errorMsg}`);
      console.error(`[Import] Exception: ${errorMsg}`);
    }
  }
  
  return { imported, skipped, errors };
}

async function checkGuardrails(
  supabase: any,
  companyId: string,
  skillCount: number
): Promise<{ allowed: boolean; reason?: string }> {
  // Check daily import limit
  const { data: limitConfig } = await supabase
    .from("ai_guardrails_config")
    .select("config_value")
    .eq("config_key", "esco_max_daily_imports")
    .eq("guardrail_type", "external_import")
    .eq("is_active", true)
    .single();
  
  if (limitConfig) {
    const limit = limitConfig.config_value.limit || 100;
    
    // Count today's imports
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("esco_import_log")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)
      .gte("created_at", `${today}T00:00:00Z`);
    
    if ((count || 0) + skillCount > limit) {
      return {
        allowed: false,
        reason: `Daily import limit of ${limit} skills would be exceeded. Already imported ${count || 0} today.`,
      };
    }
  }
  
  return { allowed: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, ...params } = await req.json();
    console.log(`[ESCO Import] Action: ${action}`, params);

    switch (action) {
      case "search_skills": {
        const { query, language = "en", limit = 20, offset = 0 } = params;
        const result = await searchSkills(query, language, limit, offset);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "search_occupations": {
        const { query, language = "en", limit = 20, offset = 0 } = params;
        const result = await searchOccupations(query, language, limit, offset);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_skill_details": {
        const { uri, language = "en" } = params;
        const result = await getSkillDetails(uri, language);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_occupation_skills": {
        const { occupationUri, language = "en" } = params;
        const result = await getOccupationSkills(occupationUri, language);
        return new Response(JSON.stringify({ skills: result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "check_duplicates": {
        const { skills, companyId } = params;
        const result = await checkDuplicates(supabaseClient, skills, companyId);
        return new Response(JSON.stringify({ results: result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "import_skills": {
        const { skills, companyId, userId, language = "en", sourceOccupation } = params;
        
        // Check guardrails
        const guardrailCheck = await checkGuardrails(supabaseClient, companyId, skills.length);
        if (!guardrailCheck.allowed) {
          return new Response(
            JSON.stringify({ error: guardrailCheck.reason, guardrailViolation: true }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const result = await importSkills(
          supabaseClient,
          skills,
          companyId,
          userId,
          language,
          sourceOccupation
        );
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_import_history": {
        const { companyId, limit = 50 } = params;
        const { data, error } = await supabaseClient
          .from("esco_import_log")
          .select(`
            *,
            skill_competency:skill_competency_id (id, name, code)
          `)
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return new Response(JSON.stringify({ history: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "bulk_import_occupation": {
        const { occupationUri, occupationLabel, companyId, userId, language = "en", sourceOccupation } = params;
        
        // Check guardrails first
        const guardrailCheck = await checkGuardrails(supabaseClient, companyId, 100);
        if (!guardrailCheck.allowed) {
          return new Response(
            JSON.stringify({ error: guardrailCheck.reason, guardrailViolation: true }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        let actualOccupationUri = occupationUri;
        let actualOccupationLabel = occupationLabel || sourceOccupation?.label || "";
        
        // If the URI doesn't work, try searching for the occupation by name
        try {
          const skills = await getOccupationSkills(actualOccupationUri, language);
          
          if (skills.length === 0) {
            return new Response(
              JSON.stringify({ imported: 0, skipped: 0, errors: ["No skills found for occupation"] }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Import the skills
          const result = await importSkills(
            supabaseClient,
            skills,
            companyId,
            userId,
            language,
            sourceOccupation || { uri: actualOccupationUri, label: actualOccupationLabel }
          );
          
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (err) {
          // If direct URI fails, try searching by occupation name
          console.log(`[ESCO Import] Direct URI failed, searching by name: ${actualOccupationLabel}`);
          
          if (!actualOccupationLabel) {
            return new Response(
              JSON.stringify({ error: "Occupation not found in ESCO API", imported: 0, skipped: 0, errors: ["Occupation URI not valid and no label provided for search"] }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Search for the occupation by name
          const searchResult = await searchOccupations(actualOccupationLabel, language, 5, 0);
          
          if (!searchResult.occupations || searchResult.occupations.length === 0) {
            return new Response(
              JSON.stringify({ error: `No occupation found matching "${actualOccupationLabel}"`, imported: 0, skipped: 0, errors: [`Occupation "${actualOccupationLabel}" not found in ESCO`] }),
              { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Use the first (best match) result
          const matchedOccupation = searchResult.occupations[0];
          console.log(`[ESCO Import] Found occupation: ${matchedOccupation.title} (${matchedOccupation.uri})`);
          
          // Now get skills for this occupation
          const skills = await getOccupationSkills(matchedOccupation.uri, language);
          
          if (skills.length === 0) {
            return new Response(
              JSON.stringify({ imported: 0, skipped: 0, errors: [`No skills found for occupation "${matchedOccupation.title}"`] }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Import the skills
          const result = await importSkills(
            supabaseClient,
            skills,
            companyId,
            userId,
            language,
            { uri: matchedOccupation.uri, label: matchedOccupation.title }
          );
          
          return new Response(JSON.stringify({
            ...result,
            matchedOccupation: { uri: matchedOccupation.uri, title: matchedOccupation.title }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      case "get_industry_occupations": {
        const { industryCode } = params;
        const { data, error } = await supabaseClient
          .from("industry_occupation_mappings")
          .select("*")
          .eq("industry_code", industryCode)
          .order("priority");
        
        if (error) throw error;
        return new Response(JSON.stringify({ occupations: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[ESCO Import] Error:", error);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
