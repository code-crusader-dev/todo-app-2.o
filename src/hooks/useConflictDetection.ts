import { useMemo } from 'react';
import { Task } from '@/types/task';
import { parseISO, areIntervalsOverlapping } from 'date-fns';

export interface ConflictInfo {
  taskId: string;
  conflictsWith: string[];
}

export function useConflictDetection(tasks: Task[]) {
  const conflicts = useMemo(() => {
    const conflictMap = new Map<string, string[]>();
    
    // Only check tasks with times set (for time-based conflicts)
    const timedTasks = tasks.filter(t => t.start_time && !t.completed);
    
    for (let i = 0; i < timedTasks.length; i++) {
      for (let j = i + 1; j < timedTasks.length; j++) {
        const taskA = timedTasks[i];
        const taskB = timedTasks[j];
        
        // Check if dates overlap
        const startA = parseISO(taskA.start_date);
        const endA = parseISO(taskA.end_date);
        const startB = parseISO(taskB.start_date);
        const endB = parseISO(taskB.end_date);
        
        const datesOverlap = areIntervalsOverlapping(
          { start: startA, end: endA },
          { start: startB, end: endB },
          { inclusive: true }
        );
        
        if (datesOverlap && taskA.start_time && taskB.start_time) {
          // Check if times overlap (simple check - same start time)
          if (taskA.start_time === taskB.start_time) {
            // Add to conflict map
            if (!conflictMap.has(taskA.id)) {
              conflictMap.set(taskA.id, []);
            }
            if (!conflictMap.has(taskB.id)) {
              conflictMap.set(taskB.id, []);
            }
            conflictMap.get(taskA.id)!.push(taskB.id);
            conflictMap.get(taskB.id)!.push(taskA.id);
          }
        }
      }
    }
    
    return conflictMap;
  }, [tasks]);

  const hasConflict = (taskId: string): boolean => {
    const realId = taskId.includes('-repeat-') ? taskId.split('-repeat-')[0] : taskId;
    return conflicts.has(realId) && conflicts.get(realId)!.length > 0;
  };

  const getConflicts = (taskId: string): string[] => {
    const realId = taskId.includes('-repeat-') ? taskId.split('-repeat-')[0] : taskId;
    return conflicts.get(realId) || [];
  };

  const getConflictingTasks = (taskId: string): Task[] => {
    const conflictIds = getConflicts(taskId);
    return tasks.filter(t => conflictIds.includes(t.id));
  };

  return {
    hasConflict,
    getConflicts,
    getConflictingTasks,
    totalConflicts: conflicts.size,
  };
}
