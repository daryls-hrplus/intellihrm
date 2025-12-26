import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueueItem {
  id: string;
  table_name: string;
  record_id: string;
  field_name: string;
  source_text: string;
  attempts: number;
}

// Language detection prompt
const DETECT_LANGUAGE_PROMPT = `You are a language detection expert. Analyze the following text and determine what language it is written in.

IMPORTANT:
- Return ONLY the ISO 639-1 language code (e.g., "en", "es", "fr", "de", "ar", "zh", "pt", "nl", "ru")
- If the text is already in English, return "en"
- If you cannot determine the language, return "unknown"
- Do NOT include any explanation, just the 2-letter code

Text to analyze:`;

// Translation prompt
const TRANSLATE_PROMPT = `You are a professional translator. Translate the following text to English.

CRITICAL RULES:
1. Preserve all formatting, line breaks, and punctuation
2. Keep technical terms, proper nouns, and acronyms unchanged
3. Maintain the original tone and style
4. If the text is already in English, return it unchanged
5. Do NOT include any explanation, ONLY the translated text

Text to translate:`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

  if (!lovableApiKey) {
    console.error('LOVABLE_API_KEY is not configured');
    return new Response(
      JSON.stringify({ error: 'AI service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get batch size from request or default to 10
    const { batchSize = 10 } = await req.json().catch(() => ({}));

    // Fetch pending items from the queue
    const { data: queueItems, error: fetchError } = await supabase
      .from('translation_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3)
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      console.error('Error fetching queue:', fetchError);
      throw fetchError;
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('No pending translations in queue');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No pending translations' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${queueItems.length} translations`);

    let successCount = 0;
    let failCount = 0;

    for (const item of queueItems as QueueItem[]) {
      try {
        // Mark as processing
        await supabase
          .from('translation_queue')
          .update({ status: 'processing', attempts: item.attempts + 1 })
          .eq('id', item.id);

        // Step 1: Detect language
        const detectResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-lite',
            messages: [
              { role: 'user', content: `${DETECT_LANGUAGE_PROMPT}\n\n"${item.source_text.substring(0, 500)}"` }
            ],
          }),
        });

        if (!detectResponse.ok) {
          throw new Error(`Language detection failed: ${detectResponse.status}`);
        }

        const detectData = await detectResponse.json();
        const detectedLanguage = detectData.choices?.[0]?.message?.content?.trim().toLowerCase() || 'unknown';

        console.log(`Item ${item.id}: Detected language: ${detectedLanguage}`);

        let translatedText = item.source_text;

        // Step 2: Translate if not English
        if (detectedLanguage !== 'en' && detectedLanguage !== 'unknown') {
          const translateResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'user', content: `${TRANSLATE_PROMPT}\n\n"${item.source_text}"` }
              ],
            }),
          });

          if (!translateResponse.ok) {
            throw new Error(`Translation failed: ${translateResponse.status}`);
          }

          const translateData = await translateResponse.json();
          translatedText = translateData.choices?.[0]?.message?.content?.trim() || item.source_text;
          
          // Clean up the response (remove quotes if AI wrapped it)
          if (translatedText.startsWith('"') && translatedText.endsWith('"')) {
            translatedText = translatedText.slice(1, -1);
          }

          console.log(`Item ${item.id}: Translated to English`);
        } else {
          console.log(`Item ${item.id}: Already in English, no translation needed`);
        }

        // Step 3: Update the shadow column in the target table
        const shadowColumn = `${item.field_name}_en`;
        const { error: updateError } = await supabase
          .from(item.table_name)
          .update({ [shadowColumn]: translatedText })
          .eq('id', item.record_id);

        if (updateError) {
          console.error(`Error updating ${item.table_name}.${shadowColumn}:`, updateError);
          throw updateError;
        }

        // Step 4: Mark queue item as completed
        await supabase
          .from('translation_queue')
          .update({
            status: 'completed',
            detected_language: detectedLanguage,
            translated_text: translatedText,
            processed_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        successCount++;
        console.log(`Item ${item.id}: Successfully processed`);

      } catch (itemError) {
        console.error(`Error processing item ${item.id}:`, itemError);
        
        // Mark as failed
        await supabase
          .from('translation_queue')
          .update({
            status: item.attempts + 1 >= 3 ? 'failed' : 'pending',
            error_message: itemError instanceof Error ? itemError.message : 'Unknown error',
          })
          .eq('id', item.id);

        failCount++;
      }

      // Small delay between items to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Processing complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        processed: queueItems.length,
        success: successCount,
        failed: failCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-translation-queue:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
