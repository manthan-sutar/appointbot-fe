import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Signup() {
  const { owner, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && owner) {
      navigate(owner.onboarded ? '/dashboard/' : '/dashboard/onboarding', { replace: true });
    }
  }, [authLoading, owner, navigate]);
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');

    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', { email: form.email, password: form.password });
      login(data.token, data.owner);
      navigate('/dashboard/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
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
          <h2 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-white">Your AI booking assistant<br />is waiting.</h2>
          <p className="mb-8 text-sm text-slate-400">Set up in 5 minutes. No technical skills needed.</p>
          <div className="flex flex-col gap-4">
            {[
              { icon: '🤖', text: 'AI understands natural language bookings' },
              { icon: '💬', text: 'Works on WhatsApp — no app needed' },
              { icon: '⚡', text: 'Free plan available, forever' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{t.icon}</span>
                <span className="text-sm text-slate-300">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 pt-6">
          <span className="text-sm text-slate-500">Already have an account?</span>
          <Link to="/dashboard/login" className="text-sm font-semibold text-emerald-400 no-underline hover:text-emerald-300">Sign in →</Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-muted/30 px-6 py-10">
        <Card className="w-full max-w-[420px]">
          <CardHeader>
            <CardTitle>Start your 14-day free trial</CardTitle>
            <CardDescription>No credit card required · Cancel anytime</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Free Account →'}
              </Button>
              <p className="mt-1 text-center text-xs text-muted-foreground">No credit card required</p>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/dashboard/login" className="font-semibold text-foreground no-underline hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
