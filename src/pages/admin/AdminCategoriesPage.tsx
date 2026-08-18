import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/store/toast';
import { Button } from '@/components/ui/Button';
import { CenterSpinner, EmptyState } from '@/components/ui/Skeletons';
import { slugify } from '@/lib/format';
import type { Category } from '@/types';

export function AdminCategoriesPage() {
  const notify = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories((data as Category[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { notify('Name is required.', 'error'); return; }
    const slug = slugify(name);
    if (editing) {
      const { error } = await supabase.from('categories').update({ name: name.trim(), slug }).eq('id', editing.id);
      if (error) { notify(error.message, 'error'); return; }
      notify('Category updated.');
    } else {
      const { error } = await supabase.from('categories').insert({ name: name.trim(), slug });
      if (error) { notify(error.message, 'error'); return; }
      notify('Category added.');
    }
    setName('');
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) { notify('Could not delete category.', 'error'); return; }
    notify('Category deleted.');
    load();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif text-white">Categories</h1>
        <p className="text-sm text-zinc-500 mt-1">Organize your products</p>
      </div>

      <form onSubmit={addOrUpdate} className="flex gap-2 max-w-md">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={editing ? 'Edit category name' : 'New category name'}
          className="flex-1 bg-zinc-900 border border-white/10 rounded px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
        />
        <Button type="submit" variant="gold">
          {editing ? 'Update' : <><Plus className="w-4 h-4 mr-1" /> Add</>}
        </Button>
        {editing && (
          <Button type="button" variant="ghost" onClick={() => { setEditing(null); setName(''); }}>Cancel</Button>
        )}
      </form>

      {loading ? (
        <CenterSpinner label="Loading categories..." />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories" icon={<Tag className="w-12 h-12" />} message="Add your first category above." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((c) => (
            <div key={c.id} className="border border-white/5 rounded-lg p-4 bg-black flex items-center justify-between">
              <div>
                <p className="text-sm text-white">{c.name}</p>
                <p className="text-xs text-zinc-500">/{c.slug}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setName(c.name); }} className="text-zinc-400 hover:text-amber-400 p-2">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(c.id)} className="text-zinc-400 hover:text-red-400 p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
