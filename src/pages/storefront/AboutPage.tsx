import { Gem, ShieldCheck, Award, Clock } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="pt-16 md:pt-20 animate-fade-in">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-amber-500/60 mb-4">Our Story</p>
          <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight">
            Crafted for Those Who <span className="gold-gradient-text">Lead</span>
          </h1>
          <div className="w-16 h-px bg-amber-500/40 mx-auto mt-6" />
          <p className="mt-8 text-zinc-300 leading-relaxed text-lg">
            TYMLYN PAK was born from a simple belief: a watch is more than a way to tell time — it's a statement of who you are. Each timepiece in our collection is selected for its craftsmanship, character, and presence.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Gem, title: 'Premium Materials', text: 'Sapphire crystal, stainless steel, and genuine leather in every piece.' },
            { icon: Award, title: 'Curated Selection', text: 'Every watch is hand-picked to meet our standards of excellence.' },
            { icon: ShieldCheck, title: 'Warranty Included', text: 'All watches come with authenticity certificates and warranty.' },
            { icon: Clock, title: 'Timeless Design', text: 'Styles that transcend trends and remain elegant for years.' },
          ].map((v) => (
            <div key={v.title} className="text-center">
              <div className="w-14 h-14 rounded-full border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                <v.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-serif text-white mb-2">{v.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-white/5">
        <h2 className="text-3xl font-serif text-white mb-4">Experience TYMLYN PAK</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">Discover the collection and find your next signature timepiece.</p>
        <a href="/collection" className="inline-block bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black text-sm tracking-[0.15em] px-8 py-4 rounded hover:shadow-lg hover:shadow-amber-500/20 transition">
          SHOP COLLECTION
        </a>
      </section>
    </div>
  );
}
