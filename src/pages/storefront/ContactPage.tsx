import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { useSettings } from '@/store/settings';

export function ContactPage() {
  const { settings } = useSettings();
  const waNumber = (settings?.whatsapp_number ?? '').replace(/[^0-9]/g, '');

  return (
    <div className="pt-16 md:pt-20 animate-fade-in">
      <section className="py-20 px-6 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-amber-500/60 mb-3">Get in Touch</p>
        <h1 className="text-4xl md:text-5xl font-serif text-white">Contact Us</h1>
        <div className="w-16 h-px bg-amber-500/40 mx-auto mt-4" />
        <p className="mt-6 text-zinc-400 max-w-lg mx-auto">
          We're here to help. Reach out for product inquiries, order assistance, or anything else.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings?.whatsapp_number && (
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noreferrer"
              className="border border-white/5 rounded-lg p-8 bg-zinc-950/50 hover:border-amber-500/30 transition group"
            >
              <MessageCircle className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-lg font-serif text-white mb-1">WhatsApp</h3>
              <p className="text-sm text-zinc-400">{settings.whatsapp_number}</p>
              <p className="text-xs text-amber-400 mt-3 group-hover:underline">Chat with us →</p>
            </a>
          )}

          {settings?.contact_number && (
            <div className="border border-white/5 rounded-lg p-8 bg-zinc-950/50">
              <Phone className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-serif text-white mb-1">Phone</h3>
              <p className="text-sm text-zinc-400">{settings.contact_number}</p>
            </div>
          )}

          {settings?.email && (
            <div className="border border-white/5 rounded-lg p-8 bg-zinc-950/50">
              <Mail className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-serif text-white mb-1">Email</h3>
              <p className="text-sm text-zinc-400">{settings.email}</p>
            </div>
          )}

          {settings?.address && (
            <div className="border border-white/5 rounded-lg p-8 bg-zinc-950/50">
              <MapPin className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-lg font-serif text-white mb-1">Address</h3>
              <p className="text-sm text-zinc-400">{settings.address}</p>
            </div>
          )}
        </div>

        {/* Social */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {settings?.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:border-amber-500/50 transition">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {settings?.facebook_url && (
            <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:border-amber-500/50 transition">
              <Facebook className="w-5 h-5" />
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
