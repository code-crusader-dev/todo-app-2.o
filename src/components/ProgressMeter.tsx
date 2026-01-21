import { Task } from "@/types/task";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface ProgressMeterProps {
  tasks: Task[];
}

export function ProgressMeter({ tasks }: ProgressMeterProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">Today's Progress</span>
        </div>
        <span className="text-sm font-semibold text-primary">
          {completed}/{total} done
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {percentage === 100 && (
        <p className="mt-3 text-sm text-success font-medium animate-fade-in">
          🎉 Amazing! All tasks completed!
        </p>
      )}
    </div>
  );
}
