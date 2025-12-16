import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType, BorderStyle, AlignmentType } from "docx";
import { saveAs } from "file-saver";

const createBorderedCell = (text: string, isHeader = false) => {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isHeader,
            size: 20,
          }),
        ],
      }),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    },
    shading: isHeader ? { fill: "E0E0E0" } : undefined,
  });
};

export const generateStaffLoanDesignDocument = async () => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "Staff Loan Management Module",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Design Document",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),

          // Executive Summary
          new Paragraph({
            text: "Executive Summary",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "A multi-territory staff loan management system for 8 Caribbean locations (Bahamas, Barbados, Bermuda, BVI, Cayman, Guyana, Jamaica, Trinidad) with varying loan types, disbursement mechanisms, and repayment policies.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Core Loan Types
          new Paragraph({
            text: "Core Loan Types Identified",
            heading: HeadingLevel.HEADING_1,
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createBorderedCell("Loan Type", true),
                  createBorderedCell("Territories", true),
                  createBorderedCell("Interest", true),
                  createBorderedCell("Typical Volume", true),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("New Hire Loans"),
                  createBorderedCell("Bahamas, Bermuda, Cayman"),
                  createBorderedCell("Interest-free"),
                  createBorderedCell("25-120/year"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Relocation Loans"),
                  createBorderedCell("Bahamas, Barbados, Bermuda, BVI, Cayman"),
                  createBorderedCell("Interest-free"),
                  createBorderedCell("Varies"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Staff Loans (Emergency)"),
                  createBorderedCell("All territories"),
                  createBorderedCell("Interest-free (9.75% Jamaica)"),
                  createBorderedCell("1-58/year"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Salary Advance"),
                  createBorderedCell("All territories"),
                  createBorderedCell("Interest-free"),
                  createBorderedCell("2-7/year"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Medical Loans"),
                  createBorderedCell("Jamaica, Trinidad, Guyana"),
                  createBorderedCell("Interest-free"),
                  createBorderedCell("1-3/year"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Educational Loans"),
                  createBorderedCell("Jamaica"),
                  createBorderedCell("Interest-free"),
                  createBorderedCell("82/year"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Car Lease Loans"),
                  createBorderedCell("Trinidad"),
                  createBorderedCell("Interest-free"),
                  createBorderedCell("30/year"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Recharges"),
                  createBorderedCell("Barbados, Trinidad, Bermuda"),
                  createBorderedCell("Interest-free"),
                  createBorderedCell("20-26/year"),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Functional Requirements
          new Paragraph({
            text: "Functional Requirements",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "1. Loan Configuration (Admin)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Define loan types per company/territory" }),
          new Paragraph({ text: "• Configure interest rates (fixed, variable, bank O/D rate)" }),
          new Paragraph({ text: "• Set maximum loan amounts by employee level" }),
          new Paragraph({ text: "• Define repayment periods and schedules" }),
          new Paragraph({ text: "• Configure eligibility rules (e.g., managers+ for car lease)" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "2. Loan Application & Approval",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Employee loan request form" }),
          new Paragraph({ text: "• Configurable approval workflow (HC → Finance → Partner)" }),
          new Paragraph({ text: "• Document attachment support" }),
          new Paragraph({ text: "• Eligibility validation against rules" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "3. Disbursement Methods",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Direct Deposit (EFT) - Primary method" }),
          new Paragraph({ text: "• Cheque Generation - For new hires without bank accounts" }),
          new Paragraph({ text: "• Petty Cash - For small amounts (Trinidad, Barbados)" }),
          new Paragraph({ text: "• Third-Party Payment - Car leases, medical, vendors" }),
          new Paragraph({ text: "• Off-Cycle Payroll - Salary advances" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "4. Repayment Tracking",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Salary Deduction - Automatic payroll integration" }),
          new Paragraph({ text: "• Direct Deposit by Staff - Manual payment tracking" }),
          new Paragraph({ text: "• Over Counter - Cash payments" }),
          new Paragraph({ text: "• Configurable repayment schedules (monthly, per pay cycle)" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "5. Car Lease Management (Trinidad-specific)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Vehicle quotation tracking" }),
          new Paragraph({ text: "• Lessor invoice management" }),
          new Paragraph({ text: "• Benefit-in-Kind (BIK) tax calculation (25%)" }),
          new Paragraph({ text: "• 48-60 month lease tracking" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "6. Recharge Management",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• DHL charges tracking" }),
          new Paragraph({ text: "• Cell phone charges" }),
          new Paragraph({ text: "• Credit card personal expenses" }),
          new Paragraph({ text: "• Insurance recharges" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "7. Reporting",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "• Outstanding loans by territory" }),
          new Paragraph({ text: "• Repayment schedule reports" }),
          new Paragraph({ text: "• Deduction lists for payroll" }),
          new Paragraph({ text: "• Loan aging analysis" }),
          new Paragraph({ text: "" }),

          // Data Model
          new Paragraph({
            text: "Data Model",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Primary Tables:",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "loan_types - Loan type configuration per company" }),
          new Paragraph({ text: "  • id, company_id, name, code" }),
          new Paragraph({ text: "  • has_interest, interest_rate, interest_type" }),
          new Paragraph({ text: "  • max_repayment_months, eligibility_criteria" }),
          new Paragraph({ text: "  • third_party_payment, start_date, end_date" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "staff_loans - Individual loan records" }),
          new Paragraph({ text: "  • id, employee_id, loan_type_id, company_id" }),
          new Paragraph({ text: "  • principal_amount, interest_rate, total_amount" }),
          new Paragraph({ text: "  • disbursement_date, disbursement_method, status" }),
          new Paragraph({ text: "  • approved_by, workflow_instance_id" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "loan_repayments - Repayment schedule and tracking" }),
          new Paragraph({ text: "  • id, staff_loan_id, amount, due_date, paid_date" }),
          new Paragraph({ text: "  • payment_method, status, payroll_run_id" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "car_leases - Car lease specific data (Trinidad)" }),
          new Paragraph({ text: "  • id, staff_loan_id, employee_id, vehicle_details" }),
          new Paragraph({ text: "  • lessor_vendor_id, monthly_lease_amount" }),
          new Paragraph({ text: "  • bik_amount, tax_amount, lease_months" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "loan_recharges - Recharge tracking" }),
          new Paragraph({ text: "  • id, employee_id, company_id, recharge_type" }),
          new Paragraph({ text: "  • amount, incurred_date, status" }),
          new Paragraph({ text: "" }),

          // Integration Points
          new Paragraph({
            text: "Integration Points",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "1. Payroll Module - Salary deductions, off-cycle payments" }),
          new Paragraph({ text: "2. Accounts Payable - Third-party payments, vendor disbursements" }),
          new Paragraph({ text: "3. Workflow Engine - Approval routing" }),
          new Paragraph({ text: "4. GL Interface - Journal entries, cost center allocation" }),
          new Paragraph({ text: "5. Employee Self-Service - Loan requests, balance viewing" }),
          new Paragraph({ text: "" }),

          // Development Estimate
          new Paragraph({
            text: "Development Estimate",
            heading: HeadingLevel.HEADING_1,
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createBorderedCell("Component", true),
                  createBorderedCell("Effort (Days)", true),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Database Schema & Migrations"),
                  createBorderedCell("2"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Loan Types Configuration (Admin)"),
                  createBorderedCell("3"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Loan Application & Workflow"),
                  createBorderedCell("4"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Disbursement Processing"),
                  createBorderedCell("3"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Repayment Tracking & Payroll Integration"),
                  createBorderedCell("4"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Car Lease Management"),
                  createBorderedCell("3"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Recharge Management"),
                  createBorderedCell("2"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Reporting & Analytics"),
                  createBorderedCell("3"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Employee Self-Service Portal"),
                  createBorderedCell("2"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Manager Self-Service"),
                  createBorderedCell("1"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Multi-territory Configuration"),
                  createBorderedCell("2"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Testing & Refinement"),
                  createBorderedCell("3"),
                ],
              }),
              new TableRow({
                children: [
                  createBorderedCell("Total"),
                  createBorderedCell("32 days (~6-7 weeks)"),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Phased Delivery
          new Paragraph({
            text: "Phased Delivery Recommendation",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "Phase 1 (2 weeks): ", bold: true }),
              new TextRun({ text: "Core loan types, application, approval workflow, basic disbursement" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Phase 2 (2 weeks): ", bold: true }),
              new TextRun({ text: "Payroll integration, repayment tracking, salary deductions" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Phase 3 (1.5 weeks): ", bold: true }),
              new TextRun({ text: "Car lease, recharges, third-party payments" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Phase 4 (1 week): ", bold: true }),
              new TextRun({ text: "Reporting, analytics, refinements" }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Territory-Specific Requirements
          new Paragraph({
            text: "Territory-Specific Requirements",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),
          
          new Paragraph({ text: "Bahamas", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "• New hire loan: $6,000, 12-month repayment" }),
          new Paragraph({ text: "• Relocation: $700 flat" }),
          new Paragraph({ text: "• Disbursement: EFT or manual cheque" }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "Barbados", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "• Salary advance: 2 per fiscal year limit" }),
          new Paragraph({ text: "• Includes: cell phone, credit cards, DHL, courier services" }),
          new Paragraph({ text: "• Nectar points cash-out tracking" }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "Bermuda", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "• New hire loan: $4,000, 8-month repayment ($500/month)" }),
          new Paragraph({ text: "• Relocation: $2,000 (managers), more for directors" }),
          new Paragraph({ text: "• Petty cash for initial $500" }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "Cayman", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "• New hire loan: $4,000-$6,000 (employee choice), 12-month repayment" }),
          new Paragraph({ text: "• Staff help loans: emergency funds" }),
          new Paragraph({ text: "• High volume: 50 new hire loans/year" }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "Jamaica", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "• Staff loans: 9.75% interest (bank O/D rate)" }),
          new Paragraph({ text: "• Educational loans (ACCA/CPA): 82/year, 6-month repayment" }),
          new Paragraph({ text: "• Medical loans: interest-free" }),
          new Paragraph({ text: "• Bank loan and NHA deductions via payroll" }),
          new Paragraph({ text: "" }),

          new Paragraph({ text: "Trinidad", heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: "• Car lease program: Managers+ only, 48-60 months" }),
          new Paragraph({ text: "• BIK calculation: 50% of lease (net of VAT) at 25% tax" }),
          new Paragraph({ text: "• Recharges: roaming, insurance, DHL, credit card" }),
          new Paragraph({ text: "" }),

          // Footer
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Document generated: " + new Date().toLocaleDateString(),
                italics: true,
                size: 18,
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Staff_Loan_Management_Design_Document.docx");
};
