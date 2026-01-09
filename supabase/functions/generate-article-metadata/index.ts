import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArticleInput {
  id: string;
  title: string;
  content: string;
  category?: string;
}

interface ArticleMetadata {
  articleId: string;
  keywords: string[];
  summary: string;
  faqs: { question: string; answer: string }[];
  relatedTopics: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articles, manualName } = await req.json();

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'articles array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Process articles in batches to avoid token limits
    const batchSize = 5;
    const results: ArticleMetadata[] = [];

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize);
      
      const articlesContext = batch.map((a: ArticleInput) => `
Article ID: ${a.id}
Title: ${a.title}
Content Preview: ${a.content.substring(0, 500)}...
`).join('\n---\n');

      const prompt = `You are an SEO expert for enterprise HRMS documentation. Analyze these articles from the "${manualName || 'HRplus'}" manual.

For each article, generate:
1. **Keywords** (5-10): Search terms users would use to find this content
2. **Summary** (max 150 chars): Brief description for search results
3. **FAQs** (2-3): Questions this article answers, with short answers
4. **Related Topics**: Other HRMS topics users might need

Articles to analyze:
${articlesContext}

Respond with a JSON object:
{
  "metadata": [
    {
      "articleId": "article-id-here",
      "keywords": ["keyword1", "keyword2"],
      "summary": "Brief summary under 150 characters",
      "faqs": [
        { "question": "How do I...?", "answer": "Short answer" }
      ],
      "relatedTopics": ["Topic 1", "Topic 2"]
    }
  ]
}`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'You are an SEO metadata generator. Respond only with valid JSON.' },
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
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content || '{}';
      
      try {
        const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanedContent);
        if (parsed.metadata && Array.isArray(parsed.metadata)) {
          results.push(...parsed.metadata);
        }
      } catch {
        console.error('Failed to parse AI response for batch:', content);
        // Add fallback metadata for this batch
        batch.forEach((a: ArticleInput) => {
          results.push({
            articleId: a.id,
            keywords: [a.title.toLowerCase()],
            summary: a.title,
            faqs: [],
            relatedTopics: [],
          });
        });
      }
    }

    return new Response(
      JSON.stringify({ metadata: results, totalProcessed: articles.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Metadata generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
