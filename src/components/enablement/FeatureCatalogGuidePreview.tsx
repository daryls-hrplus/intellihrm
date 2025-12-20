import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Printer, 
  Download, 
  Eye, 
  Settings2,
  Brain,
  Star,
  Zap,
  Check,
  Building2,
  Layers,
  FolderTree,
  BarChart3,
  Save
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { FEATURE_REGISTRY, getTotalFeatureCount } from "@/lib/featureRegistry";
import { 
  PLATFORM_CAPABILITIES, 
  FEATURE_CAPABILITIES, 
  CAPABILITY_TAG_LABELS,
  getAIPoweredFeatures, 
  getUniqueFeatures 
} from "@/lib/platformCapabilities";
import { MODULE_ENRICHMENTS, FEATURE_ENRICHMENTS } from "@/lib/moduleDescriptions";
import { DETAILED_FEATURE_ENRICHMENTS } from "@/lib/featureEnrichmentsDetailed";
import { useEnablementBranding } from "@/hooks/useEnablementBranding";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Sub-modules that should be highlighted
const SUB_MODULE_HIGHLIGHTS: Record<string, { groups: string[]; label: string }> = {
  workforce: { groups: ['employee_lifecycle'], label: 'Onboarding & Offboarding' },
  performance: { groups: ['appraisals', 'goals_feedback'], label: 'Appraisals, 360 Feedback & Goals' },
  training: { groups: ['course_development'], label: 'LMS Management' },
};

// Countries where payroll processing is offered with statutory calculation visibility features
const PAYROLL_COUNTRIES = [
  { code: 'JM', name: 'Jamaica', region: 'Caribbean' },
  { code: 'TT', name: 'Trinidad & Tobago', region: 'Caribbean' },
  { code: 'BB', name: 'Barbados', region: 'Caribbean' },
  { code: 'GY', name: 'Guyana', region: 'Caribbean' },
  { code: 'LC', name: 'Saint Lucia', region: 'Caribbean' },
  { code: 'GD', name: 'Grenada', region: 'Caribbean' },
  { code: 'VC', name: 'Saint Vincent & the Grenadines', region: 'Caribbean' },
  { code: 'AG', name: 'Antigua & Barbuda', region: 'Caribbean' },
  { code: 'KN', name: 'Saint Kitts & Nevis', region: 'Caribbean' },
  { code: 'DO', name: 'Dominican Republic', region: 'Caribbean' },
  { code: 'BS', name: 'Bahamas', region: 'Caribbean' },
  { code: 'BZ', name: 'Belize', region: 'Caribbean' },
  { code: 'SR', name: 'Suriname', region: 'Caribbean' },
  { code: 'CW', name: 'Curaçao', region: 'Caribbean' },
  { code: 'SX', name: 'Sint Maarten', region: 'Caribbean' },
  { code: 'GH', name: 'Ghana', region: 'Africa' },
  { code: 'NG', name: 'Nigeria', region: 'Africa' },
  { code: 'KE', name: 'Kenya', region: 'Africa' },
  { code: 'ZA', name: 'South Africa', region: 'Africa' },
  { code: 'RW', name: 'Rwanda', region: 'Africa' },
  { code: 'TZ', name: 'Tanzania', region: 'Africa' },
  { code: 'CO', name: 'Colombia', region: 'South America' },
];

// Industry-standard module groupings (aligned with Workday, SAP, Oracle HCM marketing)
const MODULE_GROUPS = {
  core_hr: {
    name: 'Core HR',
    description: 'Foundation for all HR operations - employee records, organizational structure, and workforce administration',
    modules: ['workforce'],
    icon: '🏛️',
    color: '#2563eb',
    marketingMessage: 'Single source of truth for your entire workforce',
  },
  talent_management: {
    name: 'Talent Management Suite',
    description: 'End-to-end talent lifecycle from hire to retire with AI-powered insights',
    modules: ['performance', 'training', 'succession', 'recruitment'],
    icon: '🎯',
    color: '#7c3aed',
    marketingMessage: 'Attract, develop, and retain top talent with integrated talent management',
    benefits: [
      'Unified talent data across recruitment, performance, learning, and succession',
      'AI-powered skill gap analysis linking training to performance goals',
      'Automated succession pipeline based on performance and development',
      'Predictive analytics for talent retention and flight risk',
      'Seamless candidate-to-employee-to-leader journey tracking',
      'Competency-based matching for internal mobility and promotions',
    ],
  },
  workforce_operations: {
    name: 'Workforce Operations',
    description: 'Time tracking, scheduling, and absence management for operational excellence',
    modules: ['time_attendance', 'leave'],
    icon: '⏱️',
    color: '#059669',
    marketingMessage: 'Optimize workforce productivity and compliance',
  },
  compensation_benefits: {
    name: 'Compensation & Benefits',
    description: 'Complete compensation management from payroll to total rewards',
    modules: ['payroll', 'compensation', 'benefits'],
    icon: '💰',
    color: '#d97706',
    marketingMessage: 'Drive engagement through competitive and equitable compensation',
  },
  employee_experience: {
    name: 'Employee Experience',
    description: 'Self-service portals and HR command center for seamless employee engagement',
    modules: ['ess', 'mss', 'hr_hub', 'help_center'],
    icon: '👥',
    color: '#0891b2',
    marketingMessage: 'Empower employees and managers with intuitive self-service',
  },
  compliance_risk: {
    name: 'Compliance & Risk',
    description: 'Health, safety, and employee relations management for regulatory compliance',
    modules: ['hse', 'employee_relations'],
    icon: '🛡️',
    color: '#dc2626',
    marketingMessage: 'Mitigate risk and ensure regulatory compliance',
  },
  asset_management: {
    name: 'Asset Management',
    description: 'Track and manage company assets assigned to employees',
    modules: ['company_property'],
    icon: '📦',
    color: '#6b7280',
    marketingMessage: 'Full visibility into company asset allocation',
  },
};

// Talent Suite - modules that form the integrated talent management package (legacy support)
const TALENT_SUITE = MODULE_GROUPS.talent_management;

// Module integrations - how modules connect to each other on ONE platform
const MODULE_INTEGRATIONS: Record<string, string[]> = {
  workforce: ['payroll', 'leave', 'time_attendance', 'performance', 'training', 'succession', 'benefits'],
  leave: ['workforce', 'payroll', 'time_attendance'],
  payroll: ['workforce', 'leave', 'time_attendance', 'benefits', 'compensation'],
  time_attendance: ['workforce', 'payroll', 'leave'],
  performance: ['workforce', 'training', 'succession', 'compensation'],
  training: ['workforce', 'performance', 'succession', 'hse'],
  succession: ['workforce', 'performance', 'training', 'recruitment'],
  recruitment: ['workforce', 'succession', 'training'],
  benefits: ['workforce', 'payroll', 'compensation'],
  compensation: ['workforce', 'payroll', 'performance', 'benefits'],
  hse: ['workforce', 'training', 'employee_relations'],
  employee_relations: ['workforce', 'performance', 'hse'],
  company_property: ['workforce'],
  hr_hub: ['workforce', 'leave', 'payroll', 'performance', 'training'],
  ess: ['workforce', 'leave', 'payroll', 'benefits', 'training', 'performance'],
  mss: ['workforce', 'leave', 'performance', 'training'],
};

// One Platform messaging for integration highlights
const ONE_PLATFORM_BENEFITS = [
  { icon: '🔗', title: 'Unified Data Model', description: 'Single employee record flows across all modules - no duplicate entry, no data silos' },
  { icon: '🔄', title: 'Automated Workflows', description: 'Actions in one module trigger smart updates across related modules' },
  { icon: '📊', title: 'Cross-Module Analytics', description: 'Holistic insights combining data from workforce, talent, and operations' },
  { icon: '🎯', title: 'Consistent Experience', description: 'Same intuitive interface across all HR functions for faster adoption' },
  { icon: '🔒', title: 'Unified Security', description: 'Role-based access control consistently applied across the entire platform' },
  { icon: '⚡', title: 'Real-Time Sync', description: 'Changes propagate instantly across modules for up-to-date information' },
];

// Helper function to get module group for a given module code
const getModuleGroup = (moduleCode: string): { groupKey: string; group: typeof MODULE_GROUPS[keyof typeof MODULE_GROUPS] } | null => {
  for (const [key, group] of Object.entries(MODULE_GROUPS)) {
    if (group.modules.includes(moduleCode)) {
      return { groupKey: key, group };
    }
  }
  return null;
};

// Helper function to get modules sorted by category groupings for better document flow
const getModulesSortedByCategory = () => {
  const categoryOrder = Object.keys(MODULE_GROUPS);
  return [...FEATURE_REGISTRY].sort((a, b) => {
    const groupA = getModuleGroup(a.code);
    const groupB = getModuleGroup(b.code);
    const indexA = groupA ? categoryOrder.indexOf(groupA.groupKey) : 999;
    const indexB = groupB ? categoryOrder.indexOf(groupB.groupKey) : 999;
    if (indexA !== indexB) return indexA - indexB;
    // Within same category, maintain original order
    const groupModulesA = groupA ? MODULE_GROUPS[groupA.groupKey as keyof typeof MODULE_GROUPS].modules : [];
    const groupModulesB = groupB ? MODULE_GROUPS[groupB.groupKey as keyof typeof MODULE_GROUPS].modules : [];
    return groupModulesA.indexOf(a.code) - groupModulesB.indexOf(b.code);
  });
};

interface FeatureCatalogGuidePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GuideTemplate {
  id: string;
  name: string;
  description: string;
  includeModules: boolean;
  includeCapabilities: boolean;
  includeMatrix: boolean;
  includeExecutiveSummary: boolean;
}

