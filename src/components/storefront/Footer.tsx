import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { useSettings } from '@/store/settings';

export function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-zinc-950 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl gold-gradient-text tracking-widest mb-4">TYMLYN PAK</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              Premium watches crafted for those who value elegance, precision, and presence. Designed in Pakistan for the discerning few.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:border-amber-500/50 transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:border-amber-500/50 transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-amber-400 mb-4">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', to: '/' },
                { label: 'Collection', to: '/collection' },
                { label: 'About', to: '/about' },
                { label: 'Contact', to: '/contact' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-zinc-400 hover:text-amber-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-amber-400 mb-4">Contact</h4>
            <ul className="space-y-3">
              {settings?.contact_number && (
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Phone className="w-4 h-4 text-amber-500/60" /> {settings.contact_number}
                </li>
              )}
              {settings?.email && (
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4 text-amber-500/60" /> {settings.email}
                </li>
              )}
              {settings?.address && (
                <li className="flex items-start gap-2 text-sm text-zinc-400">
                  <MapPin className="w-4 h-4 text-amber-500/60 mt-0.5" /> {settings.address}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} TYMLYN PAK. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">Crafted with precision in Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
