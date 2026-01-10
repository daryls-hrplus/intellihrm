import jsPDF from "jspdf";
import { 
  ProductCapabilitiesPrintSettings,
  CLASSIFICATION_WATERMARKS 
} from "@/hooks/useProductCapabilitiesPrintSettings";
import { 
  EXECUTIVE_SUMMARY,
  CAPABILITIES_DATA, 
  PLATFORM_FEATURES, 
  REGIONAL_COMPLIANCE, 
  AI_INTELLIGENCE,
  ActData,
  ModuleData
} from "../data/capabilitiesData";
import { PRODUCT_CAPABILITIES_TOC } from "../components/TableOfContents";
import { format } from "date-fns";

// ACT colors for visual distinction
const ACT_COLORS: Record<string, [number, number, number]> = {
  prologue: [100, 116, 139],  // Slate
  act1: [59, 130, 246],       // Blue
  act2: [16, 185, 129],       // Emerald
  act3: [245, 158, 11],       // Amber
  act4: [168, 85, 247],       // Purple
  act5: [239, 68, 68],        // Red
  epilogue: [99, 102, 241],   // Indigo
};

// Glossary terms for HRMS
const GLOSSARY_TERMS = [
  { term: "ESS", definition: "Employee Self-Service - Portal for employees to manage their own HR data" },
  { term: "MSS", definition: "Manager Self-Service - Tools for managers to oversee their teams" },
  { term: "LMS", definition: "Learning Management System - Platform for training delivery and tracking" },
  { term: "RLS", definition: "Row-Level Security - Database security restricting data access per user" },
  { term: "Compa-Ratio", definition: "Comparison ratio of employee salary to market midpoint" },
  { term: "9-Box Grid", definition: "Performance/potential matrix for talent assessment and succession planning" },
  { term: "PAYE", definition: "Pay As You Earn - Tax withholding system used in Caribbean/UK" },
  { term: "NIS", definition: "National Insurance Scheme - Social security contributions" },
  { term: "NHT", definition: "National Housing Trust - Jamaica housing contribution scheme" },
  { term: "SSNIT", definition: "Social Security and National Insurance Trust - Ghana pension system" },
  { term: "AFP", definition: "Administradoras de Fondos de Pensiones - Dominican Republic pension funds" },
  { term: "IDP", definition: "Individual Development Plan - Personalized employee growth roadmap" },
  { term: "PIP", definition: "Performance Improvement Plan - Structured plan to address performance gaps" },
  { term: "CFDI", definition: "Comprobante Fiscal Digital por Internet - Mexico electronic invoice" },
  { term: "OKR", definition: "Objectives and Key Results - Goal-setting framework" },
];

interface PageInfo {
  currentPage: number;
  totalPages: number;
}

// Text color constants for better contrast
const TEXT_COLORS = {
  primary: [30, 41, 59] as [number, number, number],     // Almost black - slate-800
  secondary: [51, 65, 85] as [number, number, number],   // Dark slate - slate-600
  muted: [71, 85, 105] as [number, number, number],      // slate-500 - minimum for readability
  light: [100, 116, 139] as [number, number, number],    // Only for subtle UI elements, not text
};

