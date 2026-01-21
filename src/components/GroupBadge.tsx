import { TaskGroup, getGroupColor } from "@/types/task";
import { cn } from "@/lib/utils";

interface GroupBadgeProps {
  groupId: string;
  groups: TaskGroup[];
  size?: "sm" | "md";
}

export function GroupBadge({ groupId, groups, size = "sm" }: GroupBadgeProps) {
  const group = groups.find(g => g.id === groupId);
  const color = group?.color || '#6B7280';
  const name = group?.name || 'Unknown';

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        size === "sm" && "text-xs px-2 py-0.5",
        size === "md" && "text-sm px-3 py-1"
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}
