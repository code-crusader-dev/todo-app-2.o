import { useState } from "react";
import { Task, TaskFormData, TaskGroup, REPEAT_LABELS } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, Check, X, Pencil, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { GroupBadge } from "./GroupBadge";

interface TaskItemProps {
  task: Task;
  groups: TaskGroup[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetFocus: (id: string) => void;
  onEdit: (id: string, updates: Partial<TaskFormData>) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export function TaskItem({
  task,
  groups,
  onToggle,
  onDelete,
  onSetFocus,
  onEdit,
  draggable = false,
  onDragStart,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [isChecking, setIsChecking] = useState(false);

  const taskColor = task.color || groups.find(g => g.id === task.group_id)?.color || '#6B7280';

  const handleToggle = () => {
    if (!task.completed) {
      setIsChecking(true);
      setTimeout(() => setIsChecking(false), 400);
    }
    onToggle(task.id);
  };

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      onEdit(task.id, { title: editValue });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(task.title);
    setIsEditing(false);
  };

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task)}
      className={cn(
        "group flex items-center gap-3 p-4 rounded-xl bg-card shadow-card transition-all duration-200 hover:shadow-card-hover animate-slide-in",
        task.completed && "task-completed",
        task.is_focus && "ring-2 ring-warning bg-warning-muted",
        draggable && "cursor-grab active:cursor-grabbing"
      )}
      style={{
        borderLeft: `4px solid ${taskColor}`,
      }}
    >
      {draggable && (
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      
      <div
        className={cn(
          "flex items-center justify-center",
          isChecking && "animate-check"
        )}
      >
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          className={cn(
            "h-5 w-5 rounded-full border-2 transition-colors",
            task.completed
              ? "bg-success border-success data-[state=checked]:bg-success"
              : "border-muted-foreground"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="h-8"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8">
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <p
              className={cn(
                "text-foreground font-medium truncate transition-all",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <GroupBadge groupId={task.group_id} groups={groups} />
              {task.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {task.description && (
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {task.description}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!task.completed && !isEditing && (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onSetFocus(task.id)}
              className={cn(
                "h-8 w-8",
                task.is_focus && "text-warning"
              )}
              title={task.is_focus ? "Remove focus" : "Set as focus"}
            >
              <Star className={cn("h-4 w-4", task.is_focus && "fill-warning")} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8"
              title="Edit task"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(task.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          title="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
