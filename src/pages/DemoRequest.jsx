import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BUSINESS_TYPES = [
  { value: 'salon', label: 'Salon' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'dentist', label: 'Dentist' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'other', label: 'Other' },
];

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export default function DemoRequest() {
  const [form, setForm] = useState({
    business_name: '',
    email: '',
    phone: '',
    business_type: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const email = form.email.trim();
    if (!form.business_name.trim()) return setError('Business name is required');
    if (!email) return setError('Email is required');
    if (!EMAIL_RE.test(email)) return setError('Please enter a valid email address');
    if (!form.phone.trim()) return setError('Phone number is required');
    if (!form.business_type) return setError('Please select a business type');

    setLoading(true);
    try {
      await api.post('/demo/request', {
        business_name: form.business_name.trim(),
        email,
        phone: form.phone.trim(),
        business_type: form.business_type,
        message: form.message.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col font-sans text-slate-900">
      <Navbar />

      <div className="flex flex-1 flex-col bg-gradient-to-b from-slate-50 to-white px-6 py-14 md:py-20">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Booklyft</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Request a demo</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Tell us about your business. We&apos;ll reach out to schedule a walkthrough and set up your account.
            </p>
          </div>

          <Card className="border border-slate-200/80 shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">Contact details</CardTitle>
              <CardDescription>All fields marked required must be filled in.</CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-6 text-center">
                  <p className="text-lg font-semibold text-emerald-900">Thank you!</p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                    We&apos;ve received your demo request and will contact you soon.
                  </p>
                  <Button asChild className="mt-6" variant="outline">
                    <Link to="/">Back to home</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="demo-business">Business name *</Label>
                    <Input
                      id="demo-business"
                      value={form.business_name}
                      onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                      placeholder="e.g. Glow Salon"
                      required
                      autoComplete="organization"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo-email">Work email *</Label>
                    <Input
                      id="demo-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@business.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo-phone">Phone number *</Label>
                    <Input
                      id="demo-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 …"
                      required
                      autoComplete="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo-type">Business type *</Label>
                    <Select
                      value={form.business_type}
                      onValueChange={(v) => setForm((f) => ({ ...f, business_type: v }))}
                    >
                      <SelectTrigger id="demo-type" className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="demo-message">Message (optional)</Label>
                    <Textarea
                      id="demo-message"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Anything we should know — team size, locations, current tools…"
                      rows={4}
                      className="resize-y min-h-[100px]"
                    />
                  </div>

                  <Button type="submit" className="mt-2 w-full bg-indigo-600 py-2.5 font-semibold hover:bg-indigo-700" disabled={loading}>
                    {loading ? 'Sending…' : 'Submit request'}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/dashboard/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
