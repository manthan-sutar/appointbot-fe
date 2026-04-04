import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Signup() {
  const { owner, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && owner) {
      navigate(owner.onboarded ? '/dashboard/' : '/dashboard/onboarding', { replace: true });
    }
  }, [authLoading, owner, navigate]);

  return (
    <div className="flex min-h-screen font-sans">
      <div className="flex flex-[0_0_420px] flex-col bg-gradient-to-b from-slate-900 to-slate-800 px-12 py-10 text-white max-md:flex-1">
        <Link to="/" className="mb-auto flex items-center gap-2.5 no-underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xl">📅</span>
          <span className="text-lg font-bold tracking-tight text-white">Booklyft</span>
        </Link>
        <div className="flex flex-1 flex-col justify-center pb-10">
          <h2 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-white">Get started with a demo</h2>
          <p className="mb-8 text-sm text-slate-400">
            Self-service signup is not available. Request a demo and we&apos;ll create your account after we speak.
          </p>
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 pt-6">
          <span className="text-sm text-slate-500">Already have an account?</span>
          <Link to="/dashboard/login" className="text-sm font-semibold text-emerald-400 no-underline hover:text-emerald-300">Sign in →</Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-muted/30 px-6 py-10">
        <Card className="w-full max-w-[420px]">
          <CardHeader>
            <CardTitle>Direct signup disabled</CardTitle>
            <CardDescription>
              Self-service signup is currently disabled. Use Request Demo instead — we&apos;ll contact you and set everything up.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild className="w-full bg-indigo-600 font-semibold hover:bg-indigo-700">
              <Link to="/demo">Request demo</Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/dashboard/login" className="font-semibold text-foreground no-underline hover:underline">Sign in</Link>
              {' '}if you already have an account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
