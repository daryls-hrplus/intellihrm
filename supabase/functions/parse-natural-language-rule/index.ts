import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedRule {
  name: string;
  description: string;
  eventTypeCode: string;
  eventTypeName: string;
  daysBeforeIntervals: number[];
  sendToEmployee: boolean;
  sendToManager: boolean;
  sendToHr: boolean;
  notificationMethod: 'in_app' | 'email' | 'both';
  priority: 'low' | 'medium' | 'high' | 'critical';
  messageTemplate: string;
  confidence: number;
  clarificationNeeded?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { naturalLanguageInput, companyId } = await req.json();

    if (!naturalLanguageInput) {
      return new Response(
        JSON.stringify({ error: 'naturalLanguageInput is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch available event types to provide context to AI
    const { data: eventTypes } = await supabase
      .from('reminder_event_types')
      .select('id, code, name, category, source_table, date_field, filter_condition')
      .eq('is_active', true);

    const eventTypesList = (eventTypes || []).map(et => 
      `- ${et.code}: ${et.name} (category: ${et.category})`
    ).join('\n');

    // Use AI to parse the natural language input
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an HR reminder rule parser. Parse natural language requests into structured reminder rules.

Available event types:
${eventTypesList}

Parse the user's request and extract:
1. Which event type they're referring to (match to available event types)
2. How many days before the event to send reminders (can be multiple intervals)
3. Who should receive the reminder (employee, manager, HR, or combinations)
4. Priority level (critical, high, medium, low)
5. Notification method preference (in_app, email, or both)
6. Generate a professional, friendly message template appropriate for the event type and urgency

Common patterns to recognize:
- "2 weeks before" = 14 days
- "1 month before" = 30 days
- "90 days before" = 90 days
- "remind managers" = sendToManager: true
- "notify HR" = sendToHr: true
- "send to employee" = sendToEmployee: true
- "urgent" or "critical" = priority: critical
- "important" = priority: high

Message Template Guidelines:
- ALWAYS generate a professional, contextual message template
- Use placeholders: {employee_name}, {event_date}, {days_until}, {event_type}, {manager_name}, {department}
- Match tone to priority (critical = urgent action needed, low = friendly reminder)
- Include clear call-to-action
- Example for visa expiry: "Dear {employee_name}, This is a reminder that your visa will expire on {event_date} ({days_until} days from now). Please initiate the renewal process immediately to avoid any work authorization issues. Contact HR if you need assistance."

If you can't confidently parse the request, set confidence < 0.7 and provide clarificationNeeded.`
          },
          {
            role: 'user',
            content: naturalLanguageInput
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_reminder_rule",
              description: "Create a structured reminder rule from natural language",
              parameters: {
                type: "object",
                properties: {
                  name: { 
                    type: "string", 
                    description: "A concise name for the rule" 
                  },
                  description: { 
                    type: "string", 
                    description: "A brief description of what this rule does" 
                  },
                  eventTypeCode: { 
                    type: "string", 
                    description: "The code of the event type this rule applies to" 
                  },
                  eventTypeName: { 
                    type: "string", 
                    description: "The human-readable name of the event type" 
                  },
                  daysBeforeIntervals: { 
                    type: "array", 
                    items: { type: "number" },
                    description: "Array of days before the event to send reminders (e.g., [30, 14, 7])" 
                  },
                  sendToEmployee: { 
                    type: "boolean", 
                    description: "Whether to send reminder to the employee" 
                  },
                  sendToManager: { 
                    type: "boolean", 
                    description: "Whether to send reminder to the manager" 
                  },
                  sendToHr: { 
                    type: "boolean", 
                    description: "Whether to send reminder to HR" 
                  },
                  notificationMethod: { 
                    type: "string", 
                    enum: ["in_app", "email", "both"],
                    description: "How to deliver the notification" 
                  },
                  priority: { 
                    type: "string", 
                    enum: ["low", "medium", "high", "critical"],
                    description: "Priority level of the reminder" 
                  },
                  messageTemplate: { 
                    type: "string", 
                    description: "Template message with placeholders like {employee_name}, {event_date}, {days_until}" 
                  },
                  confidence: { 
                    type: "number", 
                    description: "Confidence score 0-1 for how well the input was understood" 
                  },
                  clarificationNeeded: { 
                    type: "string", 
                    description: "If confidence < 0.7, what clarification is needed" 
                  }
                },
                required: ["name", "eventTypeCode", "eventTypeName", "daysBeforeIntervals", "sendToEmployee", "sendToManager", "sendToHr", "notificationMethod", "priority", "confidence"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_reminder_rule" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Failed to parse natural language input');
    }

    const aiData = await aiResponse.json();
    console.log('AI Response:', JSON.stringify(aiData, null, 2));

    // Extract the function call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'create_reminder_rule') {
      throw new Error('Failed to parse input - no valid function call returned');
    }

    const parsedRule: ParsedRule = JSON.parse(toolCall.function.arguments);

    // Find the actual event type ID
    const matchedEventType = eventTypes?.find(et => 
      et.code === parsedRule.eventTypeCode || 
      et.name.toLowerCase().includes(parsedRule.eventTypeName.toLowerCase())
    );

    if (!matchedEventType && parsedRule.confidence >= 0.7) {
      parsedRule.confidence = 0.5;
      parsedRule.clarificationNeeded = `Could not find event type "${parsedRule.eventTypeName}". Please select from available event types.`;
    }

    return new Response(
      JSON.stringify({
        parsedRule,
        matchedEventType,
        originalInput: naturalLanguageInput,
        availableEventTypes: eventTypes,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-natural-language-rule:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});