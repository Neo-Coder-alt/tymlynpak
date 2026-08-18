import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, MapPin, Phone, Mail, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/store/toast';
import { Button } from '@/components/ui/Button';
import { CenterSpinner, EmptyState } from '@/components/ui/Skeletons';
import { formatPKR, formatDateTime, classNames } from '@/lib/format';
import type { Order, OrderItem, OrderStatus } from '@/types';

const statuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<OrderStatus, string> = {
  pending: 'text-amber-400 bg-amber-500/10',
  confirmed: 'text-blue-400 bg-blue-500/10',
  processing: 'text-purple-400 bg-purple-500/10',
  shipped: 'text-cyan-400 bg-cyan-500/10',
  delivered: 'text-green-400 bg-green-500/10',
  cancelled: 'text-red-400 bg-red-500/10',
};

export function AdminOrderDetailPage() {
  const { id } = useParams();
  const notify = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('orders').select('*').eq('id', id).maybeSingle(),
      supabase.from('order_items').select('*').eq('order_id', id),
    ]).then(([oRes, iRes]) => {
      setOrder(oRes.data as Order | null);
      setItems((iRes.data as OrderItem[]) ?? []);
      setLoading(false);
    });
  }, [id]);

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    const { error } = await supabase.from('orders').update({ status }).eq('id', order.id);
    setUpdating(false);
    if (error) { notify('Could not update status.', 'error'); return; }
    setOrder({ ...order, status });
    notify(`Order marked as ${status}.`);
  };

  if (loading) return <CenterSpinner label="Loading order..." />;

  if (!order) {
    return (
      <div>
        <EmptyState title="Order not found" />
        <div className="text-center"><Link to="/admin/orders"><Button variant="outline">Back to Orders</Button></Link></div>
      </div>
    );
  }

  const waNumber = (order.whatsapp ?? order.phone).replace(/[^0-9]/g, '');
  const waMsg = encodeURIComponent(`Hello ${order.customer_name}, regarding your order ${order.order_number} from TYMLYN PAK.`);
  const mapUrl = order.latitude && order.longitude
    ? `https://www.google.com/maps?q=${order.latitude},${order.longitude}`
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-serif text-white">{order.order_number}</h1>
          <p className="text-sm text-zinc-500 mt-1">{formatDateTime(order.created_at)}</p>
        </div>
        <span className={classNames('text-xs uppercase tracking-wider px-3 py-1.5 rounded', statusColors[order.status])}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <div className="border border-white/5 rounded-lg p-5 bg-black space-y-3">
          <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400 mb-3">Customer</h2>
          <div className="flex items-start gap-2 text-sm">
            <User className="w-4 h-4 text-zinc-500 mt-0.5" />
            <span className="text-white">{order.customer_name}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Phone className="w-4 h-4 text-zinc-500 mt-0.5" />
            <span className="text-zinc-300">{order.phone}</span>
          </div>
          {order.whatsapp && (
            <div className="flex items-start gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-zinc-500 mt-0.5" />
              <span className="text-zinc-300">{order.whatsapp}</span>
            </div>
          )}
          {order.email && (
            <div className="flex items-start gap-2 text-sm">
              <Mail className="w-4 h-4 text-zinc-500 mt-0.5" />
              <span className="text-zinc-300">{order.email}</span>
            </div>
          )}
          <div className="pt-3 border-t border-white/5 text-sm text-zinc-300">
            <p>{order.address}</p>
            <p className="text-zinc-400">{order.city}</p>
          </div>
          {order.notes && (
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs text-zinc-500 mb-1">Notes</p>
              <p className="text-sm text-zinc-300">{order.notes}</p>
            </div>
          )}
          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-amber-400 hover:underline pt-3 border-t border-white/5">
              <MapPin className="w-4 h-4" /> Open Location in Maps
            </a>
          )}
        </div>

        {/* Items + status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="border border-white/5 rounded-lg bg-black overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400">Order Items</h2>
            </div>
            <div className="divide-y divide-white/5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm text-white">{item.product_name}</p>
                    <p className="text-xs text-zinc-500">{formatPKR(Number(item.price))} × {item.quantity}</p>
                  </div>
                  <span className="text-sm text-amber-400">{formatPKR(Number(item.subtotal))}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-white font-medium">Total</span>
                <span className="text-lg text-amber-400 font-medium">{formatPKR(Number(order.total_amount))}</span>
              </div>
            </div>
          </div>

          {/* Status update */}
          <div className="border border-white/5 rounded-lg p-5 bg-black">
            <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400 mb-4">Update Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={updating || order.status === s}
                  className={classNames(
                    'text-xs uppercase tracking-wider px-3 py-2.5 rounded border transition',
                    order.status === s
                      ? statusColors[s] + ' border-current'
                      : 'border-white/10 text-zinc-400 hover:bg-white/5'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex gap-3">
            <a
              href={`https://wa.me/${waNumber}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg text-sm font-medium transition"
            >
              <MessageCircle className="w-4 h-4" /> Contact on WhatsApp
            </a>
            <a href={`tel:${order.phone}`} className="flex items-center justify-center gap-2 border border-white/10 text-zinc-300 px-4 py-3 rounded-lg text-sm hover:bg-white/5 transition">
              <Phone className="w-4 h-4" /> Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
