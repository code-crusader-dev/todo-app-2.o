import { useState } from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO, isWithinInterval, isSameDay, isBefore } from "date-fns";
import { Task, TaskGroup } from "@/types/task";
import { CalendarDay } from "./CalendarDay";
import { DateRangeSelector } from "./DateRangeSelector";
import { cn } from "@/lib/utils";

interface MonthCalendarProps {
  currentDate: Date;
  tasks: Task[];
  groups: TaskGroup[];
  onDateClick: (date: Date) => void;
  onTaskClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, date: Date) => void;
  onRangeSelect?: (startDate: Date, endDate: Date) => void;
  onSetFocus?: (id: string) => void;
  hasConflict?: (taskId: string) => boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthCalendar({ 
  currentDate, 
  tasks, 
  groups, 
  onDateClick, 
  onTaskClick, 
  onDragStart, 
  onDragOver, 
  onDrop,
  onRangeSelect,
  onSetFocus,
  hasConflict,
}: MonthCalendarProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter((task) => {
      const start = parseISO(task.start_date);
      const end = parseISO(task.end_date);
      return isWithinInterval(date, { start, end });
    });
  };

  return (
    <DateRangeSelector onRangeSelect={onRangeSelect || (() => {})}>
      {({ isSelecting, handleMouseDown, handleMouseEnter, handleMouseUp, isInSelection, isSelectionStart, isSelectionEnd }) => (
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-fade-in">
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground bg-muted/50">{day}</div>
            ))}
          </div>
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
                onSetFocus={onSetFocus}
                hasConflict={hasConflict}
                isSelecting={isSelecting}
                isInSelection={isInSelection(day)}
                isSelectionStart={isSelectionStart(day)}
                isSelectionEnd={isSelectionEnd(day)}
                onMouseDown={(e) => handleMouseDown(day, e)}
                onMouseEnter={() => handleMouseEnter(day)}
                onMouseUp={() => handleMouseUp(day)}
              />
            ))}
          </div>
        </div>
      )}
    </DateRangeSelector>
  );
}
