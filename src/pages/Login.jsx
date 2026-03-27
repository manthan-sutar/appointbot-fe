import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const { owner, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && owner) {
      navigate(owner.onboarded ? '/dashboard/' : '/dashboard/onboarding', { replace: true });
    }
  }, [authLoading, owner, navigate]);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.owner);
      if (!data.owner.onboarded) {
        navigate('/dashboard/onboarding');
      } else {
        navigate('/dashboard/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen font-sans">
      <div className="flex flex-[0_0_420px] flex-col bg-gradient-to-b from-slate-900 to-slate-800 px-12 py-10 text-white max-md:flex-1">
        <Link to="/" className="mb-auto flex items-center gap-2.5 no-underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xl">📅</span>
          <span className="text-lg font-bold tracking-tight text-white">Booklyft</span>
        </Link>
        <div className="flex flex-1 flex-col justify-center pb-10">
          <h2 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-white">Welcome back.</h2>
          <p className="mb-10 text-sm leading-relaxed text-slate-400">Your AI booking assistant is live and taking appointments right now.</p>
          <div className="flex gap-6">
            {[
              { n: '24/7', label: 'Always available' },
              { n: '< 2s', label: 'Response time' },
              { n: '0', label: 'Phone calls needed' },
            ].map((st, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="text-2xl font-bold text-emerald-400">{st.n}</div>
                <div className="text-xs font-medium text-slate-500">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 pt-6">
          <span className="text-sm text-slate-500">Don't have an account?</span>
          <Link to="/dashboard/signup" className="text-sm font-semibold text-emerald-400 no-underline hover:text-emerald-300">Sign up free →</Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-muted/30 px-6 py-10">
        <Card className="w-full max-w-[420px]">
          <CardHeader>
            <CardTitle>Sign in to your dashboard</CardTitle>
            <CardDescription>Manage bookings, staff, and settings</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email address</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Don't have an account? <Link to="/dashboard/signup" className="font-semibold text-foreground no-underline hover:underline">Sign up free</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
