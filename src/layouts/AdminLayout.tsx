import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Star, Settings,
  Image, LogOut, Menu, X, User,
} from 'lucide-react';
import { useAuth } from '@/store/auth';
import { classNames } from '@/lib/format';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, end: false },
  { to: '/admin/customers', label: 'Customers', icon: Users, end: false },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, end: false },
  { to: '/admin/categories', label: 'Categories', icon: Package, end: false },
  { to: '/admin/media', label: 'Media', icon: Image, end: false },
  { to: '/admin/settings', label: 'Website Settings', icon: Settings, end: false },
  { to: '/admin/account', label: 'Admin Account', icon: User, end: false },
];

export function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const SidebarContent = () => (
    <>
      <Link to="/admin" className="block px-6 py-5 border-b border-white/5" onClick={() => setOpen(false)}>
        <span className="font-serif text-xl gold-gradient-text tracking-widest">TYMLYN PAK</span>
        <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-600 mt-1">Admin Panel</p>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition w-full"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black fixed inset-y-0 left-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-64 bg-black border-r border-white/5 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-white/5 h-14 flex items-center justify-between px-4">
          <button onClick={() => setOpen(true)} className="text-zinc-300">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif text-lg gold-gradient-text tracking-widest">TYMLYN PAK</span>
          <button onClick={handleLogout} className="text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
