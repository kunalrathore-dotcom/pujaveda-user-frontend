import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function DivineCardsSection({ cards = [] }) {
  const displayCards = cards && cards.length >= 2
    ? cards.slice(0, 2)
    : [
        {
          _id: "default-divine-1",
          title: "Mandir & Brass Puja Utensils",
          pretitle: "Sacred Altar Setup",
          description:
            "Authentic brass diyas, bell (ghanti), shankh stand, panchamrit patra and thali sets for daily morning archana.",
          imageUrl:
            "https://images.unsplash.com/photo-1609252925148-b0f1b515e111?w=800&auto=format&fit=crop&q=80",
          ctaText: "Explore Puja Utensils",
          link: "/category/puja-utensils",
        },
        {
          _id: "default-divine-2",
          title: "Finely Curated Asan & Havan Essentials",
          pretitle: "Yagna & Rituals",
          description:
            "Pure mango wood (aam ki lakdi), hawan red cheli, guggul, loban, dry coconut, and sacred kusha grass asan.",
          imageUrl:
            "https://images.unsplash.com/photo-1610450919927-52524997436f?w=800&auto=format&fit=crop&q=80",
          ctaText: "Explore Havan Samagri",
          link: "/category/puja-items",
        },
      ];

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* Centered Devotional Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#5C0F17]">
          Divine Puja Essentials
        </h2>
        <div className="flex items-center justify-center gap-2 my-3">
          <span className="h-[1px] w-12 bg-[#DA9B26]/50" />
          <span className="rotate-45 block h-1.5 w-1.5 bg-[#DA9B26]" />
          <span className="h-[1px] w-12 bg-[#DA9B26]/50" />
        </div>
        <p className="text-xs sm:text-sm text-[#2D1C13]/70">
          Handcrafted spiritual creations to establish holiness and purity in your sacred space.
        </p>
      </div>

      {/* Two Large Side-by-Side Promotional Cards (Stacked on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {displayCards.map((card) => (
          <div
            key={card._id}
            className="group relative overflow-hidden rounded-3xl border border-[#EEDBC5] bg-[#FFF8EE] shadow-md min-h-[340px] sm:min-h-[380px] flex flex-col justify-end transition hover:shadow-xl hover:border-[#DA9B26]"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={card.imageUrl}
                alt={card.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            </div>

            {/* Golden / Saffron Translucent Text Panel */}
            <div className="relative z-10 m-4 sm:m-6 rounded-2xl bg-[#5C0F17]/85 backdrop-blur-md border border-[#DA9B26]/40 p-5 sm:p-6 text-white shadow-lg transition duration-300 group-hover:bg-[#4A0D15]/95">
              {card.pretitle && (
                <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FFE082] mb-1.5">
                  <Sparkles size={12} className="text-[#DA9B26]" />
                  <span>{card.pretitle}</span>
                </div>
              )}

              <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#FFFDF9] leading-snug">
                {card.title}
              </h3>

              {card.description && (
                <p className="mt-2 text-xs sm:text-sm text-[#FFFDF9]/85 leading-relaxed line-clamp-2">
                  {card.description}
                </p>
              )}

              <div className="mt-4">
                <Link
                  to={card.link || "/category/puja-items"}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5C0F17] hover:bg-[#43080E] px-5 py-2.5 text-xs font-bold uppercase tracking-wider !text-white shadow-md transition border border-[#DA9B26]/40"
                >
                  <span className="text-white">{card.ctaText || "View More"}</span>
                  <ArrowRight size={14} className="text-white" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

