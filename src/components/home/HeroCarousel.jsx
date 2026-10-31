import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

// Fallback devotional hero banners if none exist in MongoDB
const DEFAULT_HERO_BANNERS = [
  {
    _id: "default-hero-1",
    title: "Complete Durga & Navratri Puja Samagri",
    subtitle:
      "Hand-curated authentic Vedic puja kits delivered directly to your doorstep with Gangajal and sacred blessings.",
    imageUrl:
      "https://images.unsplash.com/photo-1609252925148-b0f1b515e111?w=1600&auto=format&fit=crop&q=80",
    ctaText: "ORDER PUJA KIT",
    link: "/category/puja-packages",
    badge: "Festivals Made Divine",
  },
  {
    _id: "default-hero-2",
    title: "Handcrafted Pure Brass Idols & Diyas",
    subtitle:
      "Premium artisan brass murtis of Lord Ganesha, Mahalakshmi, and akhand diyas for your home mandir.",
    imageUrl:
      "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=1600&auto=format&fit=crop&q=80",
    ctaText: "EXPLORE COLLECTION",
    link: "/category/murtis-idols",
    badge: "Vedic Craftsmanship",
  },
];

export default function HeroCarousel({ banners = [] }) {
  const activeBanners = (banners || []).filter((b) => b.active !== false);
  const displayBanners = activeBanners.length > 0 ? activeBanners : DEFAULT_HERO_BANNERS;

  const [currentIndex, setCurrentIndex] = useState(0);
  // Alternating transition direction tracking: +1 for right-to-left, -1 for left-to-right
  const [direction, setDirection] = useState(1);
  const transitionCounter = useRef(0);

  const paginate = (newDirection) => {
    transitionCounter.current += 1;
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + displayBanners.length) % displayBanners.length);
  };

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      // Alternate slide direction consecutively: +1 then -1
      const nextDir = transitionCounter.current % 2 === 0 ? 1 : -1;
      paginate(nextDir);
    }, 6000);

    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const currentBanner = displayBanners[currentIndex] || displayBanners[0];

  // Framer Motion slide variants with dynamic direction
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: "0%",
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <section className="relative overflow-hidden bg-[#FAF5ED] border-b border-[#EEDBC5]">
      {/* 1. Auspicious Seasonal Greeting Bar (Matches Reference Screenshot 1) */}
      <div className="border-b border-[#EEDBC5]/70 bg-[#FFFDF9] py-6 sm:py-8 px-4 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="font-serif italic text-sm sm:text-base text-[#5C0F17]/80">
            Festivals Made Divine, All Year Round
          </p>
          <h1 className="mt-1.5 font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#2D1C13] tracking-tight">
            Step Into a Season of{" "}
            <span className="text-[#DA9B26]">Auspicious Beginnings</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#2D1C13]/70 max-w-2xl mx-auto">
            Welcome every sacred moment with essentials that fill your home and heart with divine blessings.
          </p>
        </div>
      </div>

      {/* 2. Dynamic Hero Banner Carousel with Alternating Slide Animation */}
      <div className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#DA9B26]/40 bg-[#2D0A10] shadow-xl min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentBanner._id || currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 260, damping: 28 },
                opacity: { duration: 0.35 },
              }}
              className="absolute inset-0 flex items-center"
            >
              {/* Background Image with Rich Warm Overlay */}
              <div className="absolute inset-0">
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#2D0A10]/95 via-[#2D0A10]/80 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D0A10] via-transparent to-transparent" />
              </div>

              {/* Banner Text Content */}
              <div className="relative z-10 max-w-2xl px-6 py-10 sm:px-12 sm:py-16 lg:px-16 text-white">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#DA9B26]/20 border border-[#DA9B26]/40 px-3.5 py-1 text-xs font-bold text-[#F7DCA3] mb-4 shadow-sm">
                  <Sparkles size={13} className="text-[#DA9B26]" />
                  <span>{currentBanner.badge || "Pujaveda Sacred Collection"}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-[#FFFDF9] leading-[1.15] tracking-tight drop-shadow-sm">
                  {currentBanner.title}
                </h2>

                {currentBanner.subtitle && (
                  <p className="mt-4 text-xs sm:text-base text-[#FAF5ED]/90 max-w-lg leading-relaxed drop-shadow-xs">
                    {currentBanner.subtitle}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    to={currentBanner.link || "/category/puja-items"}
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#5C0F17] hover:bg-[#43080E] px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-black/40 transition hover:scale-105 active:scale-95 border border-[#DA9B26]/40"
                  >
                    <span className="text-white">{currentBanner.ctaText || "Explore Collection"}</span>
                    <ArrowRight size={16} className="text-white" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Previous / Next Navigation Arrows */}
          {displayBanners.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous banner"
                onClick={() => paginate(-1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#2D0A10]/70 hover:bg-[#5C0F17] text-white border border-[#DA9B26]/40 backdrop-blur-xs transition shadow-md hover:scale-110 active:scale-95"
              >
                <ChevronLeft size={22} className="text-white" />
              </button>

              <button
                type="button"
                aria-label="Next banner"
                onClick={() => paginate(1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#2D0A10]/70 hover:bg-[#5C0F17] text-white border border-[#DA9B26]/40 backdrop-blur-xs transition shadow-md hover:scale-110 active:scale-95"
              >
                <ChevronRight size={22} className="text-white" />
              </button>

              {/* Slide Dots Indicators */}
              <div className="absolute bottom-5 inset-x-0 z-20 flex items-center justify-center gap-2">
                {displayBanners.map((b, idx) => (
                  <button
                    key={b._id || idx}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    onClick={() => {
                      const dir = idx > currentIndex ? 1 : -1;
                      setDirection(dir);
                      setCurrentIndex(idx);
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-8 bg-[#DA9B26] shadow-sm shadow-[#DA9B26]"
                        : "w-2.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
