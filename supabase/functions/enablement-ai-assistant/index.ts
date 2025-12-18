import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  layout: {
    includeTableOfContents: boolean;
    includeSummary: boolean;
    includePrerequisites: boolean;
    includeLearningObjectives: boolean;
    includeScreenshots: boolean;
    includeStepNumbers: boolean;
    includeTimeEstimates: boolean;
    includeRoleIndicators: boolean;
    includeVersionInfo: boolean;
    includeRelatedDocs: boolean;
  };
  sections: {
    introduction: boolean;
    overview: boolean;
    prerequisites: boolean;
    stepByStep: boolean;
    bestPractices: boolean;
    troubleshooting: boolean;
    faqs: boolean;
    glossary: boolean;
    appendix: boolean;
  };
  formatting: {
    headerStyle: string;
    calloutStyle: string;
    screenshotPlacement: string;
    codeBlockTheme: string;
  };
  branding: {
    primaryColor: string;
    companyName?: string;
    footerText?: string;
  };
}

interface EnablementRequest {
  action: 'generate_module_overview' | 'generate_feature_tutorial' | 'generate_video_storyboard' | 'generate_quick_reference' | 'generate_kb_article' | 'generate_training_guide' | 'generate_user_manual' | 'generate_sop';
  moduleCode?: string;
  moduleName?: string;
  featureCode?: string;
  featureName?: string;
  featureDescription?: string;
  targetRoles?: string[];
  workflowSteps?: string[];
  uiElements?: string[];
  includeScreenshots?: boolean;
  clientCompanyName?: string;
  customInstructions?: string;
  template?: DocumentTemplate;
  // Template Library integration
  referenceDocuments?: Array<{
    fileName: string;
    extractedPatterns?: string;
    content?: string;
  }>;
  templateInstructions?: {
    tone?: string;
    audience?: string;
    formattingRules?: string[];
    terminology?: string[];
    customText?: string;
  };
}

