import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnnotationRequest {
  imageBase64: string;
  annotations: {
    type: 'callout' | 'arrow' | 'highlight' | 'label';
    text?: string;
    position?: string; // e.g., "top-left", "center", "bottom-right"
    targetElement?: string; // Description of what to annotate
  }[];
  style?: {
    calloutColor?: string;
    arrowColor?: string;
    highlightColor?: string;
    fontSize?: string;
  };
  instructions?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const request: AnnotationRequest = await req.json();
    console.log("Annotate screenshot request received");

    if (!request.imageBase64) {
      throw new Error("Image data is required");
    }

    // Build annotation instructions
    let annotationInstructions = "Add the following annotations to this screenshot:\n\n";
    
    request.annotations.forEach((annotation, index) => {
      switch (annotation.type) {
        case 'callout':
          annotationInstructions += `${index + 1}. Add a numbered callout (${index + 1}) ${annotation.position ? `at ${annotation.position}` : ''} ${annotation.targetElement ? `pointing to ${annotation.targetElement}` : ''}. ${annotation.text ? `Label: "${annotation.text}"` : ''}\n`;
          break;
        case 'arrow':
          annotationInstructions += `${index + 1}. Add an arrow ${annotation.position ? `at ${annotation.position}` : ''} ${annotation.targetElement ? `pointing to ${annotation.targetElement}` : ''}. ${annotation.text ? `With label: "${annotation.text}"` : ''}\n`;
          break;
        case 'highlight':
          annotationInstructions += `${index + 1}. Add a highlight box ${annotation.position ? `at ${annotation.position}` : ''} ${annotation.targetElement ? `around ${annotation.targetElement}` : ''}.\n`;
          break;
        case 'label':
          annotationInstructions += `${index + 1}. Add a text label "${annotation.text}" ${annotation.position ? `at ${annotation.position}` : ''} ${annotation.targetElement ? `near ${annotation.targetElement}` : ''}.\n`;
          break;
      }
    });

    if (request.style) {
      annotationInstructions += `\nStyle preferences: Use ${request.style.calloutColor || 'red'} for callouts, ${request.style.highlightColor || 'yellow'} for highlights.`;
    }

    if (request.instructions) {
      annotationInstructions += `\n\nAdditional instructions: ${request.instructions}`;
    }

    annotationInstructions += "\n\nMake the annotations professional, clear, and easy to read. Use a consistent style throughout.";

    // Prepare the image URL
    let imageUrl = request.imageBase64;
    if (!imageUrl.startsWith('data:')) {
      imageUrl = `data:image/png;base64,${imageUrl}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: annotationInstructions
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    
    // Extract the annotated image from the response
    const annotatedImage = message?.images?.[0]?.image_url?.url;
    const textResponse = message?.content;

    console.log("Screenshot annotation completed");

    return new Response(JSON.stringify({
      success: true,
      annotatedImage: annotatedImage || null,
      message: textResponse || "Annotation completed",
      originalAnnotations: request.annotations
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Annotate screenshot error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
