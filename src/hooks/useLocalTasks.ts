import { useState, useEffect, useCallback } from "react";
import { Task, TaskFormData, TaskGroup, RepeatType, CustomRepeat, DEFAULT_GROUPS } from "@/types/task";
import * as db from "@/lib/db";
import { addDays, addWeeks, addMonths, format, parseISO, isWithinInterval, isBefore, isAfter } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function useLocalTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<TaskGroup[]>(DEFAULT_GROUPS);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  // Load data from IndexedDB
  const loadData = useCallback(async () => {
    try {
      const [loadedTasks, loadedGroups, loadedTags] = await Promise.all([
        db.getAllTasks(),
        db.getAllGroups(),
        db.getAllTags(),
      ]);
      setTasks(loadedTasks);
      setGroups(loadedGroups.length > 0 ? loadedGroups : DEFAULT_GROUPS);
      setAllTags(loadedTags);
      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
      setIsLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generate repeated task instances for a date range
  const generateRepeatedInstances = useCallback((
    task: Task,
    rangeStart: Date,
    rangeEnd: Date
  ): Task[] => {
    if (task.repeat_type === 'none') return [];

    const instances: Task[] = [];
    const taskStart = parseISO(task.start_date);
    const taskEnd = parseISO(task.end_date);
    const taskDuration = Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));

    // Check repeat end date
    const repeatEndDate = task.custom_repeat?.endDate 
      ? parseISO(task.custom_repeat.endDate) 
      : addMonths(rangeEnd, 12); // Default to 1 year

    // Get skip dates
    const skipDates = new Set(task.custom_repeat?.skipDates || []);

    let currentStart = taskStart;
    let iteration = 0;
    const maxIterations = 365;

    while (iteration < maxIterations) {
      iteration++;
      
      if (iteration > 1) {
        switch (task.repeat_type) {
          case 'daily':
            currentStart = addDays(taskStart, iteration - 1);
            break;
          case 'weekly':
            currentStart = addWeeks(taskStart, iteration - 1);
            break;
          case 'monthly':
            currentStart = addMonths(taskStart, iteration - 1);
            break;
          case 'custom':
            if (task.custom_repeat) {
              const multiplier = iteration - 1;
              if (task.custom_repeat.unit === 'days') {
                currentStart = addDays(taskStart, multiplier * task.custom_repeat.interval);
              } else if (task.custom_repeat.unit === 'weeks') {
                currentStart = addWeeks(taskStart, multiplier * task.custom_repeat.interval);
              } else if (task.custom_repeat.unit === 'months') {
                currentStart = addMonths(taskStart, multiplier * task.custom_repeat.interval);
              }
            }
            break;
        }
      }

      // Stop if past repeat end date
      if (isAfter(currentStart, repeatEndDate)) break;

      const currentEnd = addDays(currentStart, taskDuration);
      const currentDateStr = format(currentStart, 'yyyy-MM-dd');

      // Stop if we've gone past the range
      if (isAfter(currentStart, rangeEnd)) break;

      // Skip if before range
      if (isBefore(currentEnd, rangeStart)) continue;

      // Skip the original task date
      if (currentDateStr === task.start_date) continue;

      // Skip if in skip dates
      if (skipDates.has(currentDateStr)) continue;

      instances.push({
        ...task,
        id: `${task.id}-repeat-${iteration}`,
        start_date: currentDateStr,
        end_date: format(currentEnd, 'yyyy-MM-dd'),
        parent_task_id: task.id,
      });
    }

    return instances;
  }, []);

  const addTask = async (formData: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      start_date: formData.start_date,
      end_date: formData.end_date,
      start_time: formData.start_time,
      group_id: formData.group_id,
      color: formData.color,
      tags: formData.tags,
      repeat_type: formData.repeat_type,
      custom_repeat: formData.custom_repeat,
      reminder: formData.reminder,
      completed: false,
      is_focus: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await db.addTask(newTask);
      setTasks(prev => [newTask, ...prev]);
      
      // Update tags
      const newTags = formData.tags.filter(t => !allTags.includes(t));
      if (newTags.length > 0) {
        setAllTags(prev => [...prev, ...newTags]);
      }

      toast({
        title: "Task added",
        description: "Your task has been created",
      });
      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
      return null;
    }
  };

  const toggleComplete = async (id: string) => {
    const realId = id.includes('-repeat-') ? id.split('-repeat-')[0] : id;
    const task = tasks.find(t => t.id === realId);
    if (!task) return;

    const updated = { ...task, completed: !task.completed, updated_at: new Date().toISOString() };
    
    try {
      await db.updateTask(updated);
      setTasks(prev => prev.map(t => t.id === realId ? updated : t));
    } catch (error) {
      console.error("Error toggling task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    const realId = id.includes('-repeat-') ? id.split('-repeat-')[0] : id;

    try {
      await db.deleteTask(realId);
      setTasks(prev => prev.filter(t => t.id !== realId));
      toast({
        title: "Task deleted",
        description: "Your task has been removed",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const setFocusTask = async (id: string) => {
    const realId = id.includes('-repeat-') ? id.split('-repeat-')[0] : id;
    const task = tasks.find(t => t.id === realId);
    if (!task) return;

    try {
      // Unfocus all other tasks
      const updates = tasks.map(t => {
        if (t.is_focus && t.id !== realId) {
          return { ...t, is_focus: false };
        }
        if (t.id === realId) {
          return { ...t, is_focus: !t.is_focus };
        }
        return t;
      });

      // Save to IndexedDB
      for (const t of updates.filter(t => t.is_focus !== tasks.find(x => x.id === t.id)?.is_focus)) {
        await db.updateTask(t);
      }

      setTasks(updates);
    } catch (error) {
      console.error("Error setting focus:", error);
    }
  };

  const editTask = async (id: string, updates: Partial<TaskFormData>) => {
    const realId = id.includes('-repeat-') ? id.split('-repeat-')[0] : id;
    const task = tasks.find(t => t.id === realId);
    if (!task) return;

    const updated: Task = {
      ...task,
      ...updates,
      title: updates.title?.trim() || task.title,
      description: updates.description?.trim() || task.description,
      updated_at: new Date().toISOString(),
    };

    try {
      await db.updateTask(updated);
      setTasks(prev => prev.map(t => t.id === realId ? updated : t));
    } catch (error) {
      console.error("Error editing task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const updateTaskDates = async (id: string, startDate: string, endDate: string) => {
    const realId = id.includes('-repeat-') ? id.split('-repeat-')[0] : id;
    const task = tasks.find(t => t.id === realId);
    if (!task) return;

    const updated = { ...task, start_date: startDate, end_date: endDate, updated_at: new Date().toISOString() };

    try {
      await db.updateTask(updated);
      setTasks(prev => prev.map(t => t.id === realId ? updated : t));
    } catch (error) {
      console.error("Error updating task dates:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const updateTaskGroup = async (id: string, groupId: string) => {
    const realId = id.includes('-repeat-') ? id.split('-repeat-')[0] : id;
    const task = tasks.find(t => t.id === realId);
    if (!task) return;

    const updated = { ...task, group_id: groupId, updated_at: new Date().toISOString() };

    try {
      await db.updateTask(updated);
      setTasks(prev => prev.map(t => t.id === realId ? updated : t));
      toast({
        title: "Task moved",
        description: `Moved to ${groups.find(g => g.id === groupId)?.name}`,
      });
    } catch (error) {
      console.error("Error updating task group:", error);
    }
  };

  // Group management
  const addGroup = async (name: string, color: string) => {
    const newGroup: TaskGroup = {
      id: crypto.randomUUID(),
      name,
      color,
      order: groups.length,
    };

    try {
      await db.addGroup(newGroup);
      setGroups(prev => [...prev, newGroup]);
      return newGroup;
    } catch (error) {
      console.error("Error adding group:", error);
      return null;
    }
  };

  const updateGroup = async (id: string, updates: Partial<TaskGroup>) => {
    const group = groups.find(g => g.id === id);
    if (!group) return;

    const updated = { ...group, ...updates };

    try {
      await db.updateGroup(updated);
      setGroups(prev => prev.map(g => g.id === id ? updated : g));
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  const deleteGroup = async (id: string) => {
    // Don't delete if it's the only group
    if (groups.length <= 1) return;

    try {
      await db.deleteGroup(id);
      setGroups(prev => prev.filter(g => g.id !== id));
      
      // Move tasks from deleted group to first available group
      const fallbackGroup = groups.find(g => g.id !== id);
      if (fallbackGroup) {
        const affectedTasks = tasks.filter(t => t.group_id === id);
        for (const task of affectedTasks) {
          await updateTaskGroup(task.id, fallbackGroup.id);
        }
      }
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const getTasksForDate = (date: string) => {
    const targetDate = parseISO(date);
    return tasks.filter(task => {
      const start = parseISO(task.start_date);
      const end = parseISO(task.end_date);
      return isWithinInterval(targetDate, { start, end });
    });
  };

  const getTasksForDateRange = useCallback((rangeStart: Date, rangeEnd: Date) => {
    const baseTasks = tasks.filter(task => {
      const start = parseISO(task.start_date);
      const end = parseISO(task.end_date);
      return !isBefore(end, rangeStart) && !isAfter(start, rangeEnd);
    });

    // Generate repeated instances
    const repeatedInstances: Task[] = [];
    tasks.forEach(task => {
      if (task.repeat_type !== 'none') {
        const instances = generateRepeatedInstances(task, rangeStart, rangeEnd);
        repeatedInstances.push(...instances);
      }
    });

    return [...baseTasks, ...repeatedInstances];
  }, [tasks, generateRepeatedInstances]);

  const getTodaysTasks = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return getTasksForDate(today);
  };

  const getFocusTask = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return tasks.find(task => {
      if (!task.is_focus) return false;
      const start = parseISO(task.start_date);
      const end = parseISO(task.end_date);
      const targetDate = parseISO(today);
      return isWithinInterval(targetDate, { start, end });
    });
  };

  return {
    tasks,
    groups,
    allTags,
    isLoaded,
    addTask,
    toggleComplete,
    deleteTask,
    setFocusTask,
    editTask,
    updateTaskDates,
    updateTaskGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    getTodaysTasks,
    getTasksForDate,
    getTasksForDateRange,
    getFocusTask,
    refetch: loadData,
  };
}
