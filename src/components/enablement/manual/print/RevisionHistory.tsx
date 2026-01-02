import { BrandColors } from "@/hooks/useEnablementBranding";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface RevisionEntry {
  version: string;
  date: string;
  author: string;
  description: string;
}

interface RevisionHistoryProps {
  brandColors: BrandColors;
  documentId?: string;
  revisions?: RevisionEntry[];
}

const DEFAULT_REVISIONS: RevisionEntry[] = [
  { version: "1.3.0", date: "2026-01-02", author: "System", description: "Added AI-assisted features documentation" },
  { version: "1.2.0", date: "2025-11-15", author: "System", description: "Updated calibration workflows" },
  { version: "1.1.0", date: "2025-09-01", author: "System", description: "Added cross-module integration" },
  { version: "1.0.0", date: "2025-06-01", author: "System", description: "Initial release" },
];

export function RevisionHistory({ 
  brandColors, 
  documentId,
  revisions = DEFAULT_REVISIONS 
}: RevisionHistoryProps) {
  return (
    <div className="p-8">
      <h2 
        className="text-xl font-bold mb-6"
        style={{ color: brandColors.primaryColor }}
      >
        Revision History
      </h2>
      
      {documentId && (
        <p className="text-sm text-muted-foreground mb-4">
          Document ID: <span className="font-mono">{documentId}</span>
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow 
            className="border-b-2"
            style={{ borderColor: brandColors.primaryColor }}
          >
            <TableHead className="font-semibold">Version</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Author</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revisions.map((rev, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono font-medium">{rev.version}</TableCell>
              <TableCell>{rev.date}</TableCell>
              <TableCell>{rev.author}</TableCell>
              <TableCell>{rev.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-8 pt-4 border-t text-xs text-muted-foreground">
        <p>This document is controlled. Printed copies are uncontrolled.</p>
      </div>
    </div>
  );
}
