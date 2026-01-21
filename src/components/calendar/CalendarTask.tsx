import { Task, TaskGroup } from "@/types/task";
import { cn } from "@/lib/utils";
import { GripVertical, Repeat, Bell, AlertTriangle, Target } from "lucide-react";
import { TaskHoverPreview } from "./TaskHoverPreview";

interface CalendarTaskProps {
  task: Task;
  groups: TaskGroup[];
  onClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onSetFocus?: (id: string) => void;
  isSpanning?: boolean;
  spanPosition?: "start" | "middle" | "end" | "single";
  hasConflict?: boolean;
}

export function CalendarTask({ 
  task, 
  groups,
  onClick, 
  onDragStart,
  onSetFocus,
  isSpanning,
  spanPosition = "single",
  hasConflict = false,
}: CalendarTaskProps) {
  const group = groups.find(g => g.id === task.group_id);
  const taskColor = task.color || group?.color || '#6B7280';
  
  const roundedClasses = {
    single: "rounded-md",
    start: "rounded-l-md rounded-r-none",
    middle: "rounded-none",
    end: "rounded-r-md rounded-l-none",
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSetFocus) {
      onSetFocus(task.id);
    }
  };

  const taskContent = (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(task);
      }}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "group flex items-center gap-1 px-2 py-1 text-xs cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] hover:z-10",
        roundedClasses[spanPosition],
        task.completed && "opacity-60 line-through",
        hasConflict && "ring-1 ring-destructive",
        "animate-fade-in"
      )}
      style={{
        backgroundColor: `${taskColor}20`,
        color: taskColor,
        borderLeft: spanPosition === 'start' || spanPosition === 'single' ? `3px solid ${taskColor}` : undefined,
      }}
    >
      <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 flex-shrink-0 cursor-grab active:cursor-grabbing" />
      <span className="truncate flex-1 font-medium">{task.title}</span>
      {task.is_focus && (
        <Target className="h-3 w-3 text-warning flex-shrink-0" />
      )}
      {hasConflict && (
        <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0" />
      )}
      {task.reminder?.enabled && !isSpanning && (
        <Bell className="h-3 w-3 opacity-60 flex-shrink-0" />
      )}
      {task.repeat_type !== "none" && !isSpanning && (
        <Repeat className="h-3 w-3 opacity-60 flex-shrink-0" />
      )}
    </div>
  );

  return (
    <TaskHoverPreview task={task} groups={groups} hasConflict={hasConflict}>
      {taskContent}
    </TaskHoverPreview>
  );
}
