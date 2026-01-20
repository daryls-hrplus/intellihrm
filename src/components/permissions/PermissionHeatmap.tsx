import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface HeatmapCell {
  rowId: string;
  colId: string;
  value: number; // 0-4 scale
  label?: string;
}

export interface HeatmapRow {
  id: string;
  label: string;
}

export interface HeatmapColumn {
  id: string;
  label: string;
  shortLabel?: string;
}

interface PermissionHeatmapProps {
  rows: HeatmapRow[];
  columns: HeatmapColumn[];
  data: HeatmapCell[];
  title?: string;
  onCellClick?: (rowId: string, colId: string) => void;
}

const intensityColors = [
  "bg-muted/30", // 0 - No access
  "bg-warning/20 border-warning/30", // 1 - Masked
  "bg-warning/40 border-warning/50", // 2 - Limited
  "bg-primary/40 border-primary/50", // 3 - Configure
  "bg-success/50 border-success/60", // 4 - Full/Approve
];

const intensityLabels = ["No Access", "Masked", "Limited", "Configure", "Full Access"];

export function PermissionHeatmap({
  rows,
  columns,
  data,
  title,
  onCellClick,
}: PermissionHeatmapProps) {
  const getCellData = (rowId: string, colId: string): HeatmapCell | undefined => {
    return data.find(d => d.rowId === rowId && d.colId === colId);
  };

  return (
    <div className="overflow-x-auto">
      {title && (
        <h4 className="text-sm font-medium mb-3">{title}</h4>
      )}
      
      <div className="inline-block min-w-full">
        {/* Header */}
        <div className="flex">
          <div className="w-36 shrink-0" /> {/* Empty corner */}
          {columns.map(col => (
            <div
              key={col.id}
              className="w-16 shrink-0 px-1 text-center"
            >
              <span
                className="text-[10px] text-muted-foreground font-medium truncate block"
                title={col.label}
              >
                {col.shortLabel || col.label}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map(row => (
          <div key={row.id} className="flex items-center">
            <div className="w-36 shrink-0 pr-2 py-1">
              <span className="text-xs font-medium truncate block" title={row.label}>
                {row.label}
              </span>
            </div>
            {columns.map(col => {
              const cell = getCellData(row.id, col.id);
              const value = cell?.value ?? 0;
              const label = cell?.label || intensityLabels[value];
              
              return (
                <div key={col.id} className="w-16 shrink-0 px-1 py-1">
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onCellClick?.(row.id, col.id)}
                          className={cn(
                            "w-full h-7 rounded border transition-colors",
                            intensityColors[value],
                            onCellClick && "cursor-pointer hover:opacity-80"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{row.label}</p>
                        <p className="text-muted-foreground">{col.label}: {label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <span>Access Level:</span>
        {intensityColors.map((color, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className={cn("w-4 h-4 rounded border", color)} />
            <span>{intensityLabels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
