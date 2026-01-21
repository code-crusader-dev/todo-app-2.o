import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  view: "month" | "week";
  onViewChange: (view: "month" | "week") => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const title = view === "month" 
    ? format(currentDate, "MMMM yyyy")
    : `Week of ${format(currentDate, "MMM d, yyyy")}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CalendarIcon className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
        
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button
            variant={view === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("week")}
            className="h-7"
          >
            Week
          </Button>
          <Button
            variant={view === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("month")}
            className="h-7"
          >
            Month
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={onPrev} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNext} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
