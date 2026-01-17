import { cn } from "@/lib/utils";

interface ResultCardProps {
  label: string;
  value: string;
  className?: string;
  variant?: "default" | "highlight";
}

export function ResultCard({ label, value, className, variant = "default" }: ResultCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 border animate-fade-in",
        variant === "default" && "bg-secondary/50 border-border",
        variant === "highlight" && "bg-accent border-primary/20",
        className
      )}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={cn(
        "font-mono text-lg break-all",
        variant === "highlight" ? "text-accent-foreground font-semibold" : "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}
