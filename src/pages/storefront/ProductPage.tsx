import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Zap, ChevronLeft, Check, Truck, ShieldCheck } from 'lucide-react';
import { useProduct, useProductReviews } from '@/hooks/useData';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { formatPKR, effectivePrice, classNames } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { StarRating, StarInput } from '@/components/ui/StarRating';
import { CenterSpinner, EmptyState } from '@/components/ui/Skeletons';
import { supabase } from '@/lib/supabase';

export function ProductPage() {
  const { slug } = useParams();
  const { product, loading } = useProduct(slug);
  const { reviews } = useProductReviews(product?.id);
  const { addItem } = useCart();
  const notify = useToast();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setQty(1);
    setActiveImg(0);
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <CenterSpinner label="Loading timepiece..." />;

  if (!product) {
    return (
      <div className="pt-32">
        <EmptyState title="Watch not found" message="The product you're looking for doesn't exist." />
        <div className="text-center">
          <Link to="/collection"><Button variant="outline">Back to Collection</Button></Link>
        </div>
      </div>
    );
  }

  const images = product.product_images ?? [];
  const price = effectivePrice(product.price, product.sale_price);
  const onSale = product.sale_price != null && product.sale_price > 0 && product.sale_price < product.price;
  const inStock = product.stock_quantity > 0;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: images[0]?.image_url ?? null,
      quantity: qty,
      stock: product.stock_quantity,
    });
    notify(`${product.name} added to cart.`);
  };

  const handleBuyNow = () => {
    handleAdd();
    navigate('/checkout');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
      notify('Please fill in your name and review.', 'error');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      customer_name: reviewForm.name.trim(),
      rating: reviewForm.rating,
      review: reviewForm.text.trim(),
      approved: false,
    });
    setSubmitting(false);
    if (error) {
      notify('Could not submit review. Try again.', 'error');
      return;
    }
    setReviewForm({ name: '', rating: 5, text: '' });
    notify('Review submitted! It will appear after approval.');
  };

  return (
    <div className="pt-16 md:pt-20 animate-fade-in">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
              {images[activeImg] ? (
                <img src={images[activeImg].image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-zinc-700" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    className={classNames(
                      'w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition',
                      activeImg === i ? 'border-amber-500' : 'border-white/10 opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category && (
              <p className="text-xs tracking-[0.15em] uppercase text-amber-500/60 mb-3">{product.category.name}</p>
            )}
            <h1 className="text-3xl md:text-4xl font-serif text-white">{product.name}</h1>

            <div className="flex items-center gap-3 mt-4">
              <span className="text-2xl text-amber-400 font-medium">{formatPKR(price)}</span>
              {onSale && <span className="text-lg text-zinc-500 line-through">{formatPKR(product.price)}</span>}
            </div>

            <div className="flex items-center gap-3 mt-4 text-sm">
              {inStock ? (
                <span className="flex items-center gap-1.5 text-green-400">
                  <Check className="w-4 h-4" /> In Stock ({product.stock_quantity})
                </span>
              ) : (
                <span className="text-red-400">Out of Stock</span>
              )}
            </div>

            <div className="mt-6 text-zinc-300 leading-relaxed">
              {product.description}
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <label className="text-xs tracking-[0.15em] uppercase text-zinc-500 block mb-2">Quantity</label>
              <div className="flex items-center border border-white/10 rounded w-fit">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-zinc-400 hover:text-white">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 text-white">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
                  className="p-3 text-zinc-400 hover:text-white"
                  disabled={qty >= product.stock_quantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button variant="gold" size="lg" onClick={handleAdd} disabled={!inStock} className="flex-1">
                <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
              </Button>
              <Button variant="outline" size="lg" onClick={handleBuyNow} disabled={!inStock} className="flex-1">
                <Zap className="w-4 h-4 mr-2" /> Buy Now
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Truck className="w-4 h-4 text-amber-500/60" /> Free delivery nationwide
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-amber-500/60" /> Authenticity guaranteed
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <h3 className="text-xs tracking-[0.15em] uppercase text-amber-400 mb-4">Specifications</h3>
                <dl className="space-y-2">
                  {product.specifications.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm py-2 border-b border-white/5">
                      <dt className="text-zinc-500">{s.label}</dt>
                      <dd className="text-zinc-200">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-20 pt-10 border-t border-white/5">
          <h2 className="text-2xl font-serif text-white mb-8">Customer Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Existing reviews */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-zinc-500">No reviews yet. Be the first to share your experience.</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="border border-white/5 rounded-lg p-5 bg-zinc-950/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-200">{r.customer_name}</span>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{r.review}</p>
                  </div>
                ))
              )}
            </div>

            {/* Submit review */}
            <form onSubmit={submitReview} className="border border-white/5 rounded-lg p-6 bg-zinc-950/50">
              <h3 className="text-sm tracking-[0.15em] uppercase text-amber-400 mb-4">Write a Review</h3>
              <div className="space-y-4">
                <input
                  value={reviewForm.name}
                  onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full bg-zinc-900 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
                <div>
                  <label className="text-xs text-zinc-500 block mb-2">Rating</label>
                  <StarInput value={reviewForm.rating} onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))} />
                </div>
                <textarea
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={4}
                  className="w-full bg-zinc-900 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none"
                />
                <Button type="submit" variant="gold" size="sm" loading={submitting}>
                  Submit Review
                </Button>
                <p className="text-xs text-zinc-600">Reviews appear after admin approval.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
