import { useState, useCallback, useRef } from "react";
import { addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, differenceInDays, parseISO, addDays } from "date-fns";
import { Task, TaskGroup } from "@/types/task";
import { CalendarHeader } from "./CalendarHeader";
import { MonthCalendar } from "./MonthCalendar";
import { WeekCalendar } from "./WeekCalendar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useConflictDetection } from "@/hooks/useConflictDetection";

interface CalendarViewProps {
  tasks: Task[];
  groups: TaskGroup[];
  getTasksForDateRange: (start: Date, end: Date) => Task[];
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, newStartDate: string, newEndDate: string) => void;
  onRangeSelect?: (startDate: Date, endDate: Date) => void;
  onSetFocus?: (id: string) => void;
  onNewTask?: () => void;
}

export function CalendarView({ 
  tasks, 
  groups, 
  getTasksForDateRange, 
  onDateClick, 
  onTaskClick, 
  onTaskMove,
  onRangeSelect,
  onSetFocus,
  onNewTask,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handlePrev = useCallback(() => setCurrentDate(view === "month" ? subMonths(currentDate, 1) : subWeeks(currentDate, 1)), [view, currentDate]);
  const handleNext = useCallback(() => setCurrentDate(view === "month" ? addMonths(currentDate, 1) : addWeeks(currentDate, 1)), [view, currentDate]);
  const handleToday = useCallback(() => setCurrentDate(new Date()), []);
  const toggleView = useCallback(() => setView(v => v === "month" ? "week" : "month"), []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPrevPeriod: handlePrev,
    onNextPeriod: handleNext,
    onToday: handleToday,
    onToggleView: toggleView,
    onNewTask,
  });

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.setData("application/x-task", JSON.stringify({ id: task.id, groupId: task.group_id }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedTask) return;
    const realId = draggedTask.id.includes('-repeat-') ? draggedTask.id.split('-repeat-')[0] : draggedTask.id;
    const originalStart = parseISO(draggedTask.start_date);
    const originalEnd = parseISO(draggedTask.end_date);
    const duration = differenceInDays(originalEnd, originalStart);
    const newStartDate = format(targetDate, "yyyy-MM-dd");
    const newEndDate = format(addDays(targetDate, duration), "yyyy-MM-dd");
    onTaskMove(realId, newStartDate, newEndDate);
    setDraggedTask(null);
  }, [draggedTask, onTaskMove]);

  const handleRangeSelect = useCallback((startDate: Date, endDate: Date) => {
    onRangeSelect?.(startDate, endDate);
  }, [onRangeSelect]);

  const getViewTasks = useCallback(() => {
    let rangeStart: Date, rangeEnd: Date;
    if (view === "month") {
      rangeStart = startOfWeek(startOfMonth(currentDate));
      rangeEnd = endOfWeek(endOfMonth(currentDate));
    } else {
      rangeStart = startOfWeek(currentDate);
      rangeEnd = endOfWeek(currentDate);
    }
    return getTasksForDateRange(rangeStart, rangeEnd);
  }, [view, currentDate, getTasksForDateRange]);

  const viewTasks = getViewTasks();
  const { hasConflict } = useConflictDetection(viewTasks);

  return (
    <div className="space-y-4">
      <CalendarHeader 
        currentDate={currentDate} 
        view={view} 
        onViewChange={setView} 
        onPrev={handlePrev} 
        onNext={handleNext} 
        onToday={handleToday} 
      />
      {view === "month" ? (
        <MonthCalendar 
          currentDate={currentDate} 
          tasks={viewTasks} 
          groups={groups} 
          onDateClick={onDateClick} 
          onTaskClick={onTaskClick} 
          onDragStart={handleDragStart} 
          onDragOver={handleDragOver} 
          onDrop={handleDrop}
          onRangeSelect={handleRangeSelect}
          onSetFocus={onSetFocus}
          hasConflict={hasConflict}
        />
      ) : (
        <WeekCalendar 
          currentDate={currentDate} 
          tasks={viewTasks} 
          groups={groups} 
          onDateClick={onDateClick} 
          onTaskClick={onTaskClick} 
          onDragStart={handleDragStart} 
          onDragOver={handleDragOver} 
          onDrop={handleDrop}
          onSetFocus={onSetFocus}
          hasConflict={hasConflict}
        />
      )}
    </div>
  );
}
