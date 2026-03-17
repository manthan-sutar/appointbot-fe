import { cn } from "./cn";

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={cn("space-y-4", className)} data-value={value}>
      {children}
    </div>
  );
}

export function TabsList({ children, className }) {
  return (
    <div
      className={cn(
        "flex h-10 w-full min-w-0 items-center gap-0.5 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1 text-slate-600",
        "sm:w-auto sm:inline-flex sm:flex-initial",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, current, onClick, className, children }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium transition-all",
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:text-slate-900",
        className,
      )}
    >
      {children}
    </button>
  );
}
