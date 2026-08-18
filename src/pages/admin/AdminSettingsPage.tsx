import { useEffect, useState } from 'react';
import { Upload, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import { useToast } from '@/store/toast';
import { useSettings } from '@/store/settings';
import { Button } from '@/components/ui/Button';
import { CenterSpinner } from '@/components/ui/Skeletons';
import type { SiteSettings } from '@/types';

export function AdminSettingsPage() {
  const notify = useToast();
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (!form) return <CenterSpinner label="Loading settings..." />;

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const handleUpload = async (field: 'logo_url' | 'favicon_url' | 'hero_image_url' | 'banner_image_url', file: File) => {
    setUploadingField(field);
    const { url, error } = await uploadImage(file, 'site');
    setUploadingField(null);
    if (error) { notify(error, 'error'); return; }
    set(field, url);
    notify('Image uploaded. Save to apply.');
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .update({
        site_name: form.site_name,
        logo_url: form.logo_url,
        favicon_url: form.favicon_url,
        hero_title: form.hero_title,
        hero_subtitle: form.hero_subtitle,
        hero_image_url: form.hero_image_url,
        hero_button_text: form.hero_button_text,
        hero_button_link: form.hero_button_link,
        banner_enabled: form.banner_enabled,
        banner_title: form.banner_title,
        banner_text: form.banner_text,
        banner_image_url: form.banner_image_url,
        whatsapp_number: form.whatsapp_number,
        instagram_url: form.instagram_url,
        facebook_url: form.facebook_url,
        contact_number: form.contact_number,
        email: form.email,
        address: form.address,
      })
      .eq('id', form.id);
    setSaving(false);
    if (error) { notify('Could not save settings.', 'error'); return; }
    notify('Settings saved.');
    refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-white">Website Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your storefront content</p>
        </div>
        <Button variant="gold" onClick={save} loading={saving}>
          <Save className="w-4 h-4 mr-1" /> Save Changes
        </Button>
      </div>

      {/* Brand */}
      <Section title="Brand">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Website Name" value={form.site_name} onChange={(v) => set('site_name', v)} />
          <Input label="WhatsApp Number" value={form.whatsapp_number} onChange={(v) => set('whatsapp_number', v)} hint="Include country code, e.g. 923000000000" />
        </div>
        <ImageUpload label="Logo" value={form.logo_url} uploading={uploadingField === 'logo_url'} onUpload={(f) => handleUpload('logo_url', f)} />
        <ImageUpload label="Favicon" value={form.favicon_url} uploading={uploadingField === 'favicon_url'} onUpload={(f) => handleUpload('favicon_url', f)} />
      </Section>

      {/* Hero */}
      <Section title="Hero Section">
        <Input label="Hero Title" value={form.hero_title} onChange={(v) => set('hero_title', v)} />
        <TextArea label="Hero Subtitle" value={form.hero_subtitle} onChange={(v) => set('hero_subtitle', v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Button Text" value={form.hero_button_text} onChange={(v) => set('hero_button_text', v)} />
          <Input label="Button Link" value={form.hero_button_link} onChange={(v) => set('hero_button_link', v)} />
        </div>
        <ImageUpload label="Hero Image" value={form.hero_image_url} uploading={uploadingField === 'hero_image_url'} onUpload={(f) => handleUpload('hero_image_url', f)} />
      </Section>

      {/* Banner */}
      <Section title="Promotional Banner">
        <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer mb-4">
          <input type="checkbox" checked={form.banner_enabled} onChange={(e) => set('banner_enabled', e.target.checked)} className="accent-amber-500" />
          Enable banner
        </label>
        <Input label="Banner Title" value={form.banner_title ?? ''} onChange={(v) => set('banner_title', v)} />
        <TextArea label="Banner Text" value={form.banner_text ?? ''} onChange={(v) => set('banner_text', v)} />
        <ImageUpload label="Banner Image" value={form.banner_image_url} uploading={uploadingField === 'banner_image_url'} onUpload={(f) => handleUpload('banner_image_url', f)} />
      </Section>

      {/* Contact */}
      <Section title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Contact Number" value={form.contact_number ?? ''} onChange={(v) => set('contact_number', v)} />
          <Input label="Email" value={form.email ?? ''} onChange={(v) => set('email', v)} />
          <Input label="Address" value={form.address ?? ''} onChange={(v) => set('address', v)} />
          <Input label="Instagram URL" value={form.instagram_url ?? ''} onChange={(v) => set('instagram_url', v)} />
          <Input label="Facebook URL" value={form.facebook_url ?? ''} onChange={(v) => set('facebook_url', v)} />
        </div>
      </Section>

      {/* Sticky save */}
      <div className="sticky bottom-0 bg-zinc-950/90 backdrop-blur border-t border-white/5 py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 flex justify-end">
        <Button variant="gold" onClick={save} loading={saving}>
          <Save className="w-4 h-4 mr-1" /> Save Changes
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/5 rounded-lg p-5 bg-black space-y-4">
      <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
      />
      {hint && <p className="text-[10px] text-zinc-600 mt-1">{hint}</p>}
    </div>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-zinc-900 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
      />
    </div>
  );
}

function ImageUpload({ label, value, uploading, onUpload }: { label: string; value: string | null; uploading: boolean; onUpload: (f: File) => void }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1.5">{label}</label>
      <div className="flex items-center gap-4">
        {value ? (
          <img src={value} alt={label} className="w-16 h-16 rounded object-cover border border-white/10" />
        ) : (
          <div className="w-16 h-16 rounded bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-700">
            <Upload className="w-5 h-5" />
          </div>
        )}
        <label className="cursor-pointer">
          <span className="inline-flex items-center gap-2 border border-amber-500/30 text-amber-400 px-4 py-2 rounded text-sm hover:bg-amber-500/10 transition">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }} />
        </label>
      </div>
    </div>
  );
}
