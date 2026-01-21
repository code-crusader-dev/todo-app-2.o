import { Coffee, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="relative">
        <div className="absolute -top-2 -right-2">
          <Sparkles className="h-6 w-6 text-warning animate-pulse" />
        </div>
        <div className="p-4 bg-accent rounded-2xl">
          <Coffee className="h-12 w-12 text-primary" />
        </div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-foreground">
        Aaj koi task nahi
      </h3>
      <p className="mt-2 text-muted-foreground text-center max-w-xs">
        Chill bhai 😎 Ya phir kuch productive add karo!
      </p>
    </div>
  );
}
