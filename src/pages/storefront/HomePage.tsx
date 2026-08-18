import { Link } from 'react-router-dom';
import { ArrowRight, Quote, ShieldCheck, Truck, Gem } from 'lucide-react';
import { useProducts, useFeaturedReviews } from '@/hooks/useData';
import { useSettings } from '@/store/settings';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';

export function HomePage() {
  const { settings } = useSettings();
  const { products, loading } = useProducts({ featured: true, sort: 'featured' });
  const { reviews } = useFeaturedReviews();

  const heroImage = settings?.hero_image_url;

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroImage ? (
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-amber-400 mb-6 animate-fade-in-up">
            TYMLYN PAK
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium text-white leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {settings?.hero_title ?? 'Timeless Luxury on Your Wrist'}
          </h1>
          <p className="mt-6 text-base md:text-lg text-zinc-300 max-w-xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {settings?.hero_subtitle ?? 'Premium watches crafted for those who value elegance, precision, and presence.'}
          </p>
          <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link to={settings?.hero_button_link ?? '/collection'}>
              <Button variant="gold" size="lg" className="group">
                {settings?.hero_button_text ?? 'SHOP COLLECTION'}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-500">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-amber-500/50 to-transparent" />
        </div>
      </section>

      {/* FEATURED COLLECTION */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-amber-500/60 mb-3">Featured</p>
          <h2 className="text-3xl md:text-4xl font-serif text-white">Signature Collection</h2>
          <div className="w-16 h-px bg-amber-500/40 mx-auto mt-4" />
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/collection">
            <Button variant="outline" size="lg">
              View All Watches <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* PROMO BANNER */}
      {settings?.banner_enabled && (settings.banner_title || settings.banner_text) && (
        <section className="relative py-24 md:py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950" />
          {settings.banner_image_url && (
            <img src={settings.banner_image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <Quote className="w-8 h-8 text-amber-500/40 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">{settings.banner_title}</h2>
            <p className="text-zinc-300 text-lg leading-relaxed">{settings.banner_text}</p>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Gem, title: 'Premium Craftsmanship', text: 'Each timepiece is crafted with sapphire crystal and precision movements.' },
            { icon: ShieldCheck, title: 'Authenticity Guaranteed', text: 'Every watch comes with a certificate of authenticity and warranty.' },
            { icon: Truck, title: 'Nationwide Delivery', text: 'Free insured shipping across Pakistan. Cash on delivery available.' },
          ].map((f) => (
            <div key={f.title} className="text-center px-6">
              <f.icon className="w-8 h-8 text-amber-500/70 mx-auto mb-4" />
              <h3 className="text-lg font-serif text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-amber-500/60 mb-3">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-serif text-white">What Our Clients Say</h2>
            <div className="w-16 h-px bg-amber-500/40 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="border border-white/5 rounded-lg p-6 bg-zinc-950/50">
                <StarRating rating={r.rating} />
                <p className="mt-4 text-sm text-zinc-300 leading-relaxed italic">"{r.review}"</p>
                <p className="mt-4 text-xs tracking-wider uppercase text-amber-400">— {r.customer_name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Find Your Timepiece</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">Explore the full collection and discover the watch that defines you.</p>
        <Link to="/collection">
          <Button variant="gold" size="lg">Browse Collection</Button>
        </Link>
      </section>
    </div>
  );
}
