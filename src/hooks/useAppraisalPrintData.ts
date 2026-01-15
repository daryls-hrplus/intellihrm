import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppraisalItem, SectionScore } from "@/components/performance/appraisal/print";

interface TemplateSection {
  id: string;
  section_type: string;
  display_name: string;
  weight: number;
  is_active: boolean;
}

interface TemplatePhase {
  id: string;
  phase_name: string;
  display_order: number;
  start_offset_days: number;
  duration_days: number;
}

interface AppraisalTemplate {
  id: string;
  name: string;
  code: string;
  description?: string;
  min_rating: number;
  max_rating: number;
  include_goals: boolean;
  include_competencies: boolean;
  include_responsibilities: boolean;
  include_360_feedback: boolean;
  include_values: boolean;
  goals_weight: number;
  competencies_weight: number;
  responsibilities_weight: number;
  feedback_360_weight: number;
  values_weight: number;
  company_id: string;
}

// Generate mock data for template preview
function generateMockItems(template: AppraisalTemplate): AppraisalItem[] {
  const items: AppraisalItem[] = [];
  let id = 1;

  const mockRating = () => Math.floor(Math.random() * (template.max_rating - template.min_rating + 1)) + template.min_rating;

  if (template.include_goals && template.goals_weight > 0) {
    items.push(
      { id: `goal-${id++}`, type: "goal", typeLabel: "Goal", name: "Increase Q1 Sales by 15%", description: "Achieve revenue target of $500K through new client acquisition and upselling existing accounts.", weight: Math.round(template.goals_weight / 3), employeeRating: mockRating(), managerRating: mockRating(), comments: "Good progress made on this goal." },
      { id: `goal-${id++}`, type: "goal", typeLabel: "Goal", name: "Launch New Product Feature", description: "Successfully deploy the customer portal enhancement by end of Q2.", weight: Math.round(template.goals_weight / 3), employeeRating: mockRating(), managerRating: mockRating(), comments: "Completed ahead of schedule." },
      { id: `goal-${id++}`, type: "goal", typeLabel: "Goal", name: "Reduce Customer Churn Rate", description: "Implement retention strategies to reduce churn from 8% to 5%.", weight: Math.round(template.goals_weight / 3), employeeRating: mockRating(), managerRating: mockRating(), comments: "Needs continued focus." }
    );
  }

  if (template.include_competencies && template.competencies_weight > 0) {
    items.push(
      { id: `comp-${id++}`, type: "competency", typeLabel: "Competency", name: "Communication", description: "Effectively conveys information and ideas through various channels.", weight: Math.round(template.competencies_weight / 3), employeeRating: mockRating(), managerRating: mockRating(), comments: "Excellent verbal and written skills." },
      { id: `comp-${id++}`, type: "competency", typeLabel: "Competency", name: "Problem Solving", description: "Identifies issues and implements effective solutions.", weight: Math.round(template.competencies_weight / 3), employeeRating: mockRating(), managerRating: mockRating() },
      { id: `comp-${id++}`, type: "competency", typeLabel: "Competency", name: "Leadership", description: "Guides and motivates team members towards achieving objectives.", weight: Math.round(template.competencies_weight / 3), employeeRating: mockRating(), managerRating: mockRating() }
    );
  }

  if (template.include_responsibilities && template.responsibilities_weight > 0) {
    items.push(
      { id: `resp-${id++}`, type: "responsibility", typeLabel: "Responsibility", name: "Team Management", description: "Oversee daily operations and manage team performance.", weight: Math.round(template.responsibilities_weight / 2), employeeRating: mockRating(), managerRating: mockRating() },
      { id: `resp-${id++}`, type: "responsibility", typeLabel: "Responsibility", name: "Reporting & Documentation", description: "Maintain accurate records and submit timely reports.", weight: Math.round(template.responsibilities_weight / 2), employeeRating: mockRating(), managerRating: mockRating() }
    );
  }

  if (template.include_360_feedback && template.feedback_360_weight > 0) {
    items.push(
      { id: `360-${id++}`, type: "feedback_360", typeLabel: "360 Feedback", name: "Peer Collaboration", description: "Feedback from peers on collaboration and teamwork.", weight: template.feedback_360_weight, employeeRating: undefined, managerRating: mockRating(), comments: "Aggregated from 5 peer responses." }
    );
  }

  if (template.include_values && template.values_weight > 0) {
    items.push(
      { id: `val-${id++}`, type: "value", typeLabel: "Value", name: "Integrity", description: "Demonstrates honesty and ethical behavior in all interactions.", weight: Math.round(template.values_weight / 2), employeeRating: mockRating(), managerRating: mockRating() },
      { id: `val-${id++}`, type: "value", typeLabel: "Value", name: "Innovation", description: "Embraces change and contributes new ideas for improvement.", weight: Math.round(template.values_weight / 2), employeeRating: mockRating(), managerRating: mockRating() }
    );
  }

  return items;
}

