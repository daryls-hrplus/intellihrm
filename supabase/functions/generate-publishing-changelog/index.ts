import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChangelogRequest {
  manualId: string
  manualName: string
  selectedSections: string[]
  sectionTitles: string[]
  versionType: 'initial' | 'major' | 'minor' | 'patch'
  previousVersion?: string
  isFirstPublication: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const requestData: ChangelogRequest = await req.json()
    const { 
      manualId, 
      manualName, 
      selectedSections, 
      sectionTitles,
      versionType, 
      previousVersion,
      isFirstPublication 
    } = requestData

    console.log('Generating changelog for:', { manualId, manualName, versionType, isFirstPublication })

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Build context for the AI
    let systemPrompt = `You are a technical writer generating changelog entries for documentation publications.
Generate concise, professional changelog entries that clearly communicate what's being published or updated.
Format: Return ONLY a JSON array of 3-5 strings. Each string is a single changelog entry.
Example: ["Initial release of configuration guide", "Added new section on data imports"]
Do not include any explanation or markdown - just the JSON array.`

    let userPrompt: string
    
    if (isFirstPublication) {
      userPrompt = `Generate changelog entries for the FIRST publication of "${manualName}" to a Help Center.

This manual contains ${selectedSections.length} sections:
${sectionTitles.slice(0, 15).map(t => `- ${t}`).join('\n')}
${sectionTitles.length > 15 ? `\n...and ${sectionTitles.length - 15} more sections` : ''}

Focus on the main capabilities documented and the value this provides to administrators.`
    } else {
      userPrompt = `Generate changelog entries for an UPDATE to "${manualName}".
Version type: ${versionType} (previous: ${previousVersion || 'unknown'})

${selectedSections.length} sections being updated:
${sectionTitles.slice(0, 12).map(t => `- ${t}`).join('\n')}
${sectionTitles.length > 12 ? `\n...and ${sectionTitles.length - 12} more sections` : ''}

${versionType === 'major' ? 'This is a MAJOR update with significant changes.' : ''}
${versionType === 'minor' ? 'This is a MINOR update with new content.' : ''}
${versionType === 'patch' ? 'This is a PATCH with fixes and corrections.' : ''}`
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error("AI API error:", aiResponse.status, errorText)
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later.", changelog: [] }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI usage limit reached.", changelog: [] }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
      
      throw new Error("Failed to generate changelog")
    }

    const aiData = await aiResponse.json()
    const generatedText = aiData.choices?.[0]?.message?.content || ""

    // Parse the JSON array from the response
    let changelog: string[]
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        changelog = JSON.parse(jsonMatch[0])
      } else {
        // Fallback: extract bullet points
        changelog = generatedText.split('\n')
          .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('•'))
          .map((line: string) => line.replace(/^[-•]\s*/, '').trim())
          .filter(Boolean)
      }
    } catch (e) {
      console.error('Failed to parse changelog:', e)
      changelog = [generatedText.trim().substring(0, 200)]
    }

    console.log('Generated changelog:', changelog)

    return new Response(
      JSON.stringify({ 
        success: true, 
        changelog,
        isFirstPublication
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error generating changelog:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        changelog: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})