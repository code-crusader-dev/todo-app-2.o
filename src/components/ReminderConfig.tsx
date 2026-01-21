import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REMINDER_PRESETS, formatReminderTime } from "@/types/task";
import { Plus, X, Bell } from "lucide-react";

interface ReminderConfigProps {
  times: number[];
  onChange: (times: number[]) => void;
}

export function ReminderConfig({ times, onChange }: ReminderConfigProps) {
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState<"minutes" | "hours" | "days">("minutes");
  const [showCustom, setShowCustom] = useState(false);

  const addPreset = (value: number) => {
    if (!times.includes(value)) {
      onChange([...times, value].sort((a, b) => b - a));
    }
  };

  const addCustom = () => {
    const value = parseInt(customValue);
    if (isNaN(value) || value <= 0) return;
    
    let minutes = value;
    if (customUnit === "hours") minutes = value * 60;
    if (customUnit === "days") minutes = value * 1440;
    
    if (!times.includes(minutes)) {
      onChange([...times, minutes].sort((a, b) => b - a));
    }
    setCustomValue("");
    setShowCustom(false);
  };

  const removeReminder = (value: number) => {
    onChange(times.filter(t => t !== value));
  };

  return (
    <div className="space-y-3">
      {/* Active reminders */}
      {times.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {times.map((time) => (
            <Badge key={time} variant="secondary" className="gap-1 pr-1">
              <Bell className="h-3 w-3" />
              {formatReminderTime(time)}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-destructive/20"
                onClick={() => removeReminder(time)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Preset options */}
      <div className="flex flex-wrap gap-1">
        {REMINDER_PRESETS.slice(0, 6).map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant={times.includes(preset.value) ? "secondary" : "outline"}
            size="sm"
            className="h-7 text-xs"
            disabled={times.includes(preset.value)}
            onClick={() => addPreset(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Custom reminder */}
      {showCustom ? (
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            min={1}
            placeholder="Value"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            className="w-20 h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
          />
          <Select value={customUnit} onValueChange={(v) => setCustomUnit(v as typeof customUnit)}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" size="sm" className="h-8" onClick={addCustom}>
            Add
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setShowCustom(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setShowCustom(true)}
        >
          <Plus className="h-3 w-3" />
          Custom timing
        </Button>
      )}
    </div>
  );
}
