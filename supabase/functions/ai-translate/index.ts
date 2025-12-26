import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  translations: Array<{
    id: string;
    key: string;
    sourceText: string;
  }>;
  targetLanguage: string;
  targetLanguageName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { translations, targetLanguage, targetLanguageName }: TranslationRequest = await req.json();
    
    if (!translations || translations.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No translations provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Translating ${translations.length} items to ${targetLanguageName} (${targetLanguage})`);

    // Format the translations for the prompt
    const translationItems = translations.map((t, i) => 
      `${i + 1}. Key: "${t.key}"\n   English: "${t.sourceText}"`
    ).join('\n\n');

    const systemPrompt = `You are a professional translator specializing in software localization and i18n. 
Your task is to translate UI text from English to ${targetLanguageName}.

CRITICAL RULES:
1. Maintain the exact meaning and tone of the original text
2. Keep technical terms, placeholders like {name}, {{count}}, and variables unchanged
3. Preserve formatting, punctuation style, and capitalization patterns
4. For short UI elements (buttons, labels), keep translations concise
5. Consider the context from the translation key (e.g., "common.save" is a button label)
6. If the text contains HTML or special characters, preserve them exactly
7. For RTL languages (Arabic), ensure proper text direction compatibility

Respond ONLY with a valid JSON array in this exact format:
[
  { "id": "translation-id-1", "translation": "translated text 1" },
  { "id": "translation-id-2", "translation": "translated text 2" }
]

Do not include any explanation, markdown, or other text - ONLY the JSON array.`;

    const userPrompt = `Translate the following ${translations.length} English texts to ${targetLanguageName}:

${translationItems}

Translation IDs for your response:
${translations.map(t => `- ${t.id}`).join('\n')}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI translation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No translation received from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response:', content.substring(0, 200));

    // Parse the JSON response
    let translatedItems;
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      translatedItems = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse translation response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(translatedItems)) {
      console.error('AI response is not an array:', translatedItems);
      return new Response(
        JSON.stringify({ error: 'Invalid translation response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully translated ${translatedItems.length} items`);

    return new Response(
      JSON.stringify({ translations: translatedItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-translate function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
