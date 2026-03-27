import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
} from "react";
import { cn } from "./cn";

const TabsContext = createContext(null);

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("space-y-4", className)} data-value={value}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  const ctx = useContext(TabsContext);

  return (
    <div
      className={cn(
        "flex h-10 w-full min-w-0 items-center gap-0.5 overflow-x-auto overflow-y-hidden rounded-lg border border-slate-200 bg-slate-100 p-1 text-slate-600",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        "sm:w-auto sm:inline-flex sm:flex-initial",
        className,
      )}
    >
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const tabValue = child.props.value;
        return cloneElement(child, {
          current:
            child.props.current !== undefined ? child.props.current : ctx?.value,
          onClick:
            child.props.onClick ?? (() => ctx?.onValueChange?.(tabValue)),
        });
      })}
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
