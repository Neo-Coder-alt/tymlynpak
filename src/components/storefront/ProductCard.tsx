import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import type { Product } from '@/types';
import { formatPKR, effectivePrice, classNames } from '@/lib/format';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const notify = useToast();

  const image = product.product_images?.[0]?.image_url;
  const price = effectivePrice(product.price, product.sale_price);
  const onSale = product.sale_price != null && product.sale_price > 0 && product.sale_price < product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock_quantity <= 0) {
      notify('This item is out of stock.', 'error');
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: image ?? null,
      quantity: 1,
      stock: product.stock_quantity,
    });
    notify(`${product.name} added to cart.`);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900 border border-white/5">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-zinc-700" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {onSale && (
            <span className="bg-amber-500 text-black text-[10px] font-bold tracking-wider px-2 py-1 rounded">
              SALE
            </span>
          )}
          {product.is_featured && !onSale && (
            <span className="glass border border-amber-500/30 text-amber-400 text-[10px] font-bold tracking-wider px-2 py-1 rounded">
              FEATURED
            </span>
          )}
          {product.stock_quantity <= 0 && (
            <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold tracking-wider px-2 py-1 rounded">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className={classNames(
                'flex-1 bg-amber-500 text-black text-xs font-medium py-2.5 rounded flex items-center justify-center gap-1.5 hover:bg-amber-400 transition',
                product.stock_quantity <= 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Add
            </button>
            <span className="bg-white/10 backdrop-blur text-white text-xs px-3 py-2.5 rounded flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1">
        {product.category && (
          <p className="text-[10px] tracking-[0.15em] uppercase text-amber-500/60">{product.category.name}</p>
        )}
        <h3 className="text-sm md:text-base font-medium text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-amber-400 font-medium">{formatPKR(price)}</span>
          {onSale && (
            <span className="text-xs text-zinc-500 line-through">{formatPKR(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
