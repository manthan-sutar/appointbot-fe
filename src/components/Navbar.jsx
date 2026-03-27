import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loc = useLocation();

  const isActive = (path) => loc.pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-base">📅</span>
          <span>Booklyft</span>
        </Link>

        {/* Desktop links */}
        <div className="ab-nav-links hidden items-center gap-1 md:flex">
          <Link
            to="/features"
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              isActive('/features')
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              isActive('/pricing')
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Pricing
          </Link>
        </div>

        {/* Desktop actions */}
        <div className="ab-nav-actions ml-auto hidden items-center gap-2 md:flex">
          <Link
            to="/dashboard/login"
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Sign In
          </Link>
          <Button
            asChild
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Link to="/dashboard/signup">
              Try for Free
            </Link>
          </Button>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="ab-hamburger ml-auto flex flex-col gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 md:hidden"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span className={`h-0.5 w-5 rounded bg-slate-900 transition ${menuOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
          <span className={`h-0.5 w-5 rounded bg-slate-900 transition ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
          <span className={`h-0.5 w-5 rounded bg-slate-900 transition ${menuOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-0.5">
            <Link
              to="/features"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Pricing
            </Link>
            <Link
              to="/dashboard/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard/signup"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Try for Free →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
