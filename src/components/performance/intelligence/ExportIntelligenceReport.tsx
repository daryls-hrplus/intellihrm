import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { format } from "date-fns";
import {
  FileDown,
  Loader2,
  Brain,
  BarChart3,
  Users,
  PieChart,
  Sparkles,
  CheckCircle2,
  FileText
} from "lucide-react";

// Import analytics hooks
import { useGoalCompletionRates } from "@/hooks/performance/useGoalCompletionRates";
import { useGoalQualityMetrics } from "@/hooks/performance/useGoalQualityMetrics";
import { useAlignmentAnalytics } from "@/hooks/performance/useAlignmentAnalytics";
import { useEmployeeWorkload } from "@/hooks/performance/useEmployeeWorkload";

interface ExportIntelligenceReportProps {
  companyId?: string;
}

interface SectionConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
}

export function ExportIntelligenceReport({ companyId }: ExportIntelligenceReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [sections, setSections] = useState<SectionConfig[]>([
    { id: 'operations', label: 'Operations Analytics', icon: BarChart3, enabled: true },
    { id: 'workforce', label: 'Workforce Insights', icon: Users, enabled: true },
    { id: 'appraisals', label: 'Appraisal Outcomes', icon: PieChart, enabled: true },
    { id: 'predictive', label: 'Predictive Intelligence', icon: Brain, enabled: true },
    { id: 'executive', label: 'AI Executive Summary', icon: Sparkles, enabled: true },
  ]);

  // Fetch all analytics data
  const { data: completionData } = useGoalCompletionRates(companyId);
  const { data: qualityData } = useGoalQualityMetrics(companyId);
  const { data: alignmentData } = useAlignmentAnalytics(companyId);
  const { data: workloadData } = useEmployeeWorkload(companyId);

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const generateExecutiveSummary = async (metricsData: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-performance-summary', {
        body: { metricsData }
      });

      if (error) throw error;
      return data?.summary || "Executive summary generation unavailable.";
    } catch (error) {
      console.error("Error generating executive summary:", error);
      return "Unable to generate AI executive summary. Please review the metrics below for insights.";
    }
  };

  const generatePDF = async () => {
    if (!companyId) {
      toast.error("Please select a company first");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Helper functions
      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      const drawSectionHeader = (title: string) => {
        addNewPageIfNeeded(20);
        pdf.setFillColor(59, 130, 246);
        pdf.rect(margin, yPos, contentWidth, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 5, yPos + 7);
        pdf.setTextColor(0, 0, 0);
        yPos += 15;
      };

      const drawMetricCard = (label: string, value: string | number, x: number, width: number) => {
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(x, yPos, width, 18, 2, 2, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, x + 4, yPos + 6);
        pdf.setFontSize(14);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(value), x + 4, yPos + 14);
      };

      const drawProgressBar = (label: string, value: number, x: number, width: number) => {
        pdf.setFontSize(9);
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'normal');
        pdf.text(label, x, yPos + 4);
        pdf.text(`${value.toFixed(1)}%`, x + width - 15, yPos + 4);
        
        // Background bar
        pdf.setFillColor(226, 232, 240);
        pdf.roundedRect(x, yPos + 6, width, 4, 1, 1, 'F');
        
        // Progress bar
        const progressWidth = (value / 100) * width;
        if (progressWidth > 0) {
          const color = value >= 70 ? [34, 197, 94] : value >= 40 ? [234, 179, 8] : [239, 68, 68];
          pdf.setFillColor(color[0], color[1], color[2]);
          pdf.roundedRect(x, yPos + 6, Math.max(progressWidth, 2), 4, 1, 1, 'F');
        }
        yPos += 14;
      };

      // === Cover Page ===
      setProgressMessage("Creating cover page...");
      setProgress(10);

      // Background gradient effect (simulated)
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 80, 'F');
      
      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Performance Intelligence", pageWidth / 2, 35, { align: 'center' });
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Comprehensive Analytics Report", pageWidth / 2, 48, { align: 'center' });
      
      // Date
      pdf.setFontSize(11);
      pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth / 2, 65, { align: 'center' });

      // Report sections included
      yPos = 100;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text("Report Sections Included:", margin, yPos);
      yPos += 10;

      sections.filter(s => s.enabled).forEach(section => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        pdf.text(`• ${section.label}`, margin + 5, yPos);
        yPos += 7;
      });

      // === Executive Summary (AI Generated) ===
      if (sections.find(s => s.id === 'executive')?.enabled) {
        setProgressMessage("Generating AI executive summary...");
        setProgress(20);

        const metricsForAI = {
          completionRate: completionData?.overallCompletionRate || 0,
          totalGoals: completionData?.totalGoals || 0,
          completedGoals: completionData?.completedGoals || 0,
          qualityScore: qualityData?.avgQualityScore || 0,
          alignmentRate: alignmentData?.companyAlignmentPercentage || 0,
          overloadedEmployees: workloadData?.overloadedCount || 0,
          totalEmployees: workloadData?.totalEmployees || 0,
          avgWorkloadScore: workloadData?.avgWorkloadScore || 0,
          departmentBreakdown: completionData?.byDepartment || [],
        };

        const executiveSummary = await generateExecutiveSummary(metricsForAI);

        pdf.addPage();
        yPos = margin;

        drawSectionHeader("Executive Summary");
        
        // AI badge
        pdf.setFillColor(139, 92, 246);
        pdf.roundedRect(margin, yPos, 45, 6, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.text("AI Generated", margin + 5, yPos + 4);
        yPos += 12;

        // Summary text
        pdf.setTextColor(51, 65, 85);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const summaryLines = pdf.splitTextToSize(executiveSummary, contentWidth);
        pdf.text(summaryLines, margin, yPos);
        yPos += summaryLines.length * 5 + 10;
      }

      // === Operations Analytics ===
      if (sections.find(s => s.id === 'operations')?.enabled && completionData) {
        setProgressMessage("Adding operations analytics...");
        setProgress(40);

        addNewPageIfNeeded(80);
        drawSectionHeader("Operations Analytics");

        // Key metrics row
        const cardWidth = (contentWidth - 15) / 4;
        drawMetricCard("Total Goals", completionData.totalGoals || 0, margin, cardWidth);
        drawMetricCard("Completed", completionData.completedGoals || 0, margin + cardWidth + 5, cardWidth);
        drawMetricCard("In Progress", completionData.inProgressGoals || 0, margin + (cardWidth + 5) * 2, cardWidth);
        drawMetricCard("Completion Rate", `${(completionData.overallCompletionRate || 0).toFixed(1)}%`, margin + (cardWidth + 5) * 3, cardWidth);
        yPos += 25;

        // Department breakdown
        if (completionData.byDepartment && completionData.byDepartment.length > 0) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text("Completion by Department", margin, yPos);
          yPos += 8;

          completionData.byDepartment.slice(0, 6).forEach(dept => {
            addNewPageIfNeeded(20);
            drawProgressBar(dept.departmentName || 'Unknown', dept.completionRate || 0, margin, contentWidth);
          });
        }

        // Goal Quality Metrics
        if (qualityData) {
          yPos += 10;
          addNewPageIfNeeded(40);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text("Goal Quality Metrics", margin, yPos);
          yPos += 10;

          const qCardWidth = (contentWidth - 10) / 3;
          drawMetricCard("Quality Score", `${(qualityData.avgQualityScore || 0).toFixed(1)}/100`, margin, qCardWidth);
          drawMetricCard("Assessed Goals", qualityData.assessedGoals || 0, margin + qCardWidth + 5, qCardWidth);
          drawMetricCard("Low Quality", qualityData.lowQualityGoals?.length || 0, margin + (qCardWidth + 5) * 2, qCardWidth);
          yPos += 25;
        }
      }

      // === Workforce Insights ===
      if (sections.find(s => s.id === 'workforce')?.enabled && workloadData) {
        setProgressMessage("Adding workforce insights...");
        setProgress(60);

        addNewPageIfNeeded(60);
        drawSectionHeader("Workforce Insights");

        const wCardWidth = (contentWidth - 10) / 3;
        drawMetricCard("Total Employees", workloadData.totalEmployees || 0, margin, wCardWidth);
        drawMetricCard("Overloaded", workloadData.overloadedCount || 0, margin + wCardWidth + 5, wCardWidth);
        drawMetricCard("Avg Workload", `${(workloadData.avgWorkloadScore || 0).toFixed(1)}%`, margin + (wCardWidth + 5) * 2, wCardWidth);
        yPos += 25;

        // Workload distribution
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text("Workload Distribution", margin, yPos);
        yPos += 8;

        const healthyCount = workloadData.healthyCount || 0;
        const warningCount = workloadData.warningCount || 0;
        const overloadedCount = workloadData.overloadedCount || 0;
        const total = workloadData.totalEmployees || 1;

        drawProgressBar(`Healthy (${healthyCount} employees)`, (healthyCount / total) * 100, margin, contentWidth);
        drawProgressBar(`Warning (${warningCount} employees)`, (warningCount / total) * 100, margin, contentWidth);
        drawProgressBar(`Critical (${overloadedCount} employees)`, (overloadedCount / total) * 100, margin, contentWidth);
      }

      // === Alignment Analytics ===
      if (sections.find(s => s.id === 'appraisals')?.enabled && alignmentData) {
        setProgressMessage("Adding alignment analytics...");
        setProgress(75);

        addNewPageIfNeeded(50);
        drawSectionHeader("Goal Alignment & Cascade");

        const aCardWidth = (contentWidth - 10) / 3;
        drawMetricCard("Alignment Rate", `${(alignmentData.companyAlignmentPercentage || 0).toFixed(1)}%`, margin, aCardWidth);
        drawMetricCard("Aligned Goals", alignmentData.alignedGoals || 0, margin + aCardWidth + 5, aCardWidth);
        drawMetricCard("Broken Chains", alignmentData.brokenChains || 0, margin + (aCardWidth + 5) * 2, aCardWidth);
        yPos += 25;

        // Department alignment
        if (alignmentData.departmentAlignment && alignmentData.departmentAlignment.length > 0) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(15, 23, 42);
          pdf.text("Alignment by Department", margin, yPos);
          yPos += 8;

          alignmentData.departmentAlignment.slice(0, 5).forEach(dept => {
            addNewPageIfNeeded(20);
            drawProgressBar(dept.departmentName || 'Unknown', dept.alignmentPercentage || 0, margin, contentWidth);
          });
        }
      }

      // === Predictive Intelligence ===
      if (sections.find(s => s.id === 'predictive')?.enabled) {
        setProgressMessage("Adding predictive intelligence...");
        setProgress(85);

        addNewPageIfNeeded(40);
        drawSectionHeader("Predictive Intelligence Summary");

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        
        const healthScore = ((completionData?.overallCompletionRate || 0) + (qualityData?.avgQualityScore || 0) + (alignmentData?.companyAlignmentPercentage || 0)) / 3;
        
        const riskSummary = `Based on the current performance metrics:
• ${workloadData?.overloadedCount || 0} employees are at risk of burnout due to high workload
• ${qualityData?.lowQualityGoals?.length || 0} goals require attention due to quality concerns
• ${alignmentData?.brokenChains || 0} alignment chains have been broken and need review
• Overall organizational health score: ${healthScore.toFixed(1)}%`;

        const riskLines = pdf.splitTextToSize(riskSummary, contentWidth);
        pdf.text(riskLines, margin, yPos);
        yPos += riskLines.length * 5 + 10;
      }

      // === Footer on all pages ===
      setProgressMessage("Finalizing report...");
      setProgress(95);

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(
          `Performance Intelligence Report | Page ${i} of ${totalPages} | Generated by Intelli HRM`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `Performance_Intelligence_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);

      setProgress(100);
      setProgressMessage("Report generated successfully!");
      toast.success("Intelligence report exported successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report");
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
        setProgressMessage("");
      }, 1500);
    }
  };

  const enabledCount = sections.filter(s => s.enabled).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Export Intelligence Report
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI Enhanced
                </Badge>
              </CardTitle>
              <CardDescription>
                Generate a comprehensive PDF with all analytics and AI-powered insights
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Include Sections</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <div 
                  key={section.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    section.enabled 
                      ? 'bg-primary/5 border-primary/30' 
                      : 'bg-muted/30 border-border'
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <Checkbox 
                    checked={section.enabled}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Icon className={`h-4 w-4 ${section.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${section.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {section.label}
                  </span>
                  {section.id === 'executive' && (
                    <Badge variant="outline" className="ml-auto text-xs">AI</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Progress indicator */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{progressMessage}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Generate button */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 inline mr-1 text-success" />
            {enabledCount} sections selected
          </div>
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating || !companyId || enabledCount === 0}
            size="lg"
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                Export PDF Report
              </>
            )}
          </Button>
        </div>

        {!companyId && (
          <p className="text-sm text-warning text-center">
            Please select a company to generate the report
          </p>
        )}
      </CardContent>
    </Card>
  );
}
