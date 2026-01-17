import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
  className?: string;
}

export function ErrorNotification({ message, onClose, className }: ErrorNotificationProps) {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 animate-slide-in",
        className
      )}
    >
      <div className="bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-between gap-3 shadow-elevated">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-destructive-foreground/10 rounded-md transition-base"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
