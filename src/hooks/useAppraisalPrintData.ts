import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppraisalItem, SectionScore } from "@/components/performance/appraisal/print";

interface TemplateSection {
  id: string;
  section_type: string;
  display_name: string;
  weight: number;
  is_active: boolean;
  display_order: number;
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
  version_number?: number;
}

const sectionTypeLabelMap: Record<string, string> = {
  goal: "Goal",
  goals: "Goal",
  competency: "Competency",
  competencies: "Competency",
  responsibility: "Responsibility",
  responsibilities: "Responsibility",
  feedback_360: "360 Feedback",
  value: "Value",
  values: "Value",
  custom: "Custom",
};

const normalizeSectionType = (type: string): AppraisalItem["type"] => {
  const typeMap: Record<string, AppraisalItem["type"]> = {
    goal: "goal",
    goals: "goal",
    competency: "competency",
    competencies: "competency",
    responsibility: "responsibility",
    responsibilities: "responsibility",
    feedback_360: "feedback_360",
    value: "value",
    values: "value",
    custom: "custom",
  };
  return typeMap[type.toLowerCase()] || "custom";
};

// Generate mock items ONLY for sections that are actually configured in the template
function generateMockItemsFromSections(
  sections: TemplateSection[],
  template: AppraisalTemplate
): AppraisalItem[] {
  const items: AppraisalItem[] = [];
  let id = 1;

  const mockRating = () =>
    Math.floor(Math.random() * (template.max_rating - template.min_rating + 1)) +
    template.min_rating;

  // Mock data for each section type
  const mockDataBySectionType: Record<string, { name: string; description: string; requiredLevel?: number }[]> = {
    goal: [
      { name: "Increase Q1 Sales by 15%", description: "Achieve revenue target of $500K through new client acquisition." },
      { name: "Launch New Product Feature", description: "Successfully deploy the customer portal enhancement by end of Q2." },
      { name: "Reduce Customer Churn Rate", description: "Implement retention strategies to reduce churn from 8% to 5%." },
    ],
    competency: [
      { name: "Communication", description: "Effectively conveys information and ideas through various channels.", requiredLevel: 4 },
      { name: "Problem Solving", description: "Identifies issues and implements effective solutions.", requiredLevel: 4 },
      { name: "Leadership", description: "Guides and motivates team members towards achieving objectives.", requiredLevel: 3 },
    ],
    responsibility: [
      { name: "Team Management", description: "Oversee daily operations and manage team performance.", requiredLevel: 4 },
      { name: "Reporting & Documentation", description: "Maintain accurate records and submit timely reports.", requiredLevel: 3 },
    ],
    feedback_360: [
      { name: "Peer Collaboration", description: "Feedback from peers on collaboration and teamwork.", requiredLevel: 4 },
    ],
    value: [
      { name: "Integrity", description: "Demonstrates honesty and ethical behavior in all interactions.", requiredLevel: 5 },
      { name: "Innovation", description: "Embraces change and contributes new ideas for improvement.", requiredLevel: 4 },
    ],
  };

  // Sort sections by display_order
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);

  for (const section of sortedSections) {
    if (!section.is_active || section.weight <= 0) continue;

    const normalizedType = normalizeSectionType(section.section_type);
    const mockData = mockDataBySectionType[normalizedType] || [
      { name: `${section.display_name} Item 1`, description: `Sample item for ${section.display_name}` },
    ];

    const itemWeight = Math.round(section.weight / mockData.length);

    for (const data of mockData) {
      const employeeRating = normalizedType === "feedback_360" ? undefined : mockRating();
      const managerRating = mockRating();
      const requiredLevel = data.requiredLevel || Math.min(template.max_rating, 4);
      const gap = managerRating - requiredLevel;

      items.push({
        id: `${normalizedType}-${id++}`,
        type: normalizedType,
        typeLabel: section.display_name || sectionTypeLabelMap[section.section_type] || "Custom",
        name: data.name,
        description: data.description,
        weight: itemWeight,
        requiredLevel,
        employeeRating,
        managerRating,
        gap,
        comments: employeeRating && managerRating ? "Sample comment for preview." : undefined,
      });
    }
  }

  return items;
}

