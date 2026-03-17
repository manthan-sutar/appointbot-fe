import { cn } from "./cn";

const variants = {
  default:
    "bg-secondary text-secondary-foreground border border-secondary/60",
  success:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning:
    "bg-amber-50 text-amber-700 border border-amber-200",
};

export function Badge({ variant = "default", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant] || variants.default,
        className,
      )}
      {...props}
    />
  );
}
