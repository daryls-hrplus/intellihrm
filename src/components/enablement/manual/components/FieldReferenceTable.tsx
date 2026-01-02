import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export interface FieldDefinition {
  name: string;
  required: boolean;
  type: string;
  description: string;
  defaultValue?: string;
  validation?: string;
}

interface FieldReferenceTableProps {
  fields: FieldDefinition[];
  title?: string;
}

export function FieldReferenceTable({ fields, title }: FieldReferenceTableProps) {
  return (
    <div className="my-6">
      {title && <h4 className="font-medium mb-3">{title}</h4>}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="font-medium">Field</TableHead>
              <TableHead className="font-medium">Required</TableHead>
              <TableHead className="font-medium">Type</TableHead>
              <TableHead className="font-medium">Description</TableHead>
              <TableHead className="font-medium">Default</TableHead>
              <TableHead className="font-medium">Validation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{field.name}</TableCell>
                <TableCell>
                  {field.required ? (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {field.type}
                </TableCell>
                <TableCell className="text-sm max-w-xs">{field.description}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {field.defaultValue || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-xs">
                  {field.validation || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
