import { useState } from "react";
import { format } from "date-fns";
import { Task, TaskFormData, TaskGroup, RepeatType, REPEAT_LABELS, TASK_COLORS, formatReminderTime } from "@/types/task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReminderConfig } from "@/components/ReminderConfig";
import { GroupBadge } from "./GroupBadge";
import { Star, Trash2, Calendar, Repeat, AlignLeft, Bell, X, Clock, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskDetailDialogProps {
  task: Task | null;
  groups: TaskGroup[];
  existingTags: string[];
  onClose: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSetFocus: (id: string) => void;
  onEdit: (id: string, updates: Partial<TaskFormData>) => void;
}

export function TaskDetailDialog({
  task,
  groups,
  existingTags,
  onClose,
  onToggle,
  onDelete,
  onSetFocus,
  onEdit,
}: TaskDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editGroupId, setEditGroupId] = useState("");
  const [editRepeatType, setEditRepeatType] = useState<RepeatType>("none");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [editReminderEnabled, setEditReminderEnabled] = useState(false);
  const [editReminderTimes, setEditReminderTimes] = useState<number[]>([]);

  const handleStartEdit = () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStartDate(task.start_date);
    setEditEndDate(task.end_date);
    setEditStartTime(task.start_time || "");
    setEditGroupId(task.group_id);
    setEditRepeatType(task.repeat_type);
    setEditTags(task.tags);
    setEditReminderEnabled(task.reminder?.enabled || false);
    setEditReminderTimes(task.reminder?.times || [15]);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!task || !editTitle.trim()) return;
    onEdit(task.id, {
      title: editTitle,
      description: editDescription || undefined,
      start_date: editStartDate,
      end_date: editEndDate,
      start_time: editStartTime || undefined,
      group_id: editGroupId,
      repeat_type: editRepeatType,
      tags: editTags,
      reminder: {
        enabled: editReminderEnabled,
        times: editReminderEnabled ? editReminderTimes : [],
      },
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!task) return;
    onDelete(task.id);
    onClose();
  };

  const handleSetFocus = () => {
    if (!task) return;
    onSetFocus(task.id);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
      setTagInput("");
    }
  };

  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Task Details
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSetFocus}
                className={cn("h-8 w-8", task.is_focus && "text-warning")}
                title="Set as focus task"
              >
                <Target className={cn("h-4 w-4", task.is_focus && "fill-warning")} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={editStartDate} onChange={(e) => {
                  setEditStartDate(e.target.value);
                  if (e.target.value > editEndDate) setEditEndDate(e.target.value);
                }} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={editEndDate} min={editStartDate} onChange={(e) => setEditEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Group</Label>
              <Select value={editGroupId} onValueChange={setEditGroupId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                        {g.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setEditTags(editTags.filter(t => t !== tag))} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Reminders
                </Label>
                <Switch checked={editReminderEnabled} onCheckedChange={setEditReminderEnabled} />
              </div>
              {editReminderEnabled && (
                <ReminderConfig times={editReminderTimes} onChange={setEditReminderTimes} />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={!editTitle.trim()}>Save Changes</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox checked={task.completed} onCheckedChange={() => onToggle(task.id)} className="h-5 w-5" />
              <span className={cn("flex-1 font-medium", task.completed && "line-through text-muted-foreground")}>{task.title}</span>
              <GroupBadge groupId={task.group_id} groups={groups} />
            </div>

            {task.description && (
              <div className="flex items-start gap-3 text-sm">
                <AlignLeft className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-foreground">{task.description}</p>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {task.start_date === task.end_date
                  ? format(new Date(task.start_date), "MMMM d, yyyy")
                  : `${format(new Date(task.start_date), "MMM d")} - ${format(new Date(task.end_date), "MMM d, yyyy")}`}
              </span>
              {task.start_time && (
                <>
                  <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                  <span>{task.start_time}</span>
                </>
              )}
            </div>

            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
              </div>
            )}

            {task.repeat_type !== "none" && (
              <div className="flex items-center gap-3 text-sm">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{REPEAT_LABELS[task.repeat_type]}</span>
              </div>
            )}

            {task.reminder?.enabled && task.reminder.times?.length > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {task.reminder.times.map(time => (
                    <Badge key={time} variant="secondary" className="text-xs">
                      {formatReminderTime(time)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {task.is_focus && (
              <div className="flex items-center gap-2 text-sm text-warning bg-warning-muted px-3 py-2 rounded-lg">
                <Target className="h-4 w-4" />
                <span className="font-medium">Focus Task</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={handleStartEdit}>Edit Task</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
