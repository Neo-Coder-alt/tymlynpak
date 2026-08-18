import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/cart';
import { formatPKR, classNames } from '@/lib/format';
import { Button } from '@/components/ui/Button';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, subtotal, setQuantity, removeItem } = useCart();

  return (
    <div
      className={classNames(
        'fixed inset-0 z-[70] transition-opacity duration-300',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className={classNames(
          'absolute top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-amber-500/20 flex flex-col transition-transform duration-400',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Your Cart
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <ShoppingBag className="w-12 h-12 text-zinc-700" />
            <p className="text-zinc-400">Your cart is empty</p>
            <Button variant="gold" size="sm" onClick={onClose}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <Link to={`/product/${item.slug}`} onClick={onClose} className="flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-zinc-900 border border-white/10" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.slug}`} onClick={onClose} className="text-sm text-zinc-200 hover:text-amber-400 line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-xs text-amber-400 mt-1">{formatPKR(item.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-white/10 rounded">
                        <button onClick={() => setQuantity(item.productId, item.quantity - 1)} className="p-1 text-zinc-400 hover:text-white">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs text-white">{item.quantity}</span>
                        <button onClick={() => setQuantity(item.productId, item.quantity + 1)} className="p-1 text-zinc-400 hover:text-white">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-zinc-500 hover:text-red-400 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-white font-medium text-right">
                    {formatPKR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Subtotal</span>
                <span className="text-lg text-white font-medium">{formatPKR(subtotal)}</span>
              </div>
              <p className="text-xs text-zinc-500">Shipping calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={onClose}>Continue</Button>
                <Link to="/checkout" onClick={onClose}>
                  <Button variant="gold" size="sm" className="w-full">Checkout</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
