import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPKR, formatDate, classNames } from '@/lib/format';
import type { Order, OrderStatus } from '@/types';
import { CenterSpinner, EmptyState } from '@/components/ui/Skeletons';

const statusColors: Record<OrderStatus, string> = {
  pending: 'text-amber-400 bg-amber-500/10',
  confirmed: 'text-blue-400 bg-blue-500/10',
  processing: 'text-purple-400 bg-purple-500/10',
  shipped: 'text-cyan-400 bg-cyan-500/10',
  delivered: 'text-green-400 bg-green-500/10',
  cancelled: 'text-red-400 bg-red-500/10',
};

const statusFilters: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif text-white">Orders</h1>
        <p className="text-sm text-zinc-500 mt-1">{orders.length} total orders</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, order number, phone..."
            className="w-full bg-zinc-900 border border-white/10 rounded pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={classNames(
                'text-xs px-3 py-2 rounded whitespace-nowrap transition',
                statusFilter === s ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-400 border border-white/10 hover:bg-white/5'
              )}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <CenterSpinner label="Loading orders..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No orders found" icon={<ShoppingCart className="w-12 h-12" />} message="Orders will appear here when customers place them." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block border border-white/5 rounded-lg bg-black overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Order</th>
                  <th className="text-left px-4 py-3 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-amber-400">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="text-white">{o.customer_name}</p>
                      <p className="text-xs text-zinc-500">{o.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-white">{formatPKR(Number(o.total_amount))}</td>
                    <td className="px-4 py-3 text-zinc-400">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={classNames('text-[10px] uppercase tracking-wider px-2 py-1 rounded', statusColors[o.status])}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/orders/${o.id}`} className="inline-flex text-zinc-400 hover:text-amber-400">
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((o) => (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="block border border-white/5 rounded-lg p-4 bg-black">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-400 text-sm">{o.order_number}</span>
                  <span className={classNames('text-[10px] uppercase tracking-wider px-2 py-1 rounded', statusColors[o.status])}>
                    {o.status}
                  </span>
                </div>
                <p className="text-sm text-white">{o.customer_name}</p>
                <p className="text-xs text-zinc-500">{o.phone}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-amber-400">{formatPKR(Number(o.total_amount))}</span>
                  <span className="text-xs text-zinc-500">{formatDate(o.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
