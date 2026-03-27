import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const NAV = [
  { to: '/dashboard/', label: 'Dashboard', icon: '📊' },
  { to: '/dashboard/appointments', label: 'Appointments', icon: '📅' },
  {
    label: 'Operate',
    icon: '🏗️',
    submenu: [
      { to: '/dashboard/operate/services', label: 'Services', icon: '📋' },
      { to: '/dashboard/operate/staff', label: 'Staff', icon: '👤' },
    ],
  },
  { to: '/dashboard/customers', label: 'Customers', icon: '🧾' },
  {
    label: 'Campaigns',
    icon: '📣',
    submenu: [
      { to: '/dashboard/campaigns/create', label: 'Create', icon: '➕' },
      { to: '/dashboard/campaigns/history', label: 'History', icon: '📜' },
      { to: '/dashboard/campaigns/performance', label: 'Performance', icon: '📊' },
      { to: '/dashboard/campaigns/templates', label: 'Templates', icon: '📝' },
    ],
  },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

function planBadgeLabel(plan) {
  if (plan === 'business') return 'Business';
  if (plan === 'pro') return 'Pro';
  return 'Free';
}

export function AppSidebar() {
  const { owner, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [planLabel, setPlanLabel] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);

  useEffect(() => {
    if (!owner?.businessId) return undefined;
    let cancelled = false;
    api
      .get('/business/plan')
      .then(({ data }) => {
        if (!cancelled) setPlanLabel(planBadgeLabel(data?.plan));
      })
      .catch(() => {
        if (!cancelled) setPlanLabel('Free');
      });
    return () => {
      cancelled = true;
    };
  }, [owner?.businessId]);

  function handleLogout() {
    logout();
    navigate('/dashboard/login');
  }

  function isActive(to) {
    return location.pathname === to || (to !== '/dashboard/' && location.pathname.startsWith(to));
  }

  function isSubmenuActive(submenuItems) {
    return submenuItems?.some(item => isActive(item.to));
  }

  function toggleMenu(label) {
    setExpandedMenu(prev => (prev === label ? null : label));
  }

  useEffect(() => {
    NAV.forEach(item => {
      if (item.submenu && isSubmenuActive(item.submenu)) {
        setExpandedMenu(item.label);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Link to="/dashboard/" className="flex items-center gap-2.5 text-sidebar-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-base">
              📅
            </span>
            <span className="text-base font-bold group-data-[collapsible=icon]:hidden">appointbot</span>
          </Link>
        </div>

        {owner?.businessId && (
          <div className="flex items-center justify-between border-y border-sidebar-border px-3 py-2 text-xs group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:py-0">
            <div className="max-w-[140px] truncate font-medium text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              {owner.email?.split('@')[0] || 'My Business'}
            </div>
            <span className="rounded-md bg-sidebar-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sidebar-accent-foreground">
              {planLabel === null ? '…' : planLabel}
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(item => {
                if (item.submenu) {
                  const isExpanded = expandedMenu === item.label;
                  const hasActiveChild = isSubmenuActive(item.submenu);
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        onClick={() => toggleMenu(item.label)}
                        isActive={hasActiveChild}
                        tooltip={item.label}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                        <ChevronRight
                          className={`ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </SidebarMenuButton>
                      {isExpanded && (
                        <SidebarMenuSub>
                          {item.submenu.map(subItem => {
                            const subActive = isActive(subItem.to);
                            return (
                              <SidebarMenuSubItem key={subItem.to}>
                                <SidebarMenuSubButton render={<Link to={subItem.to} />} isActive={subActive}>
                                  <span className="text-sm">{subItem.icon}</span>
                                  <span>{subItem.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                const active = isActive(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton render={<Link to={item.to} />} isActive={active} tooltip={item.label}>
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {owner?.businessId && (
          <div className="space-y-2">
            <a
              href={`${import.meta.env.VITE_API_URL || window.location.origin}/chat/${owner.slug || 'default'}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 group-data-[collapsible=icon]:aspect-square group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
            >
              <span className="text-base">💬</span>
              <span className="group-data-[collapsible=icon]:hidden">Open Chat UI</span>
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-2 hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
                      {(owner?.email?.[0] || '?').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
                    <div className="truncate text-xs font-medium text-sidebar-foreground max-w-[140px]">
                      {owner.email?.split('@')[0] || 'My Business'}
                    </div>
                    <div className="truncate text-[10px] text-sidebar-foreground/60 max-w-[140px]">
                      {planLabel === null ? '…' : planLabel}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs font-medium">{owner.email?.split('@')[0] || 'Account'}</div>
                    <div className="text-[10px] font-normal text-muted-foreground">{owner.email}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
