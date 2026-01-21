import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format,
  parseISO,
  isWithinInterval
} from "date-fns";
import { Task, TaskGroup } from "@/types/task";
import { CalendarDay } from "./CalendarDay";

interface WeekCalendarProps {
  currentDate: Date;
  tasks: Task[];
  groups: TaskGroup[];
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, date: Date) => void;
  onSetFocus?: (id: string) => void;
  hasConflict?: (taskId: string) => boolean;
}

export function WeekCalendar({
  currentDate,
  tasks,
  groups,
  onDateClick,
  onTaskClick,
  onDragStart,
  onDragOver,
  onDrop,
}: WeekCalendarProps) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDate = (date: Date): Task[] => {
    const dateStr = format(date, "yyyy-MM-dd");
    return tasks.filter((task) => {
      const start = parseISO(task.start_date);
      const end = parseISO(task.end_date);
      return isWithinInterval(date, { start, end });
    });
  };

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-fade-in">
      {/* Day headers with full date */}
      <div className="grid grid-cols-7 border-b border-border">
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="py-3 text-center bg-muted/50 border-r border-border last:border-r-0"
          >
            <div className="text-sm font-medium text-muted-foreground">
              {format(day, "EEE")}
            </div>
            <div className="text-lg font-semibold text-foreground">
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            date={day}
            tasks={getTasksForDate(day)}
            groups={groups}
            currentMonth={currentDate}
            onDateClick={onDateClick}
            onTaskClick={onTaskClick}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            isWeekView
          />
        ))}
      </div>
    </div>
  );
}