function calculateSectionScores(items: AppraisalItem[], template: AppraisalTemplate): SectionScore[] {
  const sections: SectionScore[] = [];
  const typeMap: Record<string, { label: string; weight: number }> = {
    goal: { label: "Goals", weight: template.goals_weight },
    competency: { label: "Competencies", weight: template.competencies_weight },
    responsibility: { label: "Responsibilities", weight: template.responsibilities_weight },
    feedback_360: { label: "360 Feedback", weight: template.feedback_360_weight },
    value: { label: "Values", weight: template.values_weight },
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, AppraisalItem[]>);

  for (const [type, typeItems] of Object.entries(groupedItems)) {
    const config = typeMap[type];
    if (!config || config.weight === 0) continue;

    const totalWeight = typeItems.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = typeItems.reduce((sum, item) => {
      const rating = item.managerRating || 0;
      return sum + (rating * item.weight);
    }, 0);
    
    const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const maxScore = template.max_rating;
    const contribution = (rawScore / maxScore) * config.weight;

    sections.push({
      sectionType: type,
      sectionLabel: config.label,
      itemCount: typeItems.length,
      rawScore,
      maxScore,
      weight: config.weight,
      contribution,
    });
  }

  return sections;
}

export function useAppraisalTemplatePrintData(templateId: string | undefined) {
  return useQuery({
    queryKey: ["appraisal-template-print", templateId],
    queryFn: async () => {
      if (!templateId) throw new Error("Template ID is required");

      // Fetch template
      const { data: template, error: templateError } = await supabase
        .from("appraisal_form_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) throw templateError;

      // Fetch sections
      const { data: sections } = await supabase
        .from("appraisal_template_sections")
        .select("*")
        .eq("template_id", templateId)
        .eq("is_active", true)
        .order("display_order");

      // Fetch phases
      const { data: phases } = await supabase
        .from("appraisal_template_phases")
        .select("*")
        .eq("template_id", templateId)
        .order("phase_order");

      // Fetch company info
      const { data: company } = await supabase
        .from("companies")
        .select("name, logo_url")
        .eq("id", template.company_id)
        .single();

      // Generate mock data for preview
      const mockItems = generateMockItems(template);
      const sectionScores = calculateSectionScores(mockItems, template);
      const totalScore = sectionScores.reduce((sum, s) => sum + s.contribution, 0) / 100 * template.max_rating;

      // Mock employee and supervisor data
      const mockEmployee = {
        id: "mock-employee",
        fullName: "John Smith",
        employeeNumber: "EMP-2024-001",
        jobTitle: "Senior Software Engineer",
        department: "Engineering",
        division: "Technology",
        section: "Development",
      };

      const mockSupervisor = {
        id: "mock-supervisor",
        fullName: "Jane Doe",
        jobTitle: "Engineering Manager",
      };

      const mockAppraisal = {
        eventName: template.name,
        cycleName: "Annual Review 2025",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        performancePeriodStart: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        performancePeriodEnd: new Date().toISOString(),
        status: "Draft (Preview)",
      };

      return {
        template,
        sections: sections as TemplateSection[] || [],
        phases: phases as TemplatePhase[] || [],
        company: company || { name: "Company Name", logo_url: null },
        items: mockItems,
        sectionScores,
        totalScore,
        employee: mockEmployee,
        supervisor: mockSupervisor,
        appraisal: mockAppraisal,
        comments: {
          employee: "This is a preview. In actual appraisals, employee comments will appear here.",
          manager: "This is a preview. In actual appraisals, manager comments will appear here.",
          hr: "This is a preview. HR comments will appear here after review.",
          developmental: "This is a preview. Developmental issues will be listed here.",
        },
        signatures: [
          { role: "Employee", name: mockEmployee.fullName, date: undefined, status: "pending" as const },
          { role: "Manager", name: mockSupervisor.fullName, date: undefined, status: "pending" as const },
          { role: "HR Review", name: undefined, date: undefined, status: "pending" as const },
        ],
      };
    },
    enabled: !!templateId,
  });
}
