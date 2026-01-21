import { useState } from "react";
import { TaskGroup, TASK_COLORS } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Plus, Folder, Trash2, Pencil, Check, X, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  groups: TaskGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string | null) => void;
  onAddGroup: (name: string, color: string) => void;
  onUpdateGroup: (id: string, updates: Partial<TaskGroup>) => void;
  onDeleteGroup: (id: string) => void;
  taskCounts: Record<string, number>;
}

export function Sidebar({
  groups,
  selectedGroupId,
  onSelectGroup,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  taskCounts,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(TASK_COLORS[0].value);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    if (newName.trim()) {
      onAddGroup(newName.trim(), newColor);
      setNewName("");
      setNewColor(TASK_COLORS[0].value);
      setIsAdding(false);
    }
  };

  const handleEdit = (id: string) => {
    if (editName.trim()) {
      onUpdateGroup(id, { name: editName.trim() });
      setEditingId(null);
    }
  };

  const startEdit = (group: TaskGroup) => {
    setEditingId(group.id);
    setEditName(group.name);
  };

  return (
    <div className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && <h2 className="font-semibold text-sidebar-foreground">Groups</h2>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        {/* All Tasks */}
        <button
          onClick={() => onSelectGroup(null)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1",
            selectedGroupId === null ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
          )}
        >
          <Folder className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium">All Tasks</span>
              <span className="text-xs text-muted-foreground">{Object.values(taskCounts).reduce((a, b) => a + b, 0)}</span>
            </>
          )}
        </button>

        {/* Groups */}
        {groups.map((group) => (
          <div key={group.id} className="group relative">
            {editingId === group.id ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-sm" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(group.id); if (e.key === 'Escape') setEditingId(null); }} />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleEdit(group.id)}><Check className="h-3 w-3" /></Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
              </div>
            ) : (
              <button
                onClick={() => onSelectGroup(group.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  selectedGroupId === group.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                )}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium truncate">{group.name}</span>
                    <span className="text-xs text-muted-foreground">{taskCounts[group.id] || 0}</span>
                  </>
                )}
              </button>
            )}
            {!collapsed && editingId !== group.id && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); startEdit(group); }}><Pencil className="h-3 w-3" /></Button>
                {groups.length > 1 && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id); }}><Trash2 className="h-3 w-3" /></Button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add Group */}
        {!collapsed && (
          isAdding ? (
            <div className="mt-2 p-2 space-y-2 bg-muted/50 rounded-lg">
              <Input placeholder="Group name" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-8" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setIsAdding(false); }} />
              <div className="flex gap-1">
                {TASK_COLORS.slice(0, 6).map((c) => (
                  <button key={c.value} onClick={() => setNewColor(c.value)} className={cn("w-6 h-6 rounded-full", newColor === c.value && "ring-2 ring-offset-1 ring-primary")} style={{ backgroundColor: c.value }} />
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>Add</Button>
                <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" className="w-full justify-start gap-2 mt-2" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4" />New Group
            </Button>
          )
        )}
      </ScrollArea>
    </div>
  );
}
