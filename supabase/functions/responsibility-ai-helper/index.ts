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

type RequestBody = GenerateDescriptionRequest | SuggestKRAsRequest | EnrichResponsibilityRequest | SuggestForFamilyRequest;

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
      const suggestionsText = await callLovableAI(prompt, 'Suggest responsibilities for job family');
      const suggestions = parseFamilySuggestions(suggestionsText);
      
      return new Response(
        JSON.stringify({ success: true, suggestions }),
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
    prompt += `\n\nExisting responsibilities in the system (avoid duplicates): ${existingResponsibilities.join(', ')}`;
  }
  
  prompt += `\n\nFor each responsibility, provide:
1. Name (short, action-oriented)
2. Category (one of: financial, operational, people_leadership, technical, compliance, strategic, administrative, customer_service, project_management)
3. Suggested weight percentage (5-30%)
4. Brief description (1-2 sentences)

Format each responsibility as:
NAME: [name]
CATEGORY: [category]
WEIGHT: [percentage]
DESCRIPTION: [description]
---

Focus on responsibilities that are:
- Foundational to the job family
- Applicable across different levels (with varying complexity)
- Measurable and outcome-oriented`;
  
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

function generateFallbackResponse(prompt: string, context: string): string {
  // Extract the responsibility name from the prompt
  const nameMatch = prompt.match(/["']([^"']+)["']/);
  const name = nameMatch ? nameMatch[1] : 'this responsibility';
  
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
}

function parseFamilySuggestions(text: string): FamilySuggestion[] {
  const suggestions: FamilySuggestion[] = [];
  const blocks = text.split('---').filter(block => block.trim());
  
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    let name = '';
    let category = 'operational';
    let suggestedWeight = 15;
    let description = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('NAME:')) {
        name = trimmedLine.replace('NAME:', '').trim();
      } else if (trimmedLine.startsWith('CATEGORY:')) {
        category = validateCategory(trimmedLine.replace('CATEGORY:', '').trim());
      } else if (trimmedLine.startsWith('WEIGHT:')) {
        const weightMatch = trimmedLine.match(/(\d+)/);
        if (weightMatch) {
          suggestedWeight = Math.min(30, Math.max(5, parseInt(weightMatch[1], 10)));
        }
      } else if (trimmedLine.startsWith('DESCRIPTION:')) {
        description = trimmedLine.replace('DESCRIPTION:', '').trim();
      }
    }
    
    if (name) {
      suggestions.push({ name, category, suggestedWeight, description });
    }
  }
  
  return suggestions.slice(0, 8); // Max 8 suggestions
}
