import { Button } from '../ui/button';

export function EmptyState({ icon = '📋', title, description, action, actionLabel, onAction }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-3xl">
        {icon}
      </div>
      <div className="text-base font-semibold text-foreground">{title}</div>
      {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
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
