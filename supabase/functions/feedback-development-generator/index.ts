import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Signal {
  id: string;
  signal_code: string;
  signal_name: string;
  category: string;
  score: number;
  benchmark_score?: number;
  gap?: number;
}

interface GenerateRequest {
  cycleId: string;
  employeeId: string;
  companyId: string;
  selectedSignalIds: string[];
  signals: Signal[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: GenerateRequest = await req.json();
    const { cycleId, employeeId, companyId, selectedSignalIds, signals } = body;

    console.log(`Generating development themes for employee ${employeeId}, ${signals.length} signals selected`);

    if (!employeeId || !companyId || !signals.length) {
      throw new Error('Missing required fields: employeeId, companyId, or signals');
    }

    // Group signals by category to identify themes
    const signalsByCategory: Record<string, Signal[]> = {};
    for (const signal of signals) {
      const category = signal.category || 'general';
      if (!signalsByCategory[category]) {
        signalsByCategory[category] = [];
      }
      signalsByCategory[category].push(signal);
    }

    // Generate themes based on signal patterns
    const themes: Array<{
      theme_name: string;
      theme_description: string;
      theme_code: string;
      signal_ids: string[];
      confidence_score: number;
    }> = [];

    for (const [category, categorySignals] of Object.entries(signalsByCategory)) {
      // Calculate average gap for this category
      const avgGap = categorySignals.reduce((sum, s) => {
        const gap = s.gap ?? (s.benchmark_score ? s.benchmark_score - s.score : 0);
        return sum + gap;
      }, 0) / categorySignals.length;

      // Generate theme based on category
      const themeTemplates: Record<string, { name: string; description: string }> = {
        leadership: {
          name: 'Leadership Development',
          description: 'Focus on developing leadership capabilities including decision-making, team guidance, and strategic thinking.',
        },
        teamwork: {
          name: 'Collaboration & Teamwork',
          description: 'Enhance skills in working effectively with others, building relationships, and contributing to team success.',
        },
        technical: {
          name: 'Technical Excellence',
          description: 'Deepen technical expertise and stay current with industry best practices and emerging technologies.',
        },
        communication: {
          name: 'Communication Mastery',
          description: 'Improve verbal and written communication, active listening, and the ability to convey complex ideas clearly.',
        },
        values: {
          name: 'Values Alignment',
          description: 'Strengthen alignment with organizational values and demonstrate them consistently in daily work.',
        },
        general: {
          name: 'Professional Growth',
          description: 'General professional development focusing on identified growth areas from feedback.',
        },
      };

      const template = themeTemplates[category.toLowerCase()] || themeTemplates.general;

      // Customize based on specific signals
      const signalNames = categorySignals.map(s => s.signal_name).join(', ');
      const customDescription = `${template.description} Specifically focusing on: ${signalNames}.`;

      themes.push({
        theme_name: template.name,
        theme_description: customDescription,
        theme_code: `${category.toLowerCase()}_dev_${Date.now()}`,
        signal_ids: categorySignals.map(s => s.id),
        confidence_score: Math.min(0.95, 0.6 + (categorySignals.length * 0.1) + (avgGap * 0.05)),
      });
    }

    console.log(`Generated ${themes.length} themes`);

    // Insert themes into database
    const themesToInsert = themes.map(theme => ({
      employee_id: employeeId,
      company_id: companyId,
      source_cycle_id: cycleId || null,
      theme_code: theme.theme_code,
      theme_name: theme.theme_name,
      theme_description: theme.theme_description,
      signal_ids: theme.signal_ids,
      confidence_score: theme.confidence_score,
      ai_generated: true,
      is_confirmed: false,
    }));

    const { data: insertedThemes, error: insertError } = await supabase
      .from('development_themes')
      .insert(themesToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting themes:', insertError);
      throw insertError;
    }

    console.log(`Inserted ${insertedThemes?.length || 0} themes`);

    // Generate recommendations for each theme
    const allRecommendations: Array<{
      theme_id: string;
      recommendation_type: string;
      recommendation_text: string;
      priority_order: number;
    }> = [];

    const recommendationTemplates = {
      learning: [
        'Complete a structured learning program on {topic}',
        'Read industry-leading books and articles on {topic}',
        'Attend workshops or conferences focused on {topic}',
      ],
      experience: [
        'Take on projects that challenge your {topic} skills',
        'Shadow colleagues who excel in {topic}',
        'Volunteer for cross-functional initiatives requiring {topic}',
      ],
      mentoring: [
        'Find a mentor who excels in {topic}',
        'Join a peer learning group focused on {topic}',
        'Mentor others to reinforce your {topic} understanding',
      ],
      coaching: [
        'Work with a coach to develop your {topic} capabilities',
        'Seek regular feedback on your {topic} progress',
        'Create a coaching agreement focused on {topic}',
      ],
      stretch_assignment: [
        'Lead a project that requires strong {topic}',
        'Take on a role that will stretch your {topic} abilities',
        'Propose an initiative that addresses {topic} gaps',
      ],
    };

    for (const theme of insertedThemes || []) {
      let priorityOrder = 1;
      const topicName = theme.theme_name.toLowerCase().replace(' development', '').replace(' mastery', '');

      // Add one recommendation of each type
      for (const [type, templates] of Object.entries(recommendationTemplates)) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        allRecommendations.push({
          theme_id: theme.id,
          recommendation_type: type,
          recommendation_text: template.replace('{topic}', topicName),
          priority_order: priorityOrder++,
        });
      }
    }

    if (allRecommendations.length > 0) {
      const { error: recError } = await supabase
        .from('development_recommendations')
        .insert(allRecommendations);

      if (recError) {
        console.error('Error inserting recommendations:', recError);
        // Don't throw - themes were created successfully
      } else {
        console.log(`Inserted ${allRecommendations.length} recommendations`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        themes: insertedThemes,
        recommendationsCount: allRecommendations.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in feedback-development-generator:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
