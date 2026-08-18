import { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export function AdminAccountPage() {
  const { user } = useAuth();
  const notify = useToast();
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const updateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email });
    setSavingEmail(false);
    if (error) { notify(error.message, 'error'); return; }
    notify('Email update initiated. Check inbox to confirm.');
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { notify('Password must be at least 6 characters.', 'error'); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPassword(false);
    if (error) { notify(error.message, 'error'); return; }
    setPassword('');
    notify('Password updated.');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-2xl font-serif text-white">Admin Account</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your credentials</p>
      </div>

      <div className="border border-white/5 rounded-lg p-5 bg-black flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <User className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <p className="text-sm text-white">{user?.email}</p>
          <p className="text-xs text-zinc-500">Account ID: {user?.id.slice(0, 8)}...</p>
        </div>
      </div>

      <form onSubmit={updateEmail} className="border border-white/5 rounded-lg p-5 bg-black space-y-4">
        <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400">Update Email</h2>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <Button type="submit" variant="gold" size="sm" loading={savingEmail}>Update Email</Button>
      </form>

      <form onSubmit={updatePassword} className="border border-white/5 rounded-lg p-5 bg-black space-y-4">
        <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400">Update Password</h2>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <Button type="submit" variant="gold" size="sm" loading={savingPassword}>Update Password</Button>
      </form>
    </div>
  );
}
