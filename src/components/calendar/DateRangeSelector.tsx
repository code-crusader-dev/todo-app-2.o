import { useState, useCallback, useRef, useEffect } from "react";
import { format, isSameDay, isBefore, isAfter, parseISO, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  onRangeSelect: (startDate: Date, endDate: Date) => void;
  children: (props: {
    isSelecting: boolean;
    selectionStart: Date | null;
    selectionEnd: Date | null;
    handleMouseDown: (date: Date, e: React.MouseEvent) => void;
    handleMouseEnter: (date: Date) => void;
    handleMouseUp: (date: Date) => void;
    isInSelection: (date: Date) => boolean;
    isSelectionStart: (date: Date) => boolean;
    isSelectionEnd: (date: Date) => boolean;
  }) => React.ReactNode;
}

export function DateRangeSelector({ onRangeSelect, children }: DateRangeSelectorProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((date: Date, e: React.MouseEvent) => {
    // Only start selection on left click
    if (e.button !== 0) return;
    
    setIsSelecting(true);
    setSelectionStart(date);
    setSelectionEnd(date);
  }, []);

  const handleMouseEnter = useCallback((date: Date) => {
    if (isSelecting && selectionStart) {
      setSelectionEnd(date);
    }
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback((date: Date) => {
    if (isSelecting && selectionStart) {
      const finalEnd = selectionEnd || date;
      
      // Normalize order (start should be before end)
      const start = isBefore(selectionStart, finalEnd) ? selectionStart : finalEnd;
      const end = isBefore(selectionStart, finalEnd) ? finalEnd : selectionStart;
      
      onRangeSelect(start, end);
      
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  }, [isSelecting, selectionStart, selectionEnd, onRangeSelect]);

  // Handle mouse up outside the calendar
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSelecting && selectionStart && selectionEnd) {
        const start = isBefore(selectionStart, selectionEnd) ? selectionStart : selectionEnd;
        const end = isBefore(selectionStart, selectionEnd) ? selectionEnd : selectionStart;
        onRangeSelect(start, end);
      }
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isSelecting, selectionStart, selectionEnd, onRangeSelect]);

  const isInSelection = useCallback((date: Date): boolean => {
    if (!selectionStart || !selectionEnd) return false;
    
    const start = isBefore(selectionStart, selectionEnd) ? selectionStart : selectionEnd;
    const end = isBefore(selectionStart, selectionEnd) ? selectionEnd : selectionStart;
    
    return !isBefore(date, start) && !isAfter(date, end);
  }, [selectionStart, selectionEnd]);

  const isSelectionStart = useCallback((date: Date): boolean => {
    if (!selectionStart || !selectionEnd) return false;
    const start = isBefore(selectionStart, selectionEnd) ? selectionStart : selectionEnd;
    return isSameDay(date, start);
  }, [selectionStart, selectionEnd]);

  const isSelectionEnd = useCallback((date: Date): boolean => {
    if (!selectionStart || !selectionEnd) return false;
    const end = isBefore(selectionStart, selectionEnd) ? selectionEnd : selectionStart;
    return isSameDay(date, end);
  }, [selectionStart, selectionEnd]);

  return (
    <div ref={containerRef} className="select-none">
      {children({
        isSelecting,
        selectionStart,
        selectionEnd,
        handleMouseDown,
        handleMouseEnter,
        handleMouseUp,
        isInSelection,
        isSelectionStart,
        isSelectionEnd,
      })}
    </div>
  );
}