export async function generateProductCapabilitiesPdf(
  settings: ProductCapabilitiesPrintSettings,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: settings.layout.orientation,
    unit: "mm",
    format: settings.layout.pageSize,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const { margins } = settings.layout;
  const contentWidth = pageWidth - margins.left - margins.right;
  
  let currentSection = "";
  let tocEntries: { title: string; page: number; level: number }[] = [];
  let tocPageNumber = 0; // Track where TOC starts for two-pass rendering
  
  // Helper functions
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [79, 70, 229];
  };

  const primaryRgb = hexToRgb(settings.branding.primaryColor);
  const secondaryRgb = hexToRgb(settings.branding.secondaryColor);
  const accentRgb = hexToRgb(settings.branding.accentColor);

  const addWatermark = () => {
    if (settings.branding.watermarkType === 'none') return;
    
    let text = '';
    let opacity = settings.branding.watermarkOpacity;
    
    if (settings.branding.watermarkType === 'classification') {
      const classConfig = CLASSIFICATION_WATERMARKS[settings.document.classification];
      text = classConfig.text;
      opacity = classConfig.opacity;
    } else if (settings.branding.watermarkType === 'custom') {
      text = settings.branding.watermarkText;
    } else if (settings.branding.watermarkType === 'date-based' && settings.branding.watermarkExpiryDate) {
      text = `Valid until: ${settings.branding.watermarkExpiryDate}`;
    }
    
    if (!text) return;
    
    pdf.saveGraphicsState();
    pdf.setGState(new (pdf as any).GState({ opacity: opacity }));
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(50);
    pdf.setFont("helvetica", "bold");
    
    const textWidth = pdf.getTextWidth(text);
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    
    // Rotate and draw watermark
    pdf.text(text, centerX, centerY, { 
      align: 'center',
      angle: 45
    });
    
    pdf.restoreGraphicsState();
  };

  const addHeader = (sectionName: string, isOddPage: boolean) => {
    if (!settings.headers.includeHeaders || settings.headers.headerStyle === 'none') return;
    
    const headerY = margins.top - 10;
    
    if (settings.headers.headerStyle === 'branded') {
      // Left side: logo placeholder + document title
      pdf.setFontSize(9);
      pdf.setTextColor(...secondaryRgb);
      pdf.setFont("helvetica", "bold");
      
      if (settings.headers.useAlternatingHeaders && !isOddPage) {
        // Even page - reversed layout
        if (settings.headers.showVersionInHeader) {
          pdf.text(`v${settings.document.version}`, margins.left, headerY);
        }
        if (settings.headers.showSectionName && sectionName) {
          pdf.setFont("helvetica", "normal");
          pdf.text(sectionName, pageWidth / 2, headerY, { align: 'center' });
        }
        pdf.setFont("helvetica", "bold");
        pdf.text(settings.headers.headerContent, pageWidth - margins.right, headerY, { align: 'right' });
      } else {
        // Odd page - normal layout
        pdf.text(settings.headers.headerContent, margins.left, headerY);
        if (settings.headers.showSectionName && sectionName) {
          pdf.setFont("helvetica", "normal");
          pdf.text(sectionName, pageWidth / 2, headerY, { align: 'center' });
        }
        if (settings.headers.showVersionInHeader) {
          pdf.text(`v${settings.document.version}`, pageWidth - margins.right, headerY, { align: 'right' });
        }
      }
      
      // Accent line
      if (settings.headers.showHeaderAccentLine) {
        pdf.setDrawColor(...primaryRgb);
        pdf.setLineWidth(0.5);
        pdf.line(margins.left, headerY + 3, pageWidth - margins.right, headerY + 3);
      }
    } else {
      // Simple style
      pdf.setFontSize(8);
      pdf.setTextColor(...TEXT_COLORS.muted);
      pdf.text(settings.headers.headerContent, margins.left, headerY);
    }
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    if (!settings.headers.includeFooters) return;
    
    const footerY = pageHeight - margins.bottom + 10;
    
    // Accent line
    if (settings.headers.showFooterAccentLine) {
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margins.left, footerY - 5, pageWidth - margins.right, footerY - 5);
    }
    
    pdf.setFontSize(8);
    pdf.setTextColor(...TEXT_COLORS.muted);
    
    // Left: classification/footer content
    const classConfig = CLASSIFICATION_WATERMARKS[settings.document.classification];
    const leftText = classConfig.footerText || settings.headers.footerContent;
    pdf.text(leftText, margins.left, footerY);
    
    // Center: document ID and date
    const centerParts: string[] = [];
    if (settings.headers.showDocumentId && settings.document.documentId) {
      centerParts.push(settings.document.documentId);
    }
    if (settings.headers.showPrintDate) {
      centerParts.push(`Printed: ${format(new Date(), 'yyyy-MM-dd')}`);
    }
    if (centerParts.length > 0) {
      pdf.text(centerParts.join(' | '), pageWidth / 2, footerY, { align: 'center' });
    }
    
    // Right: page number
    if (settings.headers.includePageNumbers) {
      let pageText = '';
      if (settings.headers.pageNumberFormat === 'simple') {
        pageText = `${pageNum}`;
      } else if (settings.headers.pageNumberFormat === 'pageOf') {
        pageText = `Page ${pageNum}`;
      } else {
        pageText = `Page ${pageNum} of ${totalPages}`;
      }
      
      const x = settings.headers.pageNumberPosition === 'left' 
        ? margins.left 
        : settings.headers.pageNumberPosition === 'center'
        ? pageWidth / 2
        : pageWidth - margins.right;
      
      pdf.text(pageText, x, footerY, { 
        align: settings.headers.pageNumberPosition === 'left' ? 'left' : settings.headers.pageNumberPosition === 'center' ? 'center' : 'right' 
      });
    }
    
    // Copyright on second line
    if (settings.headers.showCopyright && settings.document.copyrightHolder) {
      pdf.setFontSize(7);
      pdf.text(
        `© ${settings.document.copyrightYear} ${settings.document.copyrightHolder}. All rights reserved.`,
        pageWidth / 2,
        footerY + 4,
        { align: 'center' }
      );
    }
  };

  const addNewPage = (sectionName: string = '') => {
    pdf.addPage();
    currentSection = sectionName;
  };

  let yPos = margins.top;

  const checkPageBreak = (requiredSpace: number, sectionName?: string): boolean => {
    if (yPos + requiredSpace > pageHeight - margins.bottom - 15) {
      addNewPage(sectionName || currentSection);
      yPos = margins.top;
      return true;
    }
    return false;
  };

  // Track pages for TOC - now stores actual page numbers
  const trackToc = (title: string, level: number) => {
    tocEntries.push({ title, page: pdf.getNumberOfPages(), level });
  };

  onProgress?.(5, "Creating cover page...");

  // ============ COVER PAGE ============
  if (settings.document.includeCover) {
    if (settings.document.coverStyle === 'branded') {
      pdf.setFillColor(...primaryRgb);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.setFont("helvetica", "bold");
      pdf.text(settings.document.title, pageWidth / 2, 80, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "normal");
      pdf.text(settings.document.subtitle, pageWidth / 2, 95, { align: 'center' });
      
      // Stats
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255, 0.8);
      const stats = EXECUTIVE_SUMMARY.stats;
      let statsX = 35;
      stats.forEach((stat) => {
        pdf.setFontSize(24);
        pdf.setTextColor(255, 255, 255);
        pdf.text(stat.value, statsX, 140, { align: 'center' });
        pdf.setFontSize(9);
        pdf.setTextColor(200, 200, 200);
        pdf.text(stat.label, statsX, 148, { align: 'center' });
        statsX += 45;
      });
      
      // Version and date
      pdf.setFontSize(10);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`Version ${settings.document.version}`, pageWidth / 2, pageHeight - 40, { align: 'center' });
      pdf.text(format(new Date(), 'MMMM yyyy'), pageWidth / 2, pageHeight - 32, { align: 'center' });
      
      // Classification badge
      if (settings.document.classification !== 'customer') {
        pdf.setFillColor(255, 255, 255, 0.2);
        const classText = settings.document.classification.toUpperCase();
        const classWidth = pdf.getTextWidth(classText) + 10;
        pdf.roundedRect((pageWidth - classWidth) / 2, pageHeight - 55, classWidth, 8, 2, 2, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.text(classText, pageWidth / 2, pageHeight - 49, { align: 'center' });
      }
    } else if (settings.document.coverStyle === 'corporate') {
      // Corporate header band
      pdf.setFillColor(...secondaryRgb);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(settings.document.copyrightHolder || 'Intelli HRM', margins.left, 25);
      
      // Title
      pdf.setTextColor(...secondaryRgb);
      pdf.setFontSize(32);
      pdf.text(settings.document.title, margins.left, 80);
      
      pdf.setFontSize(16);
      pdf.setTextColor(...TEXT_COLORS.muted);
      pdf.text(settings.document.subtitle, margins.left, 95);
      
      // Accent line
      pdf.setFillColor(...accentRgb);
      pdf.rect(0, pageHeight - 5, pageWidth, 5, 'F');
      
      // Version
      pdf.setFontSize(10);
      pdf.text(`Version ${settings.document.version} | ${format(new Date(), 'MMMM yyyy')}`, margins.left, pageHeight - 20);
    } else {
      // Minimal
      pdf.setTextColor(...primaryRgb);
      pdf.setFontSize(32);
      pdf.setFont("helvetica", "bold");
      pdf.text(settings.document.title, pageWidth / 2, 100, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(...TEXT_COLORS.secondary);
      pdf.text(settings.document.subtitle, pageWidth / 2, 115, { align: 'center' });
      
      // Accent line
      pdf.setFillColor(...primaryRgb);
      pdf.rect((pageWidth - 50) / 2, 130, 50, 2, 'F');
      
      pdf.setFontSize(10);
      pdf.text(`Version ${settings.document.version}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
    }
  }

  onProgress?.(10, "Creating document control page...");

  // ============ DOCUMENT CONTROL PAGE ============
  if (settings.document.includeDocumentControl) {
    addNewPage("Document Control");
    yPos = margins.top;
    
    pdf.setFontSize(18);
    pdf.setTextColor(...secondaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("Document Information", margins.left, yPos);
    yPos += 15;
    
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margins.left, yPos, pageWidth - margins.right, yPos);
    yPos += 10;
    
    const addControlRow = (label: string, value: string) => {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(100, 116, 139);
      pdf.text(label, margins.left, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(30, 41, 59);
      pdf.text(value, margins.left + 50, yPos);
      yPos += 7;
    };
    
    addControlRow("Document Title:", settings.document.title);
    addControlRow("Document ID:", settings.document.documentId);
    addControlRow("Version:", settings.document.version);
    addControlRow("Status:", settings.document.status.charAt(0).toUpperCase() + settings.document.status.slice(1));
    addControlRow("Classification:", settings.document.classification.charAt(0).toUpperCase() + settings.document.classification.slice(1));
    
    yPos += 10;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...secondaryRgb);
    pdf.text("Dates", margins.left, yPos);
    yPos += 10;
    
    addControlRow("Effective Date:", settings.document.effectiveDate || 'N/A');
    addControlRow("Next Review:", settings.document.reviewDate || 'N/A');
    addControlRow("Last Updated:", format(new Date(), 'yyyy-MM-dd'));
    
    yPos += 10;
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...secondaryRgb);
    pdf.text("Ownership", margins.left, yPos);
    yPos += 10;
    
    addControlRow("Document Owner:", settings.document.owner || 'N/A');
    addControlRow("Approved By:", settings.document.approver || 'N/A');
    addControlRow("Distribution:", settings.document.distribution.join(', ') || 'N/A');
    
    // Revision History
    if (settings.document.revisions.length > 0) {
      yPos += 15;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...secondaryRgb);
      pdf.text("Revision History", margins.left, yPos);
      yPos += 10;
      
      // Table header
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margins.left, yPos - 4, contentWidth, 8, 'F');
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(71, 85, 105);
      pdf.text("Version", margins.left + 3, yPos);
      pdf.text("Date", margins.left + 30, yPos);
      pdf.text("Author", margins.left + 65, yPos);
      pdf.text("Description", margins.left + 100, yPos);
      yPos += 10;
      
      pdf.setFont("helvetica", "normal");
      settings.document.revisions.forEach((rev) => {
        pdf.setTextColor(30, 41, 59);
        pdf.text(rev.version, margins.left + 3, yPos);
        pdf.text(rev.date, margins.left + 30, yPos);
        pdf.text(rev.author, margins.left + 65, yPos);
        pdf.text(rev.changes, margins.left + 100, yPos);
        yPos += 7;
      });
    }
  }

  onProgress?.(15, "Creating legal page...");

  // ============ LEGAL/DISCLAIMER PAGE ============
  if (settings.document.includeLegalPage) {
    addNewPage("Legal Notice");
    yPos = margins.top;
    
    pdf.setFontSize(16);
    pdf.setTextColor(...secondaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("Legal Notice", margins.left, yPos);
    yPos += 15;
    
    const addLegalSection = (title: string, content: string) => {
      checkPageBreak(30);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(71, 85, 105);
      pdf.text(title, margins.left, yPos);
      yPos += 7;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT_COLORS.muted);
      const lines = pdf.splitTextToSize(content, contentWidth);
      pdf.text(lines, margins.left, yPos);
      yPos += lines.length * 4 + 10;
    };
    
    addLegalSection(
      "COPYRIGHT NOTICE",
      `© ${settings.document.copyrightYear} ${settings.document.copyrightHolder || 'Intelli HRM'}. All rights reserved.`
    );
    
    addLegalSection(
      "TRADEMARKS",
      "Intelli HRM and the Intelli HRM logo are trademarks. All other trademarks mentioned are the property of their respective owners."
    );
    
    addLegalSection(
      "CONFIDENTIALITY",
      "This document contains proprietary information. Unauthorized reproduction, distribution, or disclosure is strictly prohibited."
    );
    
    addLegalSection(
      "DISCLAIMER",
      settings.document.disclaimerText
    );
    
    addLegalSection(
      "FORWARD-LOOKING STATEMENTS",
      settings.document.forwardLookingText
    );
  }

  onProgress?.(20, "Creating table of contents...");

  // ============ TABLE OF CONTENTS (reserve page - will render after content) ============
  tocPageNumber = pdf.getNumberOfPages() + 1;
  if (settings.sections.includeTableOfContents) {
    addNewPage("Table of Contents");
    // Just reserve the page - we'll render the TOC after all content is generated
  }

  onProgress?.(25, "Creating executive overview...");

  // ============ EXECUTIVE OVERVIEW ============
  if (settings.sections.includeExecutiveOverview) {
    addNewPage("Executive Overview");
    trackToc("Executive Overview", 1);
    yPos = margins.top;
    
    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(...primaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("Executive Overview", margins.left, yPos);
    yPos += 15;
    
    // Main title
    pdf.setFontSize(20);
    pdf.setTextColor(...secondaryRgb);
    pdf.text(EXECUTIVE_SUMMARY.title, margins.left, yPos);
    yPos += 8;
    
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryRgb);
    pdf.text(EXECUTIVE_SUMMARY.subtitle, margins.left, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setTextColor(...TEXT_COLORS.secondary);
    const descLines = pdf.splitTextToSize(EXECUTIVE_SUMMARY.description, contentWidth);
    pdf.text(descLines, margins.left, yPos);
    yPos += descLines.length * 5 + 10;
    
    // Stats boxes
    pdf.setFillColor(249, 250, 251);
    const statWidth = (contentWidth - 15) / 4;
    EXECUTIVE_SUMMARY.stats.forEach((stat, idx) => {
      const x = margins.left + idx * (statWidth + 5);
      pdf.roundedRect(x, yPos, statWidth, 25, 2, 2, 'F');
      
      pdf.setFontSize(18);
      pdf.setTextColor(...primaryRgb);
      pdf.setFont("helvetica", "bold");
      pdf.text(stat.value, x + statWidth / 2, yPos + 12, { align: 'center' });
      
      pdf.setFontSize(8);
      pdf.setTextColor(...TEXT_COLORS.muted);
      pdf.setFont("helvetica", "normal");
      pdf.text(stat.label, x + statWidth / 2, yPos + 20, { align: 'center' });
    });
    yPos += 35;
    
    // Value propositions
    pdf.setFontSize(14);
    pdf.setTextColor(...secondaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("Value Proposition", margins.left, yPos);
    yPos += 10;
    
    EXECUTIVE_SUMMARY.valueProps.forEach((prop) => {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...TEXT_COLORS.primary);
      pdf.text(`* ${prop.title}`, margins.left + 3, yPos);
      yPos += 6;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT_COLORS.secondary);
      const propLines = pdf.splitTextToSize(prop.description, contentWidth - 10);
      pdf.text(propLines, margins.left + 8, yPos);
      yPos += propLines.length * 4 + 5;
    });
    
    yPos += 10;
    
    // Key differentiators
    pdf.setFontSize(14);
    pdf.setTextColor(...secondaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("Key Differentiators", margins.left, yPos);
    yPos += 10;
    
    EXECUTIVE_SUMMARY.differentiators.forEach((diff) => {
      checkPageBreak(8);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...TEXT_COLORS.secondary);
      pdf.text(`- ${diff}`, margins.left + 3, yPos);
      yPos += 6;
    });
  }

  onProgress?.(35, "Creating platform overview...");

  // ============ PLATFORM AT A GLANCE ============
  if (settings.sections.includePlatformAtGlance) {
    addNewPage("Platform at a Glance");
    trackToc("Platform at a Glance", 1);
    yPos = margins.top;
    
    pdf.setFontSize(20);
    pdf.setTextColor(...secondaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("Platform at a Glance", margins.left, yPos);
    yPos += 15;
    
    pdf.setFontSize(10);
    pdf.setTextColor(...TEXT_COLORS.muted);
    pdf.setFont("helvetica", "normal");
    pdf.text("25 integrated modules delivering 1,675+ capabilities across the complete employee lifecycle.", margins.left, yPos);
    yPos += 15;
    
    // Module grid - 4 columns
    const colWidth = (contentWidth - 15) / 4;
    let colIdx = 0;
    let rowY = yPos;
    
    const allModules: { title: string; badge: string; actColor: [number, number, number] }[] = [];
    CAPABILITIES_DATA.forEach((act) => {
      const color = ACT_COLORS[act.id] || [100, 116, 139];
      act.modules.forEach((mod) => {
        allModules.push({ title: mod.title, badge: mod.badge || '', actColor: color });
      });
    });
    
    allModules.forEach((mod, idx) => {
      if (colIdx === 0 && idx > 0) {
        rowY += 22;
        if (rowY > pageHeight - margins.bottom - 30) {
          addNewPage("Platform at a Glance");
          rowY = margins.top;
        }
      }
      
      const x = margins.left + colIdx * (colWidth + 5);
      
      // Module card
      pdf.setFillColor(249, 250, 251);
      pdf.roundedRect(x, rowY, colWidth, 18, 2, 2, 'F');
      
      // Color accent
      pdf.setFillColor(...mod.actColor);
      pdf.rect(x, rowY, 3, 18, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 41, 59);
      pdf.text(mod.title, x + 6, rowY + 7);
      
      if (mod.badge) {
        pdf.setFontSize(7);
        pdf.setTextColor(...mod.actColor);
        pdf.text(mod.badge, x + 6, rowY + 13);
      }
      
      colIdx = (colIdx + 1) % 4;
    });
  }

  onProgress?.(45, "Creating module pages...");

  // ============ MODULE PAGES ============
  if (settings.sections.includeModuleDetails) {
    for (let actIdx = 0; actIdx < CAPABILITIES_DATA.length; actIdx++) {
      const act = CAPABILITIES_DATA[actIdx];
      const actColor = ACT_COLORS[act.id] || [100, 116, 139];
      
      // Act divider page
      if (settings.sections.includeActDividers) {
        addNewPage(act.title);
        trackToc(act.title, 1);
        
        // Full-width colored header
        pdf.setFillColor(...actColor);
        pdf.rect(0, 0, pageWidth, 60, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "normal");
        const actLabel = act.id === 'prologue' ? 'PROLOGUE' : 
                         act.id === 'epilogue' ? 'EPILOGUE' : 
                         act.id.replace('act', 'ACT ').toUpperCase();
        pdf.text(actLabel, margins.left, 25);
        
        pdf.setFontSize(28);
        pdf.setFont("helvetica", "bold");
        const actTitle = act.title.split(':')[1]?.trim() || act.title;
        pdf.text(actTitle, margins.left, 42);
        
        yPos = 75;
        
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "italic");
        pdf.text(act.subtitle, margins.left, yPos);
        yPos += 20;
        
        // List modules in this act
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...secondaryRgb);
        pdf.text("Modules in this Act:", margins.left, yPos);
        yPos += 10;
        
        act.modules.forEach((mod) => {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(71, 85, 105);
          pdf.text(`• ${mod.title} ${mod.badge ? `(${mod.badge})` : ''}`, margins.left + 5, yPos);
          yPos += 7;
        });
      }
      
      // Individual module pages
      for (const module of act.modules) {
        if (settings.sections.moduleStartsNewPage) {
          addNewPage(module.title);
        } else {
          checkPageBreak(100, module.title);
        }
        trackToc(module.title, 2);
        
        // Module header
        pdf.setFillColor(249, 250, 251);
        pdf.roundedRect(margins.left - 2, yPos - 5, contentWidth + 4, 30, 2, 2, 'F');
        
        // Color accent bar
        pdf.setFillColor(...actColor);
        pdf.rect(margins.left - 2, yPos - 5, 4, 30, 'F');
        
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(30, 41, 59);
        pdf.text(module.title, margins.left + 5, yPos + 5);
        
        // Badge
        if (module.badge) {
          const titleWidth = pdf.getTextWidth(module.title);
          pdf.setFillColor(...actColor);
          const badgeWidth = pdf.getTextWidth(module.badge) + 8;
          pdf.roundedRect(margins.left + 5 + titleWidth + 5, yPos - 1, badgeWidth, 8, 2, 2, 'F');
          pdf.setFontSize(7);
          pdf.setTextColor(255, 255, 255);
          pdf.text(module.badge, margins.left + 5 + titleWidth + 9, yPos + 4);
        }
        
        // Tagline
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(10);
        pdf.setTextColor(...actColor);
        pdf.text(module.tagline, margins.left + 5, yPos + 15);
        
        // Overview
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(...TEXT_COLORS.secondary);
        const overviewLines = pdf.splitTextToSize(module.overview, contentWidth - 10);
        pdf.text(overviewLines, margins.left + 5, yPos + 23);
        yPos += 35 + overviewLines.length * 4;
        
        // Challenge & Promise Section (NEW)
        if (module.challenge && module.promise) {
          checkPageBreak(50, module.title);
          
          // Challenge box
          pdf.setFillColor(254, 242, 242); // red-50
          pdf.setDrawColor(239, 68, 68); // red-500
          pdf.setLineWidth(0.3);
          pdf.roundedRect(margins.left - 2, yPos - 3, contentWidth + 4, 22, 2, 2, 'FD');
          
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(220, 38, 38); // red-600
          pdf.text("THE CHALLENGE", margins.left + 2, yPos + 3);
          
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(8);
          pdf.setTextColor(127, 29, 29); // red-900
          const challengeLines = pdf.splitTextToSize(`"${module.challenge}"`, contentWidth - 6);
          pdf.text(challengeLines.slice(0, 2), margins.left + 2, yPos + 9);
          yPos += 26;
          
          // Promise box
          pdf.setFillColor(239, 246, 255); // blue-50
          pdf.setDrawColor(59, 130, 246); // blue-500
          pdf.roundedRect(margins.left - 2, yPos - 3, contentWidth + 4, 22, 2, 2, 'FD');
          
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(37, 99, 235); // blue-600
          pdf.text("THE PROMISE", margins.left + 2, yPos + 3);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          pdf.setTextColor(30, 64, 175); // blue-800
          const promiseLines = pdf.splitTextToSize(module.promise, contentWidth - 6);
          pdf.text(promiseLines.slice(0, 2), margins.left + 2, yPos + 9);
          yPos += 28;
        }
        
        // Key Outcomes Section (NEW)
        if (module.keyOutcomes && module.keyOutcomes.length > 0) {
          checkPageBreak(25, module.title);
          
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...TEXT_COLORS.primary);
          pdf.text("Key Outcomes", margins.left, yPos);
          yPos += 6;
          
          const outcomeWidth = (contentWidth - 9) / 4;
          module.keyOutcomes.slice(0, 4).forEach((outcome, idx) => {
            const x = margins.left + idx * (outcomeWidth + 3);
            
            pdf.setFillColor(249, 250, 251);
            pdf.roundedRect(x, yPos - 2, outcomeWidth, 16, 1, 1, 'F');
            
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(...actColor);
            pdf.text(outcome.value, x + 2, yPos + 5);
            
            pdf.setFontSize(7);
            pdf.setTextColor(...TEXT_COLORS.primary);
            pdf.text(outcome.label, x + 2, yPos + 10);
          });
          yPos += 22;
        }
        
        // Personas Section (NEW) - compact version
        if (module.personas && module.personas.length > 0) {
          checkPageBreak(20, module.title);
          
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...TEXT_COLORS.primary);
          pdf.text("Who Benefits", margins.left, yPos);
          yPos += 5;
          
          const personaWidth = (contentWidth - 9) / 4;
          module.personas.slice(0, 4).forEach((persona, idx) => {
            const x = margins.left + idx * (personaWidth + 3);
            
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(...TEXT_COLORS.primary);
            pdf.text(persona.persona, x, yPos + 4);
            
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(7);
            pdf.setTextColor(...TEXT_COLORS.secondary);
            const benefitText = persona.benefit.length > 30 ? persona.benefit.substring(0, 27) + '...' : persona.benefit;
            pdf.text(`"${benefitText}"`, x, yPos + 9);
          });
          yPos += 15;
        }
        
        // Categories in 2-column layout
        const colWidth = (contentWidth - 10) / 2;
        const categories = module.categories;
        
        for (let i = 0; i < categories.length; i += 2) {
          const leftCat = categories[i];
          const rightCat = categories[i + 1];
          
          const leftHeight = 8 + Math.min(leftCat?.items.length || 0, 5) * 4;
          const rightHeight = rightCat ? 8 + Math.min(rightCat.items.length, 5) * 4 : 0;
          const rowHeight = Math.max(leftHeight, rightHeight) + 5;
          
          checkPageBreak(rowHeight, module.title);
          
          // Left column
          if (leftCat) {
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(30, 41, 59);
            pdf.text(leftCat.title, margins.left, yPos);
            
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(...TEXT_COLORS.secondary);
            leftCat.items.slice(0, 5).forEach((item, idx) => {
              const itemText = item.length > 60 ? item.substring(0, 57) + '...' : item;
              pdf.text(`- ${itemText}`, margins.left + 3, yPos + 5 + idx * 4);
            });
            if (leftCat.items.length > 5) {
              pdf.setTextColor(...TEXT_COLORS.muted);
              pdf.text(`  +${leftCat.items.length - 5} more...`, margins.left + 3, yPos + 5 + 5 * 4);
            }
          }
          
          // Right column
          if (rightCat) {
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(30, 41, 59);
            pdf.text(rightCat.title, margins.left + colWidth + 10, yPos);
            
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(...TEXT_COLORS.secondary);
            rightCat.items.slice(0, 5).forEach((item, idx) => {
              const itemText = item.length > 55 ? item.substring(0, 52) + '...' : item;
              pdf.text(`- ${itemText}`, margins.left + colWidth + 13, yPos + 5 + idx * 4);
            });
            if (rightCat.items.length > 5) {
              pdf.setTextColor(...TEXT_COLORS.muted);
              pdf.text(`  +${rightCat.items.length - 5} more...`, margins.left + colWidth + 13, yPos + 5 + 5 * 4);
            }
          }
          
          yPos += rowHeight;
        }
        
        yPos += 5;
        
        // AI Capabilities box
        if (module.aiCapabilities.length > 0) {
          const aiHeight = 14 + Math.min(module.aiCapabilities.length, 4) * 5;
          checkPageBreak(aiHeight, module.title);
          
          pdf.setFillColor(250, 245, 255);
          pdf.setDrawColor(168, 85, 247);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(margins.left - 2, yPos - 3, contentWidth + 4, aiHeight, 2, 2, 'FD');
          
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(168, 85, 247);
          pdf.text("AI-Powered Intelligence", margins.left + 2, yPos + 5);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          module.aiCapabilities.slice(0, 4).forEach((ai, idx) => {
            pdf.setTextColor(168, 85, 247);
            pdf.text(`${ai.type}:`, margins.left + 5, yPos + 12 + idx * 5);
            pdf.setTextColor(71, 85, 105);
            const descWidth = contentWidth - pdf.getTextWidth(ai.type + ": ") - 15;
            const desc = ai.description.length > 70 ? ai.description.substring(0, 67) + '...' : ai.description;
            pdf.text(desc, margins.left + 5 + pdf.getTextWidth(ai.type + ": ") + 2, yPos + 12 + idx * 5);
          });
          
          yPos += aiHeight + 5;
        }
        
        // Integrations box
        if (module.integrations.length > 0) {
          const intHeight = 14 + Math.min(module.integrations.length, 4) * 5;
          checkPageBreak(intHeight, module.title);
          
          pdf.setFillColor(240, 253, 244);
          pdf.setDrawColor(34, 197, 94);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(margins.left - 2, yPos - 3, contentWidth + 4, intHeight, 2, 2, 'FD');
          
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(34, 197, 94);
          pdf.text("Cross-Module Integration", margins.left + 2, yPos + 5);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(8);
          module.integrations.slice(0, 4).forEach((int, idx) => {
            pdf.setTextColor(34, 197, 94);
            pdf.text(int.module, margins.left + 5, yPos + 12 + idx * 5);
            pdf.setTextColor(71, 85, 105);
            const desc = int.description.length > 60 ? int.description.substring(0, 57) + '...' : int.description;
            pdf.text(`- ${desc}`, margins.left + 5 + pdf.getTextWidth(int.module + "  "), yPos + 12 + idx * 5);
          });
          
          yPos += intHeight + 5;
        }
        
        // Regional Advantage box (NEW - replaces regionalNote)
        if (module.regionalAdvantage && module.regionalAdvantage.advantages.length > 0) {
          const raHeight = 16 + Math.min(module.regionalAdvantage.advantages.length, 4) * 4;
          checkPageBreak(raHeight, module.title);
          
          pdf.setFillColor(239, 246, 255); // blue-50
          pdf.setDrawColor(59, 130, 246); // blue-500
          pdf.setLineWidth(0.3);
          pdf.roundedRect(margins.left - 2, yPos - 3, contentWidth + 4, raHeight, 2, 2, 'FD');
          
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(59, 130, 246);
          pdf.text("Regional Advantage", margins.left + 2, yPos + 4);
          
          // Region badges
          pdf.setFontSize(7);
          let badgeX = margins.left + 45;
          module.regionalAdvantage.regions.forEach((region) => {
            const badgeWidth = pdf.getTextWidth(region) + 6;
            pdf.setFillColor(219, 234, 254); // blue-100
            pdf.roundedRect(badgeX, yPos - 1, badgeWidth, 6, 1, 1, 'F');
            pdf.setTextColor(30, 64, 175);
            pdf.text(region, badgeX + 3, yPos + 3);
            badgeX += badgeWidth + 3;
          });
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.setTextColor(30, 64, 175);
          module.regionalAdvantage.advantages.slice(0, 4).forEach((adv, idx) => {
            const advText = adv.length > 80 ? adv.substring(0, 77) + '...' : adv;
            pdf.text(`- ${advText}`, margins.left + 4, yPos + 10 + idx * 4);
          });
          
          yPos += raHeight + 5;
        } else if (module.regionalNote) {
          // Fallback to old regionalNote if no regionalAdvantage
          checkPageBreak(15, module.title);
          pdf.setFillColor(239, 246, 255);
          pdf.setDrawColor(59, 130, 246);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(margins.left - 2, yPos - 3, contentWidth + 4, 12, 2, 2, 'FD');
          
          pdf.setFontSize(8);
          pdf.setTextColor(59, 130, 246);
          pdf.text(`Regional Compliance: ${module.regionalNote}`, margins.left + 2, yPos + 4);
          yPos += 18;
        }
        }
        
        yPos += 10;
      }
      
      onProgress?.(45 + (actIdx + 1) * 5, `Processed ${act.title}...`);
    }
  }

  onProgress?.(80, "Creating cross-cutting capabilities...");

  // ============ CROSS-CUTTING CAPABILITIES ============
  if (settings.sections.includeCrossCutting) {
    // Platform Features
    addNewPage("Platform Features");
    trackToc("Platform Features", 1);
    
    pdf.setFillColor(...accentRgb);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Platform Features", margins.left, 25);
    yPos = 50;
    
    PLATFORM_FEATURES.categories.forEach((cat) => {
      checkPageBreak(35, "Platform Features");
      pdf.setFontSize(12);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "bold");
      pdf.text(cat.title, margins.left, yPos);
      yPos += 6;
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...TEXT_COLORS.secondary);
      cat.features.forEach((f) => {
        checkPageBreak(6, "Platform Features");
        pdf.text(`  * ${f}`, margins.left + 3, yPos);
        yPos += 4;
      });
      yPos += 6;
    });
    
    // Regional Compliance
    addNewPage("Regional Compliance");
    trackToc("Regional Compliance", 1);
    
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Regional Compliance", margins.left, 25);
    yPos = 50;
    
    REGIONAL_COMPLIANCE.regions.forEach((region) => {
      checkPageBreak(45, "Regional Compliance");
      pdf.setFontSize(14);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "bold");
      pdf.text(region.name, margins.left, yPos);
      
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT_COLORS.muted);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Countries: ${region.countries.join(", ")}`, margins.left, yPos + 6);
      yPos += 14;
      
      pdf.setFontSize(8);
      pdf.setTextColor(...TEXT_COLORS.secondary);
      region.highlights.forEach((h) => {
        checkPageBreak(6, "Regional Compliance");
        pdf.text(`  * ${h}`, margins.left + 3, yPos);
        yPos += 4;
      });
      yPos += 10;
    });
    
    // AI Intelligence
    addNewPage("AI Intelligence");
    trackToc("AI Intelligence", 1);
    
    pdf.setFillColor(168, 85, 247);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("AI Intelligence", margins.left, 25);
    yPos = 50;
    
    AI_INTELLIGENCE.capabilities.forEach((cap) => {
      checkPageBreak(40, "AI Intelligence");
      pdf.setFontSize(12);
      pdf.setTextColor(30, 41, 59);
      pdf.setFont("helvetica", "bold");
      pdf.text(cap.title, margins.left, yPos);
      
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT_COLORS.muted);
      pdf.setFont("helvetica", "italic");
      pdf.text(cap.description, margins.left, yPos + 6);
      yPos += 14;
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...TEXT_COLORS.secondary);
      cap.examples.forEach((ex) => {
        checkPageBreak(6, "AI Intelligence");
        pdf.text(`  * ${ex}`, margins.left + 3, yPos);
        yPos += 4;
      });
      yPos += 8;
    });
  }

  onProgress?.(88, "Creating back matter...");

  // ============ GLOSSARY ============
  if (settings.sections.includeGlossary) {
    addNewPage("Glossary");
    trackToc("Glossary of Terms", 1);
    
    pdf.setFontSize(18);
    pdf.setTextColor(...secondaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("Glossary of Terms", margins.left, margins.top);
    yPos = margins.top + 15;
    
    GLOSSARY_TERMS.forEach((item) => {
      checkPageBreak(12, "Glossary");
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...TEXT_COLORS.primary);
      pdf.text(item.term, margins.left, yPos);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...TEXT_COLORS.secondary);
      const defLines = pdf.splitTextToSize(item.definition, contentWidth - 30);
      pdf.text(defLines, margins.left + 30, yPos);
      yPos += defLines.length * 4 + 4;
    });
  }

  // ============ QUICK REFERENCE CARD ============
  if (settings.sections.includeQuickReference) {
    addNewPage("Quick Reference");
    trackToc("Quick Reference Card", 1);
    
    // Border
    pdf.setDrawColor(...primaryRgb);
    pdf.setLineWidth(1);
    pdf.rect(margins.left - 5, margins.top - 5, contentWidth + 10, pageHeight - margins.top - margins.bottom + 10);
    
    pdf.setFontSize(16);
    pdf.setTextColor(...primaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("INTELLI HRM QUICK REFERENCE", pageWidth / 2, margins.top + 5, { align: 'center' });
    yPos = margins.top + 20;
    
    // Module grid
    const qrColWidth = (contentWidth - 10) / 4;
    let qrColIdx = 0;
    let qrRowY = yPos;
    
    const allMods = CAPABILITIES_DATA.flatMap(act => act.modules.map(m => m.title));
    allMods.forEach((modTitle, idx) => {
      if (qrColIdx === 0 && idx > 0) {
        qrRowY += 10;
      }
      
      const x = margins.left + qrColIdx * (qrColWidth + 3);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...TEXT_COLORS.secondary);
      pdf.text(`* ${modTitle}`, x, qrRowY);
      
      qrColIdx = (qrColIdx + 1) % 4;
    });
    
    yPos = qrRowY + 25;
    
    // Key statistics
    pdf.setFontSize(12);
    pdf.setTextColor(...secondaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("KEY STATISTICS", margins.left, yPos);
    yPos += 10;
    
    EXECUTIVE_SUMMARY.stats.forEach((stat) => {
      pdf.setFontSize(10);
      pdf.setTextColor(...primaryRgb);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${stat.value}`, margins.left + 5, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...TEXT_COLORS.secondary);
      pdf.text(stat.label, margins.left + 35, yPos);
      yPos += 7;
    });
    
    // Contact info placeholder
    yPos = pageHeight - margins.bottom - 20;
    pdf.setFontSize(9);
    pdf.setTextColor(...TEXT_COLORS.muted);
    pdf.text("For more information: docs.intellihrm.com", pageWidth / 2, yPos, { align: 'center' });
  }

  onProgress?.(92, "Rendering table of contents...");

  // ============ TWO-PASS TOC RENDERING ============
  // Now that all content is generated, go back and render the TOC with correct page numbers
  if (settings.sections.includeTableOfContents && tocPageNumber > 0) {
    pdf.setPage(tocPageNumber);
    let tocY = margins.top;
    
    pdf.setFontSize(18);
    pdf.setTextColor(...secondaryRgb);
    pdf.setFont("helvetica", "bold");
    pdf.text("Table of Contents", margins.left, tocY);
    tocY += 15;
    
    // Render TOC with actual page numbers
    tocEntries.forEach((entry) => {
      const indent = (entry.level - 1) * 8;
      pdf.setFontSize(entry.level === 1 ? 11 : 10);
      pdf.setFont("helvetica", entry.level === 1 ? "bold" : "normal");
      pdf.setTextColor(
        entry.level === 1 ? TEXT_COLORS.primary[0] : TEXT_COLORS.secondary[0],
        entry.level === 1 ? TEXT_COLORS.primary[1] : TEXT_COLORS.secondary[1],
        entry.level === 1 ? TEXT_COLORS.primary[2] : TEXT_COLORS.secondary[2]
      );
      
      const titleX = margins.left + indent;
      const maxTitleWidth = contentWidth - indent - 15;
      const truncatedTitle = entry.title.length > 50 ? entry.title.substring(0, 47) + '...' : entry.title;
      pdf.text(truncatedTitle, titleX, tocY);
      
      // Page number
      pdf.setTextColor(...TEXT_COLORS.muted);
      pdf.text(`${entry.page}`, pageWidth - margins.right, tocY, { align: 'right' });
      tocY += 6;
    });
  }

  onProgress?.(95, "Applying headers and footers...");

  // ============ APPLY HEADERS, FOOTERS, WATERMARKS TO ALL PAGES ============
  const totalPages = pdf.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Skip cover page for headers/footers
    if (i === 1 && settings.document.includeCover) {
      addWatermark();
      continue;
    }
    
    const isOddPage = i % 2 === 1;
    addHeader(currentSection, isOddPage);
    addFooter(i, totalPages);
    addWatermark();
  }

  onProgress?.(100, "PDF generation complete!");

  return pdf.output('blob');
}

export async function downloadProductCapabilitiesPdf(
  settings: ProductCapabilitiesPrintSettings,
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  const blob = await generateProductCapabilitiesPdf(settings, onProgress);
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Intelli-HRM-Product-Capabilities-${settings.document.version}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function printProductCapabilitiesPdf(
  settings: ProductCapabilitiesPrintSettings,
  onProgress?: (progress: number, message: string) => void
): Promise<void> {
  const blob = await generateProductCapabilitiesPdf(settings, onProgress);
  
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
