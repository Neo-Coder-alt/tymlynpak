import { useEffect, useState } from 'react';
import { Phone, MessageCircle, Mail, MapPin, ShoppingCart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPKR, formatDate } from '@/lib/format';
import { CenterSpinner, EmptyState } from '@/components/ui/Skeletons';

interface Customer {
  customer_name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  city: string;
  address: string;
  order_count: number;
  total_spent: number;
  last_order: string;
}

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('orders')
      .select('customer_name, phone, whatsapp, email, city, address, total_amount, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const orders = data ?? [];
        const map = new Map<string, Customer>();
        for (const o of orders as any[]) {
          const key = o.phone;
          if (!map.has(key)) {
            map.set(key, {
              customer_name: o.customer_name,
              phone: o.phone,
              whatsapp: o.whatsapp,
              email: o.email,
              city: o.city,
              address: o.address,
              order_count: 0,
              total_spent: 0,
              last_order: o.created_at,
            });
          }
          const c = map.get(key)!;
          c.order_count += 1;
          c.total_spent += Number(o.total_amount);
          if (new Date(o.created_at) > new Date(c.last_order)) c.last_order = o.created_at;
        }
        setCustomers(Array.from(map.values()).sort((a, b) => b.order_count - a.order_count));
        setLoading(false);
      });
  }, []);

  if (loading) return <CenterSpinner label="Loading customers..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-serif text-white">Customers</h1>
        <p className="text-sm text-zinc-500 mt-1">{customers.length} customers</p>
      </div>

      {customers.length === 0 ? (
        <EmptyState title="No customers yet" icon={<ShoppingCart className="w-12 h-12" />} message="Customer info appears when orders are placed." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((c) => {
            const wa = (c.whatsapp ?? c.phone).replace(/[^0-9]/g, '');
            return (
              <div key={c.phone} className="border border-white/5 rounded-lg p-5 bg-black">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white">{c.customer_name}</p>
                    <p className="text-xs text-zinc-500">{c.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-amber-400">{formatPKR(c.total_spent)}</p>
                    <p className="text-xs text-zinc-500">{c.order_count} orders</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-zinc-400">
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-zinc-600" /> {c.phone}</div>
                  {c.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-zinc-600" /> {c.email}</div>}
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-zinc-600" /> {c.address}</div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-xs text-zinc-500">Last: {formatDate(c.last_order)}</span>
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-green-400 flex items-center gap-1 hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
