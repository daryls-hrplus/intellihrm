import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metricsData } = await req.json();
    console.log("Received metrics data for summary generation:", metricsData);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ 
          summary: generateFallbackSummary(metricsData) 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context for AI
    const metricsContext = buildMetricsContext(metricsData);
    
    const prompt = `You are an expert HR analytics consultant generating an executive summary for a Performance Intelligence Report.

Based on the following performance metrics, write a concise but comprehensive executive summary (3-4 paragraphs) that:
1. Highlights key performance achievements and areas of concern
2. Provides actionable insights for leadership
3. Identifies trends and patterns
4. Recommends strategic priorities

PERFORMANCE METRICS:
${metricsContext}

Write in a professional, data-driven tone suitable for executive leadership. Focus on business impact and strategic implications. Be specific with numbers and percentages where relevant.`;

    console.log("Calling Lovable AI for summary generation...");

    const response = await fetch('https://api.lovable.ai/chat/completions', {
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
            content: 'You are an expert HR analytics consultant specializing in performance management and workforce optimization. Generate professional, insightful executive summaries based on data.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ 
          summary: generateFallbackSummary(metricsData) 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices?.[0]?.message?.content || generateFallbackSummary(metricsData);

    console.log("Successfully generated AI summary");

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating performance summary:', errorMessage);
    return new Response(
      JSON.stringify({ 
        summary: "Unable to generate AI summary. Please review the detailed metrics in the report sections below.",
        error: errorMessage 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildMetricsContext(metrics: Record<string, unknown>): string {
  const lines: string[] = [];
  
  if (metrics.completionRate !== undefined) {
    lines.push(`- Goal Completion Rate: ${(metrics.completionRate as number).toFixed(1)}%`);
  }
  if (metrics.totalGoals !== undefined) {
    lines.push(`- Total Active Goals: ${metrics.totalGoals}`);
  }
  if (metrics.completedGoals !== undefined) {
    lines.push(`- Completed Goals: ${metrics.completedGoals}`);
  }
  if (metrics.qualityScore !== undefined) {
    lines.push(`- Goal Quality Score: ${(metrics.qualityScore as number).toFixed(1)}/100`);
  }
  if (metrics.alignmentRate !== undefined) {
    lines.push(`- Goal Alignment Rate: ${(metrics.alignmentRate as number).toFixed(1)}%`);
  }
  if (metrics.totalEmployees !== undefined) {
    lines.push(`- Total Employees Analyzed: ${metrics.totalEmployees}`);
  }
  if (metrics.overloadedEmployees !== undefined) {
    lines.push(`- Employees at Risk of Overload: ${metrics.overloadedEmployees}`);
  }
  if (metrics.avgWorkloadScore !== undefined) {
    lines.push(`- Average Workload Score: ${(metrics.avgWorkloadScore as number).toFixed(1)}%`);
  }
  
  const deptBreakdown = metrics.departmentBreakdown as Array<{ departmentName: string; completionRate: number }> | undefined;
  if (deptBreakdown && deptBreakdown.length > 0) {
    lines.push(`\nDepartment Performance:`);
    deptBreakdown.slice(0, 5).forEach(dept => {
      lines.push(`  - ${dept.departmentName}: ${(dept.completionRate || 0).toFixed(1)}% completion`);
    });
  }

  return lines.length > 0 ? lines.join('\n') : 'No metrics data available';
}

function generateFallbackSummary(metrics: Record<string, unknown>): string {
  const completionRate = (metrics.completionRate as number) || 0;
  const totalGoals = (metrics.totalGoals as number) || 0;
  const qualityScore = (metrics.qualityScore as number) || 0;
  const overloadedEmployees = (metrics.overloadedEmployees as number) || 0;
  const totalEmployees = (metrics.totalEmployees as number) || 0;
  
  const overloadPercentage = totalEmployees > 0 ? (overloadedEmployees / totalEmployees) * 100 : 0;
  
  let summary = `This Performance Intelligence Report provides a comprehensive analysis of organizational performance metrics.\n\n`;
  
  summary += `Goal Performance: The organization is tracking ${totalGoals} active goals with an overall completion rate of ${completionRate.toFixed(1)}%. `;
  
  if (completionRate >= 70) {
    summary += `This represents strong execution against strategic objectives. `;
  } else if (completionRate >= 50) {
    summary += `There is room for improvement in goal execution. `;
  } else {
    summary += `Immediate attention is needed to improve goal completion rates. `;
  }
  
  if (qualityScore > 0) {
    summary += `Goal quality assessment shows an average score of ${qualityScore.toFixed(1)}/100.\n\n`;
  } else {
    summary += '\n\n';
  }
  
  summary += `Workforce Health: ${overloadedEmployees} out of ${totalEmployees} employees (${overloadPercentage.toFixed(1)}%) are showing signs of workload stress. `;
  
  if (overloadPercentage > 20) {
    summary += `This elevated overload rate warrants immediate review of resource allocation and goal distribution.`;
  } else if (overloadPercentage > 10) {
    summary += `Consider monitoring these employees and redistributing workload where possible.`;
  } else {
    summary += `Workload distribution appears healthy across the organization.`;
  }
  
  return summary;
}
