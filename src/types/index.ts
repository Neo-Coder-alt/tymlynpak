export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  sku: string | null;
  stock_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  specifications: ProductSpecification[];
  created_at: string;
  updated_at: string;
  category?: Category | null;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  total_amount: number;
  status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  review: string | null;
  approved: boolean;
  featured: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  hero_button_text: string;
  hero_button_link: string;
  banner_enabled: boolean;
  banner_title: string | null;
  banner_text: string | null;
  banner_image_url: string | null;
  whatsapp_number: string;
  instagram_url: string | null;
  facebook_url: string | null;
  contact_number: string | null;
  email: string | null;
  address: string | null;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number; // effective price (sale if set)
  image: string | null;
  quantity: number;
  stock: number;
}
