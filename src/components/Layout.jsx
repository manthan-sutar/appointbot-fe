import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { AppSidebar } from './AppSidebar';

const NAV = [
  { to: '/dashboard/', label: 'Dashboard', icon: '📊' },
  { to: '/dashboard/appointments', label: 'Appointments', icon: '📅' },
  { to: '/dashboard/customers', label: 'Customers', icon: '🧾' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function Layout({ children }) {
  const { owner, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/dashboard/login');
  }

  function isActive(to) {
    return location.pathname === to || (to !== '/dashboard/' && location.pathname.startsWith(to));
  }

  function getBreadcrumbs() {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', to: '/dashboard/' }];

    if (segments.length > 1) {
      const section = segments[1];
      if (section === 'appointments') {
        breadcrumbs.push({ label: 'Appointments', to: '/dashboard/appointments' });
      } else if (section === 'customers') {
        breadcrumbs.push({ label: 'Customers', to: '/dashboard/customers' });
      } else if (section === 'settings') {
        breadcrumbs.push({ label: 'Settings', to: '/dashboard/settings' });
      } else if (section === 'operate') {
        breadcrumbs.push({ label: 'Operate', to: null });
        if (segments[2] === 'services') breadcrumbs.push({ label: 'Services', to: '/dashboard/operate/services' });
        if (segments[2] === 'staff') breadcrumbs.push({ label: 'Staff', to: '/dashboard/operate/staff' });
      } else if (section === 'campaigns') {
        breadcrumbs.push({ label: 'Campaigns', to: null });
        if (segments[2] === 'create') breadcrumbs.push({ label: 'Create', to: '/dashboard/campaigns/create' });
        if (segments[2] === 'history') breadcrumbs.push({ label: 'History', to: '/dashboard/campaigns/history' });
        if (segments[2] === 'performance') breadcrumbs.push({ label: 'Performance', to: '/dashboard/campaigns/performance' });
        if (segments[2] === 'templates') breadcrumbs.push({ label: 'Templates', to: '/dashboard/campaigns/templates' });
      }
    }

    return breadcrumbs;
  }

  const breadcrumbs = getBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-2 flex-1">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, idx) => (
                  <span key={idx} className="flex items-center">
                    {idx > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {idx === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : crumb.to ? (
                        <BreadcrumbLink asChild>
                          <Link to={crumb.to}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <span className="text-muted-foreground">{crumb.label}</span>
                      )}
                    </BreadcrumbItem>
                  </span>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
                  {(owner?.email?.[0] || '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block min-w-0">
                <div className="truncate text-xs text-muted-foreground">{owner?.email}</div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs hidden sm:inline-flex"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          {children}
        </div>

        {/* Mobile bottom navigation */}
        <nav className="ab-bottom-nav">
          {NAV.map(({ to, label, icon }) => (
            <Link key={to} to={to} className={isActive(to) ? 'active' : ''}>
              <span className="icon">{icon}</span>
              <span>{label.split(' ')[0]}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-1 flex-col items-center justify-center gap-1 border-l border-sidebar-border bg-transparent text-[10px] font-semibold text-sidebar-foreground/60"
          >
            <span className="icon text-xl">🚪</span>
            <span>Sign out</span>
          </button>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}
