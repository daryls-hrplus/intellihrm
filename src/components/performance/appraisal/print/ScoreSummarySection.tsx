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
  maxRating?: number;
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
  showFormulas = true,
  maxRating = 5,
}: ScoreSummarySectionProps) {
  const totalWeight = sections.reduce((sum, s) => sum + s.weight, 0);

  const getRatingLabel = (score: number) => {
    const level = ratingLevels.find((l) => score >= l.minScore && score <= l.maxScore);
    return level?.label || "N/A";
  };

  const getRatingColor = (score: number) => {
    const level = ratingLevels.find((l) => score >= l.minScore && score <= l.maxScore);
    return level?.color || "bg-gray-500";
  };

  // Sort sections by their contribution (highest first)
  const sortedSections = [...sections].sort((a, b) => b.contribution - a.contribution);

  return (
    <div className="score-summary-section border rounded-lg overflow-hidden mb-6 avoid-break">
      <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Score Summary</h3>
          {showFormulas && (
            <p className="text-xs text-muted-foreground mt-1">
              Section Score = (Σ Rating × Item Weight) ÷ (Σ Max × Item Weight) | Contribution = Score × Section Weight%
            </p>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="no-print">
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                <strong>Raw Score:</strong> Weighted average of all ratings in the section
                <br />
                <strong>Weight:</strong> Section's percentage contribution to total score
                <br />
                <strong>Contribution:</strong> Points contributed to final score
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Table className="print-table">
        <TableHeader>
          <TableRow className="bg-muted/20">
            <TableHead className="text-xs">Section</TableHead>
            <TableHead className="text-center text-xs w-16">Items</TableHead>
            <TableHead className="text-center text-xs w-24">Raw Score</TableHead>
            <TableHead className="text-center text-xs w-16">Weight</TableHead>
            <TableHead className="text-center text-xs w-20">Contribution</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                No sections configured for scoring
              </TableCell>
            </TableRow>
          ) : (
            <>
              {sortedSections.map((section) => (
                <TableRow key={section.sectionType}>
                  <TableCell className="font-medium text-sm py-2">{section.sectionLabel}</TableCell>
                  <TableCell className="text-center text-muted-foreground text-xs py-2">
                    {section.itemCount}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    <span className="font-mono text-xs">
                      {section.rawScore.toFixed(2)} / {section.maxScore.toFixed(0)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium text-xs py-2">
                    {section.weight}%
                  </TableCell>
                  <TableCell className="text-center font-semibold text-primary text-sm py-2">
                    {section.contribution.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Total Row */}
              <TableRow className="bg-muted/30 border-t-2">
                <TableCell className="font-bold text-sm py-3">Total</TableCell>
                <TableCell className="text-center text-muted-foreground text-xs py-3">
                  {sections.reduce((sum, s) => sum + s.itemCount, 0)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell className="text-center py-3">
                  <span className="font-bold text-xs">{totalWeight}%</span>
                  {totalWeight !== 100 && (
                    <Badge variant="destructive" className="ml-1 text-[10px] px-1">
                      ≠100
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center py-3">
                  <span className="text-lg font-bold text-primary">{totalScore.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">/{maxRating}</span>
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>

      {/* Overall Rating */}
      <div className="px-4 py-4 bg-muted/10 border-t">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Overall Performance Rating</span>
            <div className="flex items-center gap-3">
              <div className={`h-5 w-5 rounded-full ${getRatingColor(totalScore)}`} />
              <span className="text-xl font-bold">
                {overallRating || getRatingLabel(totalScore)}
              </span>
            </div>
          </div>

          {/* Rating Scale Legend */}
          <div className="flex gap-3 flex-wrap">
            {ratingLevels.map((level) => (
              <div key={level.label} className="flex items-center gap-1.5 text-xs">
                <div className={`h-2.5 w-2.5 rounded-full ${level.color}`} />
                <span className="text-muted-foreground">
                  {level.label}
                  <span className="hidden sm:inline"> ({level.minScore}-{level.maxScore})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
