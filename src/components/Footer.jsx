import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-slate-400">
      <div className="mx-auto flex max-w-[1120px] flex-wrap gap-12 px-6 py-14">
        <div className="min-w-0 flex-[0_0_240px]">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-base">📅</span>
            <span className="text-base font-bold tracking-tight text-white">Booklyft</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            AI-powered appointment booking<br />on WhatsApp — for every business.
          </p>
        </div>
        <div className="flex flex-1 flex-wrap gap-12">
          <div className="flex min-w-[120px] flex-col gap-2">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-300">Product</div>
            <Link to="/features" className="text-sm text-slate-500 transition-colors hover:text-white">Features</Link>
            <Link to="/pricing" className="text-sm text-slate-500 transition-colors hover:text-white">Pricing</Link>
            <Link to="/dashboard/signup" className="text-sm text-slate-500 transition-colors hover:text-white">Get Started</Link>
          </div>
          <div className="flex min-w-[120px] flex-col gap-2">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-300">Account</div>
            <Link to="/dashboard/signup" className="text-sm text-slate-500 transition-colors hover:text-white">Sign Up</Link>
            <Link to="/dashboard/login" className="text-sm text-slate-500 transition-colors hover:text-white">Sign In</Link>
          </div>
          <div className="flex min-w-[120px] flex-col gap-2">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-300">Business Types</div>
            <span className="text-sm text-slate-500">Salons & Spas</span>
            <span className="text-sm text-slate-500">Clinics & Doctors</span>
            <span className="text-sm text-slate-500">Dentists</span>
            <span className="text-sm text-slate-500">Tutors & Coaches</span>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-2 border-t border-white/10 px-6 py-5 text-sm text-slate-500">
        <span>© {new Date().getFullYear()} Booklyft. All rights reserved.</span>
        <span>Built with ❤️ for small businesses</span>
      </div>
    </footer>
  );
}
