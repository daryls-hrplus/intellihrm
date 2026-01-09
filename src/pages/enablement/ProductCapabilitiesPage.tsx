import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  FileText,
  Download,
  Menu,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { ProductCapabilitiesDocument } from "@/components/enablement/product-capabilities/ProductCapabilitiesDocument";
import { TableOfContents, PRODUCT_CAPABILITIES_TOC } from "@/components/enablement/product-capabilities/components/TableOfContents";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { 
  EXECUTIVE_SUMMARY, 
  CAPABILITIES_DATA, 
  PLATFORM_FEATURES, 
  REGIONAL_COMPLIANCE, 
  AI_INTELLIGENCE 
} from "@/components/enablement/product-capabilities/data/capabilitiesData";

export default function ProductCapabilitiesPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("executive-overview");
  const [isExporting, setIsExporting] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    toast.info("Generating comprehensive PDF...", { description: "This may take a moment." });

    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Title Page
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.text(EXECUTIVE_SUMMARY.title, pageWidth / 2, 70, { align: "center" });
      pdf.setFontSize(20);
      pdf.text(EXECUTIVE_SUMMARY.subtitle, pageWidth / 2, 85, { align: "center" });
      pdf.setFontSize(12);
      pdf.setTextColor(148, 163, 184);
      pdf.text(EXECUTIVE_SUMMARY.description, pageWidth / 2, 105, { align: "center", maxWidth: 160 });
      
      // Stats
      let statsX = 30;
      EXECUTIVE_SUMMARY.stats.forEach((stat) => {
        pdf.setTextColor(99, 102, 241);
        pdf.setFontSize(24);
        pdf.text(stat.value, statsX, 150, { align: "center" });
        pdf.setTextColor(148, 163, 184);
        pdf.setFontSize(10);
        pdf.text(stat.label, statsX, 158, { align: "center" });
        statsX += 45;
      });

      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 20, { align: "center" });

      // Executive Summary Page
      pdf.addPage();
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      yPos = margin;
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(18);
      pdf.text("Executive Overview", margin, yPos);
      yPos += 12;

      pdf.setFontSize(11);
      pdf.setTextColor(79, 70, 229);
      pdf.text("Value Proposition", margin, yPos);
      yPos += 8;

      EXECUTIVE_SUMMARY.valueProps.forEach((prop) => {
        checkPageBreak(20);
        pdf.setFontSize(10);
        pdf.setTextColor(15, 23, 42);
        pdf.text(`• ${prop.title}`, margin + 3, yPos);
        yPos += 5;
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(9);
        const lines = pdf.splitTextToSize(prop.description, contentWidth - 10);
        pdf.text(lines, margin + 6, yPos);
        yPos += lines.length * 4 + 4;
      });

      yPos += 5;
      pdf.setFontSize(11);
      pdf.setTextColor(79, 70, 229);
      pdf.text("Enterprise Benchmarks", margin, yPos);
      yPos += 6;
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      EXECUTIVE_SUMMARY.benchmarks.forEach((b) => {
        pdf.text(`- ${b}`, margin + 3, yPos);
        yPos += 5;
      });

      // Module pages
      CAPABILITIES_DATA.forEach((act) => {
        act.modules.forEach((module) => {
          pdf.addPage();
          yPos = margin;
          
          // Module header box
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin - 5, yPos - 5, contentWidth + 10, 28, "F");
          pdf.setDrawColor(act.color[0], act.color[1], act.color[2]);
          pdf.setLineWidth(0.5);
          pdf.line(margin - 5, yPos - 5, margin - 5, yPos + 23);
          
          // Module title with badge
          pdf.setTextColor(15, 23, 42);
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.text(module.title, margin, yPos + 5);
          
          if (module.badge) {
            const titleWidth = pdf.getTextWidth(module.title);
            pdf.setFillColor(99, 102, 241);
            pdf.roundedRect(margin + titleWidth + 5, yPos - 1, 28, 8, 2, 2, "F");
            pdf.setFontSize(7);
            pdf.setTextColor(255, 255, 255);
            pdf.text(module.badge, margin + titleWidth + 8, yPos + 5);
          }
          
          // Tagline
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(10);
          pdf.setTextColor(act.color[0], act.color[1], act.color[2]);
          pdf.text(module.tagline, margin, yPos + 14);
          
          // Overview
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(100, 116, 139);
          const overviewLines = pdf.splitTextToSize(module.overview, contentWidth);
          pdf.text(overviewLines, margin, yPos + 22);
          yPos += 28 + overviewLines.length * 4;

          // Categories in 2-column layout
          const colWidth = (contentWidth - 10) / 2;
          const categories = module.categories;
          
          for (let i = 0; i < categories.length; i += 2) {
            const leftCat = categories[i];
            const rightCat = categories[i + 1];
            
            // Calculate max height needed for this row
            const leftHeight = 8 + (leftCat?.items.length || 0) * 4;
            const rightHeight = rightCat ? 8 + rightCat.items.length * 4 : 0;
            const rowHeight = Math.max(leftHeight, rightHeight) + 5;
            
            checkPageBreak(rowHeight);
            
            // Left column
            if (leftCat) {
              pdf.setFontSize(10);
              pdf.setFont("helvetica", "bold");
              pdf.setTextColor(15, 23, 42);
              pdf.text(leftCat.title, margin, yPos);
              
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(8);
              pdf.setTextColor(71, 85, 105);
              leftCat.items.forEach((item, idx) => {
                pdf.text(`> ${item}`, margin + 3, yPos + 5 + idx * 4);
              });
            }
            
            // Right column
            if (rightCat) {
              pdf.setFontSize(10);
              pdf.setFont("helvetica", "bold");
              pdf.setTextColor(15, 23, 42);
              pdf.text(rightCat.title, margin + colWidth + 10, yPos);
              
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(8);
              pdf.setTextColor(71, 85, 105);
              rightCat.items.forEach((item, idx) => {
                pdf.text(`> ${item}`, margin + colWidth + 13, yPos + 5 + idx * 4);
              });
            }
            
            yPos += rowHeight;
          }

          yPos += 5;

          // AI Capabilities box
          if (module.aiCapabilities.length > 0) {
            const aiHeight = 12 + module.aiCapabilities.length * 5;
            checkPageBreak(aiHeight);
            
            pdf.setFillColor(250, 245, 255);
            pdf.setDrawColor(168, 85, 247);
            pdf.setLineWidth(0.3);
            pdf.roundedRect(margin - 2, yPos - 3, contentWidth + 4, aiHeight, 2, 2, "FD");
            
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(168, 85, 247);
            pdf.text("AI-Powered Intelligence", margin + 2, yPos + 4);
            
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            module.aiCapabilities.forEach((ai, idx) => {
              pdf.setTextColor(168, 85, 247);
              pdf.text(`${ai.type}:`, margin + 5, yPos + 11 + idx * 5);
              pdf.setTextColor(71, 85, 105);
              pdf.text(ai.description, margin + 5 + pdf.getTextWidth(ai.type + ": "), yPos + 11 + idx * 5);
            });
            
            yPos += aiHeight + 5;
          }

          // Integrations box
          if (module.integrations.length > 0) {
            const intHeight = 12 + module.integrations.length * 5;
            checkPageBreak(intHeight);
            
            pdf.setFillColor(240, 253, 244);
            pdf.setDrawColor(34, 197, 94);
            pdf.setLineWidth(0.3);
            pdf.roundedRect(margin - 2, yPos - 3, contentWidth + 4, intHeight, 2, 2, "FD");
            
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(34, 197, 94);
            pdf.text("Cross-Module Integration", margin + 2, yPos + 4);
            
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            module.integrations.forEach((int, idx) => {
              pdf.setTextColor(34, 197, 94);
              pdf.text(int.module, margin + 5, yPos + 11 + idx * 5);
              pdf.setTextColor(71, 85, 105);
              pdf.text(int.description, margin + 5 + pdf.getTextWidth(int.module + "  "), yPos + 11 + idx * 5);
            });
            
            yPos += intHeight + 5;
          }

          // Regional note
          if (module.regionalNote) {
            checkPageBreak(12);
            pdf.setFillColor(239, 246, 255);
            pdf.setDrawColor(59, 130, 246);
            pdf.setLineWidth(0.3);
            pdf.roundedRect(margin - 2, yPos - 3, contentWidth + 4, 10, 2, 2, "FD");
            
            pdf.setFontSize(8);
            pdf.setTextColor(59, 130, 246);
            pdf.text(`Regional Compliance: ${module.regionalNote}`, margin + 2, yPos + 3);
            yPos += 15;
          }

          // Footer with act info
          pdf.setFontSize(7);
          pdf.setTextColor(150, 150, 150);
          pdf.text(`${act.title} | ${module.title}`, margin, pageHeight - 10);
          pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth - margin - 15, pageHeight - 10);
        });
      });

      // Platform Features page
      pdf.addPage();
      pdf.setFillColor(20, 184, 166);
      pdf.rect(0, 0, pageWidth, 35, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text("Platform Features", margin, 22);
      yPos = 45;

      PLATFORM_FEATURES.categories.forEach((cat) => {
        checkPageBreak(30);
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42);
        pdf.text(cat.title, margin, yPos);
        yPos += 5;
        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105);
        cat.features.forEach((f) => {
          pdf.text(`  • ${f}`, margin + 3, yPos);
          yPos += 4;
        });
        yPos += 5;
      });

      // Regional Compliance
      pdf.addPage();
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 35, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text("Regional Compliance", margin, 22);
      yPos = 45;

      REGIONAL_COMPLIANCE.regions.forEach((region) => {
        checkPageBreak(40);
        pdf.setFontSize(12);
        pdf.setTextColor(15, 23, 42);
        pdf.text(region.name, margin, yPos);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Countries: ${region.countries.join(", ")}`, margin, yPos + 5);
        yPos += 12;
        pdf.setTextColor(71, 85, 105);
        region.highlights.forEach((h) => {
          pdf.text(`  - ${h}`, margin + 3, yPos);
          yPos += 4;
        });
        yPos += 8;
      });

      // AI Intelligence
      pdf.addPage();
      pdf.setFillColor(168, 85, 247);
      pdf.rect(0, 0, pageWidth, 35, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text("AI Intelligence", margin, 22);
      yPos = 45;

      AI_INTELLIGENCE.capabilities.forEach((cap) => {
        checkPageBreak(35);
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42);
        pdf.text(cap.title, margin, yPos);
        pdf.setFontSize(9);
        pdf.setTextColor(100, 116, 139);
        pdf.text(cap.description, margin, yPos + 5);
        yPos += 12;
        pdf.setFontSize(8);
        pdf.setTextColor(71, 85, 105);
        cap.examples.forEach((ex) => {
          pdf.text(`  - ${ex}`, margin + 3, yPos);
          yPos += 4;
        });
        yPos += 6;
      });

      const fileName = `Intelli-HRM-Product-Capabilities-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
      toast.success("PDF exported successfully!", { description: fileName });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF", { description: "Please try again." });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="container mx-auto py-4">
            <Breadcrumbs
              items={[
                { label: "Enablement", href: "/enablement" },
                { label: "Product Capabilities" },
              ]}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/enablement")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <FileText className="h-7 w-7 text-primary" />
                    Product Capabilities Document
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guide to Intelli HRM's 18 modules and 500+ capabilities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile TOC */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="p-4 border-b">
                      <h2 className="font-semibold">Table of Contents</h2>
                    </div>
                    <TableOfContents
                      sections={PRODUCT_CAPABILITIES_TOC}
                      activeSection={activeSection}
                      onNavigate={handleNavigate}
                    />
                  </SheetContent>
                </Sheet>
                
                <Button onClick={handleExportPDF} disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop TOC Sidebar */}
          <aside className="hidden lg:block w-72 border-r bg-muted/30">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-sm">Table of Contents</h2>
            </div>
            <TableOfContents
              sections={PRODUCT_CAPABILITIES_TOC}
              activeSection={activeSection}
              onNavigate={handleNavigate}
            />
          </aside>

          {/* Document Content */}
          <main className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div ref={documentRef} className="container max-w-5xl mx-auto py-8 px-4 lg:px-8">
                <ProductCapabilitiesDocument />
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
