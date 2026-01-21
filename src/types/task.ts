// Task Types - Local First Architecture

export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface CustomRepeat {
  interval: number; // every X days/weeks/months
  unit: 'days' | 'weeks' | 'months';
  endDate?: string; // YYYY-MM-DD - when to stop repeating
  skipDates?: string[]; // Array of dates to skip in the series
}

export interface TaskReminder {
  enabled: boolean;
  times: number[]; // Array of minutes before (e.g., [1440, 30] for 1 day + 30 min)
  notified?: string[]; // Track which reminder times were notified
}

export interface TaskGroup {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  start_time?: string; // HH:MM for reminder
  group_id: string;
  color?: string; // Custom color for task
  tags: string[];
  repeat_type: RepeatType;
  custom_repeat?: CustomRepeat;
  reminder: TaskReminder;
  is_focus: boolean;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  group_id: string;
  color?: string;
  tags: string[];
  repeat_type: RepeatType;
  custom_repeat?: CustomRepeat;
  reminder: TaskReminder;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  backgroundImage?: string; // Base64 or blob URL
  defaultReminderMinutes: number;
}

// Default Groups
export const DEFAULT_GROUPS: TaskGroup[] = [
  { id: 'work', name: 'Work', color: '#3B82F6', order: 0 },
  { id: 'study', name: 'Study', color: '#8B5CF6', order: 1 },
  { id: 'personal', name: 'Personal', color: '#10B981', order: 2 },
];

// Predefined Colors for Tasks
export const TASK_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#EF4444', label: 'Red' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
];

// Preset reminder options
export const REMINDER_PRESETS = [
  { value: 0, label: 'At time of event' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
  { value: 10080, label: '1 week before' },
];

// For backwards compatibility
export const REMINDER_OPTIONS = REMINDER_PRESETS;

export const REPEAT_LABELS: Record<RepeatType, string> = {
  none: 'No repeat',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

export const getGroupColor = (groups: TaskGroup[], groupId: string): string => {
  const group = groups.find(g => g.id === groupId);
  return group?.color || '#6B7280';
};

// Format reminder time for display
export const formatReminderTime = (minutes: number): string => {
  if (minutes === 0) return 'At time of event';
  if (minutes < 60) return `${minutes} min before`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hour${minutes >= 120 ? 's' : ''} before`;
  if (minutes < 10080) return `${Math.floor(minutes / 1440)} day${minutes >= 2880 ? 's' : ''} before`;
  return `${Math.floor(minutes / 10080)} week${minutes >= 20160 ? 's' : ''} before`;
};
