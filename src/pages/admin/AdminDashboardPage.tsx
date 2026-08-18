import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Clock, CheckCircle2, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPKR, formatDate, classNames } from '@/lib/format';
import type { Order, OrderStatus } from '@/types';
import { CenterSpinner } from '@/components/ui/Skeletons';

const statusColors: Record<OrderStatus, string> = {
  pending: 'text-amber-400 bg-amber-500/10',
  confirmed: 'text-blue-400 bg-blue-500/10',
  processing: 'text-purple-400 bg-purple-500/10',
  shipped: 'text-cyan-400 bg-cyan-500/10',
  delivered: 'text-green-400 bg-green-500/10',
  cancelled: 'text-red-400 bg-red-500/10',
};

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStock: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id, stock_quantity'),
      ]);

      const orders = (ordersRes.data ?? []) as Order[];
      const products = productsRes.data ?? [];

      const delivered = orders.filter((o) => o.status === 'delivered');
      const revenue = delivered.reduce((sum, o) => sum + Number(o.total_amount), 0);

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        confirmedOrders: orders.filter((o) => o.status === 'confirmed').length,
        deliveredOrders: delivered.length,
        totalRevenue: revenue,
        totalProducts: products.length,
        lowStock: products.filter((p) => p.stock_quantity <= 5).length,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    })();
  }, []);

  if (loading) return <CenterSpinner label="Loading dashboard..." />;

  const cards = [
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: 'text-amber-400' },
    { label: 'Pending', value: stats?.pendingOrders ?? 0, icon: Clock, color: 'text-orange-400' },
    { label: 'Confirmed', value: stats?.confirmedOrders ?? 0, icon: CheckCircle2, color: 'text-blue-400' },
    { label: 'Delivered', value: stats?.deliveredOrders ?? 0, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Revenue', value: formatPKR(stats?.totalRevenue ?? 0), icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Products', value: stats?.totalProducts ?? 0, icon: Package, color: 'text-zinc-300' },
    { label: 'Low Stock', value: stats?.lowStock ?? 0, icon: AlertTriangle, color: 'text-red-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Overview of your store</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-white/5 rounded-lg p-4 md:p-5 bg-black">
            <div className="flex items-center justify-between mb-3">
              <c.icon className={classNames('w-5 h-5', c.color)} />
            </div>
            <p className="text-xs text-zinc-500">{c.label}</p>
            <p className="text-xl md:text-2xl text-white font-medium mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="border border-white/5 rounded-lg bg-black overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-sm tracking-[0.15em] uppercase text-amber-400">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">No orders yet.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                to={`/admin/orders/${o.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{o.customer_name}</p>
                  <p className="text-xs text-zinc-500">{o.order_number} · {formatDate(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-amber-400">{formatPKR(Number(o.total_amount))}</span>
                  <span className={classNames('text-[10px] uppercase tracking-wider px-2 py-1 rounded', statusColors[o.status])}>
                    {o.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
