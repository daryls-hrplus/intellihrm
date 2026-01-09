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
        pdf.addPage();
        // Act header
        pdf.setFillColor(act.color[0], act.color[1], act.color[2]);
        pdf.rect(0, 0, pageWidth, 35, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.text(act.title, margin, 22);
        pdf.setFontSize(11);
        pdf.text(act.subtitle, margin, 30);
        yPos = 45;

        act.modules.forEach((module) => {
          checkPageBreak(60);
          
          // Module header
          pdf.setFillColor(245, 245, 250);
          pdf.rect(margin - 2, yPos - 5, contentWidth + 4, 20, "F");
          pdf.setTextColor(15, 23, 42);
          pdf.setFontSize(14);
          pdf.text(module.title, margin, yPos + 3);
          if (module.badge) {
            pdf.setFontSize(8);
            pdf.setTextColor(99, 102, 241);
            pdf.text(module.badge, margin + pdf.getTextWidth(module.title) + 5, yPos + 3);
          }
          pdf.setFontSize(10);
          pdf.setTextColor(79, 70, 229);
          pdf.text(module.tagline, margin, yPos + 10);
          yPos += 18;

          // Overview
          pdf.setFontSize(9);
          pdf.setTextColor(100, 116, 139);
          const overviewLines = pdf.splitTextToSize(module.overview, contentWidth);
          pdf.text(overviewLines, margin, yPos);
          yPos += overviewLines.length * 4 + 5;

          // Categories
          module.categories.forEach((cat) => {
            checkPageBreak(25);
            pdf.setFontSize(10);
            pdf.setTextColor(15, 23, 42);
            pdf.text(`${cat.title}:`, margin, yPos);
            yPos += 5;
            
            pdf.setFontSize(8);
            pdf.setTextColor(71, 85, 105);
            cat.items.forEach((item) => {
              checkPageBreak(5);
              pdf.text(`  • ${item}`, margin + 3, yPos);
              yPos += 4;
            });
            yPos += 3;
          });

          // AI Capabilities
          if (module.aiCapabilities.length > 0) {
            checkPageBreak(15);
            pdf.setFontSize(9);
            pdf.setTextColor(168, 85, 247);
            pdf.text("AI Capabilities:", margin, yPos);
            yPos += 5;
            pdf.setFontSize(8);
            module.aiCapabilities.forEach((ai) => {
              checkPageBreak(5);
              pdf.text(`  * ${ai.type}: ${ai.description}`, margin + 3, yPos);
              yPos += 4;
            });
            yPos += 3;
          }

          // Integrations
          if (module.integrations.length > 0) {
            checkPageBreak(12);
            pdf.setFontSize(9);
            pdf.setTextColor(34, 197, 94);
            pdf.text("Integrations:", margin, yPos);
            yPos += 5;
            pdf.setFontSize(8);
            pdf.setTextColor(71, 85, 105);
            module.integrations.forEach((int) => {
              checkPageBreak(5);
              pdf.text(`  > ${int.module}: ${int.description}`, margin + 3, yPos);
              yPos += 4;
            });
          }

          // Regional note
          if (module.regionalNote) {
            checkPageBreak(10);
            pdf.setFontSize(8);
            pdf.setTextColor(59, 130, 246);
            pdf.text(`[Regional] ${module.regionalNote}`, margin, yPos);
            yPos += 5;
          }

          yPos += 10;
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
