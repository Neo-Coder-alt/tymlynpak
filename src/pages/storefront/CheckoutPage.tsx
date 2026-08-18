import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useSettings } from '@/store/settings';
import { useToast } from '@/store/toast';
import { supabase } from '@/lib/supabase';
import { formatPKR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Skeletons';

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const notify = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; total: number } | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const shareLocation = () => {
    if (!navigator.geolocation) {
      notify('Geolocation is not supported by your device.', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        notify('Location shared.');
      },
      () => {
        setLocating(false);
        notify('Could not get location. You can continue without it.', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    if (!form.customer_name.trim()) return 'Please enter your full name.';
    if (!form.phone.trim()) return 'Please enter your phone number.';
    if (!form.address.trim()) return 'Please enter your address.';
    if (!form.city.trim()) return 'Please enter your city.';
    return null;
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { notify(err, 'error'); return; }
    if (items.length === 0) { notify('Your cart is empty.', 'error'); return; }

    setPlacing(true);
    const total = subtotal;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim(),
        city: form.city.trim(),
        notes: form.notes.trim() || null,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
        total_amount: total,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !orderData) {
      setPlacing(false);
      notify('Could not place order. Please try again.', 'error');
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      setPlacing(false);
      notify('Order placed but items could not be saved. Contact us.', 'error');
      return;
    }

    setPlacing(false);
    setPlacedOrder({ orderNumber: orderData.order_number, total });
    clearCart();
    window.scrollTo(0, 0);
  };

  // -------- Order confirmation --------
  if (placedOrder) {
    const waNumber = (settings?.whatsapp_number ?? '').replace(/[^0-9]/g, '');
    const waMessage = encodeURIComponent(
      `TYMLYN PAK ORDER\n\nOrder ID: ${placedOrder.orderNumber}\nCustomer Name: ${form.customer_name}\nPhone: ${form.phone}\nAddress: ${form.address}\nCity: ${form.city}\n\nProducts:\n${items.map((i) => `• ${i.name} × ${i.quantity} = ${formatPKR(i.price * i.quantity)}`).join('\n')}\n\nTotal: ${formatPKR(placedOrder.total)}`
    );

    return (
      <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-amber-400" />
        </div>
        <h1 className="text-3xl font-serif text-white mb-3">Order Placed Successfully</h1>
        <p className="text-zinc-400 mb-2">Thank you for your purchase. Your order has been received.</p>
        <p className="text-amber-400 text-lg font-medium tracking-wider">{placedOrder.orderNumber}</p>

        <div className="mt-8 border border-white/10 rounded-lg p-6 bg-zinc-950/50 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-zinc-400">Total Amount</span>
            <span className="text-white font-medium">{formatPKR(placedOrder.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Status</span>
            <span className="text-amber-400">Pending</span>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <a
            href={`https://wa.me/${waNumber}?text=${waMessage}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-lg text-sm font-medium tracking-wide transition"
          >
            <MessageCircle className="w-5 h-5" /> Order via WhatsApp
          </a>
          <Link to="/collection">
            <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-zinc-600">
          Tip: Send your order via WhatsApp to confirm faster.
        </p>
      </div>
    );
  }

  // -------- Empty cart --------
  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20">
        <EmptyState title="Your cart is empty" message="Add some watches before checking out." />
        <div className="text-center">
          <Link to="/collection"><Button variant="gold">Browse Collection</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/collection" className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-serif text-white mb-8">Checkout</h1>

        <form onSubmit={placeOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-white/5 rounded-lg p-6 bg-zinc-950/50">
              <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400 mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name *" value={form.customer_name} onChange={(v) => set('customer_name', v)} />
                <Field label="Phone Number *" value={form.phone} onChange={(v) => set('phone', v)} />
                <Field label="WhatsApp Number" value={form.whatsapp} onChange={(v) => set('whatsapp', v)} />
                <Field label="Email (optional)" value={form.email} onChange={(v) => set('email', v)} />
                <div className="sm:col-span-2">
                  <Field label="Complete Address *" value={form.address} onChange={(v) => set('address', v)} />
                </div>
                <Field label="City *" value={form.city} onChange={(v) => set('city', v)} />
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc-500 block mb-1.5">Order Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-900 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 resize-none"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm text-zinc-300">Share your location (optional)</p>
                    <p className="text-xs text-zinc-500">Helps us deliver accurately.</p>
                  </div>
                  <button
                    type="button"
                    onClick={shareLocation}
                    className="flex items-center gap-2 text-sm border border-amber-500/30 text-amber-400 px-4 py-2 rounded hover:bg-amber-500/10 transition"
                  >
                    {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    {coords ? 'Location Shared' : 'Share My Location'}
                  </button>
                </div>
                {coords && (
                  <p className="mt-2 text-xs text-green-400">
                    Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="border border-white/5 rounded-lg p-6 bg-zinc-950/50 sticky top-24">
              <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    {item.image && <img src={item.image} alt="" className="w-14 h-14 object-cover rounded border border-white/10" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-200 truncate">{item.name}</p>
                      <p className="text-xs text-zinc-500">× {item.quantity}</p>
                    </div>
                    <span className="text-sm text-amber-400">{formatPKR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Shipping</span>
                  <span className="text-zinc-500">Calculated after</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/5">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-amber-400 text-lg font-medium">{formatPKR(subtotal)}</span>
                </div>
              </div>
              <Button type="submit" variant="gold" size="lg" className="w-full mt-6" loading={placing}>
                Place Order
              </Button>
              <p className="text-xs text-zinc-600 mt-3 text-center">By placing your order, you agree to our terms.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
      />
    </div>
  );
}