function buildIndustryStandardPrompt(request: EnablementRequest): { systemPrompt: string; userPrompt: string } {
  const template = request.template;
  const templateType = template?.type || 'training_guide';
  
  // Build sections list based on template configuration
  const enabledSections = template?.sections ? Object.entries(template.sections)
    .filter(([_, enabled]) => enabled)
    .map(([section]) => section) : ['introduction', 'overview', 'stepByStep', 'bestPractices'];

  const layoutOptions = template?.layout || {
    includeTableOfContents: true,
    includeSummary: true,
    includePrerequisites: true,
    includeLearningObjectives: true,
    includeScreenshots: true,
    includeStepNumbers: true,
    includeTimeEstimates: true,
    includeRoleIndicators: true,
    includeVersionInfo: true,
    includeRelatedDocs: true,
  };

  // Build reference document context
  let referenceContext = '';
  if (request.referenceDocuments && request.referenceDocuments.length > 0) {
    referenceContext = `\n\n## Reference Documents Context
The following reference documents provide formatting patterns and style guidelines to follow:
${request.referenceDocuments.map(doc => `
### ${doc.fileName}
${doc.extractedPatterns || 'No patterns extracted'}
${doc.content ? `\nContent Preview:\n${doc.content.substring(0, 500)}...` : ''}
`).join('\n')}`;
  }

  // Build template instructions context
  let instructionsContext = '';
  if (request.templateInstructions) {
    const instr = request.templateInstructions;
    instructionsContext = `\n\n## Custom Instructions
${instr.tone ? `**Tone & Voice:** ${instr.tone}` : ''}
${instr.audience ? `**Target Audience:** ${instr.audience}` : ''}
${instr.formattingRules && instr.formattingRules.length > 0 ? `**Formatting Rules:**\n${instr.formattingRules.map(r => `- ${r}`).join('\n')}` : ''}
${instr.terminology && instr.terminology.length > 0 ? `**Terminology:**\n${instr.terminology.map(t => `- ${t}`).join('\n')}` : ''}
${instr.customText ? `**Additional Instructions:**\n${instr.customText}` : ''}`;
  }

  const systemPrompt = `You are an expert technical documentation writer specializing in enterprise software training materials. You follow industry standards for documentation including:

1. **ADDIE Model** (Analysis, Design, Development, Implementation, Evaluation) for instructional design
2. **SAM Model** (Successive Approximation Model) for iterative content development
3. **Bloom's Taxonomy** for learning objective classification
4. **Microsoft Manual of Style** and **Google Developer Documentation Style Guide** for writing standards

Your documentation must include:
- Clear, action-oriented instructions
- Screenshot placeholders with detailed annotation descriptions
- Information panels (Info, Warning, Tip, Success) similar to Confluence
- Numbered steps with clear success criteria
- Troubleshooting sections for common issues
- Glossary of technical terms
- FAQs based on anticipated user questions

Document Structure Standards:
- Use progressive disclosure (simple to complex)
- Include "Before You Begin" prerequisites
- Add "What You'll Learn" objectives
- Include time estimates for each section
- Add role-based callouts for different user types
- Include "Next Steps" navigation
- Add related documentation cross-references

Screenshot Requirements:
- Provide detailed descriptions for each screenshot location
- List specific UI elements to highlight
- Describe annotations (arrows, callouts, highlights) needed
- Include figure captions and numbering

Template Type: ${templateType}
Sections to include: ${enabledSections.join(', ')}
Include Learning Objectives: ${layoutOptions.includeLearningObjectives}
Include Screenshots: ${layoutOptions.includeScreenshots}
Include Time Estimates: ${layoutOptions.includeTimeEstimates}
Include Table of Contents: ${layoutOptions.includeTableOfContents}
Include Prerequisites: ${layoutOptions.includePrerequisites}
Include Role Indicators: ${layoutOptions.includeRoleIndicators}
Include Version Info: ${layoutOptions.includeVersionInfo}
Include Related Docs: ${layoutOptions.includeRelatedDocs}${referenceContext}${instructionsContext}`;

  return { systemPrompt, userPrompt: '' };
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

    const request: EnablementRequest = await req.json();
    console.log("Enablement AI request:", request.action);

    let systemPrompt = "";
    let userPrompt = "";
    const template = request.template;

    // Build the base industry-standard prompt
    const basePrompt = buildIndustryStandardPrompt(request);
    systemPrompt = basePrompt.systemPrompt;

    switch (request.action) {
      case 'generate_module_overview':
      case 'generate_training_guide':
        systemPrompt += `

You are generating a comprehensive training guide/module overview for enterprise HRIS software. Follow these industry standards:
- Use Gagne's Nine Events of Instruction
- Include SMART learning objectives (Specific, Measurable, Achievable, Relevant, Time-bound)
- Structure content using the 4C/ID model for complex learning`;

        // Build feature-specific context if a feature is selected
        const featureContext = request.featureName ? `
SPECIFIC FEATURE FOCUS: ${request.featureName}
Feature Description: ${request.featureDescription || 'Not provided'}
${request.workflowSteps?.length ? `Workflow Steps: ${request.workflowSteps.join(' → ')}` : ''}
${request.uiElements?.length ? `UI Elements: ${request.uiElements.join(', ')}` : ''}

Generate the training guide specifically for this feature, not the entire module.` : '';

        userPrompt = `Generate a comprehensive, industry-standard training guide for ${request.featureName ? `the "${request.featureName}" feature in` : ''} the "${request.moduleName}" module in HRplus Cerebra enterprise HRIS system.
${featureContext}
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Generate a complete training document with the following JSON structure:
{
  "title": "Training Guide: ${request.moduleName}",
  "description": "Comprehensive training guide for...",
  "summary": "Executive summary of what this guide covers",
  "version": "1.0",
  "lastUpdated": "${new Date().toISOString().split('T')[0]}",
  "author": "HRplus Cerebra Documentation Team",
  "targetRoles": ${JSON.stringify(request.targetRoles || ['all_users'])},
  "estimatedDuration": 30,
  "learningObjectives": [
    "Understand the purpose and business value of ${request.moduleName}",
    "Navigate the ${request.moduleName} interface effectively",
    "Complete common tasks and workflows",
    "Apply best practices for ${request.moduleName} usage"
  ],
  "prerequisites": [
    "Basic computer literacy",
    "HRplus Cerebra user account with appropriate permissions",
    "Completion of HRplus Cerebra Basic Navigation training"
  ],
  "tableOfContents": [
    { "id": "1", "title": "Introduction", "level": 1 },
    { "id": "1.1", "title": "Purpose", "level": 2 },
    { "id": "1.2", "title": "Who Should Read This", "level": 2 },
    { "id": "2", "title": "Getting Started", "level": 1 },
    { "id": "2.1", "title": "Accessing the Module", "level": 2 },
    { "id": "2.2", "title": "Interface Overview", "level": 2 },
    { "id": "3", "title": "Core Features", "level": 1 },
    { "id": "4", "title": "Step-by-Step Procedures", "level": 1 },
    { "id": "5", "title": "Best Practices", "level": 1 },
    { "id": "6", "title": "Troubleshooting", "level": 1 }
  ],
  "sections": [
    {
      "id": "intro",
      "type": "heading",
      "level": 1,
      "content": "1. Introduction"
    },
    {
      "id": "intro-text",
      "type": "paragraph",
      "content": "This training guide provides comprehensive instruction on using the ${request.moduleName} module in HRplus Cerebra. By following this guide, you will gain the knowledge and skills necessary to effectively utilize all features of this module."
    },
    {
      "id": "tip-1",
      "type": "callout",
      "calloutType": "tip",
      "content": "Bookmark this guide for quick reference. You can also access context-sensitive help within the application by pressing F1."
    },
    {
      "id": "screenshot-1",
      "type": "screenshot",
      "screenshot": {
        "id": "module-dashboard",
        "description": "The ${request.moduleName} module dashboard showing the main navigation and key features",
        "annotations": [
          "Highlight the main navigation menu on the left",
          "Add callout to the Quick Actions panel",
          "Circle the search/filter area",
          "Arrow pointing to the Create New button"
        ],
        "step": 1
      }
    },
    {
      "id": "getting-started",
      "type": "heading",
      "level": 1,
      "content": "2. Getting Started"
    },
    {
      "id": "access-heading",
      "type": "heading",
      "level": 2,
      "content": "2.1 Accessing the Module"
    },
    {
      "id": "access-steps",
      "type": "steps",
      "items": [
        {
          "stepNumber": 1,
          "title": "Navigate to the Module",
          "instruction": "From the main HRplus Cerebra dashboard, locate the ${request.moduleName} option in the left sidebar navigation menu and click on it.",
          "tip": "If you don't see this module, contact your system administrator to verify your access permissions.",
          "screenshotHint": "Screenshot showing the sidebar with ${request.moduleName} highlighted"
        },
        {
          "stepNumber": 2,
          "title": "View the Module Dashboard",
          "instruction": "Once clicked, the ${request.moduleName} dashboard will load. This is your central hub for all activities within this module.",
          "screenshotHint": "Full screenshot of the module dashboard with key areas labeled"
        },
        {
          "stepNumber": 3,
          "title": "Familiarize with the Interface",
          "instruction": "Take a moment to identify the main areas: the action toolbar at the top, the main content area in the center, and any filter panels on the side.",
          "tip": "Hover over icons to see tooltips explaining each function."
        }
      ]
    },
    {
      "id": "warning-permissions",
      "type": "callout",
      "calloutType": "warning",
      "content": "Your available features may vary based on your assigned role and permissions. Contact your HR administrator if you need access to additional features."
    },
    {
      "id": "core-features",
      "type": "heading",
      "level": 1,
      "content": "3. Core Features"
    },
    {
      "id": "features-list",
      "type": "paragraph",
      "content": "The ${request.moduleName} module includes several key features designed to streamline your HR workflows:"
    },
    {
      "id": "feature-bullets",
      "type": "list",
      "items": [
        "Dashboard view with key metrics and action items",
        "Advanced search and filtering capabilities",
        "Bulk operations for efficiency",
        "Export functionality for reporting",
        "Integration with other HRplus modules"
      ]
    },
    {
      "id": "best-practices",
      "type": "heading",
      "level": 1,
      "content": "5. Best Practices"
    },
    {
      "id": "bp-callout",
      "type": "callout",
      "calloutType": "success",
      "content": "Following these best practices will help you get the most out of the ${request.moduleName} module and maintain data quality across your organization."
    },
    {
      "id": "bp-list",
      "type": "list",
      "items": [
        "Regularly review and update data to maintain accuracy",
        "Use consistent naming conventions",
        "Leverage bulk operations for efficiency",
        "Review audit logs periodically",
        "Train team members on standard procedures"
      ]
    },
    {
      "id": "troubleshooting",
      "type": "heading",
      "level": 1,
      "content": "6. Troubleshooting"
    },
    {
      "id": "troubleshooting-expandable",
      "type": "expandable",
      "content": "Common Issues and Solutions",
      "items": [
        "Issue: Cannot access the module - Solution: Verify your role permissions with your administrator",
        "Issue: Data not loading - Solution: Refresh the page or clear browser cache",
        "Issue: Export fails - Solution: Reduce the date range or apply more filters"
      ]
    }
  ],
  "faqs": [
    {
      "question": "How do I get access to this module?",
      "answer": "Access is granted based on your role. Contact your HR administrator or system admin to request appropriate permissions."
    },
    {
      "question": "Can I customize the dashboard view?",
      "answer": "Yes, many views can be customized. Look for the settings icon in the top right corner of dashboard widgets."
    },
    {
      "question": "How do I report an issue or bug?",
      "answer": "Use the Help menu to submit a support ticket, or contact your internal IT helpdesk."
    }
  ],
  "glossary": [
    {
      "term": "Module",
      "definition": "A functional area within HRplus Cerebra focused on a specific HR domain"
    },
    {
      "term": "Dashboard",
      "definition": "The main landing page for a module showing key metrics and quick actions"
    },
    {
      "term": "Role",
      "definition": "A set of permissions that determines what features a user can access"
    }
  ],
  "relatedDocs": [
    { "title": "HRplus Cerebra Getting Started Guide", "href": "/help/getting-started" },
    { "title": "User Roles and Permissions", "href": "/help/roles-permissions" },
    { "title": "Reporting and Analytics Guide", "href": "/help/reporting" }
  ],
  "tags": ["training", "${request.moduleName?.toLowerCase()}", "user-guide", "hrplus"]
}`;
        break;

      case 'generate_feature_tutorial':
        systemPrompt += `

You are generating a step-by-step feature tutorial following the Task-Centered Instructional Design approach. Include:
- Clear task decomposition
- Scaffolded learning with worked examples
- Practice opportunities at each stage
- Error prevention through warnings and tips`;

        userPrompt = `Generate a detailed, industry-standard step-by-step tutorial for the "${request.featureName}" feature in the ${request.moduleName} module of HRplus Cerebra.

Feature description: ${request.featureDescription || 'Not provided'}
${request.workflowSteps?.length ? `Known workflow steps: ${request.workflowSteps.join(', ')}` : ''}
${request.uiElements?.length ? `UI elements involved: ${request.uiElements.join(', ')}` : ''}
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Generate the tutorial with this JSON structure:
{
  "title": "How to: ${request.featureName}",
  "description": "Step-by-step guide for using ${request.featureName} in HRplus Cerebra",
  "summary": "This tutorial walks you through...",
  "version": "1.0",
  "lastUpdated": "${new Date().toISOString().split('T')[0]}",
  "author": "HRplus Cerebra Documentation Team",
  "targetRoles": ${JSON.stringify(request.targetRoles || ['all_users'])},
  "estimatedDuration": 15,
  "learningObjectives": [
    "Successfully complete ${request.featureName} process",
    "Understand when to use this feature",
    "Avoid common mistakes and errors"
  ],
  "prerequisites": [
    "Access to the ${request.moduleName} module",
    "Appropriate permissions for this feature"
  ],
  "tableOfContents": [
    { "id": "1", "title": "Before You Begin", "level": 1 },
    { "id": "2", "title": "Step-by-Step Instructions", "level": 1 },
    { "id": "3", "title": "Verification", "level": 1 },
    { "id": "4", "title": "Troubleshooting", "level": 1 }
  ],
  "sections": [
    {
      "id": "before-begin",
      "type": "heading",
      "level": 1,
      "content": "Before You Begin"
    },
    {
      "id": "prereq-callout",
      "type": "callout",
      "calloutType": "info",
      "content": "Ensure you have the necessary permissions and any required information ready before starting."
    },
    {
      "id": "steps-heading",
      "type": "heading",
      "level": 1,
      "content": "Step-by-Step Instructions"
    },
    {
      "id": "main-steps",
      "type": "steps",
      "items": [
        {
          "stepNumber": 1,
          "title": "Navigate to ${request.featureName}",
          "instruction": "Go to the ${request.moduleName} module and locate the ${request.featureName} option.",
          "tip": "You can also use the global search (Ctrl+K) to quickly find this feature.",
          "screenshotHint": "Screenshot showing navigation path to ${request.featureName}",
          "annotations": ["Highlight the menu item", "Show the breadcrumb path"]
        },
        {
          "stepNumber": 2,
          "title": "Enter Required Information",
          "instruction": "Fill in all required fields marked with an asterisk (*). Review the information carefully before proceeding.",
          "warning": "Incomplete information may result in errors during processing.",
          "screenshotHint": "Screenshot of the form with required fields highlighted"
        },
        {
          "stepNumber": 3,
          "title": "Review and Submit",
          "instruction": "Double-check all entered information, then click the Submit/Save button to complete the action.",
          "tip": "Some actions may require approval. You'll receive a notification when processing is complete.",
          "screenshotHint": "Screenshot showing the submit button and confirmation dialog"
        }
      ]
    },
    {
      "id": "verify-heading",
      "type": "heading",
      "level": 1,
      "content": "Verification"
    },
    {
      "id": "verify-success",
      "type": "callout",
      "calloutType": "success",
      "content": "You'll know the action was successful when you see a confirmation message and the status updates in the system."
    },
    {
      "id": "troubleshoot-heading",
      "type": "heading",
      "level": 1,
      "content": "Troubleshooting"
    },
    {
      "id": "troubleshoot-expand",
      "type": "expandable",
      "content": "Common Issues",
      "items": [
        "Error: Required field missing - Ensure all fields marked with * are filled",
        "Error: Permission denied - Contact your administrator for access",
        "Error: Validation failed - Check that data formats are correct (dates, numbers, etc.)"
      ]
    }
  ],
  "faqs": [
    {
      "question": "What happens if I make a mistake?",
      "answer": "Most actions can be edited or corrected after submission. For critical changes, contact your administrator."
    },
    {
      "question": "How long does processing take?",
      "answer": "Most operations complete immediately. Workflow approvals may take longer depending on your organization's settings."
    }
  ],
  "relatedDocs": [
    { "title": "${request.moduleName} Overview", "href": "/help/${request.moduleCode}" },
    { "title": "Getting Help", "href": "/help/support" }
  ],
  "tags": ["tutorial", "${request.featureName?.toLowerCase()}", "${request.moduleName?.toLowerCase()}"]
}`;
        break;

      case 'generate_video_storyboard':
        systemPrompt += `

You are generating a professional video storyboard for software training. Follow broadcast and e-learning video standards:
- Use the three-act structure (Setup, Confrontation, Resolution)
- Include B-roll suggestions
- Plan for accessibility (captions, audio descriptions)
- Optimize for attention span (2-5 minute segments)`;

        userPrompt = `Generate a professional video storyboard for a training video about "${request.featureName}" in the ${request.moduleName} module.

Feature description: ${request.featureDescription || 'Not provided'}
${request.workflowSteps?.length ? `Workflow steps: ${request.workflowSteps.join(', ')}` : ''}
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Generate the storyboard as JSON with this structure:
{
  "title": "Video: How to Use ${request.featureName}",
  "description": "Training video demonstrating ${request.featureName} in HRplus Cerebra",
  "summary": "This video walks viewers through...",
  "version": "1.0",
  "totalDuration": "5:00",
  "targetRoles": ${JSON.stringify(request.targetRoles || ['all_users'])},
  "estimatedDuration": 5,
  "learningObjectives": [
    "Understand how to use ${request.featureName}",
    "Complete the ${request.featureName} process independently"
  ],
  "sections": [
    {
      "id": "intro",
      "type": "heading",
      "level": 1,
      "content": "Video Storyboard"
    },
    {
      "id": "scenes",
      "type": "steps",
      "items": [
        {
          "stepNumber": 1,
          "title": "Opening - Welcome & Context",
          "instruction": "Duration: 0:30 | NARRATION: Welcome to this HRplus Cerebra training video. Today we'll learn how to use ${request.featureName}.",
          "tip": "ON SCREEN: HRplus Cerebra logo, then transition to dashboard view",
          "screenshotHint": "Animated logo reveal, fade to application"
        },
        {
          "stepNumber": 2,
          "title": "Scene 1 - Navigation",
          "instruction": "Duration: 0:45 | NARRATION: First, let's navigate to where this feature is located...",
          "screenshotHint": "Screen recording showing mouse movement to menu",
          "annotations": ["Cursor spotlight effect", "Highlight menu items"]
        },
        {
          "stepNumber": 3,
          "title": "Scene 2 - Main Demonstration",
          "instruction": "Duration: 2:00 | NARRATION: Now let's walk through the main process step by step...",
          "screenshotHint": "Screen recording of complete workflow",
          "annotations": ["Zoom in on form fields", "Callout boxes for important options"]
        },
        {
          "stepNumber": 4,
          "title": "Scene 3 - Tips & Best Practices",
          "instruction": "Duration: 1:00 | NARRATION: Here are some tips to help you work more efficiently...",
          "tip": "Include split-screen showing correct vs incorrect approaches",
          "screenshotHint": "Comparison view or tip callout animations"
        },
        {
          "stepNumber": 5,
          "title": "Closing - Summary & Next Steps",
          "instruction": "Duration: 0:45 | NARRATION: You've now learned how to ${request.featureName}. For more training videos, visit our help center.",
          "screenshotHint": "Summary slide with key points, end card with links"
        }
      ]
    }
  ],
  "relatedDocs": [
    { "title": "${request.featureName} Tutorial", "href": "/help/tutorials/${request.featureCode}" },
    { "title": "More Training Videos", "href": "/help/videos" }
  ],
  "tags": ["video", "storyboard", "${request.featureName?.toLowerCase()}"]
}`;
        break;

      case 'generate_quick_reference':
        systemPrompt += `

You are generating a quick reference guide (cheat sheet) following usability best practices:
- Scannable layout with clear hierarchy
- Action-oriented language
- Visual chunking for quick lookup
- Essential information only`;

        userPrompt = `Generate a quick reference guide for "${request.featureName || request.moduleName}" in HRplus Cerebra.

${request.featureDescription ? `Description: ${request.featureDescription}` : ''}
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Generate as JSON:
{
  "title": "Quick Reference: ${request.featureName || request.moduleName}",
  "description": "Quick reference card for common tasks",
  "summary": "Keep this handy for quick lookup of common tasks and shortcuts.",
  "version": "1.0",
  "lastUpdated": "${new Date().toISOString().split('T')[0]}",
  "estimatedDuration": 2,
  "sections": [
    {
      "id": "shortcuts",
      "type": "heading",
      "level": 2,
      "content": "Keyboard Shortcuts"
    },
    {
      "id": "shortcut-list",
      "type": "list",
      "items": [
        "Ctrl+K: Global Search",
        "Ctrl+S: Save current form",
        "Esc: Close dialog/modal",
        "F1: Context-sensitive help"
      ]
    },
    {
      "id": "common-tasks",
      "type": "heading",
      "level": 2,
      "content": "Common Tasks"
    },
    {
      "id": "tasks-list",
      "type": "list",
      "items": [
        "Create new: Click + or New button",
        "Edit existing: Click on item or Edit icon",
        "Delete: Select item and click Delete",
        "Export: Use Export button in toolbar"
      ]
    },
    {
      "id": "tips-callout",
      "type": "callout",
      "calloutType": "tip",
      "content": "Use filters to narrow down large lists. Most filters can be saved as presets."
    },
    {
      "id": "warning-callout",
      "type": "callout",
      "calloutType": "warning",
      "content": "Always save your work before navigating away. Unsaved changes will be lost."
    }
  ],
  "tags": ["quick-reference", "cheat-sheet", "${request.moduleName?.toLowerCase()}"]
}`;
        break;

      case 'generate_kb_article':
        systemPrompt += `

You are generating a knowledge base article following SEO and user experience best practices:
- Clear, searchable title
- Structured content with headers
- Action-oriented solutions
- Cross-linking to related content`;

        userPrompt = `Generate a knowledge base article about "${request.featureName}" in the ${request.moduleName} module.

Feature description: ${request.featureDescription || 'Not provided'}
${request.targetRoles ? `Target audience: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Generate as JSON:
{
  "title": "${request.featureName} - Complete Guide",
  "description": "Everything you need to know about ${request.featureName}",
  "summary": "Learn how to use ${request.featureName} effectively in HRplus Cerebra.",
  "version": "1.0",
  "lastUpdated": "${new Date().toISOString().split('T')[0]}",
  "author": "HRplus Cerebra Support",
  "targetRoles": ${JSON.stringify(request.targetRoles || ['all_users'])},
  "estimatedDuration": 10,
  "tableOfContents": [
    { "id": "1", "title": "Overview", "level": 1 },
    { "id": "2", "title": "How to Use", "level": 1 },
    { "id": "3", "title": "FAQs", "level": 1 }
  ],
  "sections": [
    {
      "id": "overview",
      "type": "heading",
      "level": 1,
      "content": "Overview"
    },
    {
      "id": "overview-text",
      "type": "paragraph",
      "content": "${request.featureName} allows you to ${request.featureDescription || 'perform key HR tasks'}. This article explains how to use this feature effectively."
    },
    {
      "id": "how-to",
      "type": "heading",
      "level": 1,
      "content": "How to Use ${request.featureName}"
    },
    {
      "id": "steps",
      "type": "steps",
      "items": [
        {
          "stepNumber": 1,
          "title": "Access the Feature",
          "instruction": "Navigate to ${request.moduleName} and select ${request.featureName}.",
          "screenshotHint": "Navigation path screenshot"
        },
        {
          "stepNumber": 2,
          "title": "Complete the Required Fields",
          "instruction": "Fill in all required information.",
          "screenshotHint": "Form screenshot with fields highlighted"
        },
        {
          "stepNumber": 3,
          "title": "Save and Confirm",
          "instruction": "Click Save to complete the action.",
          "screenshotHint": "Save button and confirmation message"
        }
      ]
    }
  ],
  "faqs": [
    {
      "question": "Who can use this feature?",
      "answer": "This feature is available to users with appropriate permissions in the ${request.moduleName} module."
    },
    {
      "question": "What if I get an error?",
      "answer": "Check that all required fields are complete and you have the necessary permissions. Contact support if the issue persists."
    }
  ],
  "relatedDocs": [
    { "title": "${request.moduleName} Overview", "href": "/help/${request.moduleCode}" },
    { "title": "Permissions Guide", "href": "/help/permissions" }
  ],
  "tags": ["knowledge-base", "${request.featureName?.toLowerCase()}", "${request.moduleName?.toLowerCase()}"]
}`;
        break;

      case 'generate_sop':
      case 'generate_user_manual':
        systemPrompt += `

You are generating a formal Standard Operating Procedure (SOP) document following ISO 9001 documentation standards:
- Document control information
- Purpose and scope
- Responsibilities matrix
- Step-by-step procedures
- Quality checkpoints
- Revision history`;

        userPrompt = `Generate a formal Standard Operating Procedure (SOP) document for "${request.featureName || request.moduleName}" in HRplus Cerebra.

${request.featureDescription ? `Description: ${request.featureDescription}` : ''}
${request.targetRoles ? `Responsible roles: ${request.targetRoles.join(', ')}` : ''}
${request.customInstructions ? `Additional instructions: ${request.customInstructions}` : ''}

Generate as JSON with this structure:
{
  "title": "SOP: ${request.featureName || request.moduleName}",
  "description": "Standard Operating Procedure for ${request.featureName || request.moduleName}",
  "summary": "This SOP defines the standard process for...",
  "version": "1.0",
  "lastUpdated": "${new Date().toISOString().split('T')[0]}",
  "author": "HR Operations",
  "targetRoles": ${JSON.stringify(request.targetRoles || ['hr_manager', 'admin'])},
  "estimatedDuration": 20,
  "learningObjectives": [
    "Understand the standard procedure for ${request.featureName || request.moduleName}",
    "Execute the procedure consistently",
    "Identify quality checkpoints"
  ],
  "tableOfContents": [
    { "id": "1", "title": "Purpose", "level": 1 },
    { "id": "2", "title": "Scope", "level": 1 },
    { "id": "3", "title": "Responsibilities", "level": 1 },
    { "id": "4", "title": "Procedure", "level": 1 },
    { "id": "5", "title": "Quality Checkpoints", "level": 1 },
    { "id": "6", "title": "Related Documents", "level": 1 }
  ],
  "sections": [
    {
      "id": "doc-control",
      "type": "callout",
      "calloutType": "info",
      "content": "Document Control: SOP-${request.moduleCode?.toUpperCase() || 'HR'}-001 | Effective Date: ${new Date().toISOString().split('T')[0]} | Review Date: ${new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]}"
    },
    {
      "id": "purpose",
      "type": "heading",
      "level": 1,
      "content": "1. Purpose"
    },
    {
      "id": "purpose-text",
      "type": "paragraph",
      "content": "This Standard Operating Procedure defines the standard process for ${request.featureName || request.moduleName} within HRplus Cerebra to ensure consistency, compliance, and quality."
    },
    {
      "id": "scope",
      "type": "heading",
      "level": 1,
      "content": "2. Scope"
    },
    {
      "id": "scope-text",
      "type": "paragraph",
      "content": "This SOP applies to all authorized personnel who perform ${request.featureName || request.moduleName} activities within the organization."
    },
    {
      "id": "responsibilities",
      "type": "heading",
      "level": 1,
      "content": "3. Responsibilities"
    },
    {
      "id": "resp-list",
      "type": "list",
      "items": [
        "HR Manager: Approve and oversee the process",
        "HR Administrator: Execute the procedure",
        "Employee: Provide required information",
        "System Administrator: Maintain system access"
      ]
    },
    {
      "id": "procedure",
      "type": "heading",
      "level": 1,
      "content": "4. Procedure"
    },
    {
      "id": "procedure-steps",
      "type": "steps",
      "items": [
        {
          "stepNumber": 1,
          "title": "Initiate Process",
          "instruction": "Access HRplus Cerebra and navigate to the appropriate module.",
          "screenshotHint": "Screenshot of login and navigation"
        },
        {
          "stepNumber": 2,
          "title": "Verify Prerequisites",
          "instruction": "Confirm all required information and approvals are in place.",
          "warning": "Do not proceed without required approvals."
        },
        {
          "stepNumber": 3,
          "title": "Execute Process",
          "instruction": "Complete all required steps following system prompts.",
          "screenshotHint": "Screenshot of main process screen"
        },
        {
          "stepNumber": 4,
          "title": "Verify Completion",
          "instruction": "Confirm successful completion and document any exceptions.",
          "tip": "Save confirmation screens for audit records."
        }
      ]
    },
    {
      "id": "quality",
      "type": "heading",
      "level": 1,
      "content": "5. Quality Checkpoints"
    },
    {
      "id": "quality-callout",
      "type": "callout",
      "calloutType": "warning",
      "content": "Quality checkpoint: Verify all mandatory fields are complete and accurate before final submission."
    },
    {
      "id": "quality-list",
      "type": "list",
      "items": [
        "All required fields completed",
        "Data accuracy verified",
        "Appropriate approvals obtained",
        "Audit trail maintained"
      ]
    }
  ],
  "glossary": [
    {
      "term": "SOP",
      "definition": "Standard Operating Procedure - a documented process to ensure consistency"
    },
    {
      "term": "Audit Trail",
      "definition": "A chronological record of system activities"
    }
  ],
  "relatedDocs": [
    { "title": "Quality Management Policy", "href": "/policies/quality" },
    { "title": "Data Privacy Guidelines", "href": "/policies/privacy" }
  ],
  "tags": ["sop", "procedure", "compliance", "${request.moduleName?.toLowerCase()}"]
}`;
        break;

      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    console.log("Calling AI gateway with template-aware prompts");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
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
    const content = data.choices?.[0]?.message?.content;

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = { rawContent: content };
    }

    console.log("Enablement AI response generated successfully with template support");

    return new Response(JSON.stringify({
      success: true,
      action: request.action,
      content: parsedContent,
      templateUsed: template?.id || 'default'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Enablement AI error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
