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
    const { documentContent, companyId, userId, permissionContext } = await req.json();

    if (!documentContent) {
      throw new Error('No document content provided');
    }

    if (!companyId) {
      throw new Error('Company ID is required');
    }

    // Verify user has access to the company
    if (!permissionContext.isAdmin && !permissionContext.accessibleCompanyIds?.includes(companyId)) {
      throw new Error('You do not have permission to access this company');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Analyzing bank file spec for company ${companyId} by user ${userId}`);

    const systemPrompt = `You are an expert at analyzing bank file format specifications. 
Your task is to extract the structure and format requirements from bank file specification documents.

Analyze the document and extract:
1. Bank name
2. File format type (e.g., NACHA ACH, BACS, SEPA, CSV, Fixed-width, etc.)
3. Header record format and fields
4. Detail/transaction record format and fields
5. Footer/trailer record format and fields
6. Field positions, lengths, and data types
7. Any special formatting requirements

Return your analysis as a JSON object with this structure:
{
  "bankName": "Bank name",
  "fileFormat": "Format type (e.g., NACHA, BACS, CSV)",
  "description": "Brief description of the format",
  "detectedFields": ["field1", "field2", "field3"],
  "headerTemplate": {
    "fields": [
      {"name": "recordType", "position": 1, "length": 1, "value": "1", "description": "Record type identifier"},
      ...
    ],
    "separator": ",",
    "lineEnding": "\\n"
  },
  "recordTemplate": {
    "fields": [
      {"name": "recordType", "position": 1, "length": 1, "value": "6", "description": "Record type identifier"},
      {"name": "accountNumber", "source": "employee.bank_account", "position": 2, "length": 17, "padding": "left", "padChar": " "},
      {"name": "routingNumber", "source": "employee.bank_routing", "position": 19, "length": 9},
      {"name": "amount", "source": "payroll.net_pay", "position": 28, "length": 10, "padding": "left", "padChar": "0", "format": "cents"},
      {"name": "employeeName", "source": "employee.full_name", "position": 38, "length": 22},
      ...
    ],
    "separator": ",",
    "lineEnding": "\\n"
  },
  "footerTemplate": {
    "fields": [
      {"name": "recordType", "position": 1, "length": 1, "value": "9", "description": "Record type identifier"},
      {"name": "totalRecords", "source": "summary.record_count", "position": 2, "length": 6, "padding": "left", "padChar": "0"},
      {"name": "totalAmount", "source": "summary.total_amount", "position": 8, "length": 12, "padding": "left", "padChar": "0", "format": "cents"},
      ...
    ],
    "separator": ",",
    "lineEnding": "\\n"
  }
}

Available data sources for fields:
- employee.bank_account: Employee bank account number
- employee.bank_routing: Employee bank routing number
- employee.full_name: Employee full name
- employee.employee_code: Employee ID/code
- payroll.net_pay: Net pay amount
- payroll.gross_pay: Gross pay amount
- company.bank_account: Company bank account
- company.bank_routing: Company bank routing
- company.name: Company name
- company.id_number: Company ID number
- summary.record_count: Total number of records
- summary.total_amount: Total payment amount
- summary.batch_number: Batch/file sequence number
- date.file_creation: File creation date
- date.effective: Effective/value date`;

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
          { role: 'user', content: `Analyze this bank file specification and extract the format structure:\n\n${documentContent}` }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to analyze specification');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No analysis result from AI');
    }

    // Parse JSON from response (handle markdown code blocks)
    let analysisResult;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse analysis result');
    }

    console.log(`Analysis complete: ${analysisResult.bankName} - ${analysisResult.fileFormat}`);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in analyze-bank-file-spec:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze specification';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
