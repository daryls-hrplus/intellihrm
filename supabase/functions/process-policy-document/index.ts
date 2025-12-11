import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text chunking function
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + chunkSize;
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + chunkSize / 2) {
        end = breakPoint + 1;
      }
    }
    
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }
  
  return chunks.filter(chunk => chunk.length > 50);
}

// Generate embeddings using Lovable AI Gateway
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-ada-002",
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Extract policy rules using AI
async function extractPolicyRules(content: string, apiKey: string): Promise<any[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `You are a policy analyst. Extract enforceable rules from the document.
For each rule, identify:
- rule_type: one of [age_restriction, document_required, approval_required, time_limit, qualification_required, prohibition, mandatory_action]
- rule_context: one of [hiring, leave, benefits, compensation, safety, conduct, training, termination, general]
- rule_description: clear description of the rule
- rule_condition: JSON object with specific conditions (e.g., {"min_age": 18} or {"days_notice": 14})
- severity: one of [info, warning, error]

Return a JSON array of rules. Only extract clear, enforceable rules.`
        },
        {
          role: "user",
          content: `Extract enforceable policy rules from this document:\n\n${content.slice(0, 8000)}`
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_rules",
            description: "Extract policy rules from the document",
            parameters: {
              type: "object",
              properties: {
                rules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      rule_type: { type: "string" },
                      rule_context: { type: "string" },
                      rule_description: { type: "string" },
                      rule_condition: { type: "object" },
                      severity: { type: "string" }
                    },
                    required: ["rule_type", "rule_context", "rule_description", "rule_condition", "severity"]
                  }
                }
              },
              required: ["rules"]
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "extract_rules" } }
    }),
  });

  if (!response.ok) {
    console.error("Rule extraction failed:", await response.text());
    return [];
  }

  const data = await response.json();
  try {
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      return args.rules || [];
    }
  } catch (e) {
    console.error("Failed to parse rules:", e);
  }
  return [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();
    
    if (!documentId) {
      return new Response(JSON.stringify({ error: 'Document ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get document info
    const { data: doc, error: docError } = await supabase
      .from('policy_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    // Update status to processing
    await supabase
      .from('policy_documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    console.log(`Processing document: ${doc.title} (${doc.file_type})`);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('policy-documents')
      .download(doc.file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // Extract text based on file type
    let textContent = '';
    
    if (doc.file_type === 'txt' || doc.file_type === 'md') {
      textContent = await fileData.text();
    } else if (doc.file_type === 'pdf') {
      // For PDF, we'll use a simple text extraction approach
      // In production, you'd want a proper PDF parser
      const arrayBuffer = await fileData.arrayBuffer();
      const text = new TextDecoder().decode(arrayBuffer);
      // Extract readable text (this is simplified - PDF parsing is complex)
      textContent = text.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ');
    } else if (doc.file_type === 'docx') {
      // For DOCX, extract XML text content (simplified)
      const arrayBuffer = await fileData.arrayBuffer();
      const text = new TextDecoder().decode(arrayBuffer);
      textContent = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    }

    if (!textContent || textContent.length < 100) {
      throw new Error('Could not extract sufficient text from document');
    }

    console.log(`Extracted ${textContent.length} characters from document`);

    // Chunk the text
    const chunks = chunkText(textContent);
    console.log(`Created ${chunks.length} chunks`);

    // Delete existing chunks
    await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId);

    // Generate embeddings and store chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const embedding = await generateEmbedding(chunk, LOVABLE_API_KEY);
        
        await supabase
          .from('document_chunks')
          .insert({
            document_id: documentId,
            chunk_index: i,
            content: chunk,
            embedding: embedding,
            metadata: { word_count: chunk.split(/\s+/).length }
          });
          
        console.log(`Processed chunk ${i + 1}/${chunks.length}`);
      } catch (e) {
        console.error(`Failed to process chunk ${i}:`, e);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Extract policy rules
    const rules = await extractPolicyRules(textContent, LOVABLE_API_KEY);
    console.log(`Extracted ${rules.length} policy rules`);

    // Delete existing rules
    await supabase
      .from('policy_rules')
      .delete()
      .eq('document_id', documentId);

    // Store rules
    for (const rule of rules) {
      await supabase
        .from('policy_rules')
        .insert({
          document_id: documentId,
          rule_type: rule.rule_type,
          rule_context: rule.rule_context,
          rule_description: rule.rule_description,
          rule_condition: rule.rule_condition,
          severity: rule.severity
        });
    }

    // Update document status
    await supabase
      .from('policy_documents')
      .update({
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
        chunk_count: chunks.length
      })
      .eq('id', documentId);

    return new Response(JSON.stringify({ 
      success: true, 
      chunks: chunks.length,
      rules: rules.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing document:', error);
    
    // Try to update document status to failed
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { documentId } = await (async () => {
        try {
          return await req.clone().json();
        } catch {
          return { documentId: null };
        }
      })();
      
      if (documentId) {
        await supabase
          .from('policy_documents')
          .update({
            processing_status: 'failed',
            processing_error: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', documentId);
      }
    } catch (e) {
      console.error('Failed to update error status:', e);
    }
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
