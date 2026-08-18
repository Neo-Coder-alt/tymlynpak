import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useProducts, useCategories } from '@/hooks/useData';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductGridSkeleton, EmptyState } from '@/components/ui/Skeletons';
import { classNames } from '@/lib/format';

export function CollectionPage() {
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const category = params.get('category') ?? 'all';
  const sort = params.get('sort') ?? 'featured';
  const search = params.get('q') ?? '';

  const { categories } = useCategories();
  const { products, loading } = useProducts({ category, sort, search });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'all') next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ];

  const FilterContent = useMemo(() => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs tracking-[0.15em] uppercase text-amber-400 mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => setParam('category', 'all')}
            className={classNames(
              'block text-sm transition-colors',
              category === 'all' ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
            )}
          >
            All Watches
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setParam('category', c.slug)}
              className={classNames(
                'block text-sm transition-colors',
                category === c.slug ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs tracking-[0.15em] uppercase text-amber-400 mb-3">Availability</h3>
        <div className="space-y-2">
          <button
            onClick={() => setParam('availability', 'all')}
            className="block text-sm text-zinc-400 hover:text-white transition-colors"
          >
            All
          </button>
          <button
            onClick={() => setParam('availability', 'in')}
            className="block text-sm text-zinc-400 hover:text-white transition-colors"
          >
            In Stock
          </button>
        </div>
      </div>
    </div>
  ), [categories, category]);

  return (
    <div className="pt-16 md:pt-20 animate-fade-in">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-amber-500/60 mb-3">Catalog</p>
        <h1 className="text-4xl md:text-5xl font-serif text-white">The Collection</h1>
        <div className="w-16 h-px bg-amber-500/40 mx-auto mt-4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-amber-400 transition md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <p className="text-sm text-zinc-500 hidden md:block">
            {loading ? 'Loading...' : `${products.length} watches`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 hidden sm:block">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              className="bg-zinc-900 border border-white/10 text-sm text-zinc-200 rounded px-3 py-2 focus:outline-none focus:border-amber-500/50"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            {FilterContent}
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <ProductGridSkeleton />
            ) : products.length === 0 ? (
              <EmptyState title="No watches found" message="Try adjusting your filters or search." />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[80] md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute top-0 left-0 h-full w-72 max-w-[80%] bg-zinc-950 border-r border-amber-500/20 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterContent}
            <button
              onClick={() => setShowFilters(false)}
              className="mt-8 w-full bg-amber-500 text-black text-sm font-medium py-3 rounded"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
