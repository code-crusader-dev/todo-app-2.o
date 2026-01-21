import { useState, useCallback } from "react";
import { format } from "date-fns";
import { useLocalTasks } from "@/hooks/useLocalTasks";
import { useTheme } from "@/hooks/useTheme";
import { useReminders } from "@/hooks/useReminders";
import { Task, TaskFormData } from "@/types/task";
import { Header } from "@/components/Header";
import { FocusTask } from "@/components/FocusTask";
import { ProgressMeter } from "@/components/ProgressMeter";
import { TaskItem } from "@/components/TaskItem";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { EmptyState } from "@/components/EmptyState";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TaskDetailDialog } from "@/components/TaskDetailDialog";
import { Sidebar } from "@/components/Sidebar";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List, Sun, Moon, Image } from "lucide-react";

const Index = () => {
  const {
    tasks, groups, allTags, isLoaded,
    addTask, toggleComplete, deleteTask, setFocusTask, editTask,
    updateTaskDates, updateTaskGroup,
    addGroup, updateGroup, deleteGroup,
    getTodaysTasks, getTasksForDateRange, getFocusTask,
  } = useLocalTasks();

  const { isDark, toggleTheme, backgroundImage, setBackgroundImage } = useTheme();
  useReminders(tasks);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const todaysTasks = getTodaysTasks();
  const focusTask = getFocusTask();

  const filteredTasks = selectedGroupId
    ? todaysTasks.filter(t => t.group_id === selectedGroupId)
    : todaysTasks;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.is_focus && !b.is_focus) return -1;
    if (!a.is_focus && b.is_focus) return 1;
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const incompleteTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBackgroundImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedEndDate(null);
    setAddDialogOpen(true);
  }, []);

  const handleRangeSelect = useCallback((startDate: Date, endDate: Date) => {
    setSelectedDate(startDate);
    setSelectedEndDate(endDate);
    setAddDialogOpen(true);
  }, []);

  const handleNewTask = useCallback(() => {
    setSelectedDate(new Date());
    setSelectedEndDate(null);
    setAddDialogOpen(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background transition-colors"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : undefined}
    >
      <div className={backgroundImage ? 'min-h-screen bg-background/80 backdrop-blur-sm' : ''}>
        <div className="flex">
          <Sidebar
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onAddGroup={addGroup}
            onUpdateGroup={updateGroup}
            onDeleteGroup={deleteGroup}
            taskCounts={groups.reduce((acc, g) => ({ ...acc, [g.id]: todaysTasks.filter(t => t.group_id === g.id).length }), {})}
          />

          <div className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12">
            <div className="flex items-start justify-between mb-6">
              <Header />
              <div className="flex items-center gap-2">
                <KeyboardShortcutsHelp />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundChange} />
                  <Button variant="ghost" size="icon" asChild><span><Image className="h-4 w-4" /></span></Button>
                </label>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <FocusTask task={focusTask} groups={groups} />
              <ProgressMeter tasks={filteredTasks} />
            </div>

            <Tabs value={view} onValueChange={(v) => setView(v as "list" | "calendar")} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="list" className="gap-2"><List className="h-4 w-4" />List</TabsTrigger>
                  <TabsTrigger value="calendar" className="gap-2"><CalendarDays className="h-4 w-4" />Calendar</TabsTrigger>
                </TabsList>
                <AddTaskDialog 
                  onAdd={addTask} 
                  groups={groups} 
                  existingTags={allTags} 
                  defaultDate={selectedDate || undefined}
                  defaultEndDate={selectedEndDate || undefined}
                  open={addDialogOpen}
                  onOpenChange={setAddDialogOpen}
                />
              </div>

              <TabsContent value="list" className="mt-0">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedGroupId ? groups.find(g => g.id === selectedGroupId)?.name : "Today's Tasks"}
                  </h2>
                </div>
                {filteredTasks.length === 0 ? <EmptyState /> : (
                  <div className="space-y-3">
                    {incompleteTasks.map((task) => (
                      <TaskItem key={task.id} task={task} groups={groups} onToggle={toggleComplete} onDelete={deleteTask} onSetFocus={setFocusTask} onEdit={editTask} draggable />
                    ))}
                    {completedTasks.length > 0 && incompleteTasks.length > 0 && (
                      <div className="pt-4 pb-2"><p className="text-sm text-muted-foreground font-medium">Completed ({completedTasks.length})</p></div>
                    )}
                    {completedTasks.map((task) => (
                      <TaskItem key={task.id} task={task} groups={groups} onToggle={toggleComplete} onDelete={deleteTask} onSetFocus={setFocusTask} onEdit={editTask} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <CalendarView
                  tasks={tasks}
                  groups={groups}
                  getTasksForDateRange={getTasksForDateRange}
                  onDateClick={handleDateClick}
                  onTaskClick={(task) => setSelectedTask(task)}
                  onTaskMove={updateTaskDates}
                  onRangeSelect={handleRangeSelect}
                  onSetFocus={setFocusTask}
                  onNewTask={handleNewTask}
                />
              </TabsContent>
            </Tabs>

            <TaskDetailDialog
              task={selectedTask}
              groups={groups}
              existingTags={allTags}
              onClose={() => setSelectedTask(null)}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onSetFocus={setFocusTask}
              onEdit={editTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
