import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/store/toast';
import { Button } from '@/components/ui/Button';
import { CenterSpinner, EmptyState } from '@/components/ui/Skeletons';
import { ProductEditor } from '@/components/admin/ProductEditor';
import { formatPKR, effectivePrice, classNames } from '@/lib/format';
import type { Product, Category } from '@/types';

export function AdminProductsPage() {
  const notify = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const load = async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      supabase.from('products').select('*, category:categories(*), product_images(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((pRes.data as Product[]) ?? []);
    setCategories((cRes.data as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', confirmDelete.id);
    if (error) { notify('Could not delete product.', 'error'); return; }
    notify('Product deleted.');
    setConfirmDelete(null);
    load();
  };

  const toggleAvailability = async (p: Product) => {
    const { error } = await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id);
    if (error) { notify('Could not update.', 'error'); return; }
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-white">Products</h1>
          <p className="text-sm text-zinc-500 mt-1">{products.length} products</p>
        </div>
        <Button variant="gold" onClick={() => { setEditing(null); setShowEditor(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {loading ? (
        <CenterSpinner label="Loading products..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No products found" icon={<Package className="w-12 h-12" />} message="Add your first product to get started." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border border-white/5 rounded-lg bg-black overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Price</th>
                  <th className="text-left px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((p) => {
                  const price = effectivePrice(p.price, p.sale_price);
                  const img = p.product_images?.[0]?.image_url;
                  return (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img ? (
                            <img src={img} alt="" className="w-10 h-10 rounded object-cover border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-zinc-900 border border-white/10" />
                          )}
                          <div>
                            <p className="text-white">{p.name}</p>
                            <p className="text-xs text-zinc-500">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{p.category?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-amber-400">{formatPKR(price)}</td>
                      <td className="px-4 py-3">
                        <span className={classNames(p.stock_quantity <= 5 ? 'text-red-400' : 'text-zinc-300')}>{p.stock_quantity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAvailability(p)}
                          className={classNames(
                            'text-[10px] uppercase tracking-wider px-2 py-1 rounded',
                            p.is_available ? 'text-green-400 bg-green-500/10' : 'text-zinc-500 bg-zinc-700/20'
                          )}
                        >
                          {p.is_available ? 'Available' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditing(p); setShowEditor(true); }} className="text-zinc-400 hover:text-amber-400 p-1.5">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setConfirmDelete(p)} className="text-zinc-400 hover:text-red-400 p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => {
              const price = effectivePrice(p.price, p.sale_price);
              const img = p.product_images?.[0]?.image_url;
              return (
                <div key={p.id} className="border border-white/5 rounded-lg p-4 bg-black flex gap-3">
                  {img ? (
                    <img src={img} alt="" className="w-16 h-16 rounded object-cover border border-white/10" />
                  ) : (
                    <div className="w-16 h-16 rounded bg-zinc-900 border border-white/10" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{p.name}</p>
                    <p className="text-xs text-zinc-500">{p.category?.name ?? '—'}</p>
                    <p className="text-sm text-amber-400 mt-1">{formatPKR(price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={classNames('text-[10px] uppercase px-2 py-0.5 rounded', p.is_available ? 'text-green-400 bg-green-500/10' : 'text-zinc-500 bg-zinc-700/20')}>
                        {p.is_available ? 'Available' : 'Hidden'}
                      </span>
                      <span className="text-xs text-zinc-500">Stock: {p.stock_quantity}</span>
                    </div>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => { setEditing(p); setShowEditor(true); }} className="text-xs text-amber-400 flex items-center gap-1">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => setConfirmDelete(p)} className="text-xs text-red-400 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Editor */}
      {showEditor && (
        <ProductEditor
          product={editing}
          categories={categories}
          onClose={() => setShowEditor(false)}
          onSaved={() => { setShowEditor(false); load(); }}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-lg p-6 max-w-sm w-full text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg text-white mb-2">Delete product?</h3>
            <p className="text-sm text-zinc-400 mb-6">"{confirmDelete.name}" will be permanently removed.</p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)} className="flex-1">Cancel</Button>
              <Button variant="danger" onClick={handleDelete} className="flex-1">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