const GUIDE_TEMPLATES: GuideTemplate[] = [
  {
    id: "complete",
    name: "Complete Feature Guide",
    description: "Full documentation including all modules, capabilities, and differentiator matrix",
    includeModules: true,
    includeCapabilities: true,
    includeMatrix: true,
    includeExecutiveSummary: true
  },
  {
    id: "executive",
    name: "Executive Summary",
    description: "High-level overview focused on capabilities and differentiators for decision makers",
    includeModules: false,
    includeCapabilities: true,
    includeMatrix: true,
    includeExecutiveSummary: true
  },
  {
    id: "module-reference",
    name: "Module Reference Guide",
    description: "Detailed module-by-module feature documentation",
    includeModules: true,
    includeCapabilities: false,
    includeMatrix: false,
    includeExecutiveSummary: false
  },
  {
    id: "capabilities",
    name: "AI & Capabilities Overview",
    description: "Focus on AI-powered features and platform capabilities",
    includeModules: false,
    includeCapabilities: true,
    includeMatrix: false,
    includeExecutiveSummary: true
  }
];

export function FeatureCatalogGuidePreview({ open, onOpenChange }: FeatureCatalogGuidePreviewProps) {
  const [activeTab, setActiveTab] = useState("template");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("complete");
  const [customTitle, setCustomTitle] = useState("HRplus Cerebra Feature Guide");
  const [customSubtitle, setCustomSubtitle] = useState("Complete Platform Capability Reference");
  const [includeDate, setIncludeDate] = useState(true);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use persisted branding
  const { brandColors, isLoading: brandingLoading, saveBrandColors } = useEnablementBranding();
  
  // Branding options - initialize from saved values
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [secondaryColor, setSecondaryColor] = useState("#4f46e5");
  const [accentColor, setAccentColor] = useState("#10b981");
  const [companyName, setCompanyName] = useState("HRplus Cerebra");
  const [colorsInitialized, setColorsInitialized] = useState(false);
  
  // Load saved brand colors when available
  useEffect(() => {
    if (brandColors && !colorsInitialized) {
      setPrimaryColor(brandColors.primaryColor);
      setSecondaryColor(brandColors.secondaryColor);
      setAccentColor(brandColors.accentColor);
      setCompanyName(brandColors.companyName);
      setColorsInitialized(true);
    }
  }, [brandColors, colorsInitialized]);
  
  const handleSaveBrandColors = () => {
    saveBrandColors.mutate({
      primaryColor,
      secondaryColor,
      accentColor,
      companyName
    });
  };
  
  const previewRef = useRef<HTMLDivElement>(null);

  const currentTemplate = GUIDE_TEMPLATES.find(t => t.id === selectedTemplate) || GUIDE_TEMPLATES[0];
  
  const totalFeatures = getTotalFeatureCount();
  const totalModules = FEATURE_REGISTRY.length;
  const aiPoweredCount = getAIPoweredFeatures().length;
  const uniqueCount = getUniqueFeatures().length;

  const getIcon = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.FileText;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalPages = getTotalPages();
    let currentPageNum = 1;
    
    // Helper to wrap content in a page with header and footer
    const wrapInPage = (content: string, pageNum: number, sectionTitle: string, isFirstPage = false) => {
      const header = !isFirstPage ? `
        <div class="page-header">
          <div class="header-left">
            <span class="company-badge">${companyName || 'HRplus Cerebra'}</span>
            <span class="section-label">${sectionTitle}</span>
          </div>
          <div class="header-right">${includeDate ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</div>
        </div>
      ` : '';
      
      const footer = `
        <div class="page-footer">
          <span class="footer-left">© ${new Date().getFullYear()} ${companyName || 'HRplus Cerebra'}. All rights reserved. | CONFIDENTIAL</span>
          <span class="footer-right">${includePageNumbers ? `Page ${pageNum} of ${totalPages}` : ''}</span>
        </div>
      `;
      
      return `<div class="page">${header}<div class="page-content">${content}</div>${footer}</div>`;
    };

    // Generate pages with proper wrapping
    let allPages = '';
    
    // Cover page (page 1)
    allPages += wrapInPage(renderCoverHTML(), currentPageNum++, 'Cover', true);
    
    // TOC (page 2)
    allPages += wrapInPage(renderTOCHTML(), currentPageNum++, 'Table of Contents');
    
    if (currentTemplate.includeExecutiveSummary) {
      allPages += wrapInPage(renderExecutiveSummaryHTML(), currentPageNum++, 'Executive Summary');
    }
    
    if (currentTemplate.includeModules) {
      getModulesSortedByCategory().forEach((module, idx) => {
        allPages += wrapInPage(renderModuleHTML(module, idx === 0, idx), currentPageNum++, `Module: ${module.name}`);
      });
    }
    
    if (currentTemplate.includeCapabilities) {
      allPages += wrapInPage(renderCapabilitiesHTML(), currentPageNum++, 'Platform Capabilities');
    }
    
    if (currentTemplate.includeMatrix) {
      getModulesSortedByCategory().forEach((module, idx) => {
        const hasFeatures = FEATURE_CAPABILITIES.some(fc => 
          module.groups.some(g => g.features.some(f => f.code === fc.featureCode))
        );
        if (hasFeatures) {
          allPages += wrapInPage(renderMatrixModuleHTML(module, idx === 0), currentPageNum++, `Capability Matrix: ${module.name}`);
        }
      });
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${customTitle}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
            
            /* Page structure for print */
            @page {
              size: A4;
              margin: 15mm 15mm 20mm 15mm;
            }
            
            .page {
              page-break-after: always;
              page-break-inside: avoid;
              position: relative;
              min-height: calc(100vh - 35mm);
            }
            
            .page:last-child {
              page-break-after: auto;
            }
            
            /* Header styles */
            .page-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0 12px 0;
              margin-bottom: 16px;
              border-bottom: 2px solid ${primaryColor}15;
            }
            
            .header-left {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .company-badge {
              background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
            }
            
            .section-label {
              font-size: 10px;
              color: #64748b;
            }
            
            .header-right {
              font-size: 9px;
              color: #94a3b8;
            }
            
            /* Footer styles */
            .page-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 12px;
              margin-top: 24px;
              border-top: 1px solid #e2e8f0;
              position: relative;
              bottom: 0;
            }
            
            .footer-left, .footer-right {
              font-size: 9px;
              color: #64748b;
            }
            
            /* Content styles */
            .page-content {
              flex: 1;
            }
            
            .guide-cover { 
              padding: 40px; 
              text-align: center; 
              min-height: 500px; 
              display: flex; 
              flex-direction: column; 
              justify-content: center; 
              background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); 
              color: white; 
              border-radius: 8px;
              margin: -20px;
              margin-bottom: 0;
            }
            .guide-cover h1 { font-size: 36px; font-weight: 700; margin-bottom: 12px; }
            .guide-cover p { font-size: 16px; opacity: 0.9; }
            .guide-section { padding: 20px 0; }
            .section-title { font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; border-bottom: 3px solid ${primaryColor}; padding-bottom: 12px; }
            .section-subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
            .module-card { background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 16px; border-left: 4px solid ${primaryColor}; page-break-inside: avoid; }
            .module-name { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; }
            .feature-list { list-style: none; padding-left: 0; }
            .feature-item { padding: 6px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px; }
            .feature-item:last-child { border-bottom: none; }
            .feature-name { font-weight: 500; font-size: 13px; }
            .feature-desc { font-size: 12px; color: #666; }
            .capability-card { background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%); border-radius: 8px; padding: 16px; margin-bottom: 12px; page-break-inside: avoid; }
            .capability-name { font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; }
            .capability-value { font-size: 13px; color: #333; margin-bottom: 4px; }
            .badge { display: inline-block; padding: 3px 10px; border-radius: 16px; font-size: 11px; font-weight: 500; }
            .badge-ai { background: ${primaryColor}20; color: ${primaryColor}; }
            .badge-unique { background: #fef3c7; color: #d97706; }
            .badge-advanced { background: #dbeafe; color: #2563eb; }
            .matrix-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 16px; }
            .matrix-table th, .matrix-table td { border: 1px solid #e5e7eb; padding: 6px; text-align: left; }
            .matrix-table th { background: #f3f4f6; font-weight: 600; }
            .check-mark { color: ${accentColor}; font-weight: bold; }
            .brand-primary { color: ${primaryColor}; }
            .brand-bg { background-color: ${primaryColor}; }
            
            @media print {
              html, body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .page {
                page-break-after: always !important;
              }
              .page:last-child {
                page-break-after: auto !important;
              }
              .no-break {
                page-break-inside: avoid !important;
              }
              .module-card, .capability-card {
                page-break-inside: avoid !important;
              }
            }
          </style>
        </head>
        <body>${allPages}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let currentPage = 1;
      
      const addPageNumber = () => {
        if (includePageNumbers) {
          pdf.setFontSize(10);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      };

      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempContainer);

      // Define sections to render
      const sections: { id: string; render: () => string }[] = [
        { id: 'cover', render: () => renderCoverHTML() },
        { id: 'toc', render: () => renderTOCHTML() },
      ];
      
      if (currentTemplate.includeExecutiveSummary) {
        sections.push({ id: 'executive', render: () => renderExecutiveSummaryHTML() });
      }
      
      if (currentTemplate.includeModules) {
        getModulesSortedByCategory().forEach((module, idx) => {
          sections.push({ id: `module-${module.code}`, render: () => renderModuleHTML(module, idx === 0, idx) });
        });
      }
      
      if (currentTemplate.includeCapabilities) {
        sections.push({ id: 'capabilities', render: () => renderCapabilitiesHTML() });
      }
      
      if (currentTemplate.includeMatrix) {
        getModulesSortedByCategory().forEach((module, idx) => {
          const hasFeatures = FEATURE_CAPABILITIES.some(fc => 
            module.groups.some(g => g.features.some(f => f.code === fc.featureCode))
          );
          if (hasFeatures) {
            sections.push({ id: `matrix-${module.code}`, render: () => renderMatrixModuleHTML(module, idx === 0) });
          }
        });
      }

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        tempContainer.innerHTML = section.render();
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * contentWidth) / canvas.width;
        
        if (i > 0) {
          pdf.addPage();
          currentPage++;
        }
        
        // Handle content that's taller than one page
        if (imgHeight > pageHeight - (margin * 2) - 15) {
          let yOffset = 0;
          let remainingHeight = imgHeight;
          const maxContentHeight = pageHeight - (margin * 2) - 15;
          
          while (remainingHeight > 0) {
            if (yOffset > 0) {
              pdf.addPage();
              currentPage++;
            }
            
            const sliceHeight = Math.min(maxContentHeight, remainingHeight);
            const sourceY = (yOffset / imgHeight) * canvas.height;
            const sourceHeight = (sliceHeight / imgHeight) * canvas.height;
            
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sourceHeight;
            const ctx = sliceCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
              const sliceData = sliceCanvas.toDataURL('image/png');
              pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceHeight);
            }
            
            addPageNumber();
            yOffset += sliceHeight;
            remainingHeight -= sliceHeight;
          }
        } else {
          pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, imgHeight);
          addPageNumber();
        }
      }
      
      document.body.removeChild(tempContainer);
      pdf.save(`${customTitle.replace(/\s+/g, '-')}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate total pages for page numbering
  const getTotalPages = () => {
    let pages = 2; // Cover + TOC
    if (currentTemplate.includeExecutiveSummary) pages += 1;
    if (currentTemplate.includeModules) pages += FEATURE_REGISTRY.length;
    if (currentTemplate.includeCapabilities) pages += 1;
    if (currentTemplate.includeMatrix) {
      const modulesWithMatrix = FEATURE_REGISTRY.filter(module => 
        FEATURE_CAPABILITIES.some(fc => module.groups.some(g => g.features.some(f => f.code === fc.featureCode)))
      );
      pages += modulesWithMatrix.length;
    }
    return pages;
  };

  // Professional document header
  const renderDocumentHeader = (pageNum: number, sectionTitle: string) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; margin-bottom: 20px; border-bottom: 2px solid ${primaryColor}10;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: white; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 600;">${companyName || 'HRplus Cerebra'}</div>
        <div style="font-size: 11px; color: #64748b;">${sectionTitle}</div>
      </div>
      <div style="font-size: 10px; color: #94a3b8;">${includeDate ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</div>
    </div>
  `;

  // Professional document footer with page X of Y
  const renderDocumentFooter = (pageNum: number, totalPages: number) => `
    <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 10px; color: #64748b;">© ${new Date().getFullYear()} ${companyName || 'HRplus Cerebra'}. All rights reserved. | CONFIDENTIAL</div>
      <div style="font-size: 10px; color: #64748b;">${includePageNumbers ? `Page ${pageNum} of ${totalPages}` : ''}</div>
    </div>
  `;

  // HTML render functions for PDF generation
  const renderCoverHTML = () => {
    const totalPages = getTotalPages();
    return `
    <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: white; padding: 80px 40px; text-align: center; min-height: 600px; display: flex; flex-direction: column; justify-content: center; position: relative;">
      <!-- Document Classification Badge -->
      <div style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 4px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Enterprise Documentation</div>
      
      <!-- Company Logo Area -->
      <div style="margin-bottom: 40px;">
        <div style="display: inline-block; background: white; color: ${primaryColor}; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 18px;">${companyName || 'HRplus Cerebra'}</div>
      </div>
      
      <h1 style="font-size: 42px; font-weight: 700; margin-bottom: 16px; line-height: 1.2;">${customTitle}</h1>
      <p style="font-size: 20px; opacity: 0.9; margin-bottom: 8px;">${customSubtitle}</p>
      
      ${includeDate ? `<p style="font-size: 14px; opacity: 0.7; margin-top: 24px;">Document Version: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
      
      <div style="display: flex; justify-content: center; gap: 60px; margin-top: 60px;">
        <div style="text-align: center;"><div style="font-size: 42px; font-weight: 700;">${totalModules}</div><div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Modules</div></div>
        <div style="text-align: center;"><div style="font-size: 42px; font-weight: 700;">${totalFeatures}</div><div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Features</div></div>
        <div style="text-align: center;"><div style="font-size: 42px; font-weight: 700;">${aiPoweredCount}</div><div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">AI-Powered</div></div>
        <div style="text-align: center;"><div style="font-size: 42px; font-weight: 700;">${uniqueCount}</div><div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Differentiators</div></div>
      </div>
      
      <!-- Footer on cover -->
      <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center;">
        <p style="font-size: 11px; opacity: 0.7;">Prepared for Executive Review | ${includePageNumbers ? `Page 1 of ${totalPages}` : ''}</p>
      </div>
    </div>
  `;
  };

  const renderTOCHTML = () => {
    const totalPages = getTotalPages();
    let pageNum = 3;
    let tocItems = `
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0;"><span style="font-weight: 500;">Cover Page</span><span style="color: #64748b;">1</span></div>
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0;"><span style="font-weight: 500;">Table of Contents</span><span style="color: #64748b;">2</span></div>
    `;
    
    if (currentTemplate.includeExecutiveSummary) {
      tocItems += `<div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0;"><span style="font-weight: 500;">Executive Summary</span><span style="color: #64748b;">${pageNum++}</span></div>`;
    }
    
    if (currentTemplate.includeModules) {
      tocItems += `<div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0;"><span style="font-weight: 600;">Module Reference</span><span style="color: #64748b;">${pageNum}</span></div>`;
      getModulesSortedByCategory().forEach((module) => {
        const moduleGroup = getModuleGroup(module.code);
        tocItems += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0 8px 24px; border-bottom: 1px dotted #f1f5f9;">
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="color: #475569; font-size: 14px;">${module.name}</span>
            ${moduleGroup ? `<span style="background: ${moduleGroup.group.color}15; color: ${moduleGroup.group.color}; font-size: 9px; padding: 1px 6px; border-radius: 3px;">${moduleGroup.group.name}</span>` : ''}
          </span>
          <span style="color: #94a3b8; font-size: 12px;">${pageNum++}</span>
        </div>`;
      });
    }
    
    if (currentTemplate.includeCapabilities) {
      tocItems += `<div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0;"><span style="font-weight: 500;">Platform Capabilities & AI Overview</span><span style="color: #64748b;">${pageNum++}</span></div>`;
    }
    
    if (currentTemplate.includeMatrix) {
      tocItems += `<div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0;"><span style="font-weight: 500;">Capability Matrix</span><span style="color: #64748b;">${pageNum}</span></div>`;
    }
    
    return `
      <div style="background: white; font-family: system-ui, -apple-system, sans-serif;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 3px solid ${primaryColor};">Table of Contents</h2>
        <div>${tocItems}</div>
      </div>
    `;
  };

  const renderExecutiveSummaryHTML = () => {
    const totalPages = getTotalPages();
    const pageNum = 3;
    
    // Generate module groups HTML
    const moduleGroupsHTML = Object.entries(MODULE_GROUPS).map(([key, group]) => {
      const groupModules = FEATURE_REGISTRY.filter(m => group.modules.includes(m.code));
      const isTalent = key === 'talent_management';
      
      return `
        <div style="margin-bottom: 16px; padding: 16px; background: ${isTalent ? `linear-gradient(135deg, ${group.color}08 0%, ${primaryColor}08 100%)` : '#f8fafc'}; border-radius: 8px; border-left: 4px solid ${group.color}; ${isTalent ? `border: 2px solid ${group.color}30;` : ''}">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">${group.icon}</span>
            <h4 style="font-size: 15px; font-weight: 600; color: ${group.color}; margin: 0;">${group.name}</h4>
            ${isTalent ? `<span style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px;">Featured</span>` : ''}
          </div>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 10px 0;">${group.description}</p>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
            ${groupModules.map(m => `<span style="display: inline-block; background: ${group.color}15; padding: 3px 8px; border-radius: 4px; font-size: 11px; color: ${group.color}; font-weight: 500;">${m.name}</span>`).join('')}
          </div>
          <p style="font-size: 11px; color: ${group.color}; margin: 0; font-style: italic;">→ ${group.marketingMessage}</p>
        </div>
      `;
    }).join('');

    // Talent Suite benefits
    const talentBenefitsHTML = TALENT_SUITE.benefits?.slice(0, 6).map(b => 
      `<li style="font-size: 12px; color: #475569; margin-bottom: 4px; padding-left: 4px;">✓ ${b}</li>`
    ).join('') || '';

    // One Platform benefits
    const onePlatformHTML = ONE_PLATFORM_BENEFITS.map(b => `
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 20px; margin-bottom: 6px;">${b.icon}</div>
        <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 4px;">${b.title}</div>
        <p style="font-size: 10px; color: #64748b; margin: 0; line-height: 1.4;">${b.description}</p>
      </div>
    `).join('');

    // Integration matrix - ALL modules
    const integrationHTML = Object.entries(MODULE_INTEGRATIONS).map(([source, targets]) => {
      const sourceModule = FEATURE_REGISTRY.find(m => m.code === source);
      if (!sourceModule) return '';
      return `
        <div style="background: #f8fafc; border-radius: 6px; padding: 8px; font-size: 11px;">
          <div style="font-weight: 600; color: ${primaryColor}; margin-bottom: 4px;">${sourceModule.name}</div>
          <div style="color: #64748b;">↔ ${targets.slice(0, 3).map(t => {
            const tm = FEATURE_REGISTRY.find(m => m.code === t);
            return tm ? tm.name : t;
          }).join(', ')}${targets.length > 3 ? ` +${targets.length - 3} more` : ''}</div>
        </div>
      `;
    }).join('');
    
    return `
    <div style="background: white; font-family: system-ui, -apple-system, sans-serif;">
      <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 3px solid ${primaryColor};">Executive Summary</h2>
      <p style="color: #64748b; margin-bottom: 20px;">Platform Overview for Decision Makers</p>
      
      <div style="margin-bottom: 24px;">
        <p style="font-size: 14px; line-height: 1.7; margin-bottom: 12px; color: #1e293b;">
          HRplus Cerebra is an enterprise-grade Human Resource Management System designed to transform workforce management 
          through intelligent automation and AI-powered insights. Purpose-built for the Caribbean, Africa, and global expansion, 
          the platform delivers deep regional compliance alongside sophisticated cross-module orchestration.
        </p>
        <p style="font-size: 14px; line-height: 1.7; color: #1e293b;">
          With <strong>${aiPoweredCount} AI-powered features</strong> and <strong>${uniqueCount} market differentiators</strong>, 
          HRplus Cerebra goes beyond traditional HRIS solutions to deliver predictive insights, prescriptive recommendations, 
          and automated actions across the entire employee lifecycle.
        </p>
      </div>

      <!-- ONE PLATFORM Banner -->
      <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); border-radius: 12px; color: white; text-align: center;">
        <h3 style="font-size: 20px; font-weight: 700; margin: 0 0 8px 0;">🚀 ONE PLATFORM - Complete HR Ecosystem</h3>
        <p style="font-size: 14px; opacity: 0.9; margin: 0;">${totalModules} integrated modules working seamlessly together on a single unified platform</p>
      </div>

      <!-- Complete Module Suite -->
      <div style="margin-bottom: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
        <h3 style="font-size: 16px; font-weight: 600; color: #166534; margin-bottom: 12px;">📋 Complete Module Suite (${totalModules} Modules)</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${FEATURE_REGISTRY.map(m => `<span style="background: white; border: 1px solid #22c55e30; padding: 4px 10px; border-radius: 4px; font-size: 11px; color: #166534; font-weight: 500;">${m.name}</span>`).join('')}
        </div>
      </div>
      
      <!-- Module Groups by Industry Standard -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span style="background: ${primaryColor}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">📦</span>
          Module Categories (Industry Standard Grouping)
        </h3>
        ${moduleGroupsHTML}
      </div>

      <!-- Talent Suite Deep Dive -->
      <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, #7c3aed08 0%, #4f46e508 100%); border-radius: 12px; border: 2px solid #7c3aed30;">
        <h3 style="font-size: 18px; font-weight: 600; color: #7c3aed; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          🎯 Talent Management Suite - Competitive Advantage
        </h3>
        <p style="font-size: 14px; color: #475569; margin-bottom: 16px;">
          Our integrated Talent Suite combines Performance, Training, Succession, and Recruitment into a seamless experience 
          that competitors like Workday, SAP, and Oracle HCM offer only as fragmented add-ons.
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Key Benefits:</div>
            <ul style="margin: 0; padding-left: 16px; list-style: none;">${talentBenefitsHTML}</ul>
          </div>
          <div style="background: white; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; font-weight: 600; color: #7c3aed; margin-bottom: 8px;">Included Modules:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${FEATURE_REGISTRY.filter(m => TALENT_SUITE.modules?.includes(m.code)).map(m => 
                `<span style="background: #7c3aed15; color: #7c3aed; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 500;">${m.name}</span>`
              ).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- HR Hub & Help Center -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
        <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; border-left: 4px solid #10b981;">
          <div style="font-weight: 600; color: #065f46; margin-bottom: 8px;">🏠 HR Hub</div>
          <p style="font-size: 13px; color: #047857; margin: 0;">Central command center for HR operations with pending actions, reminders, helpdesk, and compliance calendar. The operational heart of HR management.</p>
        </div>
        <div style="background: #eff6ff; border-radius: 8px; padding: 16px; border-left: 4px solid #3b82f6;">
          <div style="font-weight: 600; color: #1e40af; margin-bottom: 8px;">📚 Help Center</div>
          <p style="font-size: 13px; color: #1d4ed8; margin: 0;">In-app documentation, guides, and AI-powered assistance for all user roles. Contextual help and training resources.</p>
        </div>
      </div>

      <!-- One Platform Benefits -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <span style="background: ${accentColor}; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px;">🔗</span>
          One Platform Advantages
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${onePlatformHTML}
        </div>
      </div>
      
      <!-- Cross-Module Integrations - ALL Modules -->
      <div style="margin-bottom: 24px; padding: 20px; background: #fefce8; border-radius: 8px; border-left: 4px solid #eab308;">
        <h3 style="font-size: 16px; font-weight: 600; color: #854d0e; margin-bottom: 12px;">🔄 Cross-Module Integration Matrix</h3>
        <p style="font-size: 13px; color: #713f12; margin-bottom: 16px;">Every module connects seamlessly - data flows automatically, actions trigger workflows, insights aggregate across boundaries.</p>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
          ${integrationHTML}
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: #faf5ff; border-radius: 8px; padding: 20px; border-left: 4px solid #a855f7;">
          <div style="font-weight: 600; color: #581c87; margin-bottom: 8px;">🧠 AI-First Architecture</div>
          <p style="font-size: 14px; color: #7e22ce; margin: 0;">Predictive analytics, intelligent automation, and prescriptive guidance embedded across all modules.</p>
        </div>
        <div style="background: #fffbeb; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
          <div style="font-weight: 600; color: #78350f; margin-bottom: 8px;">⭐ Market Differentiators</div>
          <p style="font-size: 14px; color: #b45309; margin: 0;">Unique capabilities not found in competing solutions like Workday, SAP, or Oracle HCM.</p>
        </div>
      </div>
    </div>
  `;
  };

  const renderModuleHTML = (module: typeof FEATURE_REGISTRY[0], isFirst: boolean, moduleIndex: number = 0) => {
    const totalPages = getTotalPages();
    let pageNum = 4 + moduleIndex; // Start after cover, TOC, exec summary
    if (!currentTemplate.includeExecutiveSummary) pageNum -= 1;
    
    const enrichment = MODULE_ENRICHMENTS[module.code];
    const moduleFeatureCount = module.groups.reduce((acc, g) => acc + g.features.length, 0);
    const subModuleInfo = SUB_MODULE_HIGHLIGHTS[module.code];
    const isTalentSuite = TALENT_SUITE.modules.includes(module.code);
    const moduleGroup = getModuleGroup(module.code);
    const integrations = MODULE_INTEGRATIONS[module.code] || [];
    
    let featuresHTML = '';
    module.groups.forEach(group => {
      const isSubModule = subModuleInfo?.groups.includes(group.groupCode);
      
      featuresHTML += `<div style="margin-bottom: 20px; ${isSubModule ? `background: ${primaryColor}08; padding: 16px; border-radius: 8px; border: 2px dashed ${primaryColor}40;` : ''}">
        <h4 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #1e293b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${primaryColor};"></span>${group.groupName}
          ${isSubModule ? `<span style="background: ${primaryColor}; color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px; text-transform: none; letter-spacing: 0;">⭐ Sub-Module</span>` : ''}
        </h4>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${group.features.map(feature => {
            const detailedEnrichment = DETAILED_FEATURE_ENRICHMENTS[feature.code];
            const featureEnrichment = FEATURE_ENRICHMENTS[feature.code];
            const description = detailedEnrichment?.detailedDescription || featureEnrichment?.detailedDescription || feature.description;
            const examples = detailedEnrichment?.examples || [];
            const keyCapabilities = detailedEnrichment?.keyCapabilities || [];
            
            return `<div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
              <div style="font-weight: 600; color: #1e293b; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                <span style="color: ${accentColor};">✓</span> ${feature.name}
              </div>
              <p style="font-size: 13px; color: #475569; margin: 0 0 12px 0; line-height: 1.6;">${description}</p>
              ${examples.length > 0 ? `
                <div style="background: #f8fafc; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                  <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Examples:</div>
                  <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #475569;">
                    ${examples.slice(0, 3).map(ex => `<li style="margin-bottom: 4px;">${ex}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${keyCapabilities.length > 0 ? `
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${keyCapabilities.map(cap => `<span style="background: ${primaryColor}15; color: ${primaryColor}; padding: 2px 8px; border-radius: 4px; font-size: 11px;">${cap}</span>`).join('')}
                </div>
              ` : ''}
              ${detailedEnrichment?.businessBenefit ? `<p style="font-size: 12px; color: ${accentColor}; margin: 8px 0 0 0;"><strong>Value:</strong> ${detailedEnrichment.businessBenefit}</p>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>`;
    });
    
    const subModuleBadge = subModuleInfo ? `<div style="margin-top: 8px;"><span style="background: ${secondaryColor}15; color: ${secondaryColor}; font-size: 11px; padding: 4px 10px; border-radius: 4px;">⭐ Sub-Modules: ${subModuleInfo.label}</span></div>` : '';
    const integrationsHTML = integrations.length > 0 ? `
      <div style="margin-top: 16px; padding: 12px; background: #fefce8; border-radius: 6px; border-left: 3px solid #eab308;">
        <div style="font-size: 11px; font-weight: 600; color: #854d0e; margin-bottom: 6px;">🔗 Integrates With:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${integrations.map(code => {
            const targetModule = FEATURE_REGISTRY.find(m => m.code === code);
            return targetModule ? `<span style="background: white; border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #475569;">${targetModule.name}</span>` : '';
          }).join('')}
        </div>
      </div>
    ` : '';
    
    // Payroll countries section
    const payrollCountriesHTML = module.code === 'payroll' ? `
      <div style="margin: 16px 0; padding: 16px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 8px; color: white;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          🌍 Statutory Calculation Visibility - Supported Countries (${PAYROLL_COUNTRIES.length})
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          ${Object.entries(PAYROLL_COUNTRIES.reduce((acc, c) => { acc[c.region] = acc[c.region] || []; acc[c.region].push(c); return acc; }, {} as Record<string, typeof PAYROLL_COUNTRIES>)).map(([region, countries]) => `
            <div style="background: rgba(255,255,255,0.15); border-radius: 6px; padding: 12px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; opacity: 0.9;">${region}</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${countries.map(c => `<span style="background: rgba(255,255,255,0.25); padding: 2px 6px; border-radius: 3px; font-size: 10px;">${c.name}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';
    
    return `
      <div style="background: white; font-family: system-ui, -apple-system, sans-serif;">
        ${isFirst ? `<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 3px solid ${primaryColor};">Module Reference</h2><p style="color: #64748b; margin-bottom: 20px;">Complete Feature Inventory by Module</p>` : ''}
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid ${moduleGroup?.group.color || primaryColor}; ${isTalentSuite ? `border: 2px solid ${primaryColor}30;` : ''}">
          <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 12px;">
            <div style="background: ${moduleGroup?.group.color || primaryColor}20; padding: 10px; border-radius: 8px;">
              <span style="font-size: 20px;">${moduleGroup?.group.icon || '📦'}</span>
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0;">${module.name}</h3>
                <span style="background: ${primaryColor}20; color: ${primaryColor}; font-size: 11px; padding: 2px 6px; border-radius: 10px;">${moduleFeatureCount} Features</span>
                ${moduleGroup ? `<span style="background: ${moduleGroup.group.color}; color: white; font-size: 10px; padding: 3px 8px; border-radius: 4px; font-weight: 500;">${moduleGroup.group.icon} ${moduleGroup.group.name}</span>` : ''}
              </div>
              <p style="font-size: 13px; color: #64748b; margin: 0;">${module.description}</p>
              ${subModuleBadge}
            </div>
          </div>
          ${payrollCountriesHTML}
          ${enrichment ? `
            <div style="background: white; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0; margin-bottom: 12px;">
              <p style="font-size: 13px; color: #475569; margin: 0 0 10px 0;">${enrichment.businessContext}</p>
              <div style="margin-bottom: 10px;">
                <strong style="font-size: 12px; color: #1e293b;">Key Benefits:</strong>
                <ul style="margin: 6px 0 0 0; padding-left: 18px;">${enrichment.keyBenefits.slice(0, 4).map(b => `<li style="font-size: 12px; color: #64748b; margin-bottom: 3px;">${b}</li>`).join('')}</ul>
              </div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;"><strong>Target Users:</strong> ${enrichment.targetUsers.join(', ')}</div>
              <div style="background: ${primaryColor}10; padding: 10px; border-radius: 6px;"><strong style="color: ${primaryColor};">Strategic Value:</strong> <span style="color: ${primaryColor};">${enrichment.strategicValue}</span></div>
            </div>
          ` : ''}
          ${featuresHTML}
          ${integrationsHTML}
        </div>
      </div>
    `;
  };

  const renderCapabilitiesHTML = () => {
    const totalPages = getTotalPages();
    let pageNum = 3;
    if (currentTemplate.includeExecutiveSummary) pageNum += 1;
    if (currentTemplate.includeModules) pageNum += FEATURE_REGISTRY.length;
    
    // Group capabilities by category
    const aiCapabilities = PLATFORM_CAPABILITIES.filter(cap => 
      cap.code.includes('ai') || cap.code.includes('prediction') || cap.code.includes('intelligence')
    );
    const integrationCapabilities = PLATFORM_CAPABILITIES.filter(cap => 
      cap.code.includes('integration') || cap.code.includes('workflow') || cap.code.includes('automation')
    );
    const otherCapabilities = PLATFORM_CAPABILITIES.filter(cap => 
      !aiCapabilities.includes(cap) && !integrationCapabilities.includes(cap)
    );

    const renderCapabilityCard = (cap: typeof PLATFORM_CAPABILITIES[0]) => `
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: start; gap: 16px;">
          <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"><span style="font-size: 24px;">🎯</span></div>
          <div>
            <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">${cap.name}</h3>
            <p style="font-size: 14px; color: #64748b; margin: 0 0 12px 0;">${cap.description}</p>
            <div style="font-size: 14px; margin-bottom: 8px;"><span style="color: ${accentColor}; font-weight: 500;">Business Value:</span> ${cap.businessValue}</div>
            <div style="font-size: 14px; margin-bottom: 8px;"><span style="color: ${secondaryColor}; font-weight: 500;">Competitive Edge:</span> ${cap.competitorGap}</div>
            <div style="font-size: 14px;"><span style="color: ${primaryColor}; font-weight: 500;">Industry Impact:</span> ${cap.industryImpact}</div>
          </div>
        </div>
      </div>
    `;
    
    return `
      <div style="background: white; font-family: system-ui, -apple-system, sans-serif;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 3px solid ${primaryColor};">Platform Capabilities & AI Overview</h2>
        <p style="color: #64748b; margin-bottom: 20px;">AI-Powered Features & Competitive Advantages</p>
        
        <!-- AI Capabilities Summary -->
        <div style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, #7c3aed08 0%, #4f46e508 100%); border-radius: 10px; border: 2px solid #7c3aed30;">
          <h3 style="font-size: 16px; font-weight: 600; color: #7c3aed; margin-bottom: 12px;">🧠 AI-First Architecture</h3>
          <p style="font-size: 13px; color: #475569; margin-bottom: 12px;">HRplus Cerebra embeds AI across every module, not as an afterthought but as a core design principle.</p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="background: white; padding: 10px; border-radius: 6px; text-align: center;">
              <div style="font-size: 20px; margin-bottom: 6px;">🔮</div>
              <div style="font-weight: 600; color: #1e293b; font-size: 12px;">Predictive Analytics</div>
              <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0;">Anticipate workforce trends</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 6px; text-align: center;">
              <div style="font-size: 20px; margin-bottom: 6px;">⚡</div>
              <div style="font-weight: 600; color: #1e293b; font-size: 12px;">Intelligent Automation</div>
              <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0;">Smart workflow automation</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 6px; text-align: center;">
              <div style="font-size: 20px; margin-bottom: 6px;">💡</div>
              <div style="font-weight: 600; color: #1e293b; font-size: 12px;">Prescriptive Guidance</div>
              <p style="font-size: 10px; color: #64748b; margin: 4px 0 0 0;">AI-driven recommendations</p>
            </div>
          </div>
        </div>

        <!-- Industry-Standard Module Groupings -->
        <div style="margin-bottom: 20px; padding: 12px; background: #f8fafc; border-radius: 6px; border-left: 4px solid ${primaryColor};">
          <h3 style="font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 10px;">📦 Capability Distribution by Module Category</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            ${Object.entries(MODULE_GROUPS).map(([key, group]) => {
              const groupModules = FEATURE_REGISTRY.filter(m => group.modules.includes(m.code));
              const totalFeatures = groupModules.reduce((acc, m) => acc + m.groups.reduce((a, g) => a + g.features.length, 0), 0);
              const aiFeatures = groupModules.reduce((acc, m) => {
                return acc + m.groups.reduce((a, g) => {
                  return a + g.features.filter(f => FEATURE_CAPABILITIES.find(fc => fc.featureCode === f.code)?.capabilities.includes('ai-powered')).length;
                }, 0);
              }, 0);
              return `
                <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    <span>${group.icon}</span>
                    <span style="font-weight: 600; color: ${group.color}; font-size: 12px;">${group.name}</span>
                  </div>
                  <div style="font-size: 10px; color: #64748b;">${totalFeatures} features | ${aiFeatures} AI-powered</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- All Platform Capabilities -->
        <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px;">Platform Capabilities</h3>
        ${PLATFORM_CAPABILITIES.map(cap => renderCapabilityCard(cap)).join('')}

        <!-- Integration Highlights -->
        <div style="margin-top: 20px; padding: 16px; background: #fefce8; border-radius: 6px; border-left: 4px solid #eab308;">
          <h3 style="font-size: 14px; font-weight: 600; color: #854d0e; margin-bottom: 10px;">🔗 Cross-Module Integration</h3>
          <p style="font-size: 12px; color: #713f12; margin-bottom: 12px;">All modules share a unified data model, enabling seamless data flow.</p>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${Object.entries(MODULE_INTEGRATIONS).slice(0, 6).map(([source, targets]) => {
              const sourceModule = FEATURE_REGISTRY.find(m => m.code === source);
              return sourceModule ? `<span style="background: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; color: #854d0e; border: 1px solid #fde68a;">${sourceModule.name} ↔ ${targets.length} modules</span>` : '';
            }).join('')}
          </div>
        </div>
      </div>
    `;
  };

  const renderMatrixModuleHTML = (module: typeof FEATURE_REGISTRY[0], isFirst: boolean) => {
    const moduleFeatures = FEATURE_CAPABILITIES.filter(fc => 
      module.groups.some(g => g.features.some(f => f.code === fc.featureCode))
    ).map(fc => {
      let featureName = fc.featureCode;
      let groupName = '';
      for (const group of module.groups) {
        const feat = group.features.find(f => f.code === fc.featureCode);
        if (feat) { featureName = feat.name; groupName = group.groupName; break; }
      }
      return { ...fc, featureName, groupName };
    });
    
    if (moduleFeatures.length === 0) return '';
    
    const rowsHTML = moduleFeatures.map(fc => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px; border: 1px solid #e2e8f0;"><div style="font-weight: 500;">${fc.featureName}</div><div style="font-size: 11px; color: #94a3b8;">${fc.groupName}</div></td>
        <td style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;"><span style="background: ${fc.differentiatorLevel === 'unique' ? '#f3e8ff' : fc.differentiatorLevel === 'advanced' ? '#dbeafe' : '#f1f5f9'}; color: ${fc.differentiatorLevel === 'unique' ? '#7c3aed' : fc.differentiatorLevel === 'advanced' ? '#2563eb' : '#64748b'}; padding: 2px 8px; border-radius: 4px; font-size: 11px;">${fc.differentiatorLevel === 'unique' ? 'Unique' : fc.differentiatorLevel === 'advanced' ? 'Advanced' : 'Core'}</span></td>
        <td style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">${fc.capabilities.includes('ai-powered') ? '✓' : '—'}</td>
        <td style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">${fc.capabilities.includes('predictive-analytics') ? '✓' : '—'}</td>
        <td style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">${fc.capabilities.includes('intelligent-automation') ? '✓' : '—'}</td>
        <td style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">${fc.capabilities.includes('real-time-processing') ? '✓' : '—'}</td>
        <td style="padding: 8px; text-align: center; border: 1px solid #e2e8f0;">${fc.capabilities.includes('self-service') ? '✓' : '—'}</td>
      </tr>
    `).join('');
    
    return `
      <div style="padding: 40px; background: white; font-family: system-ui, -apple-system, sans-serif;">
        ${isFirst ? `<h2 style="font-size: 28px; font-weight: 700; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 3px solid ${primaryColor};">Capability Matrix</h2><p style="color: #64748b; margin-bottom: 24px;">Feature-by-Feature Capability Mapping by Module</p>` : ''}
        <h3 style="font-size: 18px; font-weight: 600; color: ${primaryColor}; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${primaryColor};"></span>${module.name}
          <span style="border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #64748b;">${moduleFeatures.length} features</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 10px 8px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600;">Feature</th>
              <th style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Level</th>
              <th style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">AI</th>
              <th style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Predictive</th>
              <th style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Automation</th>
              <th style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Real-Time</th>
              <th style="padding: 10px 8px; text-align: center; border: 1px solid #e2e8f0; font-weight: 600;">Self-Service</th>
            </tr>
          </thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>
    `;
  };

  // Page break indicator component
  const PageBreakIndicator = ({ pageNum, totalPages }: { pageNum: number; totalPages: number }) => (
    <div className="relative my-4">
      <div className="border-t-2 border-dashed border-orange-400" />
      <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
        <span>📄 PAGE BREAK</span>
        <span className="bg-orange-200 px-2 py-0.5 rounded">Page {pageNum} of {totalPages}</span>
      </div>
    </div>
  );

  // Document header component for preview
  const PreviewDocumentHeader = ({ pageNum, sectionTitle }: { pageNum: number; sectionTitle: string }) => (
    <div className="flex justify-between items-center py-3 mb-4 border-b-2" style={{ borderColor: `${primaryColor}20` }}>
      <div className="flex items-center gap-3">
        <div 
          className="text-white px-3 py-1.5 rounded text-xs font-semibold"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
        >
          {companyName || 'HRplus Cerebra'}
        </div>
        <span className="text-xs text-slate-500">{sectionTitle}</span>
      </div>
      {includeDate && (
        <span className="text-[10px] text-slate-400">
          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      )}
    </div>
  );

  // Document footer component for preview
  const PreviewDocumentFooter = ({ pageNum, totalPages }: { pageNum: number; totalPages: number }) => (
    <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center">
      <span className="text-[10px] text-slate-500">
        © {new Date().getFullYear()} {companyName || 'HRplus Cerebra'}. All rights reserved. | CONFIDENTIAL
      </span>
      {includePageNumbers && (
        <span className="text-[10px] text-slate-500">Page {pageNum} of {totalPages}</span>
      )}
    </div>
  );

  const totalPages = getTotalPages();

  const renderGuideContent = () => (
    <div ref={previewRef} className="bg-white text-black">
      {/* Cover Page */}
      <div 
        data-pdf-section
        className="guide-cover text-white p-16 text-center min-h-[600px] flex flex-col justify-center relative"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
      >
        {/* Classification badge */}
        <div className="absolute top-4 right-4 bg-white/20 px-4 py-1.5 rounded text-[10px] uppercase tracking-wider">
          Enterprise Documentation
        </div>
        
        {/* Company logo area */}
        <div className="mb-8">
          <div className="inline-block bg-white px-6 py-3 rounded-lg font-bold text-lg" style={{ color: primaryColor }}>
            {companyName || 'HRplus Cerebra'}
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{customTitle}</h1>
        <p className="text-xl opacity-90 mb-2">{customSubtitle}</p>
        {includeDate && (
          <p className="text-sm opacity-70 mt-4">
            Document Version: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <div className="flex justify-center gap-12 mt-12">
          <div className="text-center">
            <div className="text-4xl font-bold">{totalModules}</div>
            <div className="text-sm opacity-80 uppercase tracking-wide">Modules</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{totalFeatures}</div>
            <div className="text-sm opacity-80 uppercase tracking-wide">Features</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{aiPoweredCount}</div>
            <div className="text-sm opacity-80 uppercase tracking-wide">AI-Powered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{uniqueCount}</div>
            <div className="text-sm opacity-80 uppercase tracking-wide">Differentiators</div>
          </div>
        </div>
        
        {/* Cover footer */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-xs opacity-70">Prepared for Executive Review {includePageNumbers ? `| Page 1 of ${totalPages}` : ''}</p>
        </div>
      </div>

      <PageBreakIndicator pageNum={2} totalPages={totalPages} />

      {/* Table of Contents */}
      <div data-pdf-section className="p-8 min-h-[400px] bg-white">
        <PreviewDocumentHeader pageNum={2} sectionTitle="Table of Contents" />
        <h2 className="text-2xl font-bold mb-6 pb-2" style={{ borderBottom: `3px solid ${primaryColor}` }}>Table of Contents</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
            <span className="font-medium">Cover Page</span>
            <span className="text-sm text-muted-foreground">1</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
            <span className="font-medium">Table of Contents</span>
            <span className="text-sm text-muted-foreground">2</span>
          </div>
          {currentTemplate.includeExecutiveSummary && (
            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
              <span className="font-medium">Executive Summary</span>
              <span className="text-sm text-muted-foreground">3</span>
            </div>
          )}
          {currentTemplate.includeModules && (
            <>
              <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
                <span className="font-medium">Module Reference</span>
                <span className="text-sm text-muted-foreground">{currentTemplate.includeExecutiveSummary ? 4 : 3}</span>
              </div>
              {getModulesSortedByCategory().map((module, idx) => {
                const moduleGroup = getModuleGroup(module.code);
                return (
                  <div key={module.code} className="flex items-center justify-between py-1.5 pl-6 border-b border-dotted border-slate-100">
                    <span className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">{module.name}</span>
                      {moduleGroup && (
                        <Badge className="text-[9px] py-0" style={{ backgroundColor: `${moduleGroup.group.color}15`, color: moduleGroup.group.color }}>
                          {moduleGroup.group.name}
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">—</span>
                  </div>
                );
              })}
            </>
          )}
          {currentTemplate.includeCapabilities && (
            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
              <span className="font-medium">Platform Capabilities</span>
              <span className="text-sm text-muted-foreground">—</span>
            </div>
          )}
          {currentTemplate.includeMatrix && (
            <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200">
              <span className="font-medium">Capability Matrix</span>
              <span className="text-sm text-muted-foreground">—</span>
            </div>
          )}
        </div>
        <PreviewDocumentFooter pageNum={2} totalPages={totalPages} />
      </div>

      <PageBreakIndicator pageNum={3} totalPages={totalPages} />

      {/* Executive Summary */}
      {currentTemplate.includeExecutiveSummary && (
        <div data-pdf-section className="guide-section p-8 bg-white">
          <PreviewDocumentHeader pageNum={3} sectionTitle="Executive Summary" />
          <h2 className="section-title text-2xl font-bold pb-2 mb-2" style={{ borderBottom: `3px solid ${primaryColor}` }}>Executive Summary</h2>
          <p className="section-subtitle text-muted-foreground mb-6">Platform Overview for Decision Makers</p>
          
          <div className="prose max-w-none mb-6">
            <p className="text-base leading-relaxed mb-4">
              HRplus Cerebra is an enterprise-grade Human Resource Management System designed to transform workforce management 
              through intelligent automation and AI-powered insights. Purpose-built for the Caribbean, Africa, and global expansion, 
              the platform delivers deep regional compliance alongside sophisticated cross-module orchestration.
            </p>
            <p className="text-base leading-relaxed">
              With <strong>{aiPoweredCount} AI-powered features</strong> and <strong>{uniqueCount} market differentiators</strong>, 
              HRplus Cerebra goes beyond traditional HRIS solutions to deliver predictive insights, prescriptive recommendations, 
              and automated actions across the entire employee lifecycle.
            </p>
          </div>

          {/* ONE PLATFORM Banner */}
          <div 
            className="mb-6 p-5 rounded-xl text-white text-center"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
          >
            <h3 className="text-xl font-bold mb-2">🚀 ONE PLATFORM - Complete HR Ecosystem</h3>
            <p className="text-sm opacity-90">{totalModules} integrated modules working seamlessly together on a single unified platform</p>
          </div>

          {/* Module Groups by Industry Standard */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: primaryColor }}>📦</div>
              Module Categories
            </h3>
            <div className="space-y-3">
              {Object.entries(MODULE_GROUPS).map(([key, group]) => {
                const groupModules = FEATURE_REGISTRY.filter(m => group.modules.includes(m.code));
                const isTalent = key === 'talent_management';
                return (
                  <div 
                    key={key}
                    className="p-4 rounded-lg"
                    style={{ 
                      background: isTalent ? `linear-gradient(135deg, ${group.color}08, ${primaryColor}08)` : '#f8fafc',
                      borderLeft: `4px solid ${group.color}`,
                      border: isTalent ? `2px solid ${group.color}30` : undefined
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{group.icon}</span>
                      <h4 className="text-sm font-semibold" style={{ color: group.color }}>{group.name}</h4>
                      {isTalent && (
                        <Badge style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: 'white' }} className="text-[10px]">Featured</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{group.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {groupModules.map(m => (
                        <Badge key={m.code} className="text-[10px]" style={{ backgroundColor: `${group.color}15`, color: group.color }}>{m.name}</Badge>
                      ))}
                    </div>
                    <p className="text-[11px] italic" style={{ color: group.color }}>→ {group.marketingMessage}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Talent Suite Deep Dive */}
          <div 
            className="mb-6 p-5 rounded-xl"
            style={{ background: `linear-gradient(135deg, #7c3aed08, #4f46e508)`, border: `2px solid #7c3aed30` }}
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#7c3aed' }}>
              🎯 Talent Management Suite - Competitive Advantage
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Our integrated Talent Suite combines Performance, Training, Succession, and Recruitment into a seamless experience 
              that competitors like Workday, SAP, and Oracle HCM offer only as fragmented add-ons.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900 mb-2">Key Benefits:</div>
                <ul className="space-y-1">
                  {TALENT_SUITE.benefits?.slice(0, 6).map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <Check className="h-3 w-3 mt-0.5 shrink-0 text-emerald-500" />
                      <span className="text-slate-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-lg p-3 border">
                <div className="text-xs font-semibold mb-2" style={{ color: '#7c3aed' }}>Included Modules:</div>
                <div className="flex flex-wrap gap-1">
                  {FEATURE_REGISTRY.filter(m => TALENT_SUITE.modules?.includes(m.code)).map(m => (
                    <Badge key={m.code} className="text-[10px]" style={{ backgroundColor: '#7c3aed15', color: '#7c3aed' }}>{m.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HR Hub & Help Center */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-500">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">HR Hub</span>
              </div>
              <p className="text-sm text-emerald-800">Central command center for HR operations with pending actions, reminders, helpdesk, and compliance calendar.</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-2">
                <FolderTree className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Help Center</span>
              </div>
              <p className="text-sm text-blue-800">In-app documentation, guides, and AI-powered assistance for all user roles.</p>
            </div>
          </div>

          {/* One Platform Benefits */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: accentColor }}>🔗</div>
              One Platform Advantages
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ONE_PLATFORM_BENEFITS.map((benefit, idx) => (
                <div key={idx} className="bg-white border rounded-lg p-3 text-center">
                  <div className="text-xl mb-1">{benefit.icon}</div>
                  <div className="text-xs font-semibold text-slate-900 mb-1">{benefit.title}</div>
                  <p className="text-[10px] text-slate-500 leading-tight">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Module Integration Matrix */}
          <div className="mb-6 p-5 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <h3 className="text-base font-semibold text-yellow-900 mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              🔄 Cross-Module Integration Matrix
            </h3>
            <p className="text-sm text-yellow-800 mb-4">Every module connects seamlessly - data flows automatically, actions trigger workflows, insights aggregate across boundaries.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(MODULE_INTEGRATIONS).slice(0, 8).map(([source, targets]) => {
                const sourceModule = FEATURE_REGISTRY.find(m => m.code === source);
                if (!sourceModule) return null;
                return (
                  <div key={source} className="bg-white/80 rounded-md p-2 text-xs">
                    <div className="font-semibold mb-1" style={{ color: primaryColor }}>{sourceModule.name}</div>
                    <div className="text-slate-500">
                      ↔ {targets.slice(0, 3).map(t => {
                        const tm = FEATURE_REGISTRY.find(m => m.code === t);
                        return tm ? tm.name : t;
                      }).join(', ')}{targets.length > 3 && ` +${targets.length - 3}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-900">AI-First Architecture</span>
              </div>
              <p className="text-sm text-purple-800">Predictive analytics, intelligent automation, and prescriptive guidance embedded across all modules.</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-amber-900">Market Differentiators</span>
              </div>
              <p className="text-sm text-amber-800">Unique capabilities not found in competing solutions like Workday, SAP, or Oracle HCM.</p>
            </div>
          </div>
          <PreviewDocumentFooter pageNum={3} totalPages={totalPages} />
        </div>
      )}

      {/* Module Browser Section */}
      {currentTemplate.includeModules && (
        <>
          {getModulesSortedByCategory().map((module, moduleIndex) => {
            const ModuleIcon = getIcon(module.icon);
            const enrichment = MODULE_ENRICHMENTS[module.code];
            const moduleFeatureCount = module.groups.reduce((acc, g) => acc + g.features.length, 0);
            const subModuleInfo = SUB_MODULE_HIGHLIGHTS[module.code];
            const moduleGroup = getModuleGroup(module.code);
            const integrations = MODULE_INTEGRATIONS[module.code] || [];
            const modulePageNum = 4 + moduleIndex;
            
            return (
              <div key={module.code}>
                <PageBreakIndicator pageNum={modulePageNum} totalPages={totalPages} />
                <div data-pdf-section className="p-8 bg-white">
                  <PreviewDocumentHeader pageNum={modulePageNum} sectionTitle={`Module: ${module.name}`} />
                  {moduleIndex === 0 && (
                    <>
                      <h2 className="section-title text-2xl font-bold pb-2 mb-2" style={{ borderBottom: `3px solid ${primaryColor}` }}>Module Reference</h2>
                      <p className="section-subtitle text-muted-foreground mb-6">Complete Feature Inventory by Module</p>
                    </>
                  )}
                
                <div 
                  className="module-card bg-slate-50 rounded-lg p-6 mb-4" 
                  style={{ 
                    borderLeft: `4px solid ${moduleGroup?.group.color || primaryColor}`,
                  }}
                >
                  {/* Module Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg shrink-0" style={{ backgroundColor: `${moduleGroup?.group.color || primaryColor}20` }}>
                      <span className="text-2xl">{moduleGroup?.group.icon || '📦'}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="module-name text-xl font-semibold">{module.name}</h3>
                        <Badge style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>{moduleFeatureCount} Features</Badge>
                        {moduleGroup && (
                          <Badge style={{ backgroundColor: moduleGroup.group.color, color: 'white' }}>
                            {moduleGroup.group.icon} {moduleGroup.group.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                      {subModuleInfo && (
                        <div className="mt-2">
                          <Badge variant="outline" style={{ borderColor: secondaryColor, color: secondaryColor }}>
                            ⭐ Sub-Modules: {subModuleInfo.label}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payroll Countries Section */}
                  {module.code === 'payroll' && (
                    <div className="mb-4 p-4 rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                      <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                        🌍 Statutory Calculation Visibility - Supported Countries ({PAYROLL_COUNTRIES.length})
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(PAYROLL_COUNTRIES.reduce((acc, c) => { 
                          acc[c.region] = acc[c.region] || []; 
                          acc[c.region].push(c); 
                          return acc; 
                        }, {} as Record<string, typeof PAYROLL_COUNTRIES>)).map(([region, countries]) => (
                          <div key={region} className="bg-white/15 rounded-md p-3">
                            <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-90">{region}</div>
                            <div className="flex flex-wrap gap-1">
                              {countries.map(c => (
                                <span key={c.code} className="bg-white/25 px-2 py-0.5 rounded text-[10px]">{c.name}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Context */}
                  {enrichment && (
                    <div className="mb-6 p-4 bg-white rounded-lg border">
                      <p className="text-sm leading-relaxed text-slate-700">{enrichment.businessContext}</p>
                      
                      {/* Key Benefits */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Key Benefits:</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {enrichment.keyBenefits.slice(0, 4).map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-slate-600">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Target Users & Strategic Value */}
                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Target Users: </span>
                          <span className="text-slate-600">{enrichment.targetUsers.join(", ")}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          <span className="font-semibold">Strategic Value: </span>
                          {enrichment.strategicValue}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Feature Groups */}
                  {module.groups.map((group) => (
                    <div key={group.groupCode} className="mb-4">
                      <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                        {group.groupName}
                      </h4>
                      <div className="feature-list space-y-3">
                        {group.features.map((feature) => {
                          const featureCaps = FEATURE_CAPABILITIES.find(f => f.featureCode === feature.code);
                          const detailedEnrichment = DETAILED_FEATURE_ENRICHMENTS[feature.code];
                          const featureEnrichment = FEATURE_ENRICHMENTS[feature.code];
                          const description = detailedEnrichment?.detailedDescription || featureEnrichment?.detailedDescription || feature.description;
                          const examples = detailedEnrichment?.examples || [];
                          const keyCapabilities = detailedEnrichment?.keyCapabilities || [];
                          
                          return (
                            <div key={feature.code} className="feature-item bg-white rounded-lg p-4 border">
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 mt-1 shrink-0" style={{ color: accentColor }} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="feature-name font-semibold text-slate-900">{feature.name}</span>
                                    {featureCaps?.capabilities.includes('ai-powered') && (
                                      <Badge className="text-[10px]" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>AI-Powered</Badge>
                                    )}
                                    {featureCaps?.differentiatorLevel === 'unique' && (
                                      <Badge className="badge-unique bg-amber-100 text-amber-700 text-[10px]">Unique</Badge>
                                    )}
                                    {featureCaps?.differentiatorLevel === 'advanced' && (
                                      <Badge className="badge-advanced bg-blue-100 text-blue-700 text-[10px]">Advanced</Badge>
                                    )}
                                  </div>
                                  <p className="feature-desc text-sm text-slate-600 leading-relaxed mb-3">
                                    {description}
                                  </p>
                                  
                                  {/* Examples Section */}
                                  {examples.length > 0 && (
                                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Examples:</div>
                                      <ul className="space-y-1.5">
                                        {examples.slice(0, 3).map((example, idx) => (
                                          <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                            <span className="text-slate-400">•</span>
                                            <span>{example}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* Key Capabilities */}
                                  {keyCapabilities.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                      {keyCapabilities.map((cap, idx) => (
                                        <span 
                                          key={idx}
                                          className="text-[10px] px-2 py-0.5 rounded"
                                          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                                        >
                                          {cap}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {detailedEnrichment?.businessBenefit && (
                                    <p className="text-xs mt-2" style={{ color: accentColor }}>
                                      <span className="font-medium">Business Value: </span>{detailedEnrichment.businessBenefit}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Integration Points */}
                  {enrichment?.integrationPoints && enrichment.integrationPoints.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <span className="text-xs font-medium text-slate-500">Integrates with: </span>
                      <span className="text-xs text-slate-600">{enrichment.integrationPoints.join(" • ")}</span>
                    </div>
                  )}
                </div>
                <PreviewDocumentFooter pageNum={modulePageNum} totalPages={totalPages} />
              </div>
            </div>
            );
          })}
        </>
      )}

      {/* Capabilities Section */}
      {currentTemplate.includeCapabilities && (
        <>
          <PageBreakIndicator pageNum={4 + (currentTemplate.includeModules ? FEATURE_REGISTRY.length : 0)} totalPages={totalPages} />
          <div data-pdf-section className="p-8 bg-white">
            <PreviewDocumentHeader pageNum={4 + (currentTemplate.includeModules ? FEATURE_REGISTRY.length : 0)} sectionTitle="Platform Capabilities" />
            <h2 className="section-title text-2xl font-bold pb-2 mb-2" style={{ borderBottom: `3px solid ${primaryColor}` }}>Platform Capabilities</h2>
            <p className="section-subtitle text-muted-foreground mb-6">AI-Powered Features & Competitive Advantages</p>
          
          {PLATFORM_CAPABILITIES.map((capability) => {
            const CapIcon = getIcon(capability.icon);
            return (
              <div key={capability.code} className="capability-card bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 mb-4 border">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <CapIcon className="h-6 w-6" style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="capability-name text-lg font-semibold mb-2">{capability.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{capability.description}</p>
                    
                    <div className="space-y-2">
                      <div className="capability-value">
                        <span className="font-medium" style={{ color: accentColor }}>Business Value:</span>{' '}
                        <span className="text-slate-700">{capability.businessValue}</span>
                      </div>
                      <div className="capability-value">
                        <span className="font-medium" style={{ color: secondaryColor }}>Competitive Edge:</span>{' '}
                        <span className="text-slate-700">{capability.competitorGap}</span>
                      </div>
                      <div className="capability-value">
                        <span className="font-medium" style={{ color: primaryColor }}>Industry Impact:</span>{' '}
                        <span className="text-slate-700">{capability.industryImpact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <PreviewDocumentFooter pageNum={4 + (currentTemplate.includeModules ? FEATURE_REGISTRY.length : 0)} totalPages={totalPages} />
          </div>
        </>
      )}

      {/* Matrix Section - Organized by Module */}
      {currentTemplate.includeMatrix && (
        <>
          {getModulesSortedByCategory().map((module, moduleIndex) => {
            // Get features for this module that have capabilities defined
            const moduleFeatures = FEATURE_CAPABILITIES.filter(fc => {
              for (const group of module.groups) {
                if (group.features.some(f => f.code === fc.featureCode)) {
                  return true;
                }
              }
              return false;
            }).map(fc => {
              let featureName = fc.featureCode;
              let groupName = '';
              for (const group of module.groups) {
                const feat = group.features.find(f => f.code === fc.featureCode);
                if (feat) {
                  featureName = feat.name;
                  groupName = group.groupName;
                  break;
                }
              }
              return { ...fc, featureName, groupName };
            });

            if (moduleFeatures.length === 0) return null;

            return (
              <div key={module.code} data-pdf-section className="p-8 bg-white">
                {moduleIndex === 0 && (
                  <>
                    <h2 className="section-title text-2xl font-bold pb-2 mb-2" style={{ borderBottom: `3px solid ${primaryColor}` }}>Capability Matrix</h2>
                    <p className="section-subtitle text-muted-foreground mb-6">Feature-by-Feature Capability Mapping by Module</p>
                  </>
                )}
                
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: primaryColor }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                  {module.name}
                  <Badge variant="outline" className="text-xs">{moduleFeatures.length} features</Badge>
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="matrix-table w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border p-2 text-left font-semibold">Feature</th>
                        <th className="border p-2 text-center font-semibold">Level</th>
                        <th className="border p-2 text-center font-semibold whitespace-normal">AI-Powered</th>
                        <th className="border p-2 text-center font-semibold whitespace-normal">Predictive Analytics</th>
                        <th className="border p-2 text-center font-semibold whitespace-normal">Intelligent Automation</th>
                        <th className="border p-2 text-center font-semibold whitespace-normal">Real-Time Processing</th>
                        <th className="border p-2 text-center font-semibold whitespace-normal">Self-Service</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moduleFeatures.map((fc) => (
                        <tr key={fc.featureCode} className="hover:bg-slate-50">
                          <td className="border p-2">
                            <div className="font-medium">{fc.featureName}</div>
                            <div className="text-xs text-muted-foreground">{fc.groupName}</div>
                          </td>
                          <td className="border p-2 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              fc.differentiatorLevel === 'unique' ? 'bg-purple-100 text-purple-700' :
                              fc.differentiatorLevel === 'advanced' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {fc.differentiatorLevel === 'unique' ? 'Unique' : 
                               fc.differentiatorLevel === 'advanced' ? 'Advanced' : 'Core'}
                            </span>
                          </td>
                          <td className="border p-2 text-center">{fc.capabilities.includes('ai-powered') ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '—'}</td>
                          <td className="border p-2 text-center">{fc.capabilities.includes('predictive-analytics') ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '—'}</td>
                          <td className="border p-2 text-center">{fc.capabilities.includes('intelligent-automation') ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '—'}</td>
                          <td className="border p-2 text-center">{fc.capabilities.includes('real-time-processing') ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '—'}</td>
                          <td className="border p-2 text-center">{fc.capabilities.includes('self-service') ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Footer */}
      <div className="footer text-center p-6 border-t text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} HRplus Cerebra. All rights reserved.</p>
        {includeDate && <p className="mt-1">Document generated on {new Date().toLocaleDateString()}</p>}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Feature Catalog Guide Export
          </DialogTitle>
          <DialogDescription>
            Generate a professional guide document for decision makers and stakeholders
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="template" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Template & Settings
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="flex-1 overflow-auto mt-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Template Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Select Template</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose a pre-configured template</p>
                </div>
                
                <div className="space-y-2">
                  {GUIDE_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTemplate === template.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{template.name}</span>
                        {selectedTemplate === template.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="flex gap-2 mt-2">
                        {template.includeModules && <Badge variant="outline" className="text-[10px]">Modules</Badge>}
                        {template.includeCapabilities && <Badge variant="outline" className="text-[10px]">Capabilities</Badge>}
                        {template.includeMatrix && <Badge variant="outline" className="text-[10px]">Matrix</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customization Options */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Customize Document</Label>
                  <p className="text-sm text-muted-foreground mb-3">Personalize your guide</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Enter document title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      placeholder="Enter subtitle"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="date">Include Generation Date</Label>
                      <p className="text-xs text-muted-foreground">Show when document was created</p>
                    </div>
                    <Switch
                      id="date"
                      checked={includeDate}
                      onCheckedChange={setIncludeDate}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pages">Include Page Numbers</Label>
                      <p className="text-xs text-muted-foreground">Add page numbers to printed output</p>
                    </div>
                    <Switch
                      id="pages"
                      checked={includePageNumbers}
                      onCheckedChange={setIncludePageNumbers}
                    />
                  </div>

                  <Separator />

                  {/* Branding Section */}
                  <div>
                    <Label className="text-sm font-semibold">Company Branding</Label>
                    <p className="text-xs text-muted-foreground mb-3">Customize colors for your brand</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your company name"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="primary" className="text-xs">Primary Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="primary"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 text-xs"
                          placeholder="#7c3aed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary" className="text-xs">Secondary Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="secondary"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="flex-1 text-xs"
                          placeholder="#4f46e5"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accent" className="text-xs">Accent Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="accent"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-10 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="flex-1 text-xs"
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="p-3 rounded-lg border">
                    <div className="text-xs text-muted-foreground mb-2">Color Preview</div>
                    <div 
                      className="h-12 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                      style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                    >
                      Cover Gradient
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div 
                        className="flex-1 h-6 rounded flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Primary
                      </div>
                      <div 
                        className="flex-1 h-6 rounded flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: secondaryColor }}
                      >
                        Secondary
                      </div>
                      <div 
                        className="flex-1 h-6 rounded flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: accentColor }}
                      >
                        Accent
                      </div>
                    </div>
                  </div>
                  
                  {/* Save Colors Button */}
                  <Button 
                    variant="outline" 
                    onClick={handleSaveBrandColors}
                    disabled={saveBrandColors.isPending}
                    className="w-full gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saveBrandColors.isPending ? 'Saving...' : 'Save Brand Colors'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Save these colors to use across all templates
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[500px] border rounded-lg bg-white">
              {renderGuideContent()}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2">
            <Download className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
