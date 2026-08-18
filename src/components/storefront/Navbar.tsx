import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useSettings } from '@/store/settings';
import { classNames } from '@/lib/format';

interface NavbarProps {
  onCartClick: () => void;
  onSearchClick: () => void;
}

export function Navbar({ onCartClick, onSearchClick }: NavbarProps) {
  const { count } = useCart();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Collection', to: '/collection' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const logo = settings?.logo_url;

  return (
    <>
      <header
        className={classNames(
          'fixed top-0 inset-x-0 z-50 transition-all duration-500',
          scrolled ? 'glass border-b border-white/5' : 'bg-transparent'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            {logo ? (
              <img src={logo} alt="TYMLYN PAK" className="h-8 md:h-10 w-auto object-contain" />
            ) : (
              <span className="text-xl md:text-2xl font-serif tracking-[0.2em] gold-gradient-text font-semibold">
                TYMLYN PAK
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs tracking-[0.15em] uppercase text-zinc-300 hover:text-amber-400 transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-400 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onSearchClick}
              className="p-2 text-zinc-300 hover:text-amber-400 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={onCartClick}
              className="relative p-2 text-zinc-300 hover:text-amber-400 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </button>
            <Link
              to="/admin"
              className="hidden sm:block p-2 text-zinc-300 hover:text-amber-400 transition-colors"
              aria-label="Admin"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 text-zinc-300 hover:text-white"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={classNames(
          'fixed inset-0 z-[60] md:hidden transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div
          className={classNames(
            'absolute top-0 right-0 h-full w-72 max-w-[80%] bg-zinc-950 border-l border-amber-500/20 p-6 transition-transform duration-300 flex flex-col',
            open ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between mb-10">
            <span className="font-serif text-xl gold-gradient-text tracking-widest">TYMLYN PAK</span>
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.to}
                onClick={() => { navigate(l.to); setOpen(false); }}
                className="text-left py-3 text-sm tracking-[0.15em] uppercase text-zinc-300 hover:text-amber-400 border-b border-white/5 transition-colors"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => { navigate('/admin'); setOpen(false); }}
              className="text-left py-3 text-sm tracking-[0.15em] uppercase text-zinc-300 hover:text-amber-400 border-b border-white/5 transition-colors"
            >
              Admin
            </button>
          </div>
          <div className="mt-auto pt-6">
            {settings?.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="text-xs text-zinc-500 hover:text-amber-400">
                Follow on Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
