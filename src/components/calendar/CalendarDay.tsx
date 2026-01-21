import { format, isToday, isSameMonth, parseISO, differenceInDays } from "date-fns";
import { Task, TaskGroup } from "@/types/task";
import { CalendarTask } from "./CalendarTask";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  groups: TaskGroup[];
  currentMonth: Date;
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, date: Date) => void;
  onSetFocus?: (id: string) => void;
  hasConflict?: (taskId: string) => boolean;
  isWeekView?: boolean;
  isSelecting?: boolean;
  isInSelection?: boolean;
  isSelectionStart?: boolean;
  isSelectionEnd?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseUp?: () => void;
}

export function CalendarDay({
  date,
  tasks,
  groups,
  currentMonth,
  onDateClick,
  onTaskClick,
  onDragStart,
  onDragOver,
  onDrop,
  onSetFocus,
  hasConflict,
  isWeekView = false,
  isSelecting = false,
  isInSelection = false,
  isSelectionStart = false,
  isSelectionEnd = false,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}: CalendarDayProps) {
  const dayNumber = format(date, "d");
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isCurrentDay = isToday(date);
  const dateStr = format(date, "yyyy-MM-dd");

  const sortedTasks = [...tasks].sort((a, b) => {
    const aDays = differenceInDays(parseISO(a.end_date), parseISO(a.start_date));
    const bDays = differenceInDays(parseISO(b.end_date), parseISO(b.start_date));
    if (aDays !== bDays) return bDays - aDays;
    return a.start_date.localeCompare(b.start_date);
  });

  const getSpanPosition = (task: Task): "start" | "middle" | "end" | "single" => {
    if (task.start_date === task.end_date) return "single";
    if (task.start_date === dateStr) return "start";
    if (task.end_date === dateStr) return "end";
    return "middle";
  };

  const maxTasks = isWeekView ? 8 : 3;
  const visibleTasks = sortedTasks.slice(0, maxTasks);
  const hiddenCount = sortedTasks.length - maxTasks;

  return (
    <div
      className={cn(
        "min-h-[100px] p-1 border-r border-b border-border transition-all duration-200",
        !isCurrentMonth && "bg-muted/30",
        isCurrentDay && "bg-primary/5",
        "hover:bg-accent/30 cursor-pointer group",
        isInSelection && "bg-primary/20",
        isSelectionStart && "rounded-l-md",
        isSelectionEnd && "rounded-r-md",
        isSelecting && "select-none"
      )}
      onClick={() => !isSelecting && onDateClick(date)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, date)}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={cn(
          "flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full transition-colors",
          isCurrentDay && "bg-primary text-primary-foreground",
          !isCurrentDay && !isCurrentMonth && "text-muted-foreground",
          !isCurrentDay && isCurrentMonth && "text-foreground"
        )}>
          {dayNumber}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDateClick(date); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all duration-200"
        >
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      <div className={cn("space-y-1", isWeekView && "space-y-0.5")}>
        {visibleTasks.map((task) => (
          <CalendarTask
            key={task.id}
            task={task}
            groups={groups}
            onClick={onTaskClick}
            onDragStart={onDragStart}
            onSetFocus={onSetFocus}
            isSpanning={task.start_date !== task.end_date}
            spanPosition={getSpanPosition(task)}
            hasConflict={hasConflict?.(task.id) || false}
          />
        ))}
        {hiddenCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onDateClick(date); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
          >
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  );
}
