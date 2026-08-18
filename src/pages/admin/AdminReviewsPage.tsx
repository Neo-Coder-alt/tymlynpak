import { useEffect, useState } from 'react';
import { Check, X, Star, Trash2, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/store/toast';
import { CenterSpinner, EmptyState } from '@/components/ui/Skeletons';
import { StarRating } from '@/components/ui/StarRating';
import { formatDate, classNames } from '@/lib/format';
import type { Review } from '@/types';

export function AdminReviewsPage() {
  const notify = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, product:products(name, slug)')
      .order('created_at', { ascending: false });
    setReviews((data as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Review>) => {
    const { error } = await supabase.from('reviews').update(patch).eq('id', id);
    if (error) { notify('Update failed.', 'error'); return; }
    notify('Review updated.');
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) { notify('Delete failed.', 'error'); return; }
    notify('Review deleted.');
    load();
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.approved;
    if (filter === 'approved') return r.approved;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-white">Reviews</h1>
          <p className="text-sm text-zinc-500 mt-1">{reviews.length} reviews</p>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={classNames(
                'text-xs px-3 py-2 rounded transition capitalize',
                filter === f ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-400 border border-white/10 hover:bg-white/5'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <CenterSpinner label="Loading reviews..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No reviews" icon={<Star className="w-12 h-12" />} message="Customer reviews will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="border border-white/5 rounded-lg p-5 bg-black">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-white">{r.customer_name}</span>
                    <StarRating rating={r.rating} size={12} />
                    {!r.approved && <span className="text-[10px] uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Pending</span>}
                    {r.featured && <span className="text-[10px] uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Featured</span>}
                  </div>
                  {r.product && <p className="text-xs text-zinc-500 mt-1">on {r.product.name}</p>}
                  <p className="text-sm text-zinc-300 mt-2">{r.review}</p>
                  <p className="text-xs text-zinc-600 mt-2">{formatDate(r.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!r.approved ? (
                    <button onClick={() => update(r.id, { approved: true })} className="text-green-400 hover:bg-green-500/10 p-2 rounded transition" title="Approve">
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => update(r.id, { approved: false })} className="text-zinc-400 hover:bg-white/5 p-2 rounded transition" title="Unapprove">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => update(r.id, { featured: !r.featured })}
                    className={classNames('p-2 rounded transition', r.featured ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-400 hover:bg-white/5')}
                    title="Toggle featured"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(r.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded transition" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
