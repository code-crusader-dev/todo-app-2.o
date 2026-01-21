import { Task, TaskGroup, REPEAT_LABELS, formatReminderTime } from "@/types/task";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Repeat, Bell, Clock, AlertTriangle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskHoverPreviewProps {
  task: Task;
  groups: TaskGroup[];
  children: React.ReactNode;
  hasConflict?: boolean;
  side?: "top" | "bottom" | "left" | "right";
}

export function TaskHoverPreview({
  task,
  groups,
  children,
  hasConflict = false,
  side = "top",
}: TaskHoverPreviewProps) {
  const group = groups.find(g => g.id === task.group_id);
  const taskColor = task.color || group?.color || '#6B7280';

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        side={side} 
        className="w-72 p-3 animate-scale-in"
        style={{ borderTopColor: taskColor, borderTopWidth: '3px' }}
      >
        <div className="space-y-2">
          {/* Title and status */}
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h4 className={cn(
                "font-semibold text-sm leading-tight",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h4>
              {group && (
                <span 
                  className="text-xs font-medium" 
                  style={{ color: group.color }}
                >
                  {group.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {task.is_focus && (
                <Star className="h-4 w-4 text-warning fill-warning" />
              )}
              {hasConflict && (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Date and time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {task.start_date === task.end_date
                ? format(new Date(task.start_date), "MMM d, yyyy")
                : `${format(new Date(task.start_date), "MMM d")} - ${format(new Date(task.end_date), "MMM d")}`}
            </span>
            {task.start_time && (
              <>
                <Clock className="h-3 w-3 ml-2" />
                <span>{task.start_time}</span>
              </>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Repeat and reminder info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.repeat_type !== "none" && (
              <span className="flex items-center gap-1">
                <Repeat className="h-3 w-3" />
                {REPEAT_LABELS[task.repeat_type]}
              </span>
            )}
            {task.reminder?.enabled && task.reminder.times.length > 0 && (
              <span className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {task.reminder.times.length > 1
                  ? `${task.reminder.times.length} reminders`
                  : formatReminderTime(task.reminder.times[0])}
              </span>
            )}
          </div>

          {/* Conflict warning */}
          {hasConflict && (
            <div className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
              <AlertTriangle className="h-3 w-3" />
              <span>Time conflict detected</span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
