import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateDescriptionRequest {
  action: 'generate_description';
  name: string;
  category?: string;
  existingDescription?: string;
}

interface SuggestKRAsRequest {
  action: 'suggest_kras';
  name: string;
  category?: string;
  description?: string;
}

interface EnrichResponsibilityRequest {
  action: 'enrich_all';
  name: string;
  category?: string;
  existingDescription?: string;
}

interface SuggestForFamilyRequest {
  action: 'suggest_for_family';
  familyName: string;
  familyDescription?: string;
  existingResponsibilities?: string[];
}

interface GenerateFamilyDescriptionRequest {
  action: 'generate_family_description';
  familyName: string;
  existingDescription?: string;
}

type RequestBody = GenerateDescriptionRequest | SuggestKRAsRequest | EnrichResponsibilityRequest | SuggestForFamilyRequest | GenerateFamilyDescriptionRequest;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    console.log('Responsibility AI Helper request:', body);

    const { action } = body;

    if (action === 'generate_description') {
      const { name, category, existingDescription } = body as GenerateDescriptionRequest;
      
      const prompt = buildDescriptionPrompt(name, category, existingDescription);
      const description = await callLovableAI(prompt, 'Generate a professional job responsibility description');
      
      return new Response(
        JSON.stringify({ success: true, description }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'suggest_kras') {
      const { name, category, description } = body as SuggestKRAsRequest;
      
      const prompt = buildKRAPrompt(name, category, description);
      const krasText = await callLovableAI(prompt, 'Generate Key Result Areas for a job responsibility');
      const kras = parseKRAs(krasText);
      
      return new Response(
        JSON.stringify({ success: true, kras }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'enrich_all') {
      const { name, category, existingDescription } = body as EnrichResponsibilityRequest;
      
      // Generate description
      const descPrompt = buildDescriptionPrompt(name, category, existingDescription);
      const description = await callLovableAI(descPrompt, 'Generate a professional job responsibility description');
      
      // Generate KRAs
      const kraPrompt = buildKRAPrompt(name, category, description);
      const krasText = await callLovableAI(kraPrompt, 'Generate Key Result Areas for a job responsibility');
      const kras = parseKRAs(krasText);
      
      // Suggest category if not provided
      let suggestedCategory = category;
      if (!category) {
        const categoryPrompt = buildCategoryPrompt(name, description);
        suggestedCategory = await callLovableAI(categoryPrompt, 'Categorize a job responsibility');
        suggestedCategory = validateCategory(suggestedCategory);
      }
      
      // Suggest complexity
      const complexityPrompt = buildComplexityPrompt(name, description, kras);
      const complexityText = await callLovableAI(complexityPrompt, 'Rate responsibility complexity');
      const complexity = parseComplexity(complexityText);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          description,
          kras,
          suggestedCategory,
          complexity
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'suggest_for_family') {
      const { familyName, familyDescription, existingResponsibilities } = body as SuggestForFamilyRequest;
      
      const prompt = buildFamilySuggestionPrompt(familyName, familyDescription, existingResponsibilities);
      const suggestions = await callLovableAIForFamilySuggestions(prompt);
      
      return new Response(
        JSON.stringify({ success: true, suggestions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'generate_family_description') {
      const { familyName, existingDescription } = body as GenerateFamilyDescriptionRequest;
      
      const prompt = buildFamilyDescriptionPrompt(familyName, existingDescription);
      const description = await callLovableAI(prompt, 'Generate job family description');
      
      return new Response(
        JSON.stringify({ success: true, description }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in responsibility-ai-helper:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildDescriptionPrompt(name: string, category?: string, existingDescription?: string): string {
  let prompt = `Generate a professional, concise job responsibility description for: "${name}"`;
  
  if (category) {
    prompt += `\nCategory: ${category}`;
  }
  
  if (existingDescription) {
    prompt += `\nExisting description to improve: "${existingDescription}"`;
  }
  
  prompt += `\n\nRequirements:
- 2-3 sentences maximum
- Use professional HR language
- Be specific about what the person does
- Include scope and expected outcomes
- Do not use bullet points, write as a paragraph`;
  
  return prompt;
}

function buildKRAPrompt(name: string, category?: string, description?: string): string {
  let prompt = `Generate 3-5 Key Result Areas (KRAs) for the job responsibility: "${name}"`;
  
  if (category) {
    prompt += `\nCategory: ${category}`;
  }
  
  if (description) {
    prompt += `\nDescription: "${description}"`;
  }
  
  prompt += `\n\nRequirements for each KRA:
- Must be measurable and specific
- Include a target or metric where possible
- Start with an action verb
- Keep each KRA to one line
- Format as a numbered list (1. 2. 3. etc.)

Example format:
1. Achieve 95% on-time delivery of reports
2. Reduce processing errors by 20% quarter over quarter
3. Maintain budget variance within 5% of approved allocation`;
  
  return prompt;
}

function buildCategoryPrompt(name: string, description: string): string {
  return `Categorize this job responsibility into exactly ONE of these categories:
- financial
- operational
- people_leadership
- technical
- compliance
- strategic
- administrative
- customer_service
- project_management

Responsibility: "${name}"
Description: "${description}"

Reply with ONLY the category name, nothing else.`;
}

function buildComplexityPrompt(name: string, description: string, kras: string[]): string {
  return `Rate the complexity level of this job responsibility on a scale of 1-5:
1 = Basic/Entry-level (routine tasks, clear instructions)
2 = Intermediate (some judgment required, moderate scope)
3 = Advanced (significant judgment, cross-functional impact)
4 = Expert (strategic thinking, organization-wide impact)
5 = Executive (sets direction, enterprise-level decisions)

Responsibility: "${name}"
Description: "${description}"
Key Result Areas: ${kras.join(', ')}

Reply with ONLY a single number (1-5), nothing else.`;
}

function buildFamilySuggestionPrompt(familyName: string, familyDescription?: string, existingResponsibilities?: string[]): string {
  let prompt = `Suggest 5-8 core job responsibilities that would be common across roles in the "${familyName}" job family.`;
  
  if (familyDescription) {
    prompt += `\n\nJob Family Description: "${familyDescription}"`;
  }
  
  if (existingResponsibilities && existingResponsibilities.length > 0) {
    prompt += `\n\nExisting responsibilities already in this job family template (avoid duplicates): ${existingResponsibilities.join(', ')}`;
  }
  
  prompt += `\n\nFor each responsibility, provide:
1. Name (short, action-oriented)
2. Category (one of: financial, operational, people_leadership, technical, compliance, strategic, administrative, customer_service, project_management)
3. Suggested weight percentage (5-30%)
4. Brief description (1-2 sentences)
5. 3-5 Key Result Areas (KRAs) - measurable outcomes that define success
6. Complexity level (1-5 where 1=basic, 3=advanced, 5=executive)

Focus on responsibilities that are:
- Foundational to the job family
- Applicable across different levels (with varying complexity)
- Measurable and outcome-oriented`;
  
  return prompt;
}

function buildFamilyDescriptionPrompt(familyName: string, existingDescription?: string): string {
  let prompt = `Generate a professional job family description for: "${familyName}"`;
  
  if (existingDescription) {
    prompt += `\n\nExisting description to improve: "${existingDescription}"`;
  }
  
  prompt += `\n\nRequirements:
- 3-4 sentences maximum
- Explain the scope and purpose of this job family
- Mention typical roles or career progression within the family
- Use professional HR language
- Be specific about the type of work and skills involved
- Do not use bullet points, write as a paragraph

Example for "Finance" job family:
"The Finance job family encompasses roles responsible for financial planning, analysis, reporting, and compliance across the organization. Professionals in this family manage budgets, forecast financial performance, and ensure accurate record-keeping in accordance with regulatory standards. Career progression typically moves from financial analyst to controller and ultimately to executive leadership positions such as CFO."`;
  
  return prompt;
}

async function callLovableAI(prompt: string, context: string): Promise<string> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.log('Using fallback response - no LOVABLE_API_KEY configured');
    return generateFallbackResponse(prompt, context);
  }

  try {
    console.log('Calling Lovable AI Gateway...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert HR professional helping to create industry-standard job responsibility documentation. Be concise and professional.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        console.log('Rate limited, using fallback');
      } else if (response.status === 402) {
        console.log('Payment required, using fallback');
      }
      
      return generateFallbackResponse(prompt, context);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    console.log('AI response received:', content?.substring(0, 100));
    return content || generateFallbackResponse(prompt, context);
  } catch (error) {
    console.error('Error calling Lovable AI:', error);
    return generateFallbackResponse(prompt, context);
  }
}

async function callLovableAIForFamilySuggestions(prompt: string): Promise<FamilySuggestion[]> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

  if (!lovableApiKey) {
    console.log('No LOVABLE_API_KEY configured; returning empty family suggestions');
    return [];
  }

  try {
    console.log('Calling Lovable AI Gateway (tool) for family suggestions...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert HR professional. Suggest practical, industry-standard job family responsibilities. Use the provided tool to return structured results.',
          },
          { role: 'user', content: prompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'return_family_suggestions',
              description: 'Return 5-8 job family responsibility suggestions with complete details including KRAs and complexity.',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Short, action-oriented responsibility name' },
                        category: {
                          type: 'string',
                          description:
                            'One of: financial, operational, people_leadership, technical, compliance, strategic, administrative, customer_service, project_management',
                        },
                        suggestedWeight: {
                          type: 'number',
                          description: 'Suggested weight percentage (5-30).',
                        },
                        description: { type: 'string', description: '1-2 sentence description of the responsibility' },
                        kras: {
                          type: 'array',
                          items: { type: 'string' },
                          description: '3-5 Key Result Areas - measurable outcomes that define success for this responsibility',
                        },
                        complexityLevel: {
                          type: 'number',
                          description: 'Complexity level 1-5 where 1=basic/entry-level, 2=intermediate, 3=advanced, 4=expert, 5=executive',
                        },
                      },
                      required: ['name', 'category', 'suggestedWeight', 'description', 'kras', 'complexityLevel'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['suggestions'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'return_family_suggestions' } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error (tool):', response.status, errorText);
      return [];
    }

    const data = await response.json();
    const argsStr = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments as string | undefined;

    if (argsStr) {
      try {
        const parsed = JSON.parse(argsStr) as { suggestions?: any[] };
        const raw = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

        const normalized = raw
          .map((s) => {
            const name = String(s?.name ?? '').trim();
            const category = validateCategory(String(s?.category ?? 'operational'));
            const suggestedWeightNum = Number(s?.suggestedWeight);
            const suggestedWeight = Number.isFinite(suggestedWeightNum)
              ? Math.min(30, Math.max(5, Math.round(suggestedWeightNum)))
              : 15;
            const description = String(s?.description ?? '').trim();
            
            // Parse KRAs - ensure it's an array of strings
            const rawKras = Array.isArray(s?.kras) ? s.kras : [];
            const kras = rawKras.map((k: any) => String(k).trim()).filter((k: string) => k.length > 0);
            
            // Parse complexity level - ensure it's 1-5
            const rawComplexity = Number(s?.complexityLevel);
            const complexityLevel = Number.isFinite(rawComplexity) 
              ? Math.min(5, Math.max(1, Math.round(rawComplexity))) 
              : 3;

            return { name, category, suggestedWeight, description, kras, complexityLevel } as FamilySuggestion;
          })
          .filter((s) => s.name && s.description);

        return normalized.slice(0, 8);
      } catch (e) {
        console.error('Failed to parse tool arguments, falling back to text parsing:', e);
      }
    }

    // Fallback: try to parse the assistant text if tool-calling didn't return args
    const content = data?.choices?.[0]?.message?.content?.trim() as string | undefined;
    if (content) return parseFamilySuggestions(content);

    return [];
  } catch (error) {
    console.error('Error calling Lovable AI (tool) for family suggestions:', error);
    return [];
  }
}

function generateFallbackResponse(prompt: string, context: string): string {
  // Extract the name from the prompt
  const nameMatch = prompt.match(/["']([^"']+)["']/);
  const name = nameMatch ? nameMatch[1] : 'this responsibility';
  
  if (context.includes('job family description')) {
    return `The ${name} job family encompasses roles focused on ${name.toLowerCase()}-related activities across the organization. Professionals in this family are responsible for driving excellence in their domain, collaborating with stakeholders, and ensuring alignment with organizational objectives. Career progression typically advances from entry-level specialist positions through senior and leadership roles.`;
  }
  
  if (context.includes('description')) {
    return `Responsible for ${name.toLowerCase()}, ensuring adherence to organizational standards and timely completion of all related tasks. This includes coordinating with stakeholders and maintaining accurate documentation.`;
  }
  
  if (context.includes('Key Result Areas') || context.includes('KRA')) {
    return `1. Complete all ${name.toLowerCase()} tasks within established timelines
2. Maintain accuracy rate of 98% or higher
3. Provide regular status updates to stakeholders
4. Document and improve processes where applicable`;
  }
  
  if (context.includes('Categorize')) {
    return 'operational';
  }
  
  if (context.includes('complexity')) {
    return '3';
  }
  
  return 'Unable to generate response';
}

function parseKRAs(text: string): string[] {
  const lines = text.split('\n').filter(line => line.trim());
  const kras: string[] = [];
  
  for (const line of lines) {
    // Remove numbering and clean up
    const cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
    if (cleaned && cleaned.length > 10) {
      kras.push(cleaned);
    }
  }
  
  return kras.slice(0, 5); // Max 5 KRAs
}

function validateCategory(category: string): string {
  const validCategories = [
    'financial',
    'operational',
    'people_leadership',
    'technical',
    'compliance',
    'strategic',
    'administrative',
    'customer_service',
    'project_management'
  ];
  
  const cleaned = category.toLowerCase().trim().replace(/[^a-z_]/g, '');
  return validCategories.includes(cleaned) ? cleaned : 'operational';
}

function parseComplexity(text: string): number {
  const match = text.match(/[1-5]/);
  if (match) {
    return parseInt(match[0], 10);
  }
  return 3; // Default to middle complexity
}

interface FamilySuggestion {
  name: string;
  category: string;
  suggestedWeight: number;
  description: string;
  kras: string[];
  complexityLevel: number;
}

function parseFamilySuggestions(text: string): FamilySuggestion[] {
  const suggestions: FamilySuggestion[] = [];

  // Supports two common formats:
  // 1) NAME:/CATEGORY:/WEIGHT:/DESCRIPTION: blocks separated by ---
  // 2) Headline blocks like "FINANCIAL REPORTING:" followed by CATEGORY/WEIGHT/DESCRIPTION (often without ---)

  const pushIfValid = (draft: {
    name: string;
    category: string;
    suggestedWeight: number;
    description: string;
    kras: string[];
    complexityLevel: number;
  }) => {
    const name = draft.name.trim();
    if (!name) return;
    suggestions.push({
      name,
      category: validateCategory(draft.category),
      suggestedWeight: Math.min(30, Math.max(5, draft.suggestedWeight || 15)),
      description: draft.description.trim(),
      kras: draft.kras.length > 0 ? draft.kras : [],
      complexityLevel: draft.complexityLevel || 3,
    });
  };

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let current = { name: '', category: 'operational', suggestedWeight: 15, description: '', kras: [] as string[], complexityLevel: 3 };

  const startNew = () => {
    if (current.name) pushIfValid(current);
    current = { name: '', category: 'operational', suggestedWeight: 15, description: '', kras: [], complexityLevel: 3 };
  };

  for (const line of lines) {
    if (line === '---') {
      startNew();
      continue;
    }

    if (line.startsWith('NAME:')) {
      if (current.name) startNew();
      current.name = line.replace('NAME:', '').trim();
      continue;
    }

    // Headline name format (e.g., "FINANCIAL REPORTING:")
    if (
      !line.startsWith('CATEGORY:') &&
      !line.startsWith('WEIGHT:') &&
      !line.startsWith('DESCRIPTION:') &&
      /:$/.test(line)
    ) {
      if (current.name) startNew();
      current.name = line.replace(/:$/, '').trim();
      continue;
    }

    if (line.startsWith('CATEGORY:')) {
      current.category = line.replace('CATEGORY:', '').trim();
      continue;
    }

    if (line.startsWith('WEIGHT:')) {
      const weightMatch = line.match(/(\d+)/);
      if (weightMatch) current.suggestedWeight = parseInt(weightMatch[1], 10);
      continue;
    }

    if (line.startsWith('DESCRIPTION:')) {
      current.description = line.replace('DESCRIPTION:', '').trim();
      continue;
    }

    // Sometimes description spills onto the next line(s)
    if (current.name && current.description) {
      current.description = `${current.description} ${line}`.trim();
    }
  }

  if (current.name) pushIfValid(current);

  return suggestions.slice(0, 8);
}
