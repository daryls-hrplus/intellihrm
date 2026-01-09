import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Section {
  id: string;
  title: string;
  content: string;
}

interface QualityIssue {
  sectionId: string;
  sectionTitle: string;
  severity: 'error' | 'warning' | 'info';
  type: string;
  message: string;
  suggestion?: string;
}

interface QualityResult {
  score: number;
  status: 'pass' | 'warning' | 'fail';
  totalSections: number;
  issues: QualityIssue[];
  summary: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sections, manualName } = await req.json();

    if (!sections || !Array.isArray(sections)) {
      return new Response(
        JSON.stringify({ error: 'sections array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare content summary for AI analysis
    const contentSummary = sections.map((s: Section) => ({
      id: s.id,
      title: s.title,
      wordCount: s.content ? s.content.split(/\s+/).length : 0,
      contentPreview: s.content ? s.content.substring(0, 500) : ''
    }));

    const prompt = `You are a technical documentation quality analyst for an enterprise HRMS platform called HRplus.

Analyze the following documentation sections for quality issues. Check for:

1. **Placeholder Content** - Look for "TODO", "TBD", "Lorem ipsum", "[placeholder]", "FIXME", or similar
2. **Incomplete Sections** - Sections with very little content (less than 50 words)
3. **Missing Context** - Sections that reference other content without explanation
4. **Outdated References** - Mentions of specific version numbers that might be outdated
5. **Unclear Instructions** - Vague language like "do the thing", "click here", etc.
6. **Broken References** - References to sections or features that don't seem to exist
7. **Consistency Issues** - Terminology inconsistencies (e.g., "employee" vs "staff" vs "worker")

Manual: ${manualName || 'Unknown Manual'}

Sections to analyze:
${JSON.stringify(contentSummary, null, 2)}

Respond with a JSON object containing:
{
  "issues": [
    {
      "sectionId": "section id",
      "sectionTitle": "section title",
      "severity": "error" | "warning" | "info",
      "type": "placeholder" | "incomplete" | "unclear" | "outdated" | "broken_reference" | "consistency",
      "message": "brief description of the issue",
      "suggestion": "how to fix it"
    }
  ],
  "summary": "One sentence summary of overall quality"
}

Only include actual issues found. If a section is fine, don't include it. Be concise but helpful.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a documentation quality analyst. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '{}';
    
    // Parse AI response
    let analysisResult;
    try {
      // Clean up potential markdown code blocks
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysisResult = JSON.parse(cleanedContent);
    } catch {
      console.error('Failed to parse AI response:', content);
      analysisResult = { issues: [], summary: 'Analysis completed' };
    }

    // Calculate quality score
    const issues: QualityIssue[] = analysisResult.issues || [];
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    // Score calculation: start at 100, -10 for errors, -3 for warnings
    const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 3));
    
    let status: 'pass' | 'warning' | 'fail';
    if (errorCount > 0 || score < 60) {
      status = 'fail';
    } else if (warningCount > 0 || score < 85) {
      status = 'warning';
    } else {
      status = 'pass';
    }

    const result: QualityResult = {
      score,
      status,
      totalSections: sections.length,
      issues,
      summary: analysisResult.summary || `Analyzed ${sections.length} sections`
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Quality analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
