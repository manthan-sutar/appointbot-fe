import { Separator } from './ui/separator';
import { SidebarTrigger } from './ui/sidebar';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

export function SiteHeader({ title, owner, onLogout }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 h-4" />
      <h1 className="flex-1 min-w-0 truncate font-display text-sm font-semibold tracking-tight">
        {title}
      </h1>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className="hidden sm:block max-w-[160px] truncate text-xs text-muted-foreground">
          {owner?.email}
        </span>
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-xs font-semibold">
            {(owner?.email?.[0] || '?').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex h-8 text-xs"
          onClick={onLogout}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
