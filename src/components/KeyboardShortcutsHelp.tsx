import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";
import { KEYBOARD_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsHelpProps {
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsHelp({ trigger }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" title="Keyboard shortcuts">
            <Keyboard className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 mt-4">
          {KEYBOARD_SHORTCUTS.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
