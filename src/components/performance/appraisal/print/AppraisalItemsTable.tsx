import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Target, BookOpen, Users, MessageSquare, Heart, Briefcase, TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface AppraisalItem {
  id: string;
  type: "goal" | "competency" | "responsibility" | "feedback_360" | "value" | "custom";
  typeLabel: string;
  name: string;
  description?: string;
  weight: number;
  requiredLevel?: number;
  employeeRating?: number;
  managerRating?: number;
  gap?: number;
  comments?: string;
  employeeComments?: string;
}

interface AppraisalItemsTableProps {
  items: AppraisalItem[];
  minRating?: number;
  maxRating?: number;
  showEmployeeRating?: boolean;
  showRequiredLevel?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  goal: <Target className="h-3 w-3" />,
  competency: <BookOpen className="h-3 w-3" />,
  responsibility: <Briefcase className="h-3 w-3" />,
  feedback_360: <MessageSquare className="h-3 w-3" />,
  value: <Heart className="h-3 w-3" />,
  custom: <Users className="h-3 w-3" />,
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
  showEmployeeRating = true,
  showRequiredLevel = true,
}: AppraisalItemsTableProps) {
  const getRatingColor = (rating: number | undefined) => {
    if (!rating) return "text-muted-foreground";
    const percentage = (rating - minRating) / (maxRating - minRating);
    if (percentage >= 0.8) return "text-green-600 dark:text-green-400";
    if (percentage >= 0.6) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 0.4) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGapIndicator = (gap: number | undefined) => {
    if (gap === undefined || gap === null) return null;
    if (gap > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-green-600 dark:text-green-400">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs">+{gap}</span>
        </span>
      );
    }
    if (gap < 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400">
          <TrendingDown className="h-3 w-3" />
          <span className="text-xs">{gap}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span className="text-xs">0</span>
      </span>
    );
  };

  // Group items by type for print sections
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, AppraisalItem[]>);

  const typeOrder = ["goal", "competency", "responsibility", "feedback_360", "value", "custom"];
  const sortedTypes = Object.keys(groupedItems).sort(
    (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
  );

  let itemNumber = 0;

  return (
    <div className="appraisal-items-table mb-6">
      <div className="bg-muted/30 px-4 py-3 border border-b-0 rounded-t-lg">
        <h3 className="font-semibold">Appraisal Items</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Rating Scale: {minRating} (Lowest) - {maxRating} (Highest)
        </p>
      </div>

      <div className="border rounded-b-lg overflow-hidden">
        <Table className="print-table">
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="w-8 text-xs">#</TableHead>
              <TableHead className="w-20 text-xs">Type</TableHead>
              <TableHead className="text-xs">Item</TableHead>
              <TableHead className="w-14 text-center text-xs">Wt%</TableHead>
              {showRequiredLevel && (
                <TableHead className="w-14 text-center text-xs">Req'd</TableHead>
              )}
              {showEmployeeRating && (
                <TableHead className="w-14 text-center text-xs">Self</TableHead>
              )}
              <TableHead className="w-14 text-center text-xs">Mgr</TableHead>
              {showRequiredLevel && (
                <TableHead className="w-14 text-center text-xs">Gap</TableHead>
              )}
              <TableHead className="w-32 text-xs">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showEmployeeRating && showRequiredLevel ? 9 : 7}
                  className="text-center text-muted-foreground py-8"
                >
                  No appraisal items configured for this template
                </TableCell>
              </TableRow>
            ) : (
              sortedTypes.map((type) =>
                groupedItems[type].map((item, index) => {
                  itemNumber++;
                  const isFirstOfType = index === 0;
                  return (
                    <TableRow
                      key={item.id}
                      className={isFirstOfType ? "border-t-2 border-muted" : ""}
                    >
                      <TableCell className="text-muted-foreground text-xs py-2">
                        {itemNumber}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] gap-0.5 px-1.5 py-0.5 ${typeColors[item.type] || typeColors.custom}`}
                        >
                          {typeIcons[item.type] || typeIcons.custom}
                          <span className="hidden sm:inline">{item.typeLabel}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm leading-tight">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground leading-tight line-clamp-2 print:line-clamp-none">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-xs py-2">
                        {item.weight}%
                      </TableCell>
                      {showRequiredLevel && (
                        <TableCell className="text-center text-xs py-2 font-medium text-muted-foreground">
                          {item.requiredLevel ?? "—"}
                        </TableCell>
                      )}
                      {showEmployeeRating && (
                        <TableCell
                          className={`text-center font-semibold text-xs py-2 ${getRatingColor(item.employeeRating)}`}
                        >
                          {item.employeeRating ?? "—"}
                        </TableCell>
                      )}
                      <TableCell
                        className={`text-center font-semibold text-xs py-2 ${getRatingColor(item.managerRating)}`}
                      >
                        {item.managerRating ?? "—"}
                      </TableCell>
                      {showRequiredLevel && (
                        <TableCell className="text-center py-2">
                          {getGapIndicator(item.gap)}
                        </TableCell>
                      )}
                      <TableCell className="py-2">
                        {item.comments ? (
                          <p className="text-xs text-muted-foreground line-clamp-2 print:line-clamp-none">
                            {item.comments}
                          </p>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
