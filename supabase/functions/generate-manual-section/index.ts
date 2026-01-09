import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SectionContent {
  title: string;
  overview: string;
  learningObjectives: string[];
  content: {
    heading: string;
    body: string;
    steps?: Array<{
      stepNumber: number;
      title: string;
      instruction: string;
      tip?: string;
      warning?: string;
      screenshotHint?: string;
    }>;
    notes?: string[];
    bestPractices?: string[];
  }[];
  keyTakeaways: string[];
  relatedSections?: string[];
  glossaryTerms?: Array<{ term: string; definition: string }>;
  faq?: Array<{ question: string; answer: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      sectionId, 
      regenerationType = 'full',
      customInstructions,
      userId 
    } = await req.json();

    if (!sectionId) {
      throw new Error('sectionId is required');
    }

    // Get section details
    const { data: section, error: sectionError } = await supabase
      .from('manual_sections')
      .select(`
        *,
        manual:manual_definitions(*)
      `)
      .eq('id', sectionId)
      .single();

    if (sectionError) throw sectionError;
    if (!section) throw new Error('Section not found');

    // Get feature data for context
    const { data: features } = await supabase
      .from('application_features')
      .select('*')
      .in('feature_code', section.source_feature_codes || []);

    // Get module data for context
    const { data: modules } = await supabase
      .from('application_modules')
      .select('*')
      .in('module_code', section.source_module_codes || []);

    // Get existing content for incremental updates
    const existingContent = regenerationType === 'incremental' ? section.content : null;

    // Build the AI prompt using ADDIE model and industry standards
    const prompt = buildSectionPrompt(
      section,
      features || [],
      modules || [],
      existingContent,
      customInstructions
    );

    // Call AI to generate content (using Lovable AI)
    const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are an expert technical documentation writer specializing in enterprise HR software. 
You follow the ADDIE instructional design model and apply Bloom's Taxonomy for learning objectives.
Your documentation adheres to Microsoft Style Guide and includes clear, actionable content.
You write for diverse audiences including administrators, HR professionals, and end users.
Always respond with valid JSON matching the requested structure.`
          },
          { role: 'user', content: prompt }
        ],
        model: 'google/gemini-2.5-flash',
        response_format: { type: 'json_object' }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    const generatedContent: SectionContent = JSON.parse(
      aiResult.choices?.[0]?.message?.content || '{}'
    );

    // Calculate content hash for change detection
    const contentHash = await generateHash(JSON.stringify(generatedContent));

    // Update section with new content
    const { error: updateError } = await supabase
      .from('manual_sections')
      .update({
        content: generatedContent,
        last_generated_at: new Date().toISOString(),
        needs_regeneration: false,
        generation_hash: contentHash
      })
      .eq('id', sectionId);

    if (updateError) throw updateError;

    // Create version record
    const { data: latestVersion } = await supabase
      .from('manual_section_versions')
      .select('version_number')
      .eq('section_id', sectionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const newVersion = incrementVersion(
      latestVersion?.version_number || '0.0.0',
      regenerationType === 'full' ? 'minor' : 'patch'
    );

    // Generate changelog entry
    const changelogEntry = regenerationType === 'full'
      ? 'Complete section regeneration with updated feature data'
      : 'Incremental update based on detected changes';

    await supabase
      .from('manual_section_versions')
      .insert({
        section_id: sectionId,
        version_number: newVersion,
        content: generatedContent,
        changelog_entry: changelogEntry,
        generated_by: userId,
        ai_model_used: 'google/gemini-2.5-flash',
        tokens_used: aiResult.usage?.total_tokens || 0
      });

    return new Response(
      JSON.stringify({
        success: true,
        sectionId,
        content: generatedContent,
        version: newVersion,
        changelog: changelogEntry,
        tokensUsed: aiResult.usage?.total_tokens || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error generating section:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildSectionPrompt(
  section: any,
  features: any[],
  modules: any[],
  existingContent: any,
  customInstructions?: string
): string {
  const featureContext = features.map(f => `
- Feature: ${f.feature_name} (${f.feature_code})
  Description: ${f.description || 'No description'}
  Workflow Steps: ${JSON.stringify(f.workflow_steps || [])}
  UI Elements: ${JSON.stringify(f.ui_elements || [])}
`).join('\n');

  const moduleContext = modules.map(m => `
- Module: ${m.module_name} (${m.module_code})
  Description: ${m.description || 'No description'}
  Route: ${m.route_path}
`).join('\n');

  let prompt = `Generate comprehensive documentation for the following manual section:

## Section Details
- Section Number: ${section.section_number}
- Title: ${section.title}
- Manual: ${section.manual?.manual_name}

## Source Features
${featureContext || 'No specific features linked'}

## Related Modules
${moduleContext || 'No specific modules linked'}

## Requirements
1. Follow ADDIE instructional design model
2. Apply Bloom's Taxonomy for learning objectives (Remember, Understand, Apply, Analyze, Evaluate, Create)
3. Use active voice and second person ("you")
4. Include practical examples and step-by-step instructions
5. Add tips, warnings, and best practices where appropriate
6. Generate FAQ items for common questions
7. Include glossary terms for technical vocabulary

## Output Format
Return a JSON object with this structure:
{
  "title": "Section title",
  "overview": "Brief 2-3 sentence overview",
  "learningObjectives": ["Objective 1 (using Bloom's verbs)", "Objective 2"],
  "content": [
    {
      "heading": "Subsection heading",
      "body": "Main content text",
      "steps": [
        {
          "stepNumber": 1,
          "title": "Step title",
          "instruction": "Detailed instruction",
          "tip": "Optional helpful tip",
          "warning": "Optional warning about common mistakes",
          "screenshotHint": "Description of what screenshot would show"
        }
      ],
      "notes": ["Important note 1"],
      "bestPractices": ["Best practice 1"]
    }
  ],
  "keyTakeaways": ["Key point 1", "Key point 2"],
  "relatedSections": ["Section 2.1", "Section 3.4"],
  "glossaryTerms": [{"term": "Term", "definition": "Definition"}],
  "faq": [{"question": "Q?", "answer": "A"}]
}`;

  if (existingContent) {
    prompt += `\n\n## Existing Content (for reference/incremental update)
${JSON.stringify(existingContent, null, 2)}`;
  }

  if (customInstructions) {
    prompt += `\n\n## Custom Instructions
${customInstructions}`;
  }

  return prompt;
}

function incrementVersion(
  currentVersion: string,
  bumpType: 'major' | 'minor' | 'patch'
): string {
  const parts = currentVersion.split('.').map(Number);
  const [major, minor, patch] = parts;

  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
