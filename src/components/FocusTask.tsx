import { Task, TaskGroup } from "@/types/task";
import { Target, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { GroupBadge } from "./GroupBadge";

interface FocusTaskProps {
  task: Task | undefined;
  groups: TaskGroup[];
}

export function FocusTask({ task, groups }: FocusTaskProps) {
  if (!task) {
    return (
      <div className="bg-gradient-to-r from-accent to-secondary rounded-xl p-6 shadow-card animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Today's Focus</h3>
            <p className="text-sm text-muted-foreground">
              Click the ⭐ on any task to set your main focus
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-warning-muted to-accent rounded-xl p-6 shadow-card animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-warning/20 rounded-lg">
          <Star className="h-6 w-6 text-warning fill-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            Today's Focus
            <GroupBadge groupId={task.group_id} groups={groups} />
          </h3>
          <p
            className={cn(
              "text-lg font-medium text-foreground truncate mt-1",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>
        </div>
      </div>
    </div>
  );
}
