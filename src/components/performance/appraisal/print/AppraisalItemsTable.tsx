import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, BookOpen, Users, MessageSquare, Heart, Briefcase } from "lucide-react";

export interface AppraisalItem {
  id: string;
  type: "goal" | "competency" | "responsibility" | "feedback_360" | "value" | "custom";
  typeLabel: string;
  name: string;
  description?: string;
  weight: number;
  employeeRating?: number;
  managerRating?: number;
  comments?: string;
  employeeComments?: string;
}

interface AppraisalItemsTableProps {
  items: AppraisalItem[];
  minRating?: number;
  maxRating?: number;
  showEmployeeRating?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  goal: <Target className="h-3.5 w-3.5" />,
  competency: <BookOpen className="h-3.5 w-3.5" />,
  responsibility: <Briefcase className="h-3.5 w-3.5" />,
  feedback_360: <MessageSquare className="h-3.5 w-3.5" />,
  value: <Heart className="h-3.5 w-3.5" />,
  custom: <Users className="h-3.5 w-3.5" />,
};

const typeColors: Record<string, string> = {
  goal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  competency: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  responsibility: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  feedback_360: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  value: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  custom: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export function AppraisalItemsTable({ 
  items, 
  minRating = 1, 
  maxRating = 5,
  showEmployeeRating = true 
}: AppraisalItemsTableProps) {
  const getRatingColor = (rating: number | undefined) => {
    if (!rating) return "text-muted-foreground";
    const percentage = (rating - minRating) / (maxRating - minRating);
    if (percentage >= 0.8) return "text-green-600 dark:text-green-400";
    if (percentage >= 0.6) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 0.4) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="border rounded-lg overflow-hidden mb-6">
      <div className="bg-muted/30 px-4 py-3 border-b">
        <h3 className="font-semibold">Appraisal Items</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Rating Scale: {minRating} - {maxRating}
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20">
            <TableHead className="w-10">#</TableHead>
            <TableHead className="w-28">Type</TableHead>
            <TableHead className="min-w-[200px]">Name</TableHead>
            <TableHead className="w-[250px]">Description</TableHead>
            <TableHead className="w-20 text-center">Weight</TableHead>
            {showEmployeeRating && (
              <TableHead className="w-24 text-center">Employee Rating</TableHead>
            )}
            <TableHead className="w-24 text-center">Manager Rating</TableHead>
            <TableHead className="min-w-[150px]">Comments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showEmployeeRating ? 8 : 7} className="text-center text-muted-foreground py-8">
                No appraisal items configured
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs gap-1 ${typeColors[item.type] || typeColors.custom}`}
                  >
                    {typeIcons[item.type] || typeIcons.custom}
                    {item.typeLabel}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {item.description ? (
                    <ScrollArea className="h-16">
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </ScrollArea>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center font-medium">{item.weight}%</TableCell>
                {showEmployeeRating && (
                  <TableCell className={`text-center font-semibold ${getRatingColor(item.employeeRating)}`}>
                    {item.employeeRating ?? "—"}
                  </TableCell>
                )}
                <TableCell className={`text-center font-semibold ${getRatingColor(item.managerRating)}`}>
                  {item.managerRating ?? "—"}
                </TableCell>
                <TableCell>
                  {item.comments ? (
                    <ScrollArea className="h-16">
                      <p className="text-sm text-muted-foreground">{item.comments}</p>
                    </ScrollArea>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
