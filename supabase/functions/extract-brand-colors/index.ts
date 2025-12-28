import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Extracting brand colors from uploaded image...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a brand color extraction expert. Analyze brand guideline documents, logos, and images to extract the primary brand colors. 
            
Always respond with a JSON object containing:
- primary: The main/dominant brand color in hex format (e.g., "#2F7AC3")
- secondary: A secondary/supporting color in hex format
- accent: An accent color used for highlights in hex format
- confidence: A number from 0-100 indicating how confident you are in the extraction
- colorNames: An object with descriptive names for each color (e.g., { primary: "Azure Blue", secondary: "Navy", accent: "Teal" })

If the image is a logo, extract colors from the logo itself.
If it's a brand guideline PDF/document, look for explicitly defined brand colors.
Always provide your best estimate even if the image quality is low.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this brand asset and extract the primary, secondary, and accent colors. Return the result as JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/png'};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_brand_colors',
              description: 'Extract brand colors from an image or document',
              parameters: {
                type: 'object',
                properties: {
                  primary: {
                    type: 'string',
                    description: 'Primary brand color in hex format (e.g., #2F7AC3)'
                  },
                  secondary: {
                    type: 'string',
                    description: 'Secondary brand color in hex format'
                  },
                  accent: {
                    type: 'string',
                    description: 'Accent color in hex format'
                  },
                  confidence: {
                    type: 'number',
                    description: 'Confidence score from 0-100'
                  },
                  colorNames: {
                    type: 'object',
                    properties: {
                      primary: { type: 'string' },
                      secondary: { type: 'string' },
                      accent: { type: 'string' }
                    }
                  }
                },
                required: ['primary', 'secondary', 'accent', 'confidence']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_brand_colors' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const colors = JSON.parse(toolCall.function.arguments);
      console.log('Extracted colors:', colors);
      
      return new Response(
        JSON.stringify(colors),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback: try to parse from content
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const colors = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify(colors),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    throw new Error('Could not extract colors from AI response');

  } catch (error) {
    console.error('Error in extract-brand-colors:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to extract brand colors';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
