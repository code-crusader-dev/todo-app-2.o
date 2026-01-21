import { useEffect, useCallback } from 'react';

interface KeyboardShortcutHandlers {
  onPrevPeriod?: () => void;
  onNextPeriod?: () => void;
  onToday?: () => void;
  onNewTask?: () => void;
  onToggleView?: () => void;
  onEscape?: () => void;
  onFocusMode?: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if user is typing in an input/textarea
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Arrow keys for navigation
    if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handlers.onPrevPeriod?.();
    } else if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handlers.onNextPeriod?.();
    }
    
    // 't' for today
    else if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handlers.onToday?.();
    }
    
    // 'n' for new task
    else if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handlers.onNewTask?.();
    }
    
    // 'v' to toggle view
    else if (e.key === 'v' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handlers.onToggleView?.();
    }
    
    // 'f' for focus mode
    else if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      handlers.onFocusMode?.();
    }
    
    // Escape
    else if (e.key === 'Escape') {
      e.preventDefault();
      handlers.onEscape?.();
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcuts help text
export const KEYBOARD_SHORTCUTS = [
  { key: '←/→', description: 'Navigate periods' },
  { key: 't', description: 'Go to today' },
  { key: 'n', description: 'New task' },
  { key: 'v', description: 'Toggle view' },
  { key: 'f', description: 'Focus mode' },
  { key: 'Esc', description: 'Close dialogs' },
];
