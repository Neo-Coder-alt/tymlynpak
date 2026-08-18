import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { formatPKR, effectivePrice, classNames } from '@/lib/format';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*), product_images(*)')
        .eq('is_available', true)
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,category.slug.ilike.%${query}%`)
        .limit(8);
      setResults((data as Product[]) ?? []);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const go = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  return (
    <div
      className={classNames(
        'fixed inset-0 z-[80] transition-opacity duration-300',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative max-w-2xl mx-auto pt-24 px-4">
        <div className="flex items-center gap-3 border-b border-amber-500/30 pb-3">
          <Search className="w-5 h-5 text-amber-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) go(results[0].slug);
            }}
            placeholder="Search watches, categories, SKU..."
            className="flex-1 bg-transparent text-white text-lg placeholder:text-zinc-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {loading && <p className="text-sm text-zinc-500 px-2">Searching...</p>}
          {!loading && query && results.length === 0 && (
            <p className="text-sm text-zinc-500 px-2">No products found for "{query}".</p>
          )}
          {results.map((p) => {
            const img = p.product_images?.[0]?.image_url;
            const price = effectivePrice(p.price, p.sale_price);
            return (
              <button
                key={p.id}
                onClick={() => go(p.slug)}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition text-left"
              >
                {img ? (
                  <img src={img} alt={p.name} className="w-14 h-14 object-cover rounded border border-white/10" />
                ) : (
                  <div className="w-14 h-14 rounded bg-zinc-900 border border-white/10" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.category?.name}</p>
                </div>
                <span className="text-sm text-amber-400">{formatPKR(price)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
