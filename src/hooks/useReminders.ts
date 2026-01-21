import { useEffect, useCallback, useRef } from 'react';
import { Task, formatReminderTime } from '@/types/task';
import { parseISO, addMinutes, isBefore, isAfter, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function useReminders(tasks: Task[], onReminderTriggered?: (task: Task) => void) {
  const { toast } = useToast();
  const notifiedTasksRef = useRef<Map<string, Set<number>>>(new Map());

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  // Show notification
  const showNotification = useCallback((task: Task, reminderTime: number) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('Task Reminder', {
        body: `${task.title} - ${formatReminderTime(reminderTime)}`,
        icon: '/favicon.ico',
        tag: `${task.id}-${reminderTime}`,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        onReminderTriggered?.(task);
      };
    }

    // Also show in-app toast
    toast({
      title: '⏰ Reminder',
      description: `${task.title} - ${formatReminderTime(reminderTime)}`,
      duration: 10000,
    });
  }, [toast, onReminderTriggered]);

  // Check for due reminders
  const checkReminders = useCallback(() => {
    const now = new Date();

    tasks.forEach(task => {
      // Skip if no reminder, completed, or no times set
      if (!task.reminder?.enabled || task.completed || !task.reminder.times?.length) {
        return;
      }

      // Skip if not today
      if (!isToday(parseISO(task.start_date))) {
        return;
      }

      // Initialize notified set for this task if not exists
      if (!notifiedTasksRef.current.has(task.id)) {
        notifiedTasksRef.current.set(task.id, new Set());
      }
      const notifiedTimes = notifiedTasksRef.current.get(task.id)!;

      // Check each reminder time
      if (task.start_time) {
        const [hours, minutes] = task.start_time.split(':').map(Number);
        const taskTime = parseISO(task.start_date);
        taskTime.setHours(hours, minutes, 0, 0);

        task.reminder.times.forEach(reminderMinutes => {
          // Skip if already notified for this time
          if (notifiedTimes.has(reminderMinutes)) return;

          const reminderTime = addMinutes(taskTime, -reminderMinutes);

          // Check if reminder should trigger
          if (isAfter(now, reminderTime) && isBefore(now, taskTime)) {
            notifiedTimes.add(reminderMinutes);
            showNotification(task, reminderMinutes);
          }
        });
      }
    });
  }, [tasks, showNotification]);

  // Set up interval to check reminders
  useEffect(() => {
    requestPermission();

    // Check immediately
    checkReminders();

    // Check every minute
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [requestPermission, checkReminders]);

  // Reset notified tasks at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      notifiedTasksRef.current.clear();
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return {
    requestPermission,
    notificationSupported: 'Notification' in window,
    permissionGranted: typeof Notification !== 'undefined' && Notification.permission === 'granted',
  };
}