// Fallback: Generate mock items from template boolean flags (if no sections configured)
function generateMockItemsFromTemplate(template: AppraisalTemplate): AppraisalItem[] {
  const items: AppraisalItem[] = [];
  let id = 1;

  const mockRating = () =>
    Math.floor(Math.random() * (template.max_rating - template.min_rating + 1)) +
    template.min_rating;

  if (template.include_goals && template.goals_weight > 0) {
    const weight = Math.round(template.goals_weight / 3);
    items.push(
      { id: `goal-${id++}`, type: "goal", typeLabel: "Goal", name: "Increase Q1 Sales by 15%", description: "Achieve revenue target.", weight, requiredLevel: 4, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 },
      { id: `goal-${id++}`, type: "goal", typeLabel: "Goal", name: "Launch New Feature", description: "Deploy portal by Q2.", weight, requiredLevel: 4, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 },
      { id: `goal-${id++}`, type: "goal", typeLabel: "Goal", name: "Reduce Churn Rate", description: "Reduce from 8% to 5%.", weight, requiredLevel: 4, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 }
    );
  }

  if (template.include_competencies && template.competencies_weight > 0) {
    const weight = Math.round(template.competencies_weight / 3);
    items.push(
      { id: `comp-${id++}`, type: "competency", typeLabel: "Competency", name: "Communication", description: "Conveys information effectively.", weight, requiredLevel: 4, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 },
      { id: `comp-${id++}`, type: "competency", typeLabel: "Competency", name: "Problem Solving", description: "Identifies and solves issues.", weight, requiredLevel: 4, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 },
      { id: `comp-${id++}`, type: "competency", typeLabel: "Competency", name: "Leadership", description: "Guides team members.", weight, requiredLevel: 3, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 }
    );
  }

  if (template.include_responsibilities && template.responsibilities_weight > 0) {
    const weight = Math.round(template.responsibilities_weight / 2);
    items.push(
      { id: `resp-${id++}`, type: "responsibility", typeLabel: "Responsibility", name: "Team Management", description: "Oversee operations.", weight, requiredLevel: 4, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 },
      { id: `resp-${id++}`, type: "responsibility", typeLabel: "Responsibility", name: "Reporting", description: "Submit timely reports.", weight, requiredLevel: 3, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 }
    );
  }

  if (template.include_360_feedback && template.feedback_360_weight > 0) {
    items.push({
      id: `360-${id++}`,
      type: "feedback_360",
      typeLabel: "360 Feedback",
      name: "Peer Collaboration",
      description: "Peer feedback on teamwork.",
      weight: template.feedback_360_weight,
      requiredLevel: 4,
      employeeRating: undefined,
      managerRating: mockRating(),
      gap: 0,
    });
  }

  if (template.include_values && template.values_weight > 0) {
    const weight = Math.round(template.values_weight / 2);
    items.push(
      { id: `val-${id++}`, type: "value", typeLabel: "Value", name: "Integrity", description: "Demonstrates honesty.", weight, requiredLevel: 5, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 },
      { id: `val-${id++}`, type: "value", typeLabel: "Value", name: "Innovation", description: "Contributes new ideas.", weight, requiredLevel: 4, employeeRating: mockRating(), managerRating: mockRating(), gap: 0 }
    );
  }

  // Calculate gaps
  return items.map((item) => ({
    ...item,
    gap: (item.managerRating || 0) - (item.requiredLevel || 0),
  }));
}

function calculateSectionScores(
  items: AppraisalItem[],
  sections: TemplateSection[],
  template: AppraisalTemplate
): SectionScore[] {
  const scores: SectionScore[] = [];

  // Group items by type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, AppraisalItem[]>);

  // Use sections if available, otherwise fall back to template config
  if (sections.length > 0) {
    const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);

    for (const section of sortedSections) {
      if (!section.is_active || section.weight <= 0) continue;

      const normalizedType = normalizeSectionType(section.section_type);
      const sectionItems = groupedItems[normalizedType] || [];

      if (sectionItems.length === 0) continue;

      const totalWeight = sectionItems.reduce((sum, item) => sum + item.weight, 0);
      const weightedSum = sectionItems.reduce((sum, item) => {
        const rating = item.managerRating || 0;
        return sum + rating * item.weight;
      }, 0);

      const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
      const maxScore = template.max_rating;
      const contribution = (rawScore / maxScore) * section.weight;

      scores.push({
        sectionType: normalizedType,
        sectionLabel: section.display_name || sectionTypeLabelMap[section.section_type] || "Custom",
        itemCount: sectionItems.length,
        rawScore,
        maxScore,
        weight: section.weight,
        contribution,
      });
    }
  } else {
    // Fallback to template-based calculation
    const typeMap: Record<string, { label: string; weight: number }> = {
      goal: { label: "Goals", weight: template.goals_weight },
      competency: { label: "Competencies", weight: template.competencies_weight },
      responsibility: { label: "Responsibilities", weight: template.responsibilities_weight },
      feedback_360: { label: "360 Feedback", weight: template.feedback_360_weight },
      value: { label: "Values", weight: template.values_weight },
    };

    for (const [type, typeItems] of Object.entries(groupedItems)) {
      const config = typeMap[type];
      if (!config || config.weight === 0) continue;

      const totalWeight = typeItems.reduce((sum, item) => sum + item.weight, 0);
      const weightedSum = typeItems.reduce((sum, item) => {
        const rating = item.managerRating || 0;
        return sum + rating * item.weight;
      }, 0);

      const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
      const maxScore = template.max_rating;
      const contribution = (rawScore / maxScore) * config.weight;

      scores.push({
        sectionType: type,
        sectionLabel: config.label,
        itemCount: typeItems.length,
        rawScore,
        maxScore,
        weight: config.weight,
        contribution,
      });
    }
  }

  return scores;
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

      // Fetch sections - this is the source of truth for what should appear
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

      const templateSections = (sections as TemplateSection[]) || [];

      // Generate mock items based on CONFIGURED SECTIONS (not boolean flags)
      const mockItems =
        templateSections.length > 0
          ? generateMockItemsFromSections(templateSections, template)
          : generateMockItemsFromTemplate(template);

      const sectionScores = calculateSectionScores(mockItems, templateSections, template);
      const totalScore =
        (sectionScores.reduce((sum, s) => sum + s.contribution, 0) / 100) * template.max_rating;

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

      // Mock appraisal with distinct Performance Period and Appraisal Period
      const today = new Date();
      const performanceYearStart = new Date(today.getFullYear() - 1, 0, 1); // Jan 1 of last year
      const performanceYearEnd = new Date(today.getFullYear() - 1, 11, 31); // Dec 31 of last year
      const appraisalStart = new Date(today.getFullYear(), 0, 15); // Jan 15 this year
      const appraisalEnd = new Date(today.getFullYear(), 1, 15); // Feb 15 this year

      const mockAppraisal = {
        eventName: template.name,
        cycleName: `Annual Review ${today.getFullYear()}`,
        startDate: appraisalStart.toISOString(),
        endDate: appraisalEnd.toISOString(),
        performancePeriodStart: performanceYearStart.toISOString(),
        performancePeriodEnd: performanceYearEnd.toISOString(),
        status: "Draft (Preview)",
      };

      return {
        template,
        sections: templateSections,
        phases: (phases as TemplatePhase[]) || [],
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
