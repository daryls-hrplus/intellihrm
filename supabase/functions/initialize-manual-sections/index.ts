import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Standard 8-part structure for enterprise HR manuals
const STANDARD_STRUCTURE = [
  {
    number: "1",
    title: "Module Overview and Conceptual Foundation",
    subsections: [
      { number: "1.1", title: "Introduction to [Module] in HRplus" },
      { number: "1.2", title: "Core Concepts and Terminology" },
      { number: "1.3", title: "System Architecture Overview" },
      { number: "1.4", title: "User Personas and Journeys" },
      { number: "1.5", title: "Module Calendar and Key Dates" },
    ],
  },
  {
    number: "2",
    title: "Setup and Configuration Guide",
    subsections: [
      { number: "2.1", title: "Prerequisites Checklist" },
      { number: "2.2", title: "Initial Setup and Configuration" },
      { number: "2.3", title: "Role and Permission Setup" },
      { number: "2.4", title: "Integration Configuration" },
    ],
  },
  {
    number: "3",
    title: "Operational Workflows",
    subsections: [
      { number: "3.1", title: "Standard Workflows" },
      { number: "3.2", title: "Process Automation" },
      { number: "3.3", title: "Data Entry and Management" },
    ],
  },
  {
    number: "4",
    title: "Advanced Features",
    subsections: [
      { number: "4.1", title: "Advanced Configuration" },
      { number: "4.2", title: "Custom Workflows" },
      { number: "4.3", title: "Bulk Operations" },
    ],
  },
  {
    number: "5",
    title: "AI Features and Automation",
    subsections: [
      { number: "5.1", title: "AI Assistant Overview" },
      { number: "5.2", title: "Automated Recommendations" },
      { number: "5.3", title: "Predictive Analytics" },
    ],
  },
  {
    number: "6",
    title: "Analytics and Reporting",
    subsections: [
      { number: "6.1", title: "Standard Reports" },
      { number: "6.2", title: "Dashboard Configuration" },
      { number: "6.3", title: "Custom Report Builder" },
    ],
  },
  {
    number: "7",
    title: "Integration Points",
    subsections: [
      { number: "7.1", title: "Cross-Module Integration" },
      { number: "7.2", title: "External System Integration" },
      { number: "7.3", title: "Data Import/Export" },
    ],
  },
  {
    number: "8",
    title: "Troubleshooting and FAQ",
    subsections: [
      { number: "8.1", title: "Common Issues and Solutions" },
      { number: "8.2", title: "Frequently Asked Questions" },
      { number: "8.3", title: "Support Resources" },
    ],
  },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      manualId,
      moduleName,
      moduleCodes = [],
      targetRoles = ['admin'],
      customSections
    } = await req.json();

    if (!manualId) {
      throw new Error('manualId is required');
    }

    // Get manual definition
    const { data: manual, error: manualError } = await supabase
      .from('manual_definitions')
      .select('*')
      .eq('id', manualId)
      .single();

    if (manualError) throw manualError;
    if (!manual) throw new Error('Manual not found');

    // Use custom sections or standard structure
    const structureToUse = customSections || STANDARD_STRUCTURE;
    const manualName = moduleName || manual.manual_name.replace(' Manual', '').replace(' Guide', '');

    // Create sections
    const sectionsToCreate: Array<{
      manual_id: string;
      section_number: string;
      title: string;
      content: Record<string, never>;
      source_module_codes: string[];
      display_order: number;
      parent_section_id: null;
      target_roles: string[];
      needs_regeneration: boolean;
    }> = [];

    let displayOrder = 0;
    
    for (const section of structureToUse) {
      // Add parent section
      displayOrder++;
      sectionsToCreate.push({
        manual_id: manualId,
        section_number: section.number,
        title: section.title.replace('[Module]', manualName),
        content: {},
        source_module_codes: moduleCodes.length > 0 ? moduleCodes : manual.module_codes || [],
        display_order: displayOrder,
        parent_section_id: null,
        target_roles: targetRoles,
        needs_regeneration: true,
      });

      // Add subsections
      if (section.subsections) {
        for (const subsection of section.subsections) {
          displayOrder++;
          sectionsToCreate.push({
            manual_id: manualId,
            section_number: subsection.number,
            title: subsection.title.replace('[Module]', manualName),
            content: {},
            source_module_codes: moduleCodes.length > 0 ? moduleCodes : manual.module_codes || [],
            display_order: displayOrder,
            parent_section_id: null,
            target_roles: targetRoles,
            needs_regeneration: true,
          });
        }
      }
    }

    // Insert sections
    const { data: createdSections, error: sectionsError } = await supabase
      .from('manual_sections')
      .insert(sectionsToCreate)
      .select();

    if (sectionsError) throw sectionsError;

    // Update manual with section count info
    await supabase
      .from('manual_definitions')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', manualId);

    return new Response(
      JSON.stringify({
        success: true,
        manualId,
        sectionsCreated: createdSections?.length || 0,
        structure: structureToUse.map((s: { number: string; title: string; subsections?: { number: string; title: string }[] }) => ({
          number: s.number,
          title: s.title.replace('[Module]', manualName),
          subsections: s.subsections?.length || 0,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error initializing manual sections:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
