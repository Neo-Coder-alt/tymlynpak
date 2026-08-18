import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/storage';
import { useToast } from '@/store/toast';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Skeletons';
import { X, Upload, Trash2, Plus } from 'lucide-react';
import type { Product, Category, ProductImage, ProductSpecification } from '@/types';
import { slugify } from '@/lib/format';

interface Props {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export function ProductEditor({ product, categories, onClose, onSaved }: Props) {
  const notify = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(product?.product_images ?? []);
  const [specs, setSpecs] = useState<ProductSpecification[]>(product?.specifications ?? []);

  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    sale_price: product?.sale_price?.toString() ?? '',
    category_id: product?.category_id ?? '',
    sku: product?.sku ?? '',
    stock_quantity: product?.stock_quantity?.toString() ?? '0',
    is_available: product?.is_available ?? true,
    is_featured: product?.is_featured ?? false,
  });

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { url, error } = await uploadImage(file, 'products');
        if (error) { notify(error, 'error'); continue; }
        setImages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), product_id: product?.id ?? '', image_url: url, sort_order: prev.length, created_at: new Date().toISOString() },
        ]);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const addSpec = () => setSpecs((prev) => [...prev, { label: '', value: '' }]);
  const updateSpec = (i: number, field: keyof ProductSpecification, value: string) =>
    setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!form.name.trim()) { notify('Product name is required.', 'error'); return; }
    setSaving(true);

    const slug = form.slug.trim() || slugify(form.name);
    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      price: parseFloat(form.price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      category_id: form.category_id || null,
      sku: form.sku.trim() || null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      is_available: form.is_available,
      is_featured: form.is_featured,
      specifications: specs.filter((s) => s.label && s.value),
    };

    try {
      let productId = product?.id;

      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(payload).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Sync images
      if (productId) {
        const existingIds = (product?.product_images ?? []).map((i) => i.id);
        const keptIds = images.filter((i) => !i.image_url.startsWith('blob') && existingIds.includes(i.id)).map((i) => i.id);
        const toDelete = existingIds.filter((id) => !keptIds.includes(id));

        if (toDelete.length > 0) {
          await supabase.from('product_images').delete().in('id', toDelete);
        }

        const newImages = images.filter((i) => i.id.startsWith('temp') || !existingIds.includes(i.id));
        if (newImages.length > 0) {
          await supabase.from('product_images').insert(
            newImages.map((img, idx) => ({
              product_id: productId,
              image_url: img.image_url,
              sort_order: idx,
            }))
          );
        }

        // Update sort order for kept
        images.forEach((img, idx) => {
          if (keptIds.includes(img.id)) {
            supabase.from('product_images').update({ sort_order: idx }).eq('id', img.id);
          }
        });
      }

      notify(`Product ${product ? 'updated' : 'created'} successfully.`);
      onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save product.';
      notify(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-950 border border-white/10 rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-white/5 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-serif text-white">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Images */}
          <div>
            <label className="text-xs text-zinc-500 block mb-2">Product Images</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border border-dashed border-white/15 flex items-center justify-center cursor-pointer hover:border-amber-500/50 transition">
                {uploading ? <Spinner /> : (
                  <div className="text-center">
                    <Upload className="w-5 h-5 text-zinc-500 mx-auto mb-1" />
                    <span className="text-[10px] text-zinc-500">Upload</span>
                  </div>
                )}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Product Name *" value={form.name} onChange={(v) => set('name', v)} />
            <Input label="Slug (auto)" value={form.slug} onChange={(v) => set('slug', v)} hint="Leave blank to auto-generate" />
            <div className="sm:col-span-2">
              <label className="text-xs text-zinc-500 block mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className="w-full bg-zinc-900 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>
            <Input label="Price (Rs) *" type="number" value={form.price} onChange={(v) => set('price', v)} />
            <Input label="Sale Price (Rs)" type="number" value={form.sale_price} onChange={(v) => set('sale_price', v)} />
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="SKU" value={form.sku} onChange={(v) => set('sku', v)} />
            <Input label="Stock Quantity" type="number" value={form.stock_quantity} onChange={(v) => set('stock_quantity', v)} />
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={form.is_available} onChange={(e) => set('is_available', e.target.checked)} className="accent-amber-500" />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="accent-amber-500" />
                Featured
              </label>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-500">Specifications</label>
              <button onClick={addSpec} className="text-xs text-amber-400 flex items-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={s.label}
                    onChange={(e) => updateSpec(i, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1 bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <input
                    value={s.value}
                    onChange={(e) => updateSpec(i, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-zinc-900 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <button onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {specs.length === 0 && <p className="text-xs text-zinc-600">No specifications added.</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-zinc-950 border-t border-white/5 px-5 py-4 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="gold" onClick={save} loading={saving} className="flex-1">Save Product</Button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', hint }: { label: string; value: string; onChange: (v: string) => void; type?: string; hint?: string }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
      />
      {hint && <p className="text-[10px] text-zinc-600 mt-1">{hint}</p>}
    </div>
  );
}
