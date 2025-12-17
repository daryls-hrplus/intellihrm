import jsPDF from "jspdf";
import { format } from "date-fns";
import { getTodayString } from "@/utils/dateUtils";

interface EmployeeData {
  id: string;
  employee?: {
    full_name: string | null;
    email: string;
  };
  is_primary: boolean;
}

interface OrgNode {
  id: string;
  title: string;
  code: string;
  department?: { name: string };
  employees: EmployeeData[];
  children: OrgNode[];
}

interface LayoutNode {
  node: OrgNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
}

const BOX_WIDTH = 50;
const BOX_MIN_HEIGHT = 18;
const EMPLOYEE_LINE_HEIGHT = 4;
const HORIZONTAL_GAP = 8;
const VERTICAL_GAP = 15;
const PADDING = 3;
const FONT_SIZE_TITLE = 8;
const FONT_SIZE_CODE = 6;
const FONT_SIZE_EMPLOYEE = 6;

function calculateBoxHeight(node: OrgNode): number {
  // Title + code + padding
  let height = BOX_MIN_HEIGHT;
  // Add space for employees
  if (node.employees.length > 0) {
    height += node.employees.length * EMPLOYEE_LINE_HEIGHT + 2;
  }
  return height;
}

function calculateSubtreeWidth(node: OrgNode): number {
  if (node.children.length === 0) {
    return BOX_WIDTH;
  }
  const childrenWidth = node.children.reduce(
    (sum, child) => sum + calculateSubtreeWidth(child) + HORIZONTAL_GAP,
    -HORIZONTAL_GAP
  );
  return Math.max(BOX_WIDTH, childrenWidth);
}

function layoutTree(node: OrgNode, x: number, y: number): LayoutNode {
  const boxHeight = calculateBoxHeight(node);
  const subtreeWidth = calculateSubtreeWidth(node);

  const layoutNode: LayoutNode = {
    node,
    x: x + (subtreeWidth - BOX_WIDTH) / 2,
    y,
    width: BOX_WIDTH,
    height: boxHeight,
    children: [],
  };

  if (node.children.length > 0) {
    let childX = x;
    const childY = y + boxHeight + VERTICAL_GAP;

    node.children.forEach((child) => {
      const childSubtreeWidth = calculateSubtreeWidth(child);
      const childLayout = layoutTree(child, childX, childY);
      layoutNode.children.push(childLayout);
      childX += childSubtreeWidth + HORIZONTAL_GAP;
    });
  }

  return layoutNode;
}

function getBounds(layout: LayoutNode): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = layout.x;
  let maxX = layout.x + layout.width;
  let minY = layout.y;
  let maxY = layout.y + layout.height;

  layout.children.forEach((child) => {
    const childBounds = getBounds(child);
    minX = Math.min(minX, childBounds.minX);
    maxX = Math.max(maxX, childBounds.maxX);
    minY = Math.min(minY, childBounds.minY);
    maxY = Math.max(maxY, childBounds.maxY);
  });

  return { minX, maxX, minY, maxY };
}

