import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

export function Header() {
  const today = new Date();
  const dayName = format(today, "EEEE");
  const dateStr = format(today, "MMMM d, yyyy");

  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CalendarDays className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {dayName}
          </h1>
        </div>
      </div>
      <p className="text-muted-foreground mt-4">
        Let's make today productive! ✨
      </p>
    </header>
  );
}
