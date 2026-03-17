import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const NAV = [
  { to: '/dashboard/',             label: 'Dashboard',    icon: '📊' },
  { to: '/dashboard/appointments', label: 'Appointments', icon: '📅' },
  { to: '/dashboard/settings',     label: 'Settings',     icon: '⚙️' },
];

export default function Layout({ children }) {
  const { owner, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/dashboard/login');
  }

  function isActive(to) {
    return location.pathname === to || (to !== '/dashboard/' && location.pathname.startsWith(to));
  }

  return (
    <div className="ab-layout bg-slate-50 text-slate-900">
      {/* Slim top bar — unified dashboard chrome */}
      <div className="ab-top-bar h-0.5 w-full flex-shrink-0 bg-slate-800" aria-hidden />

      <div className="ab-layout-inner flex flex-1 min-h-0">
      {/* ── Sidebar (hidden on mobile via CSS) ─────────────────────────── */}
      <aside className="ab-sidebar flex flex-col border-r border-slate-200/80 bg-slate-900 text-slate-50">
        <div className="border-b border-white/10 px-5 py-4">
          <Link to="/dashboard/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-base">📅</span>
            <span className="text-base font-bold">appointbot</span>
          </Link>
        </div>

        {owner?.businessId && (
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs">
            <div className="max-w-[140px] truncate font-medium text-slate-300">
              {owner.email?.split('@')[0] || 'My Business'}
            </div>
            <span className="rounded-md bg-slate-700/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-200">
              Free
            </span>
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-3 text-sm">
          {NAV.map(({ to, label, icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-indigo-400" />
                )}
                <span className="text-[15px] opacity-90">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-white/10 px-4 py-4">
          {owner?.slug && (
            <a
              href={`/chat/${owner.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              💬 <span>Open Chat UI</span>
            </a>
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-200">
              {(owner?.email?.[0] || '?').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] text-slate-400">
                {owner?.email}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="mt-0.5 h-auto p-0 text-[11px] text-slate-500 hover:text-slate-200"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="ab-main">
        {children}
      </main>
      </div>

      {/* ── Bottom nav (mobile only, shown via CSS) ─────────────────────── */}
      <nav className="ab-bottom-nav">
        {NAV.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={isActive(to) ? 'active' : ''}>
            <span className="icon">{icon}</span>
            <span>{label.split(' ')[0]}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center justify-center gap-1 border-l border-white/5 bg-transparent text-[10px] font-semibold text-white/60"
        >
          <span className="icon text-xl">🚪</span>
          <span>Sign out</span>
        </button>
      </nav>
    </div>
  );
}
