import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metricsData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.log("No API key configured, using fallback insights");
      return new Response(
        JSON.stringify({ insights: null, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const metricsContext = buildMetricsContext(metricsData);

    const prompt = `You are an HR analytics AI assistant. Based on the following performance metrics, generate structured insights in JSON format.

METRICS DATA:
${metricsContext}

Generate a JSON response with exactly this structure:
{
  "risks": [
    {
      "type": "risk",
      "severity": "critical" | "warning" | "info",
      "title": "short title",
      "description": "1-2 sentence description",
      "metric": "key metric value",
      "action": "recommended action"
    }
  ],
  "trends": [
    {
      "type": "trend",
      "trend": "up" | "down" | "stable",
      "title": "short title",
      "description": "1-2 sentence description",
      "metric": "key metric value"
    }
  ],
  "recommendations": [
    {
      "type": "recommendation",
      "title": "short title",
      "description": "1-2 sentence description",
      "action": "specific action to take"
    }
  ],
  "generatedAt": "ISO timestamp"
}

Rules:
- Generate 2-4 risks based on concerning metrics (overloaded employees, low quality, broken chains)
- Generate 3-4 trends for key performance indicators
- Generate 2-4 actionable recommendations
- Be specific and data-driven
- If metrics look healthy, note that in the risks section with severity "info"

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an HR analytics expert. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', insights: null }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required', insights: null }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ insights: null, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let insights;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        insights = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ insights: null, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, insights: null }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildMetricsContext(metrics: Record<string, any>): string {
  const sections = [];

  sections.push(`GOAL COMPLETION:
- Total Goals: ${metrics.totalGoals || 0}
- Completed: ${metrics.completedGoals || 0}
- In Progress: ${metrics.inProgressGoals || 0}
- Completion Rate: ${(metrics.completionRate || 0).toFixed(1)}%`);

  sections.push(`GOAL QUALITY:
- Average Quality Score: ${(metrics.qualityScore || 0).toFixed(1)}/100
- Low Quality Goals: ${metrics.lowQualityGoals || 0}`);

  sections.push(`ALIGNMENT:
- Alignment Rate: ${(metrics.alignmentRate || 0).toFixed(1)}%
- Broken Chains: ${metrics.brokenChains || 0}
- Orphan Goals: ${metrics.orphanGoals || 0}`);

  sections.push(`WORKLOAD:
- Total Employees: ${metrics.totalEmployees || 0}
- Overloaded (Critical): ${metrics.overloadedEmployees || 0}
- At Warning Level: ${metrics.warningEmployees || 0}
- Healthy: ${metrics.healthyEmployees || 0}
- Average Workload Score: ${(metrics.avgWorkloadScore || 0).toFixed(1)}%`);

  if (metrics.departmentBreakdown?.length > 0) {
    const deptInfo = metrics.departmentBreakdown
      .slice(0, 5)
      .map((d: any) => `  - ${d.departmentName || 'Unknown'}: ${(d.completionRate || 0).toFixed(1)}%`)
      .join('\n');
    sections.push(`DEPARTMENT COMPLETION RATES:\n${deptInfo}`);
  }

  return sections.join('\n\n');
}
