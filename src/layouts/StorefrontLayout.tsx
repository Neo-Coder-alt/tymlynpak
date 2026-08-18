import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { SearchOverlay } from '@/components/storefront/SearchOverlay';

export function StorefrontLayout({ children }: { children?: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar onCartClick={() => setCartOpen(true)} onSearchClick={() => setSearchOpen(true)} />
      <main className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
