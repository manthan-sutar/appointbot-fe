import { Button } from '../ui/button';

export function EmptyState({ icon = '📋', title, description, action, actionLabel, onAction }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
        {icon}
      </div>
      <div className="text-base font-semibold text-slate-800">{title}</div>
      {description && <div className="mt-1 text-sm text-slate-500">{description}</div>}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
      {onAction && actionLabel && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
