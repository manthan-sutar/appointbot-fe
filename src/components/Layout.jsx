import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { SiteHeader } from './SiteHeader';

function getPageTitle(pathname) {
  if (pathname === '/dashboard/') return 'Dashboard';
  if (pathname.startsWith('/dashboard/leads')) return 'Lead analytics';
  if (pathname.startsWith('/dashboard/appointments')) return 'Appointments';
  if (pathname.startsWith('/dashboard/customers')) return 'Customers';
  if (pathname.startsWith('/dashboard/settings')) return 'Settings';
  if (pathname.startsWith('/dashboard/operate/services')) return 'Services';
  if (pathname.startsWith('/dashboard/operate/staff')) return 'Staff';
  if (pathname.startsWith('/dashboard/operate/working-hours')) return 'Working hours';
  if (pathname.startsWith('/dashboard/campaigns/create')) return 'Create Campaign';
  if (pathname.startsWith('/dashboard/campaigns/history')) return 'Campaign History';
  if (pathname.startsWith('/dashboard/campaigns/performance')) return 'Performance';
  if (pathname.startsWith('/dashboard/campaigns/templates')) return 'Templates';
  return 'Dashboard';
}

export default function Layout({ children }) {
  const { owner, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/dashboard/login');
  }

  const pageTitle = getPageTitle(location.pathname);

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': '220px',
        '--sidebar-width-icon': '48px',
        '--header-height': '56px',
      }}
    >
      <AppSidebar owner={owner} onLogout={handleLogout} />
      <SidebarInset>
        <SiteHeader title={pageTitle} owner={owner} onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
