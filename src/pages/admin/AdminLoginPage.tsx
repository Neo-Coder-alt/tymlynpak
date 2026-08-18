import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export function AdminLoginPage() {
  const { signIn, resetPassword } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [signUpConfirm, setSignUpConfirm] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      notify(error, 'error');
      return;
    }
    notify('Welcome back.');
    navigate(from, { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { notify('Password must be at least 8 characters.', 'error'); return; }
    if (password !== signUpConfirm) { notify('Passwords do not match.', 'error'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) { notify(error.message, 'error'); return; }
    if (data.user) {
      notify('Admin account created. Signing you in...');
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        notify('Account created. Please sign in.', 'info');
        setMode('signin');
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { notify('Enter your email first.', 'error'); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { notify(error, 'error'); return; }
    notify('Password reset email sent.');
    setShowReset(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="absolute top-4 left-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </button>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-serif text-white">Admin Access</h1>
          <p className="text-xs tracking-[0.2em] uppercase text-amber-500/60 mt-2">TYMLYN PAK</p>
        </div>

        {!showReset && mode === 'signin' && (
          <form onSubmit={handleLogin} className="space-y-4 border border-white/5 rounded-lg p-6 bg-zinc-950/50">
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                  placeholder="admin@tymlynpak.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button type="submit" variant="gold" className="w-full" loading={loading}>
              Sign In
            </Button>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-zinc-500 hover:text-amber-400 transition"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setPassword(''); }}
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" /> Create admin
              </button>
            </div>
          </form>
        )}

        {!showReset && mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4 border border-white/5 rounded-lg p-6 bg-zinc-950/50">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 mb-2">
              <p className="text-xs text-amber-400">First-time setup: create your admin account with a strong password (8+ characters). This should only be done once.</p>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                  placeholder="admin@tymlynpak.com"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Password (8+ characters)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="password"
                  value={signUpConfirm}
                  onChange={(e) => setSignUpConfirm(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
            <Button type="submit" variant="gold" className="w-full" loading={loading}>
              Create Admin Account
            </Button>
            <button
              type="button"
              onClick={() => { setMode('signin'); setSignUpConfirm(''); }}
              className="w-full text-xs text-zinc-500 hover:text-amber-400 transition"
            >
              Back to sign in
            </button>
          </form>
        )}

        {showReset && (
          <form onSubmit={handleReset} className="space-y-4 border border-white/5 rounded-lg p-6 bg-zinc-950/50">
            <p className="text-sm text-zinc-400 mb-2">Enter your email to receive a password reset link.</p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                placeholder="admin@tymlynpak.com"
              />
            </div>
            <Button type="submit" variant="gold" className="w-full" loading={loading}>Send Reset Link</Button>
            <button type="button" onClick={() => setShowReset(false)} className="w-full text-xs text-zinc-500 hover:text-amber-400 transition">
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
