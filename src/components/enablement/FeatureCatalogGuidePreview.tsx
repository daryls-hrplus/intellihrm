import { useState, useRef } from "react";
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
  BarChart3
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  
  // Branding options
  const [primaryColor, setPrimaryColor] = useState("#7c3aed"); // Purple
  const [secondaryColor, setSecondaryColor] = useState("#4f46e5"); // Indigo
  const [accentColor, setAccentColor] = useState("#10b981"); // Green
  const [companyName, setCompanyName] = useState("HRplus Cerebra");
  
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
    if (!printWindow || !previewRef.current) return;

    const content = previewRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${customTitle}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
            .guide-cover { page-break-after: always; padding: 60px; text-align: center; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: white; }
            .guide-cover h1 { font-size: 48px; font-weight: 700; margin-bottom: 16px; }
            .guide-cover p { font-size: 20px; opacity: 0.9; }
            .guide-cover .stats { display: flex; justify-content: center; gap: 40px; margin-top: 60px; }
            .guide-cover .stat { text-align: center; }
            .guide-cover .stat-value { font-size: 42px; font-weight: 700; }
            .guide-cover .stat-label { font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }
            .guide-section { padding: 40px; page-break-after: always; }
            .section-title { font-size: 28px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; border-bottom: 3px solid ${primaryColor}; padding-bottom: 12px; }
            .section-subtitle { font-size: 16px; color: #666; margin-bottom: 24px; }
            .module-card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid ${primaryColor}; }
            .module-name { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
            .feature-list { list-style: none; padding-left: 0; }
            .feature-item { padding: 8px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px; }
            .feature-item:last-child { border-bottom: none; }
            .feature-name { font-weight: 500; }
            .feature-desc { font-size: 14px; color: #666; }
            .capability-card { background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%); border-radius: 12px; padding: 24px; margin-bottom: 16px; }
            .capability-name { font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
            .capability-value { font-size: 14px; color: #333; margin-bottom: 4px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
            .badge-ai { background: ${primaryColor}20; color: ${primaryColor}; }
            .badge-unique { background: #fef3c7; color: #d97706; }
            .badge-advanced { background: #dbeafe; color: #2563eb; }
            .matrix-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
            .matrix-table th, .matrix-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            .matrix-table th { background: #f3f4f6; font-weight: 600; }
            .check-mark { color: ${accentColor}; font-weight: bold; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 40px; }
            .brand-primary { color: ${primaryColor}; }
            .brand-bg { background-color: ${primaryColor}; }
            @media print {
              .guide-section { page-break-after: always; }
              .no-break { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
        FEATURE_REGISTRY.forEach((module, idx) => {
          sections.push({ id: `module-${module.code}`, render: () => renderModuleHTML(module, idx === 0) });
        });
      }
      
      if (currentTemplate.includeCapabilities) {
        sections.push({ id: 'capabilities', render: () => renderCapabilitiesHTML() });
      }
      
      if (currentTemplate.includeMatrix) {
        FEATURE_REGISTRY.forEach((module, idx) => {
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
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // HTML render functions for PDF generation
  const renderCoverHTML = () => `
    <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%); color: white; padding: 80px 40px; text-align: center; min-height: 600px; display: flex; flex-direction: column; justify-content: center;">
      <h1 style="font-size: 42px; font-weight: 700; margin-bottom: 16px;">${customTitle}</h1>
      <p style="font-size: 20px; opacity: 0.9; margin-bottom: 8px;">${customSubtitle}</p>
      ${companyName ? `<p style="font-size: 14px; opacity: 0.8; margin-top: 8px;">by ${companyName}</p>` : ''}
      ${includeDate ? `<p style="font-size: 14px; opacity: 0.7; margin-top: 16px;">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
      <div style="display: flex; justify-content: center; gap: 60px; margin-top: 60px;">
        <div style="text-align: center;"><div style="font-size: 42px; font-weight: 700;">${totalModules}</div><div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Modules</div></div>
        <div style="text-align: center;"><div style="font-size: 42px; font-weight: 700;">${totalFeatures}</div><div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Features</div></div>
        <div style="text-align: center;"><div style="font-size: 42px; font-weight: 700;">${aiPoweredCount}</div><div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">AI-Powered</div></div>
        <div style="text-align: center;"><div style="font-size: 42px; font-weight: 700;">${uniqueCount}</div><div style="font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px;">Differentiators</div></div>
      </div>
    </div>
  `;

  const renderTOCHTML = () => {
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
      FEATURE_REGISTRY.forEach((module) => {
        tocItems += `<div style="display: flex; justify-content: space-between; padding: 8px 0 8px 24px; border-bottom: 1px dotted #f1f5f9;"><span style="color: #475569; font-size: 14px;">${module.name}</span><span style="color: #94a3b8; font-size: 12px;">${pageNum++}</span></div>`;
      });
    }
    
    if (currentTemplate.includeCapabilities) {
      tocItems += `<div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0;"><span style="font-weight: 500;">Platform Capabilities</span><span style="color: #64748b;">${pageNum++}</span></div>`;
    }
    
    if (currentTemplate.includeMatrix) {
      tocItems += `<div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0;"><span style="font-weight: 500;">Capability Matrix</span><span style="color: #64748b;">${pageNum}</span></div>`;
    }
    
    return `
      <div style="padding: 40px; background: white; font-family: system-ui, -apple-system, sans-serif;">
        <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px solid ${primaryColor};">Table of Contents</h2>
        <div>${tocItems}</div>
      </div>
    `;
  };

  const renderExecutiveSummaryHTML = () => `
    <div style="padding: 40px; background: white; font-family: system-ui, -apple-system, sans-serif;">
      <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 3px solid ${primaryColor};">Executive Summary</h2>
      <p style="color: #64748b; margin-bottom: 24px;">Platform Overview for Decision Makers</p>
      <div style="margin-bottom: 32px;">
        <p style="font-size: 16px; line-height: 1.7; margin-bottom: 16px; color: #1e293b;">
          HRplus Cerebra is an enterprise-grade Human Resource Management System designed to transform workforce management 
          through intelligent automation and AI-powered insights. Purpose-built for the Caribbean, Africa, and global expansion, 
          the platform delivers deep regional compliance alongside sophisticated cross-module orchestration.
        </p>
        <p style="font-size: 16px; line-height: 1.7; color: #1e293b;">
          With <strong>${aiPoweredCount} AI-powered features</strong> and <strong>${uniqueCount} market differentiators</strong>, 
          HRplus Cerebra goes beyond traditional HRIS solutions to deliver predictive insights, prescriptive recommendations, 
          and automated actions across the entire employee lifecycle.
        </p>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: #faf5ff; border-radius: 8px; padding: 20px; border-left: 4px solid #a855f7;">
          <div style="font-weight: 600; color: #581c87; margin-bottom: 8px;">🧠 AI-First Architecture</div>
          <p style="font-size: 14px; color: #7e22ce;">Predictive analytics, intelligent automation, and prescriptive guidance embedded across all modules.</p>
        </div>
        <div style="background: #fffbeb; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
          <div style="font-weight: 600; color: #78350f; margin-bottom: 8px;">⭐ Market Differentiators</div>
          <p style="font-size: 14px; color: #b45309;">Unique capabilities not found in competing solutions like Workday, SAP, or Oracle HCM.</p>
        </div>
      </div>
    </div>
  `;

  const renderModuleHTML = (module: typeof FEATURE_REGISTRY[0], isFirst: boolean) => {
    const enrichment = MODULE_ENRICHMENTS[module.code];
    const moduleFeatureCount = module.groups.reduce((acc, g) => acc + g.features.length, 0);
    
    let featuresHTML = '';
    module.groups.forEach(group => {
      featuresHTML += `<div style="margin-bottom: 16px;">
        <h4 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #1e293b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${primaryColor};"></span>${group.groupName}
        </h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${group.features.map(feature => {
            const featureEnrichment = FEATURE_ENRICHMENTS[feature.code];
            return `<li style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
              <div style="font-weight: 500; color: #1e293b; margin-bottom: 4px;">✓ ${feature.name}</div>
              <p style="font-size: 13px; color: #64748b; margin: 0;">${featureEnrichment?.detailedDescription || feature.description}</p>
              ${featureEnrichment?.businessBenefit ? `<p style="font-size: 12px; color: ${accentColor}; margin: 4px 0 0 0;"><strong>Value:</strong> ${featureEnrichment.businessBenefit}</p>` : ''}
            </li>`;
          }).join('')}
        </ul>
      </div>`;
    });
    
    return `
      <div style="padding: 40px; background: white; font-family: system-ui, -apple-system, sans-serif;">
        ${isFirst ? `<h2 style="font-size: 28px; font-weight: 700; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 3px solid ${primaryColor};">Module Reference</h2><p style="color: #64748b; margin-bottom: 24px;">Complete Feature Inventory by Module</p>` : ''}
        <div style="background: #f8fafc; border-radius: 8px; padding: 24px; border-left: 4px solid ${primaryColor};">
          <div style="display: flex; align-items: start; gap: 16px; margin-bottom: 16px;">
            <div style="background: ${primaryColor}20; padding: 12px; border-radius: 8px;">
              <span style="font-size: 24px;">📦</span>
            </div>
            <div>
              <h3 style="font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 4px 0;">${module.name} <span style="background: ${primaryColor}20; color: ${primaryColor}; font-size: 12px; padding: 2px 8px; border-radius: 12px; margin-left: 8px;">${moduleFeatureCount} Features</span></h3>
              <p style="font-size: 14px; color: #64748b; margin: 0;">${module.description}</p>
            </div>
          </div>
          ${enrichment ? `
            <div style="background: white; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
              <p style="font-size: 14px; color: #475569; margin: 0 0 12px 0;">${enrichment.businessContext}</p>
              <div style="margin-bottom: 12px;">
                <strong style="font-size: 13px; color: #1e293b;">Key Benefits:</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">${enrichment.keyBenefits.slice(0, 4).map(b => `<li style="font-size: 13px; color: #64748b; margin-bottom: 4px;">${b}</li>`).join('')}</ul>
              </div>
              <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;"><strong>Target Users:</strong> ${enrichment.targetUsers.join(', ')}</div>
              <div style="background: ${primaryColor}10; padding: 12px; border-radius: 6px;"><strong style="color: ${primaryColor};">Strategic Value:</strong> <span style="color: ${primaryColor};">${enrichment.strategicValue}</span></div>
            </div>
          ` : ''}
          ${featuresHTML}
        </div>
      </div>
    `;
  };

  const renderCapabilitiesHTML = () => {
    const capsHTML = PLATFORM_CAPABILITIES.map(cap => `
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
    `).join('');
    
    return `
      <div style="padding: 40px; background: white; font-family: system-ui, -apple-system, sans-serif;">
        <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 8px; padding-bottom: 12px; border-bottom: 3px solid ${primaryColor};">Platform Capabilities</h2>
        <p style="color: #64748b; margin-bottom: 24px;">AI-Powered Features & Competitive Advantages</p>
        ${capsHTML}
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

  const renderGuideContent = () => (
    <div ref={previewRef} className="bg-white text-black">
      {/* Cover Page */}
      <div 
        data-pdf-section
        className="guide-cover text-white p-16 text-center min-h-[600px] flex flex-col justify-center"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
      >
        <h1 className="text-4xl font-bold mb-4">{customTitle}</h1>
        <p className="text-xl opacity-90 mb-2">{customSubtitle}</p>
        {companyName && (
          <p className="text-sm opacity-80 mt-2">by {companyName}</p>
        )}
        {includeDate && (
          <p className="text-sm opacity-70 mt-4">
            Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
      </div>

      {/* Table of Contents */}
      <div data-pdf-section className="p-8 min-h-[400px] bg-white">
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
              {FEATURE_REGISTRY.map((module, idx) => (
                <div key={module.code} className="flex items-center justify-between py-1.5 pl-6 border-b border-dotted border-slate-100">
                  <span className="text-sm text-slate-600">{module.name}</span>
                  <span className="text-xs text-muted-foreground">—</span>
                </div>
              ))}
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
      </div>

      {/* Executive Summary */}
      {currentTemplate.includeExecutiveSummary && (
        <div data-pdf-section className="guide-section p-8 bg-white">
          <h2 className="section-title text-2xl font-bold pb-2 mb-2" style={{ borderBottom: `3px solid ${primaryColor}` }}>Executive Summary</h2>
          <p className="section-subtitle text-muted-foreground mb-6">Platform Overview for Decision Makers</p>
          
          <div className="prose max-w-none mb-8">
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
        </div>
      )}

      {/* Module Browser Section */}
      {currentTemplate.includeModules && (
        <>
          {FEATURE_REGISTRY.map((module, moduleIndex) => {
            const ModuleIcon = getIcon(module.icon);
            const enrichment = MODULE_ENRICHMENTS[module.code];
            const moduleFeatureCount = module.groups.reduce((acc, g) => acc + g.features.length, 0);
            
            return (
              <div key={module.code} data-pdf-section className="p-8 bg-white">
                {moduleIndex === 0 && (
                  <>
                    <h2 className="section-title text-2xl font-bold pb-2 mb-2" style={{ borderBottom: `3px solid ${primaryColor}` }}>Module Reference</h2>
                    <p className="section-subtitle text-muted-foreground mb-6">Complete Feature Inventory by Module</p>
                  </>
                )}
                
                <div className="module-card bg-slate-50 rounded-lg p-6 mb-4" style={{ borderLeft: `4px solid ${primaryColor}` }}>
                  {/* Module Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg shrink-0" style={{ backgroundColor: `${primaryColor}20` }}>
                      <ModuleIcon className="h-6 w-6" style={{ color: primaryColor }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="module-name text-xl font-semibold">{module.name}</h3>
                        <Badge style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>{moduleFeatureCount} Features</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>

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
                      <ul className="feature-list space-y-2">
                        {group.features.map((feature) => {
                          const featureCaps = FEATURE_CAPABILITIES.find(f => f.featureCode === feature.code);
                          const featureEnrichment = FEATURE_ENRICHMENTS[feature.code];
                          return (
                            <li key={feature.code} className="feature-item bg-white rounded-lg p-3 border">
                              <div className="flex items-start gap-2">
                                <Check className="h-4 w-4 mt-1 shrink-0" style={{ color: accentColor }} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="feature-name font-medium text-slate-900">{feature.name}</span>
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
                                  <p className="feature-desc text-sm text-slate-600">
                                    {featureEnrichment?.detailedDescription || feature.description}
                                  </p>
                                  {featureEnrichment?.businessBenefit && (
                                    <p className="text-xs mt-1" style={{ color: accentColor }}>
                                      <span className="font-medium">Value: </span>{featureEnrichment.businessBenefit}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
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
              </div>
            );
          })}
        </>
      )}

      {/* Capabilities Section */}
      {currentTemplate.includeCapabilities && (
        <div data-pdf-section className="p-8 bg-white">
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
        </div>
      )}

      {/* Matrix Section - Organized by Module */}
      {currentTemplate.includeMatrix && (
        <>
          {FEATURE_REGISTRY.map((module, moduleIndex) => {
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
