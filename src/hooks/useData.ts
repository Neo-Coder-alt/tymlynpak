import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, SiteSettings, Category, Review } from '@/types';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle()
      .then(({ data }) => {
        setSettings(data as SiteSettings | null);
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}

export function useProducts(filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .eq('is_available', true);

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category.slug', filters.category);
    }
    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
      );
    }
    if (filters?.sort === 'price-asc') query = query.order('price', { ascending: true });
    else if (filters?.sort === 'price-desc') query = query.order('price', { ascending: false });
    else if (filters?.sort === 'featured') query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    query.then(({ data }) => {
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    });
  }, [filters?.category, filters?.featured, filters?.search, filters?.sort]);

  return { products, loading };
}

export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { products, loading, refresh };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    supabase
      .from('products')
      .select('*, category:categories(*), product_images(*)')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data as Product | null);
        setLoading(false);
      });
  }, [slug]);

  return { product, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data as Category[] ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { categories, loading, refresh };
}

export function useProductReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('approved', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data as Review[]) ?? []);
        setLoading(false);
      });
  }, [productId]);

  return { reviews, loading };
}

export function useFeaturedReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('reviews')
      .select('*, product:products(name, slug)')
      .eq('approved', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setReviews((data as Review[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { reviews, loading };
}
