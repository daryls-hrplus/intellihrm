import jsPDF from 'jspdf';
import { format } from 'date-fns';

export interface Feedback360ReportData {
  employeeName: string;
  employeeTitle?: string;
  cycleName: string;
  cycleEndDate: string;
  overallScore: number;
  responseRate: number;
  totalRaters: number;
  categoryScores: Array<{
    name: string;
    score: number;
    benchmark?: number;
  }>;
  raterGroupScores: Array<{
    group: string;
    score: number;
    count: number;
  }>;
  strengths: string[];
  developmentAreas: string[];
  comments?: Array<{
    category: string;
    text: string;
  }>;
  companyName?: string;
  companyLogo?: string;
}

export interface PDFGenerationOptions {
  includeCoverPage?: boolean;
  includeComments?: boolean;
  includeInterpretationGuide?: boolean;
  includeDevelopmentPlan?: boolean;
  brandColor?: string;
}

export async function generateFeedback360PDF(
  data: Feedback360ReportData,
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  const {
    includeCoverPage = true,
    includeComments = true,
    includeInterpretationGuide = true,
    brandColor = '#6366f1',
  } = options;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPos = margin;

  // Helper functions
  const addNewPage = () => {
    doc.addPage();
    yPos = margin;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin) {
      addNewPage();
    }
  };

  const drawProgressBar = (x: number, y: number, width: number, score: number, maxScore: number = 5) => {
    const percentage = (score / maxScore) * 100;
    const barHeight = 6;
    
    // Background
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(x, y, width, barHeight, 2, 2, 'F');
    
    // Fill
    const fillWidth = (width * percentage) / 100;
    doc.setFillColor(99, 102, 241); // Primary color
    doc.roundedRect(x, y, fillWidth, barHeight, 2, 2, 'F');
  };

  // Cover page
  if (includeCoverPage) {
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('360° Feedback Report', pageWidth / 2, pageHeight / 3, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text(data.employeeName, pageWidth / 2, pageHeight / 3 + 15, { align: 'center' });
    
    if (data.employeeTitle) {
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text(data.employeeTitle, pageWidth / 2, pageHeight / 3 + 25, { align: 'center' });
    }
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(data.cycleName, pageWidth / 2, pageHeight / 2, { align: 'center' });
    doc.text(
      `Report Generated: ${format(new Date(), 'MMMM d, yyyy')}`,
      pageWidth / 2,
      pageHeight / 2 + 10,
      { align: 'center' }
    );
    
    if (data.companyName) {
      doc.setFontSize(10);
      doc.text(data.companyName, pageWidth / 2, pageHeight - 30, { align: 'center' });
    }
    
    doc.text('CONFIDENTIAL', pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    addNewPage();
  }

  // Interpretation guide
  if (includeInterpretationGuide) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('How to Read This Report', margin, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const guideText = [
      'This report summarizes feedback from multiple raters who work with you in different capacities.',
      '',
      '• Overall Score: A weighted average of all ratings. Use as a general indicator, not a definitive measure.',
      '• Category Scores: Average ratings by competency area. Look for patterns rather than individual scores.',
      '• Rater Groups: How different groups perceive you. Differences often reveal valuable insights.',
      '• Strengths & Development: AI-identified themes from the feedback. Use these as conversation starters.',
      '',
      'Remember: This is one snapshot in time. Focus on themes and patterns rather than specific numbers.',
    ];
    
    guideText.forEach(line => {
      checkPageBreak(6);
      doc.text(line, margin, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    
    // Separator
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;
  }

  // Executive Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Executive Summary', margin, yPos);
  yPos += 12;

  // Key metrics row
  const metricWidth = contentWidth / 3;
  
  // Overall Score
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(data.overallScore.toFixed(1), margin + metricWidth / 2, yPos, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Overall Score', margin + metricWidth / 2, yPos + 8, { align: 'center' });
  
  // Response Rate
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(`${Math.round(data.responseRate)}%`, margin + metricWidth + metricWidth / 2, yPos, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Response Rate', margin + metricWidth + metricWidth / 2, yPos + 8, { align: 'center' });
  
  // Total Raters
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(String(data.totalRaters), margin + metricWidth * 2 + metricWidth / 2, yPos, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Total Raters', margin + metricWidth * 2 + metricWidth / 2, yPos + 8, { align: 'center' });
  
  yPos += 25;

  // Category Scores
  checkPageBreak(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Scores by Category', margin, yPos);
  yPos += 10;

  data.categoryScores.forEach(category => {
    checkPageBreak(15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    doc.text(category.name, margin, yPos);
    doc.text(category.score.toFixed(1), pageWidth - margin - 10, yPos, { align: 'right' });
    
    yPos += 4;
    drawProgressBar(margin, yPos, contentWidth - 20, category.score);
    yPos += 12;
  });

  // Rater Group Scores
  checkPageBreak(60);
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Scores by Rater Group', margin, yPos);
  yPos += 10;

  data.raterGroupScores.forEach(group => {
    checkPageBreak(15);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${group.group} (${group.count})`, margin, yPos);
    doc.text(group.score.toFixed(1), pageWidth - margin - 10, yPos, { align: 'right' });
    
    yPos += 4;
    drawProgressBar(margin, yPos, contentWidth - 20, group.score);
    yPos += 12;
  });

  // Strengths & Development Areas
  checkPageBreak(80);
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Strengths', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  data.strengths.slice(0, 5).forEach(strength => {
    checkPageBreak(8);
    doc.text(`• ${strength}`, margin + 5, yPos);
    yPos += 6;
  });

  yPos += 10;
  checkPageBreak(40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Development Areas', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  data.developmentAreas.slice(0, 5).forEach(area => {
    checkPageBreak(8);
    doc.text(`• ${area}`, margin + 5, yPos);
    yPos += 6;
  });

  // Comments section
  if (includeComments && data.comments && data.comments.length > 0) {
    addNewPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Selected Comments', margin, yPos);
    yPos += 10;

    data.comments.slice(0, 15).forEach(comment => {
      checkPageBreak(25);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100);
      doc.text(comment.category.toUpperCase(), margin, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(0);
      
      // Word wrap comments
      const lines = doc.splitTextToSize(`"${comment.text}"`, contentWidth);
      lines.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin, yPos);
        yPos += 5;
      });
      yPos += 5;
    });
  }

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${totalPages} | ${data.employeeName} | ${data.cycleName} | CONFIDENTIAL`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
