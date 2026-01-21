import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Plus, Calendar, X, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { 
  TaskFormData, 
  TaskGroup, 
  RepeatType, 
  REPEAT_LABELS,
  TASK_COLORS,
} from "@/types/task";
import { cn } from "@/lib/utils";

interface AddTaskDialogProps {
  onAdd: (formData: TaskFormData) => void;
  groups: TaskGroup[];
  existingTags: string[];
  defaultDate?: Date;
  defaultEndDate?: Date;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddTaskDialog({ 
  onAdd, 
  groups, 
  existingTags, 
  defaultDate, 
  defaultEndDate,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const today = format(new Date(), "yyyy-MM-dd");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState("");
  const [groupId, setGroupId] = useState(groups[0]?.id || "personal");
  const [color, setColor] = useState<string | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [repeatType, setRepeatType] = useState<RepeatType>("none");
  const [customInterval, setCustomInterval] = useState(1);
  const [customUnit, setCustomUnit] = useState<"days" | "weeks" | "months">("days");
  const [repeatEndDate, setRepeatEndDate] = useState("");
  const [skipDates, setSkipDates] = useState<string[]>([]);
  const [skipDateInput, setSkipDateInput] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTimes, setReminderTimes] = useState<number[]>([15]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update dates when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      const dateStr = format(defaultDate, "yyyy-MM-dd");
      setStartDate(dateStr);
      setEndDate(defaultEndDate ? format(defaultEndDate, "yyyy-MM-dd") : dateStr);
    }
  }, [defaultDate, defaultEndDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({
        title,
        description: description || undefined,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime || undefined,
        group_id: groupId,
        color,
        tags,
        repeat_type: repeatType,
        custom_repeat: repeatType === "custom" ? {
          interval: customInterval,
          unit: customUnit,
          endDate: repeatEndDate || undefined,
          skipDates: skipDates.length > 0 ? skipDates : undefined,
        } : undefined,
        reminder: {
          enabled: reminderEnabled,
          times: reminderEnabled ? reminderTimes : [],
        },
      });
      resetForm();
      setOpen(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(today);
    setEndDate(today);
    setStartTime("");
    setGroupId(groups[0]?.id || "personal");
    setColor(undefined);
    setTags([]);
    setTagInput("");
    setRepeatType("none");
    setCustomInterval(1);
    setCustomUnit("days");
    setRepeatEndDate("");
    setSkipDates([]);
    setSkipDateInput("");
    setReminderEnabled(false);
    setReminderTimes([15]);
    setShowAdvanced(false);
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addSkipDate = () => {
    if (skipDateInput && !skipDates.includes(skipDateInput)) {
      setSkipDates([...skipDates, skipDateInput].sort());
      setSkipDateInput("");
    }
  };

  const filteredSuggestions = existingTags
    .filter(t => t.includes(tagInput.toLowerCase()) && !tags.includes(t))
    .slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 shadow-card hover:shadow-card-hover transition-shadow">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Add New Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="What do you need to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Time (for reminder) */}
          <div className="space-y-2">
            <Label htmlFor="startTime">Time (optional)</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          {/* Group */}
          <div className="space-y-2">
            <Label>Group</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      {group.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Task Color (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {TASK_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(color === c.value ? undefined : c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c.value && "ring-2 ring-offset-2 ring-primary"
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {filteredSuggestions.length > 0 && tagInput && (
              <div className="flex flex-wrap gap-1 mt-1">
                {filteredSuggestions.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setTags([...tags, tag]);
                      setTagInput("");
                    }}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Repeat */}
          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select value={repeatType} onValueChange={(v) => setRepeatType(v as RepeatType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(REPEAT_LABELS) as RepeatType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {REPEAT_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {repeatType === "custom" && (
              <div className="space-y-3 mt-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex gap-2 items-center">
                  <span className="text-sm">Every</span>
                  <Input
                    type="number"
                    min={1}
                    value={customInterval}
                    onChange={(e) => setCustomInterval(parseInt(e.target.value) || 1)}
                    className="w-16 h-8"
                  />
                  <Select value={customUnit} onValueChange={(v) => setCustomUnit(v as typeof customUnit)}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">End repeat (optional)</Label>
                  <Input
                    type="date"
                    value={repeatEndDate}
                    min={endDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                    className="h-8"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Skip specific dates</Label>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {skipDates.map((date) => (
                      <Badge key={date} variant="outline" className="gap-1 text-xs">
                        {format(new Date(date), "MMM d")}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSkipDates(skipDates.filter(d => d !== date))} />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={skipDateInput}
                      min={startDate}
                      onChange={(e) => setSkipDateInput(e.target.value)}
                      className="h-8"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addSkipDate} disabled={!skipDateInput}>
                      Skip
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Reminders
              </Label>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>
            {reminderEnabled && (
              <ReminderConfig
                times={reminderTimes}
                onChange={setReminderTimes}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
