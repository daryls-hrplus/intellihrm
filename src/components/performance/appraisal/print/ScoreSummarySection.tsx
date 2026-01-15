import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SectionScore {
  sectionType: string;
  sectionLabel: string;
  itemCount: number;
  rawScore: number;
  maxScore: number;
  weight: number;
  contribution: number;
}

interface RatingLevel {
  label: string;
  minScore: number;
  maxScore: number;
  color: string;
}

interface ScoreSummarySectionProps {
  sections: SectionScore[];
  totalScore: number;
  overallRating?: string;
  ratingLevels?: RatingLevel[];
  showFormulas?: boolean;
}

const defaultRatingLevels: RatingLevel[] = [
  { label: "Exceptional", minScore: 4.5, maxScore: 5, color: "bg-green-600" },
  { label: "Exceeds Expectations", minScore: 3.5, maxScore: 4.49, color: "bg-blue-600" },
  { label: "Meets Expectations", minScore: 2.5, maxScore: 3.49, color: "bg-amber-500" },
  { label: "Needs Improvement", minScore: 1.5, maxScore: 2.49, color: "bg-orange-500" },
  { label: "Unsatisfactory", minScore: 0, maxScore: 1.49, color: "bg-red-600" },
];

export function ScoreSummarySection({ 
  sections, 
  totalScore, 
  overallRating,
  ratingLevels = defaultRatingLevels,
  showFormulas = true 
}: ScoreSummarySectionProps) {
  const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);
  
  const getRatingLabel = (score: number) => {
    const level = ratingLevels.find(l => score >= l.minScore && score <= l.maxScore);
    return level?.label || "N/A";
  };

  const getRatingColor = (score: number) => {
    const level = ratingLevels.find(l => score >= l.minScore && score <= l.maxScore);
    return level?.color || "bg-gray-500";
  };

  return (
    <div className="border rounded-lg overflow-hidden mb-6">
      <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Score Summary</h3>
          {showFormulas && (
            <p className="text-xs text-muted-foreground mt-1">
              ES = (∑ Rating × Weight) / (∑ Max × Weight) • TS = ES × Section Weight
            </p>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                <strong>ES:</strong> Employee Score - Weighted average of ratings<br />
                <strong>PW:</strong> Proportional Weight - Section weight as percentage<br />
                <strong>TS:</strong> Total Score - ES × PW contribution to final score
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20">
            <TableHead>Section</TableHead>
            <TableHead className="text-center">Items</TableHead>
            <TableHead className="text-center">Raw Score (ES)</TableHead>
            <TableHead className="text-center">Weight (PW)</TableHead>
            <TableHead className="text-center">Contribution (TS)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => (
            <TableRow key={section.sectionType}>
              <TableCell className="font-medium">{section.sectionLabel}</TableCell>
              <TableCell className="text-center text-muted-foreground">
                {section.itemCount} items
              </TableCell>
              <TableCell className="text-center">
                <span className="font-mono">
                  {section.rawScore.toFixed(2)} / {section.maxScore.toFixed(2)}
                </span>
              </TableCell>
              <TableCell className="text-center font-medium">{section.weight}%</TableCell>
              <TableCell className="text-center font-semibold text-primary">
                {section.contribution.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          
          {/* Total Row */}
          <TableRow className="bg-muted/30 border-t-2">
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="text-center text-muted-foreground">
              {sections.reduce((sum, s) => sum + s.itemCount, 0)} items
            </TableCell>
            <TableCell></TableCell>
            <TableCell className="text-center font-bold">
              {totalWeight}%
              {totalWeight !== 100 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  ≠ 100%
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-center">
              <span className="text-xl font-bold text-primary">{totalScore.toFixed(2)}</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Overall Rating */}
      <div className="px-4 py-4 bg-muted/10 border-t flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground">Overall Rating</span>
          <div className="flex items-center gap-3 mt-1">
            <div className={`h-4 w-4 rounded-full ${getRatingColor(totalScore)}`} />
            <span className="text-lg font-bold">
              {overallRating || getRatingLabel(totalScore)}
            </span>
          </div>
        </div>
        
        {/* Rating Scale Legend */}
        <div className="flex gap-2 flex-wrap justify-end">
          {ratingLevels.map((level) => (
            <div key={level.label} className="flex items-center gap-1 text-xs">
              <div className={`h-2 w-2 rounded-full ${level.color}`} />
              <span className="text-muted-foreground">
                {level.label} ({level.minScore}-{level.maxScore})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
