import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  CalendarIcon,
  UsersIcon,
  Settings2Icon,
  MegaphoneIcon,
  WrenchIcon,
  UserIcon,
  PlusIcon,
  ClockIcon,
  BarChartIcon,
  FileTextIcon,
  MessageSquareIcon,
  ChevronRightIcon,
  BriefcaseIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from './ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { NavUser } from './nav-user';

const NAV_MAIN = [
  { to: '/dashboard/', label: 'Dashboard', icon: LayoutDashboardIcon },
  { to: '/dashboard/appointments', label: 'Appointments', icon: CalendarIcon },
  { to: '/dashboard/leads', label: 'Lead analytics', icon: BarChartIcon },
  { to: '/dashboard/customers', label: 'Customers', icon: UsersIcon },
  {
    label: 'Operate',
    icon: WrenchIcon,
    items: [
      { to: '/dashboard/operate/services', label: 'Services', icon: BriefcaseIcon },
      { to: '/dashboard/operate/staff', label: 'Staff', icon: UserIcon },
    ],
  },
  {
    label: 'Campaigns',
    icon: MegaphoneIcon,
    items: [
      { to: '/dashboard/campaigns/create', label: 'Create', icon: PlusIcon },
      { to: '/dashboard/campaigns/history', label: 'History', icon: ClockIcon },
      { to: '/dashboard/campaigns/performance', label: 'Performance', icon: BarChartIcon },
      { to: '/dashboard/campaigns/templates', label: 'Templates', icon: FileTextIcon },
    ],
  },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings2Icon },
];

function planBadgeLabel(plan) {
  const p = String(plan ?? 'free').toLowerCase();
  if (p === 'business') return 'Business';
  if (p === 'pro') return 'Pro';
  return 'Free';
}

export function AppSidebar({ owner, onLogout, ...props }) {
  const location = useLocation();
  /** null = still loading; avoids flashing "Free" before GET /business/plan returns */
  const [planLabel, setPlanLabel] = useState(null);

  useEffect(() => {
    if (!owner?.businessId) {
      setPlanLabel(owner ? '—' : null);
      return;
    }
    let cancelled = false;
    api
      .get('/business/plan')
      .then(({ data }) => {
        if (!cancelled) setPlanLabel(planBadgeLabel(data?.plan));
      })
      .catch(() => {
        if (!cancelled) setPlanLabel(planBadgeLabel('free'));
      });
    return () => {
      cancelled = true;
    };
  }, [owner?.businessId, owner?.id]);

  function isActive(to) {
    return location.pathname === to || (to !== '/dashboard/' && location.pathname.startsWith(to));
  }

  function isGroupActive(items) {
    return items?.some(item => isActive(item.to));
  }

  const chatUrl = owner?.slug
    ? `${import.meta.env.VITE_API_URL || ''}/chat/${owner.slug}`
    : null;

  const user = {
    name: owner?.email?.split('@')[0] || 'Account',
    email: owner?.email || '',
    avatar: '',
    plan: planLabel === null ? undefined : planLabel,
    onLogout,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard/">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background text-base">
                  📅
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Appointbot</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {planLabel === null ? '…' : planLabel}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_MAIN.map(item => {
              /* ── Collapsible group ── */
              if (item.items) {
                const groupActive = isGroupActive(item.items);
                return (
                  <Collapsible
                    key={item.label}
                    asChild
                    defaultOpen={groupActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.label} isActive={groupActive}>
                          <item.icon />
                          <span>{item.label}</span>
                          <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map(sub => (
                            <SidebarMenuSubItem key={sub.to}>
                              <SidebarMenuSubButton asChild isActive={isActive(sub.to)}>
                                <Link to={sub.to}>
                                  <sub.icon />
                                  <span>{sub.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              /* ── Regular link ── */
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={isActive(item.to)}>
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Chat UI shortcut — pinned to bottom of content */}
        {chatUrl && (
          <SidebarGroup className="mt-auto">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Open Chat UI" variant="outline">
                  <a href={chatUrl} target="_blank" rel="noreferrer">
                    <MessageSquareIcon />
                    <span>Open Chat UI</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