function drawNode(pdf: jsPDF, layout: LayoutNode, offsetX: number, offsetY: number) {
  const x = layout.x + offsetX;
  const y = layout.y + offsetY;
  const { node, width, height } = layout;

  // Draw box with rounded corners
  pdf.setDrawColor(100, 100, 100);
  pdf.setFillColor(250, 250, 250);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(x, y, width, height, 2, 2, "FD");

  // Draw title
  pdf.setFontSize(FONT_SIZE_TITLE);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 30, 30);
  const titleLines = pdf.splitTextToSize(node.title, width - PADDING * 2);
  pdf.text(titleLines[0] || node.title, x + width / 2, y + PADDING + 3, { align: "center" });

  // Draw code
  pdf.setFontSize(FONT_SIZE_CODE);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text(node.code, x + width / 2, y + PADDING + 7, { align: "center" });

  // Draw department badge if present
  let currentY = y + PADDING + 11;
  if (node.department) {
    pdf.setFontSize(5);
    pdf.setTextColor(80, 80, 80);
    const deptLines = pdf.splitTextToSize(node.department.name, width - PADDING * 2);
    pdf.text(deptLines[0] || node.department.name, x + width / 2, currentY, { align: "center" });
    currentY += 3;
  }

  // Draw separator line if there are employees
  if (node.employees.length > 0) {
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(x + PADDING, currentY, x + width - PADDING, currentY);
    currentY += 3;

    // Draw employees
    pdf.setFontSize(FONT_SIZE_EMPLOYEE);
    pdf.setTextColor(50, 50, 50);
    node.employees.forEach((emp) => {
      const name = emp.employee?.full_name || emp.employee?.email || "Unknown";
      const isPrimary = emp.is_primary ? " •" : "";
      const fullText = name + isPrimary;
      // Use splitTextToSize to get text that fits, allowing more characters
      const maxWidth = width - PADDING * 2;
      const fittedText = pdf.splitTextToSize(fullText, maxWidth);
      pdf.text(fittedText[0] || fullText, x + width / 2, currentY, { align: "center" });
      currentY += EMPLOYEE_LINE_HEIGHT;
    });
  }

  // Draw connecting lines to children
  if (layout.children.length > 0) {
    const parentCenterX = x + width / 2;
    const parentBottomY = y + height;

    // Line down from parent
    const midY = parentBottomY + VERTICAL_GAP / 2;
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.4);
    pdf.line(parentCenterX, parentBottomY, parentCenterX, midY);

    // Horizontal line connecting all children
    const firstChild = layout.children[0];
    const lastChild = layout.children[layout.children.length - 1];
    const firstChildCenterX = firstChild.x + offsetX + firstChild.width / 2;
    const lastChildCenterX = lastChild.x + offsetX + lastChild.width / 2;

    if (layout.children.length > 1) {
      pdf.line(firstChildCenterX, midY, lastChildCenterX, midY);
    }

    // Lines down to each child
    layout.children.forEach((child) => {
      const childCenterX = child.x + offsetX + child.width / 2;
      const childTopY = child.y + offsetY;
      pdf.line(childCenterX, midY, childCenterX, childTopY);
    });
  }

  // Recursively draw children
  layout.children.forEach((child) => {
    drawNode(pdf, child, offsetX, offsetY);
  });
}

export function renderOrgChartToPdf(trees: OrgNode[], title: string): void {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  // Add title
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 30, 30);
  pdf.text(title, pageWidth / 2, margin + 5, { align: "center" });

  // Add date
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, pageWidth / 2, margin + 10, { align: "center" });

  const contentStartY = margin + 15;

  // Layout all trees side by side
  let currentX = 0;
  const layouts: LayoutNode[] = [];

  trees.forEach((tree) => {
    const layout = layoutTree(tree, currentX, 0);
    layouts.push(layout);
    const bounds = getBounds(layout);
    currentX = bounds.maxX + HORIZONTAL_GAP * 2;
  });

  // Calculate total bounds
  let totalMinX = Infinity;
  let totalMaxX = -Infinity;
  let totalMinY = Infinity;
  let totalMaxY = -Infinity;

  layouts.forEach((layout) => {
    const bounds = getBounds(layout);
    totalMinX = Math.min(totalMinX, bounds.minX);
    totalMaxX = Math.max(totalMaxX, bounds.maxX);
    totalMinY = Math.min(totalMinY, bounds.minY);
    totalMaxY = Math.max(totalMaxY, bounds.maxY);
  });

  const chartWidth = totalMaxX - totalMinX;
  const chartHeight = totalMaxY - totalMinY;

  // Scale to fit page
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - contentStartY - margin;

  const scaleX = availableWidth / chartWidth;
  const scaleY = availableHeight / chartHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

  // Apply scaling
  const scaledWidth = chartWidth * scale;
  const scaledHeight = chartHeight * scale;

  // Center on page
  const offsetX = margin + (availableWidth - scaledWidth) / 2 - totalMinX * scale;
  const offsetY = contentStartY + (availableHeight - scaledHeight) / 2 - totalMinY * scale;

  // Apply scale transform by adjusting coordinates
  const scaleLayout = (layout: LayoutNode): LayoutNode => ({
    ...layout,
    x: layout.x * scale,
    y: layout.y * scale,
    width: layout.width * scale,
    height: layout.height * scale,
    children: layout.children.map(scaleLayout),
  });

  // Draw each tree
  layouts.forEach((layout) => {
    const scaledLayout = scaleLayout(layout);
    drawNode(pdf, scaledLayout, offsetX, offsetY);
  });

  // Save PDF
  pdf.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${getTodayString()}.pdf`);
}
