import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

// Fallback devotional banners if none configured in MongoDB
const DEFAULT_BANNERS = [
  {
    _id: "default-banner-1",
    title: "Sacred Durga & Navratri Puja Samagri",
    subtitle:
      "Complete authentic puja kits blessed with holy Gangajal, delivered directly to your doorstep across India.",
    imageUrl:
      "https://images.unsplash.com/photo-1609252925148-b0f1b515e111?w=1600&auto=format&fit=crop&q=80",
    ctaText: "Explore Festival Kits",
    link: "/category/puja-packages",
  },
  {
    _id: "default-banner-2",
    title: "Handcrafted Pure Brass Idols & Diyas",
    subtitle:
      "Premium artisan brass murtis of Lord Ganesha, Goddess Lakshmi, and sacred akhand diyas for your home mandir.",
    imageUrl:
      "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=1600&auto=format&fit=crop&q=80",
    ctaText: "View Brass Idols",
    link: "/category/murtis-idols",
  },
];

export default function PromotionalBannerCarousel({ banners = [] }) {
  const activeBanners = (banners || []).filter((b) => b.active !== false);
  const displayBanners = activeBanners.length > 0 ? activeBanners : DEFAULT_BANNERS;

  const [currentIndex, setCurrentIndex] = useState(0);
  // Alternating transition direction tracking: +1 for right-to-left, -1 for left-to-right
  const [direction, setDirection] = useState(1);
  const transitionCounter = useRef(0);

  const paginate = (newDirection) => {
    // Alternate direction if consecutive automated transitions
    transitionCounter.current += 1;
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + displayBanners.length) % displayBanners.length);
  };

  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      // Alternate slide direction consecutively as required:
      // alternate between +1 and -1 on automatic advance
      const nextDir = transitionCounter.current % 2 === 0 ? 1 : -1;
      paginate(nextDir);
    }, 6000);

    return () => clearInterval(timer);
  }, [displayBanners.length]);

  if (displayBanners.length === 0) return null;

  const banner = displayBanners[currentIndex];
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-[#EEDBC5] bg-[#3D0A10] shadow-xl min-h-[320px] sm:min-h-[400px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={banner._id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col justify-center min-h-[320px] sm:min-h-[400px] p-6 sm:p-12 lg:p-16"
          >
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#28080C] via-[#3D0A10]/90 to-transparent sm:w-3/4" />
              <div className="absolute inset-0 bg-black/25" />
            </div>

            {/* Banner Content */}
            <div className="relative z-10 max-w-xl text-white">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#DA9B26]/50 bg-[#DA9B26]/20 backdrop-blur-xs px-3 py-1 text-xs font-bold text-[#FFE082] mb-3">
                <Sparkles size={13} className="text-[#DA9B26]" />
                <span>Special Auspicious Offering</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-[#FFFDF9] tracking-tight">
                {banner.title}
              </h2>

              {banner.subtitle && (
                <p className="mt-3 text-xs sm:text-sm text-[#FFFDF9]/85 leading-relaxed line-clamp-3">
                  {banner.subtitle}
                </p>
              )}

              <div className="mt-6 flex items-center gap-4">
                <Link
                  to={banner.link || "/category/puja-items"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#DA9B26] hover:bg-[#F5A623] px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2D1C13] shadow-lg shadow-[#DA9B26]/30 transition"
                >
                  <span>{banner.ctaText || "Explore Collection"}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrows */}
        {displayBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous banner"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition"
            >
              <ChevronRight size={22} />
            </button>

            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {displayBanners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDirection(i > currentIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? "w-7 bg-[#DA9B26]" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

